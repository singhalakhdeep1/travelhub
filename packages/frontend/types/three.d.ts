declare module 'three' {
  export class Scene {
    background: any;
    add(object: any): void;
    remove(object: any): void;
  }
  export class PerspectiveCamera {
    aspect: number;
    position: { set(x: number, y: number, z: number): void };
    updateProjectionMatrix(): void;
    constructor(fov: number, aspect: number, near: number, far: number);
  }
  export class WebGLRenderer {
    domElement: HTMLElement;
    shadowMap: { enabled: boolean };
    setSize(w: number, h: number): void;
    setPixelRatio(ratio: number): void;
    render(scene: any, camera: any): void;
    dispose(): void;
    constructor(params?: any);
  }
  export class Color {
    constructor(hex: number);
  }
  export class AmbientLight {
    constructor(color: number, intensity: number);
  }
  export class DirectionalLight {
    position: { set(x: number, y: number, z: number): void };
    castShadow: boolean;
    constructor(color: number, intensity: number);
  }
  export class GridHelper {
    constructor(size: number, divisions: number);
  }
  export class Group {
    position: { set(x: number, y: number, z: number): void };
    rotation: { set(x: number, y: number, z: number): void };
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  export class GLTFLoader {
    load(url: string, onLoad: (gltf: any) => void): void;
  }
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export class OrbitControls {
    enableDamping: boolean;
    dampingFactor: number;
    maxPolarAngle: number;
    update(): void;
    constructor(camera: any, domElement: any);
  }
}
