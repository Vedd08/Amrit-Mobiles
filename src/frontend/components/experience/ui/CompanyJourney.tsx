'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { BRANCHES } from '@/shared/branches';
import { JOURNEY_PEOPLE, MILESTONES } from '@/shared/journey';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

/*
 * About › Our journey: the two generations behind Amrit Mobiles (founder and
 * son, side by side) and the milestones from the first counter to today.
 * Content lives in src/shared/journey.ts (years and names are filled in there).
 *
 * Motion: one reveal the first time it scrolls into view: portraits rise, the
 * timeline rail draws down, milestones follow it. Opacity/transform only;
 * nothing runs on scroll after that, and it's all off for reduced motion.
 */

export function CompanyJourney() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shown = seen || reducedMotion;
  const rise = (delayMs: number): React.CSSProperties =>
    reducedMotion
      ? {}
      : {
          opacity: shown ? 1 : 0,
          transform: shown ? 'none' : 'translateY(28px)',
          transition: `opacity 700ms ease ${delayMs}ms, transform 900ms cubic-bezier(0.22,1,0.36,1) ${delayMs}ms`,
        };

  const stats = [
    { value: '2', label: 'generations' },
    { value: String(BRANCHES.length), label: 'branches in Surat' },
    { value: '1', label: 'Samsung Café' },
  ];

  return (
    <div ref={ref} id="journey" className="scroll-mt-24">
      {/* Heading */}
      <div className="max-w-3xl" style={rise(0)}>
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-lime-ink">
          <span className="h-0.5 w-8 bg-lime" aria-hidden />
          Our journey
        </p>
        <h2 className="mt-4 text-4xl font-bold leading-[1.02] tracking-tight text-ink md:text-6xl">
          Two generations, one family business.
        </h2>
        <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-2">
          {`Amrit Mobiles began as a father's phone shop in Surat. Today his son runs it across ${BRANCHES.length} branches, and the idea hasn't changed: treat every customer like they'll be back.`}
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-16 *:min-w-0">
        {/* The two generations */}
        <div className="lg:col-span-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {JOURNEY_PEOPLE.map((p, i) => (
              <figure key={p.photo.src} className={i === 1 ? 'mt-10 sm:mt-16' : ''} style={rise(150 + i * 180)}>
                <div className="relative overflow-hidden rounded-[22px] border border-line bg-paper-2 shadow-[0_30px_50px_-34px_rgba(26,28,25,0.55)] sm:rounded-lg">
                  <Image
                    src={p.photo.src}
                    alt={p.photo.alt}
                    width={p.photo.width}
                    height={p.photo.height}
                    sizes="(min-width: 1024px) 22vw, 46vw"
                    className="aspect-3/4 h-auto w-full object-cover object-top"
                  />
                  {/* Generation tag */}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:text-xs">
                    {i === 0 ? '1st generation' : '2nd generation'}
                  </span>
                </div>
                <figcaption className="mt-4 px-1">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-lime-ink sm:text-xs">{p.role}</span>
                  {p.name && <span className="mt-1 block text-lg font-extrabold leading-tight text-ink sm:text-xl">{p.name}</span>}
                  <span className="mt-1.5 block text-sm leading-snug text-ink-3 sm:text-[15px]">{p.line}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white/70" style={rise(500)}>
            {stats.map((s) => (
              <div key={s.label} className="px-3 py-4 text-center sm:px-5">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-3xl font-extrabold leading-none tracking-tight text-ink sm:text-4xl">{s.value}</span>
                  <span className="mt-1.5 block text-xs font-semibold text-ink-3 sm:text-sm">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Milestones */}
        <ol className="relative lg:col-span-6 lg:pt-4">
          {/* Rail: a faint track, and a lime line that draws down on reveal */}
          <span aria-hidden className="absolute bottom-4 left-3.75 top-2 w-0.5 rounded-full bg-line" />
          <span
            aria-hidden
            className="absolute bottom-4 left-3.75 top-2 w-0.5 origin-top rounded-full bg-lime"
            style={
              reducedMotion
                ? {}
                : { transform: `scaleY(${shown ? 1 : 0})`, transition: 'transform 1600ms cubic-bezier(0.65,0,0.35,1) 300ms' }
            }
          />
          {MILESTONES.map((m, i) => {
            const last = i === MILESTONES.length - 1;
            return (
              <li key={m.title} className="relative pb-9 pl-14 last:pb-0" style={rise(450 + i * 160)}>
                <span
                  aria-hidden
                  className={`absolute left-0 top-0.5 grid h-8 w-8 place-items-center rounded-full border-[3px] border-paper text-[13px] font-extrabold ${
                    last ? 'bg-lime text-[#2A2A2A]' : 'bg-white text-lime-ink ring-1 ring-line'
                  }`}
                >
                  {last ? '✦' : i + 1}
                </span>
                {m.year && (
                  <span className="mb-1 inline-block rounded-full bg-lime/15 px-2.5 py-0.5 text-xs font-bold tabular-nums text-lime-ink">
                    {m.year}
                  </span>
                )}
                <h3 className="text-xl font-extrabold leading-snug tracking-tight text-ink md:text-2xl">{m.title}</h3>
                <p className="mt-1.5 max-w-[52ch] leading-relaxed text-ink-2">{m.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
