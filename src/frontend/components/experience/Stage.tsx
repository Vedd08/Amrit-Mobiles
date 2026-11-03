'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useStageTier } from '@/frontend/lib/experience/useStageTier';
import { lowerQuality, type Quality } from '@/frontend/lib/experience/quality';
import { LightingRig } from './scene/LightingRig';
import { CameraRig } from './scene/CameraRig';
import { Atmosphere } from './scene/Atmosphere';
import { PhoneRig } from './scene/PhoneRig';
import { Component, useEffect, useRef, useState, Suspense, type ReactNode } from 'react';
import { stageState } from '@/frontend/lib/experience/stageState';

function ReadyNotifier({ onReady }: { onReady: () => void }) {
  const notified = useRef(false);
  useFrame(() => {
    if (!notified.current) {
      notified.current = true;
      onReady();
    }
  });
  return null;
}

/** Below this the scene steps its resolution down. */
const SMOOTH_FPS = 48;
/** Still below this at the lowest resolution: give up on WebGL (lite). */
const FLOOR_FPS = 30;
const WINDOW_S = 2;

/**
 * Watches the real frame rate while the phone is on screen. A slow device
 * first loses resolution, a quarter step at a time; if it still can't keep up
 * at 1x, the page drops to the CSS phone. The first seconds (shader compile,
 * textures, the intro spin) don't count.
 */
function FrameGuard({ minDpr }: { minDpr: number }) {
  const setDpr = useThree((s) => s.setDpr);
  const acc = useRef({ frames: 0, time: 0, warmup: 3, strikes: 0 });

  useFrame((state, delta) => {
    if (!stageState.screenReady || stageState.canvasOpacity <= 0 || document.hidden) return;
    const a = acc.current;
    // A long pause (tab switch, debugger) isn't a frame-rate problem.
    if (delta > 0.5) return;
    if (a.warmup > 0) {
      a.warmup -= delta;
      return;
    }
    a.frames++;
    a.time += delta;
    if (a.time < WINDOW_S) return;
    const fps = a.frames / a.time;
    a.frames = 0;
    a.time = 0;
    if (fps >= SMOOTH_FPS) {
      a.strikes = 0;
      return;
    }
    const current = state.viewport.dpr;
    if (current > minDpr + 0.01) {
      setDpr(Math.max(minDpr, current - 0.25));
      a.warmup = 0.5;
    } else if (fps < FLOOR_FPS && ++a.strikes >= 2) {
      lowerQuality('lite');
    }
  });
  return null;
}

/** A WebGL context that fails to start (or dies) sends the page to lite instead of crashing it. */
class StageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    lowerQuality('lite');
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** The 3D phone must have painted its screen by now, or the stage is given up. */
const READY_TIMEOUT_MS = 9000;

export function Stage({ onReady, quality }: { onReady?: () => void; quality: Quality }) {
  return (
    <StageBoundary>
      <StageCanvas onReady={onReady} quality={quality} />
    </StageBoundary>
  );
}

function StageCanvas({ onReady, quality }: { onReady?: () => void; quality: Quality }) {
  const tier = useStageTier();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [active, setActive] = useState(true);
  const high = quality === 'high' && tier === 'desktop';

  useEffect(() => {
    const onVisibility = () => setIsVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    // Painting nothing for this long means the GPU can't run the scene.
    const id = window.setTimeout(() => {
      if (!stageState.screenReady) lowerQuality('lite');
    }, READY_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastOpacity = -1;
    const updateOpacity = () => {
      const currentOpacity = stageState.canvasOpacity;
      // Hidden (but still rendering, so the screen can paint) until the first
      // photo wallpaper is on the 3D screen: no black-screen flash on load.
      const shown = stageState.screenReady ? currentOpacity : 0;
      if (shown !== lastOpacity) {
        if (wrapperRef.current) {
          wrapperRef.current.style.opacity = shown.toString();
        }
        lastOpacity = shown;

        setActive((prev) => {
          const next = currentOpacity > 0;
          return prev !== next ? next : prev;
        });
      }
      rafId = requestAnimationFrame(updateOpacity);
    };
    rafId = requestAnimationFrame(updateOpacity);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      id="experience-canvas"
      ref={wrapperRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        gl={{ antialias: tier !== 'mobile', powerPreference: 'high-performance', alpha: true, preserveDrawingBuffer: typeof window !== 'undefined' && Boolean((window as Window & { __CAPTURE_MODE__?: boolean }).__CAPTURE_MODE__) }}
        // 1.5x is already sharper than most laptop panels resolve on a phone
        // this size; medium devices stay close to 1x.
        dpr={high ? [1, 1.5] : [1, 1.25]}
        camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 3.2] }}
        frameloop={isVisible && active ? "always" : "demand"}
        shadows={high}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <LightingRig />
          <Atmosphere />
          <PhoneRig />
          <FrameGuard minDpr={1} />
          {onReady && <ReadyNotifier onReady={onReady} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
