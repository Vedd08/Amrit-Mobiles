import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/backend/lib/queries";
import { AddToCartPanel } from "@/frontend/components/shop/AddToCartPanel";
import { ProductGallery } from "@/frontend/components/shop/ProductGallery";
import { ProductSpecSheet } from "@/frontend/components/shop/ProductSpecSheet";
import { ProductTrustStrip } from "@/frontend/components/shop/ProductTrustStrip";
import { MobileBuyBar } from "@/frontend/components/shop/MobileBuyBar";
import { Reveal } from "@/frontend/components/motion/Reveal";
import { formatINR } from "@/frontend/lib/phone-experience-data";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const mainImage = product.images[0]?.url ?? null;

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3">
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          <span>/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-ink">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-ink">{product.brand}</span>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          <Reveal>
            <ProductGallery
              images={product.images}
              name={product.name}
              brand={product.brand}
              price={product.price}
              mrp={product.mrp}
              discount={discount}
            />
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-xs font-bold uppercase text-ink-3">{product.brand}</p>
            <h1 className="mt-1.5 text-3xl font-bold text-ink sm:text-4xl">
              {product.name}
            </h1>

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
              or {formatINR(Math.round(product.price / 12))}/mo · 0% EMI
            </p>

            <p className="mt-5 text-sm leading-relaxed text-ink-3">{product.description}</p>

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

        {Object.keys(product.parsedSpecs).length > 0 && (
          <Reveal className="mt-14" delay={0.05}>
            <h2 className="mb-4 text-xl font-bold text-ink">Specifications</h2>
            <ProductSpecSheet specs={product.parsedSpecs} />
          </Reveal>
        )}
      </div>

      <MobileBuyBar name={product.name} image={mainImage} price={product.price} targetId="buy-panel" />
    </div>
  );
}
