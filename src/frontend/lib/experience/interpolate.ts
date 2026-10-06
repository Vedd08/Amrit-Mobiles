import { MathUtils, Color, Vector3 } from "three";
import { keyframes, Beat, EASE, chooserOrbit } from "./keyframes";
import { stageState } from "./stageState";

function rotateAboutY(v: Vector3, cx: number, cz: number, c: number, s: number) {
  const dx = v.x - cx, dz = v.z - cz;
  v.x = cx + dx * c + dz * s;
  v.z = cz - dx * s + dz * c;
}

// 1D Cubic Bezier for y given x
function cubicBezierY(t: number, [x1, y1, x2, y2]: readonly [number, number, number, number]): number {
  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(x - t) < 0.001 || dx === 0) break;
    u -= (x - t) / dx;
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
}

const colorFrom = new Color();
const colorTo = new Color();

const prevCamPos = new Vector3();
const currCamPos = new Vector3();
const prevCamLook = new Vector3();
const currCamLook = new Vector3();
const prevPhonePos = new Vector3();
const currPhonePos = new Vector3();

export function resolveKeyframes(progress: number) {
  if (progress <= 0) progress = 0;
  if (progress >= 1) progress = 1;

  let currentBeat: Beat = keyframes[0];
  let prevBeat: Beat = keyframes[0];
  let localP = 0;
  let inGap = false;

  let matchedIndex = -1;
  for (let i = 0; i < keyframes.length; i++) {
    const k = keyframes[i];
    if (progress >= k.at[0] && progress <= k.at[1]) {
      matchedIndex = i;
      currentBeat = k;
      prevBeat = i > 0 ? keyframes[i - 1] : k;
      const range = k.at[1] - k.at[0];
      localP = range > 0 ? (progress - k.at[0]) / range : 1;
      break;
    }
  }

  if (matchedIndex === -1) {
    let lastBeatIndex = -1;
    for (let i = keyframes.length - 1; i >= 0; i--) {
      if (keyframes[i].at[0] <= progress) {
        lastBeatIndex = i;
        break;
      }
    }
    if (lastBeatIndex !== -1 && progress > keyframes[lastBeatIndex].at[1]) {
      currentBeat = keyframes[lastBeatIndex];
      prevBeat = keyframes[lastBeatIndex];
      localP = 1;
      inGap = true;
    }
  }

  stageState.beatId = currentBeat.id;

  const easeCurve = EASE[currentBeat.ease] || EASE.cinematic;
  const easedP = (inGap || prevBeat === currentBeat) ? 1 : cubicBezierY(localP, easeCurve);

  // Interpolate camera
  prevCamPos.set(...prevBeat.camera.pos);
  currCamPos.set(...currentBeat.camera.pos);
  stageState.camera.pos.lerpVectors(prevCamPos, currCamPos, easedP);
  
  prevCamLook.set(...prevBeat.camera.lookAt);
  currCamLook.set(...currentBeat.camera.lookAt);
  stageState.camera.lookAt.lerpVectors(prevCamLook, currCamLook, easedP);
  
  stageState.camera.fov = MathUtils.lerp(prevBeat.camera.fov, currentBeat.camera.fov, easedP);

  // Interpolate phone
  prevPhonePos.set(...prevBeat.phone.pos);
  currPhonePos.set(...currentBeat.phone.pos);
  stageState.phone.pos.lerpVectors(prevPhonePos, currPhonePos, easedP);
  
  stageState.phone.rot.set(
    MathUtils.lerp(prevBeat.phone.rot[0], currentBeat.phone.rot[0], easedP),
    MathUtils.lerp(prevBeat.phone.rot[1], currentBeat.phone.rot[1], easedP),
    MathUtils.lerp(prevBeat.phone.rot[2], currentBeat.phone.rot[2], easedP)
  );
  stageState.phone.scale = MathUtils.lerp(prevBeat.phone.scale, currentBeat.phone.scale, easedP);

  // Tier-aware post-interpolation phone offset
  if (stageState.tier === 'mobile') {
    stageState.phone.pos.x = 0;
    stageState.camera.pos.x = 0;
    stageState.camera.lookAt.x = 0;
    stageState.phone.pos.y += 0.35;
    stageState.phone.scale *= 0.80;
  } else if (stageState.tier === 'tablet') {
    stageState.phone.pos.x = 0;
    stageState.camera.pos.x = 0;
    stageState.camera.lookAt.x = 0;
    stageState.phone.pos.y += 0.25;
    stageState.phone.scale *= 0.92;
  }

  // Rigid Chooser Orbit (camera pos and lookAt rotate together around phone pos)
  const orbitMax = stageState.tier === 'desktop' ? -0.62
                 : stageState.tier === 'tablet'  ? -0.30 : 0;
  const [o0, o1] = chooserOrbit;
  if (orbitMax !== 0 && progress > o0 && progress < o1) {
    const t = (progress - o0) / (o1 - o0);
    const a = orbitMax * Math.sin(t * Math.PI);   // angle 0 → max → 0
    const c = Math.cos(a), s = Math.sin(a);
    const { x: cx, z: cz } = stageState.phone.pos;
    rotateAboutY(stageState.camera.pos,    cx, cz, c, s);
    rotateAboutY(stageState.camera.lookAt, cx, cz, c, s);
  }

  // Headroom: Dolly camera back along view direction for mobile and tablet AFTER orbit
  if (stageState.tier !== 'desktop') {
    const pos = stageState.camera.pos;
    const lookAt = stageState.camera.lookAt;
    pos.set(
      lookAt.x + (pos.x - lookAt.x) * 1.3,
      lookAt.y + (pos.y - lookAt.y) * 1.3,
      lookAt.z + (pos.z - lookAt.z) * 1.3
    );
  }

  // Interpolate lights
  stageState.light.key = MathUtils.lerp(prevBeat.light.key, currentBeat.light.key, easedP);
  stageState.light.rim = MathUtils.lerp(prevBeat.light.rim, currentBeat.light.rim, easedP);
  
  colorFrom.set(prevBeat.light.rimColor);
  colorTo.set(currentBeat.light.rimColor);
  stageState.light.rimColor.lerpColors(colorFrom, colorTo, easedP);

  // Interpolate background
  colorFrom.set(prevBeat.bg[0]); 
  colorTo.set(currentBeat.bg[0]);
  stageState.bg.from.lerpColors(colorFrom, colorTo, easedP);
  
  colorFrom.set(prevBeat.bg[1]); 
  colorTo.set(currentBeat.bg[1]);
  stageState.bg.to.lerpColors(colorFrom, colorTo, easedP);
}
