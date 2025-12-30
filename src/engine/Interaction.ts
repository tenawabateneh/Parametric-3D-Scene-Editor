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
  private _rotationMode: boolean = false;
  private _scaleMode: boolean = false;

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
    if (!this.selectedObject) return;

    // Delete selected object
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const id = this.selectedObject.userData.id;
      this.selectObject(null);
      this.sceneManager.removeObject(id);
      return;
    }

    const moveStep = 0.1;
    const rotateStep = Math.PI / 4; // 45 degrees

    // Enable rotation mode when 'r' is pressed
    if (event.key === 'r') {
      this._rotationMode = true;
      return;
    }
    // Enable scale mode when 's' is pressed
    if (event.key === 's') {
      this._scaleMode = true;
      return;
    }

    // Rotation controls: r + arrow
    if (this._rotationMode) {
      if (event.key === 'ArrowLeft') {
        this.selectedObject.rotation.y += rotateStep;
        this.transform.onTransformChange();
      } else if (event.key === 'ArrowRight') {
        this.selectedObject.rotation.y -= rotateStep;
        this.transform.onTransformChange();
      } else if (event.key === 'ArrowUp') {
        this.selectedObject.rotation.x += rotateStep;
        this.transform.onTransformChange();
      } else if (event.key === 'ArrowDown') {
        this.selectedObject.rotation.x -= rotateStep;
        this.transform.onTransformChange();
      }
      this._rotationMode = false;
      return;
    }

    // Scale controls: s + up/down arrow
    if (this._scaleMode) {
      const scaleStep = 0.1;
      if (event.key === 'ArrowUp') {
        this.selectedObject.scale.multiplyScalar(1 + scaleStep);
        this.transform.onTransformChange();
      } else if (event.key === 'ArrowDown') {
        this.selectedObject.scale.multiplyScalar(1 - scaleStep);
        this.transform.onTransformChange();
      }
      this._scaleMode = false;
      return;
    }

    // Move controls
    if (event.key === 'ArrowUp') {
      this.selectedObject.position.y += moveStep;
      this.transform.onTransformChange();
    } else if (event.key === 'ArrowDown') {
      this.selectedObject.position.y -= moveStep;
      this.transform.onTransformChange();
    } else if (event.key === 'ArrowLeft') {
      this.selectedObject.position.x -= moveStep;
      this.transform.onTransformChange();
    } else if (event.key === 'ArrowRight') {
      this.selectedObject.position.x += moveStep;
      this.transform.onTransformChange();
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


