import { Reveal } from "@/frontend/components/motion/Reveal";
import { SHOP_TEL_LINK } from "@/frontend/lib/phone-experience-data";
import { BRANCHES, BRANCH_HOURS } from "@/shared/branches";

// Branch data moved to @/shared/branches — the homepage emits LocalBusiness
// JSON-LD from the same list, and a store list that disagrees with its own
// structured data is worse than none. The call button is still a shared
// placeholder counter line until per-branch numbers are wired in.

function PinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5c0 9.4 6.6 16 16 16l0-3.5-4-1.5-2 2a12 12 0 0 1-5.5-5.5l2-2L6.5 5 3 5Z"
      />
    </svg>
  );
}

export function StoreLocator() {
  return (
    <section id="stores" className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Reveal>
        <div className="mb-8 max-w-2xl">
          <span className="mb-1.5 block text-xs font-extrabold uppercase text-lime-ink">
            Walk in today
          </span>
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">Find us across Surat</h2>
          <p className="mt-3 text-xs font-semibold leading-relaxed text-ink-3 sm:text-sm">
            Six counters across the city — same sealed stock, same printed GST bill, same 10-minute EMI
            desk at every one.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BRANCHES.map((b, i) => (
          <Reveal key={b.name} delay={i * 0.05}>
            <div className="group flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-lime hover:shadow-sh-1 ">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-lime-ink transition-transform duration-200 group-hover:scale-110">
                  <PinIcon />
                </span>
                <div>
                  <h3 className="text-lg font-bold leading-tight text-ink">{b.name}</h3>
                  <p className="mt-0.5 text-micro font-bold uppercase tracking-wider text-ink-3">
                    {b.area} · Surat
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs font-semibold leading-relaxed text-ink-3">
                Open {BRANCH_HOURS.days} {BRANCH_HOURS.opens}–{BRANCH_HOURS.closes} · sealed stock,
                GST billing and the 10-minute EMI desk.
              </p>

              <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-4">
                <a
                  href={b.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full -ink px-4 py-2.5 text-micro font-bold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-lime-ink"
                >
                  Open in Maps
                  <span aria-hidden>→</span>
                </a>
                <a
                  href={SHOP_TEL_LINK}
                  aria-label={`Call the ${b.name} branch`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-line px-4 py-2 text-micro font-bold uppercase tracking-wider -ink transition-colors duration-200 hover:border-teal hover:bg-paper"
                >
                  <PhoneIcon />
                  Call
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
