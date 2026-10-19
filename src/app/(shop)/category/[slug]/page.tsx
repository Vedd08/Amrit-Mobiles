import { notFound, permanentRedirect } from "next/navigation";
import { PhoneRetailCatalog } from "@/frontend/components/shop/PhoneRetailCatalog";
import { AuthorizedBrandPartners } from "@/frontend/components/shop/AuthorizedBrandPartners";
import { TinkerFaq } from "@/frontend/components/tinker/TinkerFaq";
import { getCategoryWithProducts } from "@/backend/lib/queries";

// Rendered per request (it reads ?brand / ?sort), but its catalogue read is cached.

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ brand?: string; sort?: "price-asc" | "price-desc" | "newest" }>;
}) {
  const { slug } = await params;
  if (slug === "accessories") {
    permanentRedirect("/phones");
  }
  const { brand, sort } = await searchParams;

  const result = await getCategoryWithProducts(slug, { brand, sort });
  if (!result) notFound();

  const { category, products, brands } = result;

  return (
    <div className="min-h-screen bg-white relative">
      <div className="relative z-10">
        <PhoneRetailCatalog initialProducts={products} initialBrands={brands} category={category} />

        <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8 mt-12">
          <AuthorizedBrandPartners />
        </div>

        <div className="bg-paper border-t border-line mt-12 relative z-20">
          <TinkerFaq />
        </div>
      </div>
    </div>
  );
}
