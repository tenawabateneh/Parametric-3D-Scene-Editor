import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { FaceMaterial } from './Materials';
import { Edges } from './Edges';
import { ResourcePool } from './Resources';

export type PrimitiveType = 'Box' | 'Sphere' | 'Cylinder';

export class Primitives {

  static createPrimitive(type: PrimitiveType, id?: string): { mesh: THREE.Mesh, edges: THREE.LineSegments, root: THREE.Group, metadata: { id: string, type: PrimitiveType } } {
    const generatedId = id ?? uuidv4();
    const root = new THREE.Group();

    let geometry: THREE.BufferGeometry;
    switch (type) {
      case 'Box':
        geometry = ResourcePool.getGeometry('Box', () => new THREE.BoxGeometry(1, 1, 1));
        break;
      case 'Sphere':
        geometry = ResourcePool.getGeometry('Sphere', () => new THREE.SphereGeometry(0.7, 32, 16));
        break;
      case 'Cylinder':
        geometry = ResourcePool.getGeometry('Cylinder', () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32));
        break;
      default:
        geometry = ResourcePool.getGeometry('Box', () => new THREE.BoxGeometry(1, 1, 1));
    }

    const material = new FaceMaterial(new THREE.Color(0x4488ff));

    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 0;
    root.add(mesh);

    const edges = Edges.create(geometry);
    root.add(edges);

    const metadata = {
      id: generatedId,
      type,
      isPrimitiveRoot: true
    };

    root.userData = metadata;

    mesh.userData = { parentRoot: root };

    return { mesh, edges, root, metadata: { id: generatedId, type } };
  }
}


