import { prisma } from "@/backend/lib/prisma";
import { OfferForm } from "@/admin/components/OfferForm";
import { PageHeader } from "@/admin/components/ui";
import { offerDefaults } from "@/admin/lib/offers";
import { saveOffer } from "../actions";

export default async function NewOfferPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  // "Duplicate" opens this page with ?from=<id>: same offer, for another bank or brand.
  const source = from ? await prisma.offer.findUnique({ where: { id: from } }) : null;

  return (
    <div className="max-w-5xl">
      <PageHeader
        back={{ href: "/admin/offers", label: "Offers" }}
        title={source ? "Duplicate offer" : "Add offer"}
        description={source ? `A copy of “${source.provider}: ${source.title}”. Change what's different and save.` : undefined}
      />
      <OfferForm
        action={saveOffer.bind(null, null)}
        offer={source ? { ...offerDefaults(source), isActive: true } : undefined}
        copyFrom={source?.logoUrl ? source.id : undefined}
        submitLabel="Create offer"
      />
    </div>
  );
}
