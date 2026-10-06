"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import {
  filterPhones,
  sortPhones,
  PHONE_BRANDS,
  type PhoneBrand,
  type PhoneFilter,
  type PhoneSort,
} from "@/shared/phone-catalog";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { PhoneProductCard } from "./PhoneProductCard";
import { FilterSheet } from "./FilterSheet";
import { BrandMark } from "./BrandMark";
import { ArrowLeftIcon, SlidersIcon } from "./icons";

const EMPTY: PhoneFilter = {};

const SORT_LABELS: Record<PhoneSort, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest first",
};

function activeCount(f: PhoneFilter): number {
  return (
    (f.maxPrice != null ? 1 : 0) +
    (f.ram?.length ? 1 : 0) +
    (f.storage?.length ? 1 : 0) +
    (f.brands?.length ? 1 : 0) +
    (f.fiveGOnly ? 1 : 0)
  );
}

export function PhoneListing({
  title,
  intro,
  products,
  brand,
  showBrandFilter = false,
  initialFilter,
}: {
  title: string;
  intro: string;
  products: ProductCardData[];
  brand?: PhoneBrand;
  showBrandFilter?: boolean;
  initialFilter?: PhoneFilter;
}) {
  const [filter, setFilter] = useState<PhoneFilter>(initialFilter || EMPTY);
  const [sort, setSort] = useState<PhoneSort>("featured");
  const [sheetOpen, setSheetOpen] = useState(false);

  const priceRange = useMemo<[number, number]>(() => {
    if (!products.length) return [0, 100000];
    const prices = products.map((p) => p.price);
    const lo = Math.floor(Math.min(...prices) / 1000) * 1000;
    const hi = Math.ceil(Math.max(...prices) / 1000) * 1000;
    return [lo, hi === lo ? lo + 1000 : hi];
  }, [products]);

  const availableBrandSlugs = useMemo(() => {
    if (!showBrandFilter) return [];
    const present = new Set(products.map((p) => p.brand.toLowerCase()));
    return PHONE_BRANDS.filter((b) => present.has(b.dbBrand.toLowerCase())).map((b) => b.slug);
  }, [products, showBrandFilter]);

  const visible = useMemo(
    () => sortPhones(filterPhones(products, filter), sort),
    [products, filter, sort],
  );

  const fromPrice = products.length ? Math.min(...products.map((p) => p.price)) : 0;
  const nActive = activeCount(filter);

  return (
    <div className="phones-scope min-h-[100svh] bg-paper pb-16 text-ink">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 md:pt-16">
        <Link
          href="/phones"
          className="inline-flex items-center gap-1.5 text-small font-semibold tracking-wide text-ink-3 hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All phones
        </Link>

        <header className="mt-6 border-b border-line pb-8">
          <div className="h-1 w-10 rounded-full bg-lime mb-4" />
          {brand && (
            <div className="mb-4 text-body text-ink-3">
              <BrandMark slug={brand.slug} />
            </div>
          )}
          <h1 className="mb-0 text-3xl md:text-5xl font-extrabold tracking-tighter text-ink">
            {title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-body text-ink-3">{intro}</p>
          {products.length > 0 && (
            <p className="mt-3 text-small text-ink-3">
              {products.length} {products.length === 1 ? "phone" : "phones"} · from{" "}
              {formatINR(fromPrice)}
            </p>
          )}
        </header>
      </div>

      <div className="sticky top-[88px] z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-small font-bold text-ink hover:border-ink/20 hover:shadow-sh-1 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            <SlidersIcon className="h-4 w-4 text-ink-3" />
            Filters
            {nActive > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lime text-[#2A2A2A] px-1.5 text-micro font-bold">
                {nActive}
              </span>
            )}
          </button>

          <label className="flex items-center gap-2 text-small text-ink-3 font-semibold">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as PhoneSort)}
              className="rounded-full border border-line bg-surface px-4 py-2.5 text-small font-bold text-ink outline-none hover:border-ink/20 focus-visible:border-lime-ink transition-all shadow-sh-1"
            >
              {(Object.keys(SORT_LABELS) as PhoneSort[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {nActive > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex flex-wrap gap-2 items-center border-b border-line">
          {filter.maxPrice != null && (
            <button onClick={() => setFilter({ ...filter, maxPrice: undefined })} className="flex items-center gap-1.5 rounded-full border border-lime bg-lime px-3 py-1 text-micro font-semibold text-[#2A2A2A] hover:bg-lime-lo">
              Under {formatINR(filter.maxPrice)} &times;
            </button>
          )}
          {filter.ram?.map(r => (
            <button key={`ram-${r}`} onClick={() => setFilter({ ...filter, ram: filter.ram?.filter(x => x !== r) })} className="flex items-center gap-1.5 rounded-full border border-lime bg-lime px-3 py-1 text-micro font-semibold text-[#2A2A2A] hover:bg-lime-lo">
              {r}GB RAM &times;
            </button>
          ))}
          {filter.storage?.map(s => (
            <button key={`storage-${s}`} onClick={() => setFilter({ ...filter, storage: filter.storage?.filter(x => x !== s) })} className="flex items-center gap-1.5 rounded-full border border-lime bg-lime px-3 py-1 text-micro font-semibold text-[#2A2A2A] hover:bg-lime-lo">
              {s}GB &times;
            </button>
          ))}
          {filter.brands?.map(b => (
            <button key={`brand-${b}`} onClick={() => setFilter({ ...filter, brands: filter.brands?.filter(x => x !== b) })} className="flex items-center gap-1.5 rounded-full border border-lime bg-lime px-3 py-1 text-micro font-semibold text-[#2A2A2A] hover:bg-lime-lo">
              {b} &times;
            </button>
          ))}
          {filter.fiveGOnly && (
            <button onClick={() => setFilter({ ...filter, fiveGOnly: false })} className="flex items-center gap-1.5 rounded-full border border-lime bg-lime px-3 py-1 text-micro font-semibold text-[#2A2A2A] hover:bg-lime-lo">
              5G Only &times;
            </button>
          )}
          <button onClick={() => setFilter(EMPTY)} className="text-micro font-bold underline text-ink-3 hover:text-ink ml-2 focus-visible:outline-lime-ink">Clear all</button>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <p className="mb-6 text-small text-ink-3 font-semibold">
          {visible.length} {visible.length === 1 ? "result" : "results"}
        </p>

        {visible.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((p, i) => (
              <li key={p.slug}>
                <PhoneProductCard product={p} priority={i < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-line bg-surface shadow-sh-1 px-6 py-14 text-center mt-6">
            <p className="text-body font-bold text-ink">No phones match those filters</p>
            <p className="mx-auto mt-2 max-w-[36ch] text-small text-ink-3">
              Loosen a filter, or ask us on WhatsApp — the shelf turns over weekly.
            </p>
            <button
              type="button"
              onClick={() => setFilter(EMPTY)}
              className="mt-6 rounded-full bg-lime px-6 py-3 text-small font-bold text-[#2A2A2A] hover:bg-lime-lo transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        value={filter}
        onChange={setFilter}
        onClear={() => setFilter(EMPTY)}
        resultCount={visible.length}
        priceRange={priceRange}
        availableBrandSlugs={availableBrandSlugs}
      />
    </div>
  );
}
