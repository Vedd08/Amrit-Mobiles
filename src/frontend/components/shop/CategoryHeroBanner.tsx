"use client";

import React from "react";

import { SmartphoneCutout, SmartwatchCutout } from "@/frontend/components/shop/ProductCutouts";
import { BoltIcon, ShieldIcon, RefreshIcon } from "@/frontend/components/shop/icons";

export function CategoryHeroBanner({ slug, categoryName }: { slug: string; categoryName: string }) {
  const isPhones = slug.toLowerCase() === "phones" || slug.toLowerCase().includes("phone");

  return (
    <div className="relative overflow-hidden rounded-lg bg-linear-to-br from-base via-raised to-void border border-raised text-white p-8 sm:p-14 mb-12 shadow-sh-2 select-none group">

      {/* Giant Architectural Background Watermark */}
      <span className="absolute right-10 top-1/2 -translate-y-1/2 text-6xl sm:text-display font-bold text-white/4 pointer-events-none uppercase tracking-tighter select-none font-mono">
        {isPhones ? "5G HANDSET" : categoryName.toUpperCase()}
      </span>

      {/* Decorative LED Glow Rings */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-danger/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side Content (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 mb-5 shadow-2xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-lime-ink animate-ping" />
            <span className="text-micro font-bold uppercase text-neutral-200">
              {isPhones ? "AUTHORIZED SURAT FLAGSHIP STORE // 5G READY" : "OFFICIAL BRAND RETAIL SHELF"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-white ">
            {isPhones ? (
              <>
                Flagship Handsets <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-neutral-300 to-neutral-500">
                  &amp; 5G Smartphones.
                </span>
              </>
            ) : (
              categoryName
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-base font-semibold text-neutral-300 max-w-xl leading-relaxed">
            {isPhones
              ? "Explore untouched sealed Indian retail boxes of Apple iPhone 16 Pro, Samsung Galaxy S24 Ultra, Vivo Zeiss, and OnePlus flagships. Experience real-time hand feel directly across our verified Surat counter."
              : `Explore our curated selection of verified ${categoryName} with official warranty and instant counter financing.`}
          </p>

          {/* Value Propositions Pill Tags */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-danger/20 border border-danger/40 text-line flex items-center gap-1.5 shadow-2xs">
              <BoltIcon className="w-3.5 h-3.5" />
              <span>10-Minute Zero Paperless EMI</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5" />
              <span>On-Spot Portal IMEI Check</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-1.5">
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>Free WhatsApp &amp; Photo Migration</span>
            </span>
          </div>
        </div>

        {/* Right Side Visual Component (5 Columns) */}
        <div className="lg:col-span-5 flex items-center justify-center relative my-4 lg:my-0 pointer-events-none">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-90 lg:h-90 flex items-center justify-center filter drop-transition-transform duration-700 group-hover:scale-105">
            {isPhones ? (
              <SmartphoneCutout className="w-full h-full transform -rotate-12" />
            ) : (
              <SmartwatchCutout className="w-full h-full transform rotate-12" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
