"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/login/actions";
import { BrandLogo } from "@/shared/BrandLogo";
import { DashboardIcon, ProductsIcon, CategoriesIcon, OrdersIcon, LogoutIcon } from "./icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/products", label: "Products", icon: ProductsIcon },
  { href: "/admin/categories", label: "Categories", icon: CategoriesIcon },
  { href: "/admin/orders", label: "Orders", icon: OrdersIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside className="border-b border-border bg-background md:w-60 md:flex-none md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-5 md:flex-col md:items-start md:gap-6">
          <Link href="/admin" className="flex items-center">
            <BrandLogo variant="compact" className="h-7 w-auto" />
          </Link>

          <form action={logout} className="md:hidden">
            <button type="submit" className="text-sm font-semibold text-primary hover:text-primary-hover">
              Sign out
            </button>
          </form>

          <nav className="hidden md:flex md:w-full md:flex-col md:gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`h-4.5 w-4.5 shrink-0 ${
                      active ? "text-primary-foreground" : "text-muted group-hover:text-foreground"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto border-t border-border px-4 py-2.5 md:hidden">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "bg-surface text-muted"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-border px-5 py-4 md:block">
          <p className="truncate text-xs font-medium text-muted">{email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-danger"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
