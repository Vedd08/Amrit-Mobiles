import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import { orderRef } from "@/shared/whatsapp";
import { Card, PageHeader, StatusBadge, btn } from "@/admin/components/ui";
import { BarList, DailyColumns, StatTile } from "@/admin/components/charts";
import { AlertIcon } from "@/admin/components/icons";
import { branchFor } from "@/admin/lib/orders";
import { formatDay, inr, inrCompact, istDayKey, startOfDayIST, timeAgo } from "@/admin/lib/format";

const LOW_STOCK_THRESHOLD = 5;
const CHART_DAYS = 14;

/** Revenue = orders that weren't cancelled. */
const counts = (s: string) => s !== "CANCELLED";

export default async function AdminDashboardPage() {
  const now = new Date();
  const since60 = startOfDayIST(59, now);

  const [waiting, oldestWaiting, recentOrders, lowStock, windowOrders] = await Promise.all([
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.findFirst({ where: { status: "NEW" }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, customerName: true, total: true, status: true, createdAt: true, branch: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD }, isActive: true },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: 6,
      select: { id: true, name: true, brand: true, stock: true },
    }),
    // Everything the charts need: two 30-day windows, so "vs previous 30 days" works.
    prisma.order.findMany({
      where: { createdAt: { gte: since60 } },
      select: { createdAt: true, total: true, status: true, branch: true, items: { select: { name: true, quantity: true, price: true } } },
    }),
  ]);

  const live = windowOrders.filter((o) => counts(o.status));
  const sumSince = (from: Date, to: Date = now) => {
    const os = live.filter((o) => o.createdAt >= from && o.createdAt < to);
    return { total: os.reduce((n, o) => n + o.total, 0), orders: os.length };
  };
  const change = (cur: number, prev: number) => (prev === 0 ? null : (cur - prev) / prev);

  const today = sumSince(startOfDayIST(0, now));
  const week = sumSince(startOfDayIST(6, now));
  const prevWeek = sumSince(startOfDayIST(13, now), startOfDayIST(6, now));
  const month = sumSince(startOfDayIST(29, now));
  const prevMonth = sumSince(since60, startOfDayIST(29, now));

  // Daily columns for the last CHART_DAYS days (IST calendar days).
  const days = Array.from({ length: CHART_DAYS }, (_, i) => {
    const start = startOfDayIST(CHART_DAYS - 1 - i, now);
    return { key: istDayKey(start), label: formatDay(start), total: 0, orders: 0 };
  });
  for (const o of live) {
    const day = days.find((d) => d.key === istDayKey(o.createdAt));
    if (day) {
      day.total += o.total;
      day.orders += 1;
    }
  }

  // Last 30 days by branch and by phone.
  const monthStart = startOfDayIST(29, now);
  const monthOrders = live.filter((o) => o.createdAt >= monthStart);
  const byBranch = new Map<string, { total: number; orders: number }>();
  const byPhone = new Map<string, { units: number; total: number }>();
  for (const o of monthOrders) {
    const key = o.branch ?? "unknown";
    const b = byBranch.get(key) ?? { total: 0, orders: 0 };
    b.total += o.total;
    b.orders += 1;
    byBranch.set(key, b);
    for (const it of o.items) {
      const p = byPhone.get(it.name) ?? { units: 0, total: 0 };
      p.units += it.quantity;
      p.total += it.price * it.quantity;
      byPhone.set(it.name, p);
    }
  }
  const branchRows = [...byBranch.entries()]
    .map(([slug, v]) => ({
      key: slug,
      label: branchFor(slug === "unknown" ? null : slug)?.name ?? "Branch not recorded",
      value: v.total,
      detail: `${v.orders} order${v.orders === 1 ? "" : "s"}`,
    }))
    .sort((a, b) => b.value - a.value);
  const phoneRows = [...byPhone.entries()]
    .map(([name, v]) => ({ key: name, label: name, value: v.units, detail: inrCompact(v.total) }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 6);

  return (
    <div>
      <PageHeader title="Dashboard" description="Sales and orders from the website. Cancelled orders aren't counted." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
        {/* Hero: the one number to act on */}
        <Link
          href="/admin/orders?status=NEW"
          className={`group flex flex-col justify-between rounded-2xl border p-6 transition-colors ${
            waiting > 0 ? "border-[#F2D58A] bg-[#FFF8E6] hover:bg-[#FFF2CF]" : "border-line bg-white hover:bg-paper"
          }`}
        >
          <div>
            <p className={`text-sm font-bold ${waiting > 0 ? "text-[#8A5A00]" : "text-ink-3"}`}>Orders waiting for a reply</p>
            <p className="mt-3 text-6xl font-extrabold leading-none tracking-tight text-ink">{waiting}</p>
            <p className="mt-3 text-sm text-ink-2">
              {waiting === 0
                ? "All caught up."
                : `Oldest placed ${timeAgo(oldestWaiting!.createdAt, now)}. Message them on WhatsApp.`}
            </p>
          </div>
          <span className="mt-5 text-sm font-bold text-ink group-hover:underline">
            {waiting > 0 ? "Open new orders →" : "See all orders →"}
          </span>
        </Link>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Sales today" value={inrCompact(today.total)} sub={`${today.orders} order${today.orders === 1 ? "" : "s"}`} />
          <StatTile
            label="Last 7 days"
            value={inrCompact(week.total)}
            sub={`${week.orders} order${week.orders === 1 ? "" : "s"}`}
            delta={{ value: change(week.total, prevWeek.total), period: "week before" }}
          />
          <StatTile
            label="Last 30 days"
            value={inrCompact(month.total)}
            sub={`${month.orders} order${month.orders === 1 ? "" : "s"}`}
            delta={{ value: change(month.total, prevMonth.total), period: "30 days before" }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        <Card title={`Sales per day, last ${CHART_DAYS} days`}>
          <DailyColumns days={days} />
        </Card>
        <Card title="Sales by branch, 30 days">
          <BarList rows={branchRows} format={inrCompact} emptyText="No sales in the last 30 days." />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Best sellers, 30 days">
          <BarList
            rows={phoneRows}
            format={(n) => `${n} sold`}
            emptyText="Nothing sold in the last 30 days."
          />
        </Card>

        <Card
          title="Latest orders"
          action={
            <Link href="/admin/orders" className="text-xs font-bold text-lime-ink hover:underline">
              View all
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-3">No orders yet.</p>
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-75">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{o.customerName}</p>
                      <p className="truncate text-xs text-ink-3">
                        #{orderRef(o.id)} · {timeAgo(o.createdAt, now)}
                        {branchFor(o.branch) && ` · ${branchFor(o.branch)!.name}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-bold tabular-nums text-ink">{inr(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <AlertIcon className="h-4 w-4 text-danger" />
              Low stock
            </span>
          }
          action={
            <Link href="/admin/products?stock=low" className="text-xs font-bold text-lime-ink hover:underline">
              Update stock
            </Link>
          }
        >
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-3">Nothing at {LOW_STOCK_THRESHOLD} or fewer. Stock looks healthy.</p>
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}/edit`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-75">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-3">{p.brand}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        p.stock === 0 ? "bg-danger/8 text-danger" : "bg-[#FFF4D6] text-[#8A5A00]"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/products/new" className={btn.secondary}>
          Add a product
        </Link>
        <Link href="/admin/products/import" className={btn.secondary}>
          Update prices from Excel
        </Link>
      </div>
    </div>
  );
}
