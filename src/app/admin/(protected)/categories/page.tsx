import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import { createCategory, deleteCategory } from "./actions";
import { ConfirmSubmitButton } from "@/admin/components/ConfirmSubmitButton";
import { Card, EmptyState, Notice, PageHeader, btn, input } from "@/admin/components/ui";
import { CategoriesIcon, PlusIcon, TrashIcon } from "@/admin/components/icons";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Categories" description="Groups that shoppers browse by, like Phones or Tablets." />

      {error && (
        <div className="mb-5">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      <Card title="Add a category" className="mb-5">
        <form action={createCategory} className="flex flex-col gap-2 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Category name</span>
            <input name="name" placeholder="e.g. Smartwatches" required className={input} />
          </label>
          <ConfirmSubmitButton className={btn.primary} pendingLabel="Adding…">
            <PlusIcon className="h-4 w-4" />
            Add
          </ConfirmSubmitButton>
        </form>
      </Card>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet">Add one above, then put products in it.</EmptyState>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line bg-white">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime/12 text-lime-ink">
                <CategoriesIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{c.name}</p>
                <p className="truncate text-xs text-ink-3">/{c.slug}</p>
              </div>
              <Link
                href={`/admin/products?category=${c.id}`}
                className="shrink-0 rounded-full bg-paper-2 px-2.5 py-1 text-xs font-bold text-ink-2 hover:bg-line"
              >
                {c._count.products} product{c._count.products === 1 ? "" : "s"}
              </Link>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmSubmitButton
                  aria-label={`Delete ${c.name}`}
                  confirmMessage={`Delete "${c.name}"? This can't be undone.`}
                  disabled={c._count.products > 0}
                  title={c._count.products > 0 ? "Move or delete its products first" : `Delete ${c.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-4 transition-colors hover:bg-danger/8 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-4"
                >
                  <TrashIcon className="h-4 w-4" />
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
