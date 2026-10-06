"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/frontend/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export function Stagger<T extends React.ElementType = "div">({
  children,
  className,
  y = 32,
  as,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  as?: T;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;

      const items = gsap.utils.toArray(ref.current.children);
      
      gsap.set(items, { opacity: 0, y });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: {
          each: 0.05,
          amount: 0.5,
        },
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: ref }
  );

  const Component = as || "div";

  return (
    // @ts-expect-error - dynamic component ref assignment
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
