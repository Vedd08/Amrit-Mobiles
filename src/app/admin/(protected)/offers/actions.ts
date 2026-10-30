"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/backend/lib/prisma";
import { requireAdminSession } from "@/backend/lib/auth";
import { offerSchema } from "@/backend/lib/validation";
import { uploadProductImage } from "@/backend/lib/storage";
import { refreshCatalog } from "@/backend/lib/catalog-cache";
import { PHONE_BRANDS } from "@/shared/phone-catalog";

const KNOWN_BRANDS = new Set(PHONE_BRANDS.map((b) => b.slug));

/** Create (id null) or update an offer from the offer form. */
export async function saveOffer(id: string | null, formData: FormData): Promise<{ error?: string } | void> {
  await requireAdminSession();

  const allBrands = formData.get("allBrands") === "on";
  const brands = allBrands ? [] : formData.getAll("brands").map(String).filter((b) => KNOWN_BRANDS.has(b));
  if (!allBrands && brands.length === 0) {
    return { error: "Pick at least one brand, or tick “Every brand”." };
  }

  const parsed = offerSchema.safeParse({
    kind: formData.get("kind"),
    provider: formData.get("provider"),
    title: formData.get("title"),
    details: formData.get("details"),
    brands,
    minPrice: formData.get("minPrice"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    position: formData.get("position"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const current = id ? await prisma.offer.findUnique({ where: { id } }) : null;
  if (id && !current) return { error: "This offer was deleted." };

  let logoUrl = current?.logoUrl ?? null;
  // A duplicated offer keeps the original's logo unless a new one is chosen.
  const copyFrom = String(formData.get("copyFrom") || "");
  if (!current && copyFrom) {
    logoUrl = (await prisma.offer.findUnique({ where: { id: copyFrom }, select: { logoUrl: true } }))?.logoUrl ?? null;
  }
  if (formData.get("removeLogo") === "on") logoUrl = null;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (!logo.type.startsWith("image/")) return { error: "The logo must be an image (PNG, JPG, WebP or SVG)." };
    if (logo.size > 2 * 1024 * 1024) return { error: "Keep the logo under 2 MB." };
    try {
      logoUrl = await uploadProductImage(logo, "offers");
    } catch (err) {
      return { error: "Failed to save the logo: " + (err instanceof Error ? err.message : "Upload error") };
    }
  }

  const data = {
    ...parsed.data,
    brands: parsed.data.brands.join(","),
    minPrice: parsed.data.minPrice ?? null,
    startsAt: parsed.data.startsAt ?? null,
    endsAt: parsed.data.endsAt ?? null,
    logoUrl,
  };

  try {
    if (id) await prisma.offer.update({ where: { id }, data });
    else await prisma.offer.create({ data });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save the offer." };
  }

  revalidatePath("/admin/offers");
  refreshCatalog();
  redirect("/admin/offers");
}

/** Show or hide an offer from the offers list. */
export async function toggleOffer(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  await prisma.offer.update({ where: { id }, data: { isActive: formData.get("isActive") === "true" } });
  revalidatePath("/admin/offers");
  refreshCatalog();
}

export async function deleteOffer(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  await prisma.offer.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/offers");
  refreshCatalog();
  redirect("/admin/offers");
}
