import { formatINR } from "@/frontend/lib/phone-experience-data";

/**
 * The signature element on the product page: a die-cut ticket, like the
 * paper price tags clipped to phones in the shop window. Deliberately not
 * another pill badge — this one has a punched notch and a torn-edge divider.
 */
export function PriceTag({
  price,
  mrp,
  discount,
  className = "",
}: {
  price: number;
  mrp?: number | null;
  discount?: number | null;
  className?: string;
}) {
  const showMrp = Boolean(mrp && mrp > price);

  return (
    <div
      className={`relative -rotate-3 drop-${className}`}
      style={{ clipPath: "polygon(22px 0%, 100% 0%, 100% 100%, 22px 100%, 0% 50%)" }}
    >
      <div className="relative min-w-[164px] bg-ink py-3.5 pl-9 pr-5">
        <span className="absolute left-[9px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white/40" />
        <span className="absolute bottom-1 left-[22px] top-1 border-l border-dashed border-white/15" />

        <p className="text-micro font-bold uppercase text-white/45">Surat Counter</p>
        <p className="mt-1 text-xl font-bold leading-none text-white">{formatINR(price)}</p>

        {showMrp && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-micro font-semibold text-white/40 line-through">{formatINR(mrp!)}</span>
            {discount ? (
              <span className="rounded-full bg-danger/20 px-1.5 py-0.5 text-micro font-bold text-line">
                {discount}% off
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
