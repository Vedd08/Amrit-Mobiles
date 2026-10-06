"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cartCount, useCartStore } from "@/frontend/store/cart-store";
import { useWishlistStore } from "@/frontend/store/wishlist-store";
import { CartIcon } from "@/frontend/components/icons";
import { HeartIcon } from "@/frontend/components/phones/icons";
import { BrandLogo } from "@/shared/BrandLogo";
import { useMounted } from "@/frontend/lib/use-mounted";
import { SHOP_TEL_LINK } from "@/frontend/lib/phone-experience-data";
import { prefersReducedMotion } from "@/frontend/lib/motion";
import { PhoneSearch } from "@/frontend/components/phones/PhoneSearch";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop All" },
  { href: "/phones", label: "Phones" },
  { href: "/#stores", label: "Store & Support" },
];

export function Header() {
  const items = useCartStore((s) => s.items);
  const wishItems = useWishlistStore((s) => s.items);
  const mounted = useMounted();
  const pathname = usePathname();
  
  const count = mounted ? cartCount(items) : 0;
  const wishCount = mounted ? wishItems.length : 0;
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMenuOpen(false);
          triggerRef.current?.focus();
        }
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [menuOpen]);

  const pillHeight = scrolled ? "h-[60px]" : "h-[60px] lg:h-[68px]";
  const pillBg = scrolled ? "bg-[rgba(241,243,237,0.88)] backdrop-blur-xl" : "bg-paper-2";
  const pillShadow = scrolled ? "shadow-sh-1 " : "shadow-sh-1 ";
  const transition = reducedMotion ? "transition-none" : "transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <>
      <header className="fixed top-[14px] left-[16px] right-[16px] z-[60] pointer-events-none">
        <div 
          className={`mx-auto max-w-7xl w-full pointer-events-auto flex items-center justify-between rounded-full border border-line pl-4 pr-3 sm:pl-[28px] sm:pr-[12px] ${pillHeight} ${pillBg} ${pillShadow} ${transition}`}
        >
          {/* LEFT: Wordmark */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity" aria-label="Amrit Mobiles Home">
            <BrandLogo variant="compact" className="h-[30px] w-auto" />
          </Link>

          {/* CENTER: Nav links (absolute so they don't drift) */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-[38px] text-micro uppercase ">
            {NAV_LINKS.map((n) => {
              const isActive = pathname === n.href || (n.href !== '/' && pathname?.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`${isActive ? "font-[600] text-ink" : "font-[500] text-ink/72"} hover:text-lime-ink transition-colors duration-160`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Icon buttons & CTA */}
          <div className="flex items-center gap-1 sm:gap-2">
            <PhoneSearch />
            
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors text-ink hover:bg-line"
              aria-label="Wishlist"
            >
              <HeartIcon className="h-6 w-6" />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 text-micro font-bold leading-none text-[#2A2A2A] shadow-sm pt-[1px]">
                  {wishCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors text-ink hover:bg-line"
              aria-label="Shopping Cart"
            >
              <CartIcon className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 text-micro font-bold leading-none text-[#2A2A2A] shadow-sm pt-[1px]">
                  {count}
                </span>
              )}
            </Link>

            {SHOP_TEL_LINK ? (
              <a
                href={SHOP_TEL_LINK}
                className="hidden lg:inline-flex items-center justify-center px-7 py-3 rounded-full bg-lime text-[#2A2A2A] font-bold text-small hover:bg-lime-ink transition-colors shadow-sm"
              >
                Order now
              </a>
            ) : (
              <Link
                href="/phones"
                className="hidden lg:inline-flex items-center justify-center px-7 py-3 rounded-full bg-lime text-[#2A2A2A] font-bold text-small hover:bg-lime-ink transition-colors shadow-sm"
              >
                Shop phones
              </Link>
            )}

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 rounded-full transition-colors shrink-0 hover:bg-line"
            >
              <span className={`block h-0.5 w-5 transition-transform duration-200 bg-ink ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 transition-opacity duration-200 bg-ink ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 transition-transform duration-200 bg-ink ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-[50] flex flex-col pt-28 pb-8 px-6 lg:hidden overflow-y-auto bg-paper-2">
          <nav className="flex flex-col gap-6">
            {NAV_LINKS.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="text-h3 font-[500] transition-colors text-ink hover:text-lime-ink"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-8">
            {SHOP_TEL_LINK ? (
              <a
                href={SHOP_TEL_LINK}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-4 rounded-full bg-lime text-[#2A2A2A] font-bold text-body shadow-sm active:scale-95 transition-transform"
              >
                Order now
              </a>
            ) : (
              <Link
                href="/phones"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-4 rounded-full bg-lime text-[#2A2A2A] font-bold text-body shadow-sm active:scale-95 transition-transform"
              >
                Shop phones
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
