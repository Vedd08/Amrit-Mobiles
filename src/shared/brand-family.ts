// Each brand's product lines, for the brand page hero (photos: brand-family-images.ts).
//
// Only what Amrit actually stocks is listed: product types and model names
// come from the owner's price list (prisma/data/catalog.json, built from
// "Website REGULAR MOP LIST.xlsx"). If a brand sells tablets or watches that
// the stores don't carry, they are left out. Phones and foldables link to the
// shelf below; everything else is "ask the nearest store".
//
// TODO(owner): POCO and itel are on the site but not on the price list, so
// they show phones only until the owner confirms what they stock.

export type DeviceKind = "phone" | "fold" | "flip" | "tablet" | "watch" | "buds";

export type FamilyMember = {
  kind: DeviceKind;
  /** Product line as the brand writes it, e.g. "Galaxy Tab". */
  name: string;
  /** One plain line: the models in stock. */
  line: string;
};

export type BrandFamily = {
  /** Headline under the brand name. */
  tagline: string;
  members: FamilyMember[];
};

export const BRAND_FAMILIES: Record<string, BrandFamily> = {
  apple: {
    tagline: "iPhone, and everything it pairs with.",
    members: [
      { kind: "phone", name: "iPhone", line: "iPhone 17 Pro Max, 17 Pro, Air, 17, 17e, 16, 16e and 15." },
      { kind: "tablet", name: "iPad", line: "iPad 11-inch with the A16 chip, Wi-Fi." },
      { kind: "watch", name: "Apple Watch", line: "Apple Watch Series 11 and SE 3." },
      { kind: "buds", name: "AirPods", line: "AirPods 4, AirPods 4 with noise cancellation, AirPods Pro 2 and Pro 3." },
    ],
  },
  samsung: {
    tagline: "One Galaxy, every size.",
    members: [
      { kind: "phone", name: "Galaxy S, A, M and F", line: "From the Galaxy S26 Ultra to the everyday Galaxy A06." },
      { kind: "fold", name: "Galaxy Z Fold", line: "Galaxy Z Fold8 Ultra, Fold8 and Fold7." },
      { kind: "flip", name: "Galaxy Z Flip", line: "Galaxy Z Flip7 and Flip7 FE." },
      { kind: "tablet", name: "Galaxy Tab", line: "Galaxy Tab S10 Lite, Tab A11+ and Tab A11." },
      { kind: "watch", name: "Galaxy Watch", line: "Galaxy Watch9, Watch8, Watch Ultra and Watch Ultra 2." },
    ],
  },
  google: {
    tagline: "Pixel, the way Google meant Android.",
    members: [
      { kind: "phone", name: "Pixel", line: "Pixel 11 Pro XL, 11 Pro, 11, 10 and 10a." },
      { kind: "fold", name: "Pixel 11 Pro Fold", line: "Pixel's foldable, a phone that opens into a small tablet." },
    ],
  },
  xiaomi: {
    tagline: "Xiaomi and Redmi, a whole house of value.",
    members: [
      { kind: "phone", name: "Xiaomi and Redmi", line: "Xiaomi 17 Ultra, 17 and 17T, the Redmi Note 15 series, Redmi 15 and Redmi A7 Pro." },
      { kind: "tablet", name: "Xiaomi Pad and Redmi Pad", line: "Xiaomi Pad 7, Redmi Pad 2, Pad 2 Pro and Pad Pro." },
      { kind: "watch", name: "Redmi Watch", line: "Redmi Watch Move, Watch 3 Active and Watch 2 Lite." },
    ],
  },
  nothing: {
    tagline: "Nothing, designed to be seen.",
    members: [{ kind: "phone", name: "Nothing Phone", line: "Phone (4a) Pro, (4a), (4b) and (3a)." }],
  },
  motorola: {
    tagline: "Edge, Signature and moto g, close to stock Android.",
    members: [
      { kind: "phone", name: "Edge, Signature and moto g", line: "From the Signature and Edge 70 series to the moto g06." },
      { kind: "tablet", name: "moto pad", line: "Moto Pad 60 Neo, Wi-Fi and 5G." },
    ],
  },
  realme: {
    tagline: "realme, fast charging all round.",
    members: [
      { kind: "phone", name: "realme number, P and C series", line: "From the realme 16 Pro+ to the C71." },
      { kind: "tablet", name: "realme Pad", line: "realme Pad 3 5G." },
    ],
  },
  oppo: {
    tagline: "Find, Reno and everything in between.",
    members: [{ kind: "phone", name: "Find, Reno, F, A and K series", line: "From the Find X9 Ultra to the A6c." }],
  },
  vivo: {
    tagline: "X, V and Y, built around the camera.",
    members: [{ kind: "phone", name: "X, V, Y and T series", line: "From the X300 Ultra to the Y05." }],
  },
  poco: {
    tagline: "POCO, flagship speed for less.",
    members: [{ kind: "phone", name: "POCO", line: "Ask the store which POCO phones are in stock." }],
  },
  infinix: {
    tagline: "Infinix, big screens and fast charging for less.",
    members: [{ kind: "phone", name: "NOTE series", line: "Infinix NOTE 60 Pro and Note Edge." }],
  },
  tecno: {
    tagline: "TECNO, power that punches above the price.",
    members: [{ kind: "phone", name: "POVA and Spark", line: "POVA Curve 2, Spark 50 and Spark Go 3." }],
  },
  itel: {
    tagline: "itel, a good phone for every budget.",
    members: [{ kind: "phone", name: "itel", line: "Ask the store which itel phones are in stock." }],
  },
  alcatel: {
    tagline: "Alcatel V3, easy on the eyes.",
    members: [{ kind: "phone", name: "Alcatel V3", line: "Alcatel V3 Ultra, V3 Pro and V3 Classic." }],
  },
  "ai-plus": {
    tagline: "Ai+ Nova, a big battery for less.",
    members: [{ kind: "phone", name: "Nova", line: "Ai+ Nova 2 Neo 5G." }],
  },
};

export const KIND_LABEL: Record<DeviceKind, string> = {
  phone: "Phones",
  fold: "Foldable",
  flip: "Flip",
  tablet: "Tablets",
  watch: "Watches",
  buds: "Earbuds",
};

/** Kinds that are phones, so they live on the shelf below. */
export const PHONE_KINDS: DeviceKind[] = ["phone", "fold", "flip"];
