"use client";

import { useActionState, useState } from "react";
import { CheckIcon } from "@/admin/components/icons";
import { quickUpdateProduct, type QuickEditState } from "./actions";

type Values = { price: number; mrp: number | null; stock: number; isActive: boolean };

const cell =
  "w-full rounded-lg border border-transparent bg-paper px-2.5 py-1.5 text-right text-sm tabular-nums text-ink outline-none transition-colors hover:border-line focus:border-lime-ink focus:bg-white focus:ring-2 focus:ring-lime/25";

/**
 * Price, MRP, stock and visibility, editable in place. Save appears once
 * something changed; each row saves on its own.
 */
const toForm = (v: Values) => ({
  price: String(v.price),
  mrp: v.mrp === null ? "" : String(v.mrp),
  stock: String(v.stock),
  isActive: v.isActive,
});

export function QuickEdit({ id, name, initial }: { id: string; name: string; initial: Values }) {
  const [state, action, saving] = useActionState<QuickEditState, FormData>(quickUpdateProduct.bind(null, id), { status: "idle" });
  const [form, setForm] = useState(() => toForm(initial));

  // `initial` is the server's current value: after a successful save the page
  // re-renders with the new numbers, so the row stops being "dirty" by itself.
  const baseline = toForm(initial);
  const dirty =
    form.price !== baseline.price || form.mrp !== baseline.mrp || form.stock !== baseline.stock || form.isActive !== baseline.isActive;

  const stockNum = Number(form.stock);
  const stockTone = stockNum === 0 ? "text-danger" : stockNum <= 5 ? "text-[#8A5A00]" : "";

  return (
    <form
      action={action}
      onKeyDown={(e) => {
        if (e.key === "Escape") setForm(baseline);
      }}
      className="contents"
    >
      <label className="flex items-center gap-2 lg:block">
        <span className="w-12 text-xs font-semibold text-ink-3 lg:sr-only">Price</span>
        <input
          name="price"
          inputMode="numeric"
          aria-label={`Price of ${name}`}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d]/g, "") })}
          className={cell}
        />
      </label>
      <label className="flex items-center gap-2 lg:block">
        <span className="w-12 text-xs font-semibold text-ink-3 lg:sr-only">MRP</span>
        <input
          name="mrp"
          inputMode="numeric"
          placeholder="—"
          aria-label={`MRP of ${name}`}
          value={form.mrp}
          onChange={(e) => setForm({ ...form, mrp: e.target.value.replace(/[^\d]/g, "") })}
          className={cell}
        />
      </label>
      <label className="flex items-center gap-2 lg:block">
        <span className="w-12 text-xs font-semibold text-ink-3 lg:sr-only">Stock</span>
        <input
          name="stock"
          inputMode="numeric"
          aria-label={`Stock of ${name}`}
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/[^\d]/g, "") })}
          className={`${cell} font-semibold ${stockTone}`}
        />
      </label>
      <label className="flex cursor-pointer items-center gap-2 lg:justify-center" title={form.isActive ? "Shown on the website" : "Hidden from the website"}>
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="relative h-6 w-10 shrink-0 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-lime-ink peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-lime/40"
        />
        <span className="text-xs font-semibold text-ink-3 lg:sr-only">{form.isActive ? "Visible" : "Hidden"}</span>
        <span className="sr-only">Visible on the website</span>
      </label>
      <div className="col-span-2 flex items-center justify-end gap-2 empty:hidden sm:col-span-4 lg:col-span-1 lg:flex lg:min-h-9">
        {state.status === "error" && dirty && !saving && (
          <span role="alert" className="text-right text-xs font-semibold text-danger">
            {state.message}
          </span>
        )}
        {dirty ? (
          <button
            type="submit"
            disabled={saving}
            className="shrink-0 rounded-full bg-lime px-3.5 py-1.5 text-xs font-bold text-[#2A2A2A] transition-colors hover:bg-lime-lo disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        ) : (
          state.status === "saved" && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-lime-ink" role="status">
              <CheckIcon className="h-3.5 w-3.5" /> Saved
            </span>
          )
        )}
      </div>
    </form>
  );
}
