import { redirect } from "next/navigation";
import { getAdminSession } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";
import { AdminShell } from "@/admin/components/AdminShell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const waitingOrders = await prisma.order.count({ where: { status: "NEW" } });

  return (
    <AdminShell email={session.email} waitingOrders={waitingOrders}>
      {children}
    </AdminShell>
  );
}
