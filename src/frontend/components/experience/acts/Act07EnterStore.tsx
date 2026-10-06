'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from '@/frontend/components/motion/SmoothScrollProvider';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';
import { PhoneHeaderContent } from '@/frontend/components/phones/PhoneHeaderContent';
import { LogoStar } from '@/frontend/components/phones/LogoStar';
import { BRANCHES } from '@/shared/branches';
import type { ProductCardData } from '@/frontend/components/shop/ProductCard';
import { brands } from '@/shared/brands';
import { stageState } from '@/frontend/lib/experience/stageState';
import Image from 'next/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type BudgetCounts = { under15: number; under25: number; under40: number; flagships: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => Math.pow(t, 2.2);

/** Phone-screen size at the start of the dive, in px. */
function screenSize(vw: number, vh: number) {
  if (vw < 768) {
    const h = Math.min(vh * 0.56, 500);
    return { w: Math.min(h * 0.4615, vw * 0.62), h };
  }
  const h = Math.min(vh * 0.64, 620);
  return { w: h * 0.4615, h };
}

/**
 * The finale. A real-looking phone rises behind "Ready? Step inside.", turns
 * to face you, then the camera dives into its screen: the screen grows to fill
 * the viewport while lime/teal speed lines and rings burst outward. The
 * screen's final frame is pixel-identical to the top of /phones, and at that
 * moment we navigate there — so scrolling the homepage "enters" the store.
 */
export function Act07EnterStore({
  budgetCounts = { under15: 0, under25: 0, under40: 0, flagships: 0 },
  stats,
  showcase = [],
}: {
  budgetCounts?: BudgetCounts;
  stats?: { phonesInStock: number; brandCount: number; lowestPrice: number };
  showcase?: ProductCardData[];
}) {
  const router = useRouter();
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const bezelRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);

  const armedRef = useRef(false);
  const navigatedRef = useRef(false);
  const jumpedRef = useRef(false);
  const rectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    router.prefetch('/phones');
  }, [router]);

  const handleEnterStore = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    // Keep the homepage nav hidden through the handoff: the /phones header
    // replaces it, and re-showing it here flashed it in for a frame.
    document.body.classList.add('hide-cinematic-nav');
    if (lenis) lenis.stop();
    sessionStorage.setItem('amrit:arrived-from-portal', '1');
    router.push('/phones', { transitionTypes: ['enter-store'] });
  };

  useGSAP(
    () => {
      if (!sectionRef.current || reducedMotion) return;

      const render = (p: number) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Desktop / tablet mount the WebGL stage; there the real 3D phone does
        // the finale. Without it (mobile tier) the CSS phone stands in.
        const has3D = !!document.getElementById('experience-canvas');

        // Shared beats
        const rise = easeOut(seg(p, 0, 0.3));
        const turn = easeInOut(seg(p, 0.04, 0.38));
        const dive = easeIn(seg(p, 0.42, 0.85));

        // Where the dive starts: the 3D display's projected rect, captured
        // just before the dive so the DOM screen opens exactly from it.
        const css = screenSize(vw, vh);
        const live = stageState.screenRect;
        if (has3D && live.valid && p < 0.42) {
          rectRef.current = { x: live.x, y: live.y, w: live.w, h: live.h };
        }
        const r0 =
          has3D && rectRef.current
            ? rectRef.current
            : { x: (vw - css.w) / 2, y: (vh - css.h) / 2, w: css.w, h: css.h };

        const left = lerp(r0.x, 0, dive);
        const top = lerp(r0.y, 0, dive);
        const w = lerp(r0.w, vw, dive);
        const h = lerp(r0.h, vh, dive);
        const radius = lerp(r0.w * 0.13, 0, dive);

        // --- 3D phone (desktop / tablet) --------------------------------
        if (has3D) {
          const f = stageState.finale;
          f.active = p > 0.0005;
          // Rises from below, turning from its back, past its side, to face you.
          f.y = lerp(-1.5, 0, rise);
          f.rotY = lerp(-Math.PI, 0, turn);
          f.rotX = lerp(0.3, 0, turn);
          // Grows with the opening screen so the dive reads as one motion.
          f.scale = 0.78 * (h / r0.h);
          stageState.canvasOpacity = f.active ? seg(p, 0, 0.08) * (1 - seg(p, 0.43, 0.5)) : stageState.canvasOpacity;
        }

        const tf = has3D
          ? 'none'
          : (() => {
              // Rises in turned sideways (edge-on), then swings round to face you.
              const ty = lerp(vh * 0.55, 0, rise);
              const ry = lerp(-78, 0, turn);
              const rx = lerp(12, 0, turn);
              const rz = lerp(-6, 0, turn);
              return `perspective(1100px) translate3d(0, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
            })();

        const portal = portalRef.current;
        if (portal) {
          portal.style.clipPath = `inset(${top}px ${vw - left - w}px ${vh - top - h}px ${left}px round ${radius}px)`;
          portal.style.transform = tf;
          // Over the 3D phone the splash crossfades in on its display first.
          portal.style.opacity = has3D ? String(seg(p, 0.34, 0.42)) : '1';
          const open = p >= 0.85;
          portal.style.pointerEvents = open ? 'auto' : 'none';
          if (open) {
            portal.removeAttribute('inert');
            portal.removeAttribute('aria-hidden');
          } else {
            portal.setAttribute('inert', '');
            portal.setAttribute('aria-hidden', 'true');
          }
        }

        // CSS stand-in phone: only without the 3D stage.
        const bezelW = Math.max(9, r0.w * 0.05);
        const bezel = lerp(bezelW, 0, seg(dive, 0.9, 1));
        if (bezelRef.current) {
          const b = bezelRef.current;
          b.style.display = has3D ? 'none' : 'block';
          b.style.width = `${w + bezel * 2}px`;
          b.style.height = `${h + bezel * 2}px`;
          b.style.borderRadius = `${radius + bezel}px`;
          b.style.transform = `translate(-50%, -50%) ${tf}`;
          b.style.opacity = String(1 - seg(dive, 0.92, 1));
        }
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(-50%, -50%) ${tf} scale(${1 + dive * 2.5})`;
          glowRef.current.style.opacity = String(lerp(0.9, 0, seg(dive, 0.5, 1)) * rise);
        }

        // Splash (the phone's own home screen) sits on the display and grows
        // with it, then gives way to the real /phones header.
        if (splashRef.current) {
          const s = splashRef.current;
          s.style.width = `${r0.w}px`;
          s.style.height = `${r0.h}px`;
          s.style.left = `${left + w / 2}px`;
          s.style.top = `${top + h / 2}px`;
          s.style.opacity = String(1 - seg(p, 0.5, 0.6));
          const cover = Math.max(w / r0.w, h / r0.h);
          s.style.transform = `translate(-50%, -50%) scale(${cover})`;
        }
        if (headerRef.current) {
          headerRef.current.style.opacity = String(seg(p, 0.6, 0.74));
        }

        // Mobile stand-in only: a real lock screen (photo wallpaper, clock,
        // notification) that "unlocks" into the Amrit home screen once the
        // phone has turned to face you; plus the Dynamic Island.
        if (lockRef.current) {
          const l = lockRef.current;
          l.style.display = has3D ? 'none' : 'block';
          l.style.width = `${r0.w}px`;
          l.style.height = `${r0.h}px`;
          l.style.left = `${left + w / 2}px`;
          l.style.top = `${top + h / 2}px`;
          const unlock = easeInOut(seg(p, 0.3, 0.42));
          l.style.opacity = String(1 - unlock);
          l.style.transform = `translate(-50%, -50%) translateY(${-unlock * r0.h * 0.12}px)`;
        }
        // The splash draws its own island for the desktop handoff; on mobile
        // the real island layer replaces it (no double pill).
        const splashIsland = splashRef.current?.querySelector<HTMLElement>('[data-splash-island]');
        if (splashIsland) splashIsland.style.visibility = has3D ? 'visible' : 'hidden';
        if (islandRef.current) {
          const d = islandRef.current;
          d.style.display = has3D ? 'none' : 'block';
          d.style.width = `${r0.w * 0.3}px`;
          d.style.height = `${r0.w * 0.085}px`;
          d.style.left = `${left + w / 2}px`;
          d.style.top = `${top + r0.w * 0.05}px`;
          d.style.opacity = String(1 - seg(dive, 0, 0.25));
        }

        // Copy lifts away as the phone rises.
        if (copyRef.current) {
          const c = seg(p, 0.04, 0.24);
          copyRef.current.style.opacity = String(1 - easeOut(c));
          copyRef.current.style.transform = `translate3d(0, ${-easeOut(c) * vh * 0.18}px, 0) scale(${1 + easeOut(c) * 0.35})`;
          copyRef.current.style.pointerEvents = c < 0.5 ? 'auto' : 'none';
        }

        // Warp: speed lines and rings burst during the dive.
        if (burstRef.current) {
          const b = seg(p, 0.44, 0.9);
          burstRef.current.style.opacity = String(Math.sin(Math.PI * b) * 0.95);
          burstRef.current.style.transform = `scale(${0.55 + dive * 1.9}) rotate(${b * 30}deg)`;
        }
        ringRefs.current.forEach((ring, i) => {
          if (!ring) return;
          const l = seg(p, 0.44 + i * 0.07, 0.8 + i * 0.05);
          ring.style.opacity = String(Math.sin(Math.PI * l) * 0.85);
          ring.style.transform = `translate(-50%, -50%) scale(${0.35 + easeIn(l) * 3.6})`;
        });
      };

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress;
          render(p);

          // Arm only while the user is genuinely inside the opening of the act;
          // a progress of exactly 0 is also reported before scroll restoration.
          if (self.isActive && p > 0.001 && p < 0.3) armedRef.current = true;

          // Arriving deep in the act without having scrolled through its start
          // only happens via Back / refresh / scroll restoration: put the user
          // back at the stores instead of on a lookalike of /phones.
          if (!armedRef.current && p > 0.85 && !jumpedRef.current) {
            jumpedRef.current = true;
            if (lenis) lenis.scrollTo('#stores', { immediate: true, force: true });
            else document.getElementById('stores')?.scrollIntoView({ behavior: 'auto' });
            return;
          }

          if (p > 0.02) document.body.classList.add('hide-cinematic-nav');
          else document.body.classList.remove('hide-cinematic-nav');

          if (armedRef.current && p >= 0.97 && self.direction > 0 && !navigatedRef.current) {
            handleEnterStore();
          }
        },
        onRefresh: (self) => render(self.progress),
        onLeaveBack: () => {
          document.body.classList.remove('hide-cinematic-nav');
          // Hand the 3D phone back to the scroll beats above the finale.
          stageState.finale.active = false;
        },
      });
      render(st.progress);

      return () => {
        document.body.classList.remove('hide-cinematic-nav');
        stageState.finale.active = false;
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion, lenis] }
  );

  if (reducedMotion) {
    return (
      <section
        data-act="final"
        id="enter-store"
        className="py-20 px-6 border-t border-line text-center flex flex-col items-center justify-center z-20 relative"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <p className="text-micro font-bold tracking-widest text-ink-3 uppercase mb-4">
            ✦ {BRANCHES.length} branches · every major brand
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink mb-6">Ready? Step inside.</h2>
          <button
            type="button"
            onClick={handleEnterStore}
            className="bg-lime text-[#2A2A2A] px-10 py-5 rounded-full font-bold text-base shadow-sm hover:bg-lime-ink transition-colors flex items-center gap-3 cursor-pointer"
          >
            <span>Enter the phone store</span>
            <span>→</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      data-act="final"
      id="enter-store"
      className="relative min-h-[260svh] md:min-h-[300vh] w-full z-20"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Warp: speed lines */}
        <div
          ref={burstRef}
          aria-hidden="true"
          className="absolute inset-[-25%] pointer-events-none will-change-transform"
          style={{
            opacity: 0,
            background:
              'repeating-conic-gradient(from 0deg at 50% 50%, rgba(146,195,24,0) 0deg 5deg, rgba(146,195,24,0.55) 5deg 5.7deg, rgba(85,194,205,0) 5.7deg 9deg, rgba(85,194,205,0.45) 9deg 9.4deg, rgba(168,184,200,0) 9.4deg 13deg)',
            maskImage: 'radial-gradient(circle at 50% 50%, transparent 12%, #000 30%, #000 45%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 12%, #000 30%, #000 45%, transparent 70%)',
          }}
        />

        {/* Warp: rings */}
        {['var(--color-lime)', 'var(--color-teal)', 'var(--color-steel)'].map((color, i) => (
          <div
            key={i}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] rounded-full pointer-events-none will-change-transform"
            style={{ opacity: 0, border: `3px solid ${color}`, boxShadow: `0 0 40px -8px ${color}` }}
          />
        ))}

        {/* Lime halo behind the phone */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] rounded-full pointer-events-none will-change-transform"
          style={{
            opacity: 0,
            background: 'radial-gradient(circle, rgba(146,195,24,0.45) 0%, rgba(85,194,205,0.18) 40%, rgba(146,195,24,0) 70%)',
          }}
        />

        {/* Handset body: thin titanium rim, black glass bezel, side buttons */}
        <div
          ref={bezelRef}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 pointer-events-none will-change-transform"
          style={{
            background:
              'linear-gradient(135deg, #E9EDF0 0%, #B9C4CE 18%, #F5F7F8 32%, #9AA9B7 50%, #DCE3E8 68%, #8E9DAB 84%, #CDD6DD 100%)',
            boxShadow:
              '0 50px 90px -30px rgba(26,28,25,0.5), 0 30px 50px -25px rgba(95,138,13,0.45), inset 0 0 0 0.5px rgba(255,255,255,0.8)',
          }}
        >
          <div className="absolute inset-[2.5px] rounded-[inherit] bg-[#0B0C0D]" />
          <span className="absolute -left-[2px] top-[17%] h-[5%] w-[3px] rounded-l-sm bg-[#9AA9B7]" />
          <span className="absolute -left-[2px] top-[25%] h-[9%] w-[3px] rounded-l-sm bg-[#9AA9B7]" />
          <span className="absolute -left-[2px] top-[36%] h-[9%] w-[3px] rounded-l-sm bg-[#9AA9B7]" />
          <span className="absolute -right-[2px] top-[28%] h-[14%] w-[3px] rounded-r-sm bg-[#9AA9B7]" />
        </div>

        {/* The screen: full-viewport layer clipped to the phone, then to the whole viewport */}
        <div
          ref={portalRef}
          data-still=""
          className="absolute inset-0 bg-paper overflow-hidden will-change-transform"
          style={{ pointerEvents: 'none' }}
          aria-hidden="true"
          inert
        >
          <div ref={headerRef} className="absolute inset-0 flex flex-col justify-start pt-[96px]" style={{ opacity: 0 }}>
            <PhoneHeaderContent as="h2" interactiveSearch={false} stats={stats} showcase={showcase}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start pointer-events-none">
                {budgetCounts.under15 > 0 && (
                  <div className="rounded-full border border-line bg-surface px-4 py-2 text-micro font-bold uppercase tracking-wider text-ink">
                    Under ₹15,000 <span className="text-ink-4 ml-1">({budgetCounts.under15})</span>
                  </div>
                )}
                {budgetCounts.under25 > 0 && (
                  <div className="rounded-full border border-line bg-surface px-4 py-2 text-micro font-bold uppercase tracking-wider text-ink">
                    Under ₹25,000 <span className="text-ink-4 ml-1">({budgetCounts.under25})</span>
                  </div>
                )}
                {budgetCounts.under40 > 0 && (
                  <div className="rounded-full border border-line bg-surface px-4 py-2 text-micro font-bold uppercase tracking-wider text-ink">
                    Under ₹40,000 <span className="text-ink-4 ml-1">({budgetCounts.under40})</span>
                  </div>
                )}
                {budgetCounts.flagships > 0 && (
                  <div className="rounded-full border border-line bg-surface px-4 py-2 text-micro font-bold uppercase tracking-wider text-ink">
                    Flagships ₹55k+ <span className="text-ink-4 ml-1">({budgetCounts.flagships})</span>
                  </div>
                )}
              </div>
            </PhoneHeaderContent>
          </div>

          {/* Lock screen (mobile stand-in): real photo wallpaper, unlocks into the home screen */}
          <div
            ref={lockRef}
            className="absolute left-1/2 top-1/2 z-10 overflow-hidden text-white"
            style={{ display: 'none' }}
          >
            <Image src="/images/wallpapers/samsung.webp" alt="" fill sizes="260px" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/0 via-45% to-black/40" />
            <div className="relative flex items-center justify-between px-[9%] pt-[5%] text-[10px] font-semibold">
              <span>Amrit</span>
              <span className="tracking-tight">5G ▮▮▮</span>
            </div>
            <p className="relative mt-[14%] text-center text-[11px] font-semibold opacity-90" suppressHydrationWarning>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="relative text-center text-[64px] font-bold leading-none tracking-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.2)]">9:41</p>
            <div className="absolute inset-x-[6%] bottom-[16%] rounded-[16px] bg-white/30 p-[5%] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.45)]">
              <div className="flex items-start gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-lime">
                  <LogoStar className="h-[70%] w-[70%]" />
                </span>
                <div className="min-w-0 text-left">
                  <p className="text-[9px] font-semibold opacity-85">AMRIT MOBILES · now</p>
                  <p className="text-[11px] font-bold leading-tight">Your new phone is waiting</p>
                  <p className="text-[10px] leading-tight opacity-90">Swipe up to enter the store</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[2.5%] left-1/2 h-[4px] w-[34%] -translate-x-1/2 rounded-full bg-white/90" />
          </div>

          {/* Dynamic Island (mobile stand-in): turns with the screen */}
          <div
            ref={islandRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-full bg-black"
            style={{ display: 'none' }}
          />

          {/* The phone's own home screen */}
          <div
            ref={splashRef}
            className="absolute left-1/2 top-1/2 flex flex-col items-center overflow-hidden px-5 pt-4 text-center"
            style={{
              background:
                'radial-gradient(120% 70% at 50% 0%, rgba(146,195,24,0.35) 0%, rgba(146,195,24,0) 60%), radial-gradient(90% 60% at 100% 100%, rgba(85,194,205,0.28) 0%, rgba(85,194,205,0) 60%), #FBFCF9',
            }}
          >
            <div className="flex w-full items-center justify-between text-[11px] font-bold text-ink-2">
              <span>9:41</span>
              <span data-splash-island className="h-[18px] w-[32%] rounded-full bg-ink-2" />
              <span className="tracking-tight">5G ▮▮▮</span>
            </div>
            <div className="mt-[14%] h-[22%] aspect-square motion-safe:animate-[spin_14s_linear_infinite]">
              <LogoStar className="h-full w-full" />
            </div>
            <p className="mt-[8%] text-[10px] font-bold uppercase tracking-[0.3em] text-lime-ink">Amrit Mobiles</p>
            <p className="mt-2 text-[clamp(20px,2.6vh,30px)] font-extrabold leading-[1.05] tracking-tight text-ink">
              Find your
              <br />
              perfect phone
            </p>
            <div className="mt-[9%] flex w-full items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-[11px] text-ink-4 shadow-sm">
              <span>⌕</span> Search phones…
            </div>
            <div className="mt-[7%] flex flex-wrap justify-center gap-1.5">
              {brands.slice(0, 4).map((b) => (
                <span key={b.slug} className="rounded-full border border-line bg-white/80 px-2.5 py-1 text-[10px] font-bold text-ink-2">
                  {b.name}
                </span>
              ))}
            </div>
            <div className="mt-auto mb-[9%] rounded-full bg-lime px-5 py-2.5 text-[12px] font-extrabold text-[#2A2A2A] shadow-[0_8px_24px_-8px_rgba(95,138,13,0.8)]">
              Enter store →
            </div>
          </div>
        </div>

        {/* Opening copy: zooms past the camera as the phone rises */}
        <div
          ref={copyRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-[16vh] text-center px-6 will-change-transform"
        >
          <p className="text-micro font-bold tracking-widest text-lime-ink uppercase mb-4">
            ✦ {BRANCHES.length} branches · every major brand
          </p>
          <h2 className="text-5xl md:text-8xl font-extrabold tracking-tighter text-ink mb-8 leading-[0.95]">
            Ready?
            <br />
            <span className="bg-linear-to-r from-lime-ink via-lime to-teal bg-clip-text text-transparent">
              Step inside.
            </span>
          </h2>
          <button
            type="button"
            onClick={handleEnterStore}
            className="group relative overflow-hidden bg-lime text-[#2A2A2A] px-10 py-5 rounded-full font-bold text-base shadow-[0_14px_40px_-12px_rgba(95,138,13,0.7)] hover:scale-105 transition-transform cursor-pointer flex items-center gap-3"
          >
            <span>Enter the phone store</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
          <p className="mt-6 text-small font-semibold text-ink-3 motion-safe:animate-bounce">Keep scrolling ↓</p>
        </div>
      </div>
    </section>
  );
}
