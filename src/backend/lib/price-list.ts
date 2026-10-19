import "server-only";
import type { Rows } from "./spreadsheet";

// The admin "price list" round-trip: download every product as a spreadsheet,
// change prices / stock / visibility in Excel, upload it back. Only those four
// columns are read on the way back in; products are matched by Product ID.

export const PRICE_LIST_HEADER = ["Product ID", "Name", "Brand", "Category", "Price (₹)", "MRP (₹)", "Stock", "Visible"];

export type PriceListProduct = {
  slug: string;
  name: string;
  brand: string;
  category: { name: string };
  price: number;
  mrp: number | null;
  stock: number;
  isActive: boolean;
};

export function priceListRows(products: PriceListProduct[]) {
  return [
    PRICE_LIST_HEADER,
    ...products.map((p) => [p.slug, p.name, p.brand, p.category.name, p.price, p.mrp, p.stock, p.isActive ? "Yes" : "No"]),
  ];
}

export type PriceListLine = {
  /** Spreadsheet row number, as Excel shows it. */
  line: number;
  id?: string;
  name?: string;
  price?: number;
  /** null = clear the MRP. */
  mrp?: number | null;
  stock?: number;
  visible?: boolean;
  errors: string[];
};

type Col = "id" | "name" | "price" | "mrp" | "stock" | "visible";

// Order matters: "Product ID" must be read as the id, not the name; "MRP" before "price".
const HEADER_MATCHERS: [Col, RegExp][] = [
  ["id", /\b(product\s*id|id|slug|sku)\b/i],
  ["mrp", /\bmrp\b/i],
  ["price", /\b(price|mop|selling|rate)\b/i],
  ["stock", /\b(stock|qty|quantity)\b/i],
  ["visible", /\b(visible|active|show|live)\b/i],
  ["name", /\b(name|product|model)\b/i],
];

export function parsePriceList(rows: Rows): { lines: PriceListLine[]; columns: Col[] } {
  // The header is the first row that names an id or name column and a price/stock column.
  let headerIndex = -1;
  let map = new Map<Col, number>();
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const m = new Map<Col, number>();
    rows[r].forEach((cell, c) => {
      const match = HEADER_MATCHERS.find(([col, re]) => !m.has(col) && re.test(cell.trim()));
      if (match) m.set(match[0], c);
    });
    if ((m.has("id") || m.has("name")) && (m.has("price") || m.has("stock") || m.has("mrp") || m.has("visible"))) {
      headerIndex = r;
      map = m;
      break;
    }
  }
  if (headerIndex === -1) {
    throw new Error(
      "Couldn't find the column headings. Keep the first row of the downloaded price list (Product ID, Name, Price, Stock…).",
    );
  }

  const lines: PriceListLine[] = [];
  for (let r = headerIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (col: Col) => (map.has(col) ? (row[map.get(col)!] ?? "").trim() : undefined);
    const line: PriceListLine = { line: r + 1, errors: [] };

    const id = get("id");
    const name = get("name");
    if (id) line.id = id;
    if (name) line.name = name;
    if (!id && !name) continue;

    const price = get("price");
    if (price !== undefined && price !== "") {
      const n = rupees(price);
      if (n === null || n < 1) line.errors.push(`Price "${price}" isn't a valid amount`);
      else line.price = n;
    }
    const mrp = get("mrp");
    if (mrp !== undefined) {
      if (mrp === "" || mrp === "-") line.mrp = null;
      else {
        const n = rupees(mrp);
        if (n === null || n < 1) line.errors.push(`MRP "${mrp}" isn't a valid amount`);
        else line.mrp = n;
      }
    }
    const stock = get("stock");
    if (stock !== undefined && stock !== "") {
      const n = Number(stock.replace(/[,\s]/g, ""));
      if (!Number.isInteger(n) || n < 0) line.errors.push(`Stock "${stock}" should be a whole number, 0 or more`);
      else line.stock = n;
    }
    const visible = get("visible");
    if (visible !== undefined && visible !== "") {
      const v = visible.toLowerCase();
      if (["yes", "y", "true", "1", "visible", "active"].includes(v)) line.visible = true;
      else if (["no", "n", "false", "0", "hidden", "hide"].includes(v)) line.visible = false;
      else line.errors.push(`Visible "${visible}" should be Yes or No`);
    }
    lines.push(line);
  }
  return { lines, columns: [...map.keys()] };
}

/** "₹1,59,900", "159900", "1.599E5" -> 159900. Rupees only; paise are rounded. */
function rupees(raw: string) {
  const cleaned = raw.replace(/[₹,\s]|rs\.?|inr/gi, "");
  if (!/^\d+(\.\d+)?(e\d+)?$/i.test(cleaned)) return null;
  return Math.round(Number(cleaned));
}
