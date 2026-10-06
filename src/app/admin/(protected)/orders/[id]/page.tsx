import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/backend/lib/prisma";
import { ORDER_STATUSES } from "@/backend/lib/order-status";
import { updateOrderStatus } from "../actions";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-paper-2/10 text-ink-3",
  AWAITING_PAYMENT: "bg-paper-2/10 text-ink-2",
  PAID: "bg-lime/10 text-lime-ink",
  CONFIRMED_WHATSAPP: "bg-lime/10 text-lime-ink",
  FULFILLED: "bg-lime/10 text-lime-ink",
  CANCELLED: "bg-danger/10 text-danger",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const updateStatus = updateOrderStatus.bind(null, id);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm font-semibold text-ink-3 hover:text-ink">
        ← Orders
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status] ?? ""}`}>
          {order.status.replace("_", " ")}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-3">
        Placed {order.createdAt.toLocaleString("en-IN")} via{" "}
        {order.checkoutMethod === "WHATSAPP" ? "WhatsApp" : "Online payment"}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <div className="rounded-lg border border-line bg-paper p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-3">Items</h2>
            <div className="mt-3 divide-y divide-border text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2.5">
                  <span className="text-ink">
                    {item.name} <span className="text-ink-3">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-ink">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-2.5 font-bold text-ink">
                <span>Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-paper p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-3">Customer</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-ink-3">Name</dt>
                <dd className="font-medium text-ink">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Phone</dt>
                <dd className="font-medium text-ink">{order.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Address</dt>
                <dd className="font-medium text-ink">{order.address}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="h-fit rounded-lg border border-line bg-paper p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-3">Update status</h2>
          <form action={updateStatus} className="mt-3 space-y-3">
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-lime"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full rounded-full bg-lime py-2.5 text-sm font-semibold text-ink shadow-sm hover:hover:bg-lime-ink"
            >
              Update status
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
