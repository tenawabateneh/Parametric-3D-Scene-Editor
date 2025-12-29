import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { Transform } from './Transform';
import { FaceMaterial } from './Materials';
import { Edges } from './Edges';

export class Interaction {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.Camera;
  private canvas: HTMLElement;
  private sceneManager: SceneManager;
  private transform: Transform;

  private hoveredObject: THREE.Group | null = null;
  private selectedObject: THREE.Group | null = null;

  public onObjectSelected: (data: { id: string; type: string; position: number[] } | null) => void = () => { };

  constructor(
    camera: THREE.Camera,
    canvas: HTMLElement,
    sceneManager: SceneManager,
    transform: Transform
  ) {
    this.camera = camera;
    this.canvas = canvas;
    this.sceneManager = sceneManager;
    this.transform = transform;

    this.raycaster = new THREE.Raycaster();

    this.raycaster.params.Line!.threshold = 0.1;

    this.mouse = new THREE.Vector2();

    this.canvas.addEventListener('mousemove', this.onMouseMove, { passive: true });
    this.canvas.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKeyDown);
  }

  private moveRequested = false;

  private onMouseMove = (event: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    if (!this.moveRequested) {
      this.moveRequested = true;
      requestAnimationFrame(this.processMouseMove);
    }
  };

  private processMouseMove = () => {
    this.moveRequested = false;
    this.checkHover();
  };

  private onClick = () => {
    if (this.hoveredObject) {
      this.selectObject(this.hoveredObject);
    } else {
      this.selectObject(null);
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.selectedObject) {
        const id = this.selectedObject.userData.id;
        this.selectObject(null);
        this.sceneManager.removeObject(id);

      }
    }
  }

  private checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const interactables = this.sceneManager.getInteractableMeshes();
    const intersects = this.raycaster.intersectObjects(interactables, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const root = hit.userData.parentRoot as THREE.Group;

      if (root && root !== this.hoveredObject) {
        if (this.hoveredObject) this.setHoverState(this.hoveredObject, false);
        this.hoveredObject = root;
        this.setHoverState(this.hoveredObject, true);
        this.canvas.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredObject) {
        this.setHoverState(this.hoveredObject, false);
        this.hoveredObject = null;
        this.canvas.style.cursor = 'default';
      }
    }
  }

  private setHoverState(object: THREE.Group, hovering: boolean) {

    const edges = object.children.find(c => c instanceof THREE.LineSegments) as THREE.LineSegments;
    if (edges) {
      Edges.setHover(edges, hovering);
    }

    const mesh = object.children.find(c => c instanceof THREE.Mesh) as THREE.Mesh;
    if (mesh && mesh.material instanceof FaceMaterial) {
      mesh.material.setHovered(hovering);
    }
  }

  private setSelectionState(object: THREE.Group, selected: boolean) {
    const mesh = object.children.find(c => c instanceof THREE.Mesh) as THREE.Mesh;
    if (mesh && mesh.material instanceof FaceMaterial) {
      mesh.material.setSelected(selected);
    }
  }

  public selectObject(object: THREE.Group | null) {
    if (this.selectedObject === object) return;

    if (this.selectedObject) {
      this.setSelectionState(this.selectedObject, false);

      this.transform.dispose();
    }

    this.selectedObject = object;

    if (this.selectedObject) {

      this.transform.reinit();
      this.setSelectionState(this.selectedObject, true);
      this.transform.attach(this.selectedObject);

      this.onObjectSelected({
        id: this.selectedObject.userData.id,
        type: this.selectedObject.userData.type,
        position: this.selectedObject.position.toArray()
      });
    } else {
      this.onObjectSelected(null);
    }
  }

  public dispose() {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    this.transform.dispose();
  }
}


