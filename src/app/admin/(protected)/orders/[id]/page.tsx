import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/backend/lib/prisma";
import { ORDER_STATUSES, STATUS_META, statusMeta } from "@/backend/lib/order-status";
import { orderRef } from "@/shared/whatsapp";
import { WhatsAppIcon } from "@/frontend/components/icons";
import { Card, PageHeader, StatusBadge, btn, input } from "@/admin/components/ui";
import { ConfirmSubmitButton } from "@/admin/components/ConfirmSubmitButton";
import { CheckIcon, ImageIcon, PhoneIcon, StoreIcon } from "@/admin/components/icons";
import { branchFor, customerCallLink, customerChatLink } from "@/admin/lib/orders";
import { formatDateTime, inr, timeAgo } from "@/admin/lib/format";
import { saveStaffNote, updateOrderStatus } from "../actions";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, slug: true, images: { orderBy: { position: "asc" }, take: 1, select: { url: true } } } },
        },
      },
    },
  });
  if (!order) notFound();

  const branch = branchFor(order.branch);
  const meta = statusMeta(order.status);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Order #{orderRef(order.id)}
            <StatusBadge status={order.status} className="text-sm" />
          </span>
        }
        description={
          <span title={order.createdAt.toISOString()}>
            Placed {formatDateTime(order.createdAt)} ({timeAgo(order.createdAt)})
            {order.checkoutMethod === "WHATSAPP" ? " · Order form → WhatsApp" : " · Online payment"}
          </span>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {/* Reach the customer */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-ink">{order.customerName}</p>
                <p className="tabular-nums text-ink-3">+91 {order.phone}</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <a
                  href={customerChatLink(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn.whatsapp} flex-1 sm:flex-none`}
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  WhatsApp
                </a>
                <a href={customerCallLink(order.phone)} className={`${btn.secondary} flex-1 sm:flex-none`}>
                  <PhoneIcon className="h-4 w-4" />
                  Call
                </a>
              </div>
            </div>
            {order.note && (
              <div className="mt-4 rounded-xl bg-[#FFF8E6] px-4 py-3 text-sm text-[#6B4A00]">
                <span className="font-bold">Customer note: </span>
                {order.note}
              </div>
            )}
          </Card>

          {/* Items */}
          <Card title={`${itemCount} item${itemCount === 1 ? "" : "s"}`}>
            <ul className="divide-y divide-line">
              {order.items.map((item) => {
                const img = item.product?.images[0]?.url;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-paper">
                      {img ? (
                        <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-ink-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      {item.product ? (
                        <Link href={`/admin/products/${item.product.id}/edit`} className="font-semibold text-ink hover:underline">
                          {item.name}
                        </Link>
                      ) : (
                        <p className="font-semibold text-ink">{item.name}</p>
                      )}
                      <p className="text-xs tabular-nums text-ink-3">
                        {inr(item.price)} × {item.quantity}
                        {!item.product && " · no longer in the catalogue"}
                      </p>
                    </div>
                    <p className="font-bold tabular-nums text-ink">{inr(item.price * item.quantity)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-4">
              <span className="font-bold text-ink">Total</span>
              <span className="text-xl font-extrabold text-ink">{inr(order.total)}</span>
            </div>
          </Card>

          {/* Delivery + branch */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Card title="Address or area">
              <p className="whitespace-pre-line text-sm text-ink-2">{order.address}</p>
            </Card>
            <Card title="Branch">
              {branch ? (
                <div className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime/12 text-lime-ink">
                    <StoreIcon className="h-4.5 w-4.5" />
                  </span>
                  <div className="text-sm">
                    <p className="font-bold text-ink">{branch.name}</p>
                    <p className="text-ink-3">{branch.area}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-3">Not recorded (placed before branches were saved).</p>
              )}
            </Card>
          </div>
        </div>

        {/* Status + staff note */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Card title="Status">
            <p className="-mt-2 mb-4 text-sm text-ink-3">{meta.hint}</p>
            <form action={updateOrderStatus.bind(null, order.id)} className="grid gap-2">
              {ORDER_STATUSES.map((s) => {
                const current = s === order.status;
                const m = STATUS_META[s];
                return (
                  <ConfirmSubmitButton
                    key={s}
                    name="status"
                    value={s}
                    disabled={current}
                    aria-pressed={current}
                    confirmMessage={
                      s === "CANCELLED"
                        ? `Cancel order #${orderRef(order.id)}? Its ${itemCount} item${itemCount === 1 ? "" : "s"} go back into stock.`
                        : undefined
                    }
                    pendingLabel="Saving…"
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors disabled:cursor-default ${
                      current
                        ? "border-lime-ink/50 bg-lime/15 text-ink"
                        : s === "CANCELLED"
                          ? "border-line bg-white text-danger hover:border-danger/40 hover:bg-danger/5"
                          : "border-line bg-white text-ink hover:border-ink-4 hover:bg-paper"
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${m.dot}`} aria-hidden />
                    <span className="flex-1">{current ? m.label : s === "CANCELLED" ? "Cancel order" : `Mark ${m.label.toLowerCase()}`}</span>
                    {current && <CheckIcon className="h-4 w-4" />}
                  </ConfirmSubmitButton>
                );
              })}
            </form>
          </Card>

          <Card title="Staff note">
            <form action={saveStaffNote.bind(null, order.id)} className="space-y-3">
              <label htmlFor="staffNote" className="sr-only">
                Staff note
              </label>
              <textarea
                id="staffNote"
                name="staffNote"
                rows={4}
                maxLength={1000}
                defaultValue={order.staffNote ?? ""}
                placeholder="Only the team sees this, e.g. 'Coming Saturday, wants exchange quote'"
                className={input}
              />
              <ConfirmSubmitButton className={`${btn.secondary} w-full`} pendingLabel="Saving…">
                Save note
              </ConfirmSubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
