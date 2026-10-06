"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/frontend/lib/motion";
import { formatINR } from "@/frontend/lib/phone-experience-data";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sticky persistent buy bar for mobile — appears once the main buy panel has
 * scrolled out of view above, so "Buy now" stays reachable while browsing
 * specs further down the page. Hidden again once scrolled back up to it.
 */
export function MobileBuyBar({
  name,
  image,
  price,
  targetId,
}: {
  name: string;
  image: string | null;
  price: number;
  targetId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    gsap.set(ref.current, { yPercent: 100 });
    if (prefersReducedMotion()) return;

    ScrollTrigger.create({
      trigger: `#${targetId}`,
      start: "bottom top",
      onEnter: () => gsap.to(ref.current, { yPercent: 0, duration: 0.3, ease: "power2.out" }),
      onLeaveBack: () => gsap.to(ref.current, { yPercent: 100, duration: 0.3, ease: "power2.in" }),
    });
  }, []);

  function scrollToBuy() {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-paper">
          {image && <Image src={image} alt="" fill sizes="44px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-ink">{name}</p>
          <p className="text-sm font-bold text-ink">{formatINR(price)}</p>
        </div>
        <button
          type="button"
          onClick={scrollToBuy}
          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
