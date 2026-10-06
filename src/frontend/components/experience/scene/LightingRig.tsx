'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DirectionalLight, SpotLight, MathUtils } from 'three';
import { Environment, Lightformer } from '@react-three/drei';
import { stageState } from '@/frontend/lib/experience/stageState';
import { DAMP } from '@/frontend/lib/experience/keyframes';
import { useStageTier } from '@/frontend/lib/experience/useStageTier';
import { TOKENS } from '@/shared/design-tokens';

export function LightingRig() {
  const tier = useStageTier();
  const keyRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<SpotLight>(null);

  useFrame((_, delta) => {
    if (keyRef.current) {
      keyRef.current.intensity = MathUtils.damp(keyRef.current.intensity, stageState.light.key, DAMP.light, delta);
    }
    if (rimRef.current) {
      rimRef.current.intensity = MathUtils.damp(rimRef.current.intensity, stageState.light.rim, DAMP.light, delta);
      rimRef.current.color.copy(stageState.light.rimColor);
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} color="white" />
      
      {/* Key light */}
      <directionalLight
        ref={keyRef}
        position={[3.0, 4.0, 3.0]}
        intensity={2.6}
        castShadow={tier === 'desktop'}
        shadow-mapSize={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />

      {/* Fill light */}
      <directionalLight position={[-3.5, 1.0, 2.0]} intensity={0.7} />

      {/* Rim light */}
      <spotLight
        ref={rimRef}
        position={[-1.5, 2.5, -3.5]}
        intensity={3.2}
        color={TOKENS.teal}
        angle={Math.PI / 4}
        penumbra={1}
      />

      {/* Kicker */}
      <pointLight position={[1.8, -1.2, 1.5]} intensity={1.1} color={TOKENS.lime} />

      {/* Local Environment with Lightformers */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, -6]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={0.8} color={TOKENS.teal} position={[0, -2, 4]} scale={3} />
      </Environment>
    </>
  );
}
