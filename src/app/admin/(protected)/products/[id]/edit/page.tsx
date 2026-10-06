import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/backend/lib/prisma";
import { ProductForm } from "@/admin/components/ProductForm";
import { updateProduct, deleteProductImage } from "../../actions";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm font-semibold text-ink-3 hover:text-ink">
        ← Products
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-ink">{product.name}</h1>

      {product.images.length > 0 && (
        <div className="mt-5 max-w-2xl rounded-lg border border-line bg-paper p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-3">Current photos</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {product.images.map((img) => (
              <div key={img.id} className="group relative">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-line bg-paper">
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <form action={deleteProductImage} className="absolute -right-2 -top-2">
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    aria-label="Remove image"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-danger text-xs font-bold text-white shadow-sm transition-transform hover:scale-110"
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <ProductForm
          action={updateProduct.bind(null, id)}
          categories={categories}
          error={error}
          submitLabel="Save changes"
          product={{
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: product.price,
            mrp: product.mrp,
            stock: product.stock,
            categoryId: product.categoryId,
            isActive: product.isActive,
            specs: product.specs,
          }}
        />
      </div>
    </div>
  );
}
