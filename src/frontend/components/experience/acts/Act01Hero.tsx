'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { business, BRANCHES } from '@/shared/business';
import { SHOP_WHATSAPP_LINK } from '@/shared/whatsapp';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

export function Act01Hero() {
  const branchCount = BRANCHES.length;
  const reducedMotion = useReducedMotion();

  // Magnetic CTA
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !ctaRef.current) return;
    const rect = ctaRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    ctaRef.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };
  const handleMouseLeave = () => {
    if (!ctaRef.current) return;
    ctaRef.current.style.transform = 'translate(0px, 0px)';
  };

  const taglineWords = business.tagline.split(' ');

  return (
    <section data-act="hero" className="md:min-h-[150vh] py-16 md:py-0 relative pt-[20vh] px-6 md:mx-auto md:w-full md:max-w-[1360px] md:px-10 flex flex-col md:items-start items-center">
      <div className="md:sticky top-1/4 flex flex-col items-center md:items-start text-center md:text-left z-10 w-full md:w-[45%] xl:w-[50%]">
        
        {/* Word-by-word clip mask reveal */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-ink mb-6 flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1">
          {taglineWords.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden py-1">
              <span
                className="inline-block animate-[wordReveal_0.7s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none"
                style={{ animationDelay: reducedMotion ? '0s' : `${i * 60}ms` }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p className="text-lg md:text-xl text-ink-2 mb-10 max-w-2xl">
          Phones and trade-ins across Surat.
        </p>

        {/* Count-up pill */}
        <div className="mt-2 md:mt-8 order-2 md:order-last flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-line shadow-sm text-sm font-semibold mb-8 md:mb-0 text-ink">
          <span className="w-2 h-2 rounded-full bg-lime" />
          <span className="tabular-nums">{branchCount}</span> branches in Surat
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 order-3 md:order-2">
          <Link
            ref={ctaRef}
            href="/phones"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative overflow-hidden bg-lime text-[#2A2A2A] px-10 py-5 rounded-full font-bold text-sm md:text-base shadow-sm flex items-center justify-center transition-transform duration-200"
          >
            {/* Hover shine sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            <span>Browse phones</span>
          </Link>

          <a
            href={SHOP_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-line text-ink px-10 py-5 rounded-full font-bold text-sm md:text-base shadow-sm flex items-center justify-center hover:bg-paper-2 transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Mobile Poster (no canvas) */}
        <div className="md:hidden order-4 w-full flex justify-center mt-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-lime/20 to-teal/20 blur-2xl rounded-full transform scale-90 -z-10" />
          <img
            src="/images/phone-hero-poster-v2.webp"
            alt="Amrit Mobiles Flagship Phone"
            width={600}
            height={1200}
            className="h-[42svh] w-auto object-contain animate-[heroPosterFloat_4s_ease-in-out_infinite] motion-reduce:animate-none"
            fetchPriority="high"
          />
        </div>

      </div>

      <style jsx global>{`
        @keyframes wordReveal {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes heroPosterFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
