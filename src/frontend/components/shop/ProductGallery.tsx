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
        className="relative aspect-square overflow-hidden rounded-lg border border-raised bg-linear-to-br from-base via-raised to-void shadow-sh-2 "
      >
        <span className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-display font-bold uppercase leading-none tracking-tighter text-white/[0.04] sm:text-display">
          {brand}
        </span>
        <div className="pointer-events-none absolute right-1/4 top-0 h-72 w-72 rounded-full bg-teal/10 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-8 h-64 w-64 rounded-full bg-danger/10 blur-[80px]" />

        {current ? (
          <div className="absolute inset-8 sm:inset-12">
            <Image
              src={current.url}
              alt={name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain drop-"
              priority
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-white/40">
            No image
          </div>
        )}

        <div ref={tagRef} className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
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
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-paper transition-all ${
                i === active ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
