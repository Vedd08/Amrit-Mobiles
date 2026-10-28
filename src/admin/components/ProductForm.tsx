"use client";

import { useState, useRef, useEffect } from "react";
import { ImageIcon, PlusIcon } from "./icons";
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

type PreviewItem = {
  id: string;
  file: File;
  url: string;
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProductForm({
  action,
  categories,
  product,
  error: initialError,
  submitLabel,
  brands = [],
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void> | void;
  categories: CategoryOption[];
  product?: ProductDefaults;
  error?: string;
  submitLabel: string;
  /** Existing brands, suggested while typing so spellings stay consistent. */
  brands?: string[];
}) {
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep ref for cleanup on unmount
  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  const addFiles = (incomingFiles: File[]) => {
    const validImages: File[] = [];
    let oversizeCount = 0;

    for (const f of incomingFiles) {
      const isImg = f.type.startsWith("image/") || /\.(jpe?g|png|webp|avif|gif)$/i.test(f.name);
      if (!isImg) continue;
      if (f.size > 20 * 1024 * 1024) {
        oversizeCount++;
        continue;
      }
      validImages.push(f);
    }

    if (oversizeCount > 0) {
      setError(`${oversizeCount} file(s) exceeded the 20MB limit and were skipped.`);
    }

    if (validImages.length === 0) return;

    // Filter out duplicates (same file name and size)
    const existingKeys = new Set(previewsRef.current.map((p) => `${p.file.name}-${p.file.size}`));
    const newItems: PreviewItem[] = [];

    for (const f of validImages) {
      const key = `${f.name}-${f.size}`;
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        newItems.push({
          id: `${key}-${Date.now()}-${Math.random()}`,
          file: f,
          url: URL.createObjectURL(f),
        });
      }
    }

    if (newItems.length > 0) {
      setPreviews((prev) => [...prev, ...newItems]);
      setError(null);
    }
  };

  const removePhoto = (id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    setPreviews((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const movePhoto = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    setPreviews((prev) => {
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // 1. Client-side input validation
    const name = String(formData.get("name") || "").trim();
    if (!name) {
      setError("Product name is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const brand = String(formData.get("brand") || "").trim();
    if (!brand) {
      setError("Brand is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const description = String(formData.get("description") || "").trim();
    if (!description) {
      setError("Description is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const categoryId = String(formData.get("categoryId") || "").trim();
    if (!categoryId) {
      setError("Please select a category.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const price = Number(formData.get("price"));
    if (!price || isNaN(price) || price < 1) {
      setError("Selling price must be a whole rupee amount of at least ₹1.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const mrpRaw = formData.get("mrp");
    if (mrpRaw && String(mrpRaw).trim() !== "") {
      const mrp = Number(mrpRaw);
      if (isNaN(mrp) || mrp < 1) {
        setError("MRP must be a whole rupee amount of at least ₹1.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (mrp < price) {
        setError(
          `MRP (₹${mrp.toLocaleString("en-IN")}) cannot be lower than the selling price (₹${price.toLocaleString("en-IN")}).`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    // 2. Attach selected files in user-arranged order
    formData.delete("images");
    for (const item of previews) {
      formData.append("images", item.file);
    }

    // 3. Invoke action
    setIsSubmitting(true);
    try {
      const res = await action(formData);
      if (res && typeof res === "object" && res.error) {
        setError(res.error);
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      // Next.js redirect() throws a NEXT_REDIRECT error which must be rethrown
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      setError(err?.message || "Something went wrong while saving the product.");
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && <Notice tone="error">{error}</Notice>}

      <Card title="Basic info">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input
                name="name"
                defaultValue={product?.name}
                required
                placeholder="e.g. Galaxy S25 Ultra 12+256GB"
                className={input}
              />
            </Field>
            <Field label="Brand">
              <input
                name="brand"
                defaultValue={product?.brand}
                required
                list="brand-options"
                placeholder="e.g. Samsung, Apple, Alcatel"
                className={input}
              />
              <datalist id="brand-options">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
          </div>
          <Field label="Description">
            <textarea
              name="description"
              defaultValue={product?.description}
              required
              rows={3}
              placeholder="Detailed description of features, condition, warranty..."
              className={input}
            />
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
            <input
              name="price"
              type="number"
              min={1}
              step={1}
              defaultValue={product?.price}
              required
              placeholder="e.g. 14999"
              className={input}
            />
          </Field>
          <Field label="MRP (₹)" hint="Optional. Must be greater than or equal to selling price.">
            <input
              name="mrp"
              type="number"
              min={1}
              step={1}
              defaultValue={product?.mrp ?? undefined}
              placeholder="e.g. 19999"
              className={input}
            />
          </Field>
          <Field label="Stock">
            <input
              name="stock"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.stock ?? 0}
              required
              className={input}
            />
          </Field>
        </div>
      </Card>

      <Card title="Specs">
        <Field label="One per line, e.g. RAM: 8GB" hint="Enter key: value pairs. Each on a new line.">
          <textarea
            name="specs"
            defaultValue={product ? specsToLines(product.specs) : ""}
            rows={5}
            className={`${input} font-mono text-[13px]`}
            placeholder={"RAM: 8GB\nStorage: 128GB\nColor: Hyper Blue\nProcessor: Dimensity 7025"}
          />
        </Field>
      </Card>

      <Card
        title={
          <div className="flex items-center gap-2">
            <span>Photos</span>
            {previews.length > 0 && (
              <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs font-semibold text-ink-2">
                {previews.length} selected
              </span>
            )}
          </div>
        }
        action={
          previews.length > 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`${btn.secondary} !py-1.5 !px-3 !text-xs`}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add more
            </button>
          ) : undefined
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              addFiles(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />

        {previews.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? "border-lime-ink bg-lime/10 scale-[1.01]"
                : "border-line hover:border-lime-ink hover:bg-lime/5"
            }`}
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-paper-2 text-ink-3">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Drag and drop photos here, or click to browse</p>
              <p className="mt-1 text-xs text-ink-3">
                PNG, JPG, WebP, or AVIF. You can select multiple images at once.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-ink-3">
              ★ The first photo is the main <strong>cover image</strong> shown in the store. Use arrows to reorder or click &quot;Make cover&quot;.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {previews.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border bg-paper transition-shadow hover:shadow-md ${
                    index === 0 ? "border-lime-ink ring-2 ring-lime/40" : "border-line"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full overflow-hidden bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />

                    {/* Badge */}
                    <div className="absolute left-1.5 top-1.5 flex items-center gap-1">
                      {index === 0 ? (
                        <span className="rounded-md bg-lime px-1.5 py-0.5 text-[11px] font-bold text-ink shadow-sm">
                          ★ Cover
                        </span>
                      ) : (
                        <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => removePhoto(item.id)}
                      className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-danger text-xs font-bold text-white shadow transition-transform hover:scale-110 active:scale-95"
                    >
                      ×
                    </button>
                  </div>

                  {/* Actions & info */}
                  <div className="flex flex-col gap-1.5 p-2 bg-white text-[11px]">
                    <div className="flex items-center justify-between text-ink-3">
                      <span className="max-w-[100px] truncate" title={item.file.name}>
                        {item.file.name}
                      </span>
                      <span>{formatFileSize(item.file.size)}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-line/60 pt-1.5">
                      {index !== 0 ? (
                        <button
                          type="button"
                          onClick={() => setAsCover(index)}
                          className="font-semibold text-lime-ink hover:underline"
                        >
                          Make cover
                        </button>
                      ) : (
                        <span className="font-semibold text-ink-3">Primary</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => movePhoto(index, -1)}
                          className="grid h-5 w-5 place-items-center rounded border border-line bg-paper text-ink disabled:opacity-30 disabled:pointer-events-none hover:bg-paper-2"
                          title="Move left"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          disabled={index === previews.length - 1}
                          onClick={() => movePhoto(index, 1)}
                          className="grid h-5 w-5 place-items-center rounded border border-line bg-paper text-ink disabled:opacity-30 disabled:pointer-events-none hover:bg-paper-2"
                          title="Move right"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drop target for adding more */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-center text-xs font-semibold text-ink-2 transition-colors ${
                isDragging ? "border-lime-ink bg-lime/10" : "border-line hover:border-lime-ink hover:bg-lime/5"
              }`}
            >
              <PlusIcon className="h-4 w-4 text-lime-ink" />
              <span>Drop more photos here or click to select</span>
            </div>
          </div>
        )}
      </Card>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.isActive ?? true}
          className="h-4.5 w-4.5 accent-lime-ink"
        />
        Visible on the website
      </label>

      <div className="sticky bottom-20 z-10 flex justify-end lg:bottom-4">
        <ConfirmSubmitButton isPending={isSubmitting} className={`${btn.primary} px-6 py-3`} pendingLabel="Saving…">
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
