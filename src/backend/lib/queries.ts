import { unstable_cache } from "next/cache";
import { prisma } from "@/backend/lib/prisma";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { HIDDEN_BRANDS, byLeadVariant, groupVariants, parseSpecs } from "@/shared/phone-catalog";
import { CATALOG_TAG } from "@/backend/lib/catalog-cache";
import { parseOfferBrands, type OfferData } from "@/shared/offers";

// Catalogue reads are cached (tag "catalog"): the database is in Mumbai and
// the same few dozen products are read on every page view. Anything that
// changes products or stock calls refreshCatalog() (catalog-cache.ts), so
// edits show at once; the 5-minute expiry is only a safety net.
// Cached results are JSON, so these return plain data (dates as strings).
const cached = <A extends unknown[], R>(key: string, fn: (...args: A) => Promise<R>) =>
  unstable_cache(fn, [key], { tags: [CATALOG_TAG], revalidate: 300 });

function toCardData(product: {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  mrp: number | null;
  stock: number;
  description?: string | null;
  specs?: string | null;
  images: { url: string }[];
  createdAt: Date;
  category?: { slug: string } | null;
}): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: product.price,
    mrp: product.mrp,
    stock: product.stock,
    description: product.description ?? null,
    specs: product.specs ?? null,
    image: product.images[0]?.url ?? null,
    createdAt: product.createdAt.toISOString(),
    category: product.category?.slug ?? "unknown",
  };
}

/** Every visible offer, best first. Brand, price and date filtering is offersFor(). */
export const getVisibleOffers = cached("visible-offers", async (): Promise<OfferData[]> => {
  const offers = await prisma.offer.findMany({
    where: { isActive: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return offers.map((o) => ({
    id: o.id,
    kind: o.kind,
    provider: o.provider,
    logoUrl: o.logoUrl,
    title: o.title,
    details: o.details,
    brands: parseOfferBrands(o.brands),
    minPrice: o.minPrice,
    startsAt: o.startsAt?.toISOString() ?? null,
    endsAt: o.endsAt?.toISOString() ?? null,
  }));
});

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// Every list below returns one card per model: the colour / memory variants
// of a phone are separate rows, folded together by groupVariants. That is why
// lists with a `take` slice after grouping, not in the query.

export const getFeaturedProducts = cached("featured-products", async (take: number = 8) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, brand: { notIn: HIDDEN_BRANDS }, category: { slug: { not: "accessories" } } },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });
  return groupVariants(products.map(toCardData)).slice(0, take);
});

/** Every active phone product. The storefront filters in memory. */
export const getAllStorefrontProducts = cached("storefront-products", async (): Promise<ProductCardData[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true, brand: { notIn: HIDDEN_BRANDS }, category: { slug: { not: "accessories" } } },
    orderBy: { price: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });
  return groupVariants(products.map(toCardData));
});

/**
 * Products for the storefront's Shop All reveal and catalogue.
 *
 * Deliberately not getFeaturedProducts: that sorts by createdAt.
 * The storefront leads with the flagships, so this sorts by
 * price instead — the counter's best stock first.
 */
export const getStorefrontProducts = cached("storefront-top", async (take: number = 12) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, brand: { notIn: HIDDEN_BRANDS }, category: { slug: { not: "accessories" } } },
    orderBy: { price: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });
  return groupVariants(products.map(toCardData)).slice(0, take);
});

/**
 * Every in-stock phone as card data, newest first. The /phones section does
 * its own brand / category / spec slicing in memory — the catalogue is a few
 * dozen rows, so one query beats a filter round-trip per brand page, and it
 * sidesteps SQLite's case-sensitive `brand` matching (seed data mixes
 * "realme", "Oppo", "POCO").
 */
export const getAllPhones = cached("all-phones", async (): Promise<ProductCardData[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true, brand: { notIn: HIDDEN_BRANDS }, category: { slug: "phones" } },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });
  return groupVariants(products.map(toCardData));
});

export const getCategoryWithProducts = cached(
  "category-products",
  async (slug: string, opts: { brand?: string; sort?: "price-asc" | "price-desc" | "newest" } = {}) => {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) return null;

    const orderBy =
      opts.sort === "price-asc"
        ? { price: "asc" as const }
        : opts.sort === "price-desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        isActive: true,
        brand: opts.brand ? { equals: opts.brand, notIn: HIDDEN_BRANDS } : { notIn: HIDDEN_BRANDS },
      },
      orderBy,
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    });

    const allInCategory = await prisma.product.findMany({
      where: { categoryId: category.id, isActive: true, brand: { notIn: HIDDEN_BRANDS } },
      select: { brand: true },
      distinct: ["brand"],
    });

    return {
      // Plain fields only: the cached copy goes through JSON.
      category: { id: category.id, name: category.name, slug: category.slug },
      products: groupVariants(products.map(toCardData)),
      brands: allInCategory.map((p) => p.brand).sort(),
    };
  },
);

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
  if (!product) return null;

  const specs = parseSpecs(product.specs);

  // The model's other colour / memory options, for the pickers. Matched on the
  // exact "Model" value inside the specs JSON (same brand, visible only).
  const siblings = specs.Model
    ? await prisma.product.findMany({
        where: {
          brand: product.brand,
          isActive: true,
          specs: { contains: JSON.stringify({ Model: specs.Model }).slice(1, -1) },
        },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      })
    : [];
  const variants = siblings
    .filter((s) => parseSpecs(s.specs).Model === specs.Model)
    .map((s) => {
      const v = parseSpecs(s.specs);
      return {
        id: s.id,
        slug: s.slug,
        name: s.name,
        colour: v.Colour ?? v.Color ?? "",
        ram: v.RAM ?? "",
        storage: v.Storage ?? "",
        price: s.price,
        mrp: s.mrp,
        stock: s.stock,
        image: s.images[0]?.url ?? null,
      };
    })
    .sort(byLeadVariant);

  return { ...product, parsedSpecs: specs, variants };
}
