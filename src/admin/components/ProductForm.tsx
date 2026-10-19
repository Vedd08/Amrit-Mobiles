import { ImageIcon } from "./icons";
import { Card, Notice, btn, input } from "./ui";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

type CategoryOption = { id: string; name: string };

type ProductDefaults = {
  name: string;
  brand: string;
  description: string;
  price: number;
  mrp: number | null;
  stock: number;
  categoryId: string;
  isActive: boolean;
  specs: string;
};

function specsToLines(specsJson: string) {
  try {
    const obj = JSON.parse(specsJson) as Record<string, string>;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  } catch {
    return "";
  }
}

export function ProductForm({
  action,
  categories,
  product,
  error,
  submitLabel,
  brands = [],
}: {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
  product?: ProductDefaults;
  error?: string;
  submitLabel: string;
  /** Existing brands, suggested while typing so spellings stay consistent. */
  brands?: string[];
}) {
  return (
    <form action={action} className="space-y-5">
      {error && <Notice tone="error">{error}</Notice>}

      <Card title="Basic info">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input name="name" defaultValue={product?.name} required placeholder="e.g. Galaxy S25 Ultra 12+256GB" className={input} />
            </Field>
            <Field label="Brand">
              <input name="brand" defaultValue={product?.brand} required list="brand-options" className={input} />
              <datalist id="brand-options">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
          </div>
          <Field label="Description">
            <textarea name="description" defaultValue={product?.description} required rows={3} className={input} />
          </Field>
          <Field label="Category">
            <select name="categoryId" defaultValue={product?.categoryId ?? ""} required className={input}>
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Price and stock">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Selling price (₹)">
            <input name="price" type="number" min={1} defaultValue={product?.price} required className={input} />
          </Field>
          <Field label="MRP (₹)" hint="Optional. Shown struck through.">
            <input name="mrp" type="number" min={1} defaultValue={product?.mrp ?? undefined} className={input} />
          </Field>
          <Field label="Stock">
            <input name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} required className={input} />
          </Field>
        </div>
      </Card>

      <Card title="Specs">
        <Field label="One per line, e.g. RAM: 8GB">
          <textarea
            name="specs"
            defaultValue={product ? specsToLines(product.specs) : ""}
            rows={5}
            className={`${input} font-mono text-[13px]`}
            placeholder={"RAM: 8GB\nStorage: 128GB\nColor: Black"}
          />
        </Field>
      </Card>

      <Card title="Photos">
        <label
          htmlFor="images"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line px-6 py-8 text-center transition-colors hover:border-lime-ink hover:bg-lime/5"
        >
          <ImageIcon className="h-6 w-6 text-ink-4" />
          <span className="text-sm font-bold text-ink">Add photos</span>
          <span className="text-xs text-ink-3">PNG, JPG or WebP. You can pick several at once.</span>
          <input id="images" name="images" type="file" accept="image/*" multiple className="sr-only" />
        </label>
      </Card>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink">
        <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="h-4.5 w-4.5 accent-lime-ink" />
        Visible on the website
      </label>

      <div className="sticky bottom-20 z-10 flex justify-end lg:bottom-4">
        <ConfirmSubmitButton className={`${btn.primary} px-6 py-3`} pendingLabel="Saving…">
          {submitLabel}
        </ConfirmSubmitButton>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}
