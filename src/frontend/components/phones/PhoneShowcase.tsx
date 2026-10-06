"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { PHONE_BRANDS, ramGB, storageGB } from "@/shared/phone-catalog";
import { LogoStar } from "./LogoStar";
import { useReducedMotion } from "@/frontend/lib/use-reduced-motion";

export type PhoneHeroStats = {
  phonesInStock: number;
  brandCount: number;
  lowestPrice: number;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Vivid lock-screen wallpaper per brand: [deep, mid, light]. */
const WALLPAPERS: Record<string, [string, string, string]> = {
  apple: ["#5B4BDB", "#A18CFF", "#FFC6E6"],
  samsung: ["#1D4ED8", "#60A5FA", "#A7F3D0"],
  oneplus: ["#E11D48", "#FB7185", "#FDBA74"],
  google: ["#2563EB", "#34D399", "#FDE68A"],
  xiaomi: ["#EA580C", "#FB923C", "#FDE68A"],
  vivo: ["#4338CA", "#818CF8", "#67E8F9"],
  oppo: ["#047857", "#34D399", "#D9F99D"],
  realme: ["#CA8A04", "#FACC15", "#BEF264"],
  poco: ["#B45309", "#F59E0B", "#FDE68A"],
  nothing: ["#3F3F46", "#A1A1AA", "#E4E4E7"],
  motorola: ["#1E40AF", "#93C5FD", "#C4B5FD"],
};
const DEFAULT_WALL: [string, string, string] = ["#5F8A0D", "#92C318", "#55C2CD"];

function wallpaper(brand: string) {
  const [deep, mid, light] = WALLPAPERS[brand.toLowerCase()] ?? DEFAULT_WALL;
  return [
    `radial-gradient(120% 70% at 85% 105%, ${light} 0%, transparent 55%)`,
    `radial-gradient(90% 60% at 0% 60%, ${mid} 0%, transparent 60%)`,
    `radial-gradient(110% 70% at 70% 15%, ${mid}CC 0%, transparent 60%)`,
    `linear-gradient(165deg, ${deep} 0%, ${mid} 55%, ${light} 100%)`,
  ].join(", ");
}

/** Real photographic lock-screen wallpaper per brand (Unsplash, stored locally). */
function wallpaperSrc(brand: string) {
  const slug = PHONE_BRANDS.find((b) => b.dbBrand.toLowerCase() === brand.toLowerCase())?.slug;
  const known = ["apple", "samsung", "oneplus", "google", "xiaomi", "vivo", "oppo", "realme", "nothing", "motorola", "poco"];
  return `/images/wallpapers/${slug && known.includes(slug) ? slug : "default"}.webp`;
}

const stripBrand = (p: ProductCardData) => p.name.replace(new RegExp(`^${p.brand}\\s+`, "i"), "");

// left, centre, right — sides are turned toward the centre in real 3D.
const SLOTS = [
  { x: -60, ry: 30, rz: -3, scale: 0.84, z: 1, delay: "0.4s", bob: "6.2s", edge: "left" as const },
  { x: 0, ry: 0, rz: 0, scale: 1, z: 3, delay: "0s", bob: "5.4s", edge: null },
  { x: 60, ry: -30, rz: 3, scale: 0.84, z: 2, delay: "0.8s", bob: "6.8s", edge: "right" as const },
];

const preserve3d = { transformStyle: "preserve-3d" as const };

/**
 * The /phones hero centrepiece: three realistic handsets (titanium frame,
 * glass bezel, Dynamic Island, side buttons, real edge thickness) fanned in 3D.
 * Their lock screens carry a notification for a real in-stock model, and they
 * rotate through the catalogue every few seconds. Static (no rotation, no
 * links) when `interactive` is false — the homepage portal's copy of this hero,
 * which must match the first frame of /phones exactly.
 */
export function PhoneShowcase({
  phones,
  stats,
  interactive,
}: {
  phones: ProductCardData[];
  stats?: PhoneHeroStats;
  interactive: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const n = phones.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const onScreenRef = useRef(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (onScreenRef.current = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!interactive || reducedMotion || paused || n < 2) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible" && onScreenRef.current) setIndex((i) => (i + 1) % n);
    }, 3800);
    return () => window.clearInterval(id);
  }, [interactive, reducedMotion, paused, n]);

  useEffect(() => {
    if (!interactive || reducedMotion) return;
    // Tilt follows a mouse; touch screens skip the per-frame loop entirely.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = (e.clientX / innerWidth - 0.5) * 2;
      target.y = (e.clientY / innerHeight - 0.5) * 2;
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!onScreenRef.current) return;
      const dx = target.x - cur.x;
      const dy = target.y - cur.y;
      if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) return;
      cur.x += dx * 0.06;
      cur.y += dy * 0.06;
      if (tiltRef.current) {
        tiltRef.current.style.transform = `rotateY(${cur.x * 9}deg) rotateX(${-cur.y * 6}deg)`;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive, reducedMotion]);

  const centre = n > 0 ? phones[index % n] : null;

  return (
    <div
      ref={rootRef}
      className="relative mx-auto h-[440px] w-full max-w-[580px] sm:h-[480px] lg:h-[600px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label={interactive ? "Featured phones in stock" : undefined}
      aria-hidden={interactive ? undefined : true}
      role={interactive ? "region" : undefined}
    >
      {/* Halo, star and floor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[44%] h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(146,195,24,0.28) 0%, rgba(85,194,205,0.14) 35%, rgba(146,195,24,0) 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[44%] h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 opacity-55 motion-safe:animate-[spin_50s_linear_infinite]"
      >
        <LogoStar className="h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[19%] left-1/2 h-10 w-[72%] -translate-x-1/2 rounded-[50%]"
        style={{ background: "radial-gradient(ellipse, rgba(26,28,25,0.28) 0%, rgba(26,28,25,0) 70%)" }}
      />

      {/* The fan */}
      <div className="absolute inset-x-0 top-0 bottom-[18%]">
        <div ref={tiltRef} className="absolute inset-0 will-change-transform">
          {SLOTS.map((slot, s) => {
            const phone = n > 0 ? phones[(index + s - 1 + n * 2) % n] : null;
            return (
              <div
                key={s}
                className="absolute left-1/2 top-1/2"
                style={{
                  ...preserve3d,
                  zIndex: slot.z,
                  transform: `translate(-50%, -50%) translateX(${slot.x}%) perspective(1200px) rotateY(${slot.ry}deg) rotateZ(${slot.rz}deg) scale(${slot.scale})`,
                }}
              >
                <div className="hero-showcase-phone" style={preserve3d}>
                  <div
                    className="motion-safe:animate-[showcaseBob_var(--bob)_ease-in-out_infinite]"
                    style={{ ...preserve3d, ["--bob" as string]: slot.bob, animationDelay: slot.delay }}
                  >
                    <Handset phone={phone} edge={slot.edge} interactive={interactive} swapKey={`${index}-${s}`} slotDelay={s * 90} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption for the phone in front */}
      {centre && (
        <div className="absolute inset-x-0 bottom-[3%] flex flex-col items-center gap-2 text-center">
          <div key={centre.slug} className="motion-safe:animate-[showcaseScreenIn_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
            <p className="text-micro font-bold uppercase tracking-[0.2em] text-ink-3">{centre.brand}</p>
            <p className="text-lg font-extrabold tracking-tight text-ink lg:text-xl">
              {stripBrand(centre)} <span className="ml-1 tabular-nums text-lime-ink">{inr(centre.price)}</span>
            </p>
          </div>
          {!interactive && (
            <div className="flex items-center gap-4" aria-hidden="true">
              <span className="rounded-full bg-lime px-5 py-2 text-small font-bold text-[#2A2A2A] shadow-[0_10px_24px_-10px_rgba(95,138,13,0.8)]">
                View phone →
              </span>
              {n > 1 && (
                <span className="flex items-center gap-1.5">
                  {phones.map((p, i) => (
                    <span key={p.slug} className={`h-2 rounded-full ${i === 0 ? "w-6 bg-lime" : "w-2 bg-steel"}`} />
                  ))}
                </span>
              )}
            </div>
          )}
          {interactive && (
            <div className="flex items-center gap-4">
              <Link
                href={`/product/${centre.slug}`}
                className="rounded-full bg-lime px-5 py-2 text-small font-bold text-[#2A2A2A] shadow-[0_10px_24px_-10px_rgba(95,138,13,0.8)] transition-transform hover:scale-[1.03]"
              >
                View phone →
              </Link>
              {n > 1 && (
                <div className="flex items-center gap-1.5">
                  {phones.map((p, i) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show ${p.name}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === index % n ? "w-6 bg-lime" : "w-2 bg-steel hover:bg-lime-ink"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live stat pills */}
      {stats && (
        <>
          <StatPill className="left-0 top-[6%] sm:left-[1%]" style={{ animationDelay: "0.2s" }}>
            <span className="h-2 w-2 rounded-full bg-lime" /> {stats.phonesInStock} phones in stock
          </StatPill>
          <StatPill className="right-0 top-[20%] sm:right-[0%]" style={{ animationDelay: "1.1s" }}>
            {stats.brandCount} brands
          </StatPill>
          <StatPill className="bottom-[30%] left-[0%] hidden sm:flex" style={{ animationDelay: "0.7s" }}>
            From {inr(stats.lowestPrice)}
          </StatPill>
        </>
      )}

      {centre && interactive && (
        <p className="sr-only" aria-live="polite">
          Showing {centre.name}, {inr(centre.price)}
        </p>
      )}

      <style>{`
        @keyframes showcaseBob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes showcaseScreenIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: none; }
        }
        @keyframes showcaseWallIn { from { opacity: 0.55; transform: scale(1.1); filter: brightness(1.25); } to { opacity: 1; transform: none; filter: none; } }
        @keyframes showcaseGlint {
          from { transform: translateX(-130%) skewX(-18deg); opacity: 0.85; }
          to { transform: translateX(240%) skewX(-18deg); opacity: 0; }
        }
        @keyframes showcasePill { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
      `}</style>
    </div>
  );
}

function StatPill({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white/95 px-4 py-2 text-xs font-bold text-ink shadow-[0_10px_30px_-12px_rgba(26,28,25,0.35)] motion-safe:animate-[showcasePill_5s_ease-in-out_infinite] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

const TITANIUM =
  "linear-gradient(135deg, #E9EDF0 0%, #B9C4CE 18%, #F5F7F8 32%, #9AA9B7 50%, #DCE3E8 68%, #8E9DAB 84%, #CDD6DD 100%)";
const TITANIUM_EDGE = "linear-gradient(180deg, #DCE3E8 0%, #8E9DAB 20%, #C9D2DA 50%, #7F8E9C 80%, #D5DCE2 100%)";

function Handset({
  phone,
  edge,
  interactive,
  swapKey,
  slotDelay,
}: {
  phone: ProductCardData | null;
  edge: "left" | "right" | null;
  interactive: boolean;
  swapKey: string;
  slotDelay: number;
}) {
  const body = (
    <div
      className="relative h-[310px] w-[150px] rounded-[30px] p-[2.5px] sm:h-[370px] sm:w-[180px] sm:rounded-[36px] lg:h-[480px] lg:w-[234px] lg:rounded-[46px] lg:p-[3px]"
      style={{
        ...preserve3d,
        background: TITANIUM,
        boxShadow:
          "0 50px 80px -30px rgba(26,28,25,0.45), 0 30px 40px -25px rgba(95,138,13,0.35), inset 0 0 0 0.5px rgba(255,255,255,0.8)",
      }}
    >
      {/* Edge thickness, visible because the side phones are turned in 3D */}
      {edge && (
        <div
          aria-hidden="true"
          className="absolute top-[7%] bottom-[7%] w-[9px] lg:w-[11px]"
          style={{
            background: TITANIUM_EDGE,
            [edge]: 0,
            transformOrigin: edge,
            transform: `rotateY(${edge === "left" ? 90 : -90}deg)`,
          }}
        />
      )}

      {/* Side buttons */}
      <span aria-hidden="true" className="absolute -left-[2px] top-[17%] h-[5%] w-[3px] rounded-l-sm" style={{ background: TITANIUM_EDGE }} />
      <span aria-hidden="true" className="absolute -left-[2px] top-[25%] h-[9%] w-[3px] rounded-l-sm" style={{ background: TITANIUM_EDGE }} />
      <span aria-hidden="true" className="absolute -left-[2px] top-[36%] h-[9%] w-[3px] rounded-l-sm" style={{ background: TITANIUM_EDGE }} />
      <span aria-hidden="true" className="absolute -right-[2px] top-[28%] h-[14%] w-[3px] rounded-r-sm" style={{ background: TITANIUM_EDGE }} />

      {/* Black glass bezel */}
      <div className="relative h-full w-full rounded-[28px] bg-[#0B0C0D] p-[5px] sm:rounded-[33px] sm:p-[6px] lg:rounded-[43px] lg:p-[7px]">
        <div className="relative h-full w-full overflow-hidden rounded-[23px] sm:rounded-[27px] lg:rounded-[36px]">
          {phone ? <LockScreen phone={phone} swapKey={swapKey} slotDelay={slotDelay} /> : <BlankScreen />}

          {/* Glass reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(118deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 34%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 100%)",
            }}
          />
          {phone && (
            <span
              key={`glint-${swapKey}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/60 to-transparent motion-safe:animate-[showcaseGlint_1s_ease-out_both]"
              style={{ animationDelay: `${slotDelay + 150}ms` }}
            />
          )}
        </div>

        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-[11px] h-[17px] w-[30%] -translate-x-1/2 rounded-full bg-black sm:top-[13px] sm:h-[20px] lg:top-[16px] lg:h-[26px]">
          <span className="absolute right-[14%] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-[#1B2533] lg:h-[7px] lg:w-[7px]" />
        </div>
      </div>
    </div>
  );

  if (!interactive || !phone) return body;
  return (
    <Link
      href={`/product/${phone.slug}`}
      aria-label={`${phone.name}, ${inr(phone.price)}`}
      className="block rounded-[46px] transition-transform duration-300 hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-ink"
      style={preserve3d}
    >
      {body}
    </Link>
  );
}

function StatusIcons() {
  return (
    <span className="flex items-center gap-[3px] text-white">
      <svg viewBox="0 0 18 12" className="h-[7px] w-auto lg:h-[9px]" fill="currentColor" aria-hidden="true">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
        <rect x="10" y="3" width="3" height="9" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" />
      </svg>
      <svg viewBox="0 0 16 12" className="h-[7px] w-auto lg:h-[9px]" fill="currentColor" aria-hidden="true">
        <path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.3-1.4A10.4 10.4 0 0 0 8 .6C5.2.6 2.6 1.7.7 3.5L2 4.9a8.5 8.5 0 0 1 6-2.4Zm0 3.7c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.8 6.8 0 0 0 8 4.3a6.8 6.8 0 0 0-4.7 1.8l1.3 1.4c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.7l1.3-1.4c-.3-.3-.8-.5-1.3-.5Z" />
      </svg>
      <svg viewBox="0 0 27 12" className="h-[7px] w-auto lg:h-[9px]" aria-hidden="true">
        <rect x="0.5" y="0.5" width="23" height="11" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.5" />
        <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" />
        <path d="M25 4v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" fillOpacity="0.5" />
      </svg>
    </span>
  );
}

function LockScreen({ phone, swapKey, slotDelay }: { phone: ProductCardData; swapKey: string; slotDelay: number }) {
  const ram = ramGB(phone);
  const storage = storageGB(phone);
  const specs = [ram ? `${ram}GB RAM` : null, storage ? (storage >= 1024 ? `${storage / 1024}TB` : `${storage}GB`) : null]
    .filter(Boolean)
    .join(" · ");
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="absolute inset-0 text-white">
      {/* Wallpaper */}
      <div
        key={`wall-${swapKey}`}
        className="absolute inset-0 motion-safe:animate-[showcaseWallIn_0.8s_cubic-bezier(0.16,1,0.3,1)_both]"
        style={{ background: wallpaper(phone.brand), animationDelay: `${slotDelay}ms` }}
      >
        <Image src={wallpaperSrc(phone.brand)} alt="" fill sizes="(min-width: 1024px) 240px, 180px" className="object-cover" />
      </div>
      {/* Keeps the white clock and notification legible on any photo */}
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/0 via-45% to-black/35" />

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-[9%] pt-[4.5%] text-[8px] font-semibold lg:text-[11px]">
        <span className="opacity-90">Amrit</span>
        <StatusIcons />
      </div>

      {/* Date + clock */}
      <div className="relative mt-[13%] text-center [text-shadow:0_1px_12px_rgba(0,0,0,0.18)]">
        <p className="text-[8px] font-semibold opacity-90 lg:text-[12px]" suppressHydrationWarning>
          {today}
        </p>
        <p className="mt-[1%] text-[46px] font-bold leading-none tracking-tight sm:text-[56px] lg:text-[74px]">9:41</p>
      </div>

      {/* Notification */}
      <div
        key={swapKey}
        className="absolute inset-x-[5%] bottom-[17%] rounded-[14px] bg-white/30 p-[6%] motion-safe:animate-[showcaseScreenIn_0.6s_cubic-bezier(0.16,1,0.3,1)_both] lg:rounded-[20px] lg:p-[5%]"
        style={{ animationDelay: `${slotDelay + 120}ms`, boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.45)" }}
      >
        <div className="flex items-start gap-2">
          <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] bg-lime lg:h-[26px] lg:w-[26px] lg:rounded-[7px]">
            <LogoStar className="h-[70%] w-[70%]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[7px] font-semibold opacity-85 lg:text-[10px]">
              <span>AMRIT MOBILES</span>
              <span>now</span>
            </div>
            <p className="mt-[2px] line-clamp-2 text-[9px] font-bold leading-tight lg:text-[13px]">{stripBrand(phone)} is in stock</p>
            <p className="truncate text-[8px] leading-tight opacity-90 lg:text-[11px]">
              {inr(phone.price)}
              {specs ? ` · ${specs}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Torch / camera + home indicator */}
      <div className="absolute inset-x-[10%] bottom-[5.5%] flex items-center justify-between">
        <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-black/25 lg:h-[34px] lg:w-[34px]">
          <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M8 2h8l-1 6H9L8 2Zm1 6v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8" />
          </svg>
        </span>
        <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-black/25 lg:h-[34px] lg:w-[34px]">
          <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </span>
      </div>
      <div className="absolute bottom-[2%] left-1/2 h-[3px] w-[34%] -translate-x-1/2 rounded-full bg-white/90 lg:h-[4px]" />
    </div>
  );
}

function BlankScreen() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(165deg, #5F8A0D 0%, #92C318 55%, #55C2CD 100%)" }}
    />
  );
}
