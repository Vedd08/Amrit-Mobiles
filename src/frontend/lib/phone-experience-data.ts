// Content and math for the story homepage's interactive phone experience.
// Ported from the client's design reference (Design/Amrit Mobiles Landing
// Page.html) — placeholder but realistic, structured to be easy to swap for
// real shop content later.

import { SHOP_WHATSAPP_NUMBER, buildWhatsAppLink } from "@/shared/whatsapp";

export const SHOP_DISPLAY_PHONE = "+91 98765 43210";
export const SHOP_TEL_LINK = `tel:+${SHOP_WHATSAPP_NUMBER}`;
export const SHOP_STORY_WHATSAPP_LINK = buildWhatsAppLink(
  SHOP_WHATSAPP_NUMBER,
  "Hi Amrit Mobiles! I'm looking at your website and have a question."
);


export type TradeInModel = { name: string; short: string; base: number };

export const TRADE_IN_MODELS: TradeInModel[] = [
  { name: "iPhone 13 Pro", short: "iPhone 13 Pro", base: 38000 },
  { name: "iPhone 12", short: "iPhone 12", base: 22000 },
  { name: "Galaxy S22 Ultra", short: "Galaxy S22 Ultra", base: 25500 },
  { name: "OnePlus 10 Pro", short: "OnePlus 10 Pro", base: 16500 },
];

export const CONDITION_LABELS = ["Cracked, working", "Scratched", "Good", "Mint, boxed"];

// [start, end] progress ranges (0-1) where each 360°-view callout is visible.
export const CALLOUT_BANDS: [number, number][] = [
  [0.03, 0.21],
  [0.28, 0.46],
  [0.54, 0.71],
  [0.79, 0.97],
];

// Keyframed [progress, degrees] pairs the 360° section's rotation is
// smooth-stepped between.
export const ROTATION_KEYFRAMES: [number, number][] = [
  [0, 22],
  [0.1, 0],
  [0.2, 0],
  [0.34, -90],
  [0.45, -90],
  [0.6, -180],
  [0.7, -180],
  [0.85, -270],
  [0.955, -270],
  [1, -360],
];

export const HERO_PHASES = ["01 / Set up", "02 / Clear the text", "03 / Unlock", "04 / Go inside"];

export const DEVICE_VIEWS = ["Front", "Edge", "Back", "Inside"];

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function sampleRotation(progress: number, turns: number): number {
  for (let i = 0; i < ROTATION_KEYFRAMES.length - 1; i++) {
    const [pa, da] = ROTATION_KEYFRAMES[i];
    const [pb, db] = ROTATION_KEYFRAMES[i + 1];
    if (progress <= pb) {
      const t = pb === pa ? 0 : (progress - pa) / (pb - pa);
      return (da + (db - da) * smoothstep(Math.max(0, Math.min(1, t)))) * turns;
    }
  }
  return ROTATION_KEYFRAMES[ROTATION_KEYFRAMES.length - 1][1] * turns;
}

export function formatINR(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export const NEW_PHONE_PRICE = 119900;
export const EMI_MONTHS = 12;

export function tradeInValue(model: TradeInModel, conditionPct: number): number {
  return Math.round((model.base * (0.35 + 0.65 * (conditionPct / 100))) / 100) * 100;
}

export function conditionLabel(conditionPct: number): string {
  return CONDITION_LABELS[Math.max(0, Math.min(3, Math.round(conditionPct / 33.34)))];
}
