import { prisma } from "@/backend/lib/prisma";
import { ProductForm } from "@/admin/components/ProductForm";
import { PageHeader } from "@/admin/components/ui";
import { createProduct } from "../actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ distinct: ["brand"], orderBy: { brand: "asc" }, select: { brand: true } }),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader back={{ href: "/admin/products", label: "Products" }} title="Add product" />
      <ProductForm
        action={createProduct}
        categories={categories}
        brands={brands.map((b) => b.brand)}
        error={error}
        submitLabel="Create product"
      />
    </div>
  );
}
