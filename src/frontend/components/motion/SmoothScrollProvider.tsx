"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion } from "@/frontend/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = React.createContext<Lenis | null>(null);

export function useLenis() {
  return React.useContext(LenisContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const storeRef = React.useRef<{ lenis: Lenis | null, listeners: Set<() => void> } | null>(null);
  if (storeRef.current === null) {
    storeRef.current = { lenis: null, listeners: new Set() };
  }

  const lenisInst = React.useSyncExternalStore(
    React.useCallback((onStoreChange) => {
      storeRef.current!.listeners.add(onStoreChange);
      return () => storeRef.current!.listeners.delete(onStoreChange);
    }, []),
    () => storeRef.current!.lenis,
    () => null
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;

    // syncTouch defaults to false, so touch scrolling stays native — only
    // wheel/programmatic scroll gets the eased smoothing.
    const lenis = new Lenis();
    storeRef.current!.lenis = lenis;
    storeRef.current!.listeners.forEach(l => l());

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      storeRef.current!.lenis = null;
      storeRef.current!.listeners.forEach(l => l());
    };
  }, []);

  useEffect(() => {
    // App Router client-side navigations swap page content without a full
    // reload, so previously-computed trigger positions can go stale.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <LenisContext.Provider value={lenisInst}>{children}</LenisContext.Provider>;
}
