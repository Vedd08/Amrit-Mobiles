// Copies the local SQLite database (dev.db) into the hosted Turso database
// used in production. Run once after creating the Turso DB:
//
//   node scripts/push-to-turso.mjs          # refuses if Turso already has data
//   node scripts/push-to-turso.mjs --reset  # drops Turso's tables first
//
// Reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env. Test orders are
// not copied: production starts with an empty order book.
import "dotenv/config";
import { createClient } from "@libsql/client";

const SKIP_DATA = new Set(["Order", "OrderItem"]);
const reset = process.argv.includes("--reset");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env first.");
  process.exit(1);
}

const local = createClient({ url: "file:./dev.db" });
const remote = createClient({ url, authToken });

const schema = (
  await local.execute(
    "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name"
  )
).rows;
const tables = schema.filter((r) => r.type === "table").map((r) => r.name);

const existing = (
  await remote.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
).rows.map((r) => r.name);

if (existing.length && !reset) {
  console.error(`Turso already has tables (${existing.join(", ")}). Re-run with --reset to replace them.`);
  process.exit(1);
}

await remote.execute("PRAGMA foreign_keys = OFF");
for (const name of existing) await remote.execute(`DROP TABLE IF EXISTS "${name}"`);

// Tables first, then indexes.
await remote.batch(schema.map((r) => r.sql), "write");
console.log(`Created ${tables.length} tables and ${schema.length - tables.length} indexes.`);

for (const table of tables) {
  if (SKIP_DATA.has(table)) {
    console.log(`  ${table}: skipped (test data)`);
    continue;
  }
  const { rows, columns } = await local.execute(`SELECT * FROM "${table}"`);
  if (!rows.length) {
    console.log(`  ${table}: 0 rows`);
    continue;
  }
  const cols = columns.map((c) => `"${c}"`).join(", ");
  const marks = columns.map(() => "?").join(", ");
  const stmts = rows.map((row) => ({
    sql: `INSERT INTO "${table}" (${cols}) VALUES (${marks})`,
    args: columns.map((c) => row[c]),
  }));
  for (let i = 0; i < stmts.length; i += 200) {
    await remote.batch(stmts.slice(i, i + 200), "write");
  }
  console.log(`  ${table}: ${rows.length} rows`);
}

// Verify.
for (const table of tables) {
  const local_n = SKIP_DATA.has(table) ? 0 : (await local.execute(`SELECT COUNT(*) AS n FROM "${table}"`)).rows[0].n;
  const remote_n = (await remote.execute(`SELECT COUNT(*) AS n FROM "${table}"`)).rows[0].n;
  if (Number(local_n) !== Number(remote_n)) {
    console.error(`MISMATCH ${table}: local ${local_n}, Turso ${remote_n}`);
    process.exitCode = 1;
  }
}
console.log(process.exitCode ? "Finished with mismatches." : "Done: Turso matches dev.db.");
