'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils, Vector3 } from 'three';
import { stageState } from '@/frontend/lib/experience/stageState';
import { DAMP } from '@/frontend/lib/experience/keyframes';
import { PhoneModel } from './PhoneModel';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

const ORIGIN = new Vector3();
/** Matches the max width of the homepage text sections (Act01-04). */
const CONTENT_MAX_PX = 1360;
/** At most this share of the content width between screen centre and phone centre. */
const MAX_OFFSET_SHARE = 0.263;

export function PhoneRig() {
  const groupRef = useRef<Group>(null);
  const reducedMotion = useReducedMotion();
  
  const introRef = useRef<{
    startTime: number | null;
    skip: boolean;
  }>({
    startTime: null,
    skip: false,
  });

  useEffect(() => {
    const shouldSkip = reducedMotion || (typeof window !== 'undefined' && window.scrollY > 0);
    introRef.current.skip = shouldSkip;
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Finale: Act07 drives the phone directly so it stays locked to the scroll.
    const finale = stageState.finale;
    if (finale.active) {
      groupRef.current.position.set(0, finale.y, 0);
      groupRef.current.rotation.set(finale.rotX, finale.rotY, 0);
      groupRef.current.scale.setScalar(finale.scale);
      return;
    }

    // Start the rise-and-spin only once the screen shows its real wallpaper
    // (the canvas is hidden until then), so the intro is actually seen.
    if (introRef.current.startTime === null) {
      if (!stageState.screenReady && !introRef.current.skip) return;
      introRef.current.startTime = state.clock.elapsedTime;
    }

    const { pos, rot, scale } = stageState.phone;
    
    const isHero = stageState.beatId === 'hero';
    const floatY = isHero ? Math.sin(state.clock.elapsedTime * (Math.PI * 2 / 6)) * 0.012 : 0;
    const floatZ = isHero ? Math.sin(state.clock.elapsedTime * (Math.PI * 2 / 6)) * 0.008 : 0;
    
    const isMobile = stageState.tier === 'mobile';
    // The text sits in a centred, max-width column, but a world-space x offset
    // grows with the viewport height. On wide screens that pushed the phone
    // far from the copy, so cap the offset to a share of the content width.
    // At 1440px wide and below this is a no-op.
    const current = state.viewport.getCurrentViewport(state.camera, ORIGIN);
    const pxPerUnit = state.size.width / current.width;
    const maxOffsetPx = Math.min(state.size.width, CONTENT_MAX_PX) * MAX_OFFSET_SHARE;
    const xScale = Math.min(1, maxOffsetPx / (0.8 * pxPerUnit));
    const targetX = isMobile ? 0 : pos.x * xScale;
    const baseTargetY = isMobile ? pos.y - 0.4 : pos.y + floatY;
    const targetScale = isMobile ? scale * 0.75 : scale;

    const elapsed = state.clock.elapsedTime - introRef.current.startTime;
    const duration = 1.2;
    const isIntroActive = !introRef.current.skip && elapsed < duration;

    if (isIntroActive) {
      const progress = Math.min(1, Math.max(0, elapsed / duration));
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const introOffsetY = (1 - ease) * (-0.6);
      const introExtraRotY = (1 - ease) * (Math.PI * 2);

      // Write position.y and rotation.y directly without damping during intro
      groupRef.current.position.x = targetX;
      groupRef.current.position.y = baseTargetY + introOffsetY;
      groupRef.current.position.z = pos.z;

      groupRef.current.rotation.x = rot.x;
      groupRef.current.rotation.y = rot.y + introExtraRotY;
      groupRef.current.rotation.z = rot.z + floatZ;

      groupRef.current.scale.setScalar(targetScale);
    } else {
      groupRef.current.position.x = MathUtils.damp(groupRef.current.position.x, targetX, DAMP.phone, delta);
      groupRef.current.position.y = MathUtils.damp(groupRef.current.position.y, baseTargetY, DAMP.phone, delta);
      groupRef.current.position.z = MathUtils.damp(groupRef.current.position.z, pos.z, DAMP.phone, delta);
      
      groupRef.current.rotation.x = MathUtils.damp(groupRef.current.rotation.x, rot.x, DAMP.phone, delta);
      groupRef.current.rotation.y = MathUtils.damp(groupRef.current.rotation.y, rot.y, DAMP.phone, delta);
      groupRef.current.rotation.z = MathUtils.damp(groupRef.current.rotation.z, rot.z + floatZ, DAMP.phone, delta);
      
      const currScale = MathUtils.damp(groupRef.current.scale.x, targetScale, DAMP.phone, delta);
      groupRef.current.scale.setScalar(currScale);
    }
  });

  return (
    <group ref={groupRef}>
      <PhoneModel />
    </group>
  );
}
