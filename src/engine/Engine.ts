import { Renderer } from './Renderer';
import { Camera } from './Camera';
import { SceneManager } from './SceneManager';
import { Loop } from './Loop';
import { Interaction } from './Interaction';
import { Transform } from './Transform';
import type { PrimitiveType } from './Primitives';
import type { SceneState } from './SceneState';

export class Engine {
  public renderer: Renderer;
  public camera: Camera;
  public sceneManager: SceneManager;
  public loop: Loop;
  public interaction: Interaction;
  public transform: Transform;

  private currentSceneState: SceneState = { objects: [] };

  public onObjectSelect: (data: { id: string; type: string; position: number[] } | null) => void = () => { };
  public onSceneChange: () => void = () => { };

  constructor(container: HTMLElement) {
    this.renderer = new Renderer(container);
    this.camera = new Camera(container);
    this.sceneManager = new SceneManager();
    this.transform = new Transform(this.camera.instance, container, this.sceneManager.scene);
    this.interaction = new Interaction(
      this.camera.instance,
      container,
      this.sceneManager,
      this.transform
    );

    this.interaction.onObjectSelected = (data) => {
      this.onObjectSelect(data);
    };

    this.transform.onTransformChange = () => {
      const obj = this.transform.controls.object;
      if (obj) {
        const editorId = obj.userData.id;
        const data = this.currentSceneState.objects.find(o => o.uuid === editorId);

        if (data) {
          data.position = obj.position.toArray() as [number, number, number];
          data.rotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z] as [number, number, number];
          data.scale = obj.scale.toArray() as [number, number, number];
        }
      }

      this.onSceneChange();
    };

    this.loop = new Loop(this.renderer.instance, this.sceneManager.scene, this.camera.instance);

    this.loop.start();

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.renderer.resize();
    this.camera.resize();
  }

  public addPrimitive(type: PrimitiveType) {
    const root = this.sceneManager.addPrimitive(type);

    const data = {
      uuid: root.userData.id,
      type: type,
      position: root.position.toArray() as [number, number, number],
      rotation: [root.rotation.x, root.rotation.y, root.rotation.z] as [number, number, number],
      scale: root.scale.toArray() as [number, number, number]
    };

    this.currentSceneState.objects.push(data);

    this.onSceneChange();
  }

  public removeObject(id: string) {
    this.interaction.selectObject(null);

    this.currentSceneState.objects = this.currentSceneState.objects.filter(o => o.uuid !== id);

    this.sceneManager.removeObject(id);
    this.onSceneChange();
  }

  public clear() {
    this.interaction.selectObject(null);

    this.currentSceneState.objects = [];

    this.sceneManager.clear();
    this.onSceneChange();
  }

  public loadState(state: SceneState) {
    this.interaction.selectObject(null);
    this.sceneManager.loadState(state);
    this.currentSceneState = state;
  }

  public exportState(): SceneState {
    this.currentSceneState = this.sceneManager.exportState();
    return this.currentSceneState;
  }

  public getRendererInfo() {
    return this.renderer.getInfo();
  }

  public async runLeakTest(iterations = 200, delayMs = 20) {
    const snapshots = [];

    for (let i = 0; i < iterations; i++) {
      const root = this.sceneManager.addPrimitive('Box');
      await new Promise(r => setTimeout(r, delayMs));

      this.sceneManager.removeObject(root.userData.id);
      await new Promise(r => setTimeout(r, delayMs));

      snapshots.push({
        i,
        ...this.renderer.getInfo()
      });
    }

    return { snapshots, final: this.renderer.getInfo() };
  }

  public async testClear(count = 10, delayMs = 20) {
    for (let i = 0; i < count; i++) {
      this.sceneManager.addPrimitive('Box');
    }
    await new Promise(r => setTimeout(r, delayMs));
    const before = this.renderer.getInfo();

    this.clear();
    await new Promise(r => setTimeout(r, delayMs));
    const after = this.renderer.getInfo();

    return { before, after, added: count };
  }

  public dispose() {
    this.loop.stop();
    window.removeEventListener('resize', this.onResize);

    this.interaction.dispose();
    this.transform.dispose();
    this.sceneManager.dispose();
    this.renderer.dispose();
  }
}


