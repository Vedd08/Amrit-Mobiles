import "server-only";
import { buildOrderMessage, buildWhatsAppLink, SHOP_WHATSAPP_NUMBER, type OrderMessageDetails } from "@/shared/whatsapp";

export type NotifyResult = { method: "link"; url: string } | { method: "api"; sent: boolean };

/**
 * Sends the new-order message to the shop's WhatsApp number.
 *
 * Today this always returns a `wa.me` click-to-chat link, since the client's
 * WhatsApp Business API access is not yet approved. Once WHATSAPP_ACCESS_TOKEN
 * and WHATSAPP_PHONE_NUMBER_ID are set (Meta Cloud API credentials), this
 * switches to sending the message server-side automatically. No caller needs
 * to change when that happens.
 */
export async function notifyNewOrder(order: OrderMessageDetails): Promise<NotifyResult> {
  const message = buildOrderMessage(order);
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (accessToken && phoneNumberId) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: SHOP_WHATSAPP_NUMBER,
          type: "text",
          text: { body: message },
        }),
      }
    );
    return { method: "api", sent: res.ok };
  }

  return { method: "link", url: buildWhatsAppLink(SHOP_WHATSAPP_NUMBER, message) };
}
