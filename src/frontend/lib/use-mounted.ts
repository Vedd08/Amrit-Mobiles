import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only after client hydration. Used to defer reading persisted
 * (localStorage-backed) state until the client snapshot is safe to render,
 * avoiding a server/client mismatch — via useSyncExternalStore rather than
 * setState-in-effect, per react-hooks/set-state-in-effect.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
