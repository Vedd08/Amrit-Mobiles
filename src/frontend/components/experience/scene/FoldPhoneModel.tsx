'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  Shape,
  ShapeGeometry,
  Vector3,
  type Material,
} from 'three';
import { ScreenTexture } from './ScreenTexture';
import { stageState } from '@/frontend/lib/experience/stageState';
import { useReducedMotion } from '@/frontend/lib/use-reduced-motion';

/*
 * Apple's book-style foldable (launched Sept 2026 as iPhone Duo, long known as
 * the iPhone Fold), modelled in code so it can really fold on scroll.
 * Units: the phone's height is 1 (117.8 mm). Shut it is 84 x 118 x 11 mm, open
 * 165 x 118 x 5 mm, with a 5.4" cover screen and a 7.6" inner screen.
 *
 * Layout, looking at the open phone: the inner screen faces +z and the hinge
 * runs along y at x = 0. The left half swings round the hinge onto the right
 * half, so shut, the left half's back (the cover screen) faces you and the
 * hinge sits on the left edge. The rear cameras are on the right half's back.
 */
export const FOLD_DIMS = {
  height: 1,
  /** One half, hinge to outer edge. */
  halfWidth: 0.7,
  /** One half's thickness (5.2 mm). */
  thickness: 0.044,
};

const H = FOLD_DIMS.height;
const HALF_W = FOLD_DIMS.halfWidth;
const T = FOLD_DIMS.thickness;
const GAP = 0.003; // each half's clearance from the hinge axis
const CORNER = 0.085; // outer corners, seen face-on
const SPINE_CORNER = 0.022; // corners on the hinge side
const BEVEL = 0.012; // rounded frame edge
const BEZEL = 0.022; // black border around each display

// Star White: pale frosted back glass in a bright polished titanium frame.
const BACK_COLOR = '#E7E5DF';
const FRAME_COLOR = '#D3D2CD';
const HINGE_COLOR = '#B9BCBE';

/** Displays: cover is h/w, inner is h/w of the whole unfolded panel. */
const COVER_W = HALF_W - BEZEL * 2;
const COVER_H = H - BEZEL * 2;
// One half of the inner panel: no bezel at the hinge, and it runs right up to
// the axis so the open screen reads as one seamless sheet.
const INNER_PANE_W = HALF_W + GAP - BEZEL;
const INNER_W = INNER_PANE_W * 2;
const INNER_H = H - BEZEL * 2;

/** World-space width of the phone at a given fold (scale 1). */
export function foldWidth(fold: number) {
  const phi = (1 - fold) * Math.PI;
  return HALF_W * (1 + Math.max(0, Math.cos(phi)));
}

/** Rounded rectangle; the left and right pairs of corners take their own radius. */
function roundedRect(x0: number, x1: number, y0: number, y1: number, rLeft: number, rRight: number) {
  const s = new Shape();
  s.moveTo(x0 + rLeft, y0);
  s.lineTo(x1 - rRight, y0);
  s.quadraticCurveTo(x1, y0, x1, y0 + rRight);
  s.lineTo(x1, y1 - rRight);
  s.quadraticCurveTo(x1, y1, x1 - rRight, y1);
  s.lineTo(x0 + rLeft, y1);
  s.quadraticCurveTo(x0, y1, x0, y1 - rLeft);
  s.lineTo(x0, y0 + rLeft);
  s.quadraticCurveTo(x0, y0, x0 + rLeft, y0);
  return s;
}

/** One half's body: front face at z = 0, back face at z = -T. side = +1 (right) or -1 (left). */
function halfBodyGeometry(side: 1 | -1) {
  const inner = GAP + BEVEL;
  const outer = GAP + HALF_W - BEVEL;
  const [x0, x1] = side > 0 ? [inner, outer] : [-outer, -inner];
  const spineR = SPINE_CORNER - BEVEL * 0.5;
  const outerR = CORNER - BEVEL;
  const shape = roundedRect(x0, x1, -H / 2 + BEVEL, H / 2 - BEVEL, side > 0 ? spineR : outerR, side > 0 ? outerR : spineR);
  const depth = T - BEVEL * 2;
  const geo = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: BEVEL,
    bevelThickness: BEVEL,
    bevelSegments: 5,
    curveSegments: 10,
  });
  geo.translate(0, 0, -(depth + BEVEL));
  return { geo, shape };
}

/** A display quad whose UVs cover [u0, u1] of its texture. */
function displayGeometry(w: number, h: number, u0 = 0, u1 = 1) {
  const geo = new PlaneGeometry(w, h);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, u0 + uv.getX(i) * (u1 - u0));
  uv.needsUpdate = true;
  return geo;
}

type FoldParts = {
  root: Group;
  leftHalf: Group;
  spine: Mesh;
  cover: Mesh;
  innerLeft: Mesh;
  innerRight: Mesh;
  screens: { cover: MeshBasicMaterial; inner: MeshBasicMaterial };
};

function buildFoldPhone(): FoldParts {
  const frame = new MeshStandardMaterial({ color: new Color(FRAME_COLOR), metalness: 1, roughness: 0.2, envMapIntensity: 1.5 });
  const blackGlass = new MeshPhysicalMaterial({ color: new Color(0x08090a), metalness: 0.1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  const back = new MeshPhysicalMaterial({ color: new Color(BACK_COLOR), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35, side: DoubleSide });
  const plateau = new MeshPhysicalMaterial({ color: new Color(BACK_COLOR).multiplyScalar(0.94), roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.22 });
  const hinge = new MeshStandardMaterial({ color: new Color(HINGE_COLOR), metalness: 1, roughness: 0.5, envMapIntensity: 1.2 });
  const lensRing = new MeshStandardMaterial({ color: new Color('#C9CCCF'), metalness: 1, roughness: 0.15 });
  const lensGlass = new MeshPhysicalMaterial({ color: new Color(0x050608), roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 });
  const lensCore = new MeshPhysicalMaterial({ color: new Color(0x121a2e), roughness: 0.05, metalness: 0.3, clearcoat: 1 });
  const sapphire = new MeshPhysicalMaterial({ color: new Color(0x6d7175), metalness: 0.6, roughness: 0.1, clearcoat: 1 });
  const flash = new MeshStandardMaterial({ color: new Color('#F3EFE2'), roughness: 0.4 });
  // Displays are self-lit and skip tone mapping so photo wallpapers keep their colours.
  const coverScreen = new MeshBasicMaterial({ color: new Color(0.3, 0.3, 0.3), toneMapped: false });
  const innerScreen = new MeshBasicMaterial({ color: new Color(0.3, 0.3, 0.3), toneMapped: false });
  const sheen = new MeshPhysicalMaterial({ roughness: 0.08, metalness: 0, transparent: true, opacity: 0.07, envMapIntensity: 2.5, depthWrite: false });

  const root = new Group();

  // --- Right half: rear cameras on its back, Touch ID + volume on its edges.
  const rightHalf = new Group();
  const right = halfBodyGeometry(1);
  rightHalf.add(new Mesh(right.geo, [blackGlass, frame]));

  const backPlate = new Mesh(new ShapeGeometry(right.shape, 10), back);
  backPlate.position.z = -T - 0.0006;
  rightHalf.add(backPlate);

  // Camera plateau: a pill across the top of the back (outer side, seen from behind).
  const outerX = GAP + HALF_W;
  const plateauW = HALF_W * 0.84;
  const plateauH = 0.14;
  const plateauD = 0.012;
  const plateauCy = H / 2 - 0.05 - plateauH / 2;
  const plateauX1 = outerX - 0.055;
  const plateauX0 = plateauX1 - plateauW;
  const plateauGeo = new ExtrudeGeometry(
    roundedRect(plateauX0, plateauX1, plateauCy - plateauH / 2, plateauCy + plateauH / 2, plateauH / 2, plateauH / 2),
    { depth: plateauD, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 3, curveSegments: 16 },
  );
  plateauGeo.translate(0, 0, -T - plateauD - 0.004);
  rightHalf.add(new Mesh(plateauGeo, plateau));

  const lensZ = -T - plateauD - 0.006;
  const addLens = (x: number) => {
    const ring = new Mesh(new CylinderGeometry(0.05, 0.05, 0.012, 48), lensRing);
    const glass = new Mesh(new CylinderGeometry(0.041, 0.041, 0.0125, 48), lensGlass);
    const core = new Mesh(new CylinderGeometry(0.016, 0.016, 0.013, 32), lensCore);
    for (const m of [ring, glass, core]) {
      m.rotation.x = Math.PI / 2;
      m.position.set(x, plateauCy, lensZ);
      rightHalf.add(m);
    }
  };
  addLens(plateauX1 - 0.075);
  addLens(plateauX1 - 0.195);
  const flashMesh = new Mesh(new CylinderGeometry(0.016, 0.016, 0.01, 24), flash);
  flashMesh.rotation.x = Math.PI / 2;
  flashMesh.position.set(plateauX1 - 0.3, plateauCy, lensZ);
  rightHalf.add(flashMesh);

  // Touch ID side button and Camera Control on the outer edge, volume on top.
  const sideButton = new Mesh(new BoxGeometry(0.014, 0.12, 0.022), frame);
  sideButton.position.set(outerX + 0.004, 0.22, -T / 2);
  rightHalf.add(sideButton);
  const cameraControl = new Mesh(new BoxGeometry(0.01, 0.075, 0.02), sapphire);
  cameraControl.position.set(outerX + 0.002, -0.14, -T / 2);
  rightHalf.add(cameraControl);
  for (const x of [outerX - 0.13, outerX - 0.23]) {
    const vol = new Mesh(new BoxGeometry(0.075, 0.014, 0.022), frame);
    vol.position.set(x, H / 2 + 0.004, -T / 2);
    rightHalf.add(vol);
  }

  // Inner display, right pane.
  const innerRight = new Mesh(
    displayGeometry(INNER_PANE_W, INNER_H, 0.5, 1),
    innerScreen,
  );
  innerRight.position.set(INNER_PANE_W / 2, 0, 0.0008);
  rightHalf.add(innerRight);
  const sheenRight = new Mesh(new PlaneGeometry(INNER_PANE_W, INNER_H), sheen);
  sheenRight.position.set(innerRight.position.x, 0, 0.0012);
  rightHalf.add(sheenRight);

  root.add(rightHalf);

  // --- Left half: hinged at x = 0, cover screen on its back.
  const leftHalf = new Group();
  const left = halfBodyGeometry(-1);
  leftHalf.add(new Mesh(left.geo, [blackGlass, frame]));

  const innerLeft = new Mesh(displayGeometry(INNER_PANE_W, INNER_H, 0, 0.5), innerScreen);
  innerLeft.position.set(-INNER_PANE_W / 2, 0, 0.0008);
  leftHalf.add(innerLeft);
  const sheenLeft = new Mesh(new PlaneGeometry(INNER_PANE_W, INNER_H), sheen);
  sheenLeft.position.set(innerLeft.position.x, 0, 0.0012);
  leftHalf.add(sheenLeft);

  // Turned to face -z so it reads the right way round once the half is folded over.
  const cover = new Mesh(displayGeometry(COVER_W, COVER_H), coverScreen);
  cover.rotation.y = Math.PI;
  cover.position.set(-(GAP + HALF_W / 2), 0, -T - 0.0008);
  leftHalf.add(cover);
  const sheenCover = new Mesh(new PlaneGeometry(COVER_W, COVER_H), sheen);
  sheenCover.rotation.y = Math.PI;
  sheenCover.position.set(cover.position.x, 0, -T - 0.0012);
  leftHalf.add(sheenCover);

  root.add(leftHalf);

  // --- Hinge spine: a half-round titanium cover that turns half as far as the
  // left half, so it sits behind the open phone and forms the shut phone's left edge.
  const spine = new Mesh(new CylinderGeometry(T, T, H - SPINE_CORNER, 40, 1, false, Math.PI / 2, Math.PI), hinge);
  root.add(spine);

  return { root, leftHalf, spine, cover, innerLeft, innerRight, screens: { cover: coverScreen, inner: innerScreen } };
}

const _n = new Vector3();
const _q = new Quaternion();
const _p = new Vector3();
const _toCam = new Vector3();
const _corner = new Vector3();

function facingAmount(mesh: Mesh, cameraPos: Vector3) {
  _n.set(0, 0, 1).applyQuaternion(mesh.getWorldQuaternion(_q));
  _toCam.copy(cameraPos).sub(mesh.getWorldPosition(_p)).normalize();
  return _n.dot(_toCam);
}

/**
 * The foldable. `fold` (0 shut, 1 open flat) is written each frame by
 * PhoneRig, which owns the timing; this component only poses and paints it.
 */
export function FoldPhoneModel({ fold }: { fold: RefObject<number> }) {
  const reducedMotion = useReducedMotion();
  const parts = useMemo(() => buildFoldPhone(), []);
  // Posed every frame through a ref: R3F mutates the scene graph outside render.
  const partsRef = useRef<FoldParts | null>(null);
  const coverTexRef = useRef<ScreenTexture | null>(null);
  const innerTexRef = useRef<ScreenTexture | null>(null);

  useEffect(() => {
    const cover = new ScreenTexture(reducedMotion, COVER_H / COVER_W, 'cover');
    const inner = new ScreenTexture(reducedMotion, INNER_H / INNER_W, 'inner');
    coverTexRef.current = cover;
    innerTexRef.current = inner;
    return () => {
      cover.destroy();
      inner.destroy();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const { root } = parts;
    partsRef.current = parts;
    return () => {
      partsRef.current = null;
      const materials = new Set<Material>();
      root.traverse((node) => {
        if (node instanceof Mesh) {
          node.geometry.dispose();
          (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) => materials.add(m));
        }
      });
      // Shared materials: dispose each once. Screen maps belong to ScreenTexture.
      materials.forEach((m) => m.dispose());
    };
  }, [parts]);

  useFrame((state, delta) => {
    const posed = partsRef.current;
    if (!posed) return;
    const { root, leftHalf, spine, cover, innerLeft, innerRight, screens } = posed;
    const f = MathUtils.clamp(fold.current ?? 1, 0, 1);
    const phi = (1 - f) * Math.PI;

    leftHalf.rotation.y = phi;
    spine.rotation.y = phi / 2;
    // Keep the visible body centred on the rig's origin as it opens.
    const centreX = phi <= Math.PI / 2 ? (HALF_W / 2) * (1 - Math.cos(phi)) : HALF_W / 2;
    root.position.x = -centreX;
    root.position.z = (T / 2) * f;

    const coverTex = coverTexRef.current;
    const innerTex = innerTexRef.current;
    if (!coverTex || !innerTex) return;
    // ScreenTexture is recreated when its effect re-runs (dev double effects,
    // reduced-motion changes); keep the materials on the live canvases.
    if (screens.cover.map !== coverTex.texture) {
      screens.cover.map = coverTex.texture;
      screens.cover.needsUpdate = true;
    }
    if (screens.inner.map !== innerTex.texture) {
      screens.inner.map = innerTex.texture;
      screens.inner.needsUpdate = true;
    }

    const cam = state.camera;
    // The cover screen is hidden once the phone is open; the inner one while shut.
    const coverFacing = f < 0.97 ? facingAmount(cover, cam.position) : -1;
    const innerFacing = f > 0.04 ? Math.max(facingAmount(innerRight, cam.position), facingAmount(innerLeft, cam.position)) : -1;
    coverTex.setFacing(coverFacing > 0.15);
    innerTex.setFacing(innerFacing > 0.15);

    const k = Math.min(1, 8 * delta);
    const coverLevel = MathUtils.lerp(0.15, 0.95, MathUtils.clamp(coverFacing, 0, 1));
    const innerLevel = MathUtils.lerp(0.15, 0.95, MathUtils.clamp(innerFacing, 0, 1));
    screens.cover.color.setScalar(MathUtils.lerp(screens.cover.color.r, coverLevel, k));
    screens.inner.color.setScalar(MathUtils.lerp(screens.inner.color.r, innerLevel, k));

    // During the finale, publish where the display sits on screen so the DOM
    // portal can open exactly from it (the inner screen once it has opened).
    if (stageState.finale.active) {
      const displays = f > 0.5 ? [innerLeft, innerRight] : [cover];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const mesh of displays) {
        const geo = mesh.geometry as BufferGeometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox!;
        mesh.updateWorldMatrix(true, false);
        for (const cx of [bb.min.x, bb.max.x]) {
          for (const cy of [bb.min.y, bb.max.y]) {
            _corner.set(cx, cy, 0).applyMatrix4(mesh.matrixWorld).project(cam);
            const px = ((_corner.x + 1) / 2) * state.size.width;
            const py = ((1 - _corner.y) / 2) * state.size.height;
            minX = Math.min(minX, px); maxX = Math.max(maxX, px);
            minY = Math.min(minY, py); maxY = Math.max(maxY, py);
          }
        }
      }
      const r = stageState.screenRect;
      r.x = minX; r.y = minY; r.w = maxX - minX; r.h = maxY - minY; r.valid = r.w > 10 && r.h > 10;
    }
  });

  return <primitive object={parts.root} />;
}
