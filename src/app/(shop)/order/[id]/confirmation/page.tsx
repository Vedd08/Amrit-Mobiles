import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/backend/lib/prisma";
import { buildOrderMessage, buildWhatsAppLink, orderRef, SHOP_WHATSAPP_NUMBER } from "@/shared/whatsapp";
import { CHAT_BRANCHES } from "@/shared/branches";
import { WhatsAppIcon } from "@/frontend/components/icons";

/**
 * Where the visitor lands when they come back from WhatsApp (checkout puts
 * this URL in history before opening the chat), and the fallback if WhatsApp
 * didn't open.
 */
export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ store?: string }>;
}) {
  const { id } = await params;
  const { store } = await searchParams;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const branch = CHAT_BRANCHES.find((b) => b.slug === (order.branch ?? store));
  const whatsappLink = buildWhatsAppLink(
    branch?.phone ?? SHOP_WHATSAPP_NUMBER,
    buildOrderMessage({
      id: order.id,
      customerName: order.customerName,
      phone: `+91 ${order.phone}`,
      address: order.address,
      items: order.items,
      total: order.total,
      store: branch?.name,
      note: order.note ?? undefined,
    }),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime/15 text-xl font-bold text-lime-ink">
          ✓
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink">Order received</h1>
        <p className="mt-1 text-sm text-ink-3">Order #{orderRef(order.id)}</p>

        <p className="mx-auto mt-4 max-w-[46ch] text-sm text-ink-2">
          {`${branch ? `The ${branch.name} store` : "The store"} will confirm availability and payment on WhatsApp.`}{" "}
          If you haven&apos;t sent the order message yet, send it now.
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-bold text-[#2A2A2A]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Send order on WhatsApp
        </a>

        <div className="mt-8 divide-y divide-line rounded-xl border border-line text-left text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 px-4 py-2.5">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="shrink-0 font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-2.5 font-semibold">
            <span>Total</span>
            <span>₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <Link href="/phones" className="mt-6 inline-block text-sm font-semibold text-lime-ink hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
