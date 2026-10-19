// Orders are completed on WhatsApp (online payment isn't live), so an order
// only moves New -> Contacted -> Completed, or gets Cancelled.
export const ORDER_STATUSES = ["NEW", "CONTACTED", "COMPLETED", "CANCELLED"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_META: Record<OrderStatus, { label: string; hint: string; badge: string; dot: string }> = {
  NEW: {
    label: "New",
    hint: "Waiting for the store to reply",
    badge: "bg-[#FFF4D6] text-[#8A5A00] ring-[#F2D58A]",
    dot: "bg-[#E8A317]",
  },
  CONTACTED: {
    label: "Contacted",
    hint: "Talking to the customer",
    badge: "bg-[#E3F4F6] text-[#1F6F78] ring-[#B5DFE4]",
    dot: "bg-teal",
  },
  COMPLETED: {
    label: "Completed",
    hint: "Sold and handed over",
    badge: "bg-lime/15 text-lime-ink ring-lime/40",
    dot: "bg-lime",
  },
  CANCELLED: {
    label: "Cancelled",
    hint: "Won't go ahead; stock is back on the shelf",
    badge: "bg-danger/8 text-danger ring-danger/25",
    dot: "bg-danger",
  },
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function statusMeta(status: string) {
  return isOrderStatus(status) ? STATUS_META[status] : { label: status, hint: "", badge: "bg-paper-2 text-ink-3 ring-line", dot: "bg-ink-4" };
}

/** Statuses whose items still hold stock (everything except Cancelled). */
export const HOLDS_STOCK = (status: string) => status !== "CANCELLED";
