"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/frontend/components/shop/ProductCard";
import { SmartphoneCutout } from "@/frontend/components/shop/ProductCutouts";
import { ChevronRightIcon } from "@/frontend/components/icons";

type CategoryTab = "ALL" | "PHONES" | "DEALS";

/**
 * "The counter shelf" — a horizontally-scrollable row instead of a static
 * grid, so it always reads as a shelf of stock rather than a page of tiles
 * that may or may not fill out. Drag on desktop, swipe on mobile, or use the
 * arrow buttons; the sliding tab pill and the shelf's own scroll position
 * both give it a physical, browsable feel that a plain wrapping grid doesn't.
 */
export function FeaturedFlagshipShowcase({ products }: { products: ProductCardData[] }) {
  const [activeTab, setActiveTab] = useState<CategoryTab>("ALL");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const shelfRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, top: 0, height: 0 });
  const drag = useRef<{ active: boolean; x: number; scrollLeft: number }>({
    active: false,
    x: 0,
    scrollLeft: 0,
  });

  const tabs: { id: CategoryTab; label: string; count?: number }[] = [
    { id: "ALL", label: "All Featured", count: products.length },
    { id: "PHONES", label: "Flagship Handsets" },
    { id: "DEALS", label: "0% EMI Counter Specials" },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PHONES") {
      return (
        ["Apple", "Samsung", "Vivo", "Oppo", "Xiaomi", "OnePlus"].includes(p.brand) ||
        p.name.toLowerCase().includes("phone") ||
        p.name.toLowerCase().includes("galaxy") ||
        p.name.toLowerCase().includes("iphone") ||
        p.name.toLowerCase().includes("ultra") ||
        p.name.toLowerCase().includes("pro")
      );
    }
    if (activeTab === "DEALS") {
      return Boolean(p.mrp && p.mrp > p.price) || p.price > 10000;
    }
    return true;
  });

  // Slide the active-tab pill to sit behind whichever button is selected.
  useEffect(() => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[idx];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, top: el.offsetTop, height: el.offsetHeight });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const updateScrollState = () => {
    const el = shelfRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  // Re-measure whenever the shelf's contents change (tab switch) and reset
  // scroll back to the start so a filtered shelf never opens mid-scroll.
  useEffect(() => {
    const el = shelfRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    updateScrollState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    const onResize = () => {
      updateScrollState();
      const idx = tabs.findIndex((t) => t.id === activeTab);
      const el = tabRefs.current[idx];
      if (el) {
        setIndicator({ left: el.offsetLeft, width: el.offsetWidth, top: el.offsetTop, height: el.offsetHeight });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Chrome redirects a plain vertical mouse-wheel into an x-only-overflow
  // element's horizontal scroll, which would trap the page underneath a
  // cursor resting over the shelf. Reclaim vertical-dominant wheel gestures
  // for the page; only deltaX-dominant ones (trackpad/shift-wheel) move the
  // shelf natively.
  useEffect(() => {
    const el = shelfRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      window.scrollBy(0, e.deltaY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const scrollShelf = (dir: 1 | -1) => {
    const el = shelfRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 560), behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = shelfRef.current;
    if (!el) return;
    drag.current = { active: true, x: e.clientX, scrollLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const el = shelfRef.current;
    if (!el) return;
    el.scrollLeft = drag.current.scrollLeft - (e.clientX - drag.current.x);
  };
  const endDrag = () => {
    drag.current.active = false;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header & Interactive Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 border-b border-line pb-8">
        <div>
          <div className="text-xs font-extrabold uppercase text-lime-ink mb-1.5 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
            </span>
            <span>Real-time Surat Counter Shelves</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-ink leading-none">
            Featured Flagships.
          </h2>
        </div>

        {/* Pill Navigation Filter Bar — sliding indicator instead of a hard background swap */}
        <div className="relative flex flex-wrap items-center gap-1 bg-paper p-2 rounded-full border border-line">
          <span
            aria-hidden
            className="absolute rounded-full -ink shadow-md transition-all duration-300 ease-out"
            style={{ left: indicator.left, width: indicator.width, top: indicator.top, height: indicator.height }}
          />
          {tabs.map((tab, i) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 px-5 py-2.5 rounded-full text-xs font-bold transition-colors duration-300 uppercase tracking-wider ${
                  isActive ? "text-white" : "text-ink-3 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Showcase Shelf */}
      {filteredProducts.length > 0 ? (
        <div className="relative">
          <div
            ref={shelfRef}
            onScroll={updateScrollState}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Wide EMI promo tile — the shelf's anchor tile */}
            <div className="shrink-0 snap-start w-[300px] sm:w-[420px] lg:w-[460px] rounded-lg bg-base text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between border border-black/20 shadow-xl min-h-[380px] group transition-all duration-500 hover:-translate-y-1.5">
              <div className="relative z-10 max-w-[66%] sm:max-w-[54%]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-micro font-bold uppercase tracking-widest text-[#2A2A2A] mb-4">
                  Special Counter Feature
                </span>
                <h3 className="text-2xl sm:text-4xl font-bold leading-tight text-white">
                  10-Minute Paperless Counter EMI.
                </h3>
                <p className="mt-3 text-xs font-semibold text-neutral-300 leading-relaxed max-w-xs">
                  Walk out of our Surat flagship store with an untouched sealed iPhone or Samsung Galaxy Ultra with
                  zero interest &amp; instant approval.
                </p>
              </div>

              <span className="absolute bottom-6 left-8 text-5xl sm:text-7xl font-bold text-white/10 tracking-tighter pointer-events-none z-0">
                FINANCE
              </span>

              {/* Pushed further out and scaled down: at the previous size a
                  288px cutout and a 60%-width text column could not both fit
                  a 460px tile, so the headline rendered on top of the phone. */}
              <div className="absolute right-[-14%] sm:right-[-8%] top-1/2 -translate-y-1/2 w-48 sm:w-60 h-48 sm:h-60 pointer-events-none transition-transform duration-700 group-hover:scale-105 group-hover:-translate-x-2 drop-">
                <SmartphoneCutout className="w-full h-full" />
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/category/phones"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-ink hover:bg-lime hover:text-[#2A2A2A] px-6 py-3 text-xs font-bold transition-all duration-200 uppercase tracking-wider shadow-md"
                >
                  <span>Explore Deals</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {filteredProducts.map((p) => (
              <div key={p.slug} className="shrink-0 snap-start w-[230px] sm:w-[260px]">
                <ProductCard product={p} />
              </div>
            ))}

            {/* Trailing spacer so the last card can snap clear of the edge fade */}
            <div className="shrink-0 w-1" aria-hidden />
          </div>

          {/* Edge fades signal there's more to scroll */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-linear-to-r from-white to-transparent transition-opacity duration-300 ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-linear-to-l from-white to-transparent transition-opacity duration-300 ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Arrow controls */}
          <button
            type="button"
            onClick={() => scrollShelf(-1)}
            aria-label="Scroll shelf left"
            disabled={!canScrollLeft}
            className="hidden sm:flex absolute left-1 top-[calc(50%-24px)] -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-lg border border-line transition-all duration-200 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRightIcon className="w-4 h-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scrollShelf(1)}
            aria-label="Scroll shelf right"
            disabled={!canScrollRight}
            className="hidden sm:flex absolute right-1 top-[calc(50%-24px)] -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-lg border border-line transition-all duration-200 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>

          {/* Shelf ledge — a soft shadow line the cards visually "sit" on */}
          <div className="mx-6 -mt-3 h-3 rounded-full bg-black/[0.06] blur-md" aria-hidden />
        </div>
      ) : (
        <div className="py-16 text-center bg-paper rounded-lg border border-line">
          <p className="text-base font-bold text-ink">
            No inventory directly matching this category tab on display right now.
          </p>
          <p className="text-xs font-semibold text-ink-3 mt-1">
            Click &quot;All Featured&quot; to view the complete live counter showcase!
          </p>
          <button
            onClick={() => setActiveTab("ALL")}
            className="mt-5 inline-flex items-center justify-center rounded-full -ink text-white text-xs font-bold px-6 py-2.5 uppercase tracking-wider"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Bottom Inventory Browse Link */}
      <div className="mt-8 text-center">
        <Link
          href="/category/phones"
          className="inline-flex items-center gap-2 rounded-full bg-paper hover:bg-ink hover:text-white px-8 py-4 text-xs font-bold text-ink transition-colors duration-200 uppercase tracking-wider border border-line"
        >
          <span>View All 100+ Catalog Devices &amp; Pricing</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
