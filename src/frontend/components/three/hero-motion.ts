export type HeroMotionState = {
  // scroll-driven targets, tweened by GSAP in TinkerScrollHero
  rotX: number;
  rotY: number;
  // raw mouse targets, written un-lerped on pointermove
  mxT: number;
  myT: number;
  // smoothed mouse values, owned by PhoneModel's useFrame
  mx: number;
  my: number;
};

export function createHeroMotionState(): HeroMotionState {
  return { rotX: 0.15, rotY: -0.4, mxT: 0, myT: 0, mx: 0, my: 0 };
}
