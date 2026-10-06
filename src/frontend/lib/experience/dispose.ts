import { Object3D, Mesh, Material, Texture } from 'three';

/**
 * Deep disposes of all geometries, materials, and textures in a Three.js object tree.
 */
export function disposeNode(node: Object3D) {
  if (node instanceof Mesh) {
    if (node.geometry) {
      node.geometry.dispose();
    }
    
    if (node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        disposeMaterial(material);
      }
    }
  }
}

function disposeMaterial(material: Material) {
  // Dispose textures attached to material properties
  for (const key of Object.keys(material)) {
    const value = (material as unknown as Record<string, unknown>)[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      (value as unknown as Texture).dispose();
    }
  }
  material.dispose();
}
