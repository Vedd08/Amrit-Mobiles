"use client";

import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/frontend/lib/motion";
import Image from "next/image";
import { SHOP_TEL_LINK } from "@/frontend/lib/phone-experience-data";

/**
 * The storefront hero.
 *
 * Rendered in two places and it must read as full, edge-to-edge in both:
 *   - /shop        — the page's own hero, in normal flow under the header.
 *   - the homepage — transformed onto the phone's glass at the end of the 3D
 *                    fly-through (HeroSection's #hScreen). When the device's
 *                    screen "becomes the page", this is what it becomes, so it
 *                    has to land on something complete, not a floating card in
 *                    a sea of white.
 *
 * min-h-screen + a vertical flex layout is what carries it across both: the
 * copy block sits centred, the counter-facts strip is pinned to the bottom
 * edge, and nothing is allowed to leave an empty band.
 */
export function TinkerScrollHero({ totalProducts = 42 }: { totalProducts?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion()) return;

      gsap.to(".phlox-float", {
        y: -16,
        duration: 3.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.from(".phlox-anim", {
        y: 22,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "power3.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[60vh] w-full flex-col overflow-hidden bg-paper select-none"
    >
      {/* Studio grid, faded toward the edges — gives the white a surface */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(35,36,33,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(35,36,33,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(75% 65% at 60% 40%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(75% 65% at 60% 40%, #000 30%, transparent 100%)",
        }}
      />

      {/* Main content — centred, fills the height between top and the strip */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pt-24 pb-10 sm:px-8 lg:px-10 lg:pt-28">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          {/* Copy */}
          <div className="max-w-xl">
            <div className="phlox-anim flex items-center gap-3">
              <span className="h-px w-9 bg-lime" />
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
              </span>
              <span className="text-micro font-semibold uppercase text-ink-4">
                Open counter · 6 branches in Surat
              </span>
            </div>

            <h1 className="mt-5 font-bold text-ink text-display phlox-anim">
              The box
              <br />
              <span className="text-lime-ink">opens here.</span>
            </h1>

            <p className="phlox-anim mt-5 max-w-md text-body sm:text-body font-medium leading-relaxed text-ink-3">
              Every phone unsealed across the counter, IMEI matched to a printed GST bill, and 0% EMI
              approved in ten minutes flat.
            </p>

            <div className="phlox-anim mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/category/phones"
                className="inline-flex items-center gap-2 rounded-lg bg-lime px-8 py-4 text-small font-bold text-ink transition-all duration-300 hover:bg-lime-ink hover:-translate-y-0.5 active:translate-y-0"
              >
                Shop phones
                <span aria-hidden>→</span>
              </Link>
              <a
                href={SHOP_TEL_LINK}
                className="inline-flex items-center rounded-lg border-2 border-ink-4 px-7 py-3.5 text-small font-medium text-ink transition-colors duration-300 hover:border-lime-ink hover:bg-white/70"
              >
                Call the shop
              </a>
            </div>

            <div className="phlox-anim mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-micro font-bold uppercase tracking-wide text-ink/70">
              <span>Sealed brand stock</span>
              <span className="h-3 w-px bg-ink/20" />
              <span>Free screen guard fitted</span>
              <span className="h-3 w-px bg-ink/20" />
              <span className="text-lime-ink">0% EMI</span>
            </div>
          </div>

          {/* Flagship handset & Stock strip */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="phlox-float relative flex flex-col items-center">
              <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-[440px] lg:w-[440px]">
                <Image 
                  src="/images/hero_phone_box_1785511689142.png" 
                  alt="Sealed phone box on counter" 
                  sizes="(max-width: 768px) 100vw, 440px" 
                  fill 
                  className="object-contain drop-shadow-2xl" 
                  priority 
                />
              </div>

              {/* Spec pills orbiting the device */}
              <span className="absolute -left-6 top-6 hidden rounded-full border border-line bg-white/90 px-3.5 py-1.5 text-micro font-bold uppercase tracking-wider text-ink shadow-sm backdrop-blur-md sm:block">
                48MP · Titanium
              </span>
              <span className="absolute -right-2 top-1/4 hidden rounded-full border border-line bg-white/90 px-3.5 py-1.5 text-micro font-bold uppercase tracking-wider text-lime-ink shadow-sm backdrop-blur-md sm:block">
                IMEI on the bill
              </span>

              {/* Live stock strip */}
              <div className="mt-8 flex items-center gap-4 bg-white/80 backdrop-blur-md border border-line rounded-lg px-4 py-2.5 shadow-sm relative z-10">
                <div className="flex -space-x-2">
                  {['original_flagship_phone.png', 'hero_phone_box_1785511689142.png'].map((img, i) => (
                    <div key={i} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-paper">
                      <Image 
                        src={`/images/${img}`} 
                        alt="Phone in stock"
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-ink">
                  {totalProducts} products <span className="text-ink-4 font-medium">in stock today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Counter facts */}
      <div className="relative z-10 grid w-full grid-cols-2 border-t border-line bg-transparent sm:grid-cols-4">
        {[
          { v: "12,000+", l: "Phones sold" },
          { v: "0%", l: "EMI · 40+ models" },
          { v: "10 min", l: "Approval" },
          { v: "4.9★", l: "Google rating" },
        ].map((s, i) => (
          <div 
            key={s.l} 
            className={`px-5 py-4 sm:px-8 sm:py-5 bg-transparent border-b sm:border-b-0 border-r border-line ${i % 2 === 1 ? 'border-r-0 sm:border-r' : ''} ${i === 3 ? 'sm:border-r-0' : ''}`}
          >
            <div className="text-h3 font-bold tabular-nums leading-none text-ink">
              {s.v}
            </div>
            <div className="mt-1.5 text-micro font-medium uppercase leading-tight text-ink-4">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
