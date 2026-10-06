'use client';

import { useRef } from 'react';
import { claims } from '@/shared/business';
import { BRANCHES } from '@/shared/branches';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

export function Act03Why() {
  const reducedMotion = useReducedMotion();
  const branchCount = BRANCHES.length;
  const sectionRef = useRef<HTMLElement>(null);

  const claimList = Object.values(claims);

  return (
    <section
      ref={sectionRef}
      id="why"
      data-act="why"
      className="md:min-h-[150vh] py-16 md:py-0 relative px-6 md:mx-auto md:w-full md:max-w-[1360px] md:px-10 md:py-24 flex flex-col md:items-start items-center justify-center md:justify-start"
    >
      <div className="md:sticky top-[20vh] w-full md:w-[45%] z-10 text-center md:text-left">
        <div className="reveal-up inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-line shadow-sm text-sm font-semibold mb-4 text-ink">
          <span className="w-2 h-2 rounded-full bg-lime" />
          <span className="tabular-nums font-bold text-lime-ink">{branchCount}</span> stores across Surat
        </div>

        <h2 className="reveal-up text-4xl md:text-6xl font-bold tracking-tight text-ink mb-8">
          Why Amrit?
        </h2>

        <div className="reveal-stagger grid gap-6">
          {claimList.map((claim, i) => (
            <TiltCard key={i} claim={claim} reducedMotion={reducedMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TiltCard({
  claim,
  reducedMotion,
}: {
  claim: { title: string; body: string };
  reducedMotion: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = (-y / (rect.height / 2)) * 6;
    const rotY = (x / (rect.width / 2)) * 6;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-white border border-line p-7 rounded-3xl shadow-sm transition-transform duration-200 ease-out flex flex-col gap-2 text-left"
    >
      <h3 className="font-bold text-xl text-ink">{claim.title}</h3>
      <p className="text-ink-2 text-base leading-relaxed">{claim.body}</p>
    </div>
  );
}
