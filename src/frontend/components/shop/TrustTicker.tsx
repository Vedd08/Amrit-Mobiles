const ITEMS = [
  "100% Genuine Sealed Stock",
  "IMEI Matched To Every Bill",
  "0% EMI On 40+ Models",
  "10-Minute Paperless Approval",
  "12,000+ Phones Sold In Surat",
  "4.9★ Google Rated Store",
];

function TickerRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex" aria-hidden={ariaHidden}>
      {ITEMS.map((item) => (
        <span
          key={item}
          className="flex items-center gap-3 px-6 py-2.5 text-micro font-bold uppercase text-white whitespace-nowrap"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * Slim marquee bridging the hero into the shop body. Reuses the same facts
 * as the homepage hero's stat grid, just in motion.
 */
export function TrustTicker() {
  return (
    <div className="bg-raised overflow-hidden select-none">
      <div className="flex w-max animate-[amTicker_32s_linear_infinite]">
        <TickerRow />
        <TickerRow ariaHidden />
      </div>
    </div>
  );
}
