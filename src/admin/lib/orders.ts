import { BRANCHES } from "@/shared/branches";
import { buildWhatsAppLink, orderRef } from "@/shared/whatsapp";

export function branchFor(slug: string | null) {
  return slug ? BRANCHES.find((b) => b.slug === slug) ?? null : null;
}

/** Customer numbers are saved as 10 digits; WhatsApp and tel: want +91. */
export function customerNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/** Opens a chat with the customer, with a first reply about their order typed in. */
export function customerChatLink(order: {
  id: string;
  customerName: string;
  phone: string;
  branch: string | null;
  items: { name: string; quantity: number }[];
}) {
  const store = branchFor(order.branch)?.name;
  const first = order.customerName.trim().split(/\s+/)[0];
  const items = order.items.map((i) => (i.quantity > 1 ? `${i.name} × ${i.quantity}` : i.name)).join(", ");
  const text = `Hi ${first}, this is Amrit Mobiles${store ? ` ${store}` : ""}. Thanks for your order #${orderRef(order.id)} (${items}). `;
  return buildWhatsAppLink(customerNumber(order.phone), text);
}

export function customerCallLink(phone: string) {
  return `tel:+${customerNumber(phone)}`;
}
