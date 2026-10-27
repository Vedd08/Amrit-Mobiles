// Single source of truth for the /phones section: the brand registry, the
// "shop by need" categories, and the pure helpers that slice the catalogue.
//
// The whole phone catalogue is a few dozen rows, so pages load every phone
// once (getAllPhones) and filter here in memory. That keeps brand pages off a
// per-request round-trip and sidesteps SQLite matching "realme" against
// "Realme" — brand identity lives in `dbBrand` below, not in the URL.

import type { PhoneVariant, ProductCardData } from "@/frontend/components/shop/ProductCard";

export type PhoneBrand = {
  /** URL segment: /phones/<slug> */
  slug: string;
  /** How the brand is written on screen. */
  name: string;
  /** Exact `Product.brand` value in the database. */
  dbBrand: string;
  /** One plain line under the brand-page title. */
  blurb: string;
  /** Muted hue for the brand-page title wash only — never for text. */
  accent: string;
};

// Order = how brands appear in the "Shop by brand" rail. Apple and Samsung
// lead because that is what walks in the door asking by name.
export const PHONE_BRANDS: PhoneBrand[] = [
  { slug: "apple", name: "Apple", dbBrand: "Apple", accent: "rgb(29, 29, 31)",
    blurb: "iPhone, sealed and IMEI-checked at the counter." },
  { slug: "samsung", name: "Samsung", dbBrand: "Samsung", accent: "rgb(20, 40, 160)",
    blurb: "Galaxy flagships to everyday A and M series — all Indian stock." },
  { slug: "google", name: "Google", dbBrand: "Google", accent: "rgb(26, 115, 232)",
    blurb: "Pixel — Google's cameras and seven years of updates." },
  { slug: "xiaomi", name: "Xiaomi", dbBrand: "Xiaomi", accent: "rgb(255, 105, 0)",
    blurb: "Xiaomi and Redmi — big specs at an honest price." },
  { slug: "nothing", name: "Nothing", dbBrand: "Nothing", accent: "rgb(32, 32, 32)",
    blurb: "Nothing Phone — Glyph lights and a see-through back." },
  { slug: "motorola", name: "Motorola", dbBrand: "Motorola", accent: "rgb(59, 108, 240)",
    blurb: "Edge, Signature and moto g, kept close to stock Android." },
  { slug: "realme", name: "realme", dbBrand: "realme", accent: "rgb(232, 179, 0)",
    blurb: "realme number, P and C series — fast charging, loud value." },
  { slug: "oppo", name: "Oppo", dbBrand: "Oppo", accent: "rgb(45, 125, 70)",
    blurb: "Reno and A series, designed around the portrait camera." },
  { slug: "vivo", name: "Vivo", dbBrand: "Vivo", accent: "rgb(65, 80, 230)",
    blurb: "V and X series — portrait and low-light specialists." },
  { slug: "poco", name: "POCO", dbBrand: "POCO", accent: "rgb(196, 160, 0)",
    blurb: "POCO — flagship silicon at mid-range money." },
  { slug: "infinix", name: "Infinix", dbBrand: "Infinix", accent: "rgb(0, 168, 107)",
    blurb: "The NOTE series — big screens and fast charging for less." },
  { slug: "tecno", name: "Tecno", dbBrand: "Tecno", accent: "rgb(0, 102, 204)",
    blurb: "POVA for power and Spark for every day." },
  { slug: "itel", name: "itel", dbBrand: "itel", accent: "rgb(220, 30, 40)",
    blurb: "Dependable smartphones at the friendliest prices." },
  { slug: "alcatel", name: "Alcatel", dbBrand: "Alcatel", accent: "rgb(42, 98, 196)",
    blurb: "Alcatel V3 — NXTPAPER screens that are easy on the eyes." },
  { slug: "ai-plus", name: "Ai+", dbBrand: "Ai+", accent: "rgb(120, 60, 200)",
    blurb: "Ai+ Nova — big batteries and clean Android at an easy price." },
];

/** Brands the shop doesn't sell: their products never show on the storefront. */
export const HIDDEN_BRANDS = ["OnePlus", "Oneplus", "ONEPLUS", "oneplus"];

export function getBrand(slug: string): PhoneBrand | undefined {
  return PHONE_BRANDS.find((b) => b.slug === slug.toLowerCase());
}

// ---------------------------------------------------------------------------
// Spec parsing — Product.specs is a JSON string like
// {"Model":"Alcatel V3 Ultra 5G","Colour":"Hyper Blue","RAM":"8GB","Storage":"128GB",...}
// ---------------------------------------------------------------------------

export function parseSpecs(specs: string | null | undefined): Record<string, string> {
  if (!specs) return {};
  try {
    const v = JSON.parse(specs);
    return v && typeof v === "object" ? (v as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function firstNumber(value: string | undefined): number | null {
  if (!value) return null;
  const m = value.match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

export function ramGB(p: ProductCardData): number | null {
  return firstNumber(parseSpecs(p.specs).RAM);
}

export function storageGB(p: ProductCardData): number | null {
  return firstNumber(parseSpecs(p.specs).Storage);
}

const uniqueSorted = (xs: (number | null)[]) =>
  [...new Set(xs.filter((x): x is number => x != null))].sort((a, b) => a - b);

/** Every RAM size the model comes in (one entry for a single-variant phone). */
export function ramOptions(p: ProductCardData): number[] {
  return p.variants ? uniqueSorted(p.variants.map((v) => firstNumber(v.ram))) : uniqueSorted([ramGB(p)]);
}

export function storageOptions(p: ProductCardData): number[] {
  return p.variants ? uniqueSorted(p.variants.map((v) => firstNumber(v.storage))) : uniqueSorted([storageGB(p)]);
}

// ---------------------------------------------------------------------------
// Variants — each colour + memory option is its own Product row (so the cart,
// orders and WhatsApp messages name the exact phone), tied together by the
// same "Model" spec. Listings show one card per model.
// ---------------------------------------------------------------------------

export const memoryLabel = (v: Pick<PhoneVariant, "ram" | "storage">) =>
  [v.ram, v.storage].filter(Boolean).join(" + ");

function toVariant(p: ProductCardData): PhoneVariant {
  const s = parseSpecs(p.specs);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    colour: s.Colour ?? s.Color ?? "",
    ram: s.RAM ?? "",
    storage: s.Storage ?? "",
    price: p.price,
    mrp: p.mrp,
    stock: p.stock,
    image: p.image,
  };
}

/** In stock first, then cheapest: the variant a card or a picker leads with. */
export function byLeadVariant<T extends { stock: number; price: number }>(a: T, b: T): number {
  return Number(b.stock > 0) - Number(a.stock > 0) || a.price - b.price;
}

/**
 * Collapses variant rows into one card per model, kept where the model's
 * first row was. Rows without a "Model" spec pass through unchanged.
 */
export function groupVariants(rows: ProductCardData[]): ProductCardData[] {
  const groups = new Map<string, ProductCardData[]>();
  const order: (ProductCardData | string)[] = [];
  for (const p of rows) {
    const model = parseSpecs(p.specs).Model;
    if (!model) {
      order.push(p);
      continue;
    }
    const key = `${p.brand.toLowerCase()}|${model.toLowerCase()}`;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(p);
  }
  return order.map((entry) => {
    if (typeof entry !== "string") return entry;
    const members = [...groups.get(entry)!].sort(byLeadVariant);
    const lead = members[0];
    return {
      ...lead,
      name: parseSpecs(lead.specs).Model!,
      stock: members.reduce((n, m) => n + m.stock, 0),
      variants: members.map(toVariant),
    };
  });
}

/** True when the model's options don't all cost the same: show "From". */
export function hasPriceRange(p: ProductCardData): boolean {
  return Boolean(p.variants && p.variants.some((v) => v.price !== p.price));
}

/** Distinct colours of a model, in the order the variants lead. */
export function colourOptions(p: ProductCardData): { colour: string; slug: string; image: string | null }[] {
  const seen = new Map<string, { colour: string; slug: string; image: string | null }>();
  for (const v of p.variants ?? []) {
    if (v.colour && !seen.has(v.colour)) seen.set(v.colour, { colour: v.colour, slug: v.slug, image: v.image });
  }
  return [...seen.values()];
}

export function discountPct(p: ProductCardData): number | null {
  if (!p.mrp || p.mrp <= p.price) return null;
  return Math.round(((p.mrp - p.price) / p.mrp) * 100);
}

export function savings(p: ProductCardData): number {
  return p.mrp && p.mrp > p.price ? p.mrp - p.price : 0;
}

/** Heuristic: everything on the shelf above the entry 4G Redmi is 5G. */
export function is5G(p: ProductCardData): boolean {
  return p.price >= 11000 || /\b5g\b/i.test(`${p.name} ${p.description ?? ""}`);
}

export function monthlyEmi(price: number): number {
  return Math.round(price / 12);
}

// Ratings aren't in the catalogue yet. These are derived from the slug so a
// phone always shows the same number — a placeholder for a real reviews feed,
// not a live figure. Kept deliberately quiet in the UI.
export function phoneRating(slug: string): { rating: number; count: number } {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  h = Math.abs(h);
  return {
    rating: Math.round((4.1 + (h % 9) / 10) * 10) / 10, // 4.1 – 4.9
    count: 24 + ((h >> 4) % 317), // 24 – 340
  };
}

// ---------------------------------------------------------------------------
// "Shop by need" categories
// ---------------------------------------------------------------------------

export type PhoneCategory = {
  slug: string;
  /** Short label on the category card. */
  name: string;
  /** Sub-label on the category card. */
  tagline: string;
  /** Heading on /phones/category/<slug>. */
  pageTitle: string;
  /** One line under that heading. */
  intro: string;
  match: (p: ProductCardData) => boolean;
};

const text = (p: ProductCardData) => `${p.name} ${p.description ?? ""}`.toLowerCase();

export const PHONE_CATEGORIES: PhoneCategory[] = [
  {
    slug: "flagship",
    name: "Flagship",
    tagline: "Top-tier chips, best cameras",
    pageTitle: "Flagship phones",
    intro: "The best silicon and cameras each brand makes, all sealed Indian stock.",
    match: (p) => p.price >= 55000,
  },
  {
    slug: "camera",
    name: "Camera phones",
    tagline: "Leica, Zeiss and Hasselblad tuning",
    pageTitle: "Camera phones",
    intro: "Phones built around the shot — co-engineered optics and big sensors.",
    match: (p) =>
      /leica|zeiss|hasselblad|periscope|telephoto|portrait|aura light|\d{2,3}mp|cinematic|optics|camera/.test(
        text(p),
      ),
  },
  {
    slug: "gaming",
    name: "Gaming",
    tagline: "High refresh, sustained performance",
    pageTitle: "Gaming phones",
    intro: "High refresh screens and chips that hold their frame rate under load.",
    match: (p) =>
      /dimensity (8300|9300)|snapdragon 8|8s gen|8\+ gen|120w|hypercharge|144hz|gaming/.test(text(p)) ||
      (ramGB(p) ?? 0) >= 12,
  },
  {
    slug: "budget",
    name: "Budget",
    tagline: "Under ₹18,000, still dependable",
    pageTitle: "Budget phones",
    intro: "Under ₹18,000 and still worth carrying for a couple of years.",
    match: (p) => p.price < 18000,
  },
  {
    slug: "battery",
    name: "Best battery",
    tagline: "Big cells that last the day out",
    pageTitle: "Long-battery phones",
    intro: "5,000 mAh and up — the phones that make it to bedtime without a top-up.",
    match: (p) => /\b[5-9],?\d{3}\s?mah|massive battery|all-day battery/.test(text(p)),
  },
  {
    slug: "compact",
    name: "Compact",
    tagline: "Comfortable one-handed screens",
    pageTitle: "Compact phones",
    intro: "Screens you can actually reach across with one thumb.",
    match: (p) => /6\.[0-2]"|compact|\bmini\b/.test(text(p)),
  },
  {
    slug: "5g",
    name: "5G phones",
    tagline: "Ready for every Indian 5G band",
    pageTitle: "5G phones",
    intro: "Ready for every 5G band the Indian networks are rolling out.",
    match: is5G,
  },
  {
    slug: "foldable",
    name: "Foldables",
    tagline: "Fold and flip form factors",
    pageTitle: "Foldable phones",
    intro: "Fold and flip form factors. Ask us on WhatsApp for current stock.",
    match: (p) => /\bfold\b|\bflip\b/.test(text(p)),
  },
];

export function getCategory(slug: string): PhoneCategory | undefined {
  return PHONE_CATEGORIES.find((c) => c.slug === slug.toLowerCase());
}

// ---------------------------------------------------------------------------
// Filtering, sorting, search
// ---------------------------------------------------------------------------

export function phonesForBrand(all: ProductCardData[], brand: PhoneBrand): ProductCardData[] {
  return all.filter((p) => p.brand.toLowerCase() === brand.dbBrand.toLowerCase());
}

export function phonesForCategory(all: ProductCardData[], category: PhoneCategory): ProductCardData[] {
  return all.filter(category.match);
}

export type PhoneSort = "featured" | "price-asc" | "price-desc" | "newest";

export type PhoneFilter = {
  maxPrice?: number;
  ram?: number[];
  storage?: number[];
  brands?: string[]; // brand slugs
  fiveGOnly?: boolean;
};

export function filterPhones(list: ProductCardData[], f: PhoneFilter): ProductCardData[] {
  return list.filter((p) => {
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    // A model matches when any of its variants does.
    if (f.ram && f.ram.length) {
      const rams = ramOptions(p);
      if (!rams.some((r) => f.ram!.some((min) => r >= min && r < min + 2))) return false;
    }
    if (f.storage && f.storage.length) {
      if (!storageOptions(p).some((s) => f.storage!.includes(s))) return false;
    }
    if (f.brands && f.brands.length) {
      const slug = PHONE_BRANDS.find((b) => b.dbBrand.toLowerCase() === p.brand.toLowerCase())?.slug;
      if (!slug || !f.brands.includes(slug)) return false;
    }
    if (f.fiveGOnly && !is5G(p)) return false;
    return true;
  });
}

export function sortPhones(list: ProductCardData[], sort: PhoneSort): ProductCardData[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "newest":
      return copy; // getAllPhones already returns newest-first
    case "featured":
    default:
      // In stock first, then by price so the shelf leads with its best.
      return copy.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || b.price - a.price);
  }
}

export function searchPhones(all: ProductCardData[], query: string): ProductCardData[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return all
    .map((p) => {
      const haystack = [
        p.name,
        p.brand,
        p.description ?? "",
        Object.values(parseSpecs(p.specs)).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const score = tokens.reduce((s, t) => {
        if (!haystack.includes(t)) return s - 100;
        return s + (p.name.toLowerCase().includes(t) ? 3 : 1) + (p.brand.toLowerCase() === t ? 2 : 0);
      }, 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

/** Brand rail data: every brand that actually has phones in stock, with count. */
/**
 * Phones for the /phones hero showcase: the top in-stock model of each brand,
 * most premium first, so the fan reads as "every major brand's best".
 */
export function pickShowcase(all: ProductCardData[], take = 6): ProductCardData[] {
  const bestByBrand = new Map<string, ProductCardData>();
  for (const p of all) {
    if (p.stock <= 0) continue;
    const key = p.brand.toLowerCase();
    const current = bestByBrand.get(key);
    if (!current || p.price > current.price) bestByBrand.set(key, p);
  }
  return [...bestByBrand.values()].sort((a, b) => b.price - a.price).slice(0, take);
}

export function brandsWithCounts(all: ProductCardData[]): Array<PhoneBrand & { count: number; from: number }> {
  return PHONE_BRANDS.map((b) => {
    const items = phonesForBrand(all, b);
    return {
      ...b,
      count: items.length,
      from: items.reduce((min, p) => Math.min(min, p.price), Infinity),
    };
  }).filter((b) => b.count > 0);
}
