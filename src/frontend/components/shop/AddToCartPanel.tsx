"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/frontend/store/cart-store";
import { buildWhatsAppLink, SHOP_WHATSAPP_NUMBER } from "@/shared/whatsapp";
import { MinusIcon, PlusIcon, WhatsAppIcon } from "@/frontend/components/icons";

export function AddToCartPanel({
  productId,
  slug,
  name,
  price,
  image,
  stock,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const outOfStock = stock === 0;

  function handleAdd() {
    addItem({ productId, slug, name, price, image, stock }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const whatsappLink = buildWhatsAppLink(
    SHOP_WHATSAPP_NUMBER,
    `Hi! I'd like to buy: ${name} (₹${price}) x${quantity}. Is it available?`
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-3">Quantity</span>
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={outOfStock}
            className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-bold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={outOfStock}
            className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-lime py-3.5 text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:hover:bg-lime-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => {
            addItem({ productId, slug, name, price, image, stock }, quantity);
            router.push("/cart");
          }}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-ink py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy now
        </button>
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full border border-success/30 bg-lime/10 py-3.5 text-xs font-bold uppercase tracking-wider text-lime-ink"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Ask on WhatsApp
      </a>
    </div>
  );
}
