'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resolveKeyframes } from '@/frontend/lib/experience/interpolate';
import { keyframes, chooserOrbit, actBounds, type ActId } from '@/frontend/lib/experience/keyframes';
import { stageState } from '@/frontend/lib/experience/stageState';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';
import { useExperienceStore } from '@/frontend/lib/experience/store';
import { brands } from '@/shared/brands';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function measureActs() {
  const vh = window.innerHeight;
  const scrollable = document.documentElement.scrollHeight - vh;
  if (scrollable <= 0) return;

  const actElements = [...document.querySelectorAll<HTMLElement>('[data-act]')];
  const actMap = new Map<string, { enter: number; pinStart: number; pinEnd: number; settle: number; mid: number; exit: number }>();

  actElements.forEach((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const enter    = Math.max(0, (top - vh) / scrollable);
    const pinStart = top / scrollable;
    const pinEnd   = (top + el.offsetHeight - vh) / scrollable;
    const exit     = (top + el.offsetHeight) / scrollable;
    const settle   = pinStart + 0.35 * (pinEnd - pinStart);
    const mid      = pinStart + 0.5  * (pinEnd - pinStart);
    actMap.set(el.dataset.act!, { enter, pinStart, pinEnd, settle, mid, exit });
  });

  const requiredActs = ['hero', 'brands', 'why', 'chooser', 'trending', 'stores'];
  const missing = requiredActs.filter(id => !actMap.has(id));
  if (missing.length > 0) {
    console.error(`[ScrollDirector] Missing required data-act elements: ${missing.join(', ')}. Keeping static fallback bands.`);
    return;
  }

  const hero = actMap.get('hero')!;
  const brandsAct = actMap.get('brands')!;
  const why = actMap.get('why')!;
  const chooser = actMap.get('chooser')!;
  const trending = actMap.get('trending')!;
  const stores = actMap.get('stores')!;
  const final = actMap.get('final') || { enter: 0.95, settle: 1 };

  const bands: Record<string, [number, number]> = {
    'hero':        [0,                 hero.mid],
    'hero-out':    [hero.mid,          hero.pinEnd],
    'brands-in':   [brandsAct.enter,   brandsAct.pinStart],
    'brand-cycle': [brandsAct.pinStart, brandsAct.pinEnd],
    'why':         [why.enter,         why.settle],
    'chooser':     [chooser.enter,     chooser.settle],
    'trending':    [trending.enter,    trending.settle],
    'stores':      [stores.enter,      stores.settle],
    'final':       [final.enter,       final.settle],
  };

  keyframes.forEach((beat) => {
    if (bands[beat.id]) {
      beat.at[0] = bands[beat.id][0];
      beat.at[1] = bands[beat.id][1];
    }
  });

  chooserOrbit[0] = chooser.pinStart;
  chooserOrbit[1] = chooser.pinEnd;

  actMap.forEach((bounds, id) => {
    actBounds[id as ActId] = bounds;
  });
}

export function ScrollDirector() {
  const reducedMotion = useReducedMotion();

  const handleProgress = (p: number) => {
    stageState.progress = p;
    resolveKeyframes(p);
    
    // Dynamic Brand Cycle
    const brandBeat = keyframes.find(b => b.id === 'brand-cycle');
    if (brandBeat) {
      const [cycleStart, cycleEnd] = brandBeat.at;
      if (p >= cycleStart && p <= cycleEnd) {
        const localP = (p - cycleStart) / (cycleEnd - cycleStart || 1);
        const index = Math.min(brands.length - 1, Math.floor(localP * brands.length));
        useExperienceStore.getState().setActiveBrandIndex(index);
      } else if (p < cycleStart) {
        useExperienceStore.getState().setActiveBrandIndex(0);
      }
    }
    
    // Canvas opacity logic - single owner
    if (window.innerWidth < 768) {
      const fadeEnd = actBounds.brands?.enter || 0.15;
      const fadeStart = Math.max(0, fadeEnd - 0.05); // fade over last 5% before brands enters

      if (p > fadeStart) {
        stageState.canvasOpacity = Math.max(0, 1 - (p - fadeStart) / (fadeEnd - fadeStart || 0.01));
      } else {
        stageState.canvasOpacity = 1;
      }
    } else {
      // The 3D phone belongs to the text-left / phone-right acts (hero,
      // brands, why, chooser). It bows out while the full-width Trending rail
      // scrolls in, and stays gone for Stores and the finale (which brings its
      // own phone), so it never floats behind cards or copy.
      const trendingBounds = actBounds.trending;
      if (stageState.finale.active) {
        // Act07 brings the phone back and owns its opacity during the finale.
      } else if (trendingBounds && p >= trendingBounds.enter) {
        const fadeStart = trendingBounds.enter;
        const fadeEnd = trendingBounds.enter + (trendingBounds.pinStart - trendingBounds.enter) * 0.6;
        stageState.canvasOpacity = Math.max(0, 1 - (p - fadeStart) / (fadeEnd - fadeStart || 0.01));
      } else {
        stageState.canvasOpacity = 1;
      }
    }
  };

  useEffect(() => {
    measureActs();
    ScrollTrigger.addEventListener('refresh', measureActs);
    
    // Set initial state immediately based on scroll position
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    handleProgress(scrollable > 0 ? window.scrollY / scrollable : 0);

    return () => {
      ScrollTrigger.removeEventListener('refresh', measureActs);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const ctx = gsap.context(() => {
        const actEls = document.querySelectorAll<HTMLElement>('[data-act]');
        actEls.forEach((sec) => {
          const actId = sec.dataset.act;
          const beat = keyframes.find(b => b.id === actId);
          const snapP = beat ? beat.at[0] : 0;
          ScrollTrigger.create({
            trigger: sec,
            start: 'top center',
            onEnter: () => handleProgress(snapP),
            onEnterBack: () => handleProgress(snapP),
          });
        });
      });
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          handleProgress(self.progress);
        },
      });

      // Phase C: Scroll reveals
      gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
        gsap.fromTo(el, 
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.reveal-stagger').forEach((parent) => {
        gsap.fromTo(parent.children, 
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: parent,
              start: 'top 85%',
              once: true,
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      stageState.mouseOffset.set(x * 0.06, y * 0.06, 0);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  return null;
}
