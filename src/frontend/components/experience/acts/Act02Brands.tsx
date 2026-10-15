'use client';

import Link from 'next/link';
import { brands } from '@/shared/brands';
import { useExperienceStore } from '@/frontend/lib/experience/store';
import { formatINR } from '@/frontend/lib/phone-experience-data';
import type { PhoneBrand } from '@/shared/phone-catalog';

export type BrandWithCount = PhoneBrand & { count: number; from: number };

export function Act02Brands({ brandData = [] }: { brandData?: BrandWithCount[] }) {
  const activeIndex = useExperienceStore((s) => s.activeBrandIndex);
  const activeBrand = brands[activeIndex] || brands[0];

  return (
    <section
      id="brands"
      data-act="brands"
      className="md:min-h-[230vh] py-16 md:py-0 relative flex flex-col md:items-start items-center px-6 md:mx-auto md:w-full md:max-w-[1360px] md:px-10 overflow-hidden"
    >
      {/* Huge steel-outlined brand name crossfade watermark */}
      <div
        className="hidden md:flex absolute inset-y-0 right-8 pointer-events-none items-center justify-end z-0 select-none transition-all duration-500 opacity-20 text-[11vw] font-black uppercase tracking-tighter text-transparent"
        style={{ WebkitTextStroke: '2px #A8B8C8' }}
      >
        {activeBrand.name}
      </div>

      <div className="md:sticky top-[20vh] w-full md:w-[45%] z-10 flex flex-col gap-4 text-center md:text-left">
        <h2 className="reveal-up text-4xl md:text-6xl font-bold tracking-tight text-ink mb-4">
          Brands we stock
        </h2>

        {/* Eleven brands: two compact columns so the list fits beside the phone. */}
        <div className="reveal-stagger grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {brands.map((brand, i) => {
            const data = brandData.find((b) => b.slug === brand.slug);
            const count = data?.count || 0;
            const fromPrice = data?.from && isFinite(data.from) ? data.from : null;
            const isActive = i === activeIndex;

            return (
              <Link
                key={brand.slug}
                href={brand.href}
                className={`flex flex-col items-start gap-0.5 px-5 py-3 rounded-2xl transition-all duration-300 text-ink border scale-100 ${
                  isActive
                    ? 'bg-white shadow-md border-lime scale-102 text-ink font-bold'
                    : 'bg-white/60 border-line hover:border-ink/30 text-ink-2 hover:text-ink'
                }`}
              >
                <span className="font-extrabold text-lg leading-tight">{brand.name}</span>
                <span className="text-xs font-medium text-ink-3">
                  {count > 0
                    ? `${count} ${count === 1 ? "model" : "models"}${fromPrice ? `, from ${formatINR(fromPrice)}` : ""}`
                    : "Ask in store"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
