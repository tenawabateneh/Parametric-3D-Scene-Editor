import * as THREE from 'three';
import { Disposal } from './Disposal';

export class Renderer {
  public instance: THREE.WebGLRenderer;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    this.instance = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      precision: 'highp',
      stencil: false,
    });

    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(container.clientWidth, container.clientHeight);
    this.instance.setClearColor(0x1a1a1a);

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(this.instance.domElement);
  }

  public resize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.instance.setSize(width, height);
    this.instance.setPixelRatio(window.devicePixelRatio);
  }

  public getInfo() {
    return {
      memory: { ...this.instance.info.memory },
      render: { ...this.instance.info.render }
    };
  }

  public dispose() {
    Disposal.disposeRenderer(this.instance);
  }
}


