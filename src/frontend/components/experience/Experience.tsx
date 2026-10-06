'use client';

import { useStageTier } from '@/frontend/lib/experience/useStageTier';
import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { CinematicNav } from './ui/CinematicNav';
import { ExperienceBackdrop } from './ui/ExperienceBackdrop';
import { Act01Hero } from './acts/Act01Hero';
import { Act02Brands } from './acts/Act02Brands';
import { Act03Why } from './acts/Act03Why';
import { Act04Chooser } from './acts/Act04Chooser';
import { Act05Trending } from './acts/Act05Trending';
import { Act06Stores } from './acts/Act06Stores';
import { Act07EnterStore } from './acts/Act07EnterStore';
import { stageState } from '@/frontend/lib/experience/stageState';
import { brandsWithCounts } from '@/shared/phone-catalog';
import { SHOP_WHATSAPP_LINK } from '@/shared/whatsapp';
import type { ProductCardData } from '@/frontend/components/shop/ProductCard';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Stage = dynamic(() => import('./Stage').then((mod) => mod.Stage), { ssr: false });
const ScrollDirector = dynamic(() => import('./ScrollDirector').then((mod) => mod.ScrollDirector), { ssr: false });

export function Experience({
  allPhones = [],
  trendingPhones = [],
  budgetCounts = { under15: 0, under25: 0, under40: 0, flagships: 0 },
  stats,
  showcase = [],
}: {
  allPhones?: ProductCardData[];
  trendingPhones?: ProductCardData[];
  budgetCounts?: { under15: number; under25: number; under40: number; flagships: number };
  stats?: { phonesInStock: number; brandCount: number; lowestPrice: number };
  showcase?: ProductCardData[];
}) {
  const [finalActEntered, setFinalActEntered] = useState(false);
  const finalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!finalRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFinalActEntered(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(finalRef.current);
    return () => observer.disconnect();
  }, []);

  const tier = useStageTier();
  const [load3D, setLoad3D] = useState(false);
  const [stageReady, setStageReady] = useState(false);

  useEffect(() => {
    const mountStage = () => {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback!(() => setLoad3D(true));
      } else {
        setTimeout(() => setLoad3D(true), 1500);
      }
    };
    
    if (document.readyState === 'complete') {
      mountStage();
    } else {
      window.addEventListener('load', mountStage);
      return () => window.removeEventListener('load', mountStage);
    }
  }, [tier]);

  useEffect(() => {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }, []);

  const brandData = useMemo(() => brandsWithCounts(allPhones), [allPhones]);

  return (
    <>
      <ExperienceBackdrop />
      <ScrollProgressHairline />
      <CinematicNav />
      {tier !== 'mobile' && load3D && <Stage onReady={() => { setStageReady(true); ScrollTrigger.refresh(); }} />}
      <StaticHeroPoster stageReady={stageReady} />
      {load3D && <ScrollDirector />}
      <div className="relative z-10 w-full overflow-x-clip pb-24 md:pb-0">
        <Act01Hero />
        <Act02Brands brandData={brandData} />
        <Act03Why />
        <Act04Chooser allPhones={allPhones} />
        <Act05Trending phones={trendingPhones} />
        <Act06Stores />
        <div ref={finalRef}>
          <Act07EnterStore budgetCounts={budgetCounts} stats={stats} showcase={showcase} />
        </div>
      </div>

      {/* Sticky Mobile Bar - hides when final act enters */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/90 backdrop-blur-md border-t border-line px-4 py-3 pb-[env(safe-area-inset-bottom)] flex gap-4 transition-transform duration-300 ${finalActEntered ? 'translate-y-[150%]' : 'translate-y-0'}`}>
        <a href={SHOP_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border border-line text-ink text-center py-3 rounded-full font-bold text-sm">
          WhatsApp
        </a>
        <a href="#stores" className="flex-1 bg-lime text-[#2A2A2A] text-center py-3 rounded-full font-bold text-sm">
          Directions
        </a>
      </div>
    </>
  );
}

function ScrollProgressHairline() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const updateProgress = () => {
      if (lineRef.current) {
        const p = stageState.progress;
        // Fade out hairline in the final act
        const opacity = p >= 0.92 ? Math.max(0, 1 - (p - 0.92) / 0.08) : 1;
        lineRef.current.style.transform = `scaleX(${p})`;
        lineRef.current.style.opacity = opacity.toString();
      }
      rafId = requestAnimationFrame(updateProgress);
    };
    rafId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={lineRef}
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-lime z-50 origin-left pointer-events-none transition-opacity duration-200"
    />
  );
}

function StaticHeroPoster({ stageReady }: { stageReady: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let rafId: number;
    let lastOpacity = -1;
    const updateOpacity = () => {
      if (window.innerWidth < 768) {
        rafId = requestAnimationFrame(updateOpacity);
        return;
      }
      if (wrapperRef.current) {
        const opacity = stageReady && stageState.screenReady ? 0 : 1;
        if (opacity !== lastOpacity) {
          wrapperRef.current.style.opacity = opacity.toString();
          lastOpacity = opacity;
        }
      }
      rafId = requestAnimationFrame(updateOpacity);
    };
    rafId = requestAnimationFrame(updateOpacity);
    return () => cancelAnimationFrame(rafId);
  }, [stageReady]);

  return (
    <div 
      ref={wrapperRef}
      className="hidden md:flex fixed inset-0 z-0 pointer-events-none items-start justify-center transition-opacity duration-500 pt-[25vh] pr-[12vw] justify-end"
      aria-hidden="true"
    >
      <img 
        src="/images/phone-hero-poster.webp" 
        alt="" 
        width={600} 
        height={1200}
        className="h-[65vh] w-auto object-contain object-top"
        fetchPriority="high"
      />
    </div>
  );
}
