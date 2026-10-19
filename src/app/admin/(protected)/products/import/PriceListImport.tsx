"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Card, Notice, btn } from "@/admin/components/ui";
import { UploadIcon } from "@/admin/components/icons";
import { inr } from "@/admin/lib/format";
import { applyPriceList, previewPriceList, type ApplyState, type PreviewState, type PriceChange } from "./actions";

export function PriceListImport() {
  // Remounting is the clean way to start over: it resets both action states.
  const [round, setRound] = useState(0);
  return <ImportFlow key={round} onRestart={() => setRound((r) => r + 1)} />;
}

function ImportFlow({ onRestart }: { onRestart: () => void }) {
  const [preview, previewAction, previewing] = useActionState<PreviewState, FormData>(previewPriceList, { status: "idle" });
  const [applied, applyAction, applying] = useActionState<ApplyState, FormData>(applyPriceList, { status: "idle" });
  const [fileName, setFileName] = useState<string | null>(null);
  // Re-checking a new file hides the result of the previous save.
  const [appliedFor, setAppliedFor] = useState<PreviewState | null>(null);

  if (applied.status === "done" && appliedFor === preview) {
    return (
      <Card>
        <Notice tone="success">
          Saved. {applied.updated} product{applied.updated === 1 ? "" : "s"} updated on the website.
        </Notice>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/products" className={btn.primary}>
            Back to products
          </Link>
          <button type="button" className={btn.secondary} onClick={onRestart}>
            Upload another file
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <form action={previewAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line px-4 py-4 transition-colors hover:border-lime-ink hover:bg-lime/5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime/15 text-lime-ink">
              <UploadIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-ink">{fileName ?? "Choose your price list"}</span>
              <span className="block text-xs text-ink-3">Excel (.xlsx) or CSV</span>
            </span>
            <input
              type="file"
              name="file"
              required
              accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
          <button type="submit" disabled={previewing} className={btn.primary}>
            {previewing ? "Reading…" : "Check changes"}
          </button>
        </form>
        {preview.status === "error" && (
          <div className="mt-4">
            <Notice tone="error">{preview.message}</Notice>
          </div>
        )}
      </Card>

      {preview.status === "preview" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Summary label="Will change" value={preview.changes.length} tone="lime" />
            <Summary label="Already up to date" value={preview.unchanged} />
            <Summary label="Need a look" value={preview.problems.length} tone={preview.problems.length ? "amber" : undefined} />
          </div>

          {preview.changes.length > 0 ? (
            <Card title={`Changes from ${preview.fileName}`}>
              <div className="-mx-5 overflow-x-auto">
                <table className="w-full min-w-160 text-sm">
                  <thead className="border-b border-line text-left text-xs font-bold uppercase tracking-wider text-ink-3">
                    <tr>
                      <th className="px-5 py-2">Product</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">MRP</th>
                      <th className="px-3 py-2 text-right">Stock</th>
                      <th className="px-5 py-2">Visible</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {preview.changes.map((c) => (
                      <tr key={c.id} className="border-b border-line last:border-0">
                        <td className="px-5 py-2.5">
                          <span className="font-semibold text-ink">{c.name}</span>
                          <span className="block text-xs text-ink-4">Row {c.line}</span>
                        </td>
                        <Diff before={c.before.price} after={c.after.price} format={inr} />
                        <Diff before={c.before.mrp} after={c.after.mrp} format={(n) => (n === null ? "—" : inr(n))} />
                        <Diff before={c.before.stock} after={c.after.stock} format={String} />
                        <td className="px-5 py-2.5">
                          {c.before.isActive === c.after.isActive ? (
                            <span className="text-ink-4">{c.after.isActive ? "Yes" : "No"}</span>
                          ) : (
                            <span className="font-bold text-ink">
                              {c.before.isActive ? "Yes" : "No"} → {c.after.isActive ? "Yes" : "No"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <form
                action={(fd) => {
                  setAppliedFor(preview);
                  applyAction(fd);
                }}
                className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5"
              >
                <input type="hidden" name="changes" value={JSON.stringify(preview.changes.map(toPayload))} />
                <button type="submit" disabled={applying} className={btn.primary}>
                  {applying ? "Saving…" : `Save ${preview.changes.length} change${preview.changes.length === 1 ? "" : "s"}`}
                </button>
                <span className="text-xs text-ink-3">Prices and stock update on the website straight away.</span>
              </form>
              {applied.status === "error" && (
                <div className="mt-4">
                  <Notice tone="error">{applied.message}</Notice>
                </div>
              )}
            </Card>
          ) : (
            <Notice>Nothing to change: every matched product already has these values.</Notice>
          )}

          {preview.problems.length > 0 && (
            <Card title="Rows that won't be saved">
              <ul className="divide-y divide-line text-sm">
                {preview.problems.map((p) => (
                  <li key={p.line} className="flex gap-3 py-2.5 first:pt-0">
                    <span className="w-14 shrink-0 text-xs font-bold text-ink-4">Row {p.line}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{p.label}</span>
                      <span className="text-[#8A5A00]">{p.reason}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function toPayload(c: PriceChange) {
  return { id: c.id, ...c.after };
}

function Summary({ label, value, tone }: { label: string; value: number; tone?: "lime" | "amber" }) {
  const toneClass =
    tone === "lime" ? "border-lime/40 bg-lime/10" : tone === "amber" ? "border-[#F2D58A] bg-[#FFF8E6]" : "border-line bg-white";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-xs font-semibold text-ink-3">{label}</p>
    </div>
  );
}

function Diff<T extends number | null>({ before, after, format }: { before: T; after: T; format: (v: T) => string }) {
  if (before === after) return <td className="px-3 py-2.5 text-right text-ink-4">{format(after)}</td>;
  return (
    <td className="px-3 py-2.5 text-right">
      <span className="block text-xs text-ink-4 line-through">{format(before)}</span>
      <span className="font-bold text-ink">{format(after)}</span>
    </td>
  );
}
