import * as THREE from 'three';
import { ResourcePool } from './Resources';

export class Edges {
  static create(geometry: THREE.BufferGeometry): THREE.LineSegments {

    const type = (geometry as any).type || 'default';
    const edgeGeometry = ResourcePool.getEdgeGeometry(type, geometry);

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edges.renderOrder = 1;

    return edges;
  }

  static setHover(edges: THREE.LineSegments, hover: boolean) {
    const mat = edges.material as THREE.LineBasicMaterial;
    if (hover) {
      mat.color.setHex(0xffaa00);
    } else {
      mat.color.setHex(0xffffff);
    }
  }
}


