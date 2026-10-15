'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { business } from '@/shared/business';
import { BRANCHES } from '@/shared/branches';
import { WhatsAppIcon } from '@/frontend/components/icons';
import { useStoreChatLink } from '@/frontend/store/store-chat-store';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/*
 * The owner as an editorial portrait: a seamless studio sweep with one soft
 * key light and fine grain, the brand name set huge and tone-on-tone behind
 * him, and the photo fading into the studio floor. The photo is a green-screen
 * shot keyed to a transparent cutout (public/images/about/amrit-owner.webp;
 * original in src/frontend/assets).
 *
 * Motion: one reveal when it scrolls into view (the light comes up, the word
 * settles, the portrait rises), then the word drifts slightly with scroll.
 * Transforms and opacity only; halved on phones; off for reduced motion.
 */

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function OwnerStudio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const chat = useStoreChatLink('Hi Amrit Mobiles {store}! ');
  const credit = business.ownerName || 'The owner';

  useGSAP(
    () => {
      if (reducedMotion || !rootRef.current) return;
      const q = gsap.utils.selector(rootRef);
      const k = window.matchMedia('(max-width: 767px)').matches ? 0.5 : 1;

      gsap.set(q('[data-s="portrait"]'), { yPercent: 8, opacity: 0 });
      gsap.set(q('[data-s="light"]'), { opacity: 0 });
      gsap.set(q('[data-s="word"]'), { yPercent: 14, opacity: 0 });
      gsap.set(q('[data-s="credit"]'), { opacity: 0, y: 10 });
      gsap.set(q('[data-s="copy"] > *'), { opacity: 0, y: 16 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      tl.to(q('[data-s="light"]'), { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
        .to(q('[data-s="word"]'), { yPercent: 0, opacity: 1, duration: 1.3 }, 0.05)
        .to(q('[data-s="portrait"]'), { yPercent: 0, opacity: 1, duration: 1.3 }, 0.2)
        .to(q('[data-s="credit"]'), { opacity: 1, y: 0, duration: 0.8 }, 0.9)
        .to(q('[data-s="copy"] > *'), { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.15);

      ScrollTrigger.create({ trigger: rootRef.current, start: 'top 75%', once: true, onEnter: () => tl.play() });

      // The word drifts against the portrait as the page scrolls past.
      gsap.fromTo(
        q('[data-s="word-drift"]'),
        { xPercent: 3 * k },
        {
          xPercent: -3 * k,
          ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col overflow-hidden rounded-[32px] border border-line lg:grid lg:grid-cols-12 lg:items-stretch"
      style={{
        // Seamless paper sweep: wall, the soft curve, then the floor.
        background: 'linear-gradient(180deg, #EEF0EA 0%, #F5F6F2 52%, #ECEEE8 74%, #E2E5DD 100%)',
      }}
    >
      {/* Key light, from up and to the right of the subject */}
      <div
        data-s="light"
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 70% at 70% 34%, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%), radial-gradient(40% 30% at 70% 96%, rgba(146,195,24,0.10), rgba(146,195,24,0) 70%)',
        }}
      />
      {/* Grain, so the backdrop reads as paper rather than a flat fill */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />

      {/* Copy */}
      <div
        data-s="copy"
        className="relative z-10 order-2 px-6 pb-9 pt-2 sm:px-10 sm:pb-12 lg:order-1 lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:py-16 lg:pl-14 lg:pr-0"
      >
        <h2 className="text-4xl font-bold leading-[1.02] tracking-tight text-ink md:text-6xl">
          The face behind Amrit Mobiles.
        </h2>
        <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-ink-2">
          {BRANCHES.length} branches across Surat, one way of doing things. Come and say hello at any counter, or
          message the store nearest you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            {...chat}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-ink-2"
          >
            <WhatsAppIcon className="h-4 w-4 text-lime" /> Say hello on WhatsApp
          </a>
          <a
            href="#stores"
            className="inline-flex items-center rounded-full border border-ink/15 bg-white/60 px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:border-ink/30 hover:bg-white"
          >
            Find a store
          </a>
        </div>
      </div>

      {/* Portrait */}
      <div className="relative order-1 aspect-100/96 w-full [container-type:inline-size] lg:order-2 lg:col-span-7 lg:aspect-auto lg:min-h-[min(80vh,720px)]">
        {/* The brand, huge and tone-on-tone, behind him */}
        <div data-s="word-drift" aria-hidden className="pointer-events-none absolute inset-x-0 top-[9%] flex justify-center">
          <span
            data-s="word"
            className="block select-none text-[34cqw] font-extrabold leading-none tracking-[-0.065em] text-[#DFE3D8]"
            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.9)' }}
          >
            amrit
          </span>
        </div>

        {/* Contact shadow on the floor */}
        <div
          aria-hidden
          className="absolute bottom-[3%] left-1/2 h-[7%] w-[52cqw] -translate-x-1/2 rounded-[50%]"
          style={{ background: 'radial-gradient(closest-side, rgba(26,28,25,0.20), rgba(26,28,25,0))' }}
        />

        <div className="absolute inset-x-0 bottom-0 top-[7%] flex justify-center">
          <div data-s="portrait" className="relative h-full">
            <Image
              src="/images/about/amrit-owner.webp"
              alt="The owner of Amrit Mobiles"
              width={609}
              height={764}
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="h-full w-auto max-w-none object-contain object-bottom"
              style={{
                // Melt the cropped legs into the studio floor.
                maskImage: 'linear-gradient(180deg, #000 80%, transparent 99%)',
                WebkitMaskImage: 'linear-gradient(180deg, #000 80%, transparent 99%)',
              }}
            />
          </div>
        </div>

        {/* Credit line, as in a magazine portrait */}
        <div data-s="credit" className="absolute bottom-[5%] left-[5%] max-w-[44%]">
          <span className="mb-2 block h-0.5 w-8 bg-lime" />
          <p className="text-[max(13px,1.9cqw)] font-bold leading-tight text-ink">{credit}</p>
          <p className="text-[max(11px,1.45cqw)] leading-snug text-ink-3">Amrit Mobiles &amp; Electronics, Surat</p>
        </div>
      </div>
    </div>
  );
}
