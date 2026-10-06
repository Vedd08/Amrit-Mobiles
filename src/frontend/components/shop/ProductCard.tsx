import Image from "next/image";
import Link from "next/link";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  mrp: number | null;
  image: string | null;
  stock: number;
  description?: string | null;
  specs?: string | null;
  createdAt: string;
  category: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  // Only surface the discount badge when it is worth shouting about — a
  // "3% OFF" pill is loud red furniture for nothing.
  const rawDiscount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;
  const discount = rawDiscount && rawDiscount >= 8 ? rawDiscount : null;

  // Calculate instant 12-month paperless counter EMI
  const monthlyEmi = Math.round(product.price / 12);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-line bg-white transition-all duration-300 hover:-translate-y-2 hover:border-lime hover:shadow-sh-2 shadow-2xs relative flex flex-col justify-between h-full select-none"
    >
      {/* Top Image & Badge Container */}
      <div className="relative aspect-square w-full bg-gradient-to-br from-paper via-ink-hi to-paper overflow-hidden p-6 flex items-center justify-center">
        {product.image ? (
          <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-ink-3 font-semibold text-xs uppercase tracking-wider">
            No image
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
          {discount && (
            <span className="rounded-full bg-danger px-3 py-1 text-micro font-bold text-white shadow-md uppercase tracking-wider w-fit">
              {discount}% OFF
            </span>
          )}
          <span className="rounded-full -ink px-2.5 py-0.5 text-micro font-extrabold text-white shadow-xs uppercase tracking-wider w-fit">
            0% EMI
          </span>
        </div>

        {/* Stock Status Badge */}
        {product.stock === 0 ? (
          <span className="absolute inset-x-0 bottom-0 -ink/95 py-2 text-center text-xs font-bold text-white uppercase tracking-wider backdrop-blur-xs z-10">
            Out of stock
          </span>
        ) : (
          <span className="absolute right-4 bottom-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-micro font-extrabold text-lime-ink shadow-xs border border-line flex items-center gap-1 z-10 opacity-90 group-hover:opacity-100">
            <span className="h-2 w-2 rounded-full bg-lime-ink animate-pulse" />
            Ready Stock
          </span>
        )}

        {/* Hover Quick Action Icon Button */}
        <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white text-ink flex items-center justify-center shadow-md transition-all duration-200 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-lime hover:text-[#2A2A2A] z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Bottom Details Container */}
      <div className="p-6 bg-white flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-micro font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-ink-hi text-ink-3 border border-line truncate">
              {product.brand}
            </span>
            <span className="text-micro font-extrabold uppercase tracking-wider text-ink-3">
              Surat Branch
            </span>
          </div>
          <h3 className="truncate text-base sm:text-lg font-bold text-ink group-hover:text-lime-ink transition-colors duration-200 leading-tight">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 pt-3.5 border-t border-ink-hi flex items-end justify-between gap-2">
          <div>
            <span className="text-micro font-extrabold uppercase tracking-wider text-ink-3 block">
              Offer Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-ink">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-xs font-semibold text-ink-3 line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-micro font-bold text-lime-ink bg-lime-ink/10 px-2.5 py-1 rounded-full border border-lime-ink/20 block shadow-2xs">
              ₹{monthlyEmi.toLocaleString("en-IN")}/mo*
            </span>
            <span className="text-micro font-bold text-ink-3 uppercase tracking-wider block mt-0.5">
              Zero Interest
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}