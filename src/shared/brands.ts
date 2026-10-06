export type Brand = {
  slug: string;
  name: string;
  model: string;          // GLB path; falls back to the hero model
  tint: string;           // hex — body material tint when no dedicated model
  blurb: string;          // one short line
  href: string;           // existing route
  specs: { label: string; value: string }[];
};

export const brands: Brand[] = [
  { slug: 'apple',   name: 'Apple',        model: '/models/phone-hero.glb', tint: 'rgb(184, 188, 192)', blurb: 'iPhone, sealed and IMEI-checked.', href: '/phones/apple',   specs: [{label: 'OS', value: 'iOS'}, {label: 'CHIP', value: 'A-Series'}] },
  { slug: 'samsung', name: 'Samsung',      model: '/models/phone-hero.glb', tint: 'rgb(44, 49, 56)', blurb: 'Galaxy flagships to everyday series.', href: '/phones/samsung', specs: [{label: 'OS', value: 'One UI'}, {label: 'DISPLAY', value: 'AMOLED'}] },
  { slug: 'oneplus', name: 'OnePlus',      model: '/models/phone-hero.glb', tint: 'rgb(138, 43, 43)', blurb: 'Fast, clean Android.', href: '/phones/oneplus', specs: [{label: 'OS', value: 'OxygenOS'}, {label: 'CHARGE', value: 'SuperVOOC'}] },
  { slug: 'google',  name: 'Google Pixel', model: '/models/phone-hero.glb', tint: 'rgb(94, 106, 117)', blurb: 'Google\'s cameras and updates.', href: '/phones/google',   specs: [{label: 'OS', value: 'Pixel UI'}, {label: 'CAMERA', value: 'Computational'}] },
  { slug: 'xiaomi',  name: 'Xiaomi',       model: '/models/phone-hero.glb', tint: 'rgb(194, 91, 30)', blurb: 'Big specs at an honest price.', href: '/phones/xiaomi',  specs: [{label: 'OS', value: 'HyperOS'}, {label: 'BATTERY', value: '5000mAh'}] },
  { slug: 'vivo',    name: 'Vivo',         model: '/models/phone-hero.glb', tint: 'rgb(47, 95, 168)', blurb: 'Portrait and low-light specialists.', href: '/phones/vivo',    specs: [{label: 'OS', value: 'Funtouch'}, {label: 'CAMERA', value: 'Zeiss optics'}] },
];
