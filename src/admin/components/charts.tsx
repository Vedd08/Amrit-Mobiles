import { inr, inrCompact } from "@/admin/lib/format";

// Small, dependency-free charts for the dashboard. One series each, so one
// hue (lime-ink #5F8A0D: passes 3:1 against white; the logo lime doesn't).
// Values are always written out too, so nothing depends on hover or colour.

export function StatTile({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  /** Change vs the previous period, as a fraction (0.12 = +12%). null = no earlier data. */
  delta?: { value: number | null; period: string };
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-sm font-semibold text-ink-3">{label}</p>
      <p className="mt-2 text-[28px] font-extrabold leading-none tracking-tight text-ink">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {sub && <span className="text-ink-3">{sub}</span>}
        {delta && delta.value !== null && (
          <span
            className={`rounded-full px-1.5 py-0.5 font-bold ${
              delta.value >= 0 ? "bg-lime/12 text-lime-ink" : "bg-danger/8 text-danger"
            }`}
            title={`Compared with the ${delta.period}`}
          >
            {delta.value >= 0 ? "▲" : "▼"} {Math.abs(Math.round(delta.value * 100))}% vs {delta.period}
          </span>
        )}
      </div>
    </div>
  );
}

/** Daily sales as columns, oldest on the left. */
export function DailyColumns({ days }: { days: { key: string; label: string; total: number; orders: number }[] }) {
  const max = Math.max(...days.map((d) => d.total), 1);
  const peak = days.reduce((best, d) => (d.total > best.total ? d : best), days[0]);
  const PLOT = 140;

  return (
    <figure>
      <div className="relative" style={{ height: PLOT + 28 }}>
        {/* Baseline */}
        <div className="absolute inset-x-0 border-t border-line" style={{ top: PLOT }} aria-hidden />
        <ol className="absolute inset-x-0 top-0 flex items-end justify-between gap-0.5" style={{ height: PLOT }}>
          {days.map((d, i) => {
            const h = d.total === 0 ? 0 : Math.max(3, Math.round((d.total / max) * (PLOT - 22)));
            const showLabel = d === peak && d.total > 0;
            return (
              <li key={d.key} className="group relative flex h-full flex-1 items-end justify-center">
                {/* Hit area is the full column slot, not just the bar. */}
                <span
                  tabIndex={0}
                  aria-label={`${d.label}: ${inr(d.total)}, ${d.orders} order${d.orders === 1 ? "" : "s"}`}
                  className="absolute inset-0 rounded-md outline-none focus-visible:bg-paper-2 group-hover:bg-paper"
                />
                {showLabel && (
                  <span
                    className="pointer-events-none absolute whitespace-nowrap text-[11px] font-bold text-ink-2"
                    style={{ bottom: h + 4 }}
                  >
                    {inrCompact(d.total)}
                  </span>
                )}
                <span
                  className="pointer-events-none relative w-full max-w-6 rounded-t-[4px] bg-[#5F8A0D] transition-opacity group-hover:opacity-80"
                  style={{ height: h }}
                />
                {/* Tooltip */}
                <span
                  role="tooltip"
                  className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs shadow-lg group-focus-within:block group-hover:block ${
                    i < 3 ? "left-0" : i > days.length - 4 ? "right-0" : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  <span className="block font-bold text-ink">{d.label}</span>
                  <span className="block tabular-nums text-ink-2">
                    {inr(d.total)} · {d.orders} order{d.orders === 1 ? "" : "s"}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        {/* X axis: first, middle, last */}
        <div className="absolute inset-x-0 flex justify-between text-[11px] text-ink-3" style={{ top: PLOT + 8 }}>
          <span>{days[0].label}</span>
          <span>{days[Math.floor(days.length / 2)].label}</span>
          <span>{days[days.length - 1].label}</span>
        </div>
      </div>
      <details className="mt-1 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-ink-3 hover:text-ink">Show as table</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-ink-3">
            <tr>
              <th className="py-1 font-semibold">Day</th>
              <th className="py-1 text-right font-semibold">Orders</th>
              <th className="py-1 text-right font-semibold">Sales</th>
            </tr>
          </thead>
          <tbody className="tabular-nums text-ink-2">
            {days.map((d) => (
              <tr key={d.key} className="border-t border-line">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right">{d.orders}</td>
                <td className="py-1 text-right">{inr(d.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Ranked horizontal bars with the value written at the tip. */
export function BarList({
  rows,
  format,
  emptyText,
}: {
  rows: { key: string; label: string; value: number; detail?: string }[];
  format: (n: number) => string;
  emptyText: string;
}) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-ink-3">{emptyText}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key} title={`${r.label}: ${format(r.value)}${r.detail ? ` · ${r.detail}` : ""}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-ink">{r.label}</span>
            <span className="shrink-0 tabular-nums text-ink-2">
              <span className="font-bold text-ink">{format(r.value)}</span>
              {r.detail && <span className="text-ink-3"> · {r.detail}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-paper-2">
            <div
              className="h-2 rounded-r-[4px] rounded-l-full bg-[#5F8A0D]"
              style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
