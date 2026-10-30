import type { Offer } from "@/backend/generated/prisma/client";
import type { OfferDefaults } from "@/admin/components/OfferForm";
import { parseOfferBrands } from "@/shared/offers";
import { PHONE_BRANDS } from "@/shared/phone-catalog";
import { istDayKey } from "./format";

/** A saved offer as the offer form's starting values. */
export function offerDefaults(o: Offer): OfferDefaults {
  return {
    kind: o.kind,
    provider: o.provider,
    logoUrl: o.logoUrl,
    title: o.title,
    details: o.details,
    brands: parseOfferBrands(o.brands),
    minPrice: o.minPrice,
    startsAt: o.startsAt ? istDayKey(o.startsAt) : "",
    endsAt: o.endsAt ? istDayKey(o.endsAt) : "",
    position: o.position,
    isActive: o.isActive,
  };
}

export type OfferStatus = "live" | "scheduled" | "ended" | "hidden";

export function offerStatus(o: Pick<Offer, "isActive" | "startsAt" | "endsAt">, now = new Date()): OfferStatus {
  if (!o.isActive) return "hidden";
  if (o.endsAt && o.endsAt < now) return "ended";
  if (o.startsAt && o.startsAt > now) return "scheduled";
  return "live";
}

export const OFFER_STATUS_META: Record<OfferStatus, { label: string; badge: string; dot: string }> = {
  live: { label: "Live", badge: "bg-lime/12 text-lime-ink ring-lime/30", dot: "bg-lime-ink" },
  scheduled: { label: "Starts later", badge: "bg-[#FFF6E5] text-[#9A6400] ring-[#E8A317]/30", dot: "bg-[#E8A317]" },
  ended: { label: "Ended", badge: "bg-paper-2 text-ink-3 ring-line", dot: "bg-ink-4" },
  hidden: { label: "Hidden", badge: "bg-paper-2 text-ink-3 ring-line", dot: "bg-ink-4" },
};

/** "Every brand", or "Samsung, Apple, Vivo +2". */
export function brandSummary(raw: string) {
  const slugs = parseOfferBrands(raw);
  if (slugs.length === 0) return "Every brand";
  const names = slugs.map((s) => PHONE_BRANDS.find((b) => b.slug === s)?.name ?? s);
  return names.length > 3 ? `${names.slice(0, 3).join(", ")} +${names.length - 3}` : names.join(", ");
}
