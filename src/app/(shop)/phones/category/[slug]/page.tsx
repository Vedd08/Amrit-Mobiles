import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPhones } from "@/backend/lib/queries";
import { getCategory, phonesForCategory } from "@/shared/phone-catalog";
import { PhoneListing } from "@/frontend/components/phones/PhoneListing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  return { title: `${cat.pageTitle} — Amrit Mobiles`, description: cat.intro };
}

export default async function CategoryPhonesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const all = await getAllPhones();

  return (
    <PhoneListing
      title={cat.pageTitle}
      intro={cat.intro}
      products={phonesForCategory(all, cat)}
      showBrandFilter
    />
  );
}
