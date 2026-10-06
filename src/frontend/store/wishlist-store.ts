import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";

// A saved phone keeps the same shape the card renders from, so /wishlist can
// reuse PhoneProductCard directly. It can go stale (price, stock) — acceptable
// for a save-for-later list; the product page is always the source of truth.
export type WishlistItem = ProductCardData;

type WishlistState = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.slug === item.slug);
          return {
            items: exists
              ? state.items.filter((i) => i.slug !== item.slug)
              : [item, ...state.items],
          };
        }),
      remove: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [] }),
    }),
    { name: "amrit-mobiles-wishlist" },
  ),
);

export function wishlistHas(items: WishlistItem[], slug: string) {
  return items.some((i) => i.slug === slug);
}
