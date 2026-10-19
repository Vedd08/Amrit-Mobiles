"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cartTotal, useCartStore } from "@/frontend/store/cart-store";
import { useMounted } from "@/frontend/lib/use-mounted";
import { useStoreChat, useTargetBranch } from "@/frontend/store/store-chat-store";
import { WhatsAppIcon } from "@/frontend/components/icons";
import { CHAT_BRANCHES, DEFAULT_BRANCH } from "@/shared/branches";
import { placeOrder } from "./actions";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-lime-ink focus:ring-2 focus:ring-lime/30";

/**
 * Order form. Online payment isn't live yet, so placing an order saves it and
 * opens WhatsApp with the chosen store, every detail already typed in; the
 * store confirms availability and takes payment on that chat.
 */
export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const mounted = useMounted();
  const router = useRouter();
  const target = useTargetBranch();
  const choose = useStoreChat((s) => s.choose);
  const locate = useStoreChat((s) => s.locate);
  const status = useStoreChat((s) => s.status);

  const [picked, setPicked] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [redirect, setRedirect] = useState<{ whatsappUrl: string; confirmation: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Coming back from WhatsApp, the browser may restore this page from its
  // back/forward cache, frozen on "Opening WhatsApp…". The URL is already the
  // confirmation page by then, so reload to show it.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  if (!mounted) return null;

  if (redirect) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime/15 text-lime-ink">
          <WhatsAppIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink">Opening WhatsApp…</h1>
        <p className="mt-2 text-ink-3">Your order is saved. Press send in WhatsApp and the store will confirm it.</p>
        <a
          href={redirect.whatsappUrl}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-bold text-[#2A2A2A]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp didn&apos;t open? Tap here
        </a>
        <a href={redirect.confirmation} className="mt-4 block text-sm font-semibold text-lime-ink hover:underline">
          View order details
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-site px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-ink-3">Add a phone to your cart, then come back here to place the order.</p>
        <Link href="/phones" className="mt-6 inline-block rounded-full bg-lime px-6 py-3 text-sm font-bold text-[#2A2A2A]">
          Browse phones
        </Link>
      </div>
    );
  }

  const total = cartTotal(items);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const branchSlug = picked ?? target?.slug ?? DEFAULT_BRANCH.slug;

  // onSubmit rather than <form action>: a form action resets the fields
  // afterwards, which would wipe what the customer typed whenever we show an error.
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);
    const result = await placeOrder({
      customerName: String(formData.get("customerName") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      note: String(formData.get("note") || ""),
      branchSlug,
      checkoutMethod: "WHATSAPP",
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    choose(result.branchSlug);
    const confirmation = `/order/${result.orderId}/confirmation?store=${result.branchSlug}`;
    if (!result.whatsappUrl) {
      clear();
      router.push(confirmation);
      return;
    }
    setRedirect({ whatsappUrl: result.whatsappUrl, confirmation });
    clear();
    // Back from WhatsApp lands on the confirmation, not an empty checkout.
    window.history.replaceState(null, "", confirmation);
    window.location.assign(result.whatsappUrl);
  }

  return (
    <div className="mx-auto max-w-site px-4 py-8 sm:px-6 md:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Place your order</h1>
      <p className="mt-2 max-w-[60ch] text-ink-3">
        Fill in your details and we&apos;ll open WhatsApp with your order ready to send to the store you choose. The
        store confirms availability and payment with you there.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-7">
          {error && (
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="customerName" className="mb-1.5 block text-sm font-bold text-ink">
              Full name
            </label>
            <input id="customerName" name="customerName" required autoComplete="name" minLength={2} className={field} />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-bold text-ink">
              Mobile number
            </label>
            <div className="flex">
              <span className="grid place-items-center rounded-l-xl border border-r-0 border-line bg-paper-2 px-3 text-[15px] font-semibold text-ink-3">
                +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                required
                placeholder="98765 43210"
                className={`${field} rounded-l-none`}
              />
            </div>
            <p className="mt-1 text-xs text-ink-3">The store will reply on this number.</p>
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-bold text-ink">
              Address or area
            </label>
            <textarea id="address" name="address" rows={3} required autoComplete="street-address" className={field} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="branch" className="text-sm font-bold text-ink">
                Buy from
              </label>
              {status !== "located" && status !== "denied" && status !== "unavailable" && (
                <button
                  type="button"
                  onClick={locate}
                  disabled={status === "locating"}
                  className="text-xs font-bold text-lime-ink hover:underline disabled:opacity-60"
                >
                  {status === "locating" ? "Finding the nearest…" : "Use my nearest store"}
                </button>
              )}
            </div>
            <select id="branch" value={branchSlug} onChange={(e) => setPicked(e.target.value)} className={field}>
              {CHAT_BRANCHES.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}, {b.area}
                  {b.slug === target?.slug ? " (nearest)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="note" className="mb-1.5 block text-sm font-bold text-ink">
              Note <span className="font-normal text-ink-3">(optional)</span>
            </label>
            <input
              id="note"
              name="note"
              maxLength={300}
              placeholder="Colour preference, exchange, EMI…"
              className={field}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-lime py-4 text-[15px] font-bold text-[#2A2A2A] shadow-[0_12px_24px_-12px_rgba(95,138,13,0.9)] transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {submitting ? "Placing your order…" : "Place order on WhatsApp"}
          </button>
          <p className="text-center text-xs text-ink-3">
            No payment is taken on the website. You pay at the store or as agreed on WhatsApp.
          </p>
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-28 lg:col-span-5">
          <h2 className="text-lg font-extrabold text-ink">
            Your order <span className="font-semibold text-ink-3">({count} {count === 1 ? "item" : "items"})</span>
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 py-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper">
                  {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{i.name}</span>
                  <span className="text-xs text-ink-3">
                    {inr(i.price)} × {i.quantity}
                  </span>
                </span>
                <span className="text-sm font-bold text-ink">{inr(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-line pt-4">
            <span className="font-bold text-ink">Total</span>
            <span className="text-xl font-extrabold text-ink">{inr(total)}</span>
          </div>
          <Link href="/cart" className="mt-3 inline-block text-sm font-semibold text-lime-ink hover:underline">
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
