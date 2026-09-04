export function mediaHold(root: ParentNode = document, capMs = 1500): Promise<void> {
  const imgs = [...root.querySelectorAll<HTMLImageElement>('img[data-critical], img[fetchpriority="high"]')];
  if (!imgs.length) return Promise.resolve();
  const decoded = Promise.all(
    imgs.map((img) => (typeof img.decode === "function" ? img.decode() : Promise.resolve()).catch(() => {})),
  ).then(() => {});
  const cap = new Promise<void>((r) => setTimeout(r, capMs));
  return Promise.race([decoded, cap]);
}

export type PreloadItem = { label: string; load: () => Promise<unknown> };

export class Preloader {
  protected items: PreloadItem[] = [];
  private settled = 0;
  private failures = 0;
  private aborted = false;
  private subs = new Set<(progress: number) => void>();
  private release: (() => void) | null = null;

  add(label: string, load: () => Promise<unknown>): this {
    this.items.push({ label, load });
    return this;
  }

  get progress(): number {
    return this.items.length ? this.settled / this.items.length : 1;
  }

  get errors(): number {
    return this.failures;
  }

  onProgress(fn: (progress: number) => void): () => void {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }

  abort() {
    this.aborted = true;
    this.release?.();
  }

  run(): Promise<void> {
    const all = Promise.all(
      this.items.map(async (it) => {
        try {
          await it.load();
        } catch {
          this.failures++;
        }
        if (this.aborted) return;
        this.settled++;
        this.subs.forEach((fn) => fn(this.progress));
      }),
    ).then(() => {});
    const stop = new Promise<void>((r) => (this.release = r));
    if (this.aborted) return Promise.resolve();
    return Promise.race([all, stop]);
  }
}
