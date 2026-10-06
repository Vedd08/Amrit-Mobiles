"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/frontend/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeImage = "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1200&q=80",
  afterImage = "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80",
  beforeLabel = "Before — old phone",
  afterLabel = "After — new phone",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sweepTweenRef = useRef<gsap.core.Tween | null>(null);
  const hasInteractedRef = useRef(false);

  const cancelSweep = useCallback(() => {
    hasInteractedRef.current = true;
    sweepTweenRef.current?.kill();
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion()) return;

      const sweep = { value: 0 };
      setSliderPosition(0);

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          if (hasInteractedRef.current) return;
          sweepTweenRef.current = gsap.to(sweep, {
            value: 50,
            duration: 1.1,
            ease: "power2.inOut",
            onUpdate: () => setSliderPosition(sweep.value),
          });
        },
      });
    },
    { scope: containerRef }
  );

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <section id="exchange" className="py-20 bg-white -ink border-t-2 border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* LEFT: Text & Stats */}
          <div>
            <div className="text-micro font-semibold uppercase text-lime mb-3">
              Exchange
            </div>
            <h2
              className="font-extrabold mb-5 text-balance"
              style={{ fontSize: "clamp(26px, 4vw, 56px)" }}
            >
              Your old phone pays for part of the new one.
            </h2>
            <p className="-ink/85 max-w-[34ch] mb-8" style={{ fontSize: "clamp(14px, 1.5vw, 17px)" }}>
              Bring it in working or cracked. We value it at the counter, deduct it from the bill, and you walk out the same day.
            </p>

            {/* Exchange Stats Grid */}
            <div className="grid grid-cols-2 border-t-2 border-l-2 border-line">
              <div className="p-4 border-r-2 border-b-2 border-line">
                <div className="text-micro uppercase -ink/55 mb-1">
                  Old phone valued at
                </div>
                <div className="font-extrabold" style={{ fontSize: "clamp(20px, 2.4vw, 30px)" }}>
                  ₹8,400
                </div>
              </div>
              <div className="p-4 border-r-2 border-b-2 border-line">
                <div className="text-micro uppercase -ink/55 mb-1">
                  You pay
                </div>
                <div className="font-extrabold text-lime" style={{ fontSize: "clamp(20px, 2.4vw, 30px)" }}>
                  ₹26,599
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Image Slider */}
          <div>
            <div
              ref={containerRef}
              className="relative aspect-[4/3] w-full overflow-hidden bg-line cursor-ew-resize select-none touch-none"
              onMouseDown={(e) => {
                cancelSweep();
                setIsDragging(true);
                handleMove(e.clientX);
              }}
              onTouchStart={(e) => {
                cancelSweep();
                setIsDragging(true);
                handleMove(e.touches[0].clientX);
              }}
            >
              {/* After Image (Base Layer) */}
              <div className="absolute inset-0 grayscale">
                <Image
                  src={afterImage}
                  alt={afterLabel}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 900px"
                />
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end pointer-events-none">
                  <span className="-ink text-white px-3 py-1.5 text-micro font-bold uppercase tracking-wider">
                    {afterLabel}
                  </span>
                </div>
              </div>

              {/* Before Image (Clipped Overlay Layer) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <div className="absolute inset-0 w-full h-full grayscale opacity-80">
                  <Image
                    src={beforeImage}
                    alt={beforeLabel}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 900px"
                  />
                  <div className="absolute top-4 left-4 z-10 flex flex-col items-start pointer-events-none">
                    <span className="bg-white -ink px-3 py-1.5 text-micro font-bold uppercase tracking-wider">
                      {beforeLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vertical Split Line Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-lime pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-lime flex items-center justify-center">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M8.5 17l-5-5 5-5v10zm7-10l5 5-5 5V7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-micro uppercase -ink/50 mt-2 text-right">
              Drag the red line
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
