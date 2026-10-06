import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import { ProductsIcon, CategoriesIcon, OrdersIcon, AlertIcon, ClockIcon } from "@/admin/components/icons";

const LOW_STOCK_THRESHOLD = 5;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-paper-2/10 text-ink-3",
  AWAITING_PAYMENT: "bg-paper-2/10 text-ink-2",
  PAID: "bg-lime/10 text-lime-ink",
  CONFIRMED_WHATSAPP: "bg-lime/10 text-lime-ink",
  FULFILLED: "bg-lime/10 text-lime-ink",
  CANCELLED: "bg-danger/10 text-danger",
};

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, orderCount, pendingOrders, recentOrders, lowStockProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PENDING", "AWAITING_PAYMENT"] } } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { items: true } } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: LOW_STOCK_THRESHOLD }, isActive: true },
        orderBy: { stock: "asc" },
        take: 5,
        select: { id: true, name: true, brand: true, stock: true },
      }),
    ]);

  const stats = [
    { label: "Products", value: productCount, icon: ProductsIcon, href: "/admin/products" },
    { label: "Categories", value: categoryCount, icon: CategoriesIcon, href: "/admin/categories" },
    { label: "Total orders", value: orderCount, icon: OrdersIcon, href: "/admin/orders" },
    { label: "Pending orders", value: pendingOrders, icon: ClockIcon, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-3">A live look at the store — pulled straight from the database.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-lg border border-line bg-paper p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime/10 text-lime-ink transition-colors group-hover:bg-lime group-hover:text-ink">
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-ink">{s.value}</p>
            <p className="mt-0.5 text-sm text-ink-3">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-paper p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <ClockIcon className="h-4 w-4 text-ink-3" />
              Recent orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-lime-ink hover:underline">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="mt-6 py-4 text-center text-sm text-ink-3">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm hover:opacity-70"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{o.customerName}</p>
                      <p className="text-xs text-ink-3">
                        #{o.id.slice(-8).toUpperCase()} · {o._count.items} item{o._count.items === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-ink">₹{o.total.toLocaleString("en-IN")}</p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-micro font-semibold ${
                          STATUS_STYLES[o.status] ?? ""
                        }`}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-line bg-paper p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <AlertIcon className="h-4 w-4 text-danger" />
            Low stock
          </h2>

          {lowStockProducts.length === 0 ? (
            <p className="mt-6 py-4 text-center text-sm text-ink-3">
              Nothing under {LOW_STOCK_THRESHOLD} units — stock looks healthy.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {lowStockProducts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm hover:opacity-70"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-3">{p.brand}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.stock === 0 ? "bg-danger/10 text-danger" : "bg-paper-2/10 text-ink-2"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
