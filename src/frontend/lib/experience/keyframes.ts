export const EASE = {
  cinematic: [0.22, 1, 0.36, 1],
  entry:     [0.16, 1, 0.3, 1],
  exit:      [0.7, 0, 0.84, 0],
} as const;

export const DAMP = {
  camera: 3.2,
  phone:  4.0,
  light:  2.4,
} as const;

export type Beat = {
  id: string;
  at: [number, number];
  camera: { pos: [number, number, number]; lookAt: [number, number, number]; fov: number };
  /** fold: 0 = shut (cover screen), 1 = opened flat. */
  phone:  { pos: [number, number, number]; rot: [number, number, number]; scale: number; fold: number };
  light:  { key: number; rim: number; rimColor: string };
  bg:     [string, string];
  ease:   keyof typeof EASE;
};

export const chooserOrbit: [number, number] = [0.64, 0.80];

export type ActId = 'hero' | 'brands' | 'why' | 'chooser' | 'trending' | 'stores' | 'final';

export type ActBounds = { enter: number; pinStart: number; pinEnd: number; settle: number; mid: number; exit: number };
export const actBounds: Partial<Record<ActId, ActBounds>> = {};


const LIGHT_BG: [string, string] = ["#FFFFFF", "#F6F7F4"];
const STEEL = "#DDE4E8";

export const keyframes: Beat[] = [
  {
    id: "hero",
    at: [0.00, 0.15],
    camera: { pos: [0, 0, 3.20], lookAt: [0, 0, 0], fov: 35 },
    phone:  { pos: [0.8, 0, 0], rot: [0, -0.3, 0], scale: 0.88, fold: 0.92 },
    light:  { key: 2.6, rim: 3.2, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  },
  {
    id: "hero-out",
    at: [0.15, 0.20],
    camera: { pos: [0, 0, 2.62], lookAt: [0, -0.05, 0], fov: 34 },
    phone:  { pos: [0.8, -0.05, 0], rot: [0.04, -0.3, 0], scale: 0.9, fold: 0.92 },
    light:  { key: 2.8, rim: 3.4, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  },
  {
    id: "brands-in",
    at: [0.20, 0.25],
    camera: { pos: [0, 0, 3.05], lookAt: [0, 0, 0], fov: 35 },
    phone:  { pos: [0.8, 0, 0], rot: [0, -0.3, 0], scale: 0.9, fold: 1 },
    light:  { key: 2.5, rim: 3.6, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  },
  {
    id: "brand-cycle",
    at: [0.25, 0.40],
    camera: { pos: [0, 0.05, 2.95], lookAt: [0, 0, 0], fov: 35 },
    phone:  { pos: [0.8, 0, 0], rot: [0, 0.3, 0], scale: 0.9, fold: 1 },
    light:  { key: 2.7, rim: 4.0, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  },
  {
    id: "why",
    at: [0.40, 0.60],
    camera: { pos: [0, 0.04, 2.85], lookAt: [0, -0.02, 0], fov: 37 },
    // Half open like a book, both panes angled toward you, hinge at the back.
    phone:  { pos: [0.86, -0.02, 0], rot: [0.06, -0.72, -0.03], scale: 0.96, fold: 0.55 },
    light:  { key: 2.2, rim: 3.8, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  },
  {
    id: "chooser",
    at: [0.60, 0.70],
    camera: { pos: [0, 0, 2.55], lookAt: [0, 0, 0], fov: 33 },
    phone:  { pos: [0.75, 0, 0], rot: [0, 0, 0], scale: 1.16, fold: 0 },
    light:  { key: 3.0, rim: 4.4, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  },
  {
    // The phone bows out while the New arrivals rail scrolls in (the canvas
    // fades over the start of this band, see ScrollDirector). It keeps facing
    // you and drifts up and back, out of the cards' way, instead of spinning
    // round: a half-faded phone turning its back read as a glitch.
    id: "trending",
    at: [0.70, 0.85],
    camera: { pos: [0, 0.02, 2.62], lookAt: [0, 0.02, 0], fov: 33 },
    phone:  { pos: [1.02, 0.5, -0.45], rot: [-0.1, 0.26, 0.04], scale: 1.02, fold: 0 },
    light:  { key: 2.8, rim: 4.2, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  },
  {
    // Hidden from Trending on (the finale brings the phone back itself), so it
    // just holds the exit pose: nothing can spin if it ever shows for a frame.
    id: "stores",
    at: [0.85, 0.95],
    camera: { pos: [0, 0.02, 2.62], lookAt: [0, 0.02, 0], fov: 33 },
    phone:  { pos: [1.02, 0.5, -0.45], rot: [-0.1, 0.26, 0.04], scale: 1.02, fold: 0 },
    light:  { key: 2.8, rim: 4.2, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  },
  {
    id: "final",
    at: [0.95, 1.00],
    camera: { pos: [0, 0, 2.42], lookAt: [0, 0, 0], fov: 32 },
    phone:  { pos: [0, 0, 0], rot: [0, 0, 0], scale: 1.06, fold: 0 },
    light:  { key: 3.4, rim: 5.0, rimColor: STEEL },
    bg:     LIGHT_BG,
    ease:   "cinematic"
  }
];

const TAU = Math.PI * 2;
const shortestDelta = (from: number, to: number) =>
  ((((to - from + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

for (let i = 1; i < keyframes.length; i++) {
  const prev = keyframes[i - 1].phone.rot[1];
  const beat = keyframes[i];
  beat.phone.rot[1] = prev + shortestDelta(prev, beat.phone.rot[1]);
}
