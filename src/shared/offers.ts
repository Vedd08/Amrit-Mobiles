// Bank, card, EMI and UPI offers ("Super Savings" on the product page). The
// owner manages them at /admin/offers; each one can target every brand or a
// few, and a minimum phone price.

export const OFFER_KINDS = [
  { value: "BANK", label: "Bank offer", plural: "Bank offers" },
  { value: "CREDIT_CARD", label: "Credit card", plural: "Credit card" },
  { value: "DEBIT_CARD", label: "Debit card", plural: "Debit card" },
  { value: "EMI", label: "EMI", plural: "EMI" },
  { value: "UPI", label: "UPI & wallets", plural: "UPI & wallets" },
] as const;

export type OfferKind = (typeof OFFER_KINDS)[number]["value"];

export function offerKind(value: string) {
  return OFFER_KINDS.find((k) => k.value === value) ?? OFFER_KINDS[0];
}

/** What the product page needs to show an offer. Dates are ISO strings. */
export type OfferData = {
  id: string;
  kind: string;
  provider: string;
  logoUrl: string | null;
  title: string;
  details: string;
  /** Brand slugs; empty means every brand. */
  brands: string[];
  minPrice: number | null;
  startsAt: string | null;
  endsAt: string | null;
};

export const parseOfferBrands = (raw: string) => raw.split(",").map((s) => s.trim()).filter(Boolean);

/** Whether a visible offer is running now. */
export function offerIsLive(offer: Pick<OfferData, "startsAt" | "endsAt">, now = Date.now()) {
  if (offer.startsAt && Date.parse(offer.startsAt) > now) return false;
  if (offer.endsAt && Date.parse(offer.endsAt) < now) return false;
  return true;
}

/** The live offers that apply to one phone, by its brand slug and price. */
export function offersFor(offers: OfferData[], brandSlug: string | undefined, price: number, now = Date.now()) {
  return offers.filter(
    (o) =>
      offerIsLive(o, now) &&
      (o.brands.length === 0 || (brandSlug !== undefined && o.brands.includes(brandSlug))) &&
      (o.minPrice === null || price >= o.minPrice)
  );
}

/** Two letters for an offer without a logo: "HDFC Bank" -> "HB", "ICICI" -> "IC". */
export function offerInitials(provider: string) {
  const words = provider.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
