import Link from "next/link";
import Image from "next/image";

type IconType = ({ className }: { className?: string }) => React.ReactNode;

/**
 * Image-top category card with a labelled footer strip — the pattern lifted
 * from the reference's "shop by category" row, rebuilt for a phone shelf.
 */
export function CategoryCard({
  slug,
  name,
  image,
  count,
  Icon,
}: {
  slug: string;
  name: string;
  image: string | null;
  count: number;
  Icon: IconType;
}) {
  return (
    <Link
      href={`/phones/category/${slug}`}
      className="group block overflow-hidden rounded-lg border border-line bg-surface shadow-sh-1 transition-all duration-200 hover:border-lime-ink hover:-translate-y-1 hover:shadow-sh-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
    >
      <div className="relative aspect-[4/3] w-full bg-paper">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 24vw, 46vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center gap-2 p-5 bg-surface text-ink text-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper text-ink transition-colors group-hover:bg-lime">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <span className="block text-body font-bold text-ink transition-colors">{name}</span>
          <span className="block text-micro font-medium text-ink-3 mt-1 uppercase tracking-widest">{count} {count === 1 ? 'phone' : 'phones'}</span>
        </div>
      </div>
    </Link>
  );
}
