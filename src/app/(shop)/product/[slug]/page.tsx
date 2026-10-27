import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/backend/lib/queries";
import { AddToCartPanel } from "@/frontend/components/shop/AddToCartPanel";
import { ProductGallery } from "@/frontend/components/shop/ProductGallery";
import { ProductSpecSheet } from "@/frontend/components/shop/ProductSpecSheet";
import { ProductTrustStrip } from "@/frontend/components/shop/ProductTrustStrip";
import { MobileBuyBar } from "@/frontend/components/shop/MobileBuyBar";
import { VariantPicker } from "@/frontend/components/shop/VariantPicker";
import { Reveal } from "@/frontend/components/motion/Reveal";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { PHONE_BRANDS, memoryLabel } from "@/shared/phone-catalog";

// Each product page is cached the first time it's visited, then refreshed every
// 5 minutes or when the catalogue changes (refreshCatalog).
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

// Metadata and the page share one database read.
const loadProduct = cache(getProductBySlug);

/** The four specs shoppers compare first, when the product has them. */
const HIGHLIGHTS = ["Display", "Processor", "Rear camera", "Battery"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Amrit Mobiles`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const mainImage = product.images[0]?.url ?? null;
  const specs = product.parsedSpecs;
  const brand = PHONE_BRANDS.find((b) => b.dbBrand.toLowerCase() === product.brand.toLowerCase());
  const variant = product.variants.find((v) => v.slug === product.slug);
  // With options, the title is the model and the chosen option sits under it.
  const title = product.variants.length > 1 && specs.Model ? specs.Model : product.name;
  const option = variant && product.variants.length > 1 ? [variant.colour, memoryLabel(variant)].filter(Boolean).join(" · ") : null;
  const highlights = HIGHLIGHTS.filter((k) => specs[k]).map((k) => [k, specs[k]] as const);
  // "Model" is already the page title.
  const sheet = Object.fromEntries(Object.entries(specs).filter(([k]) => k !== "Model"));

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-site px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3">
          <Link href="/phones" className="hover:text-ink">
            Phones
          </Link>
          <span aria-hidden>/</span>
          {brand ? (
            <Link href={`/phones/${brand.slug}`} className="hover:text-ink">
              {brand.name}
            </Link>
          ) : (
            <span>{product.brand}</span>
          )}
          <span aria-hidden>/</span>
          <span className="text-ink">{title}</span>
        </nav>

        {/* *:min-w-0 lets both columns shrink to fit; grid items otherwise keep
            their content's natural width and pushed a tablet page sideways. */}
        <div className="grid gap-10 *:min-w-0 md:grid-cols-2 md:gap-12">
          <Reveal>
            {/* Keyed so a colour change starts the new gallery at its first photo. */}
            <ProductGallery
              key={product.slug}
              images={product.images}
              name={product.name}
              brand={product.brand}
              price={product.price}
              mrp={product.mrp}
              discount={discount}
            />
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-xs font-bold uppercase text-ink-3">{brand?.name ?? product.brand}</p>
            <h1 className="mt-1.5 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
            {option && <p className="mt-1.5 text-sm font-semibold text-ink-2">{option}</p>}

            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl font-bold text-ink">{formatINR(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-base font-semibold text-ink-3 line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
              {discount && (
                <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger">
                  {discount}% off
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-bold text-ink-3">
              Inclusive of all taxes · or {formatINR(Math.round(product.price / 12))}/mo on 0% EMI
            </p>

            <div className="mt-6">
              <VariantPicker variants={product.variants} currentSlug={product.slug} />
            </div>

            {highlights.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-2.5">
                {highlights.map(([label, value]) => (
                  <div key={label} className="rounded-md border border-line bg-surface px-3.5 py-3">
                    <dt className="text-micro font-bold uppercase tracking-wider text-ink-3">{label}</dt>
                    <dd className="mt-1 text-small font-semibold leading-snug text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div id="buy-panel" className="mt-6">
              <AddToCartPanel
                productId={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                image={mainImage}
                stock={product.stock}
              />
            </div>

            <div className="mt-8">
              <ProductTrustStrip />
            </div>
          </Reveal>
        </div>

        {product.description && (
          <Reveal className="mt-14 max-w-3xl" delay={0.05}>
            <h2 className="mb-3 text-xl font-bold text-ink">About this phone</h2>
            <p className="text-body leading-relaxed text-ink-2">{product.description}</p>
          </Reveal>
        )}

        {Object.keys(sheet).length > 0 && (
          <Reveal className="mt-14" delay={0.05}>
            <h2 className="mb-4 text-xl font-bold text-ink">Specifications</h2>
            <ProductSpecSheet specs={sheet} />
          </Reveal>
        )}
      </div>

      <MobileBuyBar name={product.name} image={mainImage} price={product.price} targetId="buy-panel" />
    </div>
  );
}
