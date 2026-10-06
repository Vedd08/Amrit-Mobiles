import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import { ORDER_STATUSES } from "@/backend/lib/order-status";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-paper-2/10 text-ink-3",
  AWAITING_PAYMENT: "bg-paper-2/10 text-ink-2",
  PAID: "bg-lime/10 text-lime-ink",
  CONFIRMED_WHATSAPP: "bg-lime/10 text-lime-ink",
  FULFILLED: "bg-lime/10 text-lime-ink",
  CANCELLED: "bg-danger/10 text-danger",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Orders</h1>
          <p className="mt-1 text-sm text-ink-3">
            {orders.length} order{orders.length === 1 ? "" : "s"}{status ? " with this status" : ""}
          </p>
        </div>
        <form className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-full border border-line bg-paper px-3.5 py-2 text-sm font-medium text-ink outline-none focus:border-lime"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-paper"
          >
            Filter
          </button>
          {status && (
            <Link href="/admin/orders" className="text-sm font-semibold text-lime-ink hover:underline">
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper shadow-xs">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-ink-3">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Method</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line transition-colors hover:bg-paper/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-lime-ink hover:underline">
                    #{o.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{o.customerName}</p>
                  <p className="text-xs text-ink-3">{o.phone}</p>
                </td>
                <td className="px-4 py-3 text-ink-3">{o._count.items}</td>
                <td className="px-4 py-3 font-semibold text-ink">₹{o.total.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-ink-3">
                  {o.checkoutMethod === "WHATSAPP" ? "WhatsApp" : "Online payment"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[o.status] ?? ""}`}>
                    {o.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-3">{o.createdAt.toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-3">
                  {status ? "No orders with this status." : "No orders yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
