"use server";

import { prisma } from "@/backend/lib/prisma";
import { checkoutSchema } from "@/backend/lib/validation";
import { notifyNewOrder } from "@/backend/lib/whatsapp-server";
import { createPaymentIntent } from "@/backend/lib/payment";

export type CheckoutItemInput = { productId: string; quantity: number };

export type PlaceOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  checkoutMethod: "WHATSAPP" | "ONLINE_PAYMENT";
  items: CheckoutItemInput[];
};

export type PlaceOrderResult =
  | { ok: true; orderId: string; whatsappUrl?: string; paymentMessage?: string }
  | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  if (input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, isActive: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItemsData: { productId: string; name: string; price: number; quantity: number }[] = [];
  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { ok: false, error: "A product in your cart is no longer available." };
    }
    if (item.quantity < 1 || product.stock < item.quantity) {
      return { ok: false, error: `Only ${product.stock} of "${product.name}" left in stock.` };
    }
    orderItemsData.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }

  const total = orderItemsData.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerName: parsed.data.customerName,
        phone: parsed.data.phone,
        address: parsed.data.address,
        checkoutMethod: parsed.data.checkoutMethod,
        total,
        status: parsed.data.checkoutMethod === "WHATSAPP" ? "CONFIRMED_WHATSAPP" : "AWAITING_PAYMENT",
        items: { create: orderItemsData },
      },
    });
    for (const item of orderItemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    return created;
  });

  if (parsed.data.checkoutMethod === "WHATSAPP") {
    const result = await notifyNewOrder({
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      items: orderItemsData,
      total,
    });
    return { ok: true, orderId: order.id, whatsappUrl: result.method === "link" ? result.url : undefined };
  }

  const payment = await createPaymentIntent({ orderId: order.id, amount: total });
  return { ok: true, orderId: order.id, paymentMessage: payment.message };
}
