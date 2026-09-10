import type * as THREE from "three";
import type { TextureLoader } from "./textures";

export type PlaneMesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
type Entry = { el: HTMLElement; mesh: PlaneMesh; own: boolean };

export class PlaneRegistry {
  private entries = new Map<string, Entry>();
  private geometry: THREE.PlaneGeometry;

  constructor(
    private three: typeof THREE,
    private scene: THREE.Scene,
  ) {
    this.geometry = new three.PlaneGeometry(1, 1);
  }

  collect(root: ParentNode, textures: TextureLoader): HTMLElement[] {
    const els = [...root.querySelectorAll<HTMLElement>('[data-gl="plane"]')];
    for (const el of els) {
      const id = el.dataset.id;
      const src = this.srcOf(el);
      if (!id || !src) continue;
      textures.queue(id, src);
    }
    return els;
  }

  build(els: HTMLElement[], textures: TextureLoader) {
    for (const el of els) {
      const id = el.dataset.id;
      if (!id) continue;
      const map = textures.get(id);
      if (!map) continue;
      const material = new this.three.MeshBasicMaterial({ map, transparent: true });
      const mesh = new this.three.Mesh(this.geometry, material);
      this.scene.add(mesh);
      this.entries.set(id, { el, mesh, own: true });
      el.dataset.glReady = "";
    }
  }

  /** An engine's own mesh, following `el` like a plane. The engine owns its material and geometry. */
  attach(el: HTMLElement, mesh: PlaneMesh): () => void {
    const key = `attached:${(this.attached += 1)}`;
    this.scene.add(mesh);
    this.entries.set(key, { el, mesh, own: false });
    return () => {
      if (!this.entries.has(key)) return;
      this.scene.remove(mesh);
      this.entries.delete(key);
    };
  }
  private attached = 0;

  private srcOf(el: HTMLElement): string | null {
    if (el instanceof HTMLImageElement) return el.currentSrc || el.src;
    return el.dataset.src ?? el.querySelector("img")?.currentSrc ?? null;
  }

  sync() {
    for (const { el, mesh } of this.entries.values()) {
      const r = el.getBoundingClientRect();
      mesh.position.set(r.left + r.width / 2, -(r.top + r.height / 2), 0);
      mesh.scale.set(r.width, r.height, 1);
      mesh.visible = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    }
  }

  get(id: string): Entry | undefined {
    return this.entries.get(id);
  }

  get size() {
    return this.entries.size;
  }

  dispose() {
    for (const { el, mesh, own } of this.entries.values()) {
      this.scene.remove(mesh);
      if (own) mesh.material.dispose();
      delete el.dataset.glReady;
    }
    this.entries.clear();
  }

  disposeAll() {
    this.dispose();
    this.geometry.dispose();
  }
}
