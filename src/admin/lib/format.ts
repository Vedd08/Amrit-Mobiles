// Formatting for the admin panel. The shop runs on Indian time, but the
// server (Vercel) runs on UTC, so every "today" here is computed in IST.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Compact rupees for stat tiles: ₹8,450 · ₹1.6L · ₹2.3Cr. */
export function inrCompact(n: number) {
  if (n >= 1_00_00_000) return `₹${trim(n / 1_00_00_000)}Cr`;
  if (n >= 1_00_000) return `₹${trim(n / 1_00_000)}L`;
  return inr(n);
}

function trim(v: number) {
  return v >= 100 ? Math.round(v).toString() : v.toFixed(1).replace(/\.0$/, "");
}

/** Midnight IST, `daysAgo` days back, as a real Date. */
export function startOfDayIST(daysAgo = 0, now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  ist.setUTCDate(ist.getUTCDate() - daysAgo);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

/** "YYYY-MM-DD" of the IST calendar day a moment falls on. */
export function istDayKey(d: Date) {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function formatDateTime(d: Date) {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDay(d: Date) {
  return d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });
}

/** "just now", "12 min ago", "3 h ago", "2 days ago", then a date. */
export function timeAgo(d: Date, now = new Date()) {
  const mins = Math.round((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDay(d);
}
