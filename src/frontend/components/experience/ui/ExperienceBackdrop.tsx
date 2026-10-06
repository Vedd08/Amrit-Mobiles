'use client';

import { useEffect, useRef } from 'react';
import { brands } from '@/shared/brands';
import { LogoStar } from '@/frontend/components/phones/LogoStar';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

/**
 * Living light backdrop behind the whole homepage: drifting lime/teal/steel
 * aurora, a faint parallax grid, two giant outlined brand tickers that slide
 * with scroll, a slowly turning logo star, twinkling ✦ sparks and a cursor
 * glow. Everything is transform/opacity only and runs on mobile too, where
 * there is no WebGL stage. It builds toward the end of the page so the final
 * "enter the store" dive lands on a brighter, busier ground.
 */

const TICKER = brands.map((b) => b.name.toUpperCase()).join('  ✦  ');

const SPARKS = [
  { x: 8, y: 18, s: 14, d: 0 },
  { x: 22, y: 72, s: 10, d: 1.2 },
  { x: 38, y: 34, s: 8, d: 2.1 },
  { x: 57, y: 82, s: 12, d: 0.6 },
  { x: 68, y: 12, s: 9, d: 1.8 },
  { x: 84, y: 46, s: 14, d: 0.3 },
  { x: 92, y: 78, s: 8, d: 2.6 },
  { x: 48, y: 58, s: 7, d: 3.1 },
  { x: 14, y: 46, s: 9, d: 2.4 },
  { x: 76, y: 64, s: 10, d: 1.5 },
];

export function ExperienceBackdrop() {
  const reducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const blobA = useRef<HTMLDivElement>(null);
  const blobB = useRef<HTMLDivElement>(null);
  const blobC = useRef<HTMLDivElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const mouse = { x: innerWidth / 2, y: innerHeight / 2, gx: innerWidth / 2, gy: innerHeight / 2 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const max = document.documentElement.scrollHeight - innerHeight;
      const y = scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      // 0 → 1 over the last fifth of the page: the build-up into the dive.
      const finale = Math.min(1, Math.max(0, (p - 0.8) / 0.2));
      const vw = innerWidth;
      const vh = innerHeight;

      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(0, ${-((y * 0.25) % 56)}px, 0)`;
      }

      // Aurora blobs wander on slow sine paths, sweep across the screen with
      // scroll, then converge on the centre for the finale.
      const blob = (el: HTMLDivElement | null, bx: number, by: number, phase: number, scale: number) => {
        if (!el) return;
        const wx = bx + Math.sin(t * 0.21 + phase) * 0.12 + Math.sin(p * Math.PI * 2 + phase) * 0.18;
        const wy = by + Math.cos(t * 0.17 + phase) * 0.1 + Math.cos(p * Math.PI * 3 + phase) * 0.12;
        const cx = (wx + (0.5 - wx) * finale * 0.85) * vw;
        const cy = (wy + (0.5 - wy) * finale * 0.85) * vh;
        el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${scale + finale * 0.35})`;
      };
      blob(blobA.current, 0.18, 0.25, 0, 1);
      blob(blobB.current, 0.82, 0.35, 2.1, 0.9);
      blob(blobC.current, 0.5, 0.85, 4.2, 1.1);

      // Brand tickers move in opposite directions, faster as the page nears the end.
      const travel = y * (0.35 + finale * 0.6) + t * 18;
      if (rowA.current) rowA.current.style.transform = `translate3d(${-(travel % (vw * 2))}px, 0, 0)`;
      if (rowB.current) rowB.current.style.transform = `translate3d(${(travel % (vw * 2)) - vw * 2}px, 0, 0)`;

      if (starRef.current) {
        starRef.current.style.transform = `rotate(${t * 6 + p * 540}deg) scale(${1 + finale * 0.25})`;
      }

      if (glowRef.current) {
        mouse.gx += (mouse.x - mouse.gx) * 0.08;
        mouse.gy += (mouse.y - mouse.gy) * 0.08;
        glowRef.current.style.transform = `translate3d(${mouse.gx}px, ${mouse.gy}px, 0) translate(-50%, -50%)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reducedMotion]);

  const blobBase = 'absolute left-0 top-0 rounded-full will-change-transform';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-paper">
      {/* Aurora */}
      <div
        ref={blobA}
        className={blobBase}
        style={{ width: '75vmax', height: '75vmax', transform: 'translate3d(18vw, 25vh, 0) translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(146,195,24,0.30) 0%, rgba(146,195,24,0.12) 35%, rgba(146,195,24,0) 65%)' }}
      />
      <div
        ref={blobB}
        className={blobBase}
        style={{ width: '70vmax', height: '70vmax', transform: 'translate3d(82vw, 35vh, 0) translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(85,194,205,0.26) 0%, rgba(85,194,205,0.10) 35%, rgba(85,194,205,0) 65%)' }}
      />
      <div
        ref={blobC}
        className={blobBase}
        style={{ width: '80vmax', height: '80vmax', transform: 'translate3d(50vw, 85vh, 0) translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(168,184,200,0.38) 0%, rgba(168,184,200,0.14) 35%, rgba(168,184,200,0) 65%)' }}
      />

      {/* Faint parallax grid, faded at the edges */}
      <div
        className="absolute inset-x-0 -top-[56px] h-[calc(100%+112px)]"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 85%)',
        }}
      >
        <div
          ref={gridRef}
          className="h-full w-full will-change-transform"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(168,184,200,0.28) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,184,200,0.28) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      {/* Giant outlined brand tickers */}
      <div className="absolute inset-x-0 top-[16%] -rotate-6 select-none">
        <div ref={rowA} className="flex w-max whitespace-nowrap will-change-transform">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="pr-[4vw] text-[15vw] md:text-[11vw] font-black uppercase leading-none tracking-tighter text-transparent opacity-60"
              style={{ WebkitTextStroke: '1.5px var(--color-steel)' }}
            >
              {TICKER}  ✦
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 top-[62%] -rotate-6 select-none">
        <div ref={rowB} className="flex w-max whitespace-nowrap will-change-transform">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="pr-[4vw] text-[15vw] md:text-[11vw] font-black uppercase leading-none tracking-tighter text-transparent opacity-45"
              style={{ WebkitTextStroke: '1.5px var(--color-lime)' }}
            >
              {TICKER}  ✦
            </span>
          ))}
        </div>
      </div>

      {/* Turning logo star */}
      <div className="absolute -right-[18vmin] -top-[18vmin] h-[62vmin] w-[62vmin] opacity-70">
        <div ref={starRef} className="h-full w-full will-change-transform">
          <LogoStar className="h-full w-full" />
        </div>
      </div>

      {/* Twinkling sparks */}
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="absolute text-lime motion-safe:animate-[backdropTwinkle_3.6s_ease-in-out_infinite]"
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.s, animationDelay: `${s.d}s` }}
        >
          ✦
        </span>
      ))}

      {/* Cursor glow (desktop pointers only) */}
      <div
        ref={glowRef}
        className="absolute left-0 top-0 hidden h-[420px] w-[420px] rounded-full md:block will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(146,195,24,0.22) 0%, rgba(146,195,24,0) 65%)' }}
      />

      <style>{`
        @keyframes backdropTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.6) rotate(0deg); }
          50% { opacity: 0.9; transform: scale(1.15) rotate(45deg); }
        }
      `}</style>
    </div>
  );
}
