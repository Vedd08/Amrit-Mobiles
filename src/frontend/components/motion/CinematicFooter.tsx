"use client";

import * as React from "react";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/frontend/lib/utils";
import { prefersReducedMotion } from "@/frontend/lib/motion";
import { useLenis } from "@/frontend/components/motion/SmoothScrollProvider";
import { usePauseOffscreen } from "@/frontend/lib/use-pause-offscreen";
import { CartIcon, WhatsAppIcon } from "@/frontend/components/icons";
import { useStoreChatLink } from "@/frontend/store/store-chat-store";
import { BRANCHES } from "@/shared/branches";

gsap.registerPlugin(ScrollTrigger);

// -------------------------------------------------------------------------
// Theme-adaptive styles have been moved to globals.css so they can be reused
// across the cinematic catalog pages.
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Magnetic button primitive
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

export const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    React.useEffect(() => {
      if (typeof window === "undefined" || prefersReducedMotion()) return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "power3.out",
            duration: 0.6,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as EventListener);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as EventListener);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return React.createElement(
      Component,
      {
        ref: (node: HTMLElement) => {
          (localRef as React.RefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.RefObject<HTMLElement | null>).current = node;
        },
        className: cn("cursor-pointer", className),
        ...props,
      },
      children
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// Marquee content — real store USPs, matching the phrasing already used
// across the shop pages (0% EMI, sealed stock, 10-minute approval, GST).
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>0% Paperless EMI</span> <span className="text-teal" aria-hidden="true">✦</span>
    <span>100% Genuine Sealed Stock</span> <span className="text-lime" aria-hidden="true">✦</span>
    <span>10-Minute Counter Approval</span> <span className="text-teal" aria-hidden="true">✦</span>
    <span>GST Billed Invoice</span> <span className="text-lime" aria-hidden="true">✦</span>
    <span>{BRANCHES.length} Branches Across Surat</span> <span className="text-teal" aria-hidden="true">✦</span>
  </div>
);

// -------------------------------------------------------------------------
// Main component — a "curtain reveal" footer pinned to the viewport for one
// scroll-height, then it settles at the end of the page. Meant for the
// homepage only: it's a heavier, more theatrical piece than the plain
// Footer used across cart/checkout/category pages.
// -------------------------------------------------------------------------
export function CinematicFooter() {
  const chat = useStoreChatLink();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  usePauseOffscreen(wrapperRef);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      if (!wrapperRef.current || prefersReducedMotion()) return;

      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );
    },
    { scope: wrapperRef }
  );

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>

      {/*
        Curtain-reveal wrapper: normal document flow, exactly one viewport
        tall. The footer inside is fixed to the viewport, and clip-path (not
        overflow-hidden — that wouldn't clip a fixed descendant) masks it to
        this box, so it appears to rise into view as the page scrolls past.
      */}
      <div
        ref={wrapperRef}
        className="relative md:h-svh w-full md:[clip-path:polygon(0%_0,100%_0%,100%_100%,0_100%)]"
      >
        <footer className="relative min-h-svh md:fixed md:bottom-0 md:left-0 flex md:h-svh md:min-h-0 w-full flex-col justify-between overflow-hidden bg-paper text-ink cinematic-footer-wrapper">
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute bottom-[-5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            AMRIT
          </div>

          {/* Sleek diagonal marquee */}
          <div className="absolute top-28 left-0 w-full overflow-hidden border-y border-line bg-surface/80 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-sh-1">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold text-ink-2 uppercase">
              <MarqueeItem />
              <div aria-hidden="true" className="flex">
                <MarqueeItem />
              </div>
            </div>
          </div>

          {/* Main center content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-bold footer-text-glow tracking-tighter mb-12 text-center"
            >
              Ready to upgrade?
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {/* Primary actions */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton
                  as={Link}
                  href="/shop"
                  className="bg-lime text-[#2A2A2A] px-10 py-5 rounded-full font-bold text-sm md:text-base flex items-center gap-3 group transition-transform"
                >
                  <CartIcon className="w-6 h-6 text-[#2A2A2A]" />
                  Shop Now
                </MagneticButton>

                <MagneticButton
                  as="a"
                  {...chat}
                  className="footer-glass-pill px-10 py-5 rounded-full text-ink font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  <WhatsAppIcon className="w-6 h-6 text-ink-3 group-hover:text-ink transition-colors" />
                  Chat on WhatsApp
                </MagneticButton>
              </div>

              {/* Secondary links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <MagneticButton as={Link} href="/phones" className="footer-glass-pill px-6 py-3 rounded-full text-ink-3 font-medium text-xs md:text-sm hover:text-ink">
                  Phones
                </MagneticButton>
                <MagneticButton as={Link} href="/trade-in" className="footer-glass-pill px-6 py-3 rounded-full text-ink-3 font-medium text-xs md:text-sm hover:text-ink">
                  Trade-In
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Bottom bar. Extra bottom padding on mobile clears BottomNav,
              which is fixed at the same viewport edge. */}
          <div className="relative z-20 w-full pb-24 md:pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-ink-3 text-micro md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1 md:flex-1">
              © {new Date().getFullYear()} Amrit Mobiles. All rights reserved.
            </div>

            {/* The studio that built the site, front and centre */}
            <a
              href="https://logicmindsbyparii.com/"
              target="_blank"
              rel="noopener"
              className="group order-1 md:order-2 flex items-center gap-3 rounded-full border border-lime/50 bg-white/85 py-2 pl-2 pr-5 shadow-[0_12px_30px_-14px_rgba(95,138,13,0.55)] ring-4 ring-lime/10 backdrop-blur-md transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(95,138,13,0.7)]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-[15px] text-[#2A2A2A]" aria-hidden="true">
                ✦
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">Designed &amp; developed by</span>
                <span className="flex items-center gap-1 text-sm font-extrabold text-ink md:text-base">
                  LogicMinds by Parii
                  <span className="text-lime-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </span>
            </a>

            {/* Same flex-1 as the copyright, so the credit sits dead centre */}
            <div className="order-3 flex md:flex-1 md:justify-end">
              <MagneticButton
                as="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-ink-3 hover:text-ink group"
              >
                <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              </MagneticButton>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}