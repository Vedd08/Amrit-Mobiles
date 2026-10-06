import { BoltIcon, MessageIcon, StoreIcon, ShieldIcon } from "@/frontend/components/shop/icons";

const TRUST_ITEMS = [
  { Icon: BoltIcon, title: "0% EMI Counter Finance", desc: "Walk out in 10 minutes with paperless approval." },
  { Icon: MessageIcon, title: "WhatsApp Support", desc: "Ask stock, price or trade-in value directly." },
  { Icon: StoreIcon, title: "Surat Counter Pickup", desc: "Reserve online, collect and inspect in-store." },
  { Icon: ShieldIcon, title: "Genuine Warranty", desc: "Sealed box with on-spot IMEI verification." },
];

export function ProductTrustStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className="rounded-lg border border-line bg-paper p-4 sm:p-5">
          <item.Icon className="w-5 h-5 text-ink" />
          <p className="mt-2 text-small font-bold leading-tight text-ink">{item.title}</p>
          <p className="mt-1 text-micro font-medium leading-snug text-ink-3">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
