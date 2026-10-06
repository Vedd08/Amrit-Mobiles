"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cartCount, useCartStore } from "@/frontend/store/cart-store";
import { CartIcon, GridIcon, HomeIcon, WhatsAppIcon } from "@/frontend/components/icons";
import { SHOP_WHATSAPP_LINK } from "@/shared/whatsapp";
import { useMounted } from "@/frontend/lib/use-mounted";

export function BottomNav() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const mounted = useMounted();

  const count = mounted ? cartCount(items) : 0;

  const tabs = [
    { href: "/shop", label: "Home", icon: HomeIcon, match: (p: string) => p === "/shop" },
    {
      href: "/phones",
      label: "Phones",
      icon: GridIcon,
      match: (p: string) =>
        p.startsWith("/phones") || p.startsWith("/product") || p.startsWith("/category"),
    },
    { href: "/cart", label: "Cart", icon: CartIcon, match: (p: string) => p === "/cart" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden border-line bg-paper/95">
      <div className="mx-auto flex max-w-6xl items-stretch">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-micro font-medium ${
                active ? "text-lime-ink" : "text-ink-3"
              }`}
            >
              <span className="relative">
                <Icon className="h-6 w-6" />
                {href === "/cart" && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-micro font-semibold bg-lime text-[#2A2A2A]">
                    {count}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
        <a
          href={SHOP_WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-micro font-medium text-ink-3"
        >
          <WhatsAppIcon className="h-6 w-6" />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
