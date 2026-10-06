// Client-safe WhatsApp helpers (no secrets). For sending order notifications
// via the Meta Cloud API once WABA is approved, see whatsapp-server.ts.

export const SHOP_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";

export function buildWhatsAppLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export const SHOP_WHATSAPP_LINK = buildWhatsAppLink(
  SHOP_WHATSAPP_NUMBER,
  "Hi Amrit Mobiles! I have a question about a product."
);

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
