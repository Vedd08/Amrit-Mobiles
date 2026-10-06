type IconProps = { className?: string };

const base = "h-4.5 w-4.5";

export function DashboardIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function ProductsIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5 9 5 9-5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8v8l9 5 9-5V8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13v8" />
    </svg>
  );
}

export function CategoriesIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.2 3.5H6a2.5 2.5 0 0 0-2.5 2.5v5.2c0 .66.26 1.3.73 1.77l8.3 8.3a2.5 2.5 0 0 0 3.54 0l5.2-5.2a2.5 2.5 0 0 0 0-3.54l-8.3-8.3a2.5 2.5 0 0 0-1.77-.73Z"
      />
      <circle cx="8.3" cy="8.3" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function OrdersIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v5h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h5" />
    </svg>
  );
}

export function SearchIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function PlusIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7h12Z" />
      <path strokeLinecap="round" d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function AlertIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.6 1.9 18a1.8 1.8 0 0 0 1.5 2.7h17.2a1.8 1.8 0 0 0 1.5-2.7L13.7 3.6a1.8 1.8 0 0 0-3.4 0Z" />
      <path strokeLinecap="round" d="M12 9v4" />
      <circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function ImageIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 15-5-5-11 11" />
    </svg>
  );
}

export function LogoutIcon({ className = base }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5" />
      <path strokeLinecap="round" d="M21 12H9" />
    </svg>
  );
}
