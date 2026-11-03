"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/frontend/components/motion/SmoothScrollProvider";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/frontend/components/phones/icons";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { OFFER_KINDS, offerInitials, offerKind, type OfferData } from "@/shared/offers";

type CardOffer = Pick<OfferData, "kind" | "provider" | "logoUrl" | "title" | "details"> &
  Partial<Pick<OfferData, "endsAt" | "minPrice">>;

const dateIN = (iso: string, year = true) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(year && { year: "numeric" }),
    timeZone: "Asia/Kolkata",
  });

/** Line marks for each offer type, on the same 24-grid as phones/icons. */
function KindIcon({ kind, className = "h-3.5 w-3.5" }: { kind: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    BANK: <path d="M3 10h18M5 10v8m4.67-8v8m4.66-8v8M19 10v8M3 20h18M12 3l9 5H3l9-5z" />,
    CREDIT_CARD: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M2.5 10h19M6.5 15h4" />
      </>
    ),
    DEBIT_CARD: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M2.5 9.5h19M6.5 14.5h2m3 0h2" />
      </>
    ),
    EMI: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 10h17M8 3v4m8-4v4M9.5 17l5-4.5" />
      </>
    ),
    UPI: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z" />,
  };
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind] ?? paths.BANK}
    </svg>
  );
}

function KindTag({ kind }: { kind: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/15 py-1 pr-2.5 pl-2 text-[10.5px] font-bold uppercase leading-none tracking-[0.06em] text-ink-2">
      <KindIcon kind={kind} className="h-3.5 w-3.5 text-lime-ink" />
      {offerKind(kind).label}
    </span>
  );
}

function OfferLogo({ offer, size = "h-10 w-10" }: { offer: Pick<CardOffer, "provider" | "logoUrl">; size?: string }) {
  return offer.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={offer.logoUrl}
      alt=""
      loading="lazy"
      decoding="async"
      className={`${size} shrink-0 rounded-[10px] border border-line bg-white object-contain p-1`}
    />
  ) : (
    <span
      aria-hidden
      className={`${size} grid shrink-0 place-items-center rounded-[10px] border border-line bg-linear-to-br from-paper to-paper-2 text-xs font-extrabold text-ink-2`}
    >
      {offerInitials(offer.provider)}
    </span>
  );
}

/** Rupee amounts and percentages in a headline: "₹4,000", "10%", "Rs. 1500". */
const AMOUNT = /((?:₹|Rs\.?\s?)\s?\d[\d,]*(?:\.\d+)?|\d+(?:\.\d+)?\s?%)/gi;

/** The headline with its amounts picked out by a lime highlighter stroke. */
function Headline({ text }: { text: string }) {
  return text.split(AMOUNT).map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        className="bg-[linear-gradient(transparent_58%,color-mix(in_srgb,var(--color-lime)_45%,transparent)_58%,color-mix(in_srgb,var(--color-lime)_45%,transparent)_92%,transparent_92%)] font-extrabold whitespace-nowrap text-ink"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
}

/** The voucher's left/right notches, cut on the tear line 44px (the footer) up from the bottom. */
const NOTCHES =
  "[--notch:calc(100%_-_44px)] [mask:radial-gradient(circle_at_0_var(--notch),transparent_7px,#000_7.5px)_left/51%_100%_no-repeat,radial-gradient(circle_at_100%_var(--notch),transparent_7px,#000_7.5px)_right/51%_100%_no-repeat]";

/** One offer card. Also used as the live preview in the admin offer form. */
export function OfferCard({ offer, onMore }: { offer: CardOffer; onMore?: () => void }) {
  const Tag = onMore ? "button" : "div";
  const footnote = offer.endsAt
    ? `Valid till ${dateIN(offer.endsAt, false)}`
    : offer.minPrice
      ? `On phones above ${formatINR(offer.minPrice)}`
      : "T&C apply";

  // The shadow is a drop-shadow on this wrapper, not a box-shadow on the card:
  // the notch mask would clip a box-shadow, while this one follows the notches.
  return (
    <div className="h-full [filter:drop-shadow(0_1px_1px_rgba(26,28,25,0.05))_drop-shadow(0_6px_10px_rgba(26,28,25,0.07))]">
      <Tag
        {...(onMore && { type: "button" as const, onClick: onMore, "aria-haspopup": "dialog" as const })}
        className={`group flex h-full w-full flex-col rounded-[14px] border border-line bg-surface text-left transition-colors duration-200 ${NOTCHES} ${
          onMore ? "cursor-pointer hover:border-ink-4" : ""
        }`}
      >
        <div className="flex flex-1 flex-col p-4 pb-3.5">
          <div className="flex items-center justify-between gap-3">
            <KindTag kind={offer.kind} />
            <OfferLogo offer={offer} />
          </div>
          <p className="mt-3 truncate text-xs font-semibold text-ink-3">{offer.provider || "Bank name"}</p>
          <p className="mt-0.5 line-clamp-2 text-[15px] font-bold leading-snug text-ink">
            <Headline text={offer.title || "Offer headline"} />
          </p>
          {offer.details && (
            <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-ink-3">{offer.details}</p>
          )}
        </div>

        <div className="mx-3 border-t border-dashed border-line" aria-hidden />
        <div className="flex h-11 items-center justify-between gap-2 px-4">
          <span className="truncate text-[11.5px] font-semibold text-ink-3">{footnote}</span>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-ink">
            Details
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Tag>
    </div>
  );
}

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
    `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
      active ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-ink-4"
    }`;
  const count = (active: boolean) => `text-[11px] font-bold ${active ? "text-white/70" : "text-ink-4"}`;

  return (
    <section aria-labelledby="offers-title">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime text-ink">
            <PercentIcon className="h-4 w-4" />
          </span>
          <h2 id="offers-title" className="m-0 text-lg font-bold leading-tight tracking-tight text-ink">
            Super Savings
            <span className="ml-1.5 align-middle text-xs font-bold text-ink-3">
              {offers.length} offer{offers.length === 1 ? "" : "s"}
            </span>
          </h2>
        </div>
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
        <div className="-mx-4 mt-3.5 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          <button type="button" onClick={() => pick(null)} aria-pressed={kind === null} className={chip(kind === null)}>
            All <span className={count(kind === null)}>{offers.length}</span>
          </button>
          {kinds.map((k) => {
            const active = kind === k.value;
            return (
              <button key={k.value} type="button" onClick={() => pick(k.value)} aria-pressed={active} className={chip(active)}>
                {k.plural} <span className={count(active)}>{offers.filter((o) => o.kind === k.value).length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bleeds to the screen edge on phones so the next card peeks in. The
          vertical padding keeps the cards' shadows from being clipped. */}
      <div
        ref={railRef}
        className="-mx-4 mt-1 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-2.5 pb-3 [scrollbar-width:none] md:-mx-1 md:scroll-px-1 md:px-1"
      >
        {shown.map((offer) => (
          <div key={offer.id} className="w-[78%] max-w-68 shrink-0 snap-start sm:w-64">
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
          <div className="pb-6">
            <div className="bg-linear-to-b from-lime/15 to-white px-5 pt-4 pb-1 sm:px-6 sm:pt-6">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15 sm:hidden" aria-hidden />
              <div className="flex items-start gap-3">
                <OfferLogo offer={open} size="h-12 w-12" />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="m-0 truncate font-bold leading-tight text-ink">{open.provider}</p>
                  <div className="mt-1.5">
                    <KindTag kind={open.kind} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  aria-label="Close"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/80 text-ink-3 transition-colors hover:bg-paper hover:text-ink"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <h3 id="offer-sheet-title" className="mt-4 mb-0 text-xl font-bold leading-snug tracking-tight text-ink">
                <Headline text={open.title} />
              </h3>
            </div>

            <div className="px-5 sm:px-6">
              {(open.endsAt || open.minPrice) && (
                <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-line">
                  {open.endsAt && (
                    <SheetFact label="Valid till" value={dateIN(open.endsAt)} />
                  )}
                  {open.minPrice && (
                    <SheetFact label="On phones above" value={formatINR(open.minPrice)} />
                  )}
                </dl>
              )}

              <p className="mt-5 mb-0 text-micro font-bold uppercase text-ink-3">Offer details</p>
              <p className="mt-2 mb-0 whitespace-pre-line text-small leading-relaxed text-ink-2">{open.details}</p>

              <p className="mt-5 mb-0 flex gap-2.5 rounded-xl bg-paper px-3.5 py-3 text-xs leading-relaxed text-ink-3">
                <InfoIcon className="mt-px h-4 w-4 shrink-0 text-ink-4" />
                Offers are run by the bank or lender and can change. Our store team will confirm it before you pay.
              </p>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

function SheetFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line px-3.5 py-2.5 not-first:border-l only:col-span-2">
      <dt className="text-micro font-bold uppercase text-ink-3">{label}</dt>
      <dd className="m-0 mt-0.5 text-small font-bold text-ink">{value}</dd>
    </div>
  );
}

function PercentIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <path d="M19 5L5 19" />
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
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
      className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink shadow-sh-1 transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}
