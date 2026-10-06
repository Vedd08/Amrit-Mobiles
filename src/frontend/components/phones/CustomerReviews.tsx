import { SectionHeader } from "./SectionHeader";

export type Review = {
  name: string;
  branch: string;
  bought: string;
  stars: number;
  quote: string;
};

/**
 * ⚠️ PLACEHOLDER COPY — NOT REAL CUSTOMERS. REPLACE BEFORE THIS GOES LIVE.
 *
 * Amrit has a genuine 4.9★ Google rating across six branches, so real reviews
 * exist and should be pulled through instead of these. Publishing invented
 * testimonials on a real shop's site misleads its customers, and the rating
 * claim next to them makes it worse. Pass real ones into <CustomerReviews
 * reviews={...} /> and delete this array.
 */
const PLACEHOLDER_REVIEWS: Review[] = [
  {
    name: "Placeholder name",
    branch: "Mahaprabhu Nagar branch",
    bought: "iPhone 15 Pro Max",
    stars: 5,
    quote: "Replace with a real Google review. Keep it to two or three lines so the cards stay level.",
  },
  {
    name: "Placeholder name",
    branch: "Godadara branch",
    bought: "Galaxy S24 Ultra",
    stars: 5,
    quote: "Replace with a real Google review. Mentioning the branch and the handset makes these read as specific.",
  },
  {
    name: "Placeholder name",
    branch: "Limbayat branch",
    bought: "OnePlus 12",
    stars: 4,
    quote: "Replace with a real Google review. A four-star one in the set reads as more honest than all fives.",
  },
];

/** Initials rather than a photo — a monogram is honest where a stock face is not. */
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-void/60 text-small font-bold text-lime-lo backdrop-blur-md border border-line-dark">
      {initials}
    </span>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" aria-hidden className={`h-3.5 w-3.5 ${i < n ? "text-lime-lo" : "text-line-dark"}`}>
          <path
            fill="currentColor"
            d="M10 1.6l2.47 5.2 5.53.75-4.05 3.86 1.02 5.6L10 14.32l-4.97 2.69 1.02-5.6L2 7.55l5.53-.75z"
          />
        </svg>
      ))}
    </span>
  );
}

export function CustomerReviews({ reviews = PLACEHOLDER_REVIEWS }: { reviews?: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="border-t border-line-dark/40 bg-base py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          kicker="4.9★ across six branches"
          title="What people say at the counter"
          sub="Reviews from customers who bought in Surat."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <li key={i} className="flex flex-col rounded-lg border border-line-dark bg-raised p-6 md:p-8">
              <Stars n={r.stars} />
              <blockquote className="mt-4 flex-1 text-small leading-relaxed text-ink-hi">
                “{r.quote}”
              </blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-line-dark/50 pt-5">
                <Monogram name={r.name} />
                <span className="min-w-0">
                  <span className="block truncate text-small font-bold text-ink-hi">{r.name}</span>
                  <span className="block truncate text-micro text-ink-mid">
                    {r.bought} · {r.branch}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
