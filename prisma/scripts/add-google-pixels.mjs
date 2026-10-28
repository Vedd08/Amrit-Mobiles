// Adds Google Pixel products from the NJ price list (rows 66-89 of Sheet2)
// into the database. Content comes from the official Google Store India
// (store.google.com/in) cross-checked with GSMArena and Flipkart listings.
//
//   node prisma/scripts/add-google-pixels.mjs local   # ./dev.db
//   node prisma/scripts/add-google-pixels.mjs live    # TURSO_* from .env
//
// Safe to re-run: rows matched on slug, updated in place. Stock is kept.
//
// Sources (verified Oct 2026):
//   Pixel 10   – https://store.google.com/in/product/pixel_10_specs
//              – https://www.gsmarena.com/google_pixel_10-13423.php
//              – https://www.flipkart.com/google-pixel-10-...
//   Pixel 10a  – https://store.google.com/in/product/pixel_10a_specs
//              – https://www.gsmarena.com/google_pixel_10a-13426.php
//   Pixel 11   – https://store.google.com/in/product/pixel_11_specs
//              – https://www.gsmarena.com/google_pixel_11-13500.php
//   Pixel 11 Pro – https://store.google.com/in/product/pixel_11_pro_specs
//              – https://www.gsmarena.com/google_pixel_11_pro-13501.php
//   Pixel 11 Pro XL – https://store.google.com/in/product/pixel_11_pro_xl_specs
//              – https://www.gsmarena.com/google_pixel_11_pro_xl-13502.php
//   Pixel 11 Pro Fold – https://store.google.com/in/product/pixel_11_pro_fold_specs
//              – https://www.gsmarena.com/google_pixel_11_pro_fold-14197.php
//
// Disagreements noted:
//   - Pixel 10 Indigo: listed on Flipkart; GSMArena and Google Store list
//     Frost, Indigo, Obsidian, Lemongrass for IN — price list has Frost,
//     Indigo, Obsidian (no Lemongrass), so Lemongrass is not imported.
//   - Pixel 11 Pro XL: price list only has 256GB Canyon and Fog (2 units).
//     GSMArena shows 256GB/12GB and 512GB/16GB; only 256GB is imported.
//   - Pixel 11 Pro Fold: price list only has 512GB Olive.
//     GSMArena shows 16GB RAM; confirmed 16GB for 512GB variant.

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const now = () => new Date().toISOString().replace("Z", "+00:00");
const kebab = (s) =>
  s
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

// ---------------------------------------------------------------------------
// Model data
// ---------------------------------------------------------------------------

const MODELS = {
  "pixel-10": {
    brand: "Google",
    model: "Pixel 10",
    description:
      "The Pixel 10 is Google's everyday flagship: a 6.3-inch OLED Actua display at 120Hz, the Tensor G5 chip for on-device AI and photography, and a triple camera with a 5x telephoto zoom. It runs Android 16 with seven years of OS and security updates, and carries an IP68 rating.",
    specs: {
      Display: "6.3″ OLED Actua, 120Hz, HDR10+, 3000 nits peak",
      Processor: "Google Tensor G5 (3 nm)",
      "Rear camera": "48MP wide (OIS) + 10.8MP 5× telephoto (OIS) + 13MP ultrawide",
      "Front camera": "10.5MP",
      Battery: "4970mAh",
      Charging: "30W wired, 15W Qi2 wireless",
      "Operating system": "Android 16, 7 years of updates",
      RAM: "12GB",
      Network: "5G",
      Build: "Gorilla Glass Victus 2 front & back, aluminium frame",
      "Water resistance": "IP68",
      Thickness: "8.6mm",
      Weight: "204g",
    },
    // colour name → hex sampled from official product photos
    swatches: {
      Frost: "#E4E8EC",
      Indigo: "#3D4A8A",
      Obsidian: "#1D1D1D",
    },
  },

  "pixel-10a": {
    brand: "Google",
    model: "Pixel 10a",
    description:
      "The Pixel 10a brings Google's camera and AI smarts to a more accessible price: a 6.3-inch 120Hz OLED display, the Tensor G4 chip, a 48MP dual rear camera with OIS, and a 5100mAh battery. It ships with Android 16 and seven years of updates, with an IP68 rating and a matte plastic back.",
    specs: {
      Display: "6.3″ P-OLED, 120Hz, HDR, 3000 nits peak",
      Processor: "Google Tensor G4 (4 nm)",
      "Rear camera": "48MP wide (OIS, f/1.7) + 13MP ultrawide",
      "Front camera": "13MP",
      Battery: "5100mAh",
      Charging: "30W wired, 10W wireless",
      "Operating system": "Android 16, 7 years of updates",
      RAM: "8GB",
      Network: "5G",
      Build: "Gorilla Glass 7i front, matte aluminium frame, matte plastic back",
      "Water resistance": "IP68",
      Thickness: "9mm",
      Weight: "183g",
    },
    swatches: {
      Berry: "#6B3A5A",
      Fog: "#D8DDE0",
      Lavender: "#C0B8D8",
      Obsidian: "#1D1D1D",
    },
  },

  "pixel-11": {
    brand: "Google",
    model: "Pixel 11",
    description:
      "The Pixel 11 steps up to the Tensor G6 and a triple camera with a larger 1/1.56\" main sensor, 5x telephoto and a 13MP ultrawide. The 6.3-inch OLED runs at 120Hz and peaks at 3000 nits; 25W Qi2.2 magnetic wireless charging is new this generation. Seven years of Android updates are guaranteed.",
    specs: {
      Display: "6.3″ OLED, 120Hz, HDR10+, 3000 nits peak",
      Processor: "Google Tensor G6 (3 nm)",
      "Rear camera": "48MP wide 1/1.56\" (OIS) + 10.8MP 5× telephoto (OIS) + 13MP ultrawide",
      "Front camera": "10.5MP",
      Battery: "4985mAh",
      Charging: "30W wired, 25W Qi2.2 wireless",
      "Operating system": "Android 17, 7 years of updates",
      RAM: "12GB",
      Network: "5G",
      Build: "Gorilla Glass Victus 2 front & back, aluminium frame",
      "Water resistance": "IP68",
      Thickness: "8.6mm",
      Weight: "197g",
    },
    swatches: {
      Frost: "#E4E8EC",
      Hibiscus: "#C04060",
      Obsidian: "#1D1D1D",
      Pistachio: "#C0D4A8",
    },
  },

  "pixel-11-pro": {
    brand: "Google",
    model: "Pixel 11 Pro",
    description:
      "The Pixel 11 Pro upgrades every camera: a 50MP 1/1.3\" main sensor, a 48MP periscope 5x telephoto and a 48MP ultrawide — all with OIS. The 6.3-inch LTPO OLED reaches 3600 nits, and a 42MP front camera handles video calls and selfies. Tensor G6 and seven years of Android updates.",
    specs: {
      Display: "6.3″ LTPO OLED, 1–120Hz, HDR10+, 3600 nits peak",
      Processor: "Google Tensor G6 (3 nm)",
      "Rear camera": "50MP wide 1/1.3\" (OIS) + 48MP 5× periscope telephoto (OIS) + 48MP ultrawide",
      "Front camera": "42MP",
      Battery: "4850mAh",
      Charging: "30W wired, 25W Qi2.2 wireless",
      "Operating system": "Android 17, 7 years of updates",
      RAM: "12GB (256GB) / 16GB (512GB)",
      Network: "5G",
      Build: "Gorilla Glass Victus 2 front & frosted back, aluminium frame",
      "Water resistance": "IP68",
      Thickness: "8.4mm",
      Weight: "204g",
    },
    swatches: {
      Canyon: "#C47A50",
      Fog: "#D8DDE0",
      Obsidian: "#1D1D1D",
      Olive: "#5A6048",
    },
  },

  "pixel-11-pro-xl": {
    brand: "Google",
    model: "Pixel 11 Pro XL",
    description:
      "The Pixel 11 Pro XL pairs the Pro's triple camera system with a 6.8-inch LTPO OLED and a 5115mAh battery — 45W wired charging gets it to ~75% in 30 minutes. At 226g it's the largest standard Pixel, with the same Tensor G6, 42MP selfie camera and seven-year update commitment as its smaller sibling.",
    specs: {
      Display: "6.8″ LTPO OLED, 1–120Hz, HDR10+, 3600 nits peak",
      Processor: "Google Tensor G6 (3 nm)",
      "Rear camera": "50MP wide 1/1.3\" (OIS) + 48MP 5× periscope telephoto (OIS) + 48MP ultrawide",
      "Front camera": "42MP",
      Battery: "5115mAh",
      Charging: "45W wired, 25W Qi2.2 wireless",
      "Operating system": "Android 17, 7 years of updates",
      RAM: "12GB",
      Network: "5G",
      Build: "Gorilla Glass Victus 2 front & frosted back, aluminium frame",
      "Water resistance": "IP68",
      Thickness: "8.5mm",
      Weight: "226g",
    },
    swatches: {
      Canyon: "#C47A50",
      Fog: "#D8DDE0",
    },
  },

  "pixel-11-pro-fold": {
    brand: "Google",
    model: "Pixel 11 Pro Fold",
    description:
      "The Pixel 11 Pro Fold opens to an 8-inch LTPO OLED and folds to a 6.5-inch cover screen, both at up to 3600 nits. At 5mm thin when open it's the slimmest Pixel Fold yet, with the same triple camera as the Pro and a second front camera on the cover. Tensor G6, IP68 and 16GB of RAM.",
    specs: {
      "Inner display": "8.0″ foldable LTPO OLED, 120Hz, HDR10+, 3600 nits peak",
      "Cover display": "6.5″ OLED, 120Hz, HDR, 3600 nits peak",
      Processor: "Google Tensor G6 (3 nm)",
      "Rear camera": "48MP wide (OIS) + 10.8MP 5× telephoto (OIS) + 10.5MP ultrawide",
      "Front camera": "10MP inner + 10MP cover",
      Battery: "4806mAh",
      Charging: "30W wired, 25W Qi2.2 wireless",
      "Operating system": "Android 17, 7 years of updates",
      RAM: "16GB",
      Network: "5G",
      Build: "Gorilla Glass front, aluminium frame",
      "Water resistance": "IP68",
      Thickness: "5.0mm unfolded / 10.1mm folded",
      Weight: "239g",
    },
    swatches: {
      Olive: "#5A6048",
    },
  },
};

// ---------------------------------------------------------------------------
// Price-list rows — exactly as imported by import-nj-list.mjs (same slugs).
// Format: [modelSlug, storage, colour, price, stock]
// No RAM column: Google Pixels have fixed RAM per model (no RAM in slug).
// ---------------------------------------------------------------------------
const ROWS = [
  // Pixel 10
  ["pixel-10", "256GB", "Frost",   79999, 0],
  ["pixel-10", "256GB", "Indigo",  79999, 0],
  ["pixel-10", "256GB", "Obsidian",79999, 0],
  // Pixel 10a
  ["pixel-10a", "256GB", "Berry",    55999, 0],
  ["pixel-10a", "256GB", "Fog",      55999, 0],
  ["pixel-10a", "256GB", "Lavender", 55999, 2],
  ["pixel-10a", "256GB", "Obsidian", 55999, 4],
  // Pixel 11 — 256GB
  ["pixel-11", "256GB", "Frost",    89999, 1],
  ["pixel-11", "256GB", "Hibiscus", 89999, 2],
  ["pixel-11", "256GB", "Obsidian", 89999, 1],
  ["pixel-11", "256GB", "Pistachio",89999, 2],
  // Pixel 11 — 512GB
  ["pixel-11", "512GB", "Frost",    104999, 1],
  ["pixel-11", "512GB", "Obsidian", 104999, 1],
  ["pixel-11", "512GB", "Pistachio",104999, 0],
  // Pixel 11 Pro — 256GB
  ["pixel-11-pro", "256GB", "Canyon",  119999, 1],
  ["pixel-11-pro", "256GB", "Obsidian",119999, 1],
  ["pixel-11-pro", "256GB", "Olive",   119999, 0],
  // Pixel 11 Pro — 512GB
  ["pixel-11-pro", "512GB", "Canyon",  134999, 1],
  ["pixel-11-pro", "512GB", "Fog",     134999, 1],
  ["pixel-11-pro", "512GB", "Obsidian",134999, 1],
  ["pixel-11-pro", "512GB", "Olive",   134999, 1],
  // Pixel 11 Pro Fold — 512GB
  ["pixel-11-pro-fold", "512GB", "Olive", 186999, 2],
  // Pixel 11 Pro XL — 256GB
  ["pixel-11-pro-xl", "256GB", "Canyon", 134999, 1],
  ["pixel-11-pro-xl", "256GB", "Fog",    134999, 1],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Matches import-nj-list.mjs slug formula for Google (no RAM segment). */
function makeSlug(modelSlug, colour, storage) {
  return `${modelSlug}-${kebab(colour)}-${kebab(storage)}`;
}

function findPhotos(modelSlug, colour) {
  const dir = path.join(root, "public/images/products", modelSlug);
  if (!fs.existsSync(dir)) return [];
  const colourKebab = kebab(colour);
  const found = [];
  for (let n = 1; n <= 5; n++) {
    const rel = `/images/products/${modelSlug}/${colourKebab}-${n}.webp`;
    if (fs.existsSync(path.join(root, "public", rel))) found.push(rel);
  }
  return found;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const target = process.argv[2];
if (target !== "local" && target !== "live") {
  console.error("Usage: node prisma/scripts/add-google-pixels.mjs <local|live>");
  process.exit(1);
}

const env = readEnv();
const db =
  target === "live"
    ? createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
    : createClient({ url: `file:${path.join(root, "dev.db")}` });

const catRow = (await db.execute("SELECT id FROM Category WHERE slug = 'phones'")).rows[0];
if (!catRow) throw new Error("No 'phones' category in this database.");
const categoryId = catRow.id;

let added = 0, updated = 0, photosLinked = 0;
const tx = await db.transaction("write");
try {
  for (const [i, [modelSlug, storage, colour, price, stock]] of ROWS.entries()) {
    const m = MODELS[modelSlug];
    const slug = makeSlug(modelSlug, colour, storage);
    const name = `${m.model} (${colour}, ${storage})`;
    const at = now();

    const specs = JSON.stringify({
      Model: m.model,
      Colour: colour,
      Storage: storage,
      Offer: "Free neckband worth ₹1,699",
      ...m.specs,
    });

    const existing = (await tx.execute({
      sql: "SELECT id, stock FROM Product WHERE slug = ?",
      args: [slug],
    })).rows[0];

    let id;
    if (existing) {
      id = existing.id;
      await tx.execute({
        sql: "UPDATE Product SET name = ?, description = ?, brand = ?, price = ?, mrp = NULL, specs = ?, isActive = 1, categoryId = ?, updatedAt = ? WHERE id = ?",
        args: [name, m.description, m.brand, price, specs, categoryId, at, id],
      });
      updated++;
    } else {
      id = `c${randomUUID().replace(/-/g, "").slice(0, 24)}`;
      const created = new Date(Date.now() - (ROWS.length - i) * 1000)
        .toISOString()
        .replace("Z", "+00:00");
      await tx.execute({
        sql: "INSERT INTO Product (id, name, slug, description, brand, price, mrp, stock, specs, isActive, categoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, 1, ?, ?, ?)",
        args: [id, name, slug, m.description, m.brand, price, stock, specs, categoryId, created, at],
      });
      added++;
    }

    const photos = findPhotos(modelSlug, colour);
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

console.log(`\n${target}: ${added} added, ${updated} updated (${ROWS.length} rows).`);
if (photosLinked > 0) console.log(`Photos linked: ${photosLinked}`);
