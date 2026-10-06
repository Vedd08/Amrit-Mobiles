import { SectionHeader } from "./SectionHeader";

/**
 * The counter journey as numbered steps.
 *
 * Borrowed from the studio-site pattern of numbered service blocks (01–04).
 * Numbering is earned here because this genuinely is a sequence — you pick,
 * then you watch it opened, then it is billed, then it is set up — which is
 * the one thing that makes the shop different from ordering online.
 */
const STEPS: Array<{ title: string; body: string }> = [
  {
    title: "Pick it up and try it",
    body: "Every model on the shelf is a live unit. Hold it, run the camera, check the weight before you decide anything.",
  },
  {
    title: "We open the box in front of you",
    body: "The seal is broken at the counter while you watch, never in the back. Sealed Indian retail stock, every time.",
  },
  {
    title: "IMEI matched, GST bill printed",
    body: "The number on the box is checked against the handset and printed on your bill, so the warranty is yours to claim.",
  },
  {
    title: "Guard fitted, data moved, you leave",
    body: "Sapphire screen guard applied while you wait, your old phone's data transferred, and EMI closed in about ten minutes.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 border-t border-line">
      <SectionHeader
        kicker="At the counter"
        title="How buying works here"
        sub="Four steps, all of them in front of you."
      />
      <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="group flex flex-col bg-surface p-6 sm:p-8">
            <span className="outline-type text-5xl font-extrabold text-ink transition-opacity opacity-20 group-hover:opacity-40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="mt-6 text-body font-bold leading-snug text-ink sm:text-body-lg">
              {s.title}
            </span>
            <span className="mt-3 text-small leading-relaxed text-ink-3">{s.body}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
