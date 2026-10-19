"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PhoneBrand } from "@/shared/phone-catalog";
import { BRAND_FAMILIES, KIND_LABEL, PHONE_KINDS, type DeviceKind, type FamilyMember } from "@/shared/brand-family";
import { FAMILY_IMAGES, type FamilyImage } from "@/shared/brand-family-images";
import { BRANCHES } from "@/shared/branches";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { useLenis } from "@/frontend/components/motion/SmoothScrollProvider";
import { useStoreChatLink } from "@/frontend/store/store-chat-store";
import { useReducedMotion } from "@/frontend/lib/use-reduced-motion";
import { WhatsAppIcon } from "@/frontend/components/icons";
import { ArrowLeftIcon } from "./icons";
import { BrandMark } from "./BrandMark";

/*
 * Brand page hero: an Apple-Store-grade product showcase.
 *
 * The brand's flagship stands in the centre of a lit stage under a soft
 * top-down spotlight cone, with supporting cast members sitting smaller,
 * slightly blurred and desaturated at either side for photographic depth.
 *
 * Selecting any product or chip moves it into the hero spotlight with a
 * smooth FLIP-style transform-only transition (500–650ms, ease-out), while
 * the previous hero smoothly slides back into the cast.
 *
 * Light studio atmosphere with faint brand accent wash, thin floor ring,
 * gentle floor reflections, and contact shadows. Auto-cycles every 4.5s
 * until first visitor interaction. Swiping on mobile moves between products.
 */

const STAGE_H = 62; // stage height in cqw
const MAX_HERO_H = 43; // max hero height in cqw (~70% of STAGE_H)
const MAX_HERO_W = 38; // max hero width in cqw
const FLOOR_Y = 12; // cqw from bottom of stage to product base

const BASE_TILT = { rx: 2.2, ry: 0 };
const RANGE_TILT = { rx: 1.4, ry: 2.5 };

const tint = (accent: string, pct: number) => `color-mix(in srgb, ${accent} ${pct}%, transparent)`;

type SlotPos = {
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  opacity: number;
  blur: number;
};

const HERO_SLOT: SlotPos = { x: 0, y: 0, scale: 1, zIndex: 30, opacity: 1, blur: 0 };

function getCastSlots(count: number): SlotPos[] {
  if (count <= 0) return [];
  if (count === 1) {
    return [{ x: 26, y: -1.4, scale: 0.68, zIndex: 15, opacity: 0.68, blur: 1.2 }];
  }
  if (count === 2) {
    return [
      { x: -26, y: -1.4, scale: 0.68, zIndex: 15, opacity: 0.68, blur: 1.2 },
      { x: 26, y: -1.4, scale: 0.68, zIndex: 15, opacity: 0.68, blur: 1.2 },
    ];
  }
  if (count === 3) {
    return [
      { x: -35, y: -2.4, scale: 0.56, zIndex: 10, opacity: 0.52, blur: 1.8 },
      { x: -20, y: -1.4, scale: 0.68, zIndex: 16, opacity: 0.68, blur: 1.2 },
      { x: 25, y: -1.4, scale: 0.68, zIndex: 16, opacity: 0.68, blur: 1.2 },
    ];
  }
  return [
    { x: -36, y: -2.4, scale: 0.54, zIndex: 10, opacity: 0.50, blur: 1.8 },
    { x: -20, y: -1.4, scale: 0.68, zIndex: 16, opacity: 0.68, blur: 1.2 },
    { x: 20, y: -1.4, scale: 0.68, zIndex: 16, opacity: 0.68, blur: 1.2 },
    { x: 36, y: -2.4, scale: 0.54, zIndex: 10, opacity: 0.50, blur: 1.8 },
  ];
}

export function BrandFamilyHero({
  brand,
  phoneCount,
  fromPrice,
  foldCount,
}: {
  brand: PhoneBrand;
  phoneCount: number;
  fromPrice: number;
  /** Foldables / flips of this brand on the shelf. */
  foldCount: number;
}) {
  return (
    <BrandFamilyHeroInner
      key={brand.slug}
      brand={brand}
      phoneCount={phoneCount}
      fromPrice={fromPrice}
      foldCount={foldCount}
    />
  );
}

function BrandFamilyHeroInner({
  brand,
  phoneCount,
  fromPrice,
  foldCount,
}: {
  brand: PhoneBrand;
  phoneCount: number;
  fromPrice: number;
  foldCount: number;
}) {
  const family = BRAND_FAMILIES[brand.slug];
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  // All photographed product kinds for this brand, in canonical order
  const photographedKinds = useMemo(() => {
    if (!family) return [];
    return family.members
      .filter((m) => Boolean(FAMILY_IMAGES[`${brand.slug}-${m.kind}`]))
      .map((m) => m.kind);
  }, [brand.slug, family]);

  // Default flagship: phone if photographed, otherwise first photographed kind
  const initialHeroKind = useMemo(() => {
    if (!photographedKinds.length) return "phone" as DeviceKind;
    return photographedKinds.includes("phone") ? "phone" : photographedKinds[0];
  }, [photographedKinds]);

  // Slots array: slots[0] is always in HERO_SLOT; slots[1..N-1] are in cast slots
  const [slots, setSlots] = useState<DeviceKind[]>(() => {
    if (!photographedKinds.length) return [];
    const rest = photographedKinds.filter((k) => k !== initialHeroKind);
    return [initialHeroKind, ...rest];
  });

  // Selected kind for caption card & chip highlight (can be a non-photographed line)
  const [selectedKind, setSelectedKind] = useState<DeviceKind>(initialHeroKind);

  // Track if user has interacted (stops auto-cycle forever and turns on polite announcements)
  const [userInteracted, setUserInteracted] = useState(false);
  const userInteractedRef = useRef(false);

  const markInteracted = () => {
    if (!userInteractedRef.current) {
      userInteractedRef.current = true;
      setUserInteracted(true);
    }
  };

  // Move product to hero spotlight: swaps current hero into target's old cast slot
  const selectProduct = (kind: DeviceKind, fromUser = true) => {
    if (fromUser) markInteracted();
    setSelectedKind(kind);

    if (!photographedKinds.includes(kind)) {
      // Non-photographed line: keep current hero on stage, update caption & chips
      return;
    }

    setSlots((prevSlots) => {
      const idx = prevSlots.indexOf(kind);
      if (idx <= 0) return prevSlots; // already hero or not found
      const nextSlots = [...prevSlots];
      nextSlots[0] = kind;
      nextSlots[idx] = prevSlots[0];
      return nextSlots;
    });
  };

  const selectNext = () => {
    if (photographedKinds.length <= 1) return;
    const currentHero = slots[0];
    const curIdx = photographedKinds.indexOf(currentHero);
    const nextIdx = (curIdx + 1) % photographedKinds.length;
    selectProduct(photographedKinds[nextIdx], true);
  };

  const selectPrev = () => {
    if (photographedKinds.length <= 1) return;
    const currentHero = slots[0];
    const curIdx = photographedKinds.indexOf(currentHero);
    const prevIdx = (curIdx - 1 + photographedKinds.length) % photographedKinds.length;
    selectProduct(photographedKinds[prevIdx], true);
  };

  const toShelf = () => {
    const shelf = document.getElementById("shelf");
    if (!shelf) return;
    if (lenis) lenis.scrollTo(shelf, { offset: -150 });
    else shelf.scrollIntoView({ behavior: "smooth" });
  };

  const askBrand = useStoreChatLink(
    `Hi Amrit Mobiles {store}! I'm looking at ${brand.name}. What do you have in stock?`
  );

  if (!family) return null;

  const member = (kind: DeviceKind) => family.members.find((m) => m.kind === kind);
  const selectedMember = member(selectedKind) ?? member(slots[0]) ?? family.members[0];
  const selectedPhoto = FAMILY_IMAGES[`${brand.slug}-${selectedMember.kind}`];

  return (
    <section className="relative isolate overflow-hidden pb-12 pt-[94px] sm:pt-[116px] md:pb-16">
      {/* Studio atmosphere: faint brand colour wash & soft grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: [
            `radial-gradient(55% 60% at 75% 42%, ${tint(brand.accent, 16)}, transparent 72%)`,
            `radial-gradient(35% 40% at 100% 0%, ${tint(brand.accent, 10)}, transparent 70%)`,
            "radial-gradient(40% 45% at 0% 0%, rgba(146,195,24,0.12), transparent 70%)",
          ].join(", "),
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,28,25,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(26,28,25,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(70% 70% at 65% 45%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(70% 70% at 65% 45%, #000 30%, transparent 75%)",
        }}
      />

      <div className="mx-auto max-w-site px-4 sm:px-6">
        <Link
          href="/phones"
          className="inline-flex items-center gap-1.5 text-small font-semibold text-ink-3 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          All phones
        </Link>

        {/* Desktop 2-column, Mobile stacked order: Copy -> Stage -> Chips -> Caption */}
        <div className="mt-5 grid items-center gap-6 lg:grid-cols-12 lg:gap-8 [&>*]:min-w-0">
          {/* Copy (Left on desktop, Top on mobile) */}
          <div className="relative z-10 lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-1.5 text-small text-ink-2 shadow-[0_6px_18px_-10px_rgba(26,28,25,0.35)] backdrop-blur-md motion-safe:animate-[heroCopyStagger_600ms_cubic-bezier(0.16,1,0.3,1)_80ms_both]">
              <BrandMark slug={brand.slug} className="text-ink" />
              <span className="h-3.5 w-px bg-line" aria-hidden />
              at Amrit Mobiles
            </span>

            {/* Brand name stays the visual anchor with tight tracking */}
            <h1 className="mb-0 mt-3 sm:mt-5 text-[clamp(40px,6.8vw,104px)] font-extrabold leading-[0.88] tracking-[-0.055em] text-ink break-words motion-safe:animate-[heroTitleRise_700ms_cubic-bezier(0.16,1,0.3,1)_both]">
              {brand.name}
            </h1>

            <p className="mt-3 sm:mt-5 max-w-[24ch] text-[clamp(19px,2.2vw,28px)] font-bold leading-[1.18] tracking-[-0.02em] text-ink-2 motion-safe:animate-[heroCopyStagger_600ms_cubic-bezier(0.16,1,0.3,1)_160ms_both]">
              {family.tagline}
            </p>
            <p className="mt-2.5 sm:mt-4 max-w-[46ch] text-body text-ink-3 motion-safe:animate-[heroCopyStagger_600ms_cubic-bezier(0.16,1,0.3,1)_240ms_both]">
              {brand.blurb}
            </p>

            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 motion-safe:animate-[heroCopyStagger_600ms_cubic-bezier(0.16,1,0.3,1)_320ms_both]">
              <Stat>
                {phoneCount > 0
                  ? `${phoneCount} ${phoneCount === 1 ? "phone" : "phones"} in stock`
                  : "New stock weekly"}
              </Stat>
              {phoneCount > 0 && <Stat>From {formatINR(fromPrice)}</Stat>}
              <Stat>At {BRANCHES.length} branches in Surat</Stat>
            </div>

            <div className="mt-5 sm:mt-7 flex flex-wrap gap-3 motion-safe:animate-[heroCopyStagger_600ms_cubic-bezier(0.16,1,0.3,1)_400ms_both]">
              {phoneCount > 0 ? (
                <button
                  type="button"
                  onClick={toShelf}
                  className="rounded-full bg-ink px-7 py-3.5 text-small font-bold text-white shadow-[0_14px_28px_-14px_rgba(26,28,25,0.8)] transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
                >
                  Shop {brand.name} phones
                </button>
              ) : null}
              <a
                {...askBrand}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-small font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink ${
                  phoneCount === 0
                    ? "bg-ink text-white shadow-[0_14px_28px_-14px_rgba(26,28,25,0.8)] hover:-translate-y-px"
                    : "border border-white bg-white/75 text-ink shadow-[0_8px_20px_-12px_rgba(26,28,25,0.35)] backdrop-blur-md hover:bg-white"
                }`}
              >
                <WhatsAppIcon className={`h-4 w-4 ${phoneCount === 0 ? "text-lime" : "text-lime-ink"}`} />
                Ask the nearest store
              </a>
            </div>
          </div>

          {/* Product Showcase Stage, Chips, & Caption */}
          <div className="mt-2 lg:mt-0 lg:col-span-7">
            <ShowcaseStage
              brand={brand}
              slots={slots}
              photographedKinds={photographedKinds}
              initialHeroKind={initialHeroKind}
              selectedKind={selectedKind}
              userInteracted={userInteracted}
              reducedMotion={reducedMotion}
              onSelect={selectProduct}
              onNext={selectNext}
              onPrev={selectPrev}
              member={member}
            />

            {/* Chips: horizontal scroll-snap rail on mobile, wrapped on desktop */}
            <ProductChipsRail
              members={family.members}
              selectedKind={selectedKind}
              onSelect={selectProduct}
              onNext={selectNext}
              onPrev={selectPrev}
            />

            {/* Caption Panel: updates in place, polite for user interactions */}
            <ShowcaseCaption
              selected={selectedMember}
              shown={selectedPhoto}
              phoneCount={phoneCount}
              foldCount={foldCount}
              userInteracted={userInteracted}
              onShelf={toShelf}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes heroTitleRise {
          from { transform: translateY(28px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes heroCopyStagger {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes heroStageEntrance {
          from { transform: translateY(32px) scale(0.92); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes castFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function Stat({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white bg-white/65 px-3.5 py-1.5 text-small font-semibold text-ink-2 backdrop-blur-md">
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// The Spotlight Stage
// ---------------------------------------------------------------------------

function ShowcaseStage({
  brand,
  slots,
  photographedKinds,
  initialHeroKind,
  selectedKind,
  userInteracted,
  reducedMotion,
  onSelect,
  onNext,
  onPrev,
  member,
}: {
  brand: PhoneBrand;
  slots: DeviceKind[];
  photographedKinds: DeviceKind[];
  initialHeroKind: DeviceKind;
  selectedKind: DeviceKind;
  userInteracted: boolean;
  reducedMotion: boolean;
  onSelect: (k: DeviceKind, fromUser?: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  member: (k: DeviceKind) => FamilyMember | undefined;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Subtle desktop pointer tilt (max ~4°)
  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene || reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const target = { ...BASE_TILT };
    const cur = { ...BASE_TILT };
    let raf = 0;

    const tick = () => {
      cur.rx += (target.rx - cur.rx) * 0.08;
      cur.ry += (target.ry - cur.ry) * 0.08;
      scene.style.transform = `rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`;
      raf =
        Math.abs(target.rx - cur.rx) + Math.abs(target.ry - cur.ry) > 0.015
          ? requestAnimationFrame(tick)
          : 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = stage.getBoundingClientRect();
      target.rx = BASE_TILT.rx - ((e.clientY - r.top) / r.height - 0.5) * RANGE_TILT.rx * 2;
      target.ry = BASE_TILT.ry + ((e.clientX - r.left) / r.width - 0.5) * RANGE_TILT.ry * 2;
      kick();
    };

    const onLeave = () => {
      target.rx = BASE_TILT.rx;
      target.ry = BASE_TILT.ry;
      kick();
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  // Auto-cycle every 4.5s until visitor interacts; paused when offscreen or tab hidden
  useEffect(() => {
    if (userInteracted || reducedMotion || photographedKinds.length <= 1) return;

    let isVisible = !document.hidden;
    let isIntersecting = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (!isVisible || !isIntersecting) return;
      const currentHero = slots[0];
      const curIdx = photographedKinds.indexOf(currentHero);
      const nextIdx = (curIdx + 1) % photographedKinds.length;
      onSelect(photographedKinds[nextIdx], false);
    };

    const start = () => {
      if (!timer && isVisible && isIntersecting) {
        timer = setInterval(tick, 4500);
      }
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && isIntersecting) start();
      else stop();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    const observer = new IntersectionObserver(
      (entries) => {
        isIntersecting = entries[0]?.isIntersecting ?? false;
        if (isIntersecting && isVisible) start();
        else stop();
      },
      { threshold: 0.2 }
    );

    if (stageRef.current) observer.observe(stageRef.current);
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
    };
  }, [userInteracted, reducedMotion, photographedKinds, slots, onSelect]);

  // Touch & pointer swipe support (40px threshold, touch-action: pan-y preserves vertical scroll)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (!touchStartRef.current) return;
    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onNext();
      else onPrev();
    }
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    touchStartRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    if (t) {
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      touchStartRef.current = null;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onNext();
        else onPrev();
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNext();
    }
  };

  if (!photographedKinds.length) return null;

  const castSlots = getCastSlots(slots.length - 1);

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={`${brand.name} product showcase`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative w-full @container outline-none select-none"
      style={{
        aspectRatio: `100 / ${STAGE_H}`,
        perspective: "160cqw",
        perspectiveOrigin: "50% 38%",
        touchAction: "pan-y",
      }}
    >
      {/* Studio Lighting: Soft top-down spotlight cone onto the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[15%] top-0 h-[86%]"
        style={{
          background:
            "radial-gradient(ellipse 55% 85% at 50% 0%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.35) 48%, transparent 80%)",
        }}
      />

      {/* Behind the stage: Giant, pale tone-on-tone brand name (only behind products) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[4%] text-center font-extrabold leading-none tracking-[-0.06em]"
        style={{
          color: tint(brand.accent, 9),
          fontSize: `${Math.min(24, 152 / brand.name.length)}cqw`,
        }}
      >
        {brand.name}
      </div>

      {/* Luminous floor oval */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[1.5cqw] left-1/2 h-[26cqw] w-[92%] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse closest-side, rgba(255,255,255,0.98), rgba(255,255,255,0.65) 60%, transparent 100%)",
        }}
      />

      {/* Thin accent ring on the floor */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[5cqw] left-1/2 h-[15cqw] w-[78%] -translate-x-1/2 rounded-[50%]"
        style={{
          border: `1px solid ${tint(brand.accent, 26)}`,
          boxShadow: `0 0 3.5cqw -0.8cqw ${tint(brand.accent, 24)}`,
        }}
      />

      {/* 3D Scene holding hero and cast products */}
      <div
        ref={sceneRef}
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "50% 80%",
          transform: `rotateX(${BASE_TILT.rx}deg) rotateY(${BASE_TILT.ry}deg)`,
        }}
      >
        {slots.map((kind, slotIdx) => {
          const img = FAMILY_IMAGES[`${brand.slug}-${kind}`];
          if (!img) return null;

          const m = member(kind);
          const isHero = slotIdx === 0;
          const pos = isHero ? HERO_SLOT : castSlots[slotIdx - 1] ?? HERO_SLOT;

          // Product sizing bounded inside hero box
          const scaleFactor = Math.min(MAX_HERO_W / img.width, MAX_HERO_H / img.height);
          const w = img.width * scaleFactor;
          const h = img.height * scaleFactor;

          const isSelected = selectedKind === kind;

          return (
            <button
              key={kind}
              type="button"
              onClick={() => onSelect(kind, true)}
              aria-label={`${m?.name ?? kind} (pictured: ${img.model})`}
              aria-pressed={isSelected}
              className="group absolute block cursor-pointer rounded-[1.5cqw] focus-visible:outline-2 focus-visible:outline-offset-[0.6cqw] focus-visible:outline-lime-ink"
              style={{
                left: "50%",
                bottom: `${FLOOR_Y}cqw`,
                width: `${w}cqw`,
                height: `${h}cqw`,
                zIndex: pos.zIndex,
                transformOrigin: "50% 100%",
                transform: `translate3d(calc(-50% + ${pos.x}cqw), ${pos.y}cqw, 0) scale(${pos.scale})`,
                transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Entrance animation wrapper */}
              <span
                className={`block h-full w-full ${
                  isHero
                    ? "motion-safe:animate-[heroStageEntrance_800ms_cubic-bezier(0.16,1,0.3,1)_100ms_both]"
                    : "motion-safe:animate-[castFadeIn_600ms_cubic-bezier(0.16,1,0.3,1)_400ms_both]"
                }`}
              >
                {/* Visual styling: transforms, opacity, blur, reflection */}
                <span
                  className="relative block h-full w-full transition-[opacity,filter,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-0.8cqw]"
                  style={
                    {
                      opacity: pos.opacity,
                      filter: isHero
                        ? "none"
                        : `blur(${pos.blur}px) saturate(0.55) contrast(0.85)`,
                      WebkitBoxReflect:
                        "below 2px linear-gradient(transparent 72%, rgba(255,255,255,0.22))",
                    } as CSSProperties
                  }
                >
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    priority={kind === initialHeroKind}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 65vw"
                    className="object-contain object-bottom drop-shadow-[0_1.2cqw_1.8cqw_rgba(26,28,25,0.16)]"
                  />
                </span>
              </span>

              {/* Dynamic contact shadow anchored under product base */}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-[1cqw] left-[8%] right-[8%] h-[2.2cqw] rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%, rgba(26,28,25,0.3) 0%, rgba(26,28,25,0.08) 50%, transparent 75%)",
                  transform: isHero ? "scale(1.1)" : "scale(0.88)",
                  transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Chips Rail
// ---------------------------------------------------------------------------

function ProductChipsRail({
  members,
  selectedKind,
  onSelect,
  onNext,
  onPrev,
}: {
  members: FamilyMember[];
  selectedKind: DeviceKind;
  onSelect: (k: DeviceKind, fromUser?: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active chip into view on mobile
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedKind]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div
      role="group"
      aria-label="Product lines"
      onKeyDown={onKeyDown}
      className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1.5 snap-x snap-mandatory [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
    >
      {members.map((m) => {
        const isActive = selectedKind === m.kind;
        return (
          <button
            key={m.kind}
            ref={isActive ? activeBtnRef : undefined}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(m.kind, true)}
            className={`shrink-0 snap-start rounded-full border px-4 py-2 text-small font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink ${
              isActive
                ? "border-ink bg-ink text-white shadow-sm"
                : "border-line bg-surface/85 text-ink-2 hover:border-ink/20 hover:bg-surface"
            }`}
          >
            {KIND_LABEL[m.kind]}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Caption Panel (updates in place, aria-live polite once interacted)
// ---------------------------------------------------------------------------

function ShowcaseCaption({
  selected,
  shown,
  phoneCount,
  foldCount,
  userInteracted,
  onShelf,
}: {
  selected: FamilyMember;
  shown: FamilyImage | undefined;
  phoneCount: number;
  foldCount: number;
  userInteracted: boolean;
  onShelf: () => void;
}) {
  const ask = useStoreChatLink(
    `Hi Amrit Mobiles {store}! Do you have ${selected.name} in stock?`
  );
  const onShelfCount =
    selected.kind === "phone"
      ? phoneCount
      : PHONE_KINDS.includes(selected.kind)
      ? foldCount
      : 0;

  return (
    <div
      className="mt-3 min-h-[76px] rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-[0_12px_32px_-16px_rgba(26,28,25,0.12)] backdrop-blur-md"
      aria-live={userInteracted ? "polite" : "off"}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-body font-extrabold text-ink">{selected.name}</p>
          <p className="text-small text-ink-3">
            {selected.line}
            {shown && <span className="text-ink-4"> Pictured: {shown.model}.</span>}
          </p>
        </div>

        {onShelfCount > 0 ? (
          <button
            type="button"
            onClick={onShelf}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink px-5 py-2.5 text-small font-bold text-white transition-all hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            See {onShelfCount} in stock
          </button>
        ) : (
          <a
            {...ask}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-lime px-5 py-2.5 text-small font-bold text-[#2A2A2A] transition-all hover:bg-lime-lo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Ask if it&apos;s in stock
          </a>
        )}
      </div>
    </div>
  );
}
