// Each brand's device family, for the brand page's display-riser hero.
//
// Only product lines the brand actually sells in India are listed, by series
// name (not model numbers, which go stale every year). Phones and foldables
// link to the shelf below; everything else is "ask the nearest store",
// because the shop's own stock is phones.

export type DeviceKind = "phone" | "fold" | "flip" | "tablet" | "watch" | "buds";

export type FamilyMember = {
  kind: DeviceKind;
  /** Series name as the brand writes it, e.g. "Galaxy Tab". */
  name: string;
  /** One plain line: what it is. */
  line: string;
};

export type BrandFamily = {
  /** Headline under the brand name. */
  tagline: string;
  members: FamilyMember[];
  /** Watch case shape. */
  watch?: "round" | "square";
  /** Earbud style: with a stem, or a rounded bean. */
  buds?: "stem" | "bean";
  /** Front camera on the phone's screen. */
  camera: "island" | "punch";
};

export const BRAND_FAMILIES: Record<string, BrandFamily> = {
  apple: {
    tagline: "iPhone, and everything it pairs with.",
    camera: "island",
    watch: "square",
    buds: "stem",
    members: [
      { kind: "phone", name: "iPhone", line: "From the everyday iPhone to the Pro Max." },
      { kind: "fold", name: "iPhone Duo", line: "Apple's first foldable, a phone that opens into a small tablet." },
      { kind: "tablet", name: "iPad", line: "iPad, iPad Air and iPad Pro." },
      { kind: "watch", name: "Apple Watch", line: "Series, SE and Ultra." },
      { kind: "buds", name: "AirPods", line: "AirPods, AirPods Pro and AirPods Max." },
    ],
  },
  samsung: {
    tagline: "One Galaxy, every size.",
    camera: "punch",
    watch: "round",
    buds: "stem",
    members: [
      { kind: "phone", name: "Galaxy S, A and M", line: "Flagship S, mid-range A and long-battery M series." },
      { kind: "fold", name: "Galaxy Z Fold", line: "A phone that opens into a tablet." },
      { kind: "flip", name: "Galaxy Z Flip", line: "A full phone that folds in half to fit a pocket." },
      { kind: "tablet", name: "Galaxy Tab", line: "Tab S and Tab A tablets." },
      { kind: "watch", name: "Galaxy Watch", line: "Wear OS watches with health tracking." },
      { kind: "buds", name: "Galaxy Buds", line: "Buds, Buds Pro and Buds FE." },
    ],
  },
  google: {
    tagline: "Pixel, the way Google meant Android.",
    camera: "punch",
    watch: "round",
    buds: "bean",
    members: [
      { kind: "phone", name: "Pixel", line: "Pixel, Pixel Pro and the a-series." },
      { kind: "fold", name: "Pixel Pro Fold", line: "Pixel's foldable, a phone that opens wide." },
      { kind: "tablet", name: "Pixel Tablet", line: "A tablet that docks as a home speaker." },
      { kind: "watch", name: "Pixel Watch", line: "Round Wear OS watch with Fitbit health." },
      { kind: "buds", name: "Pixel Buds", line: "Pixel Buds and Pixel Buds Pro." },
    ],
  },
  xiaomi: {
    tagline: "Xiaomi and Redmi, a whole house of value.",
    camera: "punch",
    watch: "square",
    buds: "stem",
    members: [
      { kind: "phone", name: "Xiaomi and Redmi", line: "Xiaomi flagships and Redmi Note value phones." },
      { kind: "tablet", name: "Xiaomi Pad and Redmi Pad", line: "Tablets for study, shows and work." },
      { kind: "watch", name: "Redmi Watch and Smart Band", line: "Fitness watches and bands with long battery." },
      { kind: "buds", name: "Redmi Buds", line: "Wireless earbuds with noise cancelling." },
    ],
  },
  nothing: {
    tagline: "Nothing and CMF, designed to be seen.",
    camera: "punch",
    watch: "square",
    buds: "stem",
    members: [
      { kind: "phone", name: "Nothing Phone and CMF Phone", line: "Glyph lights, a see-through back and clean software." },
      { kind: "watch", name: "CMF Watch", line: "Watches with swappable bezels." },
      { kind: "buds", name: "Nothing Ear", line: "See-through earbuds and CMF Buds." },
    ],
  },
  motorola: {
    tagline: "Edge, razr and moto g, close to stock Android.",
    camera: "punch",
    watch: "round",
    buds: "bean",
    members: [
      { kind: "phone", name: "Edge and moto g", line: "Curved Edge flagships and the moto g everyday line." },
      { kind: "flip", name: "razr", line: "The flip phone, reborn with a big cover screen." },
      { kind: "tablet", name: "moto tab", line: "Family tablets for streaming and school." },
      { kind: "watch", name: "moto watch", line: "Round smartwatches with long battery." },
      { kind: "buds", name: "moto buds", line: "Earbuds tuned by Bose." },
    ],
  },
  realme: {
    tagline: "realme and Narzo, fast charging all round.",
    camera: "punch",
    watch: "square",
    buds: "stem",
    members: [
      { kind: "phone", name: "realme and Narzo", line: "Number series, P series and online-first Narzo." },
      { kind: "tablet", name: "realme Pad", line: "Budget tablets with big batteries." },
      { kind: "watch", name: "realme Watch", line: "Fitness watches with bright displays." },
      { kind: "buds", name: "realme Buds", line: "Buds Air, Buds T and neckbands." },
    ],
  },
  oppo: {
    tagline: "Reno, Find and everything in between.",
    camera: "punch",
    watch: "square",
    buds: "stem",
    members: [
      { kind: "phone", name: "Reno, F and A series", line: "Portrait-camera Reno and dependable A series." },
      { kind: "fold", name: "Find N", line: "OPPO's slim foldable." },
      { kind: "tablet", name: "OPPO Pad", line: "Tablets for work and streaming." },
      { kind: "watch", name: "OPPO Watch", line: "Wear OS and fitness watches." },
      { kind: "buds", name: "OPPO Enco", line: "Enco Air and Enco Buds earbuds." },
    ],
  },
  vivo: {
    tagline: "X, V and Y, built around the camera.",
    camera: "punch",
    watch: "round",
    buds: "stem",
    members: [
      { kind: "phone", name: "X, V, T and Y series", line: "ZEISS-camera X flagships to everyday Y series." },
      { kind: "fold", name: "X Fold", line: "vivo's foldable with ZEISS cameras." },
      { kind: "tablet", name: "vivo Pad", line: "Large-screen tablets." },
      { kind: "watch", name: "vivo Watch", line: "Round smartwatches with long battery." },
      { kind: "buds", name: "vivo TWS", line: "Wireless earbuds." },
    ],
  },
  poco: {
    tagline: "POCO, flagship speed for less.",
    camera: "punch",
    watch: "square",
    buds: "stem",
    members: [
      { kind: "phone", name: "POCO F, X, M and C", line: "Performance F and X series, budget M and C." },
      { kind: "tablet", name: "POCO Pad", line: "A big 12-inch tablet at a small price." },
      { kind: "watch", name: "POCO Watch", line: "Fitness watch with a bright AMOLED screen." },
      { kind: "buds", name: "POCO Buds", line: "Wireless earbuds." },
    ],
  },
  infinix: {
    tagline: "Infinix, big screens and fast charging for less.",
    camera: "punch",
    watch: "square",
    buds: "stem",
    members: [
      { kind: "phone", name: "NOTE, HOT, ZERO and GT", line: "From the everyday HOT series to the ZERO and GT flagships." },
      { kind: "tablet", name: "XPAD", line: "Big-screen Infinix tablets." },
      { kind: "watch", name: "XWATCH", line: "Infinix smartwatches." },
      { kind: "buds", name: "XBUDS", line: "Infinix wireless earbuds." },
    ],
  },
  tecno: {
    tagline: "Tecno, cameras and power that punch above the price.",
    camera: "punch",
    watch: "round",
    buds: "stem",
    members: [
      { kind: "phone", name: "CAMON, POVA and SPARK", line: "CAMON for cameras, POVA for battery and gaming, SPARK for every day." },
      { kind: "fold", name: "PHANTOM V Fold", line: "Tecno's foldable that opens into a tablet." },
      { kind: "flip", name: "PHANTOM V Flip", line: "A flip phone with a round cover screen." },
      { kind: "tablet", name: "MEGAPAD", line: "Large-screen Tecno tablets." },
      { kind: "watch", name: "Tecno Watch", line: "Tecno smartwatches." },
      { kind: "buds", name: "Tecno Buds", line: "Tecno wireless earbuds." },
    ],
  },
  itel: {
    tagline: "itel, a good phone for every budget.",
    camera: "punch",
    watch: "square",
    buds: "stem",
    members: [
      { kind: "phone", name: "itel A, P and S series", line: "Simple, dependable smartphones with big batteries." },
      { kind: "tablet", name: "itel Pad", line: "Affordable tablets for study and video." },
      { kind: "watch", name: "itel Smartwatch", line: "Everyday smartwatches." },
      { kind: "buds", name: "itel Earbuds", line: "Wireless earbuds." },
    ],
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
