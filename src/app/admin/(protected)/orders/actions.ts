"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/backend/lib/prisma";
import { requireAdminSession } from "@/backend/lib/auth";
import { ORDER_STATUSES } from "@/backend/lib/order-status";

export async function updateOrderStatus(id: string, formData: FormData) {
  await requireAdminSession();
  const status = String(formData.get("status") || "");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Invalid status");
  }

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
