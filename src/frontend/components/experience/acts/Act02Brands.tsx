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
      className="md:min-h-[150vh] py-16 md:py-0 relative flex flex-col md:items-start items-center px-6 md:mx-auto md:w-full md:max-w-[1360px] md:px-10 overflow-hidden"
    >
      {/* Huge steel-outlined brand name crossfade watermark */}
      <div
        className="hidden md:flex absolute inset-y-0 right-8 pointer-events-none items-center justify-end z-0 select-none transition-all duration-500 opacity-20 text-[11vw] font-black uppercase tracking-tighter text-transparent"
        style={{ WebkitTextStroke: '2px #A8B8C8' }}
      >
        {activeBrand.name}
      </div>

      <div className="md:sticky top-[20vh] w-full md:w-[45%] z-10 flex flex-col gap-4 text-center md:text-left">
        <h2 className="reveal-up text-4xl md:text-6xl font-bold tracking-tight text-ink mb-6">
          Brands we stock
        </h2>

        <div className="reveal-stagger flex flex-col gap-3">
          {brands.map((brand, i) => {
            const data = brandData.find((b) => b.slug === brand.slug);
            const count = data?.count || 0;
            const fromPrice = data?.from && isFinite(data.from) ? data.from : null;
            const isActive = i === activeIndex;

            return (
              <Link
                key={brand.slug}
                href={brand.href}
                className={`flex items-center justify-between p-4 px-6 rounded-2xl transition-all duration-300 text-ink border scale-100 ${
                  isActive
                    ? 'bg-white shadow-md border-lime scale-102 text-ink font-bold'
                    : 'bg-white/60 border-line hover:border-ink/30 text-ink-2 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-xl">{brand.name}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  {count > 0 && (
                    <span className="text-ink-3 font-medium">{count} models</span>
                  )}
                  {fromPrice && (
                    <span className="bg-paper px-3 py-1 rounded-full text-xs font-bold text-ink border border-line">
                      from {formatINR(fromPrice)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
