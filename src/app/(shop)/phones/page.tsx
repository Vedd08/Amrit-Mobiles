import type { Metadata } from "next";
import Link from "next/link";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { getAllPhones } from "@/backend/lib/queries";
import {
  brandsWithCounts,
  PHONE_CATEGORIES,
  phonesForBrand,
  phonesForCategory,
  searchPhones,
  sortPhones,
  pickShowcase,
} from "@/shared/phone-catalog";
import { SUGGESTIONS } from "@/shared/search-suggestions";
import { PhoneHero } from "@/frontend/components/phones/PhoneHero";
import { BrandGrid, type BrandTile } from "@/frontend/components/phones/BrandGrid";
import { CategoryGrid, type CategoryTile } from "@/frontend/components/phones/CategoryGrid";
import { ProductRail } from "@/frontend/components/phones/ProductRail";
import { PhonePromo } from "@/frontend/components/phones/PhonePromo";
import { TrustRow } from "@/frontend/components/phones/TrustRow";
import { HowItWorks } from "@/frontend/components/phones/HowItWorks";
import { BranchStrip } from "@/frontend/components/phones/BranchStrip";
import { SectionHeader } from "@/frontend/components/phones/SectionHeader";
import { PhoneProductCard } from "@/frontend/components/phones/PhoneProductCard";
import { Stagger } from "@/frontend/components/motion/Stagger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Phones — Amrit Mobiles",
  description: "Every major smartphone brand, genuine sealed stock, and 0% EMI at the counter — from Amrit Mobiles, Surat.",
};

const GridSection = ({
  kicker,
  title,
  sub,
  action,
  products,
}: {
  kicker?: string;
  title: string;
  sub?: string;
  action?: { href: string; label: string };
  products: ProductCardData[];
}) => (
  <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 border-t border-line first:border-0">
    <SectionHeader kicker={kicker} title={title} sub={sub} action={action} />
    <Stagger as="ul" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.slug}>
          <PhoneProductCard product={p} />
        </li>
      ))}
    </Stagger>
  </section>
);

export default async function PhonesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const all = await getAllPhones();

  // One handset per brand for the rail's overhanging photo — the priciest,
  // since flagship shots are the most flattering.
  const brands: BrandTile[] = brandsWithCounts(all).map((b) => {
    const top = [...phonesForBrand(all, b)].sort((a, c) => c.price - a.price).find((p) => p.image);
    return { ...b, image: top?.image ?? null };
  });
  const trending = sortPhones(all, "featured").slice(0, 8);
  const newArrivals = all.slice(0, 8);
  const deals = all
    .filter((p): p is ProductCardData & { mrp: number } => Boolean(p.mrp && p.mrp > p.price))
    .sort((a, b) => b.mrp - b.price - (a.mrp - a.price))
    .slice(0, 8);

  // One representative photo per category — priciest phone first (its shot is
  // usually the most flattering), skipping any image another tile already
  // took, since the seed catalogue reuses stock photos across models.
  const usedImages = new Set<string>();
  const categoryTiles: CategoryTile[] = PHONE_CATEGORIES.map((c) => {
    const items = [...phonesForCategory(all, c)].sort((a, b) => b.price - a.price);
    const pick = items.find((p) => p.image && !usedImages.has(p.image)) ?? items[0];
    if (pick?.image) usedImages.add(pick.image);
    return {
      tile: { slug: c.slug, name: c.name, image: pick?.image ?? null, count: items.length },
      count: items.length,
    };
  })
    .filter((c) => c.count > 0)
    .slice(0, 6)
    .map((c) => c.tile);

  const results = q ? searchPhones(all, q) : null;
  const budgetCounts = {
    under15: all.filter((p) => p.price <= 15000).length,
    under25: all.filter((p) => p.price <= 25000).length,
    under40: all.filter((p) => p.price <= 40000).length,
    flagships: [...phonesForCategory(all, PHONE_CATEGORIES.find((c) => c.slug === "flagship")!)].length,
  };

  const stats = {
    phonesInStock: all.filter(p => p.stock > 0).length,
    brandCount: new Set(all.map(p => p.brand)).size,
    lowestPrice: Math.min(...all.map(p => p.price)),
  };

  return (
    <div className="phones-scope bg-paper text-ink">
      {results ? (
        <section className="mx-auto max-w-7xl px-4 pb-4 pt-16 sm:px-6 md:pt-24">
          <p className="text-micro font-bold tracking-widest uppercase text-ink-3">✦ Search results</p>
          <h1 className="mb-0 mt-2 text-3xl md:text-5xl font-extrabold tracking-tighter text-ink">&ldquo;{q}&rdquo;</h1>
          <p className="mt-3 text-small text-ink-3">
            {results.length} {results.length === 1 ? "phone" : "phones"}
          </p>
          {results.length > 0 ? (
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((p, i) => (
                <li key={p.slug}>
                  <PhoneProductCard product={p} priority={i < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-lg border border-line bg-surface shadow-sh-1 px-6 py-12 text-center text-small text-ink">
              <p className="text-body font-bold text-ink">No phones match that search.</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-micro font-bold tracking-widest text-ink-3 uppercase mr-1">Popular:</span>
                {SUGGESTIONS.map((s) => (
                  <Link
                    key={s}
                    href={`/phones?q=${encodeURIComponent(s)}`}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-micro font-medium text-ink transition-colors hover:border-lime-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
                  >
                    {s}
                  </Link>
                ))}
              </div>
              <Link href="/phones" className="mt-8 inline-flex items-center justify-center rounded-full bg-lime px-6 py-3 font-bold text-[#2A2A2A] hover:bg-lime-lo transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink">
                Browse all phones
              </Link>
            </div>
          )}
        </section>
      ) : (
        <PhoneHero budgetCounts={budgetCounts} stats={stats} showcase={pickShowcase(all)} />
      )}

      <TrustRow />

      <BrandGrid brands={brands} />

      <GridSection
        title="Featured phones"
        sub="In stock now, best first."
        action={{ href: "/phones/all", label: "See all" }}
        products={trending}
      />

      <CategoryGrid categories={categoryTiles} />

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 border-t border-line">
        <SectionHeader title="New arrivals" sub="Just landed on the Surat shelves." />
        <ProductRail products={newArrivals} badge="new" />
      </section>

      <PhonePromo />

      {deals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 border-t border-line">
          <SectionHeader
            title="Today's best deals"
            sub="The largest discounts off MRP right now."
            action={{ href: "/phones/all", label: "See all" }}
          />
          <ProductRail products={deals} badge="discount" />
        </section>
      )}

      <HowItWorks />
      <BranchStrip />
    </div>
  );
}
