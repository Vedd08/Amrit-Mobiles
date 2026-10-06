"use client";

import Image from "next/image";
import Link from "next/link";
import { cartTotal, useCartStore } from "@/frontend/store/cart-store";
import { useMounted } from "@/frontend/lib/use-mounted";
import { MinusIcon, PlusIcon, TrashIcon } from "@/frontend/components/icons";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const mounted = useMounted();

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink-3">Browse our phones to get started.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  const total = cartTotal(items);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-xl font-bold">Your cart</h1>

      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-lg border border-line bg-paper p-3"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-paper">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/product/${item.slug}`} className="text-sm font-medium hover:underline">
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                    className="text-ink-3 hover:text-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-line">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="flex h-8 w-8 items-center justify-center disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-lg border border-line bg-paper p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-3">Subtotal</span>
            <span className="font-semibold">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-1 text-xs text-ink-3">Delivery charges, if any, are confirmed at checkout.</p>
          <Link
            href="/checkout"
            className="mt-4 block rounded-lg bg-lime py-3 text-center text-sm font-semibold text-ink hover:hover:bg-lime-ink"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
