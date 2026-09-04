import { Preloader } from "@odyn/engines";
import { Conductor } from "@odyn/conductor";
import type * as THREE from "three";

export class TextureLoader extends Preloader {
  private textures = new Map<string, THREE.Texture>();

  constructor(private three: typeof THREE) {
    super();
  }

  queue(label: string, src: string): this {
    const loader = new this.three.TextureLoader();
    return this.add(label, async () => {
      const t = await loader.loadAsync(src);
      t.colorSpace = this.three.SRGBColorSpace;
      this.textures.set(label, t);
      return t;
    });
  }

  get(label: string): THREE.Texture | undefined {
    return this.textures.get(label);
  }

  hold(capMs = 2000): Promise<void> {
    const p = this.run();
    Conductor.hold(p, capMs);
    return p;
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
    this.textures.clear();
  }
}
