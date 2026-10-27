// Real product photos for the brand page hero (public/images/brand-family).
//
// Brand-supplied product images from the brands' Amazon.in listings (white
// background keyed out to transparency, trimmed, WebP), one per product type
// the store stocks, each of a model on the store's price list where possible.
// `source` is the original image, so any photo can be traced or swapped for
// the brand's own press kit. Regenerate rather than hand-edit.

export type FamilyImage = { src: string; width: number; height: number; model: string; source: string };

export const FAMILY_IMAGES: Record<string, FamilyImage> = {
  "apple-phone": { src: "/images/brand-family/apple-phone.webp", width: 728, height: 900, model: "iPhone 17 Pro", source: "https://m.media-amazon.com/images/I/71JGCn1z1TL._SL1500_.jpg" },
  "apple-tablet": { src: "/images/brand-family/apple-tablet.webp", width: 796, height: 900, model: "iPad (A16)", source: "https://m.media-amazon.com/images/I/61wnAlrAr0L._SL1500_.jpg" },
  "apple-watch": { src: "/images/brand-family/apple-watch.webp", width: 767, height: 900, model: "Apple Watch SE 3", source: "https://m.media-amazon.com/images/I/61axvwMQ+fL._SL1500_.jpg" },
  "apple-buds": { src: "/images/brand-family/apple-buds.webp", width: 672, height: 900, model: "AirPods 4", source: "https://m.media-amazon.com/images/I/61B+Ut64ewL._SL1500_.jpg" },
  "samsung-phone": { src: "/images/brand-family/samsung-phone.webp", width: 505, height: 900, model: "Galaxy S25 Ultra", source: "https://m.media-amazon.com/images/I/718VleLHZQL._SL1500_.jpg" },
  "samsung-fold": { src: "/images/brand-family/samsung-fold.webp", width: 666, height: 900, model: "Galaxy Z Fold7", source: "https://m.media-amazon.com/images/I/61x2YvxqdGL._SL1500_.jpg" },
  "samsung-flip": { src: "/images/brand-family/samsung-flip.webp", width: 717, height: 900, model: "Galaxy Z Flip7", source: "https://m.media-amazon.com/images/I/61oyPyC4bHL._SL1500_.jpg" },
  "samsung-tablet": { src: "/images/brand-family/samsung-tablet.webp", width: 900, height: 600, model: "Galaxy Tab S10 Lite", source: "https://m.media-amazon.com/images/I/51DUceRHMxL._SL1500_.jpg" },
  "samsung-watch": { src: "/images/brand-family/samsung-watch.webp", width: 779, height: 900, model: "Galaxy Watch8", source: "https://m.media-amazon.com/images/I/619tP9hJ1sL._SL1500_.jpg" },
  "google-phone": { src: "/images/brand-family/google-phone.webp", width: 704, height: 856, model: "Pixel 10", source: "https://m.media-amazon.com/images/I/516HIUddM3L._SL1500_.jpg" },
  "xiaomi-phone": { src: "/images/brand-family/xiaomi-phone.webp", width: 344, height: 900, model: "Xiaomi 17 Ultra", source: "https://m.media-amazon.com/images/I/610MzDU2CtL._SL1500_.jpg" },
  "xiaomi-tablet": { src: "/images/brand-family/xiaomi-tablet.webp", width: 585, height: 900, model: "Redmi Pad 2 Pro", source: "https://m.media-amazon.com/images/I/61PkJo0s0hL._SL1500_.jpg" },
  "xiaomi-watch": { src: "/images/brand-family/xiaomi-watch.webp", width: 871, height: 900, model: "Redmi Watch Move", source: "https://m.media-amazon.com/images/I/61IUlwTRsLL._SL1500_.jpg" },
  "nothing-phone": { src: "/images/brand-family/nothing-phone.webp", width: 765, height: 900, model: "Nothing Phone (3a)", source: "https://m.media-amazon.com/images/I/71k2mnrt8dL._SL1500_.jpg" },
  "motorola-phone": { src: "/images/brand-family/motorola-phone.webp", width: 498, height: 900, model: "motorola edge 70 pro", source: "https://m.media-amazon.com/images/I/61aH5b0qmRL._SL1500_.jpg" },
  "motorola-tablet": { src: "/images/brand-family/motorola-tablet.webp", width: 900, height: 572, model: "moto pad 60 neo", source: "https://m.media-amazon.com/images/I/51j1KB-wIyL._SL1500_.jpg" },
  "realme-phone": { src: "/images/brand-family/realme-phone.webp", width: 794, height: 900, model: "realme 16 Pro+", source: "https://m.media-amazon.com/images/I/71o1pzvOFVL._SL1500_.jpg" },
  "realme-tablet": { src: "/images/brand-family/realme-tablet.webp", width: 348, height: 416, model: "realme Pad 3", source: "https://m.media-amazon.com/images/I/218IBNW8StL.jpg" },
  "oppo-phone": { src: "/images/brand-family/oppo-phone.webp", width: 438, height: 900, model: "OPPO Reno16", source: "https://m.media-amazon.com/images/I/61pdOOVTAeL._SL1500_.jpg" },
  "vivo-phone": { src: "/images/brand-family/vivo-phone.webp", width: 720, height: 900, model: "vivo X300 FE", source: "https://m.media-amazon.com/images/I/61UxGdX4S2L._SL1500_.jpg" },
  "poco-phone": { src: "/images/brand-family/poco-phone.webp", width: 450, height: 900, model: "POCO C85x 5G", source: "https://m.media-amazon.com/images/I/51XtbXSrHsL._SL1380_.jpg" },
  "infinix-phone": { src: "/images/brand-family/infinix-phone.webp", width: 490, height: 900, model: "Infinix NOTE 60 Pro", source: "https://m.media-amazon.com/images/I/71mpp3Cqs3L._SL1500_.jpg" },
  "tecno-phone": { src: "/images/brand-family/tecno-phone.webp", width: 780, height: 900, model: "TECNO POVA Curve 2", source: "https://m.media-amazon.com/images/I/61NANHVTk4L._SL1200_.jpg" },
  "itel-phone": { src: "/images/brand-family/itel-phone.webp", width: 669, height: 900, model: "itel Vision 2S", source: "https://m.media-amazon.com/images/I/81ZHVxchTZL._SL1500_.jpg" },
  "alcatel-phone": { src: "/images/brand-family/alcatel-phone.webp", width: 713, height: 900, model: "Alcatel V3 Ultra", source: "https://m.media-amazon.com/images/I/71jVMWftJnL._SL1500_.jpg" },
  "ai-plus-phone": { src: "/images/brand-family/ai-plus-phone.webp", width: 678, height: 900, model: "Ai+ Nova 2 Neo 5G", source: "https://rukminim2.flixcart.com/image/1200/1600/xif0q/mobile/u/2/r/-original-imahzm49ck6sv6zw.jpeg" },
};
