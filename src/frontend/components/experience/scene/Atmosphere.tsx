'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Float32BufferAttribute, NormalBlending, Color, Vector2 } from 'three';
import { TOKENS } from '@/shared/design-tokens';
import { useStageTier } from '@/frontend/lib/experience/useStageTier';
import { stageState } from '@/frontend/lib/experience/stageState';
import { ScreenTexture } from './ScreenTexture';

const gradientVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const gradientFragmentShader = `
uniform vec3 colorFrom;
uniform vec3 colorTo;
uniform vec2 uResolution;
varying vec2 vUv;
void main() {
  vec2 screenUv = gl_FragCoord.xy / uResolution.xy;
  vec3 color = mix(colorFrom, colorTo, vUv.y);
  
  float dist = distance(screenUv, vec2(0.5));
  float centerGlow = smoothstep(0.6, 0.0, dist);
  color = mix(color, vec3(1.0), centerGlow * 0.15);
  
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

const radialGlowFragmentShader = `
uniform vec3 color;
uniform float opacity;
varying vec2 vUv;
void main() {
  float dist = distance(vUv, vec2(0.5));
  float alpha = smoothstep(0.5, 0.0, dist) * opacity;
  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`;

export function Atmosphere() {
  const tier = useStageTier();

  const particlesRef = useRef<Points>(null);

  const particlesCount = tier === 'desktop' ? 600 : tier === 'tablet' ? 240 : 0;
  
  const particlesGeometry = useMemo(() => {
    if (particlesCount === 0) return null;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    let seed = 0x5f8a0d;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (rand() - 0.5) * 10;
    }
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geometry;
  }, [particlesCount]);

  const bgUniforms = useMemo(() => ({
    colorFrom: { value: new Color() },
    colorTo: { value: new Color() },
    uResolution: { value: new Vector2() }
  }), []);

  const glowUniforms = useMemo(() => ({
    color: { value: new Color() },
    opacity: { value: 0.10 }
  }), []);

  const poolUniforms = useMemo(() => ({
    color: { value: new Color(TOKENS.teal) },
    opacity: { value: 0.12 }
  }), []);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.015;
    }
    
    bgUniforms.colorFrom.value.copy(stageState.bg.from);
    bgUniforms.colorTo.value.copy(stageState.bg.to);
    state.gl.getDrawingBufferSize(bgUniforms.uResolution.value);
    
    glowUniforms.color.value.copy(stageState.light.rimColor);
  });

  if (ScreenTexture.captureMode) return null;

  return (
    <>
      {/* Hidden: the page-level ExperienceBackdrop now paints the ground, and
          the canvas is alpha so that backdrop shows through behind the phone. */}
      <mesh position={[0, 0, -10]} scale={[100, 100, 1]} renderOrder={-3} visible={false}>
        <planeGeometry />
        <shaderMaterial
          vertexShader={gradientVertexShader}
          fragmentShader={gradientFragmentShader}
          uniforms={bgUniforms}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      <mesh position={[0, 0, -6]} scale={[12, 12, 1]} renderOrder={-2}>
        <planeGeometry />
        <shaderMaterial
          vertexShader={gradientVertexShader}
          fragmentShader={radialGlowFragmentShader}
          uniforms={glowUniforms}
          transparent={true}
          blending={NormalBlending}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.6, 1.6, 1]} renderOrder={-1}>
        <planeGeometry />
        <shaderMaterial
          vertexShader={gradientVertexShader}
          fragmentShader={radialGlowFragmentShader}
          uniforms={poolUniforms}
          transparent={true}
          blending={NormalBlending}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      {particlesGeometry && (
        <points ref={particlesRef}>
          <primitive object={particlesGeometry} attach="geometry" />
          <pointsMaterial
            size={0.02}
            color="#3AAAB6"
            transparent
            opacity={0.35}
            blending={NormalBlending}
            depthWrite={false}
          />
        </points>
      )}
    </>
  );
}
