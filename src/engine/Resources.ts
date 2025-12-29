import * as THREE from 'three';

class ResourceTracker {
  private refs = new Map<any, number>();

  public acquire<T extends { dispose?: () => void }>(resource: T): T {
    if (!resource) return resource;
    const count = this.refs.get(resource) || 0;
    this.refs.set(resource, count + 1);
    return resource;
  }

  public release(resource: any) {
    if (!resource) return;

    const count = this.refs.get(resource);
    if (count === undefined) {
      this.deepDispose(resource);
      return;
    }

    const newCount = count - 1;
    if (newCount <= 0) {
      this.deepDispose(resource);
      this.refs.delete(resource);
    } else {
      this.refs.set(resource, newCount);
    }
  }

  private deepDispose(resource: any) {
    if (!resource || typeof resource.dispose !== 'function') return;

    if (resource instanceof THREE.Material) {
      this.disposeMaterialTextures(resource);
    }

    resource.dispose();
  }

  private disposeMaterialTextures(material: THREE.Material) {

    for (const key of Object.keys(material)) {
      const value = (material as any)[key];
      if (value && value.isTexture) {
        value.dispose();
      }
    }

    const uniforms = (material as any).uniforms;
    if (uniforms) {
      for (const key of Object.keys(uniforms)) {
        const u = uniforms[key];
        if (u && u.value && u.value.isTexture) {
          u.value.dispose();
        }
      }
    }
  }
}

export const resources = new ResourceTracker();

export class ResourcePool {
  private static geometries = new Map<string, THREE.BufferGeometry>();
  private static edgeGeometries = new Map<string, THREE.EdgesGeometry>();

  static getGeometry(type: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (!this.geometries.has(type)) {
      this.geometries.set(type, resources.acquire(factory()));
    }
    const geo = this.geometries.get(type)!;
    resources.acquire(geo);
    return geo;
  }

  static getEdgeGeometry(type: string, geometry: THREE.BufferGeometry): THREE.EdgesGeometry {
    if (!this.edgeGeometries.has(type)) {
      this.edgeGeometries.set(type, resources.acquire(new THREE.EdgesGeometry(geometry)));
    }
    const edgeGeo = this.edgeGeometries.get(type)!;
    resources.acquire(edgeGeo);
    return edgeGeo;
  }

  static purge() {
    this.geometries.forEach(g => resources.release(g));
    this.edgeGeometries.forEach(eg => resources.release(eg));
    this.geometries.clear();
    this.edgeGeometries.clear();
  }
}


