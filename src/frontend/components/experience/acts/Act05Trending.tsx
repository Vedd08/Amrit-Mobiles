'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatINR } from '@/frontend/lib/phone-experience-data';
import type { ProductCardData } from '@/frontend/components/shop/ProductCard';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function Act05Trending({ phones }: { phones: ProductCardData[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || !railRef.current || reducedMotion) return;
      if (window.innerWidth < 768) return;

      const rail = railRef.current;
      const totalScroll = rail.scrollWidth - rail.clientWidth;

      if (totalScroll > 0) {
        gsap.to(rail, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${totalScroll + 200}`,
            pin: true,
            // Lenis already smooths the scroll; an extra GSAP lag made the rail
            // trail the page by ~1s and feel out of sync.
            scrub: true,
            invalidateOnRefresh: true,
            refreshPriority: 1,
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [phones, reducedMotion] }
  );

  const marqueeText = "0% EMI in 10 minutes ✦ IMEI on your GST bill ✦ Trade-in valued on the spot ✦ 6 branches in Surat";

  return (
    <>
      {/* ✦ Marquee Strip between Chooser & Trending */}
      <div className="w-full bg-white/70 backdrop-blur-sm border-y border-line py-3.5 overflow-hidden select-none z-20 relative shadow-2xs">
        <div className="flex w-max animate-[marquee_25s_linear_infinite] whitespace-nowrap text-xs sm:text-sm font-bold tracking-wider text-ink/80 uppercase">
          <span className="px-4">{marqueeText} ✦ {marqueeText} ✦</span>
          <span className="px-4" aria-hidden="true">{marqueeText} ✦ {marqueeText} ✦</span>
        </div>
      </div>

      <section
        id="trending"
        data-act="trending"
        ref={sectionRef}
        className="relative md:min-h-[120vh] py-16 md:py-24 z-10 flex flex-col justify-center overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 w-full mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-micro font-semibold uppercase text-lime-ink mb-2">
              Hot off the counter
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-ink">
              New arrivals
            </h2>
          </div>
          <p className="text-ink-3 text-base md:text-lg max-w-md">
            Sealed, in stock, and ready across our Surat stores.
          </p>
        </div>

        {/* Horizontal Card Rail */}
        <div
          ref={railRef}
          className="flex gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scroll-smooth px-6 md:px-12 py-4 no-scrollbar max-w-full"
        >
          {phones.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group shrink-0 snap-start w-[280px] sm:w-[320px] bg-white border border-line rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="relative h-48 w-full mb-6 rounded-2xl bg-paper flex items-center justify-center p-4">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-contain transition-transform duration-500 group-hover:scale-105 p-2"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-line flex items-center justify-center text-ink-4">
                    📱
                  </div>
                )}
                {p.stock > 0 && (
                  <span className="absolute top-3 right-3 bg-lime text-[#2A2A2A] text-micro font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    In Stock
                  </span>
                )}
              </div>

              <div>
                <span className="text-micro font-bold uppercase text-ink-3 tracking-widest">
                  {p.brand}
                </span>
                <h3 className="text-xl font-bold text-ink mt-1 group-hover:text-lime-ink transition-colors line-clamp-1">
                  {p.name}
                </h3>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                <div>
                  <span className="text-micro text-ink-4 block font-medium">Counter price</span>
                  <span className="text-lg font-extrabold text-ink tabular-nums">
                    {formatINR(p.price)}
                  </span>
                </div>
                <span className="w-10 h-10 rounded-full bg-paper group-hover:bg-lime text-ink group-hover:text-[#2A2A2A] flex items-center justify-center font-bold text-lg transition-colors">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
