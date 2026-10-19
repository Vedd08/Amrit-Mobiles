"use server";

import { prisma } from "@/backend/lib/prisma";
import { checkoutSchema } from "@/backend/lib/validation";
import { notifyNewOrder } from "@/backend/lib/whatsapp-server";
import { CHAT_BRANCHES } from "@/shared/branches";

export type CheckoutItemInput = { productId: string; quantity: number };

export type PlaceOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  checkoutMethod: "WHATSAPP";
  /** Store the customer is buying from; the order goes to its WhatsApp. */
  branchSlug: string;
  note?: string;
  items: CheckoutItemInput[];
};

export type PlaceOrderResult =
  | { ok: true; orderId: string; branchSlug: string; whatsappUrl?: string }
  | { ok: false; error: string };

/**
 * Saves the order, then hands back a WhatsApp link to the chosen store with
 * every detail filled in. Online payment isn't live yet, so the store
 * completes the sale on that chat.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  if (input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  const branch = CHAT_BRANCHES.find((b) => b.slug === parsed.data.branchSlug);
  if (!branch) {
    return { ok: false, error: "Choose the store you'd like to buy from." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, isActive: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItemsData: { productId: string; name: string; price: number; quantity: number }[] = [];
  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { ok: false, error: "A product in your cart is no longer available. Remove it and try again." };
    }
    if (item.quantity < 1 || product.stock < item.quantity) {
      return { ok: false, error: `Only ${product.stock} of "${product.name}" left online. Lower the quantity, or ask the store.` };
    }
    orderItemsData.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity });
  }

  const total = orderItemsData.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { customerName, phone, address, note } = parsed.data;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerName,
        phone,
        address,
        branch: branch.slug,
        note: note || null,
        checkoutMethod: "WHATSAPP",
        total,
        status: "NEW",
        items: { create: orderItemsData },
      },
    });
    for (const item of orderItemsData) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    }
    return created;
  });

  const result = await notifyNewOrder(
    { id: order.id, customerName, phone: `+91 ${phone}`, address, items: orderItemsData, total, store: branch.name, note },
    branch.phone,
  );
  return {
    ok: true,
    orderId: order.id,
    branchSlug: branch.slug,
    whatsappUrl: result.method === "link" ? result.url : undefined,
  };
}
