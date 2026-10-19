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
import { BRANCHES } from '@/shared/branches';

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
      const section = sectionRef.current;
      const rail = railRef.current;
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', rail);

      // Cards rise in one after another as the section arrives (the 3D phone
      // is fading out above them at the same moment, so the hand-off reads as
      // one move). Opacity/transform only.
      gsap.from(cards.slice(0, 6), {
        y: 56,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: rail, start: 'top 88%', once: true },
      });

      if (window.innerWidth < 768) return; // phones swipe the rail natively

      // Desktop: pin for exactly as long as the rail needs to slide its last
      // card into place, plus a short beat to rest on it.
      const distance = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
      if (distance() <= 0) return;
      gsap.to(rail, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.25}`,
          pin: true,
          // Lenis already smooths the scroll; an extra GSAP lag made the rail
          // trail the page by ~1s and feel out of sync.
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      });
    },
    { scope: sectionRef, dependencies: [phones, reducedMotion] }
  );

  const marqueeText = `0% EMI in 10 minutes ✦ IMEI on your GST bill ✦ Trade-in valued on the spot ✦ ${BRANCHES.length} branches in Surat`;

  return (
    <>
      {/* ✦ Marquee Strip between Chooser & Trending */}
      <div className="w-full bg-white/70 backdrop-blur-sm border-y border-line py-3.5 overflow-hidden select-none z-20 relative shadow-2xs">
        <div className="flex w-max animate-[marquee_25s_linear_infinite] whitespace-nowrap text-xs sm:text-sm font-bold tracking-wider text-ink/80 uppercase">
          <span className="px-4">{marqueeText} ✦ {marqueeText} ✦</span>
          <span className="px-4" aria-hidden="true">{marqueeText} ✦ {marqueeText} ✦</span>
        </div>
      </div>

      {/* One screen tall on desktop, content centred: while pinned, the
          heading and rail sit in the middle with even space above and below
          (the top padding clears the floating nav). */}
      <section
        id="trending"
        data-act="trending"
        ref={sectionRef}
        className="relative z-10 flex flex-col justify-center overflow-hidden py-16 md:h-screen md:min-h-160 md:pb-10 md:pt-28"
      >
        <div className="max-w-site mx-auto px-6 w-full mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-micro font-semibold uppercase text-lime-ink mb-2">
              Hot off the counter
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-ink">
              New arrivals
            </h2>
          </div>
          <p className="text-ink-3 md:text-lg max-w-md">
            Sealed, in stock, and ready across our Surat stores.
          </p>
        </div>

        {/* Horizontal card rail. Its side padding matches the heading's edges
            (centred site width + px-6), so the first card starts under
            "New arrivals" and the last one stops under the copy on the right. */}
        <div
          ref={railRef}
          className="flex gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scroll-smooth py-4 no-scrollbar max-w-full scroll-pl-6 pl-[max(1.5rem,calc((100vw-var(--container-site))/2+1.5rem))]"
        >
          {phones.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              data-card
              className="group shrink-0 snap-start w-70 sm:w-[320px] bg-white border border-line rounded-3xl p-6 shadow-sm hover:shadow-md transition-[box-shadow,translate] duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="relative h-48 w-full mb-6 rounded-2xl bg-paper flex items-center justify-center p-4">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-contain transition-transform duration-500 group-hover:scale-105 p-2"
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
          {/* The right margin: the gap before this spacer plus its width equals
              the left padding. (A right padding isn't counted in a flex row's
              scroll width in every browser; a spacer always is.) */}
          <span aria-hidden className="shrink-0 w-px md:w-[max(0px,calc((100vw-var(--container-site))/2))]" />
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
