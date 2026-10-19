import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPhones } from "@/backend/lib/queries";
import { getBrand, getCategory, phonesForBrand } from "@/shared/phone-catalog";
import { PhoneListing } from "@/frontend/components/phones/PhoneListing";
import { BrandFamilyHero } from "@/frontend/components/phones/BrandFamilyHero";

// Each brand page is cached the first time it's visited, then refreshed every
// 5 minutes or when the catalogue changes (refreshCatalog).
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  if (brand === "all") return { title: "All phones — Amrit Mobiles" };
  const info = getBrand(brand);
  if (!info) return {};
  return { title: `${info.name} phones — Amrit Mobiles`, description: info.blurb };
}

export default async function BrandPhonesPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  const all = await getAllPhones();

  if (brand === "all") {
    return (
      <PhoneListing
        title="All phones"
        intro="Every phone on our shelves right now, across every brand we carry."
        products={all}
        showBrandFilter
      />
    );
  }

  const info = getBrand(brand);
  if (!info) notFound();

  const phones = phonesForBrand(all, info);
  const foldable = getCategory("foldable");
  return (
    <PhoneListing
      title={`${info.name} phones`}
      intro={info.blurb}
      products={phones}
      brand={info}
      hero={
        <BrandFamilyHero
          brand={info}
          phoneCount={phones.length}
          fromPrice={phones.length ? Math.min(...phones.map((p) => p.price)) : 0}
          foldCount={foldable ? phones.filter(foldable.match).length : 0}
        />
      }
    />
  );
}
