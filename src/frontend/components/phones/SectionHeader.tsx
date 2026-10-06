import Link from "next/link";
import { ArrowRightIcon } from "./icons";

/**
 * Section heading for the /phones page. Title does the work; the kicker is
 * optional and used on maybe two sections, not every one.
 */
export function SectionHeader({
  kicker,
  title,
  sub,
  action,
}: {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        <div className="h-1 w-10 rounded-full bg-lime mb-4" />
        {kicker && <p className="mb-3 text-micro font-semibold tracking-widest uppercase text-ink-3">{kicker}</p>}
        <h2 className="mb-0 text-3xl md:text-5xl font-extrabold tracking-tighter text-ink">
          {title}
        </h2>
        {sub && <p className="mt-3 max-w-[52ch] text-body text-ink-3">{sub}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap pb-2 font-semibold text-ink-2 transition-colors hover:text-ink"
        >
          {action.label}
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1.5 motion-reduce:transition-none" />
        </Link>
      )}
    </div>
  );
}
