import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import { ProductForm } from "@/admin/components/ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/products" className="text-sm font-semibold text-ink-3 hover:text-ink">
        ← Products
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-ink">Add product</h1>
      <div className="mt-6">
        <ProductForm action={createProduct} categories={categories} error={error} submitLabel="Create product" />
      </div>
    </div>
  );
}
