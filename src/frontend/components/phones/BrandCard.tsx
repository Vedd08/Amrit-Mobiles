import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { ArrowRightIcon } from "./icons";

/**
 * One brand in the "Shop by brand" grid. The whole card is the navigation
 * target — /phones/<slug> — nothing here that isn't the link.
 */
export function BrandCard({
  slug,
  name,
  count,
}: {
  slug: string;
  name: string;
  count: number;
}) {
  return (
    <Link
      href={`/phones/${slug}`}
      className="group flex flex-col gap-2 rounded-lg border border-line bg-white p-3.5 transition-colors duration-200 hover:border-line focus-visible:border-lime-ink"
    >
      <span className="flex min-h-[26px] items-center text-body-lg text-ink">
        <BrandMark slug={slug} />
      </span>
      <span className="text-small font-semibold text-ink">{name}</span>
      <span className="flex items-center justify-between text-micro text-ink-3">
        <span>
          {count} {count === 1 ? "phone" : "phones"}
        </span>
        <ArrowRightIcon className="h-4 w-4 shrink-0 text-line transition-all group-hover:translate-x-0.5 group-hover:text-lime-ink motion-reduce:transition-none" />
      </span>
    </Link>
  );
}
