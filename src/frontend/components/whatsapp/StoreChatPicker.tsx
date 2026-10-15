"use client";

import { useEffect, useMemo, useRef } from "react";
import { WhatsAppIcon } from "@/frontend/components/icons";
import { useLenis } from "@/frontend/components/motion/SmoothScrollProvider";
import { nearestBranch, useStoreChat } from "@/frontend/store/store-chat-store";
import { CHAT_BRANCHES, distanceKm } from "@/shared/branches";
import { branchWhatsAppLink } from "@/shared/whatsapp";

function formatKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/**
 * The sheet a WhatsApp button opens when we don't yet know which store to
 * send the visitor to. It asks for their location, puts the nearest store on
 * top, and lists every store as a fallback. Picking one remembers it, so later
 * WhatsApp buttons go straight there. Mount once per layout.
 */
export function StoreChatPicker() {
  const { picker, status, location, closePicker, choose, locate, hydrate } = useStoreChat();
  const lenis = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // While open: no page scroll behind it, Esc closes, focus moves in and back.
  useEffect(() => {
    if (!picker.open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    lenis?.stop();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePicker();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
      lenis?.start();
      returnFocusRef.current?.focus?.();
    };
  }, [picker.open, lenis, closePicker]);

  const sorted = useMemo(() => {
    const list = CHAT_BRANCHES.map((b) => ({ branch: b, km: location ? distanceKm(location, b) : null }));
    if (location) list.sort((a, b) => a.km! - b.km!);
    return list;
  }, [location]);

  if (!picker.open) return null;

  const nearest = location ? nearestBranch(location) : null;
  const others = nearest ? sorted.filter((s) => s.branch.slug !== nearest.slug) : sorted;
  const pick = (slug: string) => {
    choose(slug);
    closePicker();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-6">
      {/* Light, frosted backdrop (the site stays light everywhere). */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={closePicker}
        className="absolute inset-0 cursor-default bg-paper/70 backdrop-blur-sm motion-safe:animate-[fadeIn_200ms_ease-out]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-chat-title"
        tabIndex={-1}
        data-lenis-prevent
        className="relative flex max-h-[88svh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-[0_-20px_60px_-20px_rgba(26,28,25,0.35)] outline-none sm:max-w-md sm:rounded-3xl motion-safe:animate-[sheetUp_280ms_cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden />

        <div className="flex items-start gap-3 px-5 pb-3 pt-4 sm:px-6 sm:pt-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime/15 text-lime-ink">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="store-chat-title" className="text-lg font-extrabold leading-tight text-ink">
              Chat with your nearest store
            </h2>
            <p className="mt-0.5 text-small text-ink-3" aria-live="polite">
              {status === "locating" && "Finding the store closest to you…"}
              {status === "located" && "Sorted by distance from you."}
              {status === "denied" && "Location is off, so pick the store you'd like to chat with."}
              {status === "unavailable" && "Couldn't get your location. Pick a store below."}
              {status === "idle" && "Pick a store, or use your location to find the closest."}
            </p>
          </div>
          <button
            type="button"
            onClick={closePicker}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-paper hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6 sm:pb-6">
          {status === "locating" && (
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-4 text-small font-semibold text-ink-2">
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-lime border-t-transparent" aria-hidden />
              Locating…
            </div>
          )}

          {status === "idle" && (
            <button
              type="button"
              onClick={locate}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-paper py-3 text-small font-bold text-ink transition-colors hover:border-lime"
            >
              <PinIcon /> Use my location
            </button>
          )}

          {nearest && (
            <div className="mb-4 rounded-2xl border-2 border-lime bg-lime/5 p-4">
              <p className="text-micro font-bold uppercase tracking-widest text-lime-ink">Nearest to you</p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="text-xl font-extrabold text-ink">{nearest.name}</p>
                <p className="shrink-0 text-small font-bold text-ink-2">{formatKm(distanceKm(location!, nearest))}</p>
              </div>
              <p className="text-small text-ink-3">
                {nearest.area}
                {nearest.note ? ` · ${nearest.note}` : ""}
              </p>
              <a
                href={branchWhatsAppLink(nearest, picker.message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => pick(nearest.slug)}
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-lime py-3.5 text-[15px] font-bold text-[#2A2A2A] shadow-[0_10px_22px_-10px_rgba(95,138,13,0.9)] transition-transform hover:-translate-y-px"
              >
                <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
              </a>
            </div>
          )}

          <p className="mb-2 text-micro font-bold uppercase tracking-widest text-ink-3">
            {nearest ? "Or another store" : "Our stores"}
          </p>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {others.map(({ branch, km }) => (
              <li key={branch.slug}>
                <a
                  href={branchWhatsAppLink(branch, picker.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => pick(branch.slug)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">{branch.name}</span>
                    <span className="block truncate text-small text-ink-3">
                      {branch.area}
                      {branch.note ? ` · ${branch.note}` : ""}
                    </span>
                  </span>
                  {km !== null && <span className="shrink-0 text-small font-semibold text-ink-3">{formatKm(km)}</span>}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime/15 text-lime-ink" aria-hidden>
                    <WhatsAppIcon className="h-4 w-4" />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-center text-micro text-ink-4">
            Your location stays on your device. It&apos;s only used to sort the stores.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sheetUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
