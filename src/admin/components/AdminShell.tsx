"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/login/actions";
import { BrandLogo } from "@/shared/BrandLogo";
import { DashboardIcon, ProductsIcon, CategoriesIcon, OrdersIcon, OffersIcon, LogoutIcon, StoreIcon } from "./icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/orders", label: "Orders", icon: OrdersIcon },
  { href: "/admin/products", label: "Products", icon: ProductsIcon },
  { href: "/admin/offers", label: "Offers", icon: OffersIcon },
  { href: "/admin/categories", label: "Categories", icon: CategoriesIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * Admin frame. Desktop: a light sidebar. Phone (staff at the counter): a slim
 * top bar and a bottom tab bar, so every section is one thumb-tap away.
 */
export function AdminShell({
  email,
  waitingOrders,
  children,
}: {
  email: string;
  /** Orders still marked New; shown as a badge on Orders. */
  waitingOrders: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const badge = (href: string) =>
    href === "/admin/orders" && waitingOrders > 0 ? (
      <span
        className="ml-auto min-w-5 rounded-full bg-[#E8A317] px-1.5 text-center text-[11px] font-bold leading-5 text-white"
        aria-label={`${waitingOrders} waiting`}
      >
        {waitingOrders > 99 ? "99+" : waitingOrders}
      </span>
    ) : null;

  return (
    <div className="min-h-screen bg-paper text-ink lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-none lg:flex-col lg:border-r lg:border-line lg:bg-white">
        <Link href="/admin" className="px-6 pb-6 pt-7" aria-label="Admin dashboard">
          <BrandLogo variant="full" className="h-14 w-auto" />
        </Link>
        <nav aria-label="Admin" className="flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "bg-lime/15 text-ink" : "text-ink-3 hover:bg-paper hover:text-ink"
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-lime-ink" : ""}`} />
                {item.label}
                {badge(item.href)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-line px-3 py-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-3 transition-colors hover:bg-paper hover:text-ink"
          >
            <StoreIcon className="h-4.5 w-4.5" />
            View the shop
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-3 transition-colors hover:bg-danger/5 hover:text-danger"
            >
              <LogoutIcon className="h-4.5 w-4.5" />
              Sign out
            </button>
          </form>
          <p className="truncate px-3.5 pt-1 text-xs text-ink-4" title={email}>
            {email}
          </p>
        </div>
      </aside>

      {/* Phone / tablet top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <Link href="/admin" aria-label="Admin dashboard">
          <BrandLogo variant="full" className="h-11 w-auto" />
        </Link>
        <div className="flex items-center gap-1">
          <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-full p-2.5 text-ink-3 hover:bg-paper" aria-label="View the shop">
            <StoreIcon className="h-5 w-5" />
          </a>
          <form action={logout}>
            <button type="submit" className="rounded-full p-2.5 text-ink-3 hover:bg-paper hover:text-danger" aria-label="Sign out">
              <LogoutIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-9">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Phone / tablet bottom tabs */}
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold ${active ? "text-ink" : "text-ink-3"}`}
            >
              <span className={`relative grid h-8 w-12 place-items-center rounded-full ${active ? "bg-lime/20" : ""}`}>
                <item.icon className={`h-5 w-5 ${active ? "text-lime-ink" : ""}`} />
                {item.href === "/admin/orders" && waitingOrders > 0 && (
                  <span className="absolute -right-0.5 -top-1 min-w-4.5 rounded-full bg-[#E8A317] px-1 text-center text-[10px] leading-4.5 text-white">
                    {waitingOrders > 99 ? "99+" : waitingOrders}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
