'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Box3, Vector3, MeshStandardMaterial, MeshPhysicalMaterial, Color, Mesh, Object3D, Quaternion, MathUtils, Shape, ShapeGeometry } from 'three';
import { brands } from '@/shared/brands';
import { useExperienceStore } from '@/frontend/lib/experience/store';
import { ScreenTexture } from './ScreenTexture';
import { stageState } from '@/frontend/lib/experience/stageState';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

const modelCache = new Map<string, { scene: Object3D, aspect: number }>();

const _n = new Vector3(0, 0, 1);
const _q = new Quaternion();
const _p = new Vector3();
const _toCam = new Vector3();
const _corner = new Vector3();
export function PhoneModel() {
  const activeBrandIndex = useExperienceStore(s => s.activeBrandIndex);
  const brand = brands[activeBrandIndex] || brands[0];
  const url = brand.model || '/models/phone-hero.glb';
  const backMaterialRef = useRef<MeshPhysicalMaterial>(null);
  const overlayPlaneRef = useRef<Mesh | null>(null);
  useEffect(() => {
    // We will initialize the ScreenTexture below once we have the aspect ratio
  }, []);

  const reducedMotion = useReducedMotion();
  const screenTexRef = useRef<ScreenTexture | null>(null);

  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  const { scene: normalizedScene, aspect } = useMemo(() => {
    if (modelCache.has(url)) {
      const cached = modelCache.get(url)!;
      return { scene: cached.scene.clone(), aspect: cached.aspect };
    }
    
    const scene = gltf.scene.clone(true);
    
    // Remove garbage immediately so it doesn't pollute ANY bounding boxes
    const toRemove: Object3D[] = [];
    scene.traverse((child: Object3D) => {
      const name = child.name.toLowerCase();
      if (name.includes('notes') || name.includes('untitled') || name.includes('floor')) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(m => m.parent?.remove(m));
    
    const rawBox = new Box3().setFromObject(scene);
    const rawCenter = new Vector3();
    rawBox.getCenter(rawCenter);
    
    // Normalize: height = 1.0
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    
    const scale = 1.0 / size.y;
    scene.scale.setScalar(scale);
    
    // Recenter
    box.setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    scene.position.sub(center);

    const defaultMaterial = new MeshStandardMaterial({ metalness: 0.8, roughness: 0.4, color: new Color(0x555555) });

    // Classify ellipses for camera lenses
    const ellipses: { mesh: Mesh, size: number }[] = [];
    scene.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        if (mesh.name.startsWith('Ellipse')) {
          if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
          const s = new Vector3();
          mesh.geometry.boundingBox!.getSize(s);
          ellipses.push({ mesh, size: s.lengthSq() });
        }
      }
    });
    ellipses.sort((a, b) => b.size - a.size);
    const lensGlassMeshes = new Set(ellipses.slice(0, 3).map(e => e.mesh));

    scene.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        const name = mesh.name;
        
        if (name === 'Metal_Border' || name.startsWith('Button') || name.startsWith('Connectors')) {
          mesh.material = new MeshStandardMaterial({ metalness: 1.0, roughness: 0.18, envMapIntensity: 1.6 });
        } else if (name === 'Back_Side') {
          mesh.material = new MeshPhysicalMaterial({ color: new Color(0xB8BCC0), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06 });
        } else if (name === 'Screen_Border') {
          mesh.material = new MeshStandardMaterial({ color: new Color(0x0A0A0C), metalness: 0.6, roughness: 0.35 });
        } else if (name.startsWith('Ellipse')) {
          if (lensGlassMeshes.has(mesh)) {
            mesh.material = new MeshPhysicalMaterial({ color: 0x0A0A0C, roughness: 0.05, clearcoat: 1 });
          } else {
            mesh.material = new MeshStandardMaterial({ metalness: 1.0, roughness: 0.08 });
          }
        } else if (name.startsWith('Cube') || name.startsWith('Rectangle')) {
          mesh.material = new MeshStandardMaterial({ metalness: 0.85, roughness: 0.3, color: new Color(0x8E9298) });
        } else {
          mesh.material = defaultMaterial;
        }
      }
    });

    // Add a thin plane flush over the screen face to avoid UV issues with original geometry
    // Since garbage is removed, this bounding box is perfectly tight to the phone
    box.setFromObject(scene);
    const phoneSize = new Vector3();
    box.getSize(phoneSize);
    
    // Always use the true bounding box aspect ratio
    const currentAspect = phoneSize.y / phoneSize.x;
    
    // Unscaled dimensions (size is already unscaled from original box)
    const localW = size.x;
    const localH = size.y;
    
    // Create rounded rect shape
    const shape = new Shape();
    const w = localW * 0.94;
    const h = localH * 0.96;
    const radius = w * 0.135; // match corner radius
    const x = -w/2;
    const y = -h/2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + w - radius, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + radius);
    shape.lineTo(x + w, y + h - radius);
    shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    shape.lineTo(x + radius, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    
    const planeGeo = new ShapeGeometry(shape);
    
    // Normalize UVs for the ShapeGeometry so the texture maps correctly (0..1)
    const pos = planeGeo.attributes.position, uv = planeGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
    }
    uv.needsUpdate = true;
    
    // The display is self-lit: no specular glare from the stage lights and no
    // tone mapping, so photo wallpapers show their true colours instead of
    // washing out. Glass reflections come from the separate sheen layer.
    const planeMat = new MeshPhysicalMaterial({
      color: new Color(0x000000),
      roughness: 1,
      metalness: 0,
      specularIntensity: 0,
      envMapIntensity: 0,
      emissive: new Color(0xFFFFFF),
      emissiveIntensity: 0.35,
      transparent: true,
      toneMapped: false,
    });

    const planeMesh = new Mesh(planeGeo, planeMat);
    
    // Place at the true local center and front-most local Z
    planeMesh.position.set(rawCenter.x, rawCenter.y, rawBox.max.z + (0.01 / scale));
    
    planeMesh.userData.isOverlay = true;
    scene.add(planeMesh);
    
    // Add a specular sheen layer
    const sheenGeo = new ShapeGeometry(shape);
    
    const sheenPos = sheenGeo.attributes.position, sheenUv = sheenGeo.attributes.uv;
    for (let i = 0; i < sheenPos.count; i++) {
      sheenUv.setXY(i, (sheenPos.getX(i) - x) / w, (sheenPos.getY(i) - y) / h);
    }
    sheenUv.needsUpdate = true;

    const sheenMat = new MeshPhysicalMaterial({
      transmission: 0,
      roughness: 0.08,
      metalness: 0,
      transparent: true,
      opacity: 0.07,
      envMapIntensity: 2.5
    });
    const sheenMesh = new Mesh(sheenGeo, sheenMat);
    sheenMesh.position.set(rawCenter.x, rawCenter.y, rawBox.max.z + (0.012 / scale));
    scene.add(sheenMesh);

    modelCache.set(url, { scene, aspect: currentAspect });
    return { scene: scene.clone(), aspect: currentAspect };
  }, [gltf, url]);

  useEffect(() => {
    const tex = new ScreenTexture(reducedMotion, aspect);
    screenTexRef.current = tex;
    return () => tex.destroy();
  }, [reducedMotion, aspect]);

  useEffect(() => {
    normalizedScene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        if (mesh.name.toLowerCase().includes('back') || mesh.userData.isBody) {
          backMaterialRef.current = mesh.material as MeshPhysicalMaterial;
        }
        if (mesh.userData.isOverlay && screenTexRef.current) {
           const mat = mesh.material as MeshPhysicalMaterial;
           mat.emissiveMap = screenTexRef.current.texture;
           mat.needsUpdate = true;
           overlayPlaneRef.current = mesh;
        }
      }
    });
  }, [normalizedScene]);

  const targetColor = useMemo(() => new Color(brand.tint || 0xB8BCC0), [brand.tint]);

  useFrame((state, delta) => {
    if (backMaterialRef.current) {
      backMaterialRef.current.color.lerp(targetColor, Math.min(1, 4.0 * delta));
    }
    
    if (overlayPlaneRef.current && screenTexRef.current) {
      const planeMesh = overlayPlaneRef.current;
      const camera = state.camera;
      
      _n.set(0, 0, 1).applyQuaternion(planeMesh.getWorldQuaternion(_q));
      _toCam.copy(camera.position).sub(planeMesh.getWorldPosition(_p)).normalize();
      const facing = _n.dot(_toCam);
      
      // A positive dot product means the plane's front face points toward the camera
      const isFacing = facing > 0.15;
      
      if (screenTexRef.current) {
        screenTexRef.current.setFacing(isFacing);
      }
      
      if (overlayPlaneRef.current) {
        const mat = overlayPlaneRef.current.material as MeshPhysicalMaterial;
        // The ScreenTexture is recreated when its effect re-runs (dev double
        // effects, reduced-motion changes); keep the material pointing at the
        // live one, otherwise the screen shows a stale or missing map.
        if (mat.emissiveMap !== screenTexRef.current.texture) {
          mat.emissiveMap = screenTexRef.current.texture;
          mat.needsUpdate = true;
        }
        const targetEmissive = MathUtils.lerp(0.15, 0.95, MathUtils.clamp(facing, 0, 1));
        mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, targetEmissive, Math.min(1, 8.0 * delta));
      }

      // During the finale, publish where the display sits on screen so the
      // DOM portal can open exactly from it.
      if (stageState.finale.active) {
        const geo = planeMesh.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox!;
        planeMesh.updateWorldMatrix(true, false);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const cx of [bb.min.x, bb.max.x]) {
          for (const cy of [bb.min.y, bb.max.y]) {
            _corner.set(cx, cy, bb.max.z).applyMatrix4(planeMesh.matrixWorld).project(camera);
            const px = ((_corner.x + 1) / 2) * state.size.width;
            const py = ((1 - _corner.y) / 2) * state.size.height;
            minX = Math.min(minX, px); maxX = Math.max(maxX, px);
            minY = Math.min(minY, py); maxY = Math.max(maxY, py);
          }
        }
        const r = stageState.screenRect;
        r.x = minX; r.y = minY; r.w = maxX - minX; r.h = maxY - minY; r.valid = r.w > 10 && r.h > 10;
      }
    }
  });

  return <primitive object={normalizedScene} />;
}

if (typeof window !== 'undefined') {
  useLoader.preload(GLTFLoader, '/models/phone-hero.glb', (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
}
