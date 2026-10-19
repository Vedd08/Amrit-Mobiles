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
  /** Branch the customer chose to buy from. */
  store?: string;
  note?: string;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Short, human order reference shown to the customer and the store. */
export function orderRef(id: string) {
  return id.slice(-8).toUpperCase();
}

/**
 * The order as a WhatsApp message, sent by the customer to their chosen store
 * until online payment is live. *bold* is WhatsApp formatting.
 */
export function buildOrderMessage(order: OrderMessageDetails) {
  const lines = [
    `Hi Amrit Mobiles${order.store ? ` ${order.store}` : ""}! I'd like to place this order.`,
    "",
    `*Order #${orderRef(order.id)}*`,
    ...order.items.map((i) => `• ${i.name} × ${i.quantity} = ${inr(i.price * i.quantity)}`),
    `*Total: ${inr(order.total)}*`,
    "",
    `*Name:* ${order.customerName}`,
    `*Mobile:* ${order.phone}`,
    `*Address:* ${order.address}`,
    ...(order.store ? [`*Store:* ${order.store}`] : []),
    ...(order.note ? [`*Note:* ${order.note}`] : []),
    "",
    "Please confirm availability and the next steps.",
  ];
  return lines.join("\n");
}
