import { LocalBusinessJsonLd } from "@/frontend/components/home/LocalBusinessJsonLd";
import { Experience } from "@/frontend/components/experience/Experience";
import { SITE_URL } from "@/shared/site";
import { getAllPhones } from "@/backend/lib/queries";
import { PHONE_CATEGORIES, phonesForCategory, pickShowcase } from "@/shared/phone-catalog";

// Cached and refreshed every 5 minutes, or at once when the catalogue changes
// (refreshCatalog): visitors get the page from Vercel's CDN, not a fresh render.
export const revalidate = 300;

export default async function StoryPage() {
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
      {/* The 3D phone's first lock-screen wallpaper: fetched with the page so
          its screen never flashes the abstract fallback. Tablet/desktop only;
          phones don't load the 3D phone. (React hoists this into <head>.) */}
      <link rel="preload" as="image" href="/images/wallpapers/samsung.webp" fetchPriority="high" media="(min-width: 768px)" />
      <LocalBusinessJsonLd siteUrl={SITE_URL} />
      <Experience allPhones={allPhones} trendingPhones={trendingPhones} budgetCounts={budgetCounts} stats={stats} showcase={pickShowcase(allPhones)} />
    </>
  );
}
