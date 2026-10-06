"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MobileDeviceCard } from "@/frontend/components/shop/MobileDeviceCard";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { Reveal } from "@/frontend/components/motion/Reveal";
import { MagneticButton } from "@/frontend/components/motion/CinematicFooter";
import { prefersReducedMotion } from "@/frontend/lib/motion";
import { BoltIcon, ShieldIcon, RefreshIcon, PinIcon, BoxIcon, ScaleIcon, TruckIcon, CardIcon, HeadphoneIcon } from "@/frontend/components/shop/icons";

gsap.registerPlugin(ScrollTrigger);

const CATALOG_FEATURES = [
  { Icon: TruckIcon, title: "Free Doorstep Delivery", desc: "Same-day dispatch across Surat on every online reservation." },
  { Icon: ShieldIcon, title: "Genuine Sealed Stock", desc: "100% authorized retail box with on-spot IMEI verification." },
  { Icon: CardIcon, title: "0% Paperless EMI", desc: "10-minute instant counter approval, zero hidden interest." },
  { Icon: HeadphoneIcon, title: "24/7 WhatsApp Support", desc: "Real humans on stock, pricing & trade-in questions." },
];

interface PhoneRetailCatalogProps {
  initialProducts: ProductCardData[];
  initialBrands: string[];
  category: { id: string; name: string; slug: string };
}

export function PhoneRetailCatalog({ initialProducts, initialBrands, category }: PhoneRetailCatalogProps) {
  // Active Filter state
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Interactive Comparison Dock State
  const [comparedProducts, setComparedProducts] = useState<ProductCardData[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Cinematic hero: giant watermark drifts on scroll, ambient glow blobs
  // breathe — the same techniques as CinematicFooter's giant text + aurora,
  // just self-contained here since this hero lives on a dark background
  // rather than the footer's light one.
  const heroRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLSpanElement>(null);
  // Optional glows that track mouse position, disabled for now or unused
  // const glowRedRef = useRef<HTMLDivElement>(null);
  // const glowBlueRef = useRef<HTMLDivElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const chassisTagRef = useRef<HTMLDivElement>(null);
  const stockChipRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const countVal = useRef({ n: 0 });
  const compareDockRef = useRef<HTMLDivElement>(null);
  const compareModalRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!heroRef.current || prefersReducedMotion()) return;

      gsap.fromTo(
        giantTextRef.current,
        { x: "4vw", opacity: 0 },
        {
          x: "0vw",
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 90%",
            end: "bottom top",
            scrub: 1,
          },
        }
      );



      // Product shot: settle in, then float gently forever
      if (phoneWrapRef.current) {
        gsap.from(phoneWrapRef.current, { opacity: 0, scale: 0.9, y: 30, duration: 0.9, ease: "power3.out", delay: 0.15 });
        gsap.to(phoneWrapRef.current, { y: "-=14", duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
      }

      // Floating tags: drop in with a little overshoot, chassis tag keeps bobbing
      if (chassisTagRef.current) {
        gsap.from(chassisTagRef.current, { opacity: 0, y: -16, duration: 0.6, ease: "back.out(2)", delay: 0.5 });
        gsap.to(chassisTagRef.current, { y: "+=5", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
      }
      if (stockChipRef.current) {
        gsap.from(stockChipRef.current, { opacity: 0, y: 16, duration: 0.6, ease: "back.out(2)", delay: 0.65 });
      }
    },
    { scope: heroRef }
  );

  // Pointer-follow 3D tilt on the phone shot — moving anywhere across the
  // hero gently rotates it, like the phone is sitting in a glass case.
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return;
    const heroEl = heroRef.current;
    const phoneEl = phoneWrapRef.current;
    if (!heroEl || !phoneEl) return;

    const ctx = gsap.context(() => {
      const quickRotY = gsap.quickTo(phoneEl, "rotateY", { duration: 0.6, ease: "power3.out" });
      const quickRotX = gsap.quickTo(phoneEl, "rotateX", { duration: 0.6, ease: "power3.out" });

      const handleMove = (e: PointerEvent) => {
        const rect = heroEl.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        quickRotY(px * 16);
        quickRotX(-py * 12);
      };
      const handleLeave = () => {
        quickRotY(0);
        quickRotX(0);
      };

      heroEl.addEventListener("pointermove", handleMove);
      heroEl.addEventListener("pointerleave", handleLeave);

      return () => {
        heroEl.removeEventListener("pointermove", handleMove);
        heroEl.removeEventListener("pointerleave", handleLeave);
      };
    }, heroEl);

    return () => ctx.revert();
  }, []);

  // Handle Spec Compare toggle
  function handleCompareToggle(product: ProductCardData) {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.slug === product.slug);
      if (exists) return prev.filter((p) => p.slug !== product.slug);
      if (prev.length >= 4) {
        alert("You can compare up to 4 devices simultaneously.");
        return prev;
      }
      return [...prev, product];
    });
  }

  // Compare dock slides up when it first gets a device; the modal scales in
  // from its trigger instead of just appearing.
  useGSAP(
    () => {
      if (comparedProducts.length === 0 || !compareDockRef.current || prefersReducedMotion()) return;
      gsap.from(compareDockRef.current, { y: 40, opacity: 0, duration: 0.45, ease: "power3.out" });
    },
    { dependencies: [comparedProducts.length > 0] }
  );

  useGSAP(
    () => {
      if (!showCompareModal || !compareModalRef.current || prefersReducedMotion()) return;
      gsap.from(compareModalRef.current, { opacity: 0, duration: 0.25 });
      const panel = compareModalRef.current.querySelector(".compare-modal-panel");
      if (panel) gsap.from(panel, { opacity: 0, scale: 0.94, y: 20, duration: 0.4, ease: "power3.out" });
    },
    { dependencies: [showCompareModal] }
  );

  // Filter & Sort calculation
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrand !== "") {
      result = result.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Price Tier filter
    if (selectedPriceTier === "under-30k") {
      result = result.filter((p) => p.price < 30000);
    } else if (selectedPriceTier === "30k-60k") {
      result = result.filter((p) => p.price >= 30000 && p.price <= 60000);
    } else if (selectedPriceTier === "flagship-60k") {
      result = result.filter((p) => p.price > 60000);
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [initialProducts, selectedBrand, selectedPriceTier, sortBy, searchQuery]);

  // First paint: the shelf sits below the hero, so instead of firing the
  // reveal immediately (and wasting it off-screen), cards cascade in as
  // the user actually scrolls the grid into view.
  useGSAP(
    () => {
      if (!gridRef.current || prefersReducedMotion()) return;
      const cards = Array.from(gridRef.current.children) as HTMLElement[];
      if (cards.length === 0) return;
      gsap.set(cards, { opacity: 0, y: 28, scale: 0.96 });
      const st = ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          }),
      });
      return () => st.forEach((t) => t.kill());
    },
    { scope: gridRef, dependencies: [] }
  );

  // Grid reacts instead of just swapping: cards fade/scale in with a
  // stagger every time the filtered set changes (skip the very first run —
  // that entrance is handled by the scroll-triggered cascade above), and
  // the "Showing N" count ticks to its new value instead of jumping.
  const hasMountedGridRef = useRef(false);
  useGSAP(
    () => {
      if (!gridRef.current || prefersReducedMotion()) return;
      if (!hasMountedGridRef.current) {
        hasMountedGridRef.current = true;
        return;
      }
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", stagger: 0.05, overwrite: true }
      );
    },
    { dependencies: [filteredProducts], scope: gridRef }
  );

  useGSAP(
    () => {
      if (!countRef.current) return;
      if (prefersReducedMotion()) {
        countRef.current.textContent = String(filteredProducts.length);
        return;
      }
      gsap.to(countVal.current, {
        n: filteredProducts.length,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => {
          if (countRef.current) countRef.current.textContent = String(Math.round(countVal.current.n));
        },
      });
    },
    { dependencies: [filteredProducts.length] }
  );

  function resetAllFilters() {
    setSelectedBrand("");
    setSelectedPriceTier("all");
    setSearchQuery("");
  }

  // Tactile little "pop" on any filter pill click
  function popClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (prefersReducedMotion()) return;
    gsap.fromTo(e.currentTarget, { scale: 0.88 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
  }

  const hasActiveFilters = selectedBrand !== "" || selectedPriceTier !== "all" || searchQuery.trim() !== "";

  return (
    <div className="pb-20 select-none">
      
      {/* ── TOP EXECUTIVE FINANCIAL ANNOUNCEMENT STRIP ── */}
      <div className="bg-white/80 backdrop-blur-xl text-ink py-2.5 px-4 sm:px-8 border-b border-line shadow-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2 text-xs font-bold tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-ink animate-ping" />
            <span className="bg-danger text-white px-2 py-0.5 rounded text-micro font-bold">
              SURAT COUNTER OFFER
            </span>
            <span>10-Minute Zero Interest Paperless EMI available on all mobile handsets over ₹15,000!</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-micro text-neutral-300">
            <span>100% Sealed Indian Retail Box</span>
            <span>|</span>
            <Link href="/store-locator" className="text-white underline hover:text-danger transition-colors">
              Verify Store Directions →
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN SHOWCASE CONTAINER ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        {/* Breadcrumb Bar */}
        <nav className="text-micro font-extrabold text-ink-3 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ink transition-colors">Store Catalog</Link>
          <span>/</span>
          <span className="text-danger font-bold">{category.name} Flagships</span>
        </nav>

        {/* ── HIGH-END ORIGINAL PHONE STUDIO HERO SECTION (LIGHT) ── */}
        <div
          ref={heroRef}
          className="relative overflow-hidden rounded-lg bg-white border border-line p-8 sm:p-14 lg:p-16 mb-12 shadow-sh-2 group"
        >
          {/* Giant Architectural Monospace Watermark */}
          <span
            ref={giantTextRef}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl sm:text-display font-bold text-ink/[0.02] pointer-events-none uppercase tracking-tighter select-none font-mono z-0"
          >
            ORIGINAL PHONE
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

            {/* Left Column: Commercial Value Propositions */}
            <Reveal y={40} className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-paper-2 border border-line mb-6 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-lime-ink animate-pulse" />
                <span className="text-micro font-bold uppercase text-ink">
                  AUTHORIZED SURAT FLAGSHIP STORE // GENUINE INDIAN RETAIL BOX
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold text-ink ">
                Original Flagships. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink via-raised to-ink-3">
                  Complete Indian Warranty.
                </span>
              </h1>
              
              <p className="mt-4 text-sm sm:text-base font-medium text-ink-3 max-w-xl leading-relaxed">
                Experience authentic Apple iPhone 16 Pro Titanium, Samsung Galaxy S24 Ultra, and OnePlus flagships with untouched sealed retail box integrity. Verify serial &amp; IMEI online directly across our Surat showroom counter before taking delivery.
              </p>

              {/* Primary Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <MagneticButton
                  as="a"
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ink hover:bg-raised text-white font-bold text-xs uppercase tracking-wider transition-colors duration-200 shadow-md"
                >
                  Browse Flagships
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/trade-in"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-paper-2 border border-line text-ink font-bold text-xs uppercase tracking-wider hover:bg-ink-hi transition-colors duration-200"
                >
                  Get Trade-In Value
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </MagneticButton>
              </div>

              {/* Value Proposition Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 rounded-full text-xs font-bold bg-paper-2 border border-line text-ink flex items-center gap-2 shadow-sm">
                  <BoltIcon className="w-3.5 h-3.5" />
                  <span>10-Minute Zero Paperless EMI</span>
                </div>
                <div className="px-4 py-2 rounded-full text-xs font-bold bg-paper-2 border border-line text-ink flex items-center gap-2 shadow-sm">
                  <ShieldIcon className="w-3.5 h-3.5" />
                  <span>On-Spot Portal IMEI Verification</span>
                </div>
                <div className="px-4 py-2 rounded-full text-xs font-bold bg-paper-2 border border-line text-ink flex items-center gap-2 shadow-sm">
                  <RefreshIcon className="w-3.5 h-3.5" />
                  <span>Free WhatsApp &amp; Photo Migration</span>
                </div>
              </div>
            </Reveal>

            {/* Right Column: Real Original Smartphone Studio Showcase */}
            <div className="lg:col-span-5 flex items-center justify-center relative my-6 lg:my-0" style={{ perspective: 1200 }}>
              
              {/* Floating Glass Telemetry Tag */}
              <div ref={chassisTagRef} className="absolute top-0 right-4 sm:-right-2 z-20 px-3.5 py-1.5 rounded-lg bg-white/90 border border-line backdrop-blur-xl text-ink text-micro font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-lime-ink" />
                <span>Original Titanium Chassis</span>
              </div>

              {/* Main Real Original Smartphone Image Container */}
              <div
                ref={phoneWrapRef}
                className="relative w-[290px] h-[290px] sm:w-[380px] sm:h-[380px] flex items-center justify-center filter drop-"
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
              >
                <Image
                  src="/images/original_flagship_phone.png"
                  alt="Original Titanium Flagship Smartphone"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 290px, 380px"
                  priority
                />
              </div>

              {/* Floating Store Counter Stock Chip */}
              <div ref={stockChipRef} className="absolute bottom-2 left-4 sm:left-0 z-20 px-4 py-2 rounded-lg bg-white border border-line text-ink text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                <PinIcon className="w-4 h-4 text-danger" />
                <span>In Stock at Surat Store</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── COUNTER ASSURANCE FEATURE STRIP ── */}
        <Reveal y={20} className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line rounded-lg overflow-hidden border border-line shadow-sh-2 ">
            {CATALOG_FEATURES.map((f) => (
              <div key={f.title} className="bg-white p-5 sm:p-7 flex flex-col items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-danger">
                  <f.Icon className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-ink leading-tight">{f.title}</h4>
                  <p className="mt-1 text-micro font-semibold text-ink-3 leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── INTERACTIVE CATEGORY BRAND PILL BAR & LIVE FILTERING ── */}
        <Reveal y={30} className="bg-white border border-line rounded-lg p-6 mb-10 shadow-sh-2 relative z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Side: Brand Pills & Shortcuts */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Select Manufacturer Flagship
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-danger hover:underline uppercase tracking-wider"
                  >
                    [ Reset All Filters ✕ ]
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={(e) => { popClick(e); setSelectedBrand(""); }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                    selectedBrand === "" && selectedPriceTier === "all"
                      ? "bg-ink text-white shadow-md scale-105"
                      : "bg-paper-2 text-ink-3 border border-line hover:border-ink hover:text-ink"
                  }`}
                >
                  <BoltIcon className="w-3.5 h-3.5" />
                  <span>All Original Handsets</span>
                  <span className={`px-2 py-0.5 rounded-full text-micro ${selectedBrand === "" ? "bg-white/20 text-white" : "bg-neutral-200 text-ink-3"}`}>
                    {initialProducts.length}
                  </span>
                </button>

                {initialBrands.map((b) => {
                  const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
                  const brandCount = initialProducts.filter((p) => p.brand.toLowerCase() === b.toLowerCase()).length;
                  return (
                    <button
                      key={b}
                      onClick={(e) => { popClick(e); setSelectedBrand(isSelected ? "" : b); setSelectedPriceTier("all"); }}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 flex items-center gap-2 ${
                        isSelected
                          ? "bg-danger text-white shadow-sh-1 scale-105 border border-danger"
                          : "bg-white text-ink-3 border border-line hover:border-danger hover:text-danger"
                      }`}
                    >
                      <span>{b === "Apple" ? "Apple Authorized" : b === "Samsung" ? "Samsung Galaxy" : b}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-micro ${isSelected ? "bg-white/20 text-white" : "bg-paper-2 text-ink-3"}`}>
                        {brandCount}
                      </span>
                    </button>
                  );
                })}

                {/* Quick Price Tier Shortcuts */}
                <button
                  onClick={(e) => { popClick(e); setSelectedPriceTier(selectedPriceTier === "under-30k" ? "all" : "under-30k"); setSelectedBrand(""); }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    selectedPriceTier === "under-30k"
                      ? "bg-lime-ink text-base shadow-md scale-105 border border-lime-ink"
                      : "bg-white text-ink-3 border border-line hover:border-lime-ink"
                  }`}
                >
                  Budget 5G (Under ₹30K)
                </button>
              </div>
            </div>

            {/* Right Side: Quick Spec Search & Sorting Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t md:border-t-0 md:border-l border-line pt-4 md:pt-0 md:pl-6">
              
              {/* Hardware Spec Search Bar */}
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="Search model, RAM, 5G..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-paper-2 border border-line rounded-lg pl-9 pr-4 py-2.5 text-xs font-extrabold text-ink placeholder:text-ink-3 outline-none focus:border-ink transition-all shadow-sm"
                />
                <svg className="w-4 h-4 absolute left-3 top-3 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Sorting Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc')}
                  className="appearance-none bg-white border border-line rounded-lg pl-4 pr-9 py-2.5 text-xs font-bold text-ink outline-none focus:border-ink cursor-pointer shadow-sm w-full sm:w-48"
                >
                  <option value="newest">Newest Flagships</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="pointer-events-none absolute right-3 text-ink-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

            </div>

          </div>
        </Reveal>

        {/* ── PRODUCT CATALOG SHELF (HIGH-IMPACT RETAIL PRESENTATION) ── */}
        <div id="catalog" className="mb-12 scroll-mt-24">
          <div className="flex items-center justify-between mb-6 px-2 relative z-20">
            <h2 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              <span className="h-4 w-1.5 bg-danger rounded-full inline-block" />
              <span>{selectedBrand ? `${selectedBrand} Original Handsets` : "Active Surat Counter Inventory"}</span>
            </h2>
            <span className="text-xs font-bold text-ink-3">
              Showing <strong ref={countRef} className="text-ink">{filteredProducts.length}</strong> verified devices
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((product) => {
                const isCompared = comparedProducts.some((p) => p.slug === product.slug);
                return (
                  <MobileDeviceCard
                    key={product.slug}
                    product={product}
                    onCompareToggle={handleCompareToggle}
                    isCompared={isCompared}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-line shadow-sh-2 rounded-lg py-20 px-8 text-center my-6 relative z-20">
              <BoxIcon className="w-12 h-12 mx-auto mb-4 text-ink-3" />
              <h3 className="text-2xl font-bold text-ink">No devices matched your specific hardware criteria</h3>
              <p className="text-sm text-ink-3 font-semibold mt-2 max-w-md mx-auto leading-relaxed">
                We have over 2,000 devices across our physical retail racks! If a specific color variant or RAM configuration is hidden, contact our counter desk directly.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-6 px-8 py-3.5 rounded-full bg-danger hover:bg-ink text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg"
              >
                Reset All Active Filters
              </button>
            </div>
          )}
        </div>

        {/* ── INTEGRATED INSTANT COUNTER EXCHANGE PROMOTION STRIP ── */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-ink via-raised to-ink text-white p-8 sm:p-14 border border-raised shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="max-w-xl text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger px-3.5 py-1 text-micro font-bold tracking-widest text-white uppercase shadow-sm mb-3">
              <RefreshIcon className="w-3 h-3" />
              Highest Counter Exchange Valuation in Surat
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Upgrade your old smartphone across our counter today.
            </h3>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-neutral-300 leading-relaxed">
              Bring any old smartphone to our Surat showroom for immediate spot evaluation. We credit 100% of your old handset&apos;s exchange value directly against your new flagship purchase—combined with zero-interest paperless EMI!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
            <Link
              href="/trade-in"
              className="w-full sm:w-auto text-center px-8 py-4 rounded-full bg-danger hover:bg-white hover:text-ink font-bold text-xs uppercase tracking-wider text-white transition-all duration-300 shadow-lg"
            >
              Calculate Exchange Value
            </Link>
            <Link
              href="/store-locator"
              className="w-full sm:w-auto text-center px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200"
            >
              Visit Surat Branch
            </Link>
          </div>
        </div>

      </div>

      {/* ── INTERACTIVE FLOATING SPECS COMPARISON DOCK ── */}
      {comparedProducts.length > 0 && (
        <div ref={compareDockRef} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
          <div className="bg-white/90 backdrop-blur-xl border border-line rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 text-ink">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-danger text-white p-2.5 rounded-lg font-bold text-xs shadow-md">
                <ScaleIcon className="w-3.5 h-3.5" />
                COMPARE ({comparedProducts.length}/4)
              </span>
              <div className="flex items-center gap-2 overflow-x-auto max-w-sm sm:max-w-md py-1">
                {comparedProducts.map((p) => (
                  <div key={p.slug} className="bg-paper-2 text-ink text-micro font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap border border-line">
                    <span>{p.name}</span>
                    <button
                      onClick={() => handleCompareToggle(p)}
                      className="text-danger hover:text-ink font-bold ml-1"
                      title="Remove device"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setComparedProducts([])}
                className="text-xs font-extrabold text-neutral-400 hover:text-white px-3 py-2 uppercase tracking-wider transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowCompareModal(true)}
                className="bg-danger hover:bg-white hover:text-ink text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Open Comparison Matrix →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ENTERPRISE SIDE-BY-SIDE SPEC COMPARISON MODAL ── */}
      {showCompareModal && (
        <div ref={compareModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md">
          <div className="compare-modal-panel bg-white border border-line text-ink rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 relative">
            
            <div className="flex items-center justify-between pb-6 border-b border-line mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-danger block mb-1">
                  Official Technical Specifications
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink">
                  Side-By-Side Hardware Comparison
                </h2>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="w-10 h-10 rounded-full bg-paper-2 text-ink hover:bg-danger hover:text-white flex items-center justify-center font-bold text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-line">
                    <th className="py-4 px-4 w-48 text-xs font-extrabold uppercase tracking-wider text-ink-3 bg-paper-2 rounded-tl-2xl">
                      Specification Feature
                    </th>
                    {comparedProducts.map((p) => (
                      <th key={p.slug} className="py-4 px-4 text-center bg-white border-l border-line">
                        <h4 className="text-base font-bold text-ink line-clamp-1">{p.name}</h4>
                        <span className="text-micro font-extrabold text-ink-3 uppercase">{p.brand} Official</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-sm font-semibold text-ink-3">
                  <tr>
                    <td className="py-3.5 px-4 bg-paper-2 font-extrabold text-ink">Counter Selling Price</td>
                    {comparedProducts.map((p) => (
                      <td key={p.slug} className="py-3.5 px-4 text-center font-bold text-lg text-ink border-l border-line">
                        {formatINR(p.price)}
                        {p.mrp && p.mrp > p.price && (
                          <div className="text-micro font-extrabold text-ink-3">Save {formatINR(p.mrp - p.price)}</div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 bg-paper-2 font-extrabold text-ink">10-Minute Paperless EMI</td>
                    {comparedProducts.map((p) => (
                      <td key={p.slug} className="py-3.5 px-4 text-center border-l border-line">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-ink/15 text-lime-ink">
                          {formatINR(p.price / 12)}/mo*
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 bg-paper-2 font-extrabold text-ink">Cellular Network</td>
                    {comparedProducts.map((p) => (
                      <td key={p.slug} className="py-3.5 px-4 text-center font-extrabold text-ink border-l border-line">
                        5G Dual SIM &amp; eSIM Ready
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 bg-paper-2 font-extrabold text-ink">Memory &amp; Storage</td>
                    {comparedProducts.map((p) => {
                      let specs: Record<string, string> = {};
                      try { if (p.specs) specs = JSON.parse(p.specs); } catch {}
                      return (
                        <td key={p.slug} className="py-3.5 px-4 text-center font-extrabold text-ink border-l border-line">
                          {specs["RAM"] || "8GB RAM"} / {specs["Storage"] || "256GB ROM"}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 bg-paper-2 font-extrabold text-ink">Hardware Overview</td>
                    {comparedProducts.map((p) => (
                      <td key={p.slug} className="py-3.5 px-4 text-center text-xs text-ink-3 border-l border-line max-w-xs leading-relaxed">
                        {p.description || "Official Indian manufacturer flagship specification with untouched sealed packaging."}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 bg-paper-2 font-extrabold text-ink">Store Counter Warranty</td>
                    {comparedProducts.map((p) => (
                      <td key={p.slug} className="py-3.5 px-4 text-center border-l border-line">
                        <span className="inline-flex items-center gap-1.5 text-micro font-bold text-lime-ink uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-lime-ink" />
                          In Stock // 1 Yr Warranty
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-semibold text-ink-3">
                *Zero-interest paperless counter EMI is subject to Instant 10-minute credit approval at our Surat store.
              </span>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-8 py-3 rounded-full bg-ink text-white hover:bg-raised text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Return to Product Shelf
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
