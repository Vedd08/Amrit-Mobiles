"use client";

import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PhoneProductCard } from "@/frontend/components/phones/PhoneProductCard";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { searchPhones, brandsWithCounts } from "@/shared/phone-catalog";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { useReducedMotion } from "@/frontend/lib/use-reduced-motion";
import { SectionHeader } from "@/frontend/components/phones/SectionHeader";

const ITEMS_PER_PAGE = 12;

export function Storefront({ allProducts }: { allProducts: ProductCardData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [scrolled, setScrolled] = useState(false);

  // URL State
  const categoryFilter = searchParams.get("category") || "all";
  const brandFilter = searchParams.get("brands")?.split(",").filter(Boolean) || [];
  const inStockFilter = searchParams.get("inStock") === "true";
  const searchFilter = searchParams.get("q") || "";
  const sortFilter = searchParams.get("sort") || "featured";

  const dataMinPrice = Math.min(...allProducts.map((p) => p.price), 0);
  const dataMaxPrice = Math.max(...allProducts.map((p) => p.price), 100000);
  const minPriceFilter = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : dataMinPrice;
  const maxPriceFilter = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : dataMaxPrice;

  // Local State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState(searchFilter);

  // Focus trap ref
  const mobileSheetRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("amrit-mobiles-view");
      // eslint-disable-next-line
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 150);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function updateUrl(params: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([k, v]) => {
      if (v === null) next.delete(k);
      else next.set(k, v);
    });
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
    setPage(1); // Reset pagination on any filter change
  }

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchDraft !== searchFilter) {
        updateUrl({ q: searchDraft || null });
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [searchDraft, searchFilter]);

  // Derived data
  const brandCounts = useMemo(() => brandsWithCounts(allProducts), [allProducts]);

  // Filter Pipeline
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // Search
    if (searchFilter) {
      result = searchPhones(result, searchFilter);
    }

    // Category
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Brands
    if (brandFilter.length > 0) {
      result = result.filter((p) => {
        const brandObj = brandCounts.find(b => b.dbBrand.toLowerCase() === p.brand.toLowerCase());
        return brandObj && brandFilter.includes(brandObj.slug);
      });
    }

    // Price
    result = result.filter((p) => p.price >= minPriceFilter && p.price <= maxPriceFilter);

    // Stock
    if (inStockFilter) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sort
    const copy = [...result];
    switch (sortFilter) {
      case "price-asc":
        copy.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        copy.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        copy.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.localeCompare(a.createdAt);
        });
        break;
      case "featured":
      default:
        copy.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || b.price - a.price);
        break;
    }
    return copy;
  }, [allProducts, searchFilter, categoryFilter, brandFilter, minPriceFilter, maxPriceFilter, inStockFilter, sortFilter, brandCounts]);

  const displayedProducts = filteredProducts.slice(0, page * ITEMS_PER_PAGE);
  const hasActiveFilters = categoryFilter !== "all" || brandFilter.length > 0 || minPriceFilter > dataMinPrice || maxPriceFilter < dataMaxPrice || inStockFilter || searchFilter !== "";

  function clearAll() {
    setSearchDraft("");
    const next = new URLSearchParams();
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    setPage(1);
  }

  // Mobile Filter Dialog Logic
  useEffect(() => {
    const dialog = mobileSheetRef.current;
    if (isMobileFilterOpen && dialog && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!isMobileFilterOpen && dialog && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  // View switch handler
  const handleViewToggle = () => {
    const nextView = view === "grid" ? "list" : "grid";
    setView(nextView);
    try {
      localStorage.setItem("amrit-mobiles-view", nextView);
    } catch {}
  };

  const renderFilterForm = () => (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-micro font-semibold uppercase text-ink-4">Category</legend>
        {["all", "phones"].map((cat) => (
          <label key={cat} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={categoryFilter === cat}
                onChange={() => updateUrl({ category: cat === "all" ? null : cat })}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-sm border-2 border-line peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-lime-ink peer-focus-visible:ring-offset-2 transition-colors group-hover:border-ink-4" />
              <div className="absolute w-2.5 h-2.5 rounded-sm bg-ink scale-0 peer-checked:scale-100 transition-transform" />
            </div>
            <span className="text-small font-medium text-ink capitalize">{cat}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-line pt-6">
        <legend className="text-micro font-semibold uppercase text-ink-4 mb-3">Brand</legend>
        {brandCounts.map((b) => {
          const isChecked = brandFilter.includes(b.slug);
          return (
            <label key={b.slug} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  name="brands"
                  value={b.slug}
                  checked={isChecked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...brandFilter, b.slug]
                      : brandFilter.filter((x) => x !== b.slug);
                    updateUrl({ brands: next.length ? next.join(",") : null });
                  }}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded-sm border-2 border-line peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-lime-ink peer-focus-visible:ring-offset-2 transition-colors group-hover:border-ink-4" />
                <svg className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-small font-medium text-ink flex-1">{b.name}</span>
              <span className="text-micro font-normal text-ink-4 tabular-nums">{b.count}</span>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-line pt-6">
        <legend className="text-micro font-semibold uppercase text-ink-4">Price Range</legend>
        <div className="relative h-1.5 bg-line rounded-sm mt-2">
          <div 
            className="absolute h-full bg-ink rounded-sm"
            style={{ 
              left: `${((minPriceFilter - dataMinPrice) / (dataMaxPrice - dataMinPrice)) * 100}%`,
              right: `${100 - ((maxPriceFilter - dataMinPrice) / (dataMaxPrice - dataMinPrice)) * 100}%`
            }}
          />
          <input
            type="range"
            min={dataMinPrice}
            max={dataMaxPrice}
            value={minPriceFilter}
            onChange={(e) => updateUrl({ minPrice: e.target.value })}
            className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={dataMinPrice}
            max={dataMaxPrice}
            value={maxPriceFilter}
            onChange={(e) => updateUrl({ maxPrice: e.target.value })}
            className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            aria-label="Maximum price"
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-micro font-normal text-ink-4 tabular-nums">
          <span>{formatINR(minPriceFilter)}</span>
          <span>{formatINR(maxPriceFilter)}</span>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-line pt-6">
        <legend className="text-micro font-semibold uppercase text-ink-4 mb-3">Availability</legend>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={inStockFilter}
              onChange={(e) => updateUrl({ inStock: e.target.checked ? "true" : null })}
              className="peer sr-only"
            />
            <div className="w-10 h-6 bg-line rounded-sm peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-lime-ink peer-focus-visible:ring-offset-2 transition-colors duration-200" />
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-sm transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
          </div>
          <span className="text-small font-medium text-ink">In stock only</span>
        </label>
      </fieldset>
    </form>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-paper">
      {/* Section Header */}
      <div className="mb-6">
        <SectionHeader 
          kicker="Everything in stock"
          title="Shop the counter"
          sub="Sealed flagship phones, priced transparently. Filter by brand, budget or what&apos;s actually on the shelf today."
        />
      </div>

      {/* Sticky Toolbar */}
      <div 
        data-scrolled={scrolled}
        className="sticky top-[60px] z-30 flex flex-col sm:flex-row items-center gap-4 py-4 px-4 sm:px-0 bg-white/80 backdrop-blur-xl border-b border-line shadow-sm transition-colors duration-200 data-[scrolled=true]:border-b data-[scrolled=true]:border-line"
      >
        <div className="w-full sm:w-auto flex-1 relative group">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-4 group-focus-within:text-lime-ink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            className="w-full bg-white border border-line rounded-sm pl-12 pr-10 py-3 text-small font-medium text-ink placeholder:text-ink-4 focus:border-lime-ink focus:ring-2 focus:ring-lime-ink focus:ring-offset-2 focus:outline-none transition-all"
          />
          {searchDraft && (
            <button
              onClick={() => setSearchDraft("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-4 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink rounded-full"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="lg:hidden flex items-center justify-center gap-2 bg-white border border-line rounded-sm px-5 py-3 text-small font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-lime-ink" />}
          </button>
          <div className="relative">
            <select
              value={sortFilter}
              onChange={(e) => updateUrl({ sort: e.target.value })}
              aria-label="Sort products"
              className="appearance-none bg-white border border-line rounded-sm pl-4 pr-10 py-3 text-small font-medium text-ink focus:border-lime-ink focus:ring-1 focus:ring-lime-ink focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <button
            onClick={handleViewToggle}
            aria-label={view === "grid" ? "Switch to list view" : "Switch to grid view"}
            className="hidden sm:flex items-center justify-center w-[46px] h-[46px] bg-white border border-line rounded-sm text-ink-4 hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            {view === "grid" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" /></svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Desktop Filter Rail */}
        <aside className="hidden lg:block w-64 shrink-0 self-start sticky top-[140px] bg-white border border-line rounded-md p-6">
          {renderFilterForm()}
        </aside>

        {/* Mobile Filter Sheet */}
        <dialog
          ref={mobileSheetRef}
          onClose={() => setIsMobileFilterOpen(false)}
          className="lg:hidden backdrop:bg-ink/60 fixed inset-x-0 bottom-0 m-0 w-full max-w-none h-[85vh] rounded-t-[24px] bg-white p-0 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-line flex items-center justify-between">
              <h2 className="text-lg font-bold -ink">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
                className="w-8 h-8 flex items-center justify-center rounded-sm bg-paper -ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderFilterForm()}
            </div>
            <div className="p-6 border-t border-line flex gap-4 bg-white">
              <button
                onClick={clearAll}
                className="flex-1 py-3.5 rounded-sm border border-line text-small font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3.5 rounded-sm bg-lime text-small font-semibold text-[#2A2A2A] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
              >
                View {filteredProducts.length}
              </button>
            </div>
          </div>
        </dialog>

        {/* Product Grid Area */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          {/* Active Filters & Count */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6" aria-live="polite">
            <p className="text-micro font-normal text-ink-4 tabular-nums">
              Showing <span className="text-ink font-medium">{displayedProducts.length}</span> of <span className="text-ink font-medium">{filteredProducts.length}</span>
            </p>
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {categoryFilter !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-line text-micro font-medium text-ink">
                    Category: {categoryFilter}
                    <button aria-label="Remove category filter" onClick={() => updateUrl({ category: null })} className="hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {brandFilter.map((b) => {
                  const brandName = brandCounts.find((bc) => bc.slug === b)?.name || b;
                  return (
                    <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-line text-micro font-medium text-ink">
                      {brandName}
                      <button aria-label={`Remove brand ${b}`} onClick={() => updateUrl({ brands: brandFilter.filter((x) => x !== b).join(",") || null })} className="hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink rounded-full">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  );
                })}
                {(minPriceFilter > dataMinPrice || maxPriceFilter < dataMaxPrice) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-line text-micro font-medium text-ink">
                    {formatINR(minPriceFilter)} - {formatINR(maxPriceFilter)}
                    <button aria-label="Remove price filter" onClick={() => updateUrl({ minPrice: null, maxPrice: null })} className="hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {inStockFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-line text-micro font-medium text-ink">
                    In Stock
                    <button aria-label="Remove stock filter" onClick={() => updateUrl({ inStock: null })} className="hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAll}
                  className="text-micro font-medium text-lime-ink hover:underline px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Grid / Skeletons / Empty */}
          {isPending ? (
            <ul className={`grid gap-3 sm:gap-4 lg:gap-4 xl:gap-5 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {Array.from({ length: Math.min(6, filteredProducts.length || 6) }).map((_, i) => (
                <li key={i} className={`p-4 border border-line bg-white rounded-md flex flex-col gap-4 ${!reducedMotion ? "animate-[pulse_1.6s_cubic-bezier(0.4,0,0.6,1)_infinite]" : ""}`}>
                  <div className="w-full aspect-square bg-line rounded-md" />
                  <div className="space-y-2">
                    <div className="h-4 bg-line rounded w-1/3" />
                    <div className="h-5 bg-line rounded w-3/4" />
                  </div>
                  <div className="h-5 bg-line rounded w-1/2 mt-auto" />
                  <div className="h-10 bg-line rounded-sm w-full mt-2" />
                </li>
              ))}
            </ul>
          ) : displayedProducts.length > 0 ? (
            <ul className={`grid gap-3 sm:gap-4 lg:gap-4 xl:gap-5 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {displayedProducts.map((p, i) => (
                <li 
                  key={p.id} 
                  className={!reducedMotion && i < 10 ? "animate-[fadeRise_0.4s_ease-out_forwards]" : ""}
                  style={{ opacity: !reducedMotion && i < 10 ? 0 : 1, animationDelay: !reducedMotion && i < 10 ? `${i * 40}ms` : '0ms' }}
                >
                  <PhoneProductCard product={p} quickView />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-20 text-center bg-white border border-line rounded-md">
              <div className="w-16 h-16 bg-line rounded-md flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-ink-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-ink mb-2 ">No products match</h3>
              <p className="text-small text-ink-4 mb-6 max-w-xs mx-auto">Try adjusting your filters or search query to find what you&apos;re looking for.</p>
              <button
                onClick={clearAll}
                className="bg-lime text-[#2A2A2A] text-small font-semibold px-8 py-3 rounded-sm shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Load More */}
          {!isPending && filteredProducts.length > displayedProducts.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="bg-white border-2 border-line hover:border-ink-4 text-ink text-small font-semibold px-10 py-3 rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeRise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
}
