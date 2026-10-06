"use client";

import React from "react";
import Link from "next/link";
import { ShieldIcon } from "./icons";

export function AuthorizedBrandPartners() {
  const brands = [
    {
      name: "Apple",
      tagline: "iPhone & iPad Series",
      color: "hover:border-void hover:",
      badgeColor: "bg-neutral-900 text-white",
      logo: (
        <svg className="w-9 h-9 text-ink transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.35c.64-.78 1.08-1.87.96-2.95-.92.04-2.04.62-2.7 1.39-.58.67-1.1 1.77-.96 2.84 1.03.08 2.06-.5 2.7-1.28" />
        </svg>
      ),
    },
    {
      name: "Samsung",
      tagline: "Galaxy S & Fold Ultra",
      color: "hover:border-ink-3 hover:shadow-sh-1 ",
      badgeColor: "bg-ink-3 text-white",
      logo: (
        <div className="flex items-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
          <span className="text-2xl font-bold tracking-wider text-ink-3 uppercase font-sans">SAMSUNG</span>
          <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
        </div>
      ),
    },
    {
      name: "OnePlus",
      tagline: "Never Settle Flagship",
      color: "hover:border-danger hover:shadow-sh-1 ",
      badgeColor: "bg-danger text-white",
      logo: (
        <div className="flex items-center gap-2 transition-transform duration-300 group-hover:scale-110">
          <div className="h-9 w-9 bg-danger rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm border border-red-400">
            1+
          </div>
          <span className="text-xl font-bold text-ink ">OnePlus</span>
        </div>
      ),
    },
    {
      name: "Xiaomi",
      tagline: "Leica Camera Excellence",
      color: "hover:border-danger hover:shadow-sh-1 ",
      badgeColor: "bg-danger text-white",
      logo: (
        <div className="flex items-center gap-2.5 transition-transform duration-300 group-hover:scale-110">
          <div className="h-9 w-9 bg-danger rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm tracking-tighter">
            mi
          </div>
          <span className="text-xl font-extrabold text-ink tracking-wide uppercase">Xiaomi</span>
        </div>
      ),
    },
    {
      name: "Vivo",
      tagline: "Zeiss Imaging Optics",
      color: "hover:border-teal hover:",
      badgeColor: "bg-teal text-white",
      logo: (
        <div className="transition-transform duration-300 group-hover:scale-105">
          <span className="text-3xl font-bold tracking-widest text-teal italic font-sans uppercase">
            VIVO
          </span>
        </div>
      ),
    },
    {
      name: "Oppo",
      tagline: "Hasselblad Portrait Mode",
      color: "hover:border-ink-3 hover:shadow-sh-1 ",
      badgeColor: "bg-ink-3 text-white",
      logo: (
        <div className="transition-transform duration-300 group-hover:scale-105">
          <span className="text-2xl font-bold tracking-widest text-ink-3 uppercase rounded-full border-[2.5px] border-ink-3 px-3.5 py-1">
            OPPO
          </span>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-8 relative z-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ink-hi border border-line mb-3 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-lime-ink animate-ping" />
          <span className="text-xs font-bold uppercase -ink">
            Official Counter Warranty // Surat
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-ink">
          Authorized Flagship Brands.
        </h2>
        <p className="mt-3 text-xs sm:text-sm font-semibold text-ink-3 leading-relaxed">
          Every handset sold across our counter comes directly from official brand distribution channels with untouched Indian retail packing, complete GST billing, and official repair center warranty.
        </p>
      </div>

      {/* Interactive Brand Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            href={`/category/phones?brand=${encodeURIComponent(brand.name)}`}
            className={`group rounded-lg bg-gradient-to-b from-white via-white to-paper-2 border border-line p-6 flex flex-col items-center justify-between text-center shadow-2xs transition-all duration-300 hover:-translate-y-2 select-none min-h-[190px] ${brand.color}`}
          >
            {/* Top Brand Logo Container */}
            <div className="h-16 flex items-center justify-center w-full my-auto">
              {brand.logo}
            </div>

            {/* Bottom Status Chip & Tagline */}
            <div className="w-full mt-4 pt-4 border-t border-ink-hi flex flex-col items-center">
              <span className="text-micro font-bold text-ink-3 mb-2 truncate max-w-full">
                {brand.tagline}
              </span>
              <span className="w-full text-center py-1.5 px-3 rounded-full text-micro font-bold uppercase tracking-wider bg-ink-hi text-ink-3 border border-line group-hover:bg-lime-ink/15 group-hover:text-ink-3 group-hover:border-lime-ink/30 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-3 group-hover:bg-lime-ink transition-colors" />
                <span>In Stock</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Trust Assurance Strip underneath */}
      <div className="mt-10 rounded-lg -ink text-white px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-white/10">
        <div className="flex items-center gap-3">
          <ShieldIcon className="w-6 h-6 shrink-0 text-white" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              100% Genuine Indian Retail Packing Guarantee
            </h4>
            <p className="text-micro font-semibold text-neutral-400">
              Verify serial numbers &amp; IMEI directly on brand websites before walking out of our store.
            </p>
          </div>
        </div>
        <Link
          href="/#stores"
          className="shrink-0 rounded-full bg-lime text-[#2A2A2A] text-xs font-bold px-6 py-2.5 hover:bg-white hover:text-[#2A2A2A] transition-colors uppercase tracking-wider shadow-sm"
        >
          Find a Surat branch
        </Link>
      </div>
    </section>
  );
}
