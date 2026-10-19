import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/backend/lib/prisma";
import { ProductForm } from "@/admin/components/ProductForm";
import { ConfirmSubmitButton } from "@/admin/components/ConfirmSubmitButton";
import { Card, PageHeader, btn } from "@/admin/components/ui";
import { TrashIcon } from "@/admin/components/icons";
import { updateProduct, deleteProductImage, deleteProduct } from "../../actions";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [product, categories, brands, orderCount] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ distinct: ["brand"], orderBy: { brand: "asc" }, select: { brand: true } }),
    prisma.orderItem.count({ where: { productId: id } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={product.name}
        description={
          <>
            {product.brand} ·{" "}
            <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-lime-ink hover:underline">
              View on the website ↗
            </a>
          </>
        }
      />

      {product.images.length > 0 && (
        <Card title="Current photos" className="mb-5">
          <div className="flex flex-wrap gap-3">
            {product.images.map((img) => (
              <div key={img.id} className="relative">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-line bg-paper">
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <form action={deleteProductImage} className="absolute -right-2 -top-2">
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <ConfirmSubmitButton
                    aria-label="Remove photo"
                    confirmMessage="Remove this photo?"
                    className="grid h-6 w-6 place-items-center rounded-full bg-danger text-xs font-bold text-white shadow-sm transition-transform hover:scale-110"
                  >
                    ×
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ProductForm
        action={updateProduct.bind(null, id)}
        categories={categories}
        brands={brands.map((b) => b.brand)}
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

      <Card title="Delete product" className="mt-10 border-danger/20">
        <p className="text-sm text-ink-3">
          {orderCount > 0
            ? `It's in ${orderCount} past order${orderCount === 1 ? "" : "s"}; those keep its name and price. To stop selling it but keep it, untick “Visible on the website” instead.`
            : "Removes it from the website and the admin for good. To stop selling it for now, untick “Visible on the website” instead."}
        </p>
        <form action={deleteProduct} className="mt-4">
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmitButton confirmMessage={`Delete "${product.name}"? This can't be undone.`} className={btn.danger} pendingLabel="Deleting…">
            <TrashIcon className="h-4 w-4" />
            Delete product
          </ConfirmSubmitButton>
        </form>
      </Card>
    </div>
  );
}
