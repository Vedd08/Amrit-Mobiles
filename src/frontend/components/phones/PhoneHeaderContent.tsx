"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { HeroSearch } from "./HeroSearch";
import { HeroAmbient } from "./HeroAmbient";
import { PhoneShowcase, type PhoneHeroStats } from "./PhoneShowcase";
import { SearchIcon } from "@/frontend/components/icons";
import { SUGGESTIONS } from "@/shared/search-suggestions";
import { useReducedMotion } from "@/frontend/lib/use-reduced-motion";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";

export type { PhoneHeroStats };

/**
 * The /phones hero, shared by three renderers that must stay pixel-identical:
 * the real /phones page, the homepage's "enter the store" portal (its last
 * frame IS this hero, then the app navigates here), and phones/loading.tsx.
 * Split layout: copy + search on the left, the live PhoneShowcase on the right.
 */
export function PhoneHeaderContent({
  as = "h1",
  interactiveSearch = true,
  stats,
  showcase = [],
  children,
}: {
  as?: "h1" | "h2";
  interactiveSearch?: boolean;
  stats?: PhoneHeroStats;
  showcase?: ProductCardData[];
  children?: ReactNode;
}) {
  const HeadingTag = as;
  const containerRef = useRef<HTMLElement>(null);
  const arrivalBurstRef = useRef<HTMLDivElement>(null);
  const arrivalRingRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  // Read the portal flag once per mount. A ref survives React dev mode's
  // double-run of effects, which otherwise consumed the flag on the first run
  // and replayed the "normal visit" entrance on the second.
  const arrivedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (reducedMotion || !interactiveSearch) return;

    if (arrivedRef.current === null) {
      try {
        arrivedRef.current = sessionStorage.getItem("amrit:arrived-from-portal") === "1";
        sessionStorage.removeItem("amrit:arrived-from-portal");
      } catch {
        arrivedRef.current = false;
      }
    }

    if (arrivedRef.current) {
      // Swallow the tail of the scroll gesture that triggered the navigation
      // (trackpad / wheel momentum, touch fling) so it can't scroll /phones.
      const block = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      const opts: AddEventListenerOptions = { capture: true, passive: false };
      window.scrollTo(0, 0);
      window.addEventListener("wheel", block, opts);
      window.addEventListener("touchmove", block, opts);
      const release = window.setTimeout(() => {
        window.removeEventListener("wheel", block, opts);
        window.removeEventListener("touchmove", block, opts);
      }, 900);

      // Arriving from the homepage dive: everything is already on screen (the
      // portal showed it), so only the warp settles — nothing re-enters.
      const tl = gsap.timeline();
      if (arrivalBurstRef.current) {
        tl.fromTo(arrivalBurstRef.current, { scale: 1.8, opacity: 0.6 }, { scale: 1.1, opacity: 0, duration: 0.7, ease: "power2.out" }, 0);
      }
      if (arrivalRingRef.current) {
        tl.fromTo(arrivalRingRef.current, { scale: 2, opacity: 1 }, { scale: 0.8, opacity: 0, duration: 0.6, ease: "power3.out" }, 0);
      }
      return () => {
        tl.kill();
        window.clearTimeout(release);
        window.removeEventListener("wheel", block, opts);
        window.removeEventListener("touchmove", block, opts);
      };
    }

    // Normal visit: copy staggers up, phones fly in and fan out.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-stagger-item",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power2.out", delay: 0.05 }
      );
      gsap.from(".hero-showcase-phone", {
        y: 160,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "expo.out",
        delay: 0.15,
        clearProps: "opacity",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [reducedMotion, interactiveSearch]);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-paper pb-12 pt-10 lg:flex lg:min-h-[78svh] lg:items-center lg:pb-14 lg:pt-6"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          ref={arrivalBurstRef}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, rgba(146,195,24,0) 0deg 5deg, rgba(146,195,24,0.55) 5deg 5.7deg, rgba(85,194,205,0) 5.7deg 9deg, rgba(85,194,205,0.45) 9deg 9.4deg, rgba(168,184,200,0) 9.4deg 13deg)",
            maskImage: "radial-gradient(circle at 50% 50%, transparent 12%, #000 30%, #000 45%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 12%, #000 30%, #000 45%, transparent 70%)",
          }}
        />
        <div
          ref={arrivalRingRef}
          className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{ border: "4px solid var(--color-lime)", boxShadow: "0 0 40px -8px var(--color-lime)" }}
        />
        <HeroAmbient />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-6 lg:px-8">
        {/* Copy + search */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="hero-stagger-item mb-5 flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 text-micro font-bold uppercase tracking-widest text-ink-2 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-lime motion-safe:animate-pulse" />
            New phones in Surat
          </p>

          <HeadingTag className="mb-5 text-[44px] font-extrabold leading-[0.95] tracking-tighter text-ink sm:text-6xl xl:text-7xl">
            Find your
            <br />
            <span className="animate-hero-shimmer bg-[linear-gradient(to_right,var(--color-lime-ink),var(--color-lime),var(--color-teal),var(--color-lime-ink))] bg-clip-text text-transparent">
              perfect phone
            </span>
          </HeadingTag>

          <p className="hero-stagger-item mb-8 max-w-[42ch] text-body leading-relaxed text-ink-3 md:text-body-lg">
            Every major brand, genuine sealed stock, and EMI sorted at the counter in ten minutes.
          </p>

          {interactiveSearch ? (
            <div className="hero-stagger-item flex w-full justify-center lg:justify-start">
              <HeroSearch />
            </div>
          ) : (
            <div className="pointer-events-none w-full max-w-xl">
              <div className="relative flex w-full items-center rounded-full border border-line bg-surface p-1.5 shadow-sh-1">
                <div className="pl-4 pr-2 text-ink-3">
                  <SearchIcon className="h-5 w-5" />
                </div>
                <div className="flex h-12 min-w-0 flex-1 items-center text-body font-medium text-ink-4">
                  Search phones, brands, models…
                </div>
                <div className="ml-2 flex h-12 items-center justify-center rounded-full bg-lime px-6 font-bold text-[#2A2A2A]">
                  Search
                </div>
              </div>
              <div className="mt-4 hidden flex-wrap items-center justify-center gap-2 sm:flex lg:justify-start">
                <span className="mr-1 text-micro font-bold uppercase tracking-widest text-ink-3">Popular:</span>
                {SUGGESTIONS.map((s) => (
                  <div key={s} className="rounded-full border border-line bg-surface px-3 py-1.5 text-micro font-medium text-ink">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="hero-stagger-item w-full">{children}</div>
        </div>

        {/* Live phone showcase */}
        <PhoneShowcase phones={showcase} stats={stats} interactive={interactiveSearch} />
      </div>

      <style>{`
        @keyframes hero-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-hero-shimmer {
          background-size: 200% auto;
          animation: hero-shimmer 6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-hero-shimmer { animation: none; }
        }
      `}</style>
    </section>
  );
}
