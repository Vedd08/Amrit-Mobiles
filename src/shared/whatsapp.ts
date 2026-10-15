// Client-safe WhatsApp helpers (no secrets). For sending order notifications
// via the Meta Cloud API once WABA is approved, see whatsapp-server.ts.

import { DEFAULT_BRANCH, type Branch } from "./branches";

/** The shop's main line (orders, structured data): the city-centre branch unless overridden. */
export const SHOP_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_BRANCH.phone!;

export function buildWhatsAppLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Default opening line for a chat; `{store}` becomes the branch name. */
export const DEFAULT_CHAT_MESSAGE = "Hi Amrit Mobiles {store}! I have a question.";

/** A chat link to one branch, with `{store}` in the message filled in. */
export function branchWhatsAppLink(branch: Branch, template: string = DEFAULT_CHAT_MESSAGE) {
  const number = branch.phone ?? DEFAULT_BRANCH.phone!;
  return buildWhatsAppLink(number, template.replaceAll("{store}", branch.name));
}

export type OrderMessageItem = { name: string; quantity: number; price: number };

export type OrderMessageDetails = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderMessageItem[];
  total: number;
};

export function buildOrderMessage(order: OrderMessageDetails) {
  const lines = [
    `New order #${order.id.slice(-8).toUpperCase()}`,
    "",
    ...order.items.map((i) => `• ${i.name} x${i.quantity} — ₹${i.price * i.quantity}`),
    "",
    `Total: ₹${order.total}`,
    "",
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}`,
  ];
  return lines.join("\n");
}
