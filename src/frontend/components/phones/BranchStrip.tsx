import { SectionHeader } from "./SectionHeader";
import { BRANCHES } from "@/shared/branches";

export function BranchStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 border-t border-line">
      <SectionHeader title="Six branches across Surat" sub="Always a short drive away. Always genuine stock." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BRANCHES.map((b) => (
          <div key={b.name} className="flex flex-col rounded-lg border border-line bg-surface p-6 shadow-sh-1 transition-shadow hover:shadow-sh-2">
            <span className="text-body font-bold text-ink mb-1">{b.name}</span>
            <span className="text-small text-ink-3">{b.area}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
