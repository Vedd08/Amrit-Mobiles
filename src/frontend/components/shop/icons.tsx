type IconProps = { className?: string };

const base = "w-4 h-4";

export function BoltIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

export function ShieldIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function RefreshIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 0 1-15.4 6.4L3 16M3 21v-5h5" />
    </svg>
  );
}

export function PinIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

export function BoxIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export function PhoneIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path strokeLinecap="round" d="M11 18h2" />
    </svg>
  );
}

export function SparkleIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}

export function TrophyIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4M10 15v3H8v2h8v-2h-2v-3" />
    </svg>
  );
}

export function HeadphoneIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </svg>
  );
}

export function CardIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path strokeLinecap="round" d="M2.5 10h19" />
    </svg>
  );
}

export function TruckIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 7h11v10H2zM13 10h5l3 3v4h-8z" />
      <circle cx="6.5" cy="18.5" r="1.6" />
      <circle cx="17" cy="18.5" r="1.6" />
    </svg>
  );
}

export function MessageIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.4 8.4 0 0 1-8.9 8.5 8.6 8.6 0 0 1-3.5-.7L3 21l1.8-5a8.4 8.4 0 0 1-.8-3.5A8.4 8.4 0 0 1 12.6 3a8.4 8.4 0 0 1 8.4 8.5Z" />
    </svg>
  );
}

export function StoreIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M2 9l1.5-5h17L22 9M2 9h20M9 20v-6h6v6" />
    </svg>
  );
}

export function ReceiptIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12v20l-2.5-1.5L13 22l-2.5-1.5L8 22l-2-1.5V2Z" />
      <path strokeLinecap="round" d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  );
}

export function ScaleIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M6 7l-3 6a3 3 0 0 0 6 0l-3-6ZM18 7l-3 6a3 3 0 0 0 6 0l-3-6ZM7 21h10M5 7h4M15 7h4" />
    </svg>
  );
}
