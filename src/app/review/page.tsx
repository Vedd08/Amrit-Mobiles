import type { Metadata } from "next";
import Link from "next/link";
import { ReviewComposer } from "@/frontend/components/review/ReviewComposer";
import { BRANCHES, REVIEW_BRANCHES } from "@/shared/branches";
import { BrandLogo } from "@/shared/BrandLogo";

export const metadata: Metadata = {
  title: "Review us on Google — Amrit Mobiles",
  description: "Rate your visit to Amrit Mobiles and post a review on Google in a few taps.",
};

/**
 * The page the counter QR codes open. Standalone, with no site navigation, so
 * a shopper who scans it lands straight on the form. /review?store=<slug>
 * picks that branch (slugs in shared/branches.ts).
 */
export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ store?: string }> }) {
  const { store } = await searchParams;
  const initialBranch = REVIEW_BRANCHES.some((b) => b.slug === store) ? store! : null;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-paper">
      {/* Soft logo-colour glow behind the header. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(60%_70%_at_20%_0%,color-mix(in_srgb,var(--color-lime)_22%,transparent),transparent_70%),radial-gradient(50%_60%_at_90%_10%,color-mix(in_srgb,var(--color-teal)_18%,transparent),transparent_70%)]"
      />

      <main className="relative mx-auto max-w-xl px-4 pt-8 pb-12 sm:pt-12">
        <header className="text-center">
          <Link href="/" className="inline-block" aria-label="Amrit Mobiles home">
            <BrandLogo className="mx-auto h-16 w-auto" />
          </Link>
          <div className="mt-5">
            <p className="m-0 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1 text-micro font-bold uppercase text-ink-2">
              <span aria-hidden className="text-lime-ink">★</span> Google review
            </p>
          </div>
          <h1 className="mt-3 mb-0 text-[34px] leading-[1.05] font-extrabold tracking-[-0.03em] text-ink sm:text-[42px]">
            How was your visit?
          </h1>
          <p className="mx-auto mt-3 mb-0 max-w-sm text-body leading-relaxed text-ink-3">
            Rate us, tick what stood out, and we&apos;ll help put it into words. You post it on Google from your own account.
          </p>
        </header>

        <div className="mt-8">
          <ReviewComposer initialBranch={initialBranch} />
        </div>

        <footer className="mt-10 text-center">
          <p className="m-0 text-xs font-semibold text-ink-3">
            Amrit Mobiles &amp; Electronics · {BRANCHES.length} stores across Surat
          </p>
          <Link href="/phones" className="mt-2 inline-block text-xs font-bold text-ink underline decoration-ink-4 underline-offset-4 hover:text-ink">
            Shop phones online
          </Link>
        </footer>
      </main>
    </div>
  );
}
