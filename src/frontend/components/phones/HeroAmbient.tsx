"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { brands } from "@/shared/brands";
import { useReducedMotion } from "@/frontend/lib/use-reduced-motion";

export function HeroAmbient() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;
    
    // Parallax logic for mouse
    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;
      
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: clientX - window.innerWidth / 2,
          y: clientY - window.innerHeight / 2,
          duration: 0.6,
          ease: "power2.out"
        });
      }
      
      const logoStar = document.querySelector('.hero-logo-star');
      if (logoStar) {
        gsap.to(logoStar, {
          x: x * 30,
          y: y * 30,
          rotationY: x * 15,
          rotationX: -y * 15,
          duration: 1,
          ease: "power2.out"
        });
      }
      
      const pills = document.querySelectorAll('.hero-stat-pill');
      pills.forEach((pill, i) => {
        const factor = (i + 1) * 8;
        gsap.to(pill, {
          x: x * factor,
          y: y * factor,
          duration: 1.5,
          ease: "power2.out"
        });
      });
    };
    
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !marqueeRef.current) return;
    // Marquee: paused while the hero is off screen, killed on unmount.
    const tween = gsap.to(marqueeRef.current, { x: "-50%", duration: 30, ease: "none", repeat: -1 });
    const host = containerRef.current;
    const io = host
      ? new IntersectionObserver(([e]) => (e.isIntersecting ? tween.resume() : tween.pause()), { rootMargin: "100px" })
      : null;
    if (host && io) io.observe(host);
    return () => {
      io?.disconnect();
      tween.kill();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-0 w-1/2 h-[400px] bg-lime/10 rounded-full" />
         <div className="absolute bottom-0 right-0 w-1/2 h-[400px] bg-teal/10 rounded-full" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden [perspective:1000px]"
      style={{
        maskImage: 'linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%)',
      }}
    >
      <style suppressHydrationWarning>{`
        @keyframes hero-spark {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        .animate-hero-spark {
          animation: hero-spark 4s ease-in-out infinite;
        }
      `}</style>
      
      {/* 3 soft drifting aurora blobs (lime, teal, steel) made with radial-gradient only, no filter: blur */}
      <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] opacity-20"
           style={{ background: 'radial-gradient(circle at center, var(--color-lime) 0%, transparent 70%)' }} />
      <div className="absolute top-[30%] -right-[20%] w-[900px] h-[900px] opacity-15"
           style={{ background: 'radial-gradient(circle at center, var(--color-teal) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-[40%] left-[20%] w-[1000px] h-[1000px] opacity-20"
           style={{ background: 'radial-gradient(circle at center, var(--color-steel) 0%, transparent 70%)' }} />

      {/* faint 56px steel grid with a radial mask */}
      <div className="absolute inset-0 opacity-10"
           style={{
             backgroundImage: 'linear-gradient(to right, var(--color-steel) 1px, transparent 1px), linear-gradient(to bottom, var(--color-steel) 1px, transparent 1px)',
             backgroundSize: '56px 56px',
             maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
             WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
           }} />

      {/* One giant outlined brand-name band */}
      <div className="absolute bottom-10 left-0 w-[400vw] h-40 -rotate-6 opacity-45 pointer-events-none"
           style={{ 
             WebkitTextStroke: '1.5px var(--color-lime)', 
             color: 'transparent'
           }}>
        <div ref={marqueeRef} className="flex h-full items-center gap-12 whitespace-nowrap text-[120px] font-black uppercase tracking-widest">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-12">
              {brands.map(b => (
                <span key={b.slug + i}>{b.name}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Twinkling sparks */}
      <div className="absolute top-[25%] left-[20%] text-lime animate-hero-spark" style={{ animationDelay: '1s' }}>✦</div>
      <div className="absolute top-[15%] right-[25%] text-teal animate-hero-spark" style={{ animationDelay: '2.5s' }}>✦</div>
      <div className="absolute bottom-[30%] left-[10%] text-steel animate-hero-spark" style={{ animationDelay: '1.8s' }}>✦</div>

      {/* lime cursor glow */}
      <div ref={glowRef} className="hidden md:block absolute top-1/2 left-1/2 w-[400px] h-[400px] -mt-[200px] -ml-[200px] opacity-20 mix-blend-normal pointer-events-none"
           style={{ background: 'radial-gradient(circle, var(--color-lime) 0%, transparent 60%)' }} />
    </div>
  );
}
