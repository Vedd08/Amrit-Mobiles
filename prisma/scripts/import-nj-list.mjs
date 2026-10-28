// Imports products from the owner's NJ price list (prisma/data/nj-price-list.csv)
// into the database, brand by brand or all at once.
//
// Usage:
//   node prisma/scripts/import-nj-list.mjs <BRAND|all> local|live [--stock]
//
// Examples:
//   node prisma/scripts/import-nj-list.mjs google local
//   node prisma/scripts/import-nj-list.mjs all local --stock
//   node prisma/scripts/import-nj-list.mjs apple live
//
// Safe to re-run: rows are matched on slug and updated in place. Stock is only
// set when a product is first created, unless --stock is passed to overwrite it.

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const kebab = (s) =>
  s
    .replace(/\+/g, "-plus")
    .replace(/&/g, "-and-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const now = () => new Date().toISOString().replace("Z", "+00:00");

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

export function parseCSV(text) {
  const rows = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        row[row.length - 1] += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push("");
      } else if (c === "\r" && next === "\n") {
        rows.push(row);
        row = [""];
        i++;
      } else if (c === "\n" || c === "\r") {
        rows.push(row);
        row = [""];
      } else {
        row[row.length - 1] += c;
      }
    }
  }
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

export function cleanColour(c) {
  let res = c.trim();
  const fixes = [
    [/\bSILHOUUETTE\b/gi, "Silhouette"],
    [/\bSILHOUTTE\b/gi, "Silhouette"],
    [/\bCHAMGNE\b/gi, "Champagne"],
    [/\bAWSOME\b/gi, "Awesome"],
    [/\bVOILET\b/gi, "Violet"],
    [/\bMABILBU\b/gi, "Malibu"],
    [/\bDAIMOND\b/gi, "Diamond"],
    [/\bHARIZON\b/gi, "Horizon"],
    [/\bAQUE\b/gi, "Aqua"],
    [/\bLIGHTVIOLET\b/gi, "Light Violet"],
    [/\bJETBLACK\b/gi, "Jet Black"],
    [/\bICYBLUE\b/gi, "Icy Blue"],
    [/\bSILVERBLUE\b/gi, "Silver Blue"],
    [/\bPINKGOLD\b/gi, "Pink Gold"],
    [/\bJADEGREEN\b/gi, "Jade Green"],
    [/\bWHITESILVER\b/gi, "White Silver"],
    [/\bSILVERSHADOW\b/gi, "Silver Shadow"],
    [/\bDEEPBLUE\b/gi, "Deep Blue"],
    [/\bLIGHTGRAY\b/gi, "Light Gray"],
    [/\bGRAYGREEN\b/gi, "Gray Green"],
    [/\bLAVENDAR\b/gi, "Lavender"],
    [/\bTRANSSILVER\b/gi, "Trans Silver"],
    [/\bMIDNIGHT GREY\b/gi, "Midnight Gray"],
  ];
  for (const [pattern, replacement] of fixes) {
    res = res.replace(pattern, replacement);
  }
  // Title-case words, preserving uppercase acronyms
  return res
    .split(/\s+/)
    .map((w) => (w.length > 3 && w === w.toUpperCase() ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function cleanOffer(remark) {
  if (!remark) return null;
  const rem = remark.trim();
  if (!rem) return null;
  if (/Free Nack Band Wor[th]* 1699/i.test(rem)) {
    return "Free neckband worth ₹1,699";
  }
  if (/Neo Pack Kit/i.test(rem)) {
    return "NeoPack Kit worth ₹7,000 (₹2,500 adapter + ₹2,500 MagSafe transparent case + ₹2,000 anti-glare glass) + 1-year extended warranty worth ₹7,950 (Total benefit ₹14,950)";
  }
  return rem;
}

const SAMSUNG_MODEL_PATTERNS = [
  ["Galaxy Z Fold8 Ultra", /FOLD\s*8\s*ULTRA|F976B/i],
  ["Galaxy Z Fold8", /FOLD\s*8|F971B/i],
  ["Galaxy Z Fold7", /FOLD\s*7|F966B/i],
  ["Galaxy Z Flip7 FE", /FLIP\s*7\s*FE|F761B/i],
  ["Galaxy Z Flip7", /FLIP\s*7|F766B/i],
  ["Galaxy S26 Ultra", /S26\s*ULTRA|S948B/i],
  ["Galaxy S26+", /S26\s*PLUS|S947B/i],
  ["Galaxy S26", /S26|S942B/i],
  ["Galaxy S25 Ultra", /S25\s*ULTRA|S938B/i],
  ["Galaxy S25 FE", /S25\s*FE|S731B/i],
  ["Galaxy S25", /S25|S931B/i],
  ["Galaxy A57 5G", /A57\s*5G|A575G|A576B/i],
  ["Galaxy A56 5G", /A56\s*5G|A566E/i],
  ["Galaxy A37 5G", /A37\s*5G|A376E/i],
  ["Galaxy A36 5G", /A36\s*5G|A366E/i],
  ["Galaxy A27 5G", /A27\s*5G|A276B/i],
  ["Galaxy A17 5G", /A17\s*5G|A17|A176B/i],
  ["Galaxy A07 5G", /A07\s*5G|A076B/i],
  ["Galaxy A07", /A07|A075F/i],
  ["Galaxy A06 5G", /A06\s*5G|A066B/i],
  ["Galaxy A06", /A06|A065F/i],
  ["Galaxy F36 5G", /F36\s*5G|E366B/i],
  ["Galaxy F17 5G", /F17\s*5G|E176B/i],
  ["Galaxy M36 5G", /M36\s*5G|M366B/i],
];

export function isNonPhone(brand, name) {
  const b = brand.toUpperCase();
  const n = name.toUpperCase();
  if (b === "APPLE") {
    if (n.includes("AIRPODS")) return "AirPods (audio accessory)";
    if (n.includes("IPAD")) return "iPad (tablet)";
    if (n.includes("MACBOOK") || n.includes("MACKBOOK")) return "MacBook (laptop)";
    if (/\b(S11|S12|SE 3|WATCH)\b/.test(n)) return "Apple Watch (smartwatch)";
  }
  if (b === "MOTOROLA" && n.includes("PAD")) return "Moto Pad (tablet)";
  if (b === "REALME" && n.includes("PAD")) return "realme Pad (tablet)";
  if (b === "REDMI" && n.includes("PAD")) return "Redmi Pad (tablet)";
  if (b === "REDMI" && n.includes("WATCH")) return "Redmi Watch (smartwatch)";
  if (b === "XIAOMI" && n.includes("PAD")) return "Xiaomi Pad (tablet)";
  if (b === "SAMSUNG") {
    if (n.includes("WATCH")) return "Samsung Watch (smartwatch)";
    if (n.includes("TAB") || /\bX(135|230|236|406|946)/.test(name)) return "Samsung Tab (tablet)";
  }
  return null;
}

export function parsePhoneRow(rawBrand, rawName, price, stock, rawRemark) {
  const brand = rawBrand.trim();
  const name = rawName.trim();
  const offer = cleanOffer(rawRemark);

  let dbBrand = brand;
  if (brand === "REDMI" || brand === "XIAOMI") dbBrand = "Xiaomi";
  else if (brand === "REALME") dbBrand = "realme";
  else if (brand === "OPPO") dbBrand = "Oppo";
  else if (brand === "VIVO") dbBrand = "Vivo";
  else if (brand === "MOTOROLA") dbBrand = "Motorola";
  else if (brand === "GOOGLE") dbBrand = "Google";
  else if (brand === "NOTHING") dbBrand = "Nothing";
  else if (brand === "APPLE") dbBrand = "Apple";
  else if (brand === "SAMSUNG") dbBrand = "Samsung";

  let model = "";
  let ram = "";
  let storage = "";
  let colour = "";
  let isBundle = false;

  if (brand === "APPLE") {
    const clean = name.replace("APPLE:", "").trim();
    const m = clean.match(/^(\d+\s*(?:PRO\s*MAX|PRO)?)\s+(?:(\d+GB|\d+TB))\s*(?:([A-Z0-9\/]+)\s+)?(.+)$/i);
    if (!m) throw new Error(`Could not parse Apple row: ${name}`);
    model = "iPhone " + m[1].replace(/pro\s*max/i, "Pro Max").replace(/pro/i, "Pro");
    storage = m[2].toUpperCase();
    colour = cleanColour(m[4]);
  } else if (brand === "GOOGLE") {
    const clean = name.replace("GOOGLE:", "").trim();
    const m = clean.match(/^(PIXEL\s+[\w\s]+?)\s+(\d+GB)\s+(.+)$/i);
    if (!m) throw new Error(`Could not parse Google row: ${name}`);
    let mRaw = m[1]
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    model = mRaw
      .replace(/Pixel 10a/i, "Pixel 10a")
      .replace(/Pixel 11 Pro Xl/i, "Pixel 11 Pro XL")
      .replace(/Pixel 11 Pro Fold/i, "Pixel 11 Pro Fold");
    storage = m[2].toUpperCase();
    colour = cleanColour(m[3]);
  } else if (brand === "NOTHING") {
    const clean = name.replace("NOTHING:", "").trim();
    const m = clean.match(/^(PHONE\s+[\w\s]+?)\s+(\d+)\+(\d+GB)\s+(.+)$/i);
    if (!m) throw new Error(`Could not parse Nothing row: ${name}`);
    const mRaw = m[1].toUpperCase();
    if (mRaw.includes("3A LITE")) model = "Nothing Phone (3a) Lite";
    else if (mRaw.includes("4A PRO")) model = "Nothing Phone (4a) Pro";
    else if (mRaw.includes("4A")) model = "Nothing Phone (4a)";
    else if (mRaw.includes("4B")) model = "Nothing Phone (4b)";
    ram = m[2] + "GB";
    storage = m[3].toUpperCase();
    colour = cleanColour(m[4]);
  } else if (brand === "MOTOROLA") {
    const clean = name.replace("MOTOROLA:", "").trim();
    const m = clean.match(/^(MOTO\s+[\w\s\+]+?)\s+(\d+)\+(\d+GB)\s+(.+)$/i);
    if (!m) throw new Error(`Could not parse Motorola row: ${name}`);
    const mRaw = m[1]
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    model = mRaw.replace(/Moto Edge 70 Pro Plus/i, "Moto Edge 70 Pro+").replace(/Moto G Max/i, "Moto G Max");
    ram = m[2] + "GB";
    storage = m[3].toUpperCase();
    colour = cleanColour(m[4]);
  } else if (brand === "OPPO") {
    let clean = name.replace("OPPO:", "").trim();
    clean = clean.replace(/^A6C4G/i, "A6C 4G");
    const m = clean.match(/^([\w\s]+?)\s+(\d+)\+(\d+GB)\s+(.+)$/i);
    if (!m) throw new Error(`Could not parse OPPO row: ${name}`);
    const mRaw = m[1]
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const has5G = /5G/i.test(m[1]);
    const has4G = /4G/i.test(m[1]);
    const cleanBase = mRaw.replace(/\s*5g\b/i, "").replace(/\s*4g\b/i, "");
    model = "OPPO " + cleanBase + (has5G ? " 5G" : has4G ? " 4G" : "");
    ram = m[2] + "GB";
    storage = m[3].toUpperCase();
    colour = cleanColour(m[4]);
  } else if (brand === "REALME") {
    const clean = name.replace("REALME:", "").trim();
    const m = clean.match(/^([\w\s\+]+?)\s+(\d+)\+(\d+GB)\s+(.+)$/i);
    if (!m) throw new Error(`Could not parse realme row: ${name}`);
    const mRaw = m[1]
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const has5G = /5G/i.test(m[1]);
    const cleanBase = mRaw
      .replace(/\s*5g\b/i, "")
      .replace(/\s*4g\b/i, "")
      .replace(/Pro Plus/i, "Pro+");
    model = "realme " + cleanBase + (has5G ? " 5G" : "");
    ram = m[2] + "GB";
    storage = m[3].toUpperCase();
    colour = cleanColour(m[4]);
  } else if (brand === "REDMI" || brand === "XIAOMI") {
    const clean = name.replace("REDMI:", "").replace("XIAOMI:", "").trim();
    const m = clean.match(/^([\w\s\+]+?)\s+(\d+)\+(\d+GB)\s+(.+)$/i);
    if (!m) throw new Error(`Could not parse Redmi/Xiaomi row: ${name}`);
    const mRaw = m[1]
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const has5G = /5G/i.test(m[1]);
    const cleanBase = mRaw
      .replace(/\s*5g\b/i, "")
      .replace(/\s*4g\b/i, "")
      .replace(/Pro Plus/i, "Pro+")
      .replace(/Pro Max/i, "Pro Max");
    const prefix = brand === "REDMI" ? "Redmi " : "Xiaomi ";
    model = prefix + cleanBase + (has5G ? " 5G" : "");
    ram = m[2] + "GB";
    storage = m[3].toUpperCase();
    colour = cleanColour(m[4]);
  } else if (brand === "VIVO") {
    const clean = name.replace("VIVO:", "").trim();
    const m = clean.match(/^([\w\s]+?)\s+(\d+)\+(\d+GB)\s+(.+)$/i);
    if (!m) throw new Error(`Could not parse vivo row: ${name}`);
    const mRaw = m[1]
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const has5G = /5G/i.test(m[1]);
    const cleanBase = mRaw.replace(/\s*5g\b/i, "").replace(/\s*4g\b/i, "");
    model = "vivo " + cleanBase + (has5G ? " 5G" : "");
    ram = m[2] + "GB";
    storage = m[3].toUpperCase();
    if (/WITH PHOTOGRAPHER KIT/i.test(m[4])) {
      isBundle = true;
      colour = "With Photographer Kit";
    } else {
      colour = cleanColour(m[4]);
    }
  } else if (brand === "SAMSUNG") {
    const clean = name.replace("SAMSUNG:", "").trim();
    let matched = null;
    for (const [mname, pat] of SAMSUNG_MODEL_PATTERNS) {
      if (pat.test(clean)) {
        matched = mname;
        break;
      }
    }
    if (!matched) throw new Error(`Could not match Samsung model: ${name}`);
    model = matched;
    const memM = clean.match(/(\d+)\+(\d+GB|\d+TB)/i);
    ram = memM ? memM[1] + "GB" : "";
    storage = memM ? memM[2].toUpperCase() : "";

    let colStr = clean.replace(/\b[AEFMS]\d{3}[A-Z0-9]{4,5}\b/g, "");
    if (memM) colStr = colStr.replace(memM[0], "");
    for (const [, pat] of SAMSUNG_MODEL_PATTERNS) {
      colStr = colStr.replace(pat, "");
    }
    colStr = colStr.replace(/\b(?:56|A56)\s*5G\b/gi, "");
    colStr = colStr.replace(/\b5G\b/gi, "").trim();
    colour = cleanColour(colStr);
  }

  // Model slug for URLs and image asset directories
  const modelSlug = kebab(model);
  const memSlug = [ram ? kebab(ram) : "", kebab(storage)].filter(Boolean).join("-");
  const slug = `${modelSlug}-${kebab(colour)}-${memSlug}`;
  const memLabel = [ram, storage].filter(Boolean).join(" + ");
  const fullName = `${model} (${colour}, ${memLabel})`;

  return {
    rawBrand,
    rawName,
    dbBrand,
    model,
    modelSlug,
    ram,
    storage,
    colour,
    price,
    stock,
    offer,
    isBundle,
    slug,
    fullName,
  };
}

export function loadCatalogue() {
  const csvPath = path.join(root, "prisma/data/nj-price-list.csv");
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCSV(csvText);
  const dataRows = rows.slice(1);

  const skipped = [];
  const phones = [];

  for (let idx = 0; idx < dataRows.length; idx++) {
    const rowNum = idx + 2;
    const [rawBrand, rawName, priceStr, stockStr, rawRemark] = dataRows[idx];
    if (!rawBrand && !rawName) continue;

    const skipReason = isNonPhone(rawBrand, rawName);
    if (skipReason) {
      skipped.push({ rowNum, brand: rawBrand.trim(), name: rawName.trim(), reason: skipReason });
      continue;
    }

    const price = parseInt(String(priceStr).replace(/,/g, ""), 10);
    const stock = parseInt(String(stockStr).replace(/,/g, ""), 10) || 0;
    const parsed = parsePhoneRow(rawBrand, rawName, price, stock, rawRemark);
    phones.push({ ...parsed, rowNum });
  }

  // Merge the duplicate Moto G37 Capri Cyan rows (combine stock)
  const mergedPhones = [];
  const seenSlugs = new Map();
  for (const p of phones) {
    if (seenSlugs.has(p.slug)) {
      const existing = seenSlugs.get(p.slug);
      existing.stock += p.stock;
    } else {
      seenSlugs.set(p.slug, p);
      mergedPhones.push(p);
    }
  }

  return { phones: mergedPhones, skipped };
}

// Check for official WebP product photos if present
function findPhotos(modelSlug, colour) {
  const dir = path.join(root, "public/images/products", modelSlug);
  if (!fs.existsSync(dir)) return [];
  const colourKebab = kebab(colour);
  const found = [];
  for (let n = 1; n <= 5; n++) {
    const rel = `/images/products/${modelSlug}/${colourKebab}-${n}.webp`;
    if (fs.existsSync(path.join(root, "public", rel))) {
      found.push(rel);
    }
  }
  return found;
}

async function main() {
  const brandArg = process.argv[2]?.toLowerCase();
  const targetArg = process.argv[3]?.toLowerCase();
  const overwriteStock = process.argv.includes("--stock");

  if (!brandArg || (targetArg !== "local" && targetArg !== "live")) {
    console.error("Usage: node prisma/scripts/import-nj-list.mjs <BRAND|all> local|live [--stock]");
    console.error("Brands: google, nothing, motorola, apple, oppo, realme, redmi, xiaomi, redmi/xiaomi, vivo, samsung, all");
    process.exit(1);
  }

  const { phones, skipped } = loadCatalogue();

  // Filter phones according to brandArg
  let toImport = [];
  if (brandArg === "all") {
    toImport = phones;
  } else if (brandArg === "redmi") {
    toImport = phones.filter((p) => p.rawBrand.toLowerCase() === "redmi");
  } else if (brandArg === "xiaomi") {
    toImport = phones.filter((p) => p.rawBrand.toLowerCase() === "xiaomi");
  } else if (brandArg === "redmi/xiaomi" || brandArg === "xiaomi/redmi") {
    toImport = phones.filter((p) => p.dbBrand.toLowerCase() === "xiaomi");
  } else {
    toImport = phones.filter((p) => p.dbBrand.toLowerCase() === brandArg || p.rawBrand.toLowerCase() === brandArg);
  }

  if (toImport.length === 0) {
    console.error(`No phone rows matched brand: "${brandArg}". Available: google, nothing, motorola, apple, oppo, realme, redmi, xiaomi, vivo, samsung, all`);
    process.exit(1);
  }

  const env = readEnv();
  const db =
    targetArg === "live"
      ? createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
      : createClient({ url: `file:${path.join(root, "dev.db")}` });

  const catRow = (await db.execute("SELECT id FROM Category WHERE slug = 'phones'")).rows[0];
  if (!catRow) throw new Error("No 'phones' category found in this database.");
  const categoryId = catRow.id;

  console.log(`Starting import: ${toImport.length} products for "${brandArg}" into ${targetArg} database...`);

  let added = 0;
  let updated = 0;
  let photosLinked = 0;

  const tx = await db.transaction("write");
  try {
    for (const [i, p] of toImport.entries()) {
      const at = now();
      const existing = (await tx.execute({ sql: "SELECT id, stock FROM Product WHERE slug = ?", args: [p.slug] })).rows[0];

      const specsObj = {
        Model: p.model,
        Colour: p.colour,
        ...(p.ram ? { RAM: p.ram } : {}),
        Storage: p.storage,
        ...(p.offer ? { Offer: p.offer } : {}),
      };
      const specsJson = JSON.stringify(specsObj);

      const description = `${p.model} (${p.colour}) with ${[p.ram, p.storage].filter(Boolean).join(" and ")} storage.`;

      let id;
      if (existing) {
        id = existing.id;
        const newStock = overwriteStock ? p.stock : existing.stock;
        await tx.execute({
          sql: "UPDATE Product SET name = ?, description = ?, brand = ?, price = ?, mrp = NULL, stock = ?, specs = ?, isActive = 1, categoryId = ?, updatedAt = ? WHERE id = ?",
          args: [p.fullName, description, p.dbBrand, p.price, newStock, specsJson, categoryId, at, id],
        });
        updated++;
      } else {
        id = `c${randomUUID().replace(/-/g, "").slice(0, 24)}`;
        const created = new Date(Date.now() - (toImport.length - i) * 1000).toISOString().replace("Z", "+00:00");
        await tx.execute({
          sql: "INSERT INTO Product (id, name, slug, description, brand, price, mrp, stock, specs, isActive, categoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, 1, ?, ?, ?)",
          args: [id, p.fullName, p.slug, description, p.dbBrand, p.price, p.stock, specsJson, categoryId, created, at],
        });
        added++;
      }

      // Check for official photos in public/images/products/<modelSlug>/<colour>-<n>.webp
      const photos = findPhotos(p.modelSlug, p.colour);
      if (photos.length > 0) {
        await tx.execute({ sql: "DELETE FROM ProductImage WHERE productId = ?", args: [id] });
        for (const [position, url] of photos.entries()) {
          await tx.execute({
            sql: "INSERT INTO ProductImage (id, productId, url, position) VALUES (?, ?, ?, ?)",
            args: [`c${randomUUID().replace(/-/g, "").slice(0, 24)}`, id, url, position],
          });
        }
        photosLinked += photos.length;
      }
    }
    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }

  console.log(`\nImport complete for ${brandArg} (${targetArg}):`);
  console.log(`- Products added: ${added}`);
  console.log(`- Products updated: ${updated}`);
  console.log(`- Total processed: ${toImport.length}`);
  if (photosLinked > 0) console.log(`- Product photos linked: ${photosLinked}`);
  if (overwriteStock) console.log(`- Stock counts overwritten from price list`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
