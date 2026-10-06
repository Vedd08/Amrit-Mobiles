"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PhoneBrand } from "@/shared/phone-catalog";
import { SectionHeader } from "./SectionHeader";
import { BrandMark } from "./BrandMark";

export type BrandTile = PhoneBrand & { count: number; from: number; image: string | null };

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/**
 * Shop by brand, as a character-select rail.
 *
 * Each brand gets a card in its own accent colour with its top handset
 * standing proud of the card's top edge. The overhang is the whole point —
 * it puts the product in front of the colour block instead of inside a box,
 * which is what stops a brand list reading as a wall of words. The previous
 * version printed every brand's name twice (wordmark plus label) on a flat
 * white tile, and nine of the eleven "logos" were just the name set in a
 * different weight.
 *
 * Colours come from PHONE_BRANDS[].accent, which already existed. Lighter and
 * darker shades are derived with color-mix rather than hand-picked per brand,
 * so adding a brand needs one accent and nothing else.
 */
export function BrandGrid({ brands }: { brands: BrandTile[] }) {
  const railRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    // One card plus its gap, so a click always lands cleanly on the next card.
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : 260;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  const arrow = (dir: 1 | -1, disabled: boolean, label: string) => (
    <button
      type="button"
      onClick={() => nudge(dir)}
      disabled={disabled}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink shadow-sh-1 transition-colors hover:border-lime-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d={dir === -1 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <section id="brands" className="scroll-mt-20 border-t border-line bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <SectionHeader
            title="Shop by brand"
            sub="Pick a maker to see only its phones, with prices and filters for that shelf."
          />
          <div className="mb-1 hidden shrink-0 items-center gap-2 sm:flex">
            {arrow(-1, atStart, "Previous brands")}
            {arrow(1, atEnd, "Next brands")}
          </div>
        </div>

        <ul
          ref={railRef}
          onScroll={sync}
          className="-mx-4 flex gap-5 overflow-x-auto px-4 pt-16 pb-8 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {brands.map((b) => (
              <li key={b.slug} className="shrink-0 snap-start">
                <Link
                  href={`/phones/${b.slug}`}
                  className="group relative block w-[210px] outline-none sm:w-[236px] hover:shadow-sh-2 rounded-lg transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
                >
                  {/* The handset, standing proud of the card's top edge. */}
                  <span className="absolute inset-x-6 -top-14 z-10 block h-36 overflow-hidden rounded-lg bg-surface shadow-sh-1 border border-line transition-transform duration-300 group-hover:-translate-y-1.5">
                    {b.image ? (
                      <Image src={b.image} alt="" fill sizes="236px" className="object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-micro font-semibold text-ink-3">
                        {b.name}
                      </span>
                    )}
                  </span>

                  <span className="relative flex h-[268px] flex-col justify-end rounded-lg p-5 pt-28 bg-surface border border-line transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
                    <BrandMark slug={b.slug} className="mb-2 text-ink text-xl" />
                    <span className="mt-auto block text-micro font-medium leading-snug text-ink-3">{b.blurb}</span>
                    <span className="mt-3 flex items-baseline gap-2 border-t border-line pt-3">
                      <span className="text-micro text-ink-3">
                        {b.count} {b.count === 1 ? "phone" : "phones"}
                      </span>
                      <span className="ml-auto text-small font-bold tabular-nums text-ink">
                        from {inr(b.from)}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}

          <li className="shrink-0">
            <Link
              href="/phones/all"
              className="group flex h-[268px] w-[164px] flex-col justify-end rounded-lg border border-dashed border-line bg-surface p-5 transition-colors hover:border-lime-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            >
              <span className="text-body-lg font-bold leading-tight text-ink group-hover:text-ink transition-colors">
                All phones
              </span>
              <span className="mt-2 text-micro text-ink-3 uppercase tracking-widest group-hover:text-ink">Browse all →</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
