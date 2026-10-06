'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useStageTier } from '@/frontend/lib/experience/useStageTier';
import { LightingRig } from './scene/LightingRig';
import { CameraRig } from './scene/CameraRig';
import { Atmosphere } from './scene/Atmosphere';
import { PhoneRig } from './scene/PhoneRig';
import { useEffect, useRef, useState, Suspense } from 'react';
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

export function Stage({ onReady }: { onReady?: () => void }) {
  const tier = useStageTier();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [active, setActive] = useState(true);
  
  useEffect(() => {
    const onVisibility = () => setIsVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
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
        dpr={tier === 'mobile' ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 3.2] }}
        frameloop={isVisible && active ? "always" : "demand"}
        shadows={tier === 'desktop'}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <LightingRig />
          <Atmosphere />
          <PhoneRig />
          {onReady && <ReadyNotifier onReady={onReady} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
