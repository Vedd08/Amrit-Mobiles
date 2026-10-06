import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import { deleteProduct } from "./actions";
import { ConfirmSubmitButton } from "@/admin/components/ConfirmSubmitButton";
import { PlusIcon, SearchIcon, TrashIcon, ImageIcon } from "@/admin/components/icons";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        AND: [
          q ? { name: { contains: q } } : {},
          category ? { categoryId: category } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-3">
            {products.length} product{products.length === 1 ? "" : "s"}
            {q || category ? " matching your filters" : " in the catalog"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:hover:bg-lime-ink"
        >
          <PlusIcon className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <form className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-55 max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="w-full rounded-full border border-line bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-lime"
          />
        </div>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-full border border-line bg-paper px-3.5 py-2 text-sm font-medium text-ink outline-none focus:border-lime"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-paper"
        >
          Filter
        </button>
        {(q || category) && (
          <Link href="/admin/products" className="text-sm font-semibold text-lime-ink hover:underline">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper shadow-xs">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-ink-3">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-line transition-colors hover:bg-paper/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper">
                      {p.images[0] ? (
                        <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-ink-3" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-3">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-3">{p.category.name}</td>
                <td className="px-4 py-3 font-medium text-ink">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <span className={p.stock === 0 ? "font-semibold text-danger" : p.stock <= 5 ? "font-semibold text-ink-2" : "text-ink"}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      p.isActive ? "bg-lime/10 text-lime-ink" : "bg-paper-2/10 text-ink-3"
                    }`}
                  >
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-sm font-semibold text-lime-ink hover:underline">
                      Edit
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Delete "${p.name}"? This can't be undone.`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-danger hover:underline"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-3">
                  {q || category ? "No products match your filters." : "No products yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
