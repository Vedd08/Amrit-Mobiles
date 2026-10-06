"use client";

import { useEffect, useRef } from "react";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import type { PhoneFilter } from "@/shared/phone-catalog";
import { PHONE_BRANDS } from "@/shared/phone-catalog";
import { CloseIcon } from "./icons";

const RAM_OPTIONS = [4, 6, 8, 12];
const STORAGE_OPTIONS = [64, 128, 256, 512];

function toggle<T>(list: T[] | undefined, v: T): T[] {
  const set = new Set(list ?? []);
  if (set.has(v)) set.delete(v);
  else set.add(v);
  return [...set];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-small font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink ${
        active
          ? "border-lime bg-lime text-[#2A2A2A]"
          : "border-line bg-surface text-ink hover:border-lime-ink"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Bottom-sheet filters. Always in the DOM so the slide is a plain CSS
 * transition; `inert` keeps its controls off the tab order while closed.
 * Applies live — "Show N" just closes the sheet.
 */
export function FilterSheet({
  open,
  onClose,
  value,
  onChange,
  onClear,
  resultCount,
  priceRange,
  availableBrandSlugs,
}: {
  open: boolean;
  onClose: () => void;
  value: PhoneFilter;
  onChange: (next: PhoneFilter) => void;
  onClear: () => void;
  resultCount: number;
  priceRange: [number, number];
  availableBrandSlugs?: string[];
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [min, max] = priceRange;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const brandSlugs = availableBrandSlugs ?? [];
  const brands = brandSlugs.length ? PHONE_BRANDS.filter((b) => brandSlugs.includes(b.slug)) : [];
  const maxPrice = value.maxPrice ?? max;

  return (
    <div
      className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
      inert={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Filter phones"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close filters"
        onClick={onClose}
        className={`absolute inset-0 bg-paper/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 flex max-h-[86vh] md:max-h-none md:w-[420px] flex-col rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none border-t md:border-t-0 md:border-l border-line bg-surface shadow-sh-2 transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="mb-0 text-body font-bold text-ink">Filters</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {brands.length > 0 && (
            <fieldset className="mb-8">
              <legend className="mb-3 text-small font-bold text-ink-3">Brand</legend>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <Chip
                    key={b.slug}
                    active={(value.brands ?? []).includes(b.slug)}
                    onClick={() => onChange({ ...value, brands: toggle(value.brands, b.slug) })}
                  >
                    {b.name}
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="mb-8">
            <legend className="mb-3 flex w-full items-baseline justify-between text-small font-bold text-ink-3">
              <span>Max budget</span>
              <span className="font-bold text-ink">up to {formatINR(maxPrice)}</span>
            </legend>
            <input
              type="range"
              min={min}
              max={max}
              step={1000}
              value={maxPrice}
              onChange={(e) => {
                const v = Number(e.target.value);
                onChange({ ...value, maxPrice: v >= max ? undefined : v });
              }}
              className="w-full accent-lime-ink"
              aria-label="Maximum price"
            />
            <div className="mt-2 flex justify-between text-micro font-bold tracking-widest text-ink-3">
              <span>{formatINR(min)}</span>
              <span>{formatINR(max)}</span>
            </div>
          </fieldset>

          <fieldset className="mb-8">
            <legend className="mb-3 text-small font-bold text-ink-3">RAM</legend>
            <div className="flex flex-wrap gap-2">
              {RAM_OPTIONS.map((r) => (
                <Chip
                  key={r}
                  active={(value.ram ?? []).includes(r)}
                  onClick={() => onChange({ ...value, ram: toggle(value.ram, r) })}
                >
                  {r} GB
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-8">
            <legend className="mb-3 text-small font-bold text-ink-3">Storage</legend>
            <div className="flex flex-wrap gap-2">
              {STORAGE_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  active={(value.storage ?? []).includes(s)}
                  onClick={() => onChange({ ...value, storage: toggle(value.storage, s) })}
                >
                  {s} GB
                </Chip>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center justify-between py-2">
            <span className="text-small font-bold text-ink">5G only</span>
            <input
              type="checkbox"
              checked={Boolean(value.fiveGOnly)}
              onChange={(e) => onChange({ ...value, fiveGOnly: e.target.checked || undefined })}
              className="h-5 w-5 accent-lime-ink rounded border-line"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 border-t border-line bg-surface px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-5 py-3 text-small font-bold text-ink-3 hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-lime py-4 text-small font-bold text-[#2A2A2A] hover:bg-lime-lo transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            Show {resultCount} {resultCount === 1 ? "phone" : "phones"}
          </button>
        </div>
      </div>
    </div>
  );
}
