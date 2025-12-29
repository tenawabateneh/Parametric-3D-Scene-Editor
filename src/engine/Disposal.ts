import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { resources } from './Resources';

export function disposeObject3D_Shared(object: THREE.Object3D) {
  object.traverse((child) => {
    if ((child as any).geometry) {
      resources.release((child as any).geometry);
    }

    if ((child as any).material) {
      const mat = (child as any).material;
      if (Array.isArray(mat)) {
        mat.forEach(m => resources.release(m));
      } else {
        resources.release(mat);
      }
    }
  });
}

export class Disposal {
  static disposeObject(object: THREE.Object3D) {
    disposeObject3D_Shared(object);
    if (object.parent) {
      object.parent.remove(object);
    }
  }

  static disposeScene(scene: THREE.Scene) {
    while (scene.children.length > 0) {
      const child = scene.children[0];
      this.disposeObject(child);
    }
  }

  static disposeRenderer(renderer: THREE.WebGLRenderer) {
    renderer.dispose();

    const extension = renderer.getContext().getExtension('WEBGL_lose_context');
    if (extension) {
      extension.loseContext();
    }

    if (renderer.domElement && renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  }

  static disposeControls(controls: TransformControls) {
    controls.dispose();
    if ((controls as unknown as THREE.Object3D).parent) {
      (controls as unknown as THREE.Object3D).parent?.remove(controls as unknown as THREE.Object3D);
    }
  }
}


