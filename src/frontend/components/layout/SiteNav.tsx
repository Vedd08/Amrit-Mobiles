"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cartCount, useCartStore } from "@/frontend/store/cart-store";
import { useWishlistStore } from "@/frontend/store/wishlist-store";
import { CartIcon, ChevronRightIcon, WhatsAppIcon } from "@/frontend/components/icons";
import { ArrowRightIcon, HeartIcon } from "@/frontend/components/phones/icons";
import { PhoneSearch } from "@/frontend/components/phones/PhoneSearch";
import { BrandLogo } from "@/shared/BrandLogo";
import { brands } from "@/shared/brands";
import { BRANCHES } from "@/shared/branches";
import { PHONE_CATEGORIES } from "@/shared/phone-catalog";
import { SHOP_WHATSAPP_LINK } from "@/shared/whatsapp";
import { useMounted } from "@/frontend/lib/use-mounted";

const LINKS = [
  { href: "/shop", label: "Shop all", match: (p: string) => p === "/shop" },
  { href: "/#stores", label: "Stores", match: () => false },
];

const isPhonesPath = (p: string) => p.startsWith("/phones") || p.startsWith("/product") || p.startsWith("/category");

/**
 * The one navbar for the whole site (homepage and every shop page): a
 * floating glass pill with the real logo, a "Phones" mega-menu (brands +
 * shop-by-need), search, wishlist, cart and a WhatsApp CTA. It hides while
 * scrolling down and returns on scroll up; on the homepage it also steps
 * aside during the "enter the store" finale (body.hide-cinematic-nav).
 */
export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const mounted = useMounted();
  const cart = useCartStore((s) => s.items);
  const wish = useWishlistStore((s) => s.items);
  const cartN = mounted ? cartCount(cart) : 0;
  const wishN = mounted ? wish.length : 0;

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const megaButton = useRef<HTMLButtonElement>(null);

  // Scroll state: glass deepens once off the top; hide on the way down.
  useEffect(() => {
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const finale = document.body.classList.contains("hide-cinematic-nav");
      setScrolled(y > 24);
      if (finale) setHidden(true);
      else if (y < 120) setHidden(false);
      else if (y > lastY + 6) setHidden(true);
      else if (y < lastY - 6) setHidden(false);
      lastY = y;
    };
    const raf = requestAnimationFrame(update);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  // Escape closes whatever is open; the mobile sheet locks page scroll.
  useEffect(() => {
    if (!megaOpen && !sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (megaOpen) megaButton.current?.focus();
      setMegaOpen(false);
      setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    if (sheetOpen) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [megaOpen, sheetOpen]);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMegaSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  };
  const closeAll = () => {
    setMegaOpen(false);
    setSheetOpen(false);
  };

  const show = !hidden || megaOpen || sheetOpen;
  const phonesActive = isPhonesPath(pathname);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-3 z-[60] px-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:top-4 sm:px-4 ${
          show ? "translate-y-0" : "-translate-y-[140%]"
        }`}
      >
        <div
          onMouseLeave={closeMegaSoon}
          className={`relative mx-auto flex max-w-7xl items-center justify-between rounded-full border pl-4 pr-2 transition-[height,background-color,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:pl-6 ${
            scrolled ? "h-16" : "h-[68px] sm:h-[80px]"
          } ${
            scrolled || megaOpen
              ? "border-white/70 bg-white/95 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_18px_40px_-18px_rgba(26,28,25,0.28),0_2px_6px_-2px_rgba(26,28,25,0.08)] lg:bg-white/80 lg:backdrop-blur-xl lg:backdrop-saturate-150"
              : "border-line/80 bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_24px_-16px_rgba(26,28,25,0.18)] lg:bg-white/55 lg:backdrop-blur-lg"
          }`}
        >
          {/* Logo */}
          <Link href="/" onClick={closeAll} aria-label="Amrit Mobiles home" className="flex shrink-0 items-center rounded-full transition-opacity hover:opacity-80">
            <BrandLogo
              variant="compact"
              className={`w-auto transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                scrolled ? "h-10 sm:h-11" : "h-12 sm:h-[60px]"
              }`}
            />
          </Link>

          {/* Centre links */}
          <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            <button
              ref={megaButton}
              type="button"
              aria-expanded={megaOpen}
              aria-controls="nav-phones-menu"
              onMouseEnter={openMega}
              onClick={() => setMegaOpen((v) => !v)}
              className={`group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                megaOpen ? "bg-lime/15 text-ink" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
              }`}
            >
              Phones
              <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${megaOpen ? "-rotate-90" : "rotate-90"}`} />
              {phonesActive && <ActiveDot />}
            </button>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={closeMegaSoon}
                onClick={closeAll}
                className="relative rounded-full px-4 py-2 text-[15px] font-semibold text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
              >
                {l.label}
                {l.match(pathname) && <ActiveDot />}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <PhoneSearch />
            <IconLink href="/wishlist" label="Wishlist" count={wishN} onClick={closeAll}>
              <HeartIcon className="h-[22px] w-[22px]" />
            </IconLink>
            <IconLink href="/cart" label="Cart" count={cartN} onClick={closeAll}>
              <CartIcon className="h-[22px] w-[22px]" />
            </IconLink>
            <a
              href={SHOP_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group ml-1.5 hidden items-center gap-2 overflow-hidden rounded-full bg-lime py-2.5 pl-3.5 pr-4 text-[14px] font-bold text-[#2A2A2A] shadow-[0_10px_22px_-10px_rgba(95,138,13,0.9)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_14px_26px_-10px_rgba(95,138,13,0.95)] lg:inline-flex"
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              Chat with us
            </a>
            <button
              type="button"
              onClick={() => {
                setMegaOpen(false);
                setSheetOpen((v) => !v);
              }}
              aria-label={sheetOpen ? "Close menu" : "Open menu"}
              aria-expanded={sheetOpen}
              aria-controls="nav-mobile-sheet"
              className="ml-1 flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full bg-ink/[0.04] transition-colors hover:bg-ink/[0.08] lg:hidden"
            >
              <span className={`block h-0.5 w-5 rounded-full bg-ink transition-transform duration-300 ${sheetOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-ink transition-opacity duration-200 ${sheetOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-ink transition-transform duration-300 ${sheetOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>

          {/* Phones mega-menu */}
          <div
            id="nav-phones-menu"
            onMouseEnter={openMega}
            inert={!megaOpen}
            className={`absolute left-1/2 top-[calc(100%+10px)] hidden w-[min(980px,calc(100vw-32px))] -translate-x-1/2 origin-top transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
              megaOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
            }`}
          >
            <div className="grid grid-cols-[1fr_1.4fr_0.95fr] gap-2 rounded-[28px] border border-line/70 bg-white p-2.5 shadow-[0_30px_60px_-24px_rgba(26,28,25,0.35)]">
              <div className="rounded-[22px] p-5">
                <p className="mb-3 text-micro font-bold uppercase tracking-[0.18em] text-ink-4">Shop by brand</p>
                <ul className="grid grid-cols-2 gap-1">
                  {brands.map((b) => (
                    <li key={b.slug}>
                      <Link
                        href={b.href}
                        onClick={closeAll}
                        className="group relative flex items-center gap-2.5 whitespace-nowrap rounded-xl py-2.5 pl-3 pr-6 text-[15px] font-semibold text-ink transition-colors hover:bg-paper-2"
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white" style={{ background: b.tint }} />
                        {b.name}
                        <ChevronRightIcon className="absolute right-2 h-3.5 w-3.5 -translate-x-1 text-ink-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[22px] p-5">
                <p className="mb-3 text-micro font-bold uppercase tracking-[0.18em] text-ink-4">Shop by need</p>
                <ul className="grid grid-cols-2 gap-1">
                  {PHONE_CATEGORIES.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/phones/category/${c.slug}`}
                        onClick={closeAll}
                        className="block rounded-xl px-3 py-2 transition-colors hover:bg-paper-2"
                      >
                        <span className="block text-[15px] font-semibold text-ink">{c.name}</span>
                        <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-ink-3">{c.tagline}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/phones"
                onClick={closeAll}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] p-6"
                style={{
                  background:
                    "radial-gradient(120% 90% at 100% 0%, rgba(85,194,205,0.35) 0%, transparent 55%), radial-gradient(110% 90% at 0% 100%, rgba(146,195,24,0.45) 0%, transparent 60%), #F4F8EC",
                }}
              >
                <div>
                  <p className="text-micro font-bold uppercase tracking-[0.18em] text-lime-ink">✦ The phone store</p>
                  <p className="mt-2 text-[23px] font-extrabold leading-[1.1] tracking-tight text-ink">
                    Every major brand,
                    <br />
                    sealed & in stock.
                  </p>
                  <p className="mt-3 text-small text-ink-3">EMI sorted at the counter in ten minutes.</p>
                </div>
                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[14px] font-bold text-white transition-transform group-hover:translate-x-1">
                  Browse all phones <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        id="nav-mobile-sheet"
        inert={!sheetOpen}
        className={`fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-paper px-6 pb-8 pt-28 transition-[opacity,visibility] duration-300 lg:hidden ${
          sheetOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(80% 50% at 100% 0%, rgba(85,194,205,0.16) 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, rgba(146,195,24,0.2) 0%, transparent 60%)",
        }}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {[{ href: "/phones", label: "Phones" }, ...LINKS, { href: "/wishlist", label: "Wishlist" }].map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={closeAll}
              className={`flex items-center justify-between border-b border-line py-4 text-[30px] font-extrabold tracking-tight text-ink transition-all duration-500 ${
                sheetOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
              style={{ transitionDelay: sheetOpen ? `${80 + i * 50}ms` : "0ms" }}
            >
              {l.label}
              <ArrowRightIcon className="h-5 w-5 text-ink-4" />
            </Link>
          ))}
        </nav>

        <p className="mb-3 mt-8 text-micro font-bold uppercase tracking-[0.18em] text-ink-4">Brands</p>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={b.href}
              onClick={closeAll}
              className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: b.tint }} />
              {b.name}
            </Link>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-10">
          <a
            href={SHOP_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 flex items-center justify-center gap-2 rounded-full bg-lime py-4 text-[16px] font-bold text-[#2A2A2A] shadow-[0_12px_26px_-12px_rgba(95,138,13,0.9)]"
          >
            <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
          </a>
          <Link
            href="/#stores"
            onClick={closeAll}
            className="col-span-2 flex items-center justify-center rounded-full border border-line bg-white py-4 text-[15px] font-bold text-ink"
          >
            {BRANCHES.length} stores across Surat
          </Link>
        </div>
      </div>
    </>
  );
}

function ActiveDot() {
  return <span aria-hidden="true" className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-lime" />;
}

function IconLink({
  href,
  label,
  count,
  onClick,
  children,
}: {
  href: string;
  label: string;
  count: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.05]"
    >
      {children}
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold leading-none text-[#2A2A2A] ring-2 ring-white">
          {count}
        </span>
      )}
    </Link>
  );
}
