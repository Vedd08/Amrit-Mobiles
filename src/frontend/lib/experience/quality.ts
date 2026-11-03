import { useSyncExternalStore } from 'react';
import { stageState } from './stageState';

/**
 * How much the homepage asks of this device, separate from its screen size
 * (useStageTier):
 *  - high:   the full WebGL phone.
 *  - medium: the WebGL phone, cheaper (lower resolution, no shadows, fewer
 *            particles, a smaller screen texture redrawn less often).
 *  - lite:   no WebGL. The page runs the CSS phone the mobile layout uses, so
 *            every act, the fold and the finale still play.
 *
 * Decided once from the hardware, then lowered at runtime if the 3D can't keep
 * up or fails to start (Stage). A drop to lite is remembered on this device so
 * the next visit starts there instead of stuttering first.
 * `?quality=high|medium|lite` overrides it, for testing and demos.
 */
export type Quality = 'high' | 'medium' | 'lite';

const RANK: Record<Quality, number> = { lite: 0, medium: 1, high: 2 };
const REMEMBER_KEY = 'amrit:quality-lite';
/** GPUs that are really the CPU drawing in software. */
const SOFTWARE_GPU = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic|mesa offscreen/i;

let current: Quality | null = null;
const listeners = new Set<() => void>();

function detect(): Quality {
  const forced = new URLSearchParams(location.search).get('quality');
  if (forced === 'high' || forced === 'medium' || forced === 'lite') return forced;

  try {
    if (localStorage.getItem(REMEMBER_KEY) === '1') return 'lite';
  } catch {}

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ?? 8;
  if (cores <= 2 || memory <= 2) return 'lite';

  // failIfMajorPerformanceCaveat: no context when the browser would have to
  // fall back to a software renderer (blocklisted driver, acceleration off).
  const canvas = document.createElement('canvas');
  const gl = (canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
    canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })) as WebGLRenderingContext | null;
  if (!gl) return 'lite';
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  if (SOFTWARE_GPU.test(renderer)) return 'lite';

  if (cores <= 4 || memory <= 4) return 'medium';
  return 'high';
}

function get(): Quality {
  if (current === null) {
    current = detect();
    stageState.quality = current;
  }
  return current;
}

/** Steps quality down (never up). Dropping to lite is remembered on this device. */
export function lowerQuality(to: Quality) {
  if (RANK[to] >= RANK[get()]) return;
  current = to;
  stageState.quality = to;
  if (to === 'lite') {
    try {
      localStorage.setItem(REMEMBER_KEY, '1');
    } catch {}
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/**
 * The device's quality. The server snapshot is lite: nothing heavy is set up
 * before hydration, and the WebGL stage mounts after load anyway.
 */
export function useQuality() {
  return useSyncExternalStore(subscribe, get, () => 'lite' as Quality);
}
