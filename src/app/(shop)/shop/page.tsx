import { TinkerScrollHero } from "@/frontend/components/tinker/TinkerScrollHero";
import { ShopAllBody } from "@/frontend/components/shop/ShopAllBody";
import { getAllStorefrontProducts } from "@/backend/lib/queries";

export const dynamic = "force-dynamic";

export default async function ShopAllPage() {
  const allProducts = await getAllStorefrontProducts();

  return (
    <div className="bg-white min-h-screen text-ink overflow-x-hidden selection:bg-danger selection:text-white font-sans">
      <TinkerScrollHero totalProducts={allProducts.length} />
      <ShopAllBody allProducts={allProducts} />
    </div>
  );
}
