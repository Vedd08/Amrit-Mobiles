"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/frontend/components/motion/SmoothScrollProvider";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/frontend/components/phones/icons";
import { OFFER_KINDS, offerInitials, offerKind, type OfferData } from "@/shared/offers";

type CardOffer = Pick<OfferData, "kind" | "provider" | "logoUrl" | "title" | "details">;

function OfferLogo({ offer, size = "h-8 w-8" }: { offer: Pick<CardOffer, "provider" | "logoUrl">; size?: string }) {
  return offer.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={offer.logoUrl}
      alt=""
      loading="lazy"
      decoding="async"
      className={`${size} shrink-0 rounded-sm border border-line bg-white object-contain p-0.5`}
    />
  ) : (
    <span
      aria-hidden
      className={`${size} grid shrink-0 place-items-center rounded-sm bg-paper-2 text-micro font-bold tracking-normal text-ink-2`}
    >
      {offerInitials(offer.provider)}
    </span>
  );
}

/** One offer card. Also used as the live preview in the admin offer form. */
export function OfferCard({ offer, onMore }: { offer: CardOffer; onMore?: () => void }) {
  return (
    <article className="flex h-full flex-col rounded-md border border-line bg-surface p-4">
      <div className="flex items-center gap-2.5">
        <OfferLogo offer={offer} />
        <div className="min-w-0">
          <p className="truncate text-small font-bold leading-tight text-ink">{offer.provider || "Bank name"}</p>
          <p className="text-micro font-bold uppercase text-lime-ink">{offerKind(offer.kind).label}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-small font-bold leading-snug text-ink">{offer.title || "Offer headline"}</p>
      <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-ink-3">{offer.details}</p>
      <button
        type="button"
        onClick={onMore}
        className="mt-auto self-start pt-3 text-xs font-bold text-ink underline decoration-ink-4 underline-offset-4 hover:decoration-ink"
      >
        View more
      </button>
    </article>
  );
}

const dateIN = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

/**
 * "Super Savings" on the product page: a swipeable row of the bank, card, EMI
 * and UPI offers that apply to this phone, with type filters when there's a
 * mix, and the full terms in a sheet. Offers come from /admin/offers.
 */
export function ProductOffers({ offers }: { offers: OfferData[] }) {
  const [kind, setKind] = useState<string | null>(null);
  const [open, setOpen] = useState<OfferData | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const railRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();

  const kinds = OFFER_KINDS.filter((k) => offers.some((o) => o.kind === k.value));
  const shown = kind ? offers.filter((o) => o.kind === kind) : offers;

  // Arrows only need to know whether the row is at either end. Passive, and
  // React skips the render when neither end changed.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const start = rail.scrollLeft <= 4;
      const end = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [shown.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    if (!dialog.open) dialog.showModal();
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  if (offers.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: dir * rail.clientWidth * 0.85, behavior: "smooth" });
  };
  const pick = (value: string | null) => {
    setKind(value);
    railRef.current?.scrollTo({ left: 0 });
  };
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
      active ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-steel"
    }`;

  return (
    <section aria-labelledby="offers-title">
      <div className="flex items-end justify-between gap-3 border-b-2 border-ink pb-2">
        <h2 id="offers-title" className="text-lg font-bold text-ink">
          Super Savings{" "}
          <span className="text-small font-bold uppercase text-ink-3">
            ({offers.length} offer{offers.length === 1 ? "" : "s"})
          </span>
        </h2>
        {shown.length > 1 && (
          <div className="hidden gap-1.5 sm:flex">
            <ArrowButton label="Previous offers" disabled={edges.start} onClick={() => scrollBy(-1)}>
              <ArrowLeftIcon className="h-4 w-4" />
            </ArrowButton>
            <ArrowButton label="More offers" disabled={edges.end} onClick={() => scrollBy(1)}>
              <ArrowRightIcon className="h-4 w-4" />
            </ArrowButton>
          </div>
        )}
      </div>

      {kinds.length > 1 && (
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          <button type="button" onClick={() => pick(null)} aria-pressed={kind === null} className={chip(kind === null)}>
            All
          </button>
          {kinds.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => pick(k.value)}
              aria-pressed={kind === k.value}
              className={chip(kind === k.value)}
            >
              {k.plural} ({offers.filter((o) => o.kind === k.value).length})
            </button>
          ))}
        </div>
      )}

      {/* Bleeds to the screen edge on phones so the next card peeks in. */}
      <div
        ref={railRef}
        className="-mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0"
      >
        {shown.map((offer) => (
          <div key={offer.id} className="w-[74%] max-w-64 shrink-0 snap-start sm:w-60">
            <OfferCard offer={offer} onMore={() => setOpen(offer)} />
          </div>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="offer-sheet-title"
        data-lenis-prevent
        onClose={() => setOpen(null)}
        onClick={(e) => {
          // A tap on the backdrop lands on the <dialog> itself.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="mx-auto mb-0 mt-auto max-h-[85svh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-white p-0 text-ink shadow-[0_-20px_60px_-20px_rgba(26,28,25,0.35)] backdrop:bg-paper/70 backdrop:backdrop-blur-sm open:motion-safe:animate-[sheetUp_280ms_cubic-bezier(0.16,1,0.3,1)] sm:my-auto sm:max-w-md sm:rounded-3xl"
      >
        {open && (
          <div className="px-5 pb-6 pt-4 sm:px-6 sm:pt-6">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden />
            <div className="flex items-start gap-3">
              <OfferLogo offer={open} size="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight text-ink">{open.provider}</p>
                <p className="text-micro font-bold uppercase text-lime-ink">{offerKind(open.kind).label}</p>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-paper hover:text-ink"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <h3 id="offer-sheet-title" className="mt-4 text-lg font-bold leading-snug text-ink">
              {open.title}
            </h3>
            <p className="mt-2 whitespace-pre-line text-small leading-relaxed text-ink-2">{open.details}</p>
            {open.endsAt && (
              <p className="mt-4 rounded-md bg-paper px-3.5 py-2.5 text-xs font-bold text-ink-2">
                Valid till {dateIN(open.endsAt)}
              </p>
            )}
            <p className="mt-4 text-xs text-ink-3">
              Offers are run by the bank or lender and can change. Our store team will confirm it before you pay.
            </p>
          </div>
        )}
      </dialog>
    </section>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}
