'use client';

import Link from 'next/link';
import { PHONE_CATEGORIES } from '@/shared/phone-catalog';
import { formatINR } from '@/frontend/lib/phone-experience-data';
import type { ProductCardData } from '@/frontend/components/shop/ProductCard';

export function Act04Chooser({ allPhones = [] }: { allPhones?: ProductCardData[] }) {
  // Only render categories that have at least 1 matching phone in the catalogue
  const visibleCategories = PHONE_CATEGORIES.map((cat) => {
    const matching = allPhones.filter(cat.match);
    const count = matching.length;
    const minPrice = count > 0 ? Math.min(...matching.map((p) => p.price)) : null;
    return { cat, count, minPrice };
  }).filter((item) => item.count > 0);

  return (
    <section
      id="chooser"
      data-act="chooser"
      className="md:min-h-[100vh] py-16 md:py-0 relative px-6 md:mx-auto md:w-full md:max-w-[1360px] md:px-10 flex flex-col md:items-start items-center justify-center"
    >
      <div className="text-center md:text-left z-10 w-full md:w-[48%]">
        <h2 className="reveal-up text-4xl md:text-6xl font-bold tracking-tight text-ink mb-10">
          Find your next phone
        </h2>

        <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleCategories.map(({ cat, count, minPrice }) => (
            <Link
              key={cat.slug}
              href={`/phones/category/${cat.slug}`}
              className="group relative bg-white border border-line p-5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-lime flex flex-col justify-between overflow-hidden"
            >
              <div>
                <h3 className="font-extrabold text-xl text-ink group-hover:text-lime-ink transition-colors">
                  {cat.name}
                </h3>
                <p className="text-ink-3 text-xs mt-1 font-medium line-clamp-1">
                  {cat.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-ink-4">{count} models</span>
                {minPrice && (
                  <span className="text-ink font-bold tabular-nums">
                    from {formatINR(minPrice)}
                  </span>
                )}
              </div>

              {/* Animated Lime Underline on Hover */}
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-lime transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {/* Trade-in Card */}
          <Link
            href="/trade-in"
            className="group relative bg-lime/10 border border-lime p-5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md flex flex-col justify-between overflow-hidden sm:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-micro font-bold uppercase tracking-wider text-lime-ink block">
                  Instant Appraisal
                </span>
                <h3 className="font-extrabold text-xl text-ink">
                  Trade in your old phone
                </h3>
              </div>
              <span className="w-10 h-10 rounded-full bg-lime text-[#2A2A2A] font-bold flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                →
              </span>
            </div>
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-lime transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>
      </div>
    </section>
  );
}
