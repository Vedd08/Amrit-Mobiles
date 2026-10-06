'use client';

import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3, PerspectiveCamera } from 'three';
import { stageState } from '@/frontend/lib/experience/stageState';
import { DAMP } from '@/frontend/lib/experience/keyframes';

const targetPos = new Vector3();
const currentLookAt = new Vector3();

export function CameraRig() {
  // The camera comes off the per-frame state rather than useThree(), because
  // react-hooks/immutability forbids mutating a hook's return value — and this
  // rig exists precisely to mutate the camera every frame.
  useFrame(({ camera }, delta) => {
    if (stageState.finale.active) {
      // Scroll-locked and exact: the DOM dive starts on the projected screen.
      camera.position.copy(stageState.camera.pos);
      currentLookAt.copy(stageState.camera.lookAt);
      camera.lookAt(currentLookAt);
      if (camera instanceof PerspectiveCamera) {
        camera.fov = stageState.camera.fov;
        camera.updateProjectionMatrix();
      }
      return;
    }

    targetPos.copy(stageState.camera.pos).add(stageState.mouseOffset);

    camera.position.x = MathUtils.damp(camera.position.x, targetPos.x, DAMP.camera, delta);
    camera.position.y = MathUtils.damp(camera.position.y, targetPos.y, DAMP.camera, delta);
    camera.position.z = MathUtils.damp(camera.position.z, targetPos.z, DAMP.camera, delta);

    currentLookAt.x = MathUtils.damp(currentLookAt.x, stageState.camera.lookAt.x, DAMP.camera, delta);
    currentLookAt.y = MathUtils.damp(currentLookAt.y, stageState.camera.lookAt.y, DAMP.camera, delta);
    currentLookAt.z = MathUtils.damp(currentLookAt.z, stageState.camera.lookAt.z, DAMP.camera, delta);
    
    camera.lookAt(currentLookAt);

    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.damp(camera.fov, stageState.camera.fov, DAMP.camera, delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
