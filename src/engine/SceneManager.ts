import * as THREE from 'three';
import { Primitives } from './Primitives';
import type { PrimitiveType } from './Primitives';
import { FaceMaterial } from './Materials';
import { Disposal } from './Disposal';
import { Serialization } from './Serialization';
import type { SceneState } from './SceneState';
import { ResourcePool } from './Resources';

export class SceneManager {
  public scene: THREE.Scene;

  private interactables: THREE.Mesh[] = [];

  private _directionalLightPosition: THREE.Vector3 = new THREE.Vector3(10, 10, 10);

  constructor() {
    this.scene = new THREE.Scene();
    this.setupLighting();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.copy(this._directionalLightPosition);
    this.scene.add(dirLight);
  }

  public addPrimitive(type: PrimitiveType) {
    const { root, mesh } = Primitives.createPrimitive(type);

    if (mesh.material instanceof FaceMaterial) {
      mesh.material.setLightPos(this._directionalLightPosition);
    }

    this.scene.add(root);
    this.interactables.push(mesh);
    return root;
  }

  public removeObject(id: string) {
    const object = this.findObjectById(id);
    if (object) {

      Disposal.disposeObject(object);

      const mesh = object.children.find(c => c instanceof THREE.Mesh) as THREE.Mesh;
      if (mesh) {
        const index = this.interactables.indexOf(mesh);
        if (index > -1) this.interactables.splice(index, 1);
      }
    }
  }

  public clear() {

    const toRemove: THREE.Object3D[] = [];
    this.scene.children.forEach(child => {
      if (child.userData.isPrimitiveRoot) {
        toRemove.push(child);
      }
    });

    toRemove.forEach(obj => {

      Disposal.disposeObject(obj);
    });

    ResourcePool.purge();

    this.interactables = [];
  }

  public findObjectById(id: string): THREE.Group | undefined {
    return this.scene.children.find(c => c.userData.id === id) as THREE.Group;
  }

  public getInteractableMeshes(): THREE.Mesh[] {
    return this.interactables;
  }

  public exportState(): SceneState {
    return Serialization.export(this.scene);
  }

  public loadState(state: SceneState) {
    this.clear();
    state.objects.forEach(data => {
      const { root, mesh } = Primitives.createPrimitive(data.type, data.uuid);
      root.position.fromArray(data.position);
      root.rotation.fromArray(data.rotation);
      root.scale.fromArray(data.scale);

      if (mesh.material instanceof FaceMaterial) {
        mesh.material.setLightPos(this._directionalLightPosition);
      }

      this.scene.add(root);
      this.interactables.push(mesh);
    });
  }

  public dispose() {
    Disposal.disposeScene(this.scene);
    this.scene.clear();
    ResourcePool.purge();
  }
}


