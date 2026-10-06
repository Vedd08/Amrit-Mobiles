"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { prefersReducedMotion } from "@/frontend/lib/motion";

interface MobileDeviceCardProps {
  product: ProductCardData;
  onCompareToggle?: (product: ProductCardData) => void;
  isCompared?: boolean;
}

export function MobileDeviceCard({ product, onCompareToggle, isCompared = false }: MobileDeviceCardProps) {
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const compareBtnRef = useRef<HTMLButtonElement>(null);
  const wasComparedRef = useRef(isCompared);

  // Tactile "pop" on any small control click — matches the filter pills
  // on the catalog page so the whole shelf feels consistently interactive.
  function popClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (prefersReducedMotion()) return;
    gsap.fromTo(e.currentTarget, { scale: 0.82 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
  }

  // Extra flash when a device gets added to compare, since that action
  // also affects the floating dock elsewhere on the page.
  useEffect(() => {
    if (wasComparedRef.current === isCompared) return;
    wasComparedRef.current = isCompared;
    if (isCompared && compareBtnRef.current && !prefersReducedMotion()) {
      gsap.fromTo(compareBtnRef.current, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
    }
  }, [isCompared]);

  // Subtle pointer-tilt, matching the hero's product-shot physics —
  // premium showcase feel on hover instead of a flat card.
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return;
    const el = cardRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const quickRotY = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3.out" });
      const quickRotX = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3.out" });

      const handleMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        quickRotY(px * 8);
        quickRotX(-py * 8);
      };
      const handleLeave = () => {
        quickRotY(0);
        quickRotX(0);
      };

      el.addEventListener("pointermove", handleMove);
      el.addEventListener("pointerleave", handleLeave);

      return () => {
        el.removeEventListener("pointermove", handleMove);
        el.removeEventListener("pointerleave", handleLeave);
      };
    }, el);

    return () => ctx.revert();
  }, []);

  // Parse specs if available
  let parsedSpecs: Record<string, string> = {};
  if (product.specs) {
    try {
      parsedSpecs = JSON.parse(product.specs);
    } catch {
      parsedSpecs = {};
    }
  }

  // Generate color swatches based on brand/color spec
  const colorSpec = parsedSpecs["Color"] || "Natural Black";
  const defaultColors = [
    { name: colorSpec, hex: "rgb(26, 26, 29)" },
    { name: "Titanium Silver", hex: "rgb(216, 219, 223)" },
    { name: "Pacific Blue", hex: "rgb(31, 59, 87)" },
    { name: "Deep Gold", hex: "rgb(212, 175, 55)" },
  ];
  // Cut down swatches to 2-3 per phone for realism
  const swatches = defaultColors.slice(0, 3);

  // Calculate savings and counter paperless EMI
  const discount = product.mrp && product.mrp > product.price ? product.mrp - product.price : 0;
  const monthlyEmi = Math.round(product.price / 12);

  // Extract key specification feature pills
  const ram = parsedSpecs["RAM"] || (product.name.includes("Pro") || product.name.includes("S24") ? "12GB RAM" : "8GB RAM");
  const storage = parsedSpecs["Storage"] || (product.price > 50000 ? "256GB NVMe" : "128GB ROM");

  return (
    <div style={{ perspective: 1000 }}>
    <div
      ref={cardRef}
      className="group flex flex-col justify-between bg-white border border-line rounded-lg overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-ink hover:relative"
      style={{ willChange: "transform" }}
    >
      
      {/* Top Badges Bar */}
      <div className="p-4 pb-0 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-ink-hi text-raised font-extrabold text-micro uppercase tracking-wider border border-line">
            {product.brand === "Apple" ? "Apple Authorized" : `${product.brand} Flagship`}
          </span>
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-lime-ink/15 text-ink-3 font-bold text-micro tracking-wider border border-lime-ink/20">
              SAVE {formatINR(discount)}
            </span>
          )}
        </div>

        {/* Compare Specs Checkbox Toggle */}
        {onCompareToggle && (
          <button
            ref={compareBtnRef}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              popClick(e);
              onCompareToggle(product);
            }}
            title="Add device to side-by-side spec comparison"
            className={`px-2.5 py-1 rounded-full text-micro font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 border ${
              isCompared
                ? "bg-ink text-white border-ink shadow-sm"
                : "bg-white text-ink-3 border-line hover:border-ink hover:text-ink"
            }`}
          >
            <span className={`w-2 h-2 rounded-sm border ${isCompared ? "bg-lime-ink border-lime-ink" : "border-neutral-400"}`} />
            <span>Compare</span>
          </button>
        )}
      </div>

      {/* Main Product Link & Preview */}
      <Link href={`/product/${product.slug}`} className="block px-6 pt-4 pb-3 flex-1 flex flex-col">
        {/* Image Container with Apple Studio Lighting Feel */}
        <div className="relative aspect-square w-full rounded-lg bg-linear-to-b from-white via-paper to-ink-hi border border-ink-hi flex items-center justify-center p-4 mb-4 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-4 drop-transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-center p-6 text-ink-3 text-xs font-bold">
              [ Studio Image Loading... ]
            </div>
          )}
          {/* Subtle In-Stock Shelf Indicator */}
          <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-line text-micro font-bold text-raised flex items-center gap-1 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-ink" />
            <span>Surat Counter In-Stock</span>
          </div>
        </div>

        {/* Color Finish Swatches Selector */}
        <div className="flex items-center gap-1.5 mb-2" onClick={(e) => e.preventDefault()}>
          <span className="text-micro font-bold text-ink-3 mr-1 uppercase">Finish:</span>
          {swatches.map((swatch, idx) => (
            <button
              key={swatch.name}
              onClick={(e) => { popClick(e); setActiveColorIdx(idx); }}
              title={swatch.name}
              className={`w-4 h-4 rounded-full border border-neutral-300 transition-all ${
                activeColorIdx === idx ? "ring-2 ring-offset-2 ring-ink scale-110" : "opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: swatch.hex }}
            />
          ))}
          <span className="text-micro font-extrabold text-raised ml-1.5 truncate">
            {swatches[activeColorIdx]?.name}
          </span>
        </div>

        {/* Hardware Title */}
        <h3 className="text-base font-bold text-ink group-hover:text-danger transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Technical Specification Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-3">
          <span className="px-2 py-0.5 rounded-md bg-paper-2 text-ink-3 text-micro font-extrabold border border-line">
            5G Dual SIM
          </span>
          <span className="px-2 py-0.5 rounded-md bg-paper-2 text-ink-3 text-micro font-extrabold border border-line">
            {ram}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-paper-2 text-ink-3 text-micro font-extrabold border border-line">
            {storage}
          </span>
        </div>

        {/* Short hardware text summary */}
        {product.description && (
          <p className="text-micro font-medium text-ink-3 line-clamp-2 mt-auto leading-relaxed">
            {product.description}
          </p>
        )}
      </Link>

      {/* Financial Breakdown & Actions Footer */}
      <div className="px-6 pt-3 pb-5 border-t border-ink-hi bg-white">
        <div className="flex items-baseline justify-between mb-1.5">
          <div>
            <span className="text-xs font-bold text-ink-3 uppercase block leading-none mb-1">Counter Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-ink">
                {formatINR(product.price)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-xs text-ink-3 font-extrabold line-through decoration-danger/60">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-micro font-bold text-ink-3 block uppercase leading-none mb-1">0% Counter EMI</span>
            <span className="text-xs font-bold text-ink-3 bg-lime-ink/10 border border-lime-ink/25 px-2.5 py-1 rounded-full inline-block shadow-2xs">
              {formatINR(monthlyEmi)}/mo*
            </span>
          </div>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="mt-3 w-full rounded-lg bg-ink group-hover:bg-danger text-white py-2.5 px-4 text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-2xs group-hover:shadow-sh-1 "
        >
          <span>Check Surat Counter Offer</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

    </div>
    </div>
  );
}
