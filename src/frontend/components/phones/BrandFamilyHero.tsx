"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PhoneBrand } from "@/shared/phone-catalog";
import {
  BRAND_FAMILIES,
  KIND_LABEL,
  PHONE_KINDS,
  type BrandFamily,
  type DeviceKind,
  type FamilyMember,
} from "@/shared/brand-family";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { useLenis } from "@/frontend/components/motion/SmoothScrollProvider";
import { useStoreChatLink } from "@/frontend/store/store-chat-store";
import { WhatsAppIcon } from "@/frontend/components/icons";
import { ArrowLeftIcon } from "./icons";
import { BrandMark } from "./BrandMark";

/*
 * Brand page hero: the brand's whole family standing on a two-tier display
 * riser, like the counter display in the shop. Every device is drawn in CSS
 * and sized in container units (cqw), so the scene scales as one piece from
 * a phone screen to a desktop. Tapping a device (or its chip) lifts it and
 * says what it is: phones point to the shelf below, everything else to a
 * WhatsApp chat with the nearest store.
 */

const BACK_ROW: DeviceKind[] = ["tablet", "phone", "fold"];
const FRONT_ROW: DeviceKind[] = ["buds", "flip", "watch"];

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
  const family = BRAND_FAMILIES[brand.slug];
  const [active, setActive] = useState<DeviceKind | null>(null);
  const lenis = useLenis();
  const ask = useStoreChatLink(`Hi Amrit Mobiles {store}! I'm looking at ${brand.name}. What do you have in stock?`);

  if (!family) return null;
  const member = (kind: DeviceKind) => family.members.find((m) => m.kind === kind);
  const selected = active ? member(active) : undefined;
  const toggle = (kind: DeviceKind) => setActive((k) => (k === kind ? null : kind));

  const toShelf = () => {
    const shelf = document.getElementById("shelf");
    if (!shelf) return;
    if (lenis) lenis.scrollTo(shelf, { offset: -150 });
    else shelf.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative">
      <Link
        href="/phones"
        className="inline-flex items-center gap-1.5 text-small font-semibold text-ink-3 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All phones
      </Link>

      {/* min-w-0: the one-line chip scroller must not widen the grid track. */}
      <div className="mt-6 grid items-center gap-8 lg:grid-cols-12 lg:gap-10 [&>*]:min-w-0">
        {/* Copy */}
        <div className="lg:col-span-5">
          <h1 className="mb-0 text-[clamp(52px,7.2vw,108px)] font-extrabold leading-[0.88] tracking-[-0.05em] text-ink">
            {brand.name}
          </h1>
          <p className="mt-5 max-w-[22ch] text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em] text-ink-2">
            {family.tagline}
          </p>
          <p className="mt-4 max-w-[46ch] text-body text-ink-3">
            {brand.blurb}{" "}
            {phoneCount > 0
              ? `${phoneCount} ${phoneCount === 1 ? "phone" : "phones"} in stock now, from ${formatINR(fromPrice)}.`
              : "Ask us what's coming in this week."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toShelf}
              className="rounded-full bg-lime px-7 py-3.5 text-small font-bold text-[#2A2A2A] shadow-[0_12px_24px_-12px_rgba(95,138,13,0.9)] transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            >
              Shop {brand.name} phones
            </button>
            <a
              {...ask}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-small font-bold text-ink transition-colors hover:border-ink/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            >
              <WhatsAppIcon className="h-4 w-4 text-lime-ink" />
              Ask the nearest store
            </a>
          </div>
        </div>

        {/* The display */}
        <div className="lg:col-span-7">
          <div
            className="relative"
            style={{
              background: `radial-gradient(60% 55% at 50% 42%, color-mix(in srgb, ${brand.accent} 11%, transparent), transparent 70%)`,
            }}
          >
            <Riser family={family} slug={brand.slug} active={active} onPick={toggle} member={member} />
          </div>

          {/* Device chips */}
          <div
            className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
            role="group"
            aria-label={`${brand.name} devices`}
          >
            {family.members.map((m) => (
              <button
                key={m.kind}
                type="button"
                aria-pressed={active === m.kind}
                onClick={() => toggle(m.kind)}
                className={`shrink-0 rounded-full border px-4 py-2 text-small font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink ${
                  active === m.kind
                    ? "border-lime bg-lime text-[#2A2A2A]"
                    : "border-line bg-white text-ink-2 hover:border-ink/25"
                }`}
              >
                {KIND_LABEL[m.kind]}
              </button>
            ))}
          </div>

          <Caption
            brand={brand}
            selected={selected}
            phoneCount={phoneCount}
            foldCount={foldCount}
            onShelf={toShelf}
          />
        </div>
      </div>
    </section>
  );
}

function Caption({
  brand,
  selected,
  phoneCount,
  foldCount,
  onShelf,
}: {
  brand: PhoneBrand;
  selected: FamilyMember | undefined;
  phoneCount: number;
  foldCount: number;
  onShelf: () => void;
}) {
  const ask = useStoreChatLink(
    `Hi Amrit Mobiles {store}! Do you have ${selected?.name ?? brand.name} in stock?`,
  );
  const onShelfCount = !selected ? 0 : selected.kind === "phone" ? phoneCount : PHONE_KINDS.includes(selected.kind) ? foldCount : 0;

  return (
    <div className="mt-4 min-h-[76px] rounded-2xl border border-line bg-white px-5 py-4" aria-live="polite">
      {selected ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-body font-extrabold text-ink">{selected.name}</p>
            <p className="text-small text-ink-3">{selected.line}</p>
          </div>
          {onShelfCount > 0 ? (
            <button
              type="button"
              onClick={onShelf}
              className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-small font-bold text-white transition-colors hover:bg-ink-2"
            >
              See {onShelfCount} in stock
            </button>
          ) : (
            <a
              {...ask}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-lime/15 px-5 py-2.5 text-small font-bold text-lime-ink transition-colors hover:bg-lime/25"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Ask if it&apos;s in stock
            </a>
          )}
        </div>
      ) : (
        <p className="py-2 text-small text-ink-3">
          Tap a device to see what it is and whether we have it.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// The riser and its devices. All sizes are cqw of the stage width.
// ---------------------------------------------------------------------------

function Riser({
  family,
  slug,
  active,
  onPick,
  member,
}: {
  family: BrandFamily;
  slug: string;
  active: DeviceKind | null;
  onPick: (k: DeviceKind) => void;
  member: (k: DeviceKind) => FamilyMember | undefined;
}) {
  const back = BACK_ROW.filter((k) => member(k));
  const front = FRONT_ROW.filter((k) => member(k));
  let order = 0;

  const slot = (kind: DeviceKind) => {
    const m = member(kind)!;
    const i = order++;
    const dim = active !== null && active !== kind;
    return (
      <button
        key={kind}
        type="button"
        onClick={() => onPick(kind)}
        aria-label={m.name}
        aria-pressed={active === kind}
        className="group relative block cursor-pointer rounded-[1cqw] transition-[transform,opacity] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-[0.6cqw] focus-visible:outline-lime-ink"
        style={{
          transform: active === kind ? "translateY(-1.8cqw)" : undefined,
          opacity: dim ? 0.38 : 1,
        }}
      >
        <span
          className="block motion-safe:animate-[familyRise_700ms_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{ animationDelay: `${120 + i * 80}ms` }}
        >
          <Device kind={kind} family={family} slug={slug} />
        </span>
        {/* Contact shadow on the riser */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[0.9cqw] left-[6%] right-[6%] h-[1.8cqw] rounded-[50%] bg-[radial-gradient(closest-side,rgba(26,28,25,0.26),transparent)]"
        />
      </button>
    );
  };

  return (
    <div className="relative aspect-[100/68] w-full [container-type:inline-size]">
      {/* Back tier */}
      <Tier style={{ left: "7cqw", right: "7cqw", top: "45cqw", height: "16cqw" }} />
      {/* Front tier, with the brand engraved on its face like a counter placard */}
      <Tier style={{ left: "1cqw", right: "1cqw", top: "57.5cqw", height: "10cqw" }} front>
        <BrandMark slug={slug} className="text-[2.4cqw] text-[#BFC3BA]" />
      </Tier>

      {/* Back row stands on the back tier */}
      <div className="absolute inset-x-[7cqw] top-0 flex h-[46.4cqw] items-end justify-center gap-[2.6cqw]">
        {back.map(slot)}
      </div>
      {/* Front row stands on the front tier */}
      <div
        className={`absolute inset-x-[5cqw] top-0 flex h-[59cqw] items-end ${
          front.length > 1 ? "justify-between" : "justify-center"
        }`}
      >
        {front.map(slot)}
      </div>

      <style jsx global>{`
        @keyframes familyRise {
          from { transform: translateY(3cqw); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/** A white acrylic step: a bright top face over a softly shaded front face. */
function Tier({ style, front = false, children }: { style: CSSProperties; front?: boolean; children?: ReactNode }) {
  return (
    <div aria-hidden className="absolute" style={style}>
      <div className="h-[2.6cqw] rounded-t-[1.2cqw] border border-b-0 border-white bg-[linear-gradient(180deg,#FFFFFF,#F4F5F1)]" />
      <div
        className={`grid h-[calc(100%-2.6cqw)] place-items-center border-x border-b border-line/70 ${front ? "rounded-b-[1cqw]" : ""} bg-[linear-gradient(180deg,#EEF0EA,#FAFBF8_70%)] shadow-[0_2.4cqw_4cqw_-2cqw_rgba(26,28,25,0.18)] [text-shadow:0_1px_0_#fff]`}
      >
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

/** Photo wallpapers available for the screens (public/images/wallpapers). */
const WALLS = ["apple", "google", "motorola", "nothing", "infinix", "oppo", "poco", "realme", "samsung", "vivo", "xiaomi", "tecno", "itel", "default"];

/** The brand's own wallpaper for its phone; the other screens get different photos. */
function wallFor(slug: string, kind: DeviceKind) {
  const step: Record<DeviceKind, number> = { phone: 0, tablet: 4, fold: 7, flip: 2, watch: 0, buds: 0 };
  const i = Math.max(0, WALLS.indexOf(slug));
  return WALLS[(i + step[kind]) % WALLS.length];
}

const TITANIUM =
  "linear-gradient(135deg, #EDF0F2 0%, #BCC5CD 20%, #F7F8F9 36%, #9EABB8 54%, #DEE4E9 72%, #93A1AE 88%, #D2D9DF 100%)";

function Device({ kind, family, slug }: { kind: DeviceKind; family: BrandFamily; slug: string }) {
  switch (kind) {
    case "phone":
      return <PhoneArt family={family} slug={slug} />;
    case "tablet":
      return <TabletArt slug={wallFor(slug, "tablet")} />;
    case "fold":
      return <FoldArt slug={wallFor(slug, "fold")} />;
    case "flip":
      return <FlipArt slug={wallFor(slug, "flip")} />;
    case "watch":
      return <WatchArt shape={family.watch ?? "round"} />;
    case "buds":
      return <BudsArt style={family.buds ?? "stem"} />;
  }
}

/** Titanium frame with a black bezel and a screen showing the brand wallpaper. */
function Handset({
  w,
  h,
  radius,
  bezel,
  slug,
  position = "50% 50%",
  children,
}: {
  w: number;
  h: number;
  radius: number;
  bezel: number;
  slug: string;
  position?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className="relative block shadow-[0_1.6cqw_3cqw_-1.2cqw_rgba(26,28,25,0.45)]"
      style={{ width: `${w}cqw`, height: `${h}cqw`, borderRadius: `${radius}cqw`, background: TITANIUM, padding: "0.3cqw" }}
    >
      <span
        className="block h-full w-full bg-[#0A0B0C]"
        style={{ borderRadius: `${radius - 0.3}cqw`, padding: `${bezel}cqw` }}
      >
        <span className="relative block h-full w-full overflow-hidden" style={{ borderRadius: `${Math.max(0.4, radius - 0.3 - bezel)}cqw` }}>
          <Image
            src={`/images/wallpapers/${slug}.webp`}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, 60vw"
            className="object-cover"
            style={{ objectPosition: position }}
          />
          {children}
        </span>
      </span>
    </span>
  );
}

function PhoneArt({ family, slug }: { family: BrandFamily; slug: string }) {
  return (
    <Handset w={17.5} h={37} radius={3} bezel={0.7} slug={slug} position="50% 40%">
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0)_40%,rgba(0,0,0,0.35))]" />
      {family.camera === "island" ? (
        <span className="absolute left-1/2 top-[1cqw] h-[1.5cqw] w-[5cqw] -translate-x-1/2 rounded-full bg-black" />
      ) : (
        <span className="absolute left-1/2 top-[1.1cqw] h-[1.15cqw] w-[1.15cqw] -translate-x-1/2 rounded-full bg-black" />
      )}
      <span className="absolute inset-x-0 top-[5.6cqw] text-center text-[6.4cqw] font-bold leading-none tracking-[-0.04em] text-white">
        9:41
      </span>
      <span className="absolute inset-x-[1.4cqw] bottom-[4.5cqw] rounded-[1.4cqw] bg-white/25 px-[1.2cqw] py-[1cqw] text-left text-[1cqw] leading-tight text-white backdrop-blur-[2px]">
        <span className="block font-bold">Amrit Mobiles</span>
        Sealed box, IMEI on your bill
      </span>
      <span className="absolute bottom-[1cqw] left-1/2 h-[0.45cqw] w-[6cqw] -translate-x-1/2 rounded-full bg-white/85" />
    </Handset>
  );
}

function TabletArt({ slug }: { slug: string }) {
  return (
    <Handset w={32} h={22.5} radius={1.9} bezel={1.1} slug={slug} position="50% 60%">
      {/* Dock */}
      <span className="absolute bottom-[1cqw] left-1/2 flex -translate-x-1/2 gap-[0.7cqw] rounded-[1.2cqw] bg-white/30 p-[0.7cqw] backdrop-blur-[2px]">
        {["#92C318", "#55C2CD", "#F4F6F3", "#E8B341", "#6B8BF5"].map((c) => (
          <span key={c} className="block h-[2.2cqw] w-[2.2cqw] rounded-[0.6cqw]" style={{ background: c }} />
        ))}
      </span>
    </Handset>
  );
}

function FoldArt({ slug }: { slug: string }) {
  return (
    <Handset w={25} h={18.5} radius={1.6} bezel={0.7} slug={slug} position="30% 50%">
      {/* The crease, barely there */}
      <span className="absolute inset-y-0 left-1/2 w-[0.5cqw] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.18),rgba(0,0,0,0.12),rgba(255,255,255,0))]" />
      <span className="absolute right-[1.2cqw] top-[1.3cqw] h-[0.9cqw] w-[0.9cqw] rounded-full bg-black/80" />
    </Handset>
  );
}

function FlipArt({ slug }: { slug: string }) {
  // Shut, seen from the front: a big cover screen over the top two-thirds,
  // the hinge across the middle edge.
  return (
    <span
      className="relative block shadow-[0_1.4cqw_2.6cqw_-1cqw_rgba(26,28,25,0.45)]"
      style={{ width: "10.5cqw", height: "13cqw", borderRadius: "1.8cqw", background: TITANIUM, padding: "0.3cqw" }}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-[1.5cqw] bg-[#1B1E21]">
        <span className="absolute inset-[0.5cqw] bottom-[0.5cqw] overflow-hidden rounded-[1.2cqw]">
          <Image src={`/images/wallpapers/${slug}.webp`} alt="" fill sizes="120px" className="object-cover" style={{ objectPosition: "70% 50%" }} />
          <span className="absolute left-[0.9cqw] top-[0.9cqw] flex gap-[0.5cqw]">
            <span className="block h-[2.2cqw] w-[2.2cqw] rounded-full bg-[#111] ring-[0.35cqw] ring-[#9AA6B0]" />
            <span className="block h-[2.2cqw] w-[2.2cqw] rounded-full bg-[#111] ring-[0.35cqw] ring-[#9AA6B0]" />
          </span>
          <span className="absolute bottom-[1cqw] right-[1cqw] text-[2.2cqw] font-bold leading-none text-white [text-shadow:0_0.2cqw_0.8cqw_rgba(0,0,0,0.4)]">
            9:41
          </span>
        </span>
      </span>
      {/* Hinge */}
      <span className="absolute inset-x-[0.3cqw] bottom-[0.1cqw] h-[0.9cqw] rounded-b-[1.6cqw] bg-[linear-gradient(180deg,#C9D1D8,#8E9BA7)]" />
    </span>
  );
}

function WatchArt({ shape }: { shape: "round" | "square" }) {
  const round = shape === "round";
  return (
    <span className="relative flex flex-col items-center" style={{ width: "12.5cqw" }}>
      {/* Strap, top */}
      <span className="block h-[4.4cqw] w-[7.4cqw] rounded-t-[1.2cqw] bg-[linear-gradient(180deg,#E7EAE3,#CDD3CB)]" />
      <span
        className="relative -my-[0.4cqw] grid place-items-center shadow-[0_1.2cqw_2.4cqw_-1cqw_rgba(26,28,25,0.5)]"
        style={{
          width: "12cqw",
          height: round ? "12cqw" : "13.6cqw",
          borderRadius: round ? "50%" : "2.6cqw",
          background: TITANIUM,
          padding: "0.45cqw",
        }}
      >
        <span
          className="relative grid h-full w-full place-items-center bg-[#0A0B0C]"
          style={{ borderRadius: round ? "50%" : "2.2cqw" }}
        >
          {/* Activity ring + time */}
          <svg viewBox="0 0 40 40" className="absolute inset-[0.9cqw] h-[calc(100%-1.8cqw)] w-[calc(100%-1.8cqw)]" aria-hidden>
            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(146,195,24,0.22)" strokeWidth="2.4" />
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="#92C318"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="80 107"
              transform="rotate(-90 20 20)"
            />
          </svg>
          <span className="relative text-center leading-none text-white">
            <span className="block text-[2.3cqw] font-bold tracking-[-0.03em]">8,214</span>
            <span className="mt-[0.3cqw] block text-[0.95cqw] font-semibold text-[#A9D93F]">steps</span>
          </span>
        </span>
        {/* Crown */}
        <span className="absolute -right-[0.55cqw] top-[35%] h-[2cqw] w-[0.7cqw] rounded-r-[0.4cqw] bg-[#A4B0BB]" />
      </span>
      {/* Strap, bottom */}
      <span className="block h-[4.4cqw] w-[7.4cqw] rounded-b-[1.2cqw] bg-[linear-gradient(180deg,#CDD3CB,#E7EAE3)]" />
    </span>
  );
}

function BudsArt({ style }: { style: "stem" | "bean" }) {
  return (
    <svg viewBox="0 0 160 100" style={{ width: "19cqw", height: "11.9cqw" }} aria-hidden className="block overflow-visible">
      <defs>
        <linearGradient id="caseFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E6E9E3" />
        </linearGradient>
        <radialGradient id="budGloss" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D9DDD6" />
        </radialGradient>
        <filter id="budShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#1A1C19" floodOpacity="0.28" />
        </filter>
      </defs>
      {/* Case */}
      <g filter="url(#budShadow)">
        <rect x="20" y="16" width="96" height="78" rx={style === "stem" ? 26 : 39} fill="url(#caseFace)" stroke="#C9CEC5" strokeWidth="1.4" />
        <path d={style === "stem" ? "M21 40 H115" : "M21 46 H115"} stroke="#CDD2CA" strokeWidth="1.4" />
        <circle cx="68" cy="66" r="2.6" fill="#92C318" />
      </g>
      {/* Two buds in front */}
      <g filter="url(#budShadow)">
        {style === "stem" ? (
          <>
            <ellipse cx="122" cy="62" rx="15" ry="13" fill="url(#budGloss)" />
            <rect x="117" y="66" width="10" height="30" rx="5" fill="url(#budGloss)" />
            <ellipse cx="148" cy="66" rx="13" ry="11.5" fill="url(#budGloss)" />
            <rect x="143" y="70" width="9" height="26" rx="4.5" fill="url(#budGloss)" />
            <circle cx="118" cy="58" r="4" fill="#2A2D2A" />
          </>
        ) : (
          <>
            <circle cx="126" cy="76" r="17" fill="url(#budGloss)" />
            <circle cx="126" cy="76" r="7" fill="#E1E5DE" />
            <circle cx="152" cy="80" r="14" fill="url(#budGloss)" />
            <circle cx="152" cy="80" r="5.5" fill="#E1E5DE" />
          </>
        )}
      </g>
    </svg>
  );
}
