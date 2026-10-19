import { revalidatePath, updateTag } from "next/cache";

/** Cache tag on every catalogue read (queries.ts). */
export const CATALOG_TAG = "catalog";

/**
 * Call from a Server Action after anything that changes what shoppers see:
 * products, prices, stock, photos, categories, or an order taking stock.
 * Expires the cached catalogue reads and the cached shop pages, so the next
 * visitor (and the admin who just saved) sees the change straight away.
 */
export function refreshCatalog() {
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}
