"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/backend/lib/prisma";
import { requireAdminSession } from "@/backend/lib/auth";
import { HOLDS_STOCK, isOrderStatus } from "@/backend/lib/order-status";

/**
 * Moves an order to a new status. Placing an order takes its phones off the
 * shelf, so cancelling puts them back, and un-cancelling takes them again.
 */
export async function updateOrderStatus(id: string, formData: FormData) {
  await requireAdminSession();
  const status = String(formData.get("status") || "");
  if (!isOrderStatus(status)) throw new Error("Invalid status");

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    if (order.status === status) return;

    const wasHolding = HOLDS_STOCK(order.status);
    const nowHolding = HOLDS_STOCK(status);
    if (wasHolding !== nowHolding) {
      for (const item of order.items) {
        if (!item.productId) continue; // product was deleted since
        const product = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true } });
        if (!product) continue;
        // Un-cancelling can't take stock below zero if the phone sold out meanwhile.
        const stock = nowHolding ? Math.max(0, product.stock - item.quantity) : product.stock + item.quantity;
        await tx.product.update({ where: { id: item.productId }, data: { stock } });
      }
    }
    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/(shop)/product/[slug]", "page");
}

export async function saveStaffNote(id: string, formData: FormData) {
  await requireAdminSession();
  const staffNote = String(formData.get("staffNote") || "").trim().slice(0, 1000);
  await prisma.order.update({ where: { id }, data: { staffNote: staffNote || null } });
  revalidatePath(`/admin/orders/${id}`);
}
