"use client";

import { useEffect, type RefObject } from "react";

/**
 * Pauses every CSS animation inside `ref` while it is off screen, by toggling
 * `data-anim-paused` (see globals.css). Infinite decorative loops otherwise
 * keep painting while the user scrolls elsewhere, which costs frames on
 * phones. `onChange` lets JS-driven loops (rAF, GSAP) follow along.
 */
export function usePauseOffscreen(
  ref: RefObject<HTMLElement | null>,
  onChange?: (visible: boolean) => void,
  rootMargin = "100px"
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        el.toggleAttribute("data-anim-paused", !visible);
        onChange?.(visible);
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
    // onChange is expected to be stable (a ref setter or module function).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, rootMargin]);
}
