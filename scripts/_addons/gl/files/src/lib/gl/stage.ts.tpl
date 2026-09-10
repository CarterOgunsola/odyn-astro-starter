import { Frame, onDestroy, onResize } from "@odyn/lifecycle";
import { Conductor } from "@odyn/conductor";
import { gate } from "./gate";
import { PlaneRegistry, type PlaneMesh } from "./planes";
import { TextureLoader } from "./textures";

type Three = typeof import("three");

class _Gl {
  private three: Three | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: import("three").WebGLRenderer | null = null;
  private scene: import("three").Scene | null = null;
  private camera: import("three").OrthographicCamera | null = null;
  private planes: PlaneRegistry | null = null;
  private offFrame: (() => void) | null = null;
  private offResize: (() => void) | null = null;
  private loading: Promise<Three> | null = null;
  private w = 0;
  private h = 0;
  state: "off" | "idle" | "on" = "idle";

  init() {
    this.canvas = document.querySelector<HTMLCanvasElement>("[data-gl-stage] canvas");
    if (!this.canvas || !gate()) {
      this.state = "off";
      document.documentElement.dataset.gl = "off";
      return;
    }
    document.documentElement.dataset.gl = "idle";
  }

  mountPage() {
    if (this.state === "off") return;
    const els = document.querySelectorAll<HTMLElement>('[data-gl="plane"]');
    if (!els.length) {
      this.pause();
      return;
    }
    const textures = { current: null as TextureLoader | null };
    const ready = this.ensure().then(async (three) => {
      const loader = new TextureLoader(three);
      textures.current = loader;
      if (!this.planes) return;
      const found = this.planes.collect(document, loader);
      await loader.hold(2000);
      this.planes.build(found, loader);
      this.resume();
    });
    Conductor.hold(ready, 2500);
    onDestroy(() => {
      this.planes?.dispose();
      textures.current?.abort();
      textures.current?.dispose();
    });
  }

  /**
   * An engine's own mesh on the stage, following `el` every frame. Resolves null when the stage is off, so the
   * caller falls back to a 2D surface. The engine disposes what it made; detaching only removes it from the scene.
   */
  async attach(
    el: HTMLElement,
    make: (three: Three) => PlaneMesh,
  ): Promise<{ mesh: PlaneMesh; detach: () => void } | null> {
    if (this.state === "off") return null;
    const three = await this.ensure();
    if (!this.planes) return null;
    const mesh = make(three);
    const off = this.planes.attach(el, mesh);
    this.resume();
    return {
      mesh,
      detach: () => {
        off();
        if (this.planes && this.planes.size === 0) this.pause();
      },
    };
  }

  private ensure(): Promise<Three> {
    if (this.three) return Promise.resolve(this.three);
    this.loading ??= import("three").then((three) => {
      this.boot(three);
      return three;
    });
    return this.loading;
  }

  private boot(three: Three) {
    if (!this.canvas) return;
    this.three = three;
    this.renderer = new three.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.scene = new three.Scene();
    this.camera = new three.OrthographicCamera(0, 1, 0, -1, -1000, 1000);
    this.camera.position.z = 1;
    this.planes = new PlaneRegistry(three, this.scene);
    this.size();
    this.offResize = onResize({ write: () => this.size() });
  }

  private size() {
    this.w = innerWidth;
    this.h = innerHeight;
    this.renderer?.setSize(this.w, this.h, false);
    if (this.camera) {
      this.camera.right = this.w;
      this.camera.bottom = -this.h;
      this.camera.updateProjectionMatrix();
    }
  }

  private draw = () => {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.planes?.sync();
    this.renderer.render(this.scene, this.camera);
  };

  private resume() {
    if (this.offFrame) return;
    this.offFrame = Frame.add(this.draw, 30);
    this.state = "on";
    document.documentElement.dataset.gl = "on";
  }

  private pause() {
    this.offFrame?.();
    this.offFrame = null;
    if (this.renderer) this.renderer.clear();
    if (this.state === "on") {
      this.state = "idle";
      document.documentElement.dataset.gl = "idle";
    }
  }

  destroy() {
    this.pause();
    this.offResize?.();
    this.offResize = null;
    this.planes?.disposeAll();
    this.planes = null;
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.three = null;
    this.loading = null;
  }
}

export const Gl = new _Gl();
