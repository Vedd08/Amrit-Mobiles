// Adds the owner's Alcatel V3 and Ai+ Nova 2 Neo price list (17 rows, sheet
// "ALACATEL" of the MOP list, Oct 2026) to a database, one Product per
// colour + memory option, grouped on the storefront by the "Model" spec.
//
//   node prisma/scripts/add-alcatel-aiplus.mjs local   # ./dev.db
//   node prisma/scripts/add-alcatel-aiplus.mjs live    # TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from .env
//
// Safe to re-run: rows are matched on slug and updated in place (price, specs
// and photos), never duplicated. Stock is only set when a row is first added,
// so counts the staff have since entered in the admin are kept.
//
// Prices: the sheet's figure is the selling price (it's an MOP list), so mrp
// stays empty. Specs: the Flipkart listings (brand-supplied), cross-checked
// against GSMArena and Digit's launch coverage. Photos: the brands' own gallery
// images from those listings (source PIDs below), self-hosted under
// public/images/products/<model>/<colour>-<n>.webp; photo 1 is cut out onto
// transparency, 2-5 are the brand's feature slides.

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INITIAL_STOCK = 10; // placeholder until the stores count; edit in the admin

const MODELS = {
  "alcatel-v3-classic-5g": {
    brand: "Alcatel",
    model: "Alcatel V3 Classic 5G",
    description:
      "The Alcatel V3 Classic is a dependable everyday 5G phone: a 6.67-inch 120Hz NXTVISION display, MediaTek Dimensity 6300, a 50MP AI dual camera and a 5200mAh battery with an 18W charger in the box. Storage expands up to 2TB with a microSD card, and it keeps NFC, IP54 splash resistance and a 3.5mm headphone jack.",
    virtualRam: { "4GB": "+8GB", "6GB": "+10GB" },
    specs: {
      Display: "6.67″ HD+ NXTVISION, 120Hz, 570 nits",
      Processor: "MediaTek Dimensity 6300, 2.4GHz octa-core",
      "Rear camera": "50MP AI dual camera",
      "Front camera": "8MP",
      Battery: "5200mAh",
      Charging: "18W, charger in the box",
      "Operating system": "Android 15",
      "Expandable storage": "microSD, up to 2TB",
      SIM: "Dual SIM (hybrid microSD slot)",
      Network: "5G",
      "Water & dust": "IP54",
      NFC: "Yes",
      "Headphone jack": "3.5mm",
      Thickness: "8.16mm",
      Weight: "187g",
      "In the box": "Phone, 18W charger, USB-C cable, protective case, SIM tool",
    },
    // Flipkart PIDs the photos came from, per colour.
    sources: { "Cosmic Grey": "MOBHBH2GCPDCGKTQ", "Halo White": "MOBHBH2GDA2ASW8J" },
  },
  "alcatel-v3-pro-5g": {
    brand: "Alcatel",
    model: "Alcatel V3 Pro 5G",
    description:
      "The Alcatel V3 Pro puts the NXTPAPER 4-in-1 display on a 6.67-inch 120Hz screen: press the NXTPAPER key to switch from full colour to paper-like reading modes that are easy on the eyes. 8GB RAM (plus 10GB virtual), 256GB of storage expandable to 2TB, a 50MP camera with a 5MP ultra-wide, Google Gemini built in and a 5200mAh battery.",
    virtualRam: { "8GB": "+10GB" },
    specs: {
      Display: "6.67″ HD+ NXTPAPER 4-in-1, 120Hz",
      Processor: "MediaTek Dimensity 6300, 2.4GHz octa-core",
      "Rear camera": "50MP + 5MP ultra-wide",
      "Front camera": "8MP",
      Battery: "5200mAh",
      Charging: "18W, charger in the box",
      "Operating system": "Android 15, Google Gemini built in",
      "Expandable storage": "microSD, up to 2TB",
      SIM: "Dual SIM (hybrid microSD slot)",
      Network: "5G",
      "Water & dust": "IP54",
      NFC: "Yes",
      "Headphone jack": "3.5mm",
      Thickness: "8.16mm",
      Weight: "190g",
      "In the box": "Phone, 18W charger, USB-C cable, protective case, SIM tool",
    },
    sources: { "Matcha Green": "MOBHBH2GDRA6MMGK", "Metallic Grey": "MOBHBH2GGYRGKQKS" },
  },
  "alcatel-v3-ultra-5g": {
    brand: "Alcatel",
    model: "Alcatel V3 Ultra 5G",
    description:
      "The Alcatel V3 Ultra is built around its 6.78-inch Full HD+ NXTPAPER display: flip the NXTPAPER key to move between full colour, Colour Paper, Ink Paper and Max Ink modes for long, comfortable reading. A stylus comes in the box, with a 108MP triple camera, a 32MP selfie camera, eSIM support, DTS sound and a 5010mAh battery with 33W fast charging.",
    virtualRam: { "6GB": "+6GB", "8GB": "+8GB" },
    specs: {
      Display: "6.78″ FHD+ NXTPAPER 4-in-1, 120Hz, 650 nits",
      Processor: "MediaTek Dimensity 6300, 2.4GHz octa-core",
      "Rear camera": "108MP + 8MP ultra-wide + 2MP macro",
      "Front camera": "32MP",
      Battery: "5010mAh",
      Charging: "33W, charger in the box",
      "Operating system": "Android 14",
      Stylus: "Included",
      "Expandable storage": "microSD, up to 2TB",
      SIM: "Nano SIM + eSIM",
      Network: "5G",
      Audio: "DTS 3D sound, 3.5mm headphone jack",
      "Water & dust": "IP54",
      NFC: "Yes",
      Thickness: "7.99mm",
      Weight: "196g",
      "In the box": "Phone, stylus, 33W charger, USB-C cable, protective case, SIM tool",
    },
    sources: { "Champagne Gold": "MOBHBH2G2SG6PSFZ", "Hyper Blue": "MOBHBH2GBTMFGMDG", "Ocean Grey": "MOBHBH2GGCYGZ7BY" },
  },
  "ai-plus-nova-2-neo-5g": {
    brand: "Ai+",
    model: "Ai+ Nova 2 Neo 5G",
    description:
      "The Ai+ Nova 2 Neo 5G fits a 6000mAh battery into an 8.5mm body, with a 6.74-inch 120Hz display, MediaTek Dimensity 6300 and a 48MP Sony IMX582 camera. It runs NxtQuantum OS on Android 16, with a dedicated AI key, the Nxt Halo ambience light round the camera and IP65 dust and water resistance.",
    virtualRam: {},
    specs: {
      Display: "6.74″ HD+, 120Hz",
      Processor: "MediaTek Dimensity 6300, 2.4GHz octa-core",
      "Rear camera": "48MP Sony IMX582",
      "Front camera": "8MP",
      Battery: "6000mAh",
      Charging: "18W",
      "Operating system": "NxtQuantum OS, Android 16",
      "Expandable storage": "microSD, up to 2TB",
      SIM: "Dual 5G SIM",
      Network: "5G",
      "Water & dust": "IP65",
      Fingerprint: "Side-mounted",
      Thickness: "8.5mm",
      Weight: "206g",
      "In the box": "Phone, charger, USB-C cable, transparent case, screen protector, SIM tool",
    },
    sources: { Black: "MOBHZ8ZM7HKHGBZ8", Blue: "MOBHZ8ZMMVSHPYKG", Red: "MOBHZ8ZM4FTKSX2B" },
  },
};

// The owner's sheet, row for row (Sr. No. 1-17).
const ROWS = [
  ["alcatel-v3-classic-5g", "4GB", "128GB", "Cosmic Grey", 12499],
  ["alcatel-v3-classic-5g", "4GB", "128GB", "Halo White", 12499],
  ["alcatel-v3-classic-5g", "6GB", "128GB", "Halo White", 15000],
  ["alcatel-v3-classic-5g", "6GB", "128GB", "Cosmic Grey", 15000],
  ["alcatel-v3-ultra-5g", "6GB", "128GB", "Champagne Gold", 17999],
  ["alcatel-v3-pro-5g", "8GB", "256GB", "Matcha Green", 17000],
  ["alcatel-v3-pro-5g", "8GB", "256GB", "Metallic Grey", 17000],
  ["alcatel-v3-ultra-5g", "6GB", "128GB", "Hyper Blue", 17999],
  ["alcatel-v3-ultra-5g", "6GB", "128GB", "Ocean Grey", 17999],
  ["alcatel-v3-ultra-5g", "8GB", "128GB", "Champagne Gold", 19999],
  ["alcatel-v3-ultra-5g", "8GB", "128GB", "Hyper Blue", 19999],
  ["alcatel-v3-ultra-5g", "8GB", "128GB", "Ocean Grey", 19999],
  ["ai-plus-nova-2-neo-5g", "4GB", "64GB", "Black", 13999],
  ["ai-plus-nova-2-neo-5g", "4GB", "128GB", "Blue", 14599],
  ["ai-plus-nova-2-neo-5g", "4GB", "128GB", "Red", 14599],
  ["ai-plus-nova-2-neo-5g", "6GB", "128GB", "Black", 15999],
  ["ai-plus-nova-2-neo-5g", "6GB", "128GB", "Blue", 15999],
];

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// Prisma's libSQL adapter writes DateTime as ISO with an explicit offset.
const now = () => new Date().toISOString().replace("Z", "+00:00");

function readEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return env;
}

const target = process.argv[2];
if (target !== "local" && target !== "live") {
  console.error("Usage: node prisma/scripts/add-alcatel-aiplus.mjs <local|live>");
  process.exit(1);
}
const env = readEnv();
const db =
  target === "live"
    ? createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
    : createClient({ url: `file:${path.join(root, "dev.db")}` });

const category = (await db.execute("SELECT id FROM Category WHERE slug = 'phones'")).rows[0];
if (!category) throw new Error("No 'phones' category in this database.");

// Every photo must exist before any row points at it.
const photos = (dir, colour) => [1, 2, 3, 4, 5].map((n) => `/images/products/${dir}/${kebab(colour)}-${n}.webp`);
for (const [dir, , , colour] of ROWS) {
  for (const url of photos(dir, colour)) {
    if (!fs.existsSync(path.join(root, "public", url))) throw new Error(`Missing photo ${url}`);
  }
}

let added = 0;
let updated = 0;
const tx = await db.transaction("write");
try {
  for (const [i, [dir, ram, storage, colour, price]] of ROWS.entries()) {
    const m = MODELS[dir];
    const slug = `${dir}-${kebab(colour)}-${kebab(ram)}-${kebab(storage)}`;
    const name = `${m.model} (${colour}, ${ram} + ${storage})`;
    const specs = JSON.stringify({
      Model: m.model,
      Colour: colour,
      RAM: ram,
      Storage: storage,
      ...(m.virtualRam[ram] ? { "Virtual RAM": m.virtualRam[ram] } : {}),
      ...m.specs,
    });
    const at = now();
    const existing = (await tx.execute({ sql: "SELECT id FROM Product WHERE slug = ?", args: [slug] })).rows[0];
    let id;
    if (existing) {
      id = existing.id;
      await tx.execute({
        sql: "UPDATE Product SET name = ?, description = ?, brand = ?, price = ?, mrp = NULL, specs = ?, isActive = 1, categoryId = ?, updatedAt = ? WHERE id = ?",
        args: [name, m.description, m.brand, price, specs, category.id, at, id],
      });
      await tx.execute({ sql: "DELETE FROM ProductImage WHERE productId = ?", args: [id] });
      updated++;
    } else {
      id = `c${randomUUID().replace(/-/g, "").slice(0, 24)}`;
      // Staggered by row so "newest" keeps the sheet's order.
      const created = new Date(Date.now() - i * 1000).toISOString().replace("Z", "+00:00");
      await tx.execute({
        sql: "INSERT INTO Product (id, name, slug, description, brand, price, mrp, stock, specs, isActive, categoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, 1, ?, ?, ?)",
        args: [id, name, slug, m.description, m.brand, price, INITIAL_STOCK, specs, category.id, created, at],
      });
      added++;
    }
    for (const [position, url] of photos(dir, colour).entries()) {
      await tx.execute({
        sql: "INSERT INTO ProductImage (id, productId, url, position) VALUES (?, ?, ?, ?)",
        args: [`c${randomUUID().replace(/-/g, "").slice(0, 24)}`, id, url, position],
      });
    }
  }
  await tx.commit();
} catch (e) {
  await tx.rollback();
  throw e;
}
console.log(`${target}: ${added} added, ${updated} updated (${ROWS.length} rows).`);
