import { CardIcon, ShieldIcon, StoreIcon, TruckIcon } from "@/frontend/components/shop/icons";

type IconType = ({ className }: { className?: string }) => React.ReactNode;

const ITEMS: Array<{ Icon: IconType; title: string; desc: string }> = [
  { Icon: TruckIcon, title: "Free delivery", desc: "On orders over ₹999, anywhere in Surat" },
  { Icon: ShieldIcon, title: "Genuine, sealed stock", desc: "IMEI printed on every bill" },
  { Icon: CardIcon, title: "0% EMI", desc: "10-minute approval at the counter" },
  { Icon: StoreIcon, title: "Six Surat branches", desc: "Walk in for setup and service" },
];

export function TrustRow() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-3 md:gap-4 px-4 py-6 md:py-8 w-full max-w-7xl mx-auto">
      {ITEMS.map(({ Icon, title }) => (
        <li 
          key={title} 
          className="flex items-center gap-2 md:gap-2.5 rounded-full border border-line bg-surface shadow-sh-1 px-4 py-2 md:px-5 md:py-2.5"
        >
          <Icon className="h-4 w-4 text-ink" />
          <span className="text-micro md:text-small font-bold uppercase tracking-wider text-ink">{title}</span>
        </li>
      ))}
    </ul>
  );
}
