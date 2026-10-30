import Link from "next/link";
import { prisma } from "@/backend/lib/prisma";
import { ConfirmSubmitButton } from "@/admin/components/ConfirmSubmitButton";
import { EmptyState, PageHeader, btn } from "@/admin/components/ui";
import { PlusIcon, TrashIcon } from "@/admin/components/icons";
import { inr, formatDay } from "@/admin/lib/format";
import { OFFER_STATUS_META, brandSummary, offerStatus } from "@/admin/lib/offers";
import { OFFER_KINDS, offerInitials, offerKind } from "@/shared/offers";
import { deleteOffer, toggleOffer } from "./actions";

export default async function AdminOffersPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const all = await prisma.offer.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });
  const offers = kind ? all.filter((o) => o.kind === kind) : all;
  const now = new Date();
  const live = all.filter((o) => offerStatus(o, now) === "live").length;

  const tab = (active: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
      active ? "bg-ink text-white" : "bg-white text-ink-2 ring-1 ring-inset ring-line hover:bg-paper-2"
    }`;

  return (
    <div>
      <PageHeader
        title="Offers"
        description={
          all.length === 0
            ? "Bank, card, EMI and UPI offers. They show as “Super Savings” on each phone's page."
            : `${live} of ${all.length} live on the website. They show as “Super Savings” on each phone's page.`
        }
        actions={
          <Link href="/admin/offers/new" className={btn.primary}>
            <PlusIcon className="h-4 w-4" />
            Add offer
          </Link>
        }
      />

      {all.length > 0 && (
        <nav aria-label="Offer type" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/admin/offers" className={tab(!kind)}>
            All ({all.length})
          </Link>
          {OFFER_KINDS.map((k) => {
            const count = all.filter((o) => o.kind === k.value).length;
            return count === 0 ? null : (
              <Link key={k.value} href={`/admin/offers?kind=${k.value}`} className={tab(kind === k.value)}>
                {k.plural} ({count})
              </Link>
            );
          })}
        </nav>
      )}

      {offers.length === 0 ? (
        <EmptyState title="No offers yet">
          Add the bank and EMI offers running now, like “₹4,000 off on HDFC credit cards”. Pick the brands each one
          applies to, and it shows on those phones.
        </EmptyState>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line bg-white">
          {offers.map((o) => {
            const status = OFFER_STATUS_META[offerStatus(o, now)];
            return (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line px-4 py-4 last:border-0 sm:px-5">
                <Link href={`/admin/offers/${o.id}/edit`} className="flex min-w-0 flex-1 basis-72 items-center gap-3.5">
                  {o.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-line bg-white object-contain p-1" />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper-2 text-xs font-bold text-ink-2">
                      {offerInitials(o.provider)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold text-ink">{o.provider}</span>
                      <span className="text-xs font-bold uppercase text-lime-ink">{offerKind(o.kind).label}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-2">{o.title}</span>
                    <span className="mt-0.5 block text-xs text-ink-3">
                      {brandSummary(o.brands)}
                      {o.minPrice ? ` · phones from ${inr(o.minPrice)}` : ""}
                      {o.startsAt && o.startsAt > now ? ` · starts ${formatDay(o.startsAt)}` : ""}
                      {o.endsAt ? ` · ${o.endsAt < now ? "ended" : "till"} ${formatDay(o.endsAt)}` : ""}
                    </span>
                  </span>
                </Link>

                <div className="ml-auto flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${status.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
                    {status.label}
                  </span>
                  <form action={toggleOffer}>
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="isActive" value={String(!o.isActive)} />
                    <ConfirmSubmitButton className={btn.ghost} pendingLabel="…">
                      {o.isActive ? "Hide" : "Show"}
                    </ConfirmSubmitButton>
                  </form>
                  <Link href={`/admin/offers/new?from=${o.id}`} className={btn.ghost}>
                    Duplicate
                  </Link>
                  <form action={deleteOffer}>
                    <input type="hidden" name="id" value={o.id} />
                    <ConfirmSubmitButton
                      aria-label={`Delete the ${o.provider} offer`}
                      confirmMessage={`Delete the ${o.provider} offer? This can't be undone.`}
                      className="grid h-9 w-9 place-items-center rounded-full text-ink-4 transition-colors hover:bg-danger/8 hover:text-danger"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
