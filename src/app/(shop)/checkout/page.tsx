"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThinkingOrb } from "thinking-orbs";
import { cartTotal, useCartStore } from "@/frontend/store/cart-store";
import { useMounted } from "@/frontend/lib/use-mounted";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const mounted = useMounted();
  const router = useRouter();

  const [checkoutMethod, setCheckoutMethod] = useState<"WHATSAPP" | "ONLINE_PAYMENT">("WHATSAPP");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <Link href="/" className="mt-4 inline-block text-lime-ink hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const total = cartTotal(items);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);

    const result = await placeOrder({
      customerName: String(formData.get("customerName") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      checkoutMethod,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (result.whatsappUrl) {
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    }

    clear();
    router.push(`/order/${result.orderId}/confirmation`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-bold">Checkout</h1>

      <form action={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>
        )}

        <div>
          <label htmlFor="customerName" className="mb-1 block text-sm font-medium">
            Full name
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-lime"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-lime"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium">
            Delivery address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            required
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-lime"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium">How would you like to complete your order?</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-lg border p-4 text-sm ${
                checkoutMethod === "WHATSAPP" ? "border-lime bg-paper" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="checkoutMethod"
                className="sr-only"
                checked={checkoutMethod === "WHATSAPP"}
                onChange={() => setCheckoutMethod("WHATSAPP")}
              />
              <p className="font-semibold">Order via WhatsApp</p>
              <p className="mt-1 text-ink-3">We&apos;ll open WhatsApp with your order details ready to send.</p>
            </label>
            <label
              className={`cursor-pointer rounded-lg border p-4 text-sm ${
                checkoutMethod === "ONLINE_PAYMENT" ? "border-lime bg-paper" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="checkoutMethod"
                className="sr-only"
                checked={checkoutMethod === "ONLINE_PAYMENT"}
                onChange={() => setCheckoutMethod("ONLINE_PAYMENT")}
              />
              <p className="font-semibold">Pay online</p>
              <p className="mt-1 text-ink-3">Card, UPI, or netbanking.</p>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-line bg-paper px-4 py-3">
          <span className="text-sm text-ink-3">Total</span>
          <span className="text-lg font-bold">₹{total.toLocaleString("en-IN")}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 text-sm font-semibold text-ink hover:hover:bg-lime-ink disabled:opacity-60"
        >
          {submitting && <ThinkingOrb state="working" size={20} theme="light" />}
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
