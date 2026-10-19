import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import type { Prisma } from "@/backend/generated/prisma/client";
import { ORDER_STATUSES, STATUS_META, isOrderStatus } from "@/backend/lib/order-status";
import { BRANCHES } from "@/shared/branches";
import { orderRef } from "@/shared/whatsapp";
import { WhatsAppIcon } from "@/frontend/components/icons";
import { PageHeader, StatusBadge, EmptyState, btn, input } from "@/admin/components/ui";
import { SearchIcon } from "@/admin/components/icons";
import { branchFor, customerChatLink } from "@/admin/lib/orders";
import { inr, timeAgo } from "@/admin/lib/format";

const PAGE_SIZE = 100;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; branch?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status && isOrderStatus(params.status) ? params.status : undefined;
  const branch = params.branch || undefined;
  const q = params.q?.trim() || undefined;

  const filters: Prisma.OrderWhereInput[] = [];
  if (branch) filters.push({ branch });
  if (q) {
    const digits = q.replace(/\D/g, "");
    filters.push({
      OR: [
        { customerName: { contains: q } },
        ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
        // Order refs are the last 8 characters of the id, shown upper-case.
        { id: { endsWith: q.replace(/^#/, "").toLowerCase() } },
      ],
    });
  }
  const scope: Prisma.OrderWhereInput = { AND: filters };

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: { AND: [...filters, status ? { status } : {}] },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      include: { items: { select: { name: true, quantity: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
  ]);

  const countFor = (s?: string) =>
    s ? (counts.find((c) => c.status === s)?._count._all ?? 0) : counts.reduce((n, c) => n + c._count._all, 0);

  const tabHref = (s?: string) => {
    const sp = new URLSearchParams();
    if (s) sp.set("status", s);
    if (branch) sp.set("branch", branch);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const filtered = Boolean(branch || q);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Every order from the website. Reply on WhatsApp, then move it along."
      />

      {/* Status tabs */}
      <nav aria-label="Order status" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {[undefined, ...ORDER_STATUSES].map((s) => {
          const active = s === status;
          return (
            <Link
              key={s ?? "all"}
              href={tabHref(s)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active ? "border-lime-ink/50 bg-lime/15 text-ink" : "border-line bg-white text-ink-2 hover:border-ink-4"
              }`}
            >
              {s ? STATUS_META[s].label : "All"}
              <span
                className={`rounded-full px-1.5 text-xs font-bold tabular-nums ${
                  active ? "bg-white text-lime-ink" : s === "NEW" && countFor(s) > 0 ? "bg-[#FFF4D6] text-[#8A5A00]" : "bg-paper-2 text-ink-3"
                }`}
              >
                {countFor(s)}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Search + branch */}
      <form className="mb-5 flex flex-col gap-2 sm:flex-row">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="relative flex-1">
          <span className="sr-only">Search orders</span>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
          <input name="q" defaultValue={q} placeholder="Name, mobile or order #" className={`${input} pl-10`} />
        </label>
        <label className="sm:w-60">
          <span className="sr-only">Branch</span>
          <select name="branch" defaultValue={branch ?? ""} className={input}>
            <option value="">All branches</option>
            {BRANCHES.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className={`${btn.secondary} flex-1 sm:flex-none`}>
            Search
          </button>
          {filtered && (
            <Link href={tabHref(status)} className={btn.ghost}>
              Clear
            </Link>
          )}
        </div>
      </form>

      {orders.length === 0 ? (
        <EmptyState title={filtered || status ? "No orders match" : "No orders yet"}>
          {filtered || status ? "Try another status, branch or search." : "Orders placed on the website show up here."}
        </EmptyState>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line bg-white">
          {/* Column labels (desktop) */}
          <li className="hidden grid-cols-[110px_minmax(0,1.3fr)_minmax(0,1.6fr)_minmax(0,0.9fr)_100px_120px_44px] gap-4 border-b border-line bg-paper px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink-3 lg:grid">
            <span>Order</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Branch</span>
            <span className="text-right">Total</span>
            <span>Status</span>
            <span className="sr-only">WhatsApp</span>
          </li>
          {orders.map((o) => {
            const itemCount = o.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <li
                key={o.id}
                className="relative grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 border-b border-line px-4 py-4 last:border-0 hover:bg-paper/60 lg:grid-cols-[110px_minmax(0,1.3fr)_minmax(0,1.6fr)_minmax(0,0.9fr)_100px_120px_44px] lg:items-center lg:gap-4 lg:px-5 lg:py-3.5"
              >
                <div className="order-1 flex items-baseline gap-2 lg:block">
                  {/* The whole row opens the order; the WhatsApp button sits above this link. */}
                  <Link href={`/admin/orders/${o.id}`} className="font-bold text-ink after:absolute after:inset-0 after:content-['']">
                    #{orderRef(o.id)}
                  </Link>
                  <p className="text-xs text-ink-3" title={o.createdAt.toISOString()}>
                    {timeAgo(o.createdAt)}
                  </p>
                </div>
                <div className="order-3 col-span-2 min-w-0 lg:order-2 lg:col-span-1">
                  <p className="truncate font-semibold text-ink">{o.customerName}</p>
                  <p className="text-xs tabular-nums text-ink-3">+91 {o.phone}</p>
                </div>
                <p className="order-4 col-span-2 truncate text-sm text-ink-2 lg:order-3 lg:col-span-1">
                  {o.items.map((i) => (i.quantity > 1 ? `${i.name} × ${i.quantity}` : i.name)).join(", ")}
                  <span className="text-ink-4 lg:hidden"> · {itemCount} item{itemCount === 1 ? "" : "s"}</span>
                </p>
                <p className="order-5 truncate text-sm text-ink-3 lg:order-4">{branchFor(o.branch)?.name ?? "—"}</p>
                <p className="order-2 text-right font-bold tabular-nums text-ink lg:order-5">{inr(o.total)}</p>
                <div className="order-6 justify-self-end lg:justify-self-start">
                  <StatusBadge status={o.status} />
                </div>
                <a
                  href={customerChatLink(o)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${o.customerName}`}
                  title={`WhatsApp ${o.customerName}`}
                  className="relative z-10 order-7 hidden h-9 w-9 place-items-center rounded-full bg-[#25D366]/12 text-[#128C4B] transition-colors hover:bg-[#25D366] hover:text-white lg:grid"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
      {orders.length === PAGE_SIZE && (
        <p className="mt-3 text-center text-xs text-ink-3">Showing the latest {PAGE_SIZE}. Search or filter to find older orders.</p>
      )}
    </div>
  );
}
