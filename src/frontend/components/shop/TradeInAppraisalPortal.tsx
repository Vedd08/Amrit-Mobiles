"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/frontend/lib/phone-experience-data";

const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Oppo"] as const;
type Brand = (typeof BRANDS)[number];

interface OldModel {
  id: string;
  brand: Brand;
  name: string;
  maxValuation: number;
  storageOptions: string[];
}

const MODELS: OldModel[] = [
  { id: "ip14-promax", brand: "Apple", name: "iPhone 14 Pro Max", maxValuation: 64000, storageOptions: ["128GB", "256GB", "512GB", "1TB"] },
  { id: "ip14-pro", brand: "Apple", name: "iPhone 14 Pro", maxValuation: 58000, storageOptions: ["128GB", "256GB", "512GB"] },
  { id: "ip14", brand: "Apple", name: "iPhone 14 (Standard)", maxValuation: 39000, storageOptions: ["128GB", "256GB", "512GB"] },
  { id: "ip13-promax", brand: "Apple", name: "iPhone 13 Pro Max", maxValuation: 48000, storageOptions: ["128GB", "256GB", "512GB"] },
  { id: "ip13", brand: "Apple", name: "iPhone 13 (Standard)", maxValuation: 32000, storageOptions: ["128GB", "256GB", "512GB"] },
  { id: "ip12", brand: "Apple", name: "iPhone 12 (Standard)", maxValuation: 23000, storageOptions: ["64GB", "128GB", "256GB"] },

  { id: "s-s23ultra", brand: "Samsung", name: "Galaxy S23 Ultra 5G", maxValuation: 56000, storageOptions: ["256GB", "512GB", "1TB"] },
  { id: "s-s23plus", brand: "Samsung", name: "Galaxy S23+ 5G", maxValuation: 42000, storageOptions: ["256GB", "512GB"] },
  { id: "s-s23", brand: "Samsung", name: "Galaxy S23 5G", maxValuation: 35000, storageOptions: ["128GB", "256GB"] },
  { id: "s-s22ultra", brand: "Samsung", name: "Galaxy S22 Ultra 5G", maxValuation: 38000, storageOptions: ["256GB", "512GB"] },

  { id: "op-11", brand: "OnePlus", name: "OnePlus 11 5G", maxValuation: 29000, storageOptions: ["128GB", "256GB"] },
  { id: "op-10pro", brand: "OnePlus", name: "OnePlus 10 Pro 5G", maxValuation: 22000, storageOptions: ["128GB", "256GB"] },
  { id: "mi-13pro", brand: "Xiaomi", name: "Xiaomi 13 Pro 5G", maxValuation: 34000, storageOptions: ["256GB"] },
  { id: "v-x90pro", brand: "Vivo", name: "Vivo X90 Pro 5G", maxValuation: 36000, storageOptions: ["256GB"] },
];

const CONDITIONS = [
  { id: "flawless", title: "Flawless / Like New", desc: "No visible scratches on display or armor frame. 100% functional hardware.", multiplier: 1.0, badge: "MAX VALUATION" },
  { id: "good", title: "Good / Minor Wear", desc: "Light hairline micro-scratches visible under bright light. Battery health above 80%.", multiplier: 0.85, badge: "-15% DEDUCTION" },
  { id: "average", title: "Visible Scratches / Dents", desc: "Noticeable scratches or small corner scuffs. Fully working display touch & cameras.", multiplier: 0.68, badge: "-32% DEDUCTION" },
  { id: "cracked", title: "Cracked Glass / Damaged", desc: "Cracked front display glass or camera lens cover. Handset powers on smoothly.", multiplier: 0.45, badge: "HEAVY DEDUCTION" },
] as const;

export function TradeInAppraisalPortal() {
  const [selectedBrand, setSelectedBrand] = useState<Brand>("Apple");
  const [selectedModelId, setSelectedModelId] = useState<string>("ip14-promax");
  const [selectedStorage, setSelectedStorage] = useState<string>("256GB");
  const [selectedCond, setSelectedCond] = useState<string>("flawless");
  const [hasOriginalBox, setHasOriginalBox] = useState<boolean>(true);
  const [hasOriginalCharger, setHasOriginalCharger] = useState<boolean>(true);

  const activeModels = MODELS.filter((m) => m.brand === selectedBrand);
  const currentModel = MODELS.find((m) => m.id === selectedModelId) || activeModels[0];
  const currentCond = CONDITIONS.find((c) => c.id === selectedCond) || CONDITIONS[0];

  const basePrice = currentModel ? currentModel.maxValuation : 30000;
  let finalEstimate = Math.round(basePrice * currentCond.multiplier);
  if (hasOriginalBox) finalEstimate += 1500;
  if (hasOriginalCharger) finalEstimate += 1000;

  const handleBrandChange = (b: Brand) => {
    setSelectedBrand(b);
    const firstOfBrand = MODELS.find((m) => m.brand === b);
    if (firstOfBrand) {
      setSelectedModelId(firstOfBrand.id);
      setSelectedStorage(firstOfBrand.storageOptions[0]);
    }
  };

  const generateWhatsAppLink = () => {
    const text = `Hello Amrit Mobiles! I want to trade in my old device at your Surat showroom:
*Model:* ${currentModel.name} (${selectedStorage})
*Condition:* ${currentCond.title}
*Accessories Included:* ${[hasOriginalBox ? "Original Box" : null, hasOriginalCharger ? "Original Charger" : null].filter(Boolean).join(", ") || "Handset only"}
*Estimated Valuation:* ${formatINR(finalEstimate)}
Please confirm spot inspection availability!`;

    return `https://wa.me/919876543210?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-paper-2 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans select-none text-ink">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Flagship Hero Banner (Clean, Bright & High Contrast!) */}
        <div className="rounded-lg bg-gradient-to-r from-base via-teal to-teal text-white p-8 sm:p-14 mb-14 shadow-sh-1 relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-lime-ink animate-ping" />
              <span>INSTANT SURAT SHOWROOM EXCHANGE PROGRAM</span>
            </div>
            <h1 className="text-3xl sm:text-6xl font-bold leading-tight text-white mb-6">
              Upgrade your smartphone without paying full retail.
            </h1>
            <p className="text-sm sm:text-base font-medium text-surface leading-relaxed max-w-2xl">
              Get an instant guaranteed evaluation quotation right here on our calculator. Bring your old device to our Surat counter—we inspect it in 10 minutes and apply your exchange credit directly against your new sealed flagship invoice!
            </p>
          </div>
        </div>

        {/* 2-Column Main Portal Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Interactive Evaluation Step Controls (8 Cols) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* STEP 1: BRAND & MODEL SELECTION */}
            <div className="bg-white border-2 border-line/80 rounded-lg p-8 sm:p-10 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-teal uppercase tracking-wider block mb-1">STEP 1 OF 3</span>
                  <h3 className="text-2xl font-bold text-ink">Select Your Current Brand &amp; Model</h3>
                </div>
              </div>

              {/* Brand Tabs */}
              <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-line">
                {BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleBrandChange(b)}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all border-2 ${
                      selectedBrand === b
                        ? "bg-teal text-white border-teal shadow-md"
                        : "bg-paper-2 text-ink-3 border-line hover:border-teal hover:text-ink"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Model Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {activeModels.map((m) => {
                  const isSelected = m.id === selectedModelId;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedModelId(m.id);
                        setSelectedStorage(m.storageOptions[0]);
                      }}
                      className={`p-5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-paper border-teal shadow-md scale-[1.01]"
                          : "bg-paper-2 border-line/70 hover:border-teal hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-ink-3 uppercase">{m.brand}</span>
                        {isSelected && (
                          <span className="text-micro font-bold uppercase tracking-wider bg-teal text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                            SELECTED ✓
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-ink leading-tight mb-2">{m.name}</h4>
                      <div className="text-xs font-bold text-lime-ink">
                        Up to {formatINR(m.maxValuation + 2500)} exchange credit
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Storage Selection Pills */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3 block mb-3">
                  SELECT STORAGE VARIANT:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {currentModel?.storageOptions.map((opt) => {
                    const isSelected = opt === selectedStorage;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedStorage(opt)}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${
                          isSelected
                            ? "bg-ink text-white border-ink shadow-2xs"
                            : "bg-paper-2 text-ink-3 border-line/70 hover:border-ink"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP 2: HARDWARE & SCREEN CONDITION */}
            <div className="bg-white border-2 border-line/80 rounded-lg p-8 sm:p-10 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-lime-ink uppercase tracking-wider block mb-1">STEP 2 OF 3</span>
                  <h3 className="text-2xl font-bold text-ink">Assess Device Condition</h3>
                </div>
              </div>

              <div className="space-y-4">
                {CONDITIONS.map((c) => {
                  const isSelected = c.id === selectedCond;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCond(c.id)}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all flex flex-wrap items-center justify-between gap-4 ${
                        isSelected
                          ? "bg-paper border-lime-ink shadow-md"
                          : "bg-paper-2 border-line/70 hover:border-lime-ink hover:bg-white"
                      }`}
                    >
                      <div className="max-w-md">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h4 className="font-bold text-base text-ink">{c.title}</h4>
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-lime-ink shadow-sm animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-ink-3 m-0 leading-relaxed">{c.desc}</p>
                      </div>
                      <span className={`text-micro font-bold uppercase px-3.5 py-1.5 rounded-full border ${
                        isSelected
                          ? "bg-lime-ink text-white border-lime-ink shadow-2xs"
                          : "bg-white text-ink-3 border-line"
                      }`}>
                        {c.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: ORIGINAL BOX & ACCESSORY BONUSES */}
            <div className="bg-white border-2 border-line/80 rounded-lg p-8 sm:p-10 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-teal uppercase tracking-wider block mb-1">STEP 3 OF 3</span>
                  <h3 className="text-2xl font-bold text-ink">Included Retail Accessories</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setHasOriginalBox(!hasOriginalBox)}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                    hasOriginalBox
                      ? "bg-paper border-teal shadow-2xs"
                      : "bg-paper-2 border-line/70 hover:border-teal"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div>
                      <h5 className="font-bold text-sm text-ink">Original Retail Box</h5>
                      <span className="text-xs font-bold text-lime-ink">+₹1,500 bonus valuation</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center font-bold text-xs ${
                    hasOriginalBox ? "bg-teal border-teal text-white" : "border-line text-transparent"
                  }`}>
                    ✓
                  </div>
                </div>

                <div
                  onClick={() => setHasOriginalCharger(!hasOriginalCharger)}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                    hasOriginalCharger
                      ? "bg-paper border-teal shadow-2xs"
                      : "bg-paper-2 border-line/70 hover:border-teal"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div>
                      <h5 className="font-bold text-sm text-ink">Original Fast Charger</h5>
                      <span className="text-xs font-bold text-lime-ink">+₹1,000 bonus valuation</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center font-bold text-xs ${
                    hasOriginalCharger ? "bg-teal border-teal text-white" : "border-line text-transparent"
                  }`}>
                    ✓
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Showroom Quotation Voucher (5 Cols - 100% Light Luxury Theme!) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-white border-2 border-line/90 rounded-lg p-8 sm:p-10 relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-line pb-6 mb-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-micro font-bold uppercase tracking-widest text-lime-ink mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-ink" />
                    OFFICIAL AMRIT MOBILES QUOTATION
                  </span>
                  <h3 className="text-2xl font-bold text-ink">Your Exchange Voucher</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-paper border border-line text-lime-ink flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v5h5M8 12h8M8 16h5" />
                  </svg>
                </div>
              </div>

              {/* Handset Summary Tag */}
              <div className="bg-paper-2 border border-line/70 rounded-lg p-5 mb-8 flex items-center justify-between">
                <div>
                  <span className="text-micro font-bold text-ink-3 uppercase tracking-wider block">HANDSET EVALUATED</span>
                  <h4 className="text-lg font-bold text-ink mt-0.5">{currentModel.name} ({selectedStorage})</h4>
                  <span className="text-xs font-bold text-lime-ink block mt-1">Condition: {currentCond.title}</span>
                </div>
                <span className="bg-paper-2 text-teal font-mono font-bold text-xs px-3 py-1.5 rounded-lg border border-line">
                  SURAT TABLE
                </span>
              </div>

              {/* Line Items Breakdown */}
              <div className="space-y-4 text-xs font-bold text-ink-3 border-b border-line pb-6 mb-6">
                <div className="flex justify-between">
                  <span>Base Handset Spot Valuation:</span>
                  <span className="text-ink font-mono font-bold text-sm">{formatINR(Math.round(basePrice * currentCond.multiplier))}</span>
                </div>
                {hasOriginalBox && (
                  <div className="flex justify-between text-lime-ink">
                    <span>+ Original Retail Box Bonus:</span>
                    <span className="font-mono font-bold text-sm">+{formatINR(1500)}</span>
                  </div>
                )}
                {hasOriginalCharger && (
                  <div className="flex justify-between text-lime-ink">
                    <span>+ Original Fast Charger Bonus:</span>
                    <span className="font-mono font-bold text-sm">+{formatINR(1000)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total Estimated Spot Credit */}
              <div className="mb-8">
                <span className="text-xs font-bold text-ink-3 uppercase tracking-wider block mb-1">
                  ESTIMATED SPOT COUNTER CREDIT:
                </span>
                <div className="text-5xl font-bold text-lime-ink tabular-nums">
                  {formatINR(finalEstimate)}
                </div>
                <p className="text-xs font-semibold text-ink-3 mt-2">
                  ✓ Honored across our counter in Surat upon physical inspection.
                </p>
              </div>

              {/* Instant WhatsApp & Phone Action Buttons */}
              <div className="space-y-3">
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-lg bg-lime-ink hover:bg-lime-ink text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-center"
                >
                  <span>Lock This Quotation on WhatsApp →</span>
                </a>

                <Link
                  href="/shop"
                  className="w-full py-4 px-6 rounded-lg bg-paper-2 hover:bg-paper text-teal border-2 border-line font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center text-center block"
                >
                  Browse Sealed Flagships in Stock →
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-line flex items-center justify-between text-micro font-bold text-ink-3">
                <span>SURAT</span>
                <span className="inline-flex items-center gap-1.5 text-lime-ink">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-ink" />
                  OPEN 7 DAYS A WEEK
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
