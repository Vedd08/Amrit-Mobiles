import { Vector3, Euler, Color } from "three";
import type { StageTier } from "./useStageTier";

export const stageState = {
  beatId: 'hero',
  progress: 0,
  camera: { pos: new Vector3(0, 0, 3.2), lookAt: new Vector3(0, 0, 0), fov: 35 },
  phone:  { pos: new Vector3(0.8, 0, 0), rot: new Euler(0, -0.3, 0), scale: 1, opacity: 1 },
  light:  { key: 2.6, rim: 3.2, rimColor: new Color('#DDE4E8') },
  bg:     { from: new Color('#FFFFFF'), to: new Color('#F6F7F4') },
  // Additional runtime state for effects:
  mouseOffset: new Vector3(0, 0, 0),
  activeBrandIndex: 0,
  tier: 'desktop' as StageTier,
  canvasOpacity: 1,
  /** True once the 3D screen has painted its first photo wallpaper. Until then
   *  the static poster stays up and the canvas stays hidden (no black screen). */
  screenReady: false,
  /** Act07 drives the 3D phone directly (scroll-synced) during the finale. */
  finale: { active: false, y: 0, rotX: 0, rotY: 0, scale: 1 },
  /** On-screen rect of the 3D phone's display, in CSS px (written each frame
   *  during the finale) so the DOM "dive" can start exactly on it. */
  screenRect: { x: 0, y: 0, w: 0, h: 0, valid: false },
};
