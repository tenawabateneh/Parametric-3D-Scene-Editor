import * as THREE from 'three';

export class Camera {
  public instance: THREE.PerspectiveCamera;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    this.instance = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    this.instance.position.set(5, 5, 5);
    this.instance.lookAt(0, 0, 0);
  }

  public resize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.instance.aspect = width / height;
    this.instance.updateProjectionMatrix();
  }
}


