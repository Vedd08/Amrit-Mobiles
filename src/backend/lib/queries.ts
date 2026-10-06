import { prisma } from "@/backend/lib/prisma";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";

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

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getFeaturedProducts(take = 8) {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: { not: "accessories" } } },
    orderBy: { createdAt: "desc" },
    take,
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });
  return products.map(toCardData);
}

/** Every active phone product. The storefront filters in memory. */
export async function getAllStorefrontProducts(): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: { not: "accessories" } } },
    orderBy: { price: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });
  return products.map(toCardData);
}

/**
 * Products for the storefront's Shop All reveal and catalogue.
 *
 * Deliberately not getFeaturedProducts: that sorts by createdAt.
 * The storefront leads with the flagships, so this sorts by
 * price instead — the counter's best stock first.
 */
export async function getStorefrontProducts(take = 12) {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: { not: "accessories" } } },
    orderBy: { price: "desc" },
    take,
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });
  return products.map(toCardData);
}

/**
 * Every in-stock phone as card data, newest first. The /phones section does
 * its own brand / category / spec slicing in memory — the catalogue is a few
 * dozen rows, so one query beats a filter round-trip per brand page, and it
 * sidesteps SQLite's case-sensitive `brand` matching (seed data mixes
 * "realme", "Oppo", "POCO").
 */
export async function getAllPhones(): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: "phones" } },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });
  return products.map(toCardData);
}

export async function getCategoryWithProducts(
  slug: string,
  opts: { brand?: string; sort?: "price-asc" | "price-desc" | "newest" } = {}
) {
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
      ...(opts.brand ? { brand: opts.brand } : {}),
    },
    orderBy,
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });

  const allInCategory = await prisma.product.findMany({
    where: { categoryId: category.id, isActive: true },
    select: { brand: true },
    distinct: ["brand"],
  });

  return {
    category,
    products: products.map(toCardData),
    brands: allInCategory.map((p) => p.brand).sort(),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
  if (!product) return null;

  let specs: Record<string, string> = {};
  try {
    specs = JSON.parse(product.specs);
  } catch {
    specs = {};
  }

  return { ...product, parsedSpecs: specs };
}
