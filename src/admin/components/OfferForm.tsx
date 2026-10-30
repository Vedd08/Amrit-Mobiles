"use client";

import { useEffect, useRef, useState } from "react";
import { OfferCard } from "@/frontend/components/shop/ProductOffers";
import { OFFER_KINDS } from "@/shared/offers";
import { PHONE_BRANDS } from "@/shared/phone-catalog";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { Card, Notice, btn, input } from "./ui";

export type OfferDefaults = {
  kind: string;
  provider: string;
  logoUrl: string | null;
  title: string;
  details: string;
  /** Brand slugs; empty means every brand. */
  brands: string[];
  minPrice: number | null;
  /** YYYY-MM-DD, Indian date. */
  startsAt: string;
  endsAt: string;
  position: number;
  isActive: boolean;
};

// Suggested while typing, so the same bank is spelled the same way everywhere.
const PROVIDERS = [
  "HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "Kotak Mahindra Bank", "IDFC FIRST Bank",
  "Bank of Baroda", "IndusInd Bank", "Yes Bank", "AU Small Finance Bank", "HSBC", "Federal Bank",
  "RBL Bank", "OneCard", "Bajaj Finserv", "HDB Financial Services", "TVS Credit", "Home Credit",
  "Samsung Finance+", "Paytm", "PhonePe", "Google Pay", "Amazon Pay", "Tata Neu UPI",
];

export function OfferForm({
  action,
  offer,
  copyFrom,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  offer?: OfferDefaults;
  /** Set when duplicating: the new offer reuses this offer's logo. */
  copyFrom?: string;
  submitLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allBrands, setAllBrands] = useState((offer?.brands.length ?? 0) === 0);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [newLogo, setNewLogo] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    kind: offer?.kind ?? "BANK",
    provider: offer?.provider ?? "",
    title: offer?.title ?? "",
    details: offer?.details ?? "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => () => {
    if (newLogo) URL.revokeObjectURL(newLogo);
  }, [newLogo]);

  const readDraft = () => {
    const f = formRef.current;
    if (!f) return;
    const d = new FormData(f);
    setDraft({
      kind: String(d.get("kind") || "BANK"),
      provider: String(d.get("provider") || ""),
      title: String(d.get("title") || ""),
      details: String(d.get("details") || ""),
    });
  };

  const logoUrl = newLogo ?? (removeLogo ? null : offer?.logoUrl ?? null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (!allBrands && formData.getAll("brands").length === 0) {
      setError("Pick at least one brand, or tick “Every brand”.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await action(formData);
      if (res && res.error) {
        setError(res.error);
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      const e = err as { message?: string; digest?: string } | null;
      // redirect() after a save throws NEXT_REDIRECT, which must go through.
      if (e?.message === "NEXT_REDIRECT" || e?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setError(e?.message || "Something went wrong while saving the offer.");
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} onChange={readDraft} noValidate className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      {copyFrom && <input type="hidden" name="copyFrom" value={copyFrom} />}

      <div className="min-w-0 space-y-5">
        {error && <Notice tone="error">{error}</Notice>}

        <Card title="Offer">
          <div className="space-y-4">
            <fieldset>
              <legend className="mb-1.5 block text-sm font-semibold text-ink">Type</legend>
              <div className="flex flex-wrap gap-2">
                {OFFER_KINDS.map((k) => (
                  <label key={k.value} className="cursor-pointer">
                    <input type="radio" name="kind" value={k.value} defaultChecked={draft.kind === k.value} className="peer sr-only" />
                    <span className="inline-block rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink-2 transition-colors peer-checked:border-lime-ink peer-checked:bg-lime/15 peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-lime/40">
                      {k.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Bank or company" hint="Shown next to the logo, e.g. HDFC Bank, Bajaj Finserv, Tata Neu UPI.">
              <input name="provider" defaultValue={offer?.provider} required maxLength={60} list="offer-providers" placeholder="e.g. ICICI Bank" className={input} />
              <datalist id="offer-providers">
                {PROVIDERS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>

            <Field label="Headline" hint="The first line shoppers read. Keep it short.">
              <input name="title" defaultValue={offer?.title} required maxLength={90} placeholder="e.g. ₹4,000 instant discount on credit cards" className={input} />
            </Field>

            <Field label="Full details" hint="Everything the shopper should know: minimum amount, cards that qualify, EMI tenure, how to claim. Shown when they tap View more.">
              <textarea
                name="details"
                defaultValue={offer?.details}
                required
                rows={5}
                maxLength={2000}
                placeholder="Instant discount of ₹4,000 on ICICI Bank Credit Card on a minimum transaction of ₹54,000. Valid on full swipe and EMI."
                className={input}
              />
            </Field>

            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">Logo</span>
              <div className="flex flex-wrap items-center gap-3">
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="h-12 w-12 rounded-lg border border-line bg-white object-contain p-1" />
                )}
                <label className={`${btn.secondary} cursor-pointer`}>
                  {logoUrl ? "Change logo" : "Upload logo"}
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setNewLogo(file ? URL.createObjectURL(file) : null);
                      if (file) setRemoveLogo(false);
                    }}
                  />
                </label>
                {(offer?.logoUrl || copyFrom) && !newLogo && (
                  <label className="flex items-center gap-2 text-sm font-semibold text-ink-2">
                    <input type="checkbox" name="removeLogo" checked={removeLogo} onChange={(e) => setRemoveLogo(e.target.checked)} className="h-4 w-4 accent-lime-ink" />
                    No logo
                  </label>
                )}
              </div>
              <span className="mt-1 block text-xs text-ink-3">Optional. A square PNG or SVG under 2 MB. Without one, the card shows the name&apos;s initials.</span>
            </div>
          </div>
        </Card>

        <Card title="Where it shows">
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
              <input type="checkbox" name="allBrands" checked={allBrands} onChange={(e) => setAllBrands(e.target.checked)} className="h-4.5 w-4.5 accent-lime-ink" />
              Every brand
            </label>
            {!allBrands && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PHONE_BRANDS.map((b) => (
                  <label key={b.slug} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink-2 has-checked:border-lime-ink has-checked:bg-lime/10 has-checked:text-ink">
                    <input type="checkbox" name="brands" value={b.slug} defaultChecked={offer?.brands.includes(b.slug)} className="h-4 w-4 accent-lime-ink" />
                    {b.name}
                  </label>
                ))}
              </div>
            )}
            <Field label="Minimum phone price (₹)" hint="Optional. Phones priced below this won't show the offer, e.g. 54000 for “minimum transaction ₹54,000”.">
              <input name="minPrice" type="number" min={1} step={1} defaultValue={offer?.minPrice ?? undefined} placeholder="Any price" className={`${input} sm:max-w-60`} />
            </Field>
          </div>
        </Card>

        <Card title="When it runs">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Starts" hint="Blank = from today.">
              <input name="startsAt" type="date" defaultValue={offer?.startsAt} className={input} />
            </Field>
            <Field label="Ends" hint="Blank = until you hide it. Ends at midnight.">
              <input name="endsAt" type="date" defaultValue={offer?.endsAt} className={input} />
            </Field>
            <Field label="Display order" hint="Lower numbers show first.">
              <input name="position" type="number" step={1} defaultValue={offer?.position ?? 0} className={input} />
            </Field>
          </div>
        </Card>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink">
          <input type="checkbox" name="isActive" defaultChecked={offer?.isActive ?? true} className="h-4.5 w-4.5 accent-lime-ink" />
          Show on the website
        </label>

        <div className="sticky bottom-20 z-10 flex justify-end lg:bottom-4">
          <ConfirmSubmitButton isPending={isSubmitting} className={`${btn.primary} px-6 py-3`} pendingLabel="Saving…">
            {submitLabel}
          </ConfirmSubmitButton>
        </div>
      </div>

      <aside className="order-first lg:sticky lg:top-9 lg:order-0">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">Preview</p>
        <div className="w-60">
          <OfferCard offer={{ ...draft, logoUrl }} />
        </div>
      </aside>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}
