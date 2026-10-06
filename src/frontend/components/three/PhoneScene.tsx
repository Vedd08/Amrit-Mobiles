"use client";

import { Suspense, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import { createHeroMotionState, type HeroMotionState } from "./hero-motion";

const MODEL_URL = "/models/iphone-14-pro.gltf";
// Matches the well-tested framing from the earlier procedural placeholder:
// a ~3-unit-tall object reads clearly against the camera set up below.
const TARGET_HEIGHT = 3;

const BODY_MATERIAL = new THREE.MeshStandardMaterial({ color: "rgb(140, 139, 138)", metalness: 0.85, roughness: 0.20 });
// Punch a hole through the WebGL canvas where the glass is, so we can see the DOM behind it!
const GLASS_MATERIAL = new THREE.MeshStandardMaterial({ 
  transparent: true, 
  opacity: 0, 
  colorWrite: false, // Fails color write, leaves Canvas transparent
  depthWrite: true,  // Writes to depth, hiding the back of the phone case
});
const ISLAND_MATERIAL = new THREE.MeshStandardMaterial({ color: "rgb(4, 4, 4)", metalness: 0.6, roughness: 0.25 });


// The Spline export carries geometry only (no materials/textures), grouped
// under a few meaningfully-named nodes — everything else is generic
// "Ellipse"/"Rectangle" shape names inherited from the editor. Assign a
// material per named group, cascading down to its unnamed descendants.
// Note: three.js's GLTFLoader sanitizes node names, replacing spaces with
// underscores ("Dynamic Island" -> "Dynamic_Island"), so match on that form.
function materialForGroup(name: string) {
  const n = name.toLowerCase();
  if (n.includes("dynamic_island")) return ISLAND_MATERIAL;
  if (n.startsWith("cam1") || n.startsWith("cam2")) return GLASS_MATERIAL;
  if (n.includes("screen")) return GLASS_MATERIAL;
  return null;
}

function applyMaterials(root: THREE.Object3D) {
  function walk(node: THREE.Object3D, material: THREE.Material) {
    const next = materialForGroup(node.name) ?? material;
    if ((node as Mesh).isMesh) {
      (node as Mesh).material = next;
    }
    node.children.forEach((child) => walk(child, next));
  }
  walk(root, BODY_MATERIAL);
}

function PhoneModel({ motion }: { motion: RefObject<HeroMotionState> }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  const { phone, scale } = useMemo(() => {
    const found = scene.getObjectByName("iPhone_14_Pro") ?? scene;
    applyMaterials(found);

    // Measure size as it will render once re-parented under our own group
    // below — not its current size, which is deflated by whatever scale
    // the original Spline/glTF scene graph baked into its ancestors above
    // this node (that scale won't carry over once we re-parent it).
    const measureRoot = new THREE.Group();
    measureRoot.add(found);
    measureRoot.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(found).getSize(new THREE.Vector3());
    const tallestDimension = Math.max(size.x, size.y, size.z) || 1;

    return { phone: found, scale: TARGET_HEIGHT / tallestDimension };
  }, [scene]);

  // Rotation follows scroll-driven targets (tweened by GSAP in TinkerScrollHero)
  // plus a lerped mouse parallax and a small idle wiggle, applied every frame.
  // `motion` is a ref passed down from the hero component so GSAP can drive
  // the Three.js scene imperatively, outside React's render — the standard
  // ref escape hatch, so the react-compiler immutability check (which only
  // recognizes refs created by a local `useRef` call, not one received as a
  // prop) doesn't apply here. reactCompiler is not enabled in this project.
  /* eslint-disable react-hooks/immutability */
  useFrame((state, delta) => {
    if (!group.current) return;
    const m = motion.current;
    const lambda = 3.4;
    m.mx = THREE.MathUtils.damp(m.mx, m.mxT, lambda, delta);
    m.my = THREE.MathUtils.damp(m.my, m.myT, lambda, delta);

    const idle = Math.sin(state.clock.getElapsedTime() * 0.6) * 0.012;
    group.current.rotation.set(m.rotX + idle + -m.my * 0.045, m.rotY + m.mx * 0.09, 0);
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={group}>
      <Center>
        <primitive object={phone} scale={scale} />
      </Center>
    </group>
  );
}

useGLTF.preload("/models/iphone-14-pro.gltf");

export default function PhoneScene({ motion }: { motion?: RefObject<HeroMotionState> }) {
  const fallbackRef = useRef<HeroMotionState>(createHeroMotionState());
  const resolved = motion ?? fallbackRef;

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 35 }}
    >
      <ambientLight intensity={1.1} color="rgb(240, 237, 232)" />
      <directionalLight position={[3, 4, 3]} intensity={1.8} color="rgb(255, 255, 255)" />
      <directionalLight position={[-3, 1, -2]} intensity={0.5} color="rgb(221, 216, 208)" />
      <pointLight position={[2, -2, 3]} intensity={5} color="rgb(232, 228, 223)" />
      <Suspense fallback={null}>
        <PhoneModel motion={resolved} />
      </Suspense>
    </Canvas>
  );
}
