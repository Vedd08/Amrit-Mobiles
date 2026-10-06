import { prisma } from "@/backend/lib/prisma";
import { createCategory, deleteCategory } from "./actions";
import { ConfirmSubmitButton } from "@/admin/components/ConfirmSubmitButton";
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
    <div>
      <h1 className="text-2xl font-bold text-ink">Categories</h1>
      <p className="mt-1 text-sm text-ink-3">Group products so shoppers can browse by type.</p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <form action={createCategory} className="mt-6 flex max-w-md gap-2">
        <input
          name="name"
          placeholder="New category name"
          required
          className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-lime"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:hover:bg-lime-ink"
        >
          <PlusIcon className="h-4 w-4" />
          Add
        </button>
      </form>

      <div className="mt-6 max-w-2xl overflow-hidden rounded-lg border border-line bg-paper shadow-xs">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-ink-3">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-line transition-colors hover:bg-paper/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 font-semibold text-ink">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime/10 text-lime-ink">
                      <CategoriesIcon className="h-4 w-4" />
                    </span>
                    {c.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-3">{c.slug}</td>
                <td className="px-4 py-3 text-ink-3">{c._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`Delete "${c.name}"? This can't be undone.`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-danger hover:underline"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-3">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
