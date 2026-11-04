// Links the photo files in public/images/products/<model>/<colour>-<n>.webp to
// the phone products they belong to. Every memory size of a colour shares its
// colour's photos.
//
//   node prisma/scripts/link-product-photos.mjs <brand|all> <local|live> [--dry]
//
// Only ProductImage rows are inserted or deleted; Product rows (prices, stock,
// visibility the owner edits in the admin) are never touched. A product that
// already has an admin upload (/uploads/… or Vercel Blob) is left alone and
// listed. Run against live only after the photo files are deployed, or the
// shop shows broken images.
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PHOTOS = path.join(root, "public", "images", "products");

// Same as import-nj-list.mjs (copied: importing that file runs its import).
const kebab = (s) =>
  s
    .replace(/\+/g, "-plus")
    .replace(/&/g, "-and-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function readEnv() {
  const env = {};
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return env;
}

const [brandArg, target, flag] = process.argv.slice(2);
if (!brandArg || !["local", "live"].includes(target)) {
  console.error("Usage: node prisma/scripts/link-product-photos.mjs <brand|all> <local|live> [--dry]");
  process.exit(1);
}
const dry = flag === "--dry";
const env = readEnv();
const db =
  target === "live"
    ? createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
    : createClient({ url: `file:${path.join(root, "dev.db")}` });

/** The colour's photo URLs, 1..n in order, as far as the files run. */
function photosFor(model, colour) {
  const dir = path.join(PHOTOS, kebab(model));
  const urls = [];
  for (let n = 1; fs.existsSync(path.join(dir, `${kebab(colour)}-${n}.webp`)); n++) {
    urls.push(`/images/products/${kebab(model)}/${kebab(colour)}-${n}.webp`);
  }
  return urls;
}

const isAdminUpload = (url) => url.startsWith("/uploads/") || url.includes("blob.vercel-storage.com");

const products = (
  await db.execute(
    "SELECT p.id, p.name, p.brand, p.specs FROM Product p JOIN Category c ON c.id = p.categoryId WHERE c.slug = 'phones'"
  )
).rows.filter((p) => brandArg === "all" || String(p.brand).toLowerCase() === brandArg.toLowerCase());

const images = new Map();
for (const row of (await db.execute("SELECT productId, url FROM ProductImage")).rows) {
  if (!images.has(row.productId)) images.set(row.productId, []);
  images.get(row.productId).push(String(row.url));
}

const plan = { linked: [], replaced: [], unchanged: [], skippedAdmin: [], noFiles: [] };
const byBrand = new Map();
for (const p of products) {
  const specs = JSON.parse(p.specs || "{}");
  if (!specs.Model || !specs.Colour) {
    plan.noFiles.push(p.name);
    continue;
  }
  const urls = photosFor(specs.Model, specs.Colour);
  const current = images.get(p.id) ?? [];
  if (!urls.length) {
    if (!current.length) plan.noFiles.push(p.name);
    continue;
  }
  if (current.some(isAdminUpload)) {
    plan.skippedAdmin.push(p.name);
    continue;
  }
  if (current.length === urls.length && current.every((u, i) => u === urls[i])) {
    plan.unchanged.push(p.name);
    continue;
  }
  (current.length ? plan.replaced : plan.linked).push(p.name);
  if (!byBrand.has(p.brand)) byBrand.set(p.brand, []);
  byBrand.get(p.brand).push({ id: p.id, urls, replace: current.length > 0 });
}

if (!dry) {
  // One write transaction per brand.
  for (const [brand, list] of byBrand) {
    const tx = await db.transaction("write");
    try {
      for (const { id, urls, replace } of list) {
        if (replace) await tx.execute({ sql: "DELETE FROM ProductImage WHERE productId = ?", args: [id] });
        for (const [position, url] of urls.entries()) {
          await tx.execute({
            sql: "INSERT INTO ProductImage (id, productId, url, position) VALUES (?, ?, ?, ?)",
            args: ["c" + randomBytes(12).toString("hex"), id, url, position],
          });
        }
      }
      await tx.commit();
      console.log(`${brand}: ${list.length} products written`);
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
}

console.log(`${dry ? "[dry run] " : ""}${target}, ${brandArg}`);
console.log(`  linked:          ${plan.linked.length}`);
console.log(`  replaced:        ${plan.replaced.length}`);
console.log(`  unchanged:       ${plan.unchanged.length}`);
console.log(`  skipped (admin): ${plan.skippedAdmin.length}${plan.skippedAdmin.length ? " — " + plan.skippedAdmin.join(", ") : ""}`);
console.log(`  no files:        ${plan.noFiles.length}`);
