import { FeaturedFlagshipShowcase } from "@/frontend/components/shop/FeaturedFlagshipShowcase";
import { AuthorizedBrandPartners } from "@/frontend/components/shop/AuthorizedBrandPartners";
import { TinkerFaq } from "@/frontend/components/tinker/TinkerFaq";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { TrustTicker } from "@/frontend/components/shop/TrustTicker";
import { StoreLocator } from "@/frontend/components/shop/StoreLocator";
import { Storefront } from "@/frontend/components/shop/Storefront";

export function ShopAllBody({ allProducts }: { allProducts: ProductCardData[] }) {
  // Use a heuristic or pass 'featured' separately. Let's just pass top 8 products as featured.
  const featured = allProducts.slice(0, 8);

  return (
    <>
      {/* Marquee bridging the hero into the shop body */}
      <TrustTicker />

      {/* Main Storefront Tool */}
      <Storefront allProducts={allProducts} />

      {/* Featured flagship showcase */}
      <FeaturedFlagshipShowcase products={featured} />

      {/* Authorized brand partners */}
      <AuthorizedBrandPartners />

      {/* Store locator — the six Surat branches */}
      <StoreLocator />

      {/* FAQ. Carries id="secD" because the shared Header's
          "Store & Support" link points at /#secD. */}
      <div id="secD" className="bg-paper border-t border-line mt-4 scroll-mt-24">
        <TinkerFaq />
      </div>
    </>
  );
}