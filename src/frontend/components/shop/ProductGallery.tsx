"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/frontend/lib/motion";
import { PriceTag } from "@/frontend/components/shop/PriceTag";

gsap.registerPlugin(ScrollTrigger);

export function ProductGallery({
  images,
  name,
  brand,
  price,
  mrp,
  discount,
}: {
  images: { id: string; url: string }[];
  name: string;
  brand: string;
  price: number;
  mrp: number | null;
  discount: number | null;
}) {
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!stageRef.current || prefersReducedMotion()) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: stageRef.current, start: "top 80%", once: true },
      });
      tl.fromTo(
        stageRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }
      );
      if (tagRef.current) {
        tl.fromTo(
          tagRef.current,
          { opacity: 0, scale: 0.6, rotate: -20 },
          { opacity: 1, scale: 1, rotate: -3, duration: 0.55, ease: "back.out(1.8)" },
          "-=0.3"
        );
      }
    },
    { scope: stageRef }
  );

  const current = images[active] ?? images[0];

  return (
    <div>
      <div
        ref={stageRef}
        className="relative aspect-square overflow-hidden rounded-lg border border-line bg-linear-to-br from-surface via-paper to-paper-2 shadow-sh-1"
      >
        <span className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-display font-bold uppercase leading-none tracking-tighter text-ink/[0.04] sm:text-display">
          {brand}
        </span>
        <div className="pointer-events-none absolute right-1/4 top-0 h-72 w-72 rounded-full bg-lime/15 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-8 h-64 w-64 rounded-full bg-teal/10 blur-[80px]" />

        {current ? (
          // The first photo is a cut-out and gets room to breathe; the
          // brand's feature slides are square artwork and fill the stage.
          <div className={`absolute ${active === 0 ? "inset-6 sm:inset-10" : "inset-0"}`}>
            <Image
              src={current.url}
              alt={active === 0 ? name : `${name}, photo ${active + 1}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain"
              priority={active === 0}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-ink-3">
            No image
          </div>
        )}

        {/* Hidden (not unmounted) on the feature slides, whose artwork it would
            cover, and on phones, where it sat on the photo and the price is
            just below anyway. */}
        <div ref={tagRef} className={`absolute bottom-6 left-6 max-sm:hidden sm:bottom-8 sm:left-8 ${active === 0 ? "" : "invisible"}`}>
          <PriceTag price={price} mrp={mrp} discount={discount} />
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-surface transition-all ${
                i === active ? "border-ink" : "border-line opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
