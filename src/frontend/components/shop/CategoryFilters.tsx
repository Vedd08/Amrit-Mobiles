"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BoltIcon } from "@/frontend/components/shop/icons";

export function CategoryFilters({ brands, totalCount }: { brands: string[]; totalCount?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentBrand = searchParams.get("brand") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-paper border border-line rounded-lg p-4 sm:p-6 mb-8 shadow-2xs select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Interactive Brand Capsule Pill Filters */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-micro font-bold uppercase tracking-wider text-ink-3">
              Filter by Manufacturer Brand
            </span>
            {currentBrand && (
              <button
                onClick={() => updateParam("brand", "")}
                className="text-micro font-extrabold text-danger hover:underline uppercase tracking-wider ml-1"
              >
                [ Reset Filter ✕ ]
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => updateParam("brand", "")}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-2xs flex items-center gap-1.5 ${
                currentBrand === ""
                  ? "bg-ink text-white scale-105"
                  : "bg-white text-ink-3 border border-line hover:border-ink hover:text-ink"
              }`}
            >
              <BoltIcon className="w-3.5 h-3.5" />
              <span>All Inventory</span>
              {totalCount !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-micro font-extrabold ${currentBrand === "" ? "bg-raised text-neutral-300" : "bg-paper-2 text-ink-3"}`}>
                  {totalCount}
                </span>
              )}
            </button>

            {brands.map((b) => {
              const isActive = currentBrand.toLowerCase() === b.toLowerCase();
              return (
                <button
                  key={b}
                  onClick={() => updateParam("brand", isActive ? "" : b)}
                  className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-200 shadow-2xs flex items-center gap-1.5 ${
                    isActive
                      ? "bg-danger text-white shadow-sh-1 scale-105"
                      : "bg-white text-ink-3 border border-line hover:border-danger hover:text-danger"
                  }`}
                >
                  {b === "Apple" ? "Apple" : b}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Sorting Selector & Counter Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t md:border-t-0 md:border-l border-line pt-4 md:pt-0 md:pl-6">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-micro font-bold uppercase tracking-wider text-ink-3">
              Sort Display Shelf
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={currentSort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="w-full sm:w-48 appearance-none bg-white border border-line rounded-lg px-4 py-2.5 text-xs font-extrabold text-ink outline-none focus:border-danger focus:ring-2 focus:ring-danger/20 cursor-pointer pr-9 shadow-2xs transition-colors"
              >
                <option value="newest">Newest Flagships</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center text-ink">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
