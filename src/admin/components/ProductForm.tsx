import { ImageIcon } from "./icons";

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
}: {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
  product?: ProductDefaults;
  error?: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-6">
      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Section title="Basic info">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" defaultValue={product?.name} required className={inputClass} />
          </Field>
          <Field label="Brand">
            <input name="brand" defaultValue={product?.brand} required className={inputClass} />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            name="description"
            defaultValue={product?.description}
            required
            rows={3}
            className={inputClass}
          />
        </Field>

        <Field label="Category">
          <select name="categoryId" defaultValue={product?.categoryId} required className={inputClass}>
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
      </Section>

      <Section title="Pricing & stock">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (₹)">
            <input
              name="price"
              type="number"
              min={1}
              defaultValue={product?.price}
              required
              className={inputClass}
            />
          </Field>
          <Field label="MRP (₹, optional)">
            <input name="mrp" type="number" min={1} defaultValue={product?.mrp ?? undefined} className={inputClass} />
          </Field>
          <Field label="Stock">
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={product?.stock ?? 0}
              required
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Specs">
        <Field label="One per line, e.g. RAM: 8GB">
          <textarea
            name="specs"
            defaultValue={product ? specsToLines(product.specs) : ""}
            rows={4}
            className={`${inputClass} font-mono text-small`}
            placeholder={"RAM: 8GB\nStorage: 128GB\nColor: Black"}
          />
        </Field>
      </Section>

      <Section title="Photos">
        <label
          htmlFor="images"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          <ImageIcon className="h-6 w-6 text-muted" />
          <span className="text-sm font-semibold text-foreground">Click to add photos</span>
          <span className="text-xs text-muted">PNG or JPG, multiple files supported</span>
          <input id="images" name="images" type="file" accept="image/*" multiple className="hidden" />
        </label>
      </Section>

      <label className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-4 py-3 text-sm font-medium">
        <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="h-4 w-4 accent-primary" />
        Visible on storefront
      </label>

      <button
        type="submit"
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
      >
        {submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-xs">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
