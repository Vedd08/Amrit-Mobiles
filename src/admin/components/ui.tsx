import Link from "next/link";
import { statusMeta } from "@/backend/lib/order-status";
import { ArrowLeftIcon } from "./icons";

// Shared look for every admin page: light paper background, white cards,
// lime primary actions with dark text (same as the shop).

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-lime px-4 py-2.5 text-sm font-bold text-[#2A2A2A] shadow-[0_8px_18px_-10px_rgba(95,138,13,0.9)] transition-[transform,background-color] hover:-translate-y-px hover:bg-lime-lo disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink-4 hover:bg-paper disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full border border-danger/25 bg-white px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/5",
  whatsapp:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#0B3B1F] transition-[transform,filter] hover:-translate-y-px hover:brightness-105",
};

export const input =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-lime-ink focus:ring-2 focus:ring-lime/25";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-ink">
          <ArrowLeftIcon className="h-4 w-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink md:text-[28px]">{title}</h1>
          {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({
  title,
  action,
  className = "",
  children,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[15px] font-bold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <p className="font-bold text-ink">{title}</p>
      {children && <div className="mt-1 text-sm text-ink-3">{children}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "error"; children: React.ReactNode }) {
  const tones = {
    info: "border-line bg-paper-2 text-ink-2",
    success: "border-lime/40 bg-lime/10 text-lime-ink",
    error: "border-danger/30 bg-danger/8 text-danger",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${tones[tone]}`}>
      {children}
    </p>
  );
}
