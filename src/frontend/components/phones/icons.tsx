// Line icons for the /phones section, matching the stroke weight and 24-grid
// of components/shop/icons.tsx. Only the marks that section needs and the
// shared set doesn't already have.

type IconProps = { className?: string };
const base = "w-4 h-4";

export function StarIcon({ className = base, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 20.6l1-5.8-4.3-4.1 5.9-.9L12 3.5z"
      />
    </svg>
  );
}

export function HeartIcon({ className = base, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20s-7-4.4-9.3-8.4C1.3 9 2.5 5.6 5.8 5.1 8 4.8 9.6 6 12 8.6 14.4 6 16 4.8 18.2 5.1c3.3.5 4.5 3.9 3.1 6.5C19 15.6 12 20 12 20z"
      />
    </svg>
  );
}

export function CameraIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l1.5-2h7L18 8h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

export function SignalIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20v-4M9 20v-8M14 20v-12M19 20V6" />
    </svg>
  );
}

export function BatteryIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2.5" y="8" width="16" height="8" rx="2" />
      <path strokeLinecap="round" d="M21 11v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 9.5 8.5 13h3l-3 1.5" />
    </svg>
  );
}

export function SlidersIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 6l-6 6 6 6M20 12H8" />
    </svg>
  );
}

export function ArrowRightIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6l6 6-6 6M4 12h12" />
    </svg>
  );
}

export function CloseIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
