"use client";

import Link from "next/link";
import { useWishlistStore } from "@/frontend/store/wishlist-store";
import { useMounted } from "@/frontend/lib/use-mounted";
import { PhoneProductCard } from "@/frontend/components/phones/PhoneProductCard";

export default function WishlistPage() {
  const mounted = useMounted();
  const items = useWishlistStore((s) => s.items);
  const clear = useWishlistStore((s) => s.clear);

  return (
    <div className="phones-scope cinematic-catalog-wrapper min-h-screen bg-void px-4 pb-16 pt-16 md:pt-24 text-ink-hi sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-0 text-3xl md:text-5xl font-bold uppercase tracking-tight leading-none text-ink-hi">Wishlist</h1>

        {!mounted ? (
          <div className="mt-8 h-40" aria-hidden />
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-line-dark bg-base/60 backdrop-blur-md px-6 py-16 text-center">
            <p className="text-body font-bold uppercase tracking-wider text-ink-hi">Nothing saved yet</p>
            <p className="mx-auto mt-2 max-w-[36ch] text-small text-ink-mid">
              Tap the heart on any phone to keep it here for later.
            </p>
            <Link
              href="/phones"
              className="mt-6 inline-flex rounded-full bg-lime px-6 py-3 text-small font-bold text-[#2A2A2A] hover:bg-[#A9D93F] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-lo"
            >
              BROWSE PHONES
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-small font-bold uppercase tracking-widest text-lime-lo">{items.length} saved</p>
              <button
                type="button"
                onClick={clear}
                className="text-small font-bold uppercase tracking-widest text-ink-mid hover:text-lime-lo transition-colors"
              >
                Clear all
              </button>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <li key={p.slug}>
                  <PhoneProductCard product={p} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
