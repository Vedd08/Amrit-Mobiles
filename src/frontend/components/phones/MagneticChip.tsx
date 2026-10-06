"use client";

import { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useReducedMotion } from "@/frontend/lib/use-reduced-motion";

export function MagneticChip({ href, children }: { href: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (reducedMotion) return;
    
    const el = ref.current;
    if (!el) return;
    
    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = e.clientX - (left + width / 2);
      const y = e.clientY - (top + height / 2);
      
      // Magnetic pull up to 6px
      const distanceX = Math.min(Math.max(x * 0.15, -6), 6);
      const distanceY = Math.min(Math.max(y * 0.15, -6), 6);
      
      gsap.to(el, { x: distanceX, y: distanceY, duration: 0.3, ease: 'power2.out' });
      
      // Text moves slightly more for parallax
      if (textRef.current) {
        gsap.to(textRef.current, { x: distanceX * 0.5, y: distanceY * 0.5, duration: 0.3, ease: 'power2.out' });
      }
    };
    
    const onMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      if (textRef.current) {
        gsap.to(textRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      }
    };
    
    const onMouseEnter = (e: MouseEvent) => {
      if (!bgRef.current) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      // Determine enter direction and animate the sweep
      gsap.fromTo(bgRef.current, 
        { 
          x: x > width / 2 ? '100%' : '-100%', 
          y: y > height / 2 ? '100%' : '-100%' 
        }, 
        { x: '0%', y: '0%', duration: 0.4, ease: 'power2.out' }
      );
    };
    
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseenter', onMouseEnter);
    
    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [reducedMotion]);

  return (
    <Link 
      ref={ref} 
      href={href} 
      className="group relative overflow-hidden rounded-full border border-line bg-surface px-4 py-2 text-micro font-bold uppercase tracking-wider text-ink transition-colors hover:border-lime-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
    >
      <div 
        ref={bgRef} 
        className="absolute inset-0 bg-lime opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" 
      />
      <div ref={textRef} className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </Link>
  );
}
