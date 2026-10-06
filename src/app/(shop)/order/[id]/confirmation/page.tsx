import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/backend/lib/prisma";
import { buildOrderMessage, buildWhatsAppLink, SHOP_WHATSAPP_NUMBER } from "@/shared/whatsapp";
import { WhatsAppIcon } from "@/frontend/components/icons";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const whatsappLink = buildWhatsAppLink(
    SHOP_WHATSAPP_NUMBER,
    buildOrderMessage({
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items,
      total: order.total,
    })
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-lg border border-line bg-paper p-6 text-center sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime/10 text-lime-ink">
          ✓
        </span>
        <h1 className="mt-4 text-xl font-bold">Order placed!</h1>
        <p className="mt-1 text-sm text-ink-3">Order #{order.id.slice(-8).toUpperCase()}</p>

        {order.checkoutMethod === "WHATSAPP" ? (
          <p className="mt-4 text-sm text-ink-3">
            We opened WhatsApp with your order details. If it didn&apos;t open, tap below to send it to us.
          </p>
        ) : (
          <p className="mt-4 text-sm text-ink-3">
            Online payment isn&apos;t set up yet — please confirm your order with us on WhatsApp and we&apos;ll
            arrange payment on delivery or share a payment link.
          </p>
        )}

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-white"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Message us on WhatsApp
        </a>

        <div className="mt-8 divide-y divide-border rounded-lg border border-line text-left text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between px-4 py-2.5">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-2.5 font-semibold">
            <span>Total</span>
            <span>₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <Link href="/" className="mt-6 inline-block text-sm font-medium text-lime-ink hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
