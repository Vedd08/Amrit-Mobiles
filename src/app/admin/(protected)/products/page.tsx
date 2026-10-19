import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import type { Prisma } from "@/backend/generated/prisma/client";
import { EmptyState, PageHeader, btn, input } from "@/admin/components/ui";
import { ImageIcon, PlusIcon, SearchIcon, UploadIcon } from "@/admin/components/icons";
import { QuickEdit } from "./QuickEdit";

const LOW_STOCK = 5;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; brand?: string; stock?: string; show?: string }>;
}) {
  const { q, category, brand, stock, show } = await searchParams;

  const where: Prisma.ProductWhereInput = {
    AND: [
      q ? { OR: [{ name: { contains: q } }, { brand: { contains: q } }] } : {},
      category ? { categoryId: category } : {},
      brand ? { brand } : {},
      stock === "low" ? { stock: { lte: LOW_STOCK } } : stock === "out" ? { stock: 0 } : {},
      show === "visible" ? { isActive: true } : show === "hidden" ? { isActive: false } : {},
    ],
  };

  const [products, categories, brands, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ brand: "asc" }, { name: "asc" }],
      include: { category: { select: { name: true } }, images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ distinct: ["brand"], orderBy: { brand: "asc" }, select: { brand: true } }),
    prisma.product.count(),
  ]);

  const filtered = Boolean(q || category || brand || stock || show);

  return (
    <div>
      <PageHeader
        title="Products"
        description={
          filtered
            ? `${products.length} of ${total} products match`
            : `${total} products. Change price, stock or visibility right here and press Save.`
        }
        actions={
          <>
            <Link href="/admin/products/import" className={btn.secondary}>
              <UploadIcon className="h-4 w-4" />
              Update from Excel
            </Link>
            <Link href="/admin/products/new" className={btn.primary}>
              <PlusIcon className="h-4 w-4" />
              Add product
            </Link>
          </>
        }
      />

      <form className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_auto]">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search products</span>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
          <input name="q" defaultValue={q} placeholder="Search name or brand" className={`${input} pl-10`} />
        </label>
        <Select name="brand" value={brand} label="Brand" options={brands.map((b) => [b.brand, b.brand])} all="All brands" />
        <Select name="category" value={category} label="Category" options={categories.map((c) => [c.id, c.name])} all="All categories" />
        <Select
          name="stock"
          value={stock}
          label="Stock"
          options={[
            ["low", `Low (${LOW_STOCK} or fewer)`],
            ["out", "Out of stock"],
          ]}
          all="Any stock"
        />
        <Select
          name="show"
          value={show}
          label="Visibility"
          options={[
            ["visible", "Visible"],
            ["hidden", "Hidden"],
          ]}
          all="Visible + hidden"
        />
        <div className="flex gap-2">
          <button type="submit" className={`${btn.secondary} flex-1`}>
            Filter
          </button>
          {filtered && (
            <Link href="/admin/products" className={btn.ghost}>
              Clear
            </Link>
          )}
        </div>
      </form>

      {products.length === 0 ? (
        <EmptyState title={filtered ? "No products match" : "No products yet"}>
          {filtered ? "Try a different filter." : <Link href="/admin/products/new" className="font-bold text-lime-ink">Add the first one</Link>}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="hidden grid-cols-[minmax(0,2.4fr)_110px_110px_84px_72px_110px] items-center gap-3 border-b border-line bg-paper px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink-3 lg:grid">
            <span>Product</span>
            <span className="text-right">Price ₹</span>
            <span className="text-right">MRP ₹</span>
            <span className="text-right">Stock</span>
            <span className="text-center">Visible</span>
            <span className="sr-only">Save</span>
          </div>
          <ul>
            {products.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-2 items-center gap-x-3 gap-y-2 border-b border-line px-4 py-4 last:border-0 sm:grid-cols-4 lg:grid-cols-[minmax(0,2.4fr)_110px_110px_84px_72px_110px] lg:px-5 lg:py-3"
              >
                <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-4 lg:col-span-1">
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-paper">
                    {p.images[0] ? (
                      <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-ink-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <Link href={`/admin/products/${p.id}/edit`} className="block truncate font-semibold text-ink hover:underline">
                      {p.name}
                    </Link>
                    <p className="truncate text-xs text-ink-3">
                      {p.brand} · {p.category.name}
                      {!p.isActive && <span className="ml-1.5 rounded bg-paper-2 px-1.5 py-px font-semibold text-ink-3">Hidden</span>}
                    </p>
                  </div>
                </div>
                <QuickEdit id={p.id} name={p.name} initial={{ price: p.price, mrp: p.mrp, stock: p.stock, isActive: p.isActive }} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Select({
  name,
  value,
  label,
  options,
  all,
}: {
  name: string;
  value?: string;
  label: string;
  options: [string, string][];
  all: string;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select name={name} defaultValue={value ?? ""} className={input}>
        <option value="">{all}</option>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
