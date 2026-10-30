import { notFound } from "next/navigation";
import { prisma } from "@/backend/lib/prisma";
import { OfferForm } from "@/admin/components/OfferForm";
import { ConfirmSubmitButton } from "@/admin/components/ConfirmSubmitButton";
import { Card, PageHeader, btn } from "@/admin/components/ui";
import { TrashIcon } from "@/admin/components/icons";
import { offerDefaults } from "@/admin/lib/offers";
import { deleteOffer, saveOffer } from "../../actions";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) notFound();

  return (
    <div className="max-w-5xl">
      <PageHeader back={{ href: "/admin/offers", label: "Offers" }} title={offer.provider} description={offer.title} />
      <OfferForm action={saveOffer.bind(null, id)} offer={offerDefaults(offer)} submitLabel="Save changes" />

      <Card title="Delete offer" className="mt-10 max-w-2xl border-danger/20">
        <p className="text-sm text-ink-3">
          Removes it for good. To take it off the website for now, untick “Show on the website” instead.
        </p>
        <form action={deleteOffer} className="mt-4">
          <input type="hidden" name="id" value={offer.id} />
          <ConfirmSubmitButton confirmMessage={`Delete the ${offer.provider} offer? This can't be undone.`} className={btn.danger} pendingLabel="Deleting…">
            <TrashIcon className="h-4 w-4" />
            Delete offer
          </ConfirmSubmitButton>
        </form>
      </Card>
    </div>
  );
}
