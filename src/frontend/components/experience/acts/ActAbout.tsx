'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BRANCHES, branchAddress, distanceKm, type Branch } from '@/shared/branches';
import { SURAT_VIEW, TAPI_PATH, inSurat, suratXY } from '@/shared/surat-map';
import { nearestBranch, useStoreChat } from '@/frontend/store/store-chat-store';
import { BranchChatButton } from '@/frontend/components/whatsapp/BranchChatButton';
import { WhatsAppIcon } from '@/frontend/components/icons';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';
import { OwnerStudio } from '@/frontend/components/experience/ui/OwnerStudio';
import { CompanyJourney } from '@/frontend/components/experience/ui/CompanyJourney';

/*
 * About: Amrit told through the city. A light map of Surat with the real
 * course of the Tapi and every branch pinned where it actually is; tap a pin
 * for directions or a WhatsApp chat. If the visitor has already shared their
 * location (for "chat with your nearest store"), they show up on the map too.
 * Beside it, the four things that happen at every Amrit counter.
 */

const STEPS = [
  'Your phone comes in a sealed box, and we open it in front of you.',
  'We check the IMEI with you and print it on your GST bill.',
  '0% EMI is approved right at the counter, usually in about ten minutes.',
  'Bring your old phone: we value it on the spot and take it off the price.',
];

/** Which side of its pin a label sits, so neighbours don't collide. */
const LABEL_SIDE: Record<string, 'left' | 'right' | 'top' | 'bottom'> = {
  pal: 'right',
  vesu: 'right',
  udhna: 'left',
  'ring-road-1': 'top',
  limbayat: 'bottom',
  'mahaprabhu-nagar': 'top',
  godadara: 'right',
  'pandol-ved-road': 'top',
};

type Pin = { id: string; branches: Branch[]; x: number; y: number; label: string };

/** One pin per spot: branches a few hundred metres apart (the two Ring Roads) share one. */
function buildPins(): Pin[] {
  const pins: Pin[] = [];
  for (const b of BRANCHES) {
    const near = pins.find((p) => distanceKm(p.branches[0], b) < 0.25);
    if (near) {
      near.branches.push(b);
      continue;
    }
    const { x, y } = suratXY(b.lat, b.lng);
    pins.push({ id: b.slug, branches: [b], x, y, label: b.name });
  }
  return pins.map((p) =>
    p.branches.length > 1 ? { ...p, label: `${p.branches[0].name.replace(/\s*\(.*\)$/, '')} (${p.branches.length} shops)` } : p,
  );
}

/** The river path reversed (west to east) so its label reads left to right. */
function reversePath(d: string) {
  const pts = d.slice(1).split(' L').map((s) => s.trim());
  return 'M' + pts.reverse().join(' L');
}

export function ActAbout() {
  const pins = useMemo(() => buildPins(), []);
  const riverLabelPath = useMemo(() => reversePath(TAPI_PATH), []);
  const reducedMotion = useReducedMotion();
  // The map's own block (the studio card above it is much taller).
  const sectionRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  // undefined = the visitor hasn't picked a pin: show their nearest, if known.
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const location = useStoreChat((s) => s.location);
  const status = useStoreChat((s) => s.status);
  const locate = useStoreChat((s) => s.locate);

  // The map draws itself once, the first time it comes into view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const you = location && inSurat(location.lat, location.lng) ? suratXY(location.lat, location.lng) : null;
  const nearestId = location ? pins.find((p) => p.branches.some((b) => b.slug === nearestBranch(location).slug))?.id : undefined;
  const selected = picked === undefined ? (nearestId ?? null) : picked;
  const setSelected = setPicked;
  const shown = seen || reducedMotion;
  const active = pins.find((p) => p.id === selected);
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <section id="about" className="relative z-10 px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto mb-16 max-w-site md:mb-24 md:px-4">
        <OwnerStudio />
      </div>
      <div className="mx-auto mb-20 max-w-site md:mb-32 md:px-4">
        <CompanyJourney />
      </div>
      <div ref={sectionRef} className="mx-auto grid max-w-site items-center gap-12 md:px-4 lg:grid-cols-12 lg:gap-16 [&>*]:min-w-0">
        {/* Story */}
        <div className="lg:col-span-5">
          <h2 className="text-4xl font-bold leading-[1.02] tracking-tight text-ink md:text-6xl">
            Surat&apos;s phone shop, on both sides of the Tapi.
          </h2>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-ink-2">
            Amrit Mobiles is {BRANCHES.length} branches across the city, from Pal on the far bank of the river to
            Godadara in the east. Whichever counter you walk into, it works the same way.
          </p>
          <ol className="mt-8 border-t border-line">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-4 border-b border-line py-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime text-sm font-extrabold text-[#2A2A2A]">
                  {i + 1}
                </span>
                <span className="pt-1 text-base font-semibold leading-snug text-ink">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* The map */}
        <div className="lg:col-span-7">
          <div
            className="relative overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_60px_-40px_rgba(26,28,25,0.45)]"
            style={{ aspectRatio: `${SURAT_VIEW.w} / ${SURAT_VIEW.h}` }}
          >
            <svg
              viewBox={`0 0 ${SURAT_VIEW.w} ${SURAT_VIEW.h}`}
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <defs>
                <pattern id="about-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.6" fill="#E2E4DD" />
                </pattern>
                <path id="about-tapi-label" d={riverLabelPath} />
              </defs>
              <rect width="100%" height="100%" fill="url(#about-dots)" />
              {/* The river: a soft band with a brighter current, drawn in once */}
              <path
                d={TAPI_PATH}
                pathLength={1}
                fill="none"
                stroke="#D6F0F2"
                strokeWidth="46"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1"
                style={{ strokeDashoffset: shown ? 0 : 1, transition: reducedMotion ? 'none' : 'stroke-dashoffset 1.8s cubic-bezier(0.65,0,0.35,1)' }}
              />
              <path
                d={TAPI_PATH}
                pathLength={1}
                fill="none"
                stroke="#55C2CD"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1"
                style={{ strokeDashoffset: shown ? 0 : 1, transition: reducedMotion ? 'none' : 'stroke-dashoffset 1.8s cubic-bezier(0.65,0,0.35,1) 120ms' }}
              />
              <text
                className="fill-[#2E8C96] text-[30px] font-bold italic"
                style={{ opacity: shown ? 1 : 0, transition: 'opacity 600ms ease 1.4s' }}
              >
                <textPath href="#about-tapi-label" startOffset="70%" dy="-30">
                  Tapi
                </textPath>
              </text>
              {/* North */}
              <g transform={`translate(${SURAT_VIEW.w - 70} 70)`} className="fill-[#9A9C93]">
                <path d="M0 -26 L10 6 L0 0 L-10 6 Z" />
                <text y="34" textAnchor="middle" className="text-[22px] font-bold">
                  N
                </text>
              </g>
            </svg>

            {/* You */}
            {you && (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: pct(you.x, SURAT_VIEW.w), top: pct(you.y, SURAT_VIEW.h) }}
              >
                <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-teal/30 motion-reduce:animate-none" />
                <span className="relative block h-3.5 w-3.5 rounded-full border-2 border-white bg-teal shadow" />
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
                  You
                </span>
              </div>
            )}

            {/* Branch pins */}
            {pins.map((pin, i) => {
              const isActive = selected === pin.id;
              const side = LABEL_SIDE[pin.id] ?? 'right';
              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => setSelected(isActive ? null : pin.id)}
                  aria-pressed={isActive}
                  aria-label={`${pin.label}${pin.id === nearestId ? ', nearest to you' : ''}`}
                  className="group absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center focus-visible:outline-none"
                  style={{
                    left: pct(pin.x, SURAT_VIEW.w),
                    top: pct(pin.y, SURAT_VIEW.h),
                    opacity: shown ? 1 : 0,
                    transform: `translate(-50%, -50%) scale(${shown ? 1 : 0.4})`,
                    transition: reducedMotion ? 'none' : `opacity 400ms ease ${900 + i * 90}ms, transform 500ms cubic-bezier(0.34,1.56,0.64,1) ${900 + i * 90}ms`,
                    zIndex: isActive ? 3 : 2,
                  }}
                >
                  <span
                    className={`block rounded-full border-[3px] border-white shadow-[0_4px_10px_-2px_rgba(26,28,25,0.45)] transition-all duration-200 group-focus-visible:ring-2 group-focus-visible:ring-lime-ink ${
                      isActive ? 'h-5 w-5 bg-ink' : 'h-4 w-4 bg-lime group-hover:scale-125'
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute whitespace-nowrap rounded-full border border-line bg-white/95 px-2 py-0.5 text-[11px] font-bold text-ink shadow-sm sm:text-xs ${
                      isActive ? 'block' : 'hidden sm:block'
                    } ${
                      side === 'right'
                        ? 'left-full ml-0.5'
                        : side === 'left'
                          ? 'right-full mr-0.5'
                          : side === 'top'
                            ? 'bottom-full mb-0.5'
                            : 'top-full mt-0.5'
                    }`}
                  >
                    {pin.label}
                  </span>
                </button>
              );
            })}

            {/* Selected branch */}
            {active && (
              <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-line bg-white/95 p-4 shadow-[0_18px_40px_-20px_rgba(26,28,25,0.5)] backdrop-blur-sm sm:inset-x-auto sm:left-4 sm:max-w-sm">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-ink-3 hover:bg-paper hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                    <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
                <div className="space-y-3">
                  {active.branches.map((b) => (
                    <div key={b.slug} className="pr-6">
                      <p className="font-extrabold text-ink">
                        {b.name}
                        {b.note && <span className="font-semibold text-lime-ink"> · {b.note}</span>}
                        {active.id === nearestId && active.branches.length === 1 && (
                          <span className="ml-2 rounded-full bg-lime px-2 py-0.5 align-middle text-[11px] font-bold text-[#2A2A2A]">
                            Nearest to you
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm leading-snug text-ink-3">{branchAddress(b)}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href={b.maps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white hover:bg-ink-2"
                        >
                          Directions
                        </a>
                        <BranchChatButton
                          branch={b}
                          className="inline-flex items-center gap-1.5 rounded-full bg-lime/15 px-3.5 py-1.5 text-xs font-bold text-lime-ink hover:bg-lime/25"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" /> Chat
                        </BranchChatButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Branch chips (the way in on small screens, where pins are small) */}
          <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {pins.map((pin) => (
              <button
                key={pin.id}
                type="button"
                onClick={() => setSelected(selected === pin.id ? null : pin.id)}
                aria-pressed={selected === pin.id}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                  selected === pin.id ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-2 hover:border-ink/25'
                }`}
              >
                {pin.label}
              </button>
            ))}
            {!location && status !== 'denied' && status !== 'unavailable' && (
              <button
                type="button"
                onClick={locate}
                disabled={status === 'locating'}
                className="shrink-0 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1.5 text-sm font-bold text-[#2E8C96] transition-colors hover:bg-teal/20 disabled:opacity-60"
              >
                {status === 'locating' ? 'Finding you…' : 'Show my nearest'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
