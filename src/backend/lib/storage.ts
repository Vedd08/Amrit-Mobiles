import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Stores an admin-uploaded product image and returns its public URL.
 *
 * With BLOB_READ_WRITE_TOKEN set (a Vercel Blob store attached to the
 * project), uploads go to Vercel Blob. Without it — the state for local
 * development — files are written to public/uploads and served as static
 * assets. Callers don't need to change when the token is added.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, file, { access: "public" });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
