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

/** Height / width of the foldable's open inner screen (7.6", 2670 x 1878). */
const INNER_ASPECT = 0.702;

/** The CSS stand-in's open inner screen at the start of the dive, in px. */
function openScreenSize(vw: number, vh: number) {
  const w = Math.min(vw * 0.88, vh * 0.8, 560);
  return { w, h: w * INNER_ASPECT };
}

const TITANIUM =
  'linear-gradient(135deg, #E9EDF0 0%, #B9C4CE 18%, #F5F7F8 32%, #9AA9B7 50%, #DCE3E8 68%, #8E9DAB 84%, #CDD6DD 100%)';
const SPLASH_BG =
  'radial-gradient(120% 70% at 50% 0%, rgba(146,195,24,0.35) 0%, rgba(146,195,24,0) 60%), radial-gradient(90% 60% at 100% 100%, rgba(85,194,205,0.28) 0%, rgba(85,194,205,0) 60%), #FBFCF9';

/**
 * The finale. The foldable rises shut behind "Ready? Step inside.", turns
 * from its cameras to its cover screen, opens, then the camera dives into its
 * inner screen (mobile: a CSS phone stands in): the screen grows to fill
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const flapLayerRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
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
        const turn = easeInOut(seg(p, 0.04, 0.28));
        const unfold = easeInOut(seg(p, 0.26, 0.38));
        const dive = easeIn(seg(p, 0.42, 0.85));

        // Where the dive starts: the 3D display's projected rect, captured
        // just before the dive so the DOM screen opens exactly from it.
        const css = openScreenSize(vw, vh);
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
        // The foldable's wide inner screen has tight corners.
        const radius = lerp(r0.h * 0.045, 0, dive);

        // --- 3D phone (desktop / tablet) --------------------------------
        if (has3D) {
          const f = stageState.finale;
          f.active = p > 0.0005;
          // Rises from below, turning from its back, past its side, to face you.
          f.y = lerp(-1.5, 0, rise);
          f.rotY = lerp(-Math.PI, 0, turn);
          f.rotX = lerp(0.3, 0, turn);
          f.fold = unfold;
          // Grows with the opening screen so the dive reads as one motion.
          f.scale = 0.78 * (h / r0.h);
          stageState.canvasOpacity = f.active ? seg(p, 0, 0.08) * (1 - seg(p, 0.43, 0.5)) : stageState.canvasOpacity;
        }

        // --- CSS stand-in (mobile): the same foldable, built from layers that
        // all share one transform about the viewport centre. Shut, only the
        // cover half shows (centred, a little larger); its cover swings open
        // on the hinge to reveal the inner screen.
        const grow = lerp(1.3, 1, unfold);
        const shift = -grow * (r0.w / 4) * (1 - unfold);
        const tf = has3D
          ? 'none'
          : (() => {
              // Rises in turned sideways (edge-on), then swings round to face you.
              const ty = lerp(vh * 0.55, 0, rise);
              const ry = lerp(-78, 0, turn);
              const rx = lerp(12, 0, turn);
              const rz = lerp(-6, 0, turn);
              return `perspective(1100px) translate3d(${shift}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${grow})`;
            })();
        // Until the cover has landed flat, only the right half of the inner
        // screen is uncovered.
        const opened = has3D || unfold >= 0.999;
        const clipLeft = opened ? left : left + w / 2;

        const portal = portalRef.current;
        if (portal) {
          portal.style.clipPath = `inset(${top}px ${vw - left - w}px ${vh - top - h}px ${clipLeft}px round ${radius}px)`;
          portal.style.transform = tf;
          // Over the 3D phone the splash crossfades in on its display first.
          portal.style.opacity = has3D ? String(seg(p, 0.38, 0.42)) : '1';
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

        const bezelW = Math.max(7, r0.h * 0.035);
        const bezel = lerp(bezelW, 0, seg(dive, 0.9, 1));
        if (bodyRef.current) {
          const b = bodyRef.current;
          const x = clipLeft - bezel;
          const y = top - bezel;
          b.style.display = has3D ? 'none' : 'block';
          b.style.left = `${x}px`;
          b.style.top = `${y}px`;
          b.style.width = `${left + w - clipLeft + bezel * 2}px`;
          b.style.height = `${h + bezel * 2}px`;
          b.style.borderRadius = `${radius + bezel}px`;
          b.style.transformOrigin = `${vw / 2 - x}px ${vh / 2 - y}px`;
          b.style.transform = tf;
          b.style.opacity = String(1 - seg(dive, 0.92, 1));
        }

        // The cover half: hinged on the screen's centre line, it lies over the
        // right half (cover screen up), then swings over to lie on the left
        // (inner screen up) and fades once the full inner screen is showing.
        if (flapLayerRef.current && flapRef.current) {
          const l = flapLayerRef.current;
          const hingeX = left + w / 2;
          const y = top - bezel;
          l.style.display = has3D ? 'none' : 'block';
          l.style.left = `${hingeX}px`;
          l.style.top = `${y}px`;
          l.style.width = `${w / 2 + bezel}px`;
          l.style.height = `${h + bezel * 2}px`;
          l.style.transformOrigin = `${vw / 2 - hingeX}px ${vh / 2 - y}px`;
          l.style.transform = tf;
          const gone = seg(p, 0.38, 0.41);
          l.style.opacity = String(1 - gone);
          l.style.visibility = gone >= 1 ? 'hidden' : 'visible';
          flapRef.current.style.transform = `rotateY(${-180 * unfold}deg)`;
          flapRef.current.querySelectorAll<HTMLElement>('[data-flap-face]').forEach((face) => {
            face.style.borderRadius = `${radius + bezel}px`;
          });
          flapRef.current.querySelectorAll<HTMLElement>('[data-flap-screen]').forEach((screen) => {
            // The inner pane meets the hinge (on its right once flipped); the
            // cover screen has a border all round.
            const inner = screen.dataset.flapScreen === 'inner';
            screen.style.inset = inner ? `${bezel}px 0 ${bezel}px ${bezel}px` : `${bezel}px`;
            screen.style.borderRadius = `${radius}px`;
          });
        }
        if (spineRef.current) {
          const sp = spineRef.current;
          sp.style.width = `${bezel * 1.4}px`;
          sp.style.opacity = String(1 - seg(unfold, 0, 0.35));
        }
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(-50%, -50%) ${tf} scale(${1 + dive * 2.5})`;
          glowRef.current.style.opacity = String(lerp(0.9, 0, seg(dive, 0.5, 1)) * rise);
        }

        // Splash (the inner screen's home screen) sits on the display and
        // grows with it, then gives way to the real /phones header.
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

      // The 3D display's on-screen rect is written by the WebGL frame after the
      // pose changes. Until the dive starts, keep re-rendering for a few frames
      // after each scroll update so the DOM screen locks onto the settled rect
      // (it moves a lot while the phone unfolds).
      let settleRaf = 0;
      let settleFrames = 0;
      let lastP = 0;
      const settle = () => {
        settleRaf = 0;
        render(lastP);
        if (--settleFrames > 0) settleRaf = requestAnimationFrame(settle);
      };
      const renderSettled = (p: number) => {
        lastP = p;
        render(p);
        if (p >= 0.42) return;
        settleFrames = 4;
        if (!settleRaf) settleRaf = requestAnimationFrame(settle);
      };

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress;
          renderSettled(p);

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
        onRefresh: (self) => renderSettled(self.progress),
        onLeaveBack: () => {
          document.body.classList.remove('hide-cinematic-nav');
          // Hand the 3D phone back to the scroll beats above the finale.
          stageState.finale.active = false;
        },
      });
      renderSettled(st.progress);

      return () => {
        cancelAnimationFrame(settleRaf);
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

        {/* Stand-in handset body (mobile): titanium rim, black glass bezel */}
        <div
          ref={bodyRef}
          aria-hidden="true"
          className="absolute pointer-events-none will-change-transform"
          style={{
            display: 'none',
            background: TITANIUM,
            boxShadow:
              '0 50px 90px -30px rgba(26,28,25,0.5), 0 30px 50px -25px rgba(95,138,13,0.45), inset 0 0 0 0.5px rgba(255,255,255,0.8)',
          }}
        >
          <div className="absolute inset-[2.5px] rounded-[inherit] bg-[#0B0C0D]" />
          <span className="absolute -right-[2px] top-[22%] h-[16%] w-[3px] rounded-r-sm bg-[#9AA9B7]" />
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

          {/* The phone's own home screen */}
          <div
            ref={splashRef}
            className="absolute left-1/2 top-1/2 overflow-hidden"
            style={{ containerType: 'size', background: SPLASH_BG }}
          >
            {/* The foldable's inner screen: a preview of the /phones header, sized
                in container units so it matches the 3D screen's drawing. */}
            <div className="absolute inset-0">
              <div className="absolute flex items-center justify-between font-bold text-ink-2" style={{ left: '8%', right: '7%', top: '7.6%', fontSize: '4.2cqh' }}>
                <span>9:41</span>
                <span className="tracking-tight">5G ▮▮▮</span>
              </div>
              <div className="absolute text-left" style={{ left: '8%', top: '27%' }}>
                <p className="font-extrabold uppercase text-lime-ink" style={{ fontSize: '2.9cqh', letterSpacing: '0.3em' }}>
                  Amrit Mobiles
                </p>
                <p className="font-extrabold leading-[1.05] tracking-tight text-ink" style={{ fontSize: '9.3cqh', marginTop: '3cqh' }}>
                  Find your
                  <br />
                  perfect phone
                </p>
                <div
                  className="flex items-center rounded-full border border-line bg-white text-ink-4 shadow-sm"
                  style={{ width: '42cqw', height: '7.7cqh', marginTop: '6cqh', paddingInline: '4cqh', gap: '1.5cqh', fontSize: '3.1cqh' }}
                >
                  <span>⌕</span> Search phones…
                </div>
                <div
                  className="inline-flex items-center rounded-full bg-lime font-extrabold text-[#2A2A2A] shadow-[0_8px_24px_-8px_rgba(95,138,13,0.8)]"
                  style={{ height: '8.1cqh', marginTop: '7.3cqh', paddingInline: '5cqh', fontSize: '3.3cqh' }}
                >
                  Enter store →
                </div>
              </div>
              <div className="absolute motion-safe:animate-[spin_14s_linear_infinite]" style={{ left: '61%', top: '50%', width: '26cqw', height: '26cqw', marginTop: '-13cqw' }}>
                <LogoStar className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Stand-in cover half (mobile): the cover screen on its front, the
            inner screen's left pane on its back. Swings open on the hinge. */}
        <div
          ref={flapLayerRef}
          aria-hidden="true"
          className="absolute pointer-events-none will-change-transform"
          style={{ display: 'none', transformStyle: 'preserve-3d' }}
        >
          <div
            ref={spineRef}
            className="absolute bottom-[1.5%] top-[1.5%] right-full rounded-l-full"
            style={{ background: 'linear-gradient(90deg, #8E9DAB 0%, #E9EDF0 45%, #B9C4CE 100%)' }}
          />
          <div ref={flapRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transformOrigin: '0 50%' }}>
            <div data-flap-face="" className="absolute inset-0 overflow-hidden backface-hidden" style={{ background: TITANIUM }}>
              <div className="absolute inset-[2.5px] rounded-[inherit] bg-[#0B0C0D]" />
              {/* Cover screen: a real lock screen (photo wallpaper, clock, notification) */}
              <div ref={lockRef} data-flap-screen="cover" className="absolute overflow-hidden text-white">
                <Image src="/images/wallpapers/samsung.webp" alt="" fill sizes="200px" className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/0 via-45% to-black/40" />
                <span className="absolute left-1/2 top-[3.5%] h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-black" />
                <div className="relative flex items-center justify-between px-[9%] pt-[5%] text-[9px] font-semibold">
                  <span>Amrit</span>
                  <span className="tracking-tight">5G ▮▮▮</span>
                </div>
                <p className="relative mt-[9%] text-center text-[10px] font-semibold opacity-90" suppressHydrationWarning>
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="relative text-center text-[48px] font-bold leading-none tracking-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.2)]">9:41</p>
                <div className="absolute inset-x-[6%] bottom-[11%] rounded-[14px] bg-white/30 p-[5%] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.45)]">
                  <div className="flex items-start gap-1.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[6px] bg-lime">
                      <LogoStar className="h-[70%] w-[70%]" />
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="text-[8px] font-semibold opacity-85">AMRIT MOBILES · now</p>
                      <p className="text-[10px] font-bold leading-tight">Your new phone is waiting</p>
                      <p className="text-[9px] leading-tight opacity-90">Open it to step inside</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[2.5%] left-1/2 h-[3px] w-[34%] -translate-x-1/2 rounded-full bg-white/90" />
              </div>
            </div>
            <div
              data-flap-face=""
              className="absolute inset-0 overflow-hidden backface-hidden"
              style={{ background: TITANIUM, transform: 'rotateY(180deg)' }}
            >
              <div className="absolute inset-[2.5px] rounded-[inherit] bg-[#0B0C0D]" />
              <div data-flap-screen="inner" className="absolute" style={{ background: SPLASH_BG, backgroundSize: '200% 100%' }} />
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
