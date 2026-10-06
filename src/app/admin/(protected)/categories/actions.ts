"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/backend/lib/prisma";
import { requireAdminSession } from "@/backend/lib/auth";
import { categorySchema, slugify } from "@/backend/lib/validation";

async function uniqueSlug(base: string) {
  let slug = slugify(base) || "category";
  let suffix = 2;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${suffix++}`;
  }
  return slug;
}

export async function createCategory(formData: FormData) {
  await requireAdminSession();

  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    redirect(`/admin/categories?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const slug = await uniqueSlug(parsed.data.name);
  await prisma.category.create({ data: { name: parsed.data.name, slug } });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    redirect(
      `/admin/categories?error=${encodeURIComponent(
        "This category still has products in it. Move or delete those products first."
      )}`
    );
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
