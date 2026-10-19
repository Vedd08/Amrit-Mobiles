import { business } from '@/shared/business';

/**
 * The family's tagline, "Amrit hai toh bharosa hai.", with the key words
 * highlighted like a lime marker stroke. Size and spacing come from `className`.
 */
export function PromiseLine({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  const { lead, key } = business.promise;
  return (
    <p className={`font-extrabold leading-tight tracking-tight text-ink ${className}`} style={style}>
      <span className="text-lime-ink">“</span>
      {lead}{' '}
      <span className="relative whitespace-nowrap">
        <span aria-hidden className="absolute inset-x-[-0.12em] bottom-[0.06em] top-[0.42em] rounded-[0.18em] bg-lime/45" />
        <span className="relative">{key.replace(/\.$/, '')}</span>
      </span>
      <span className="text-lime-ink">.”</span>
    </p>
  );
}
