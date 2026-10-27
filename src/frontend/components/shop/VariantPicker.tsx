import Link from "next/link";
import type { PhoneVariant } from "@/frontend/components/shop/ProductCard";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { memoryLabel } from "@/shared/phone-catalog";
import { swatchFor } from "@/shared/colour-swatch";

/**
 * Colour and memory pickers on the product page. Every option is its own
 * product (own slug, price and stock), so each choice is a link to that
 * page, replacing history so Back still leaves the product.
 */
export function VariantPicker({ variants, currentSlug }: { variants: PhoneVariant[]; currentSlug: string }) {
  const current = variants.find((v) => v.slug === currentSlug);
  if (!current || variants.length < 2) return null;

  const colours = [...new Set(variants.map((v) => v.colour).filter(Boolean))];
  const memoryOf = (v: PhoneVariant) => memoryLabel(v);
  // Switching colour keeps the memory size when that colour has it.
  const forColour = (colour: string) =>
    variants.find((v) => v.colour === colour && memoryOf(v) === memoryOf(current)) ??
    variants.find((v) => v.colour === colour)!;
  const memories = variants
    .filter((v) => v.colour === current.colour)
    .sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-5">
      {colours.length > 1 && (
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Colour: <span className="normal-case tracking-normal text-ink">{current.colour}</span>
          </legend>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {colours.map((colour) => {
              const target = forColour(colour);
              const active = colour === current.colour;
              return (
                <Link
                  key={colour}
                  href={`/product/${target.slug}`}
                  replace
                  scroll={false}
                  aria-label={colour}
                  aria-current={active ? "true" : undefined}
                  title={colour}
                  className={`group flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-small font-semibold transition-colors ${
                    active ? "border-ink bg-surface text-ink" : "border-line bg-surface text-ink-2 hover:border-steel"
                  } ${target.stock === 0 ? "opacity-50" : ""}`}
                >
                  <span
                    className="h-6 w-6 rounded-full border border-ink/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]"
                    style={{ background: swatchFor(colour) }}
                  />
                  {colour}
                </Link>
              );
            })}
          </div>
        </fieldset>
      )}

      {memories.length > 0 && memories.some((v) => memoryOf(v)) && (
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-wider text-ink-3">
            RAM + Storage: <span className="normal-case tracking-normal text-ink">{memoryOf(current)}</span>
          </legend>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {memories.map((v) => {
              const active = v.slug === current.slug;
              return (
                <Link
                  key={v.slug}
                  href={`/product/${v.slug}`}
                  replace
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  className={`flex flex-col rounded-md border px-3 py-2.5 transition-colors ${
                    active ? "border-ink bg-surface ring-1 ring-ink" : "border-line bg-surface hover:border-steel"
                  } ${v.stock === 0 ? "opacity-50" : ""}`}
                >
                  <span className="text-small font-bold text-ink">{memoryOf(v)}</span>
                  <span className="mt-0.5 text-xs font-semibold tabular-nums text-ink-3">
                    {v.stock === 0 ? "Sold out" : formatINR(v.price)}
                  </span>
                </Link>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
