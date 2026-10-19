"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/backend/lib/prisma";
import { requireAdminSession } from "@/backend/lib/auth";
import { parsePriceList } from "@/backend/lib/price-list";
import { decodeCsv, parseCsv, readXlsx } from "@/backend/lib/spreadsheet";

type Values = { price: number; mrp: number | null; stock: number; isActive: boolean };

export type PriceChange = { id: string; name: string; line: number; before: Values; after: Values };
export type PriceProblem = { line: number; label: string; reason: string };

export type PreviewState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "preview"; fileName: string; changes: PriceChange[]; unchanged: number; problems: PriceProblem[] };

export type ApplyState = { status: "idle" } | { status: "error"; message: string } | { status: "done"; updated: number };

const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Step 1: read the spreadsheet and work out what would change. Nothing is saved. */
export async function previewPriceList(_prev: PreviewState, formData: FormData): Promise<PreviewState> {
  await requireAdminSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a spreadsheet first." };
  if (file.size > MAX_FILE_BYTES) return { status: "error", message: "That file is over 5 MB. Is it the right one?" };

  let lines;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const isZip = buf.length > 4 && buf.readUInt32LE(0) === 0x04034b50;
    if (/\.xls$/i.test(file.name)) {
      return { status: "error", message: "Old .xls files aren't supported. In Excel, use Save As → Excel Workbook (.xlsx) or CSV." };
    }
    const rows = isZip ? readXlsx(buf) : parseCsv(decodeCsv(buf));
    lines = parsePriceList(rows).lines;
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Couldn't read that file." };
  }
  if (lines.length === 0) return { status: "error", message: "The spreadsheet has headings but no product rows." };

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, price: true, mrp: true, stock: true, isActive: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const byName = new Map<string, typeof products>();
  for (const p of products) {
    const key = p.name.trim().toLowerCase();
    byName.set(key, [...(byName.get(key) ?? []), p]);
  }

  const changes: PriceChange[] = [];
  const problems: PriceProblem[] = [];
  const seen = new Map<string, number>();
  let unchanged = 0;

  for (const l of lines) {
    const label = l.name ?? l.id ?? `Row ${l.line}`;
    if (l.errors.length) {
      problems.push({ line: l.line, label, reason: l.errors.join("; ") });
      continue;
    }
    let product = l.id ? bySlug.get(l.id) : undefined;
    if (!product && l.name) {
      const matches = byName.get(l.name.trim().toLowerCase()) ?? [];
      if (matches.length > 1) {
        problems.push({ line: l.line, label, reason: "More than one product has this name. Add its Product ID." });
        continue;
      }
      product = matches[0];
    }
    if (!product) {
      problems.push({ line: l.line, label, reason: "No product with this ID or name. Add new products with “Add product”." });
      continue;
    }
    if (seen.has(product.id)) {
      problems.push({ line: l.line, label, reason: `Same product as row ${seen.get(product.id)}; this row was skipped.` });
      continue;
    }
    seen.set(product.id, l.line);

    const before: Values = { price: product.price, mrp: product.mrp, stock: product.stock, isActive: product.isActive };
    const after: Values = {
      price: l.price ?? before.price,
      mrp: l.mrp !== undefined ? l.mrp : before.mrp,
      stock: l.stock ?? before.stock,
      isActive: l.visible ?? before.isActive,
    };
    if (after.mrp !== null && after.mrp < after.price) {
      problems.push({ line: l.line, label, reason: `MRP ₹${after.mrp} is lower than the price ₹${after.price}.` });
      continue;
    }
    const same =
      after.price === before.price && after.mrp === before.mrp && after.stock === before.stock && after.isActive === before.isActive;
    if (same) unchanged++;
    else changes.push({ id: product.id, name: product.name, line: l.line, before, after });
  }

  return { status: "preview", fileName: file.name, changes, unchanged, problems };
}

const changesSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      price: z.number().int().min(1),
      mrp: z.number().int().min(1).nullable(),
      stock: z.number().int().min(0),
      isActive: z.boolean(),
    }),
  )
  .min(1)
  .max(5000);

/** Step 2: save the previewed changes. */
export async function applyPriceList(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  await requireAdminSession();
  let parsed;
  try {
    parsed = changesSchema.safeParse(JSON.parse(String(formData.get("changes") || "[]")));
  } catch {
    parsed = null;
  }
  if (!parsed?.success) return { status: "error", message: "Those changes couldn't be read. Upload the file again." };

  const changes = parsed.data;
  const existing = await prisma.product.count({ where: { id: { in: changes.map((c) => c.id) } } });
  if (existing !== changes.length) {
    return { status: "error", message: "Some of these products were deleted meanwhile. Upload the file again." };
  }

  await prisma.$transaction(
    changes.map(({ id, ...data }) => prisma.product.update({ where: { id }, data })),
  );

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout"); // prices and stock show across the shop
  return { status: "done", updated: changes.length };
}
