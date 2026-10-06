import { preload } from "react-dom";
import { LocalBusinessJsonLd } from "@/frontend/components/home/LocalBusinessJsonLd";
import { Experience } from "@/frontend/components/experience/Experience";
import { SITE_URL } from "@/shared/site";
import { getAllPhones } from "@/backend/lib/queries";
import { PHONE_CATEGORIES, phonesForCategory, pickShowcase } from "@/shared/phone-catalog";

export const dynamic = "force-dynamic";

export default async function StoryPage() {
  // The 3D phone's first lock-screen wallpaper: start fetching it with the
  // page so the screen never flashes its abstract fallback on load.
  preload("/images/wallpapers/samsung.webp", { as: "image", fetchPriority: "high" });
  const allPhones = await getAllPhones();
  const trendingPhones = allPhones.filter((p) => p.stock > 0).slice(0, 8);

  const budgetCounts = {
    under15: allPhones.filter((p) => p.price <= 15000).length,
    under25: allPhones.filter((p) => p.price <= 25000).length,
    under40: allPhones.filter((p) => p.price <= 40000).length,
    flagships: [...phonesForCategory(allPhones, PHONE_CATEGORIES.find((c) => c.slug === "flagship")!)].length,
  };

  const stats = {
    phonesInStock: allPhones.filter(p => p.stock > 0).length,
    brandCount: new Set(allPhones.map(p => p.brand)).size,
    lowestPrice: Math.min(...allPhones.map(p => p.price)),
  };

  return (
    <>
      <LocalBusinessJsonLd siteUrl={SITE_URL} />
      <Experience allPhones={allPhones} trendingPhones={trendingPhones} budgetCounts={budgetCounts} stats={stats} showcase={pickShowcase(allPhones)} />
    </>
  );
}
