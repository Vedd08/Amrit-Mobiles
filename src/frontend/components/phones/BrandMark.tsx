// Monochrome brand marks. Everything renders in `currentColor` so the parent
// decides the ink — the /phones section keeps them all charcoal rather than
// each brand's colour, which is what keeps the "Shop by brand" rail calm.
//
// Recognition comes from the letterform treatment, not colour: Xiaomi and
// vivo lowercase, Nothing spaced thin, Apple and Motorola as glyphs.

// Same font-size everywhere (the caller sets it); only weight and tracking
// vary, so the rail reads as one set rather than eleven logo sizes.
const WORDMARK: Record<string, { text: string; className: string }> = {
  samsung: { text: "SAMSUNG", className: "font-semibold " },
  google: { text: "Google", className: "font-semibold " },
  oneplus: { text: "OnePlus", className: "font-bold " },
  xiaomi: { text: "xiaomi", className: "font-bold " },
  nothing: { text: "NOTHING", className: "font-normal " },
  realme: { text: "realme", className: "font-extrabold " },
  oppo: { text: "OPPO", className: "font-extrabold " },
  vivo: { text: "vivo", className: "font-extrabold " },
  poco: { text: "POCO", className: "font-extrabold " },
};

export function BrandMark({ slug, className = "" }: { slug: string; className?: string }) {
  if (slug === "apple") {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-[1.35em] w-[1.35em]">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.35c.64-.78 1.08-1.87.96-2.95-.92.04-2.04.62-2.7 1.39-.58.67-1.1 1.77-.96 2.84 1.03.08 2.06-.5 2.7-1.28" />
        </svg>
      </span>
    );
  }

  if (slug === "motorola") {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden className="h-[1.15em] w-[1.15em]">
          <circle cx="12" cy="12" r="9.2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V9l2.6 4L12 9.2 14.4 13 17 9v7" />
        </svg>
        <span className="font-semibold lowercase">motorola</span>
      </span>
    );
  }

  const w = WORDMARK[slug];
  if (!w) return <span className={`font-bold ${className}`}>{slug}</span>;
  return <span className={`${w.className} ${className}`}>{w.text}</span>;
}
