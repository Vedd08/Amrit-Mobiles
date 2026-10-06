import { PhoneHeaderContent, type PhoneHeroStats } from "./PhoneHeaderContent";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { MagneticChip } from "./MagneticChip";

/**
 * Editorial hero using the single shared PhoneHeaderContent presentation component.
 */
export function PhoneHero({
  budgetCounts = { under15: 0, under25: 0, under40: 0, flagships: 0 },
  stats,
  showcase = [],
}: {
  budgetCounts?: { under15: number; under25: number; under40: number; flagships: number };
  stats?: PhoneHeroStats;
  showcase?: ProductCardData[];
}) {
  return (
    <PhoneHeaderContent as="h1" interactiveSearch={true} stats={stats} showcase={showcase}>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
        {budgetCounts.under15 > 0 && (
          <MagneticChip href="/phones/all?max=15000">
            Under ₹15,000 <span className="text-ink-4 ml-1">({budgetCounts.under15})</span>
          </MagneticChip>
        )}
        {budgetCounts.under25 > 0 && (
          <MagneticChip href="/phones/all?max=25000">
            Under ₹25,000 <span className="text-ink-4 ml-1">({budgetCounts.under25})</span>
          </MagneticChip>
        )}
        {budgetCounts.under40 > 0 && (
          <MagneticChip href="/phones/all?max=40000">
            Under ₹40,000 <span className="text-ink-4 ml-1">({budgetCounts.under40})</span>
          </MagneticChip>
        )}
        {budgetCounts.flagships > 0 && (
          <MagneticChip href="/phones/category/flagship">
            Flagships ₹55k+ <span className="text-ink-4 ml-1">({budgetCounts.flagships})</span>
          </MagneticChip>
        )}
      </div>
    </PhoneHeaderContent>
  );
}
