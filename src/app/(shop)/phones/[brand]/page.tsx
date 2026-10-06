import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPhones } from "@/backend/lib/queries";
import { getBrand, phonesForBrand } from "@/shared/phone-catalog";
import { PhoneListing } from "@/frontend/components/phones/PhoneListing";

export const dynamic = "force-dynamic";

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

  return (
    <PhoneListing
      title={`${info.name} phones`}
      intro={info.blurb}
      products={phonesForBrand(all, info)}
      brand={info}
    />
  );
}
