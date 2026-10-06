import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { discountPct } from "@/shared/phone-catalog";
import { PhoneProductCard } from "./PhoneProductCard";

type BadgeKind = "none" | "new" | "discount";

/**
 * Horizontally scrollable row of phone cards — the mobile-first pattern for
 * "New arrivals" and "Best deals" so a short list still reads as a shelf and
 * doesn't wrap into a lonely second row.
 */
export function ProductRail({
  products,
  badge = "none",
}: {
  products: ProductCardData[];
  badge?: BadgeKind;
}) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      {products.map((p) => {
        const pct = discountPct(p);
        const mark =
          badge === "new" ? "New" : badge === "discount" && pct ? `${pct}% off` : undefined;
        return (
          <li key={p.slug} className="w-[45vw] max-w-[180px] shrink-0 snap-start sm:w-[178px]">
            <PhoneProductCard product={p} badge={mark} />
          </li>
        );
      })}
      <li aria-hidden className="w-px shrink-0" />
    </ul>
  );
}
