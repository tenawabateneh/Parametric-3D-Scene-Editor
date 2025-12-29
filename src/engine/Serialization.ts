import * as THREE from 'three';
import type { SceneState, SceneObjectData } from './SceneState';

export class Serialization {

  static export(scene: THREE.Scene): SceneState {
    const objects: SceneObjectData[] = [];

    scene.children.forEach(child => {
      if (child.userData.isPrimitiveRoot && child instanceof THREE.Group) {
        objects.push({
          uuid: child.userData.id,
          type: child.userData.type,
          position: child.position.toArray() as [number, number, number],
          rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
          scale: child.scale.toArray() as [number, number, number]
        });
      }
    });

    return { objects };
  }
}


