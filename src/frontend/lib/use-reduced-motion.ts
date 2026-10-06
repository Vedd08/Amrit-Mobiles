import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Live `prefers-reduced-motion`, as a hook.
 *
 * `prefersReducedMotion()` in ./motion is a one-shot read, which in a client
 * component has to be pushed into state from an effect — and that trips
 * react-hooks/set-state-in-effect. This subscribes instead, mirroring the
 * useMounted() idiom, and picks up changes if the visitor flips the OS setting
 * mid-session.
 *
 * The server snapshot is `true`: motion is opt-in after hydration, so nothing
 * heavy is ever set up during SSR.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true
  );
}
