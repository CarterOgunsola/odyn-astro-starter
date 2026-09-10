// The one outside clock the instruments share. Decision 016 lets the devkit run its own requestAnimationFrame
// because it measures the site's clock from outside; this is that loop, started on the first subscriber.
type Sub = (dt: number, now: number) => void;
const subs = new Set<Sub>();
let running = false;
let last = 0;

function tick(now: number) {
  if (!subs.size) {
    running = false;
    return;
  }
  const dt = last ? now - last : 16.7;
  last = now;
  subs.forEach((fn) => fn(dt, now));
  requestAnimationFrame(tick);
}

export function sample(fn: Sub): () => void {
  subs.add(fn);
  if (!running) {
    running = true;
    last = 0;
    requestAnimationFrame(tick);
  }
  return () => subs.delete(fn);
}
