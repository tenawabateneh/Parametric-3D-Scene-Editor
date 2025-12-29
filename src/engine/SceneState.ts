
export interface SceneObjectData {
  uuid: string;
  type: 'Box' | 'Sphere' | 'Cylinder';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SceneState {
  objects: SceneObjectData[];
}


