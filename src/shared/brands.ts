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
  { slug: 'google',  name: 'Google Pixel', model: '/models/phone-hero.glb', tint: 'rgb(94, 106, 117)', blurb: 'Google\'s cameras and updates.', href: '/phones/google',   specs: [{label: 'OS', value: 'Pixel UI'}, {label: 'CAMERA', value: 'Computational'}] },
  { slug: 'xiaomi',  name: 'Xiaomi',       model: '/models/phone-hero.glb', tint: 'rgb(194, 91, 30)', blurb: 'Big specs at an honest price.', href: '/phones/xiaomi',  specs: [{label: 'OS', value: 'HyperOS'}, {label: 'BATTERY', value: '5000mAh'}] },
  { slug: 'vivo',    name: 'Vivo',         model: '/models/phone-hero.glb', tint: 'rgb(47, 95, 168)', blurb: 'Portrait and low-light specialists.', href: '/phones/vivo',    specs: [{label: 'OS', value: 'Funtouch'}, {label: 'CAMERA', value: 'Zeiss optics'}] },
  { slug: 'oppo',     name: 'Oppo',     model: '/models/phone-hero.glb', tint: 'rgb(45, 125, 70)', blurb: 'Reno portraits and dependable A series.', href: '/phones/oppo',     specs: [{label: 'OS', value: 'ColorOS'}, {label: 'CAMERA', value: 'Portrait'}] },
  { slug: 'motorola', name: 'Motorola', model: '/models/phone-hero.glb', tint: 'rgb(59, 108, 240)', blurb: 'Edge, Signature and moto g.', href: '/phones/motorola', specs: [{label: 'OS', value: 'Near-stock'}, {label: 'DISPLAY', value: 'pOLED'}] },
  { slug: 'nothing',  name: 'Nothing',  model: '/models/phone-hero.glb', tint: 'rgb(32, 32, 32)', blurb: 'Glyph lights and a see-through back.', href: '/phones/nothing',  specs: [{label: 'OS', value: 'Nothing OS'}, {label: 'DESIGN', value: 'Glyph'}] },
  { slug: 'infinix',  name: 'Infinix',  model: '/models/phone-hero.glb', tint: 'rgb(0, 168, 107)', blurb: 'The NOTE series, big screens for less.', href: '/phones/infinix',  specs: [{label: 'OS', value: 'XOS'}, {label: 'CHARGE', value: 'All-Round'}] },
  { slug: 'tecno',    name: 'Tecno',    model: '/models/phone-hero.glb', tint: 'rgb(0, 102, 204)', blurb: 'POVA power and Spark value.', href: '/phones/tecno',    specs: [{label: 'OS', value: 'HiOS'}, {label: 'CAMERA', value: 'CAMON'}] },
  { slug: 'itel',     name: 'itel',     model: '/models/phone-hero.glb', tint: 'rgb(220, 30, 40)', blurb: 'Smartphones at the friendliest prices.', href: '/phones/itel',     specs: [{label: 'OS', value: 'itel OS'}, {label: 'BATTERY', value: 'All-day'}] },
  { slug: 'alcatel',  name: 'Alcatel',  model: '/models/phone-hero.glb', tint: 'rgb(42, 98, 196)', blurb: 'NXTPAPER screens, easy on the eyes.', href: '/phones/alcatel',  specs: [{label: 'OS', value: 'Android'}, {label: 'DISPLAY', value: 'NXTPAPER'}] },
];
