import * as THREE from 'three';

export class Loop {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }

  public start() {
    this.renderer.setAnimationLoop(this.animate);
  }

  public stop() {
    this.renderer.setAnimationLoop(null);
  }

  private animate = () => {

    this.renderer.render(this.scene, this.camera);
  }
}


