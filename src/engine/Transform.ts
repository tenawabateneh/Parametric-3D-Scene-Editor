import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Disposal } from './Disposal';

export class Transform {
  public controls!: TransformControls;
  public onTransformChange: () => void = () => { };
  public onDraggingChanged: (active: boolean) => void = () => { };

  private camera: THREE.Camera;
  private canvas: HTMLElement;
  private scene: THREE.Scene;

  constructor(camera: THREE.Camera, canvas: HTMLElement, scene: THREE.Scene) {
    this.camera = camera;
    this.canvas = canvas;
    this.scene = scene;
    this.reinit();
  }

  public reinit() {
    this.controls = new TransformControls(this.camera, this.canvas);

    this.controls.addEventListener('change', () => {
      this.onTransformChange();
    });

    this.controls.addEventListener('dragging-changed', (event) => {
      this.onDraggingChanged(!!event.value);
    });

    this.scene.add(this.controls as unknown as THREE.Object3D);
  }

  public attach(object: THREE.Object3D) {
    this.controls.attach(object);
  }

  public detach() {
    this.controls.detach();
  }

  public dispose() {
    if (this.controls) {
      Disposal.disposeControls(this.controls);
    }
  }
}


