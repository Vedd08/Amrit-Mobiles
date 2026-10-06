"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/backend/lib/prisma";
import { requireAdminSession } from "@/backend/lib/auth";
import { productSchema, slugify } from "@/backend/lib/validation";
import { uploadProductImage } from "@/backend/lib/storage";

function parseSpecs(raw: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "product";
  let suffix = 2;
  while (
    await prisma.product.findFirst({ where: { slug, id: excludeId ? { not: excludeId } : undefined } })
  ) {
    slug = `${slugify(base)}-${suffix++}`;
  }
  return slug;
}

async function uploadNewImages(formData: FormData, productId: string) {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const existingCount = await prisma.productImage.count({ where: { productId } });

  // Uploaded in parallel, not one at a time — a handful of full-resolution
  // phone photos submitted together otherwise serializes their disk I/O
  // (or Blob round-trips) into a wall-clock time long enough to trip a
  // connection reset before the request ever finishes.
  const urls = await Promise.all(files.map((file) => uploadProductImage(file)));
  await prisma.productImage.createMany({
    data: urls.map((url, i) => ({ productId, url, position: existingCount + i })),
  });
}

export async function createProduct(formData: FormData) {
  await requireAdminSession();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand"),
    description: formData.get("description"),
    price: formData.get("price"),
    mrp: formData.get("mrp"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/admin/products/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const slug = await uniqueSlug(parsed.data.name);
  const specs = JSON.stringify(parseSpecs(String(formData.get("specs") || "")));

  const product = await prisma.product.create({
    data: { ...parsed.data, slug, specs },
  });

  await uploadNewImages(formData, product.id);

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdminSession();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand"),
    description: formData.get("description"),
    price: formData.get("price"),
    mrp: formData.get("mrp"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const current = await prisma.product.findUniqueOrThrow({ where: { id } });
  const slug = current.name === parsed.data.name ? current.slug : await uniqueSlug(parsed.data.name, id);
  const specs = JSON.stringify(parseSpecs(String(formData.get("specs") || "")));

  await prisma.product.update({
    where: { id },
    data: { ...parsed.data, slug, specs },
  });

  await uploadNewImages(formData, id);

  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function deleteProductImage(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  const productId = String(formData.get("productId") || "");
  await prisma.productImage.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}/edit`);
}
