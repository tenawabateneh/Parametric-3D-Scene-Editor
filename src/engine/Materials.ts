import * as THREE from 'three';

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  uniform vec3 uLightPosition;
  uniform vec3 uBaseColor;
  uniform float uHover;
  uniform float uSelected;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 lightDir = normalize(uLightPosition - vWorldPosition);
    float diffuse = max(dot(vNormal, lightDir), 0.0);

    vec3 color = uBaseColor * (0.2 + 0.8 * diffuse);

    color += uHover * vec3(0.15);

    if (uSelected > 0.5) {
      color = mix(color, vec3(1.0, 0.8, 0.3), 0.35);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class FaceMaterial extends THREE.ShaderMaterial {
  constructor(color: THREE.Color) {
    super({
      uniforms: {
        uBaseColor: { value: color },
        uLightPosition: { value: new THREE.Vector3(10, 10, 10) },
        uSelected: { value: 0.0 },
        uHover: { value: 0.0 }
      },
      vertexShader,
      fragmentShader,
      transparent: false,

      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });
  }

  public setHovered(hovered: boolean) {
    this.uniforms.uHover.value = hovered ? 1.0 : 0.0;
  }

  public setSelected(selected: boolean) {
    this.uniforms.uSelected.value = selected ? 1.0 : 0.0;
  }

  public setLightPos(pos: THREE.Vector3) {
    this.uniforms.uLightPosition.value.copy(pos);
  }
}


