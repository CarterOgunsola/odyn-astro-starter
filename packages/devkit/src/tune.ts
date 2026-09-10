// The tune panel: the taste tool behind ?tune=<name>. Fully inert without the query (returns null: zero DOM,
// zero listeners). Rows drive numeric dials; every change calls onChange with the full board.
//
// THE PILL IS THE SLIDER. Each dial is one rounded row whose fill is the value, the label rides inside the
// fill, a hairline caret marks its edge, discrete dials show a tick per step past the fill, the readout sits
// at the right. A drag anywhere on the row scrubs RELATIVE to the value (no jump on the press; Alt = fine,
// x0.1), arrows step it (Shift x10, Home/End the ends), the readout is typed (click, Enter commits, Esc
// cancels), an Alt-click or a double-click puts the one dial back to its baked value. Rows come in GROUPS
// (collapsible, remembered per tab), a find field filters, SAVE writes the board to src/tune/<name>.json
// through the dev server, COPY hands back only what moved (the bake diff), ALL the whole board, RESET the
// defaults; the head drags the panel and its spot is remembered. Labels are sans (the house voice), readouts
// mono (the instrument's one legal use). Ported from carter-2026's panel of 2026-09-10; SAVE is this
// starter's addition (decision 035).

export type TuneRow = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  /** shown after the readout ("°", "ms", "px") */
  unit?: string;
  /** the dial's one-line why, the row's title */
  hint?: string;
  /** a toggle is a row with a switch: value 0 | 1 (min/max/step ignored) */
  kind?: "dial" | "toggle";
};
export type TuneGroup = { group: string; rows: TuneRow[] };
export type TuneOpts = {
  /** which bottom corner the panel starts in (end = right) */
  side?: "start" | "end";
  /** re-adopt the panel after a View Transition replaces <body> */
  persist?: boolean;
};
/** a toggle row, sugar over TuneRow */
export const tuneToggle = (key: string, label: string, value: boolean, hint?: string): TuneRow => ({
  key,
  label,
  min: 0,
  max: 1,
  step: 1,
  value: value ? 1 : 0,
  hint,
  kind: "toggle",
});

// The four glyphs, inlined: a package cannot reach the site's icon folder.
const STROKE =
  'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
const svg = (d: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${STROKE}><path d="${d}"/></svg>`;
const chevTop = svg("M4 15l6.59-6.59a2 2 0 0 1 2.82 0L20 15");
const chevBottom = svg("M20 9l-6.59 6.59a2 2 0 0 1-2.82 0L4 9");
const chevRight = svg("M9 4l6.59 6.59a2 2 0 0 1 0 2.82L9 20");
const target = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${STROKE}><circle cx="12" cy="12" r="9.25"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r=".75"/></svg>`;

const STYLE_ID = "tune-panel-style";
// radii are concentric: row 6 + the rows' 10 inset = the panel's 16. No pills: the house is rounded squares.
const CSS = `
.tune{position:fixed;inset-block-end:16px;inset-inline-end:16px;z-index:3000;width:296px;max-height:min(84vh,920px);display:flex;flex-direction:column;background:var(--surface);border-radius:16px;box-shadow:0 0 0 1px var(--line),var(--shadow-modal);color:var(--ink);font:var(--fw-regular,400) 12px/1.3 var(--font-sans,system-ui);-webkit-font-smoothing:antialiased;user-select:none;-webkit-user-select:none;--ease-out:cubic-bezier(.23,1,.32,1)}
.tune__head{display:flex;align-items:center;gap:6px;padding:10px 10px 10px 14px;border-bottom:1px solid var(--line);cursor:grab;touch-action:none}
.tune__head:active{cursor:grabbing}
.tune__title{flex:1;min-width:0;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tune__moved{font:400 11px/1 var(--font-mono,ui-monospace);font-variant-numeric:tabular-nums;color:var(--ink-muted);white-space:nowrap}
.tune__moved:empty{display:none}
.tune__btn{border:0;background:var(--fill);color:var(--ink);border-radius:6px;padding:0 9px;height:26px;font:inherit;font-size:11px;line-height:1;cursor:pointer;white-space:nowrap;transition:transform 160ms var(--ease-out),background-color 160ms ease}
.tune__save{background:var(--ink);color:var(--paper)}
@media (hover:hover) and (pointer:fine){.tune__btn:hover{background:var(--fill-strong)}.tune__save:hover{background:var(--ink);opacity:.85}.tune__ghead:hover{background:var(--fill)}.tune__foldbtn:hover{background:var(--fill-strong);color:var(--ink)}}
.tune__btn:active{transform:scale(.96)}
.tune__btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--fill-strong)}
.tune__tools{display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--line)}
.tune__find{flex:1;min-width:0;height:30px;border:1px solid transparent;background:var(--fill);color:var(--ink);border-radius:6px;padding:0 10px;font:inherit;outline:none;transition:border-color 160ms ease}
.tune__find::placeholder{color:var(--ink-muted)}
.tune__find:focus{border-color:var(--fill-strong)}
.tune__find::-webkit-search-cancel-button{-webkit-appearance:none}
.tune__fold{display:flex;flex:none;height:30px;border-radius:6px;background:var(--fill);overflow:hidden}
.tune__foldbtn{display:flex;flex-direction:column;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;background:none;color:var(--ink-muted);cursor:pointer;transition:background-color 160ms ease,color 160ms ease,transform 160ms var(--ease-out)}
.tune__foldbtn:active{transform:scale(.96)}
.tune__foldbtn+.tune__foldbtn{box-shadow:-1px 0 0 var(--line)}
.tune__foldbtn:focus-visible{outline:none;box-shadow:inset 0 0 0 1.5px var(--fill-strong)}
.tune__foldbtn svg{width:12px;height:12px;display:block}
.tune__foldbtn[aria-pressed="true"]{background:var(--fill-strong);color:var(--ink)}
.tune__glyph{position:relative;width:12px;height:19px}
.tune__glyph>span{position:absolute;inset:0;display:flex;flex-direction:column;transition:opacity 300ms cubic-bezier(.2,0,0,1),transform 300ms cubic-bezier(.2,0,0,1),filter 300ms cubic-bezier(.2,0,0,1)}
.tune__glyph>span svg+svg{margin-top:-5px}
.tune__glyph>span[hidden]{display:flex;opacity:0;transform:scale(.25);filter:blur(4px)}
.tune__foldbtn .tune__target{width:14px;height:14px}
.tune__body{overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding-block-end:6px}
.tune__group+.tune__group{border-top:1px solid var(--line)}
.tune__ghead{display:flex;align-items:center;gap:8px;width:100%;padding:11px 14px;background:none;border:0;color:var(--ink);font:inherit;text-transform:uppercase;text-align:left;cursor:pointer}
.tune__ghead svg{flex:none;width:12px;height:12px;color:var(--ink-muted);transform:rotate(90deg);transition:transform 150ms var(--ease-out)}
.tune__group[data-closed] .tune__ghead svg{transform:none}
.tune__gmoved{margin-inline-start:auto;font:400 11px/1 var(--font-mono,ui-monospace);font-variant-numeric:tabular-nums;color:var(--ink-muted);text-transform:none}
.tune__rows{display:flex;flex-direction:column;gap:4px;padding:4px 10px 12px}
.tune__group[data-closed] .tune__rows{display:none}
.tune__group[data-empty]{display:none}
.tune__row{position:relative;display:flex;align-items:center;height:30px;border-radius:6px;background:var(--fill);overflow:hidden;cursor:ew-resize;touch-action:none;outline:none}
.tune__row[data-hidden]{display:none}
.tune__row:focus-visible{box-shadow:inset 0 0 0 1.5px var(--fill-strong)}
.tune__fill{position:absolute;inset:0;background:var(--fill-strong);border-radius:6px;transform:translateX(calc(var(--p) - 100%))}
.tune__row[data-anim] .tune__fill{transition:transform 160ms var(--ease-out)}
.tune__fill::after{content:"";position:absolute;top:8px;bottom:8px;right:5px;width:1.5px;border-radius:1px;background:var(--ink);opacity:.5}
.tune__fill[data-nocaret]::after{visibility:hidden}
.tune__row[data-held] .tune__fill::after{opacity:1}
.tune__ticks{position:absolute;inset:0 12px;pointer-events:none}
.tune__tick{position:absolute;top:50%;width:2px;height:2px;margin:-1px 0 0 -1px;border-radius:50%;background:var(--ink);opacity:.35}
.tune__label{position:relative;flex:1;min-width:0;display:flex;align-items:center;gap:6px;padding-inline-start:12px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
.tune__label::before{content:"";flex:none;width:4px;height:4px;border-radius:50%;background:var(--ink);visibility:hidden}
.tune__row[data-changed] .tune__label::before{visibility:visible}
.tune__val{position:relative;flex:none;align-self:stretch;display:flex;align-items:center;padding-inline:8px 12px;font:400 11px/1 var(--font-mono,ui-monospace);font-variant-numeric:tabular-nums;color:var(--ink-muted);cursor:text}
.tune__row[data-changed] .tune__val{color:var(--ink)}
.tune__val input{width:64px;font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--fill-strong);border-radius:4px;padding:3px 5px;text-align:right;outline:none;-moz-appearance:textfield}
.tune__val input::-webkit-outer-spin-button,.tune__val input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.tune__unit{margin-inline-start:3px;color:var(--ink-muted)}
.tune__row[data-toggle]{cursor:pointer}
.tune__switch{position:relative;flex:none;width:26px;height:16px;margin-inline-end:8px;border-radius:4px;background:var(--fill-strong);transition:background-color 160ms ease}
.tune__switch::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:2px;background:var(--surface);box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform 160ms var(--ease-out)}
.tune__row[data-on] .tune__switch{background:var(--ink)}
.tune__row[data-on] .tune__switch::after{transform:translateX(10px)}
@media (prefers-reduced-motion:reduce){.tune__row[data-anim] .tune__fill,.tune__ghead svg,.tune__foldbtn,.tune__btn,.tune__glyph>span{transition:none}}
`;

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

const isGrouped = (rows: TuneRow[] | TuneGroup[]): rows is TuneGroup[] =>
  rows.length > 0 && "rows" in rows[0];
// the readout's precision follows the step: 0.005 → 3 places, 5 → 0
const places = (step: number) => Math.max(0, Math.min(6, Math.ceil(-Math.log10(step) - 1e-9)));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const TICKS_MAX = 16; // a dial with this many steps or fewer shows a tick per step

const store = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* private mode */
    }
  },
};

export function tunePanel(
  name: string,
  rows: TuneRow[] | TuneGroup[],
  onChange: (board: Record<string, number>) => void,
  opts: TuneOpts = {},
): (() => void) | null {
  if (new URLSearchParams(location.search).get("tune") !== name) return null;
  injectStyle();

  const groups: TuneGroup[] = isGrouped(rows) ? rows : [{ group: "", rows }];
  const all = groups.flatMap((g) => g.rows);
  const board: Record<string, number> = {};
  const defaults: Record<string, number> = {};
  for (const r of all) {
    board[r.key] = r.value;
    defaults[r.key] = r.value;
  }
  const moved = () => all.filter((r) => board[r.key] !== defaults[r.key]).map((r) => r.key);

  const el = document.createElement("div");
  el.className = "tune";
  el.setAttribute("data-lenis-prevent", "");

  // the head: title, save / copy / all / reset
  const head = document.createElement("div");
  head.className = "tune__head";
  const title = document.createElement("span");
  title.className = "tune__title";
  title.textContent = `tune :: ${name}`;
  const movedEl = document.createElement("span");
  movedEl.className = "tune__moved";
  const btn = (text: string, tip: string, fn: () => void, cls = "") => {
    const b = document.createElement("button");
    b.className = `tune__btn ${cls}`.trim();
    b.type = "button";
    b.textContent = text;
    b.title = tip;
    b.onclick = (e) => {
      e.stopPropagation();
      fn();
    };
    return b;
  };
  const flash = (b: HTMLButtonElement, text: string) => {
    const was = b.textContent;
    b.textContent = text;
    setTimeout(() => (b.textContent = was), 900);
  };
  const saveBtn = btn(
    "save",
    `write the board to src/tune/${name}.json (development only)`,
    () => {
      saveBtn.textContent = "…";
      fetch(`/__tune/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(board),
      })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          // the file is the new baked state: nothing has moved from it
          Object.assign(defaults, board);
          for (const r of all) paint(r);
          paintCounts();
          saveBtn.textContent = "saved";
        })
        .catch(() => (saveBtn.textContent = "failed"))
        .finally(() => setTimeout(() => (saveBtn.textContent = "save"), 900));
    },
    "tune__save",
  );
  const copyBtn = btn("copy", "copy the dials that moved (the bake diff); all of them if none did", () => {
    const keys = moved();
    const out: Record<string, number> = {};
    for (const k of keys.length ? keys : Object.keys(board)) out[k] = board[k];
    navigator.clipboard?.writeText(JSON.stringify(out, null, 2));
    flash(copyBtn, keys.length ? `copied ${keys.length}` : "copied all");
  });
  const allBtn = btn("all", "copy the whole board", () => {
    navigator.clipboard?.writeText(JSON.stringify(board, null, 2));
    flash(allBtn, "copied");
  });
  const resetBtn = btn("reset", "every dial back to its baked value", () => {
    for (const r of all) set(r, defaults[r.key], true);
    onChange(board);
  });
  head.append(title, saveBtn, copyBtn, allBtn, resetBtn);

  // the tools: find, fold, focus
  const tools = document.createElement("div");
  tools.className = "tune__tools";
  const find = document.createElement("input");
  find.className = "tune__find";
  find.type = "search";
  find.placeholder = "find a dial";
  find.setAttribute("aria-label", "find a dial");
  // fold: ONE toggle. Its glyph is the action left (outward chevrons while any group is shut = open all;
  // inward once all are open = shut all), the two glyphs cross-fading in place. Beside it FOCUS: one group
  // at a time; opening a group shuts the others (remembered per tab). No motion on the groups themselves.
  const fold = document.createElement("div");
  fold.className = "tune__fold";
  const foldBtn = (tip: string, fn: () => void) => {
    const b = document.createElement("button");
    b.className = "tune__foldbtn";
    b.type = "button";
    b.title = tip;
    b.setAttribute("aria-label", tip);
    b.onclick = fn;
    return b;
  };
  const named = () => groupEls.filter((g) => g.name);
  const allOpen = () => named().every((g) => !g.el.hasAttribute("data-closed"));
  const glyph = document.createElement("span");
  glyph.className = "tune__glyph";
  const openG = document.createElement("span");
  openG.innerHTML = chevTop + chevBottom;
  const shutG = document.createElement("span");
  shutG.innerHTML = chevBottom + chevTop;
  glyph.append(openG, shutG);
  const foldToggle = foldBtn("open every group", () => setAll(allOpen()));
  foldToggle.append(glyph);
  const paintFold = () => {
    const shut = allOpen();
    openG.hidden = shut;
    shutG.hidden = !shut;
    foldToggle.title = shut ? "shut every group" : "open every group";
    foldToggle.setAttribute("aria-label", foldToggle.title);
  };
  const setAll = (shut: boolean) => {
    for (const g of named()) {
      g.el.toggleAttribute("data-closed", shut);
      if (shut) closed.add(g.name);
      else closed.delete(g.name);
    }
    store.set(closedKey, [...closed]);
    paintFold();
  };
  const focusKey = `tune:${name}:focus`;
  let focus = store.get<boolean>(focusKey, false);
  const focusBtn = foldBtn("focus: one group open at a time", () => {
    focus = !focus;
    store.set(focusKey, focus);
    focusBtn.setAttribute("aria-pressed", String(focus));
    if (focus) {
      const first = named().find((g) => !g.el.hasAttribute("data-closed"));
      for (const g of named())
        if (g !== first) {
          g.el.setAttribute("data-closed", "");
          closed.add(g.name);
        }
      store.set(closedKey, [...closed]);
      paintFold();
    }
  });
  focusBtn.innerHTML = target;
  focusBtn.querySelector("svg")!.classList.add("tune__target");
  focusBtn.setAttribute("aria-pressed", String(focus));
  fold.append(foldToggle, focusBtn);
  tools.append(find, movedEl, fold);

  // the body: groups of rows
  const body = document.createElement("div");
  body.className = "tune__body";
  const closedKey = `tune:${name}:closed`;
  const closed = new Set<string>(store.get<string[]>(closedKey, []));
  const rowEls = new Map<
    string,
    { row: HTMLElement; fill: HTMLElement; num: HTMLElement; text: HTMLElement }
  >();
  const groupEls: { el: HTMLElement; movedEl: HTMLElement | null; rows: TuneRow[]; name: string }[] = [];

  const fmt = (r: TuneRow, v: number) => v.toFixed(places(r.step));
  const paint = (r: TuneRow) => {
    const e = rowEls.get(r.key)!;
    const v = board[r.key];
    if (r.kind === "toggle") {
      e.row.toggleAttribute("data-on", !!v);
      e.row.setAttribute("aria-checked", String(!!v));
      e.row.toggleAttribute("data-changed", v !== defaults[r.key]);
      return;
    }
    const p = ((clamp(v, r.min, r.max) - r.min) / (r.max - r.min)) * 100;
    e.fill.style.setProperty("--p", `${p.toFixed(3)}%`);
    // the caret would cross the label: the fill's own edge marks the value there
    const x = (p / 100) * e.row.clientWidth - 5;
    e.fill.toggleAttribute("data-nocaret", x > 16 && x < 22 + e.text.offsetWidth + 6);
    e.num.textContent = fmt(r, v);
    e.row.setAttribute("aria-valuenow", String(v));
    e.row.setAttribute("aria-valuetext", `${fmt(r, v)}${r.unit ?? ""}`);
    e.row.toggleAttribute("data-changed", v !== defaults[r.key]);
  };
  const paintCounts = () => {
    const n = moved().length;
    movedEl.textContent = n ? `${n} moved` : "";
    for (const g of groupEls) {
      if (!g.movedEl) continue;
      const m = g.rows.filter((r) => board[r.key] !== defaults[r.key]).length;
      g.movedEl.textContent = m ? String(m) : "";
    }
  };
  // anim: a reset or a typed value glides the fill (a jump the eye must follow); a scrub is the hand's and
  // a key step lands with the key, both without a transition
  const set = (r: TuneRow, v: number, anim = false) => {
    board[r.key] = v;
    rowEls.get(r.key)!.row.toggleAttribute("data-anim", anim);
    paint(r);
    paintCounts();
  };
  const snap = (r: TuneRow, v: number) =>
    Number((Math.round((v - r.min) / r.step) * r.step + r.min).toFixed(places(r.step)));

  for (const g of groups) {
    const gEl = document.createElement("section");
    gEl.className = "tune__group";
    let gMoved: HTMLElement | null = null;
    if (g.group) {
      const gh = document.createElement("button");
      gh.className = "tune__ghead";
      gh.type = "button";
      gh.innerHTML = chevRight;
      gh.append(g.group);
      gMoved = document.createElement("span");
      gMoved.className = "tune__gmoved";
      gh.append(gMoved);
      if (closed.has(g.group)) gEl.setAttribute("data-closed", "");
      gh.onclick = () => {
        const now = !gEl.hasAttribute("data-closed");
        gEl.toggleAttribute("data-closed", now);
        if (now) closed.add(g.group);
        else closed.delete(g.group);
        if (!now && focus)
          for (const o of named())
            if (o.el !== gEl) {
              o.el.setAttribute("data-closed", "");
              closed.add(o.name);
            }
        store.set(closedKey, [...closed]);
        paintFold();
      };
      gEl.append(gh);
    }
    const rowsEl = document.createElement("div");
    rowsEl.className = "tune__rows";
    for (const r of g.rows) {
      if (r.kind === "toggle") {
        const row = document.createElement("div");
        row.className = "tune__row";
        row.tabIndex = 0;
        row.setAttribute("role", "switch");
        row.setAttribute("aria-label", r.label);
        row.setAttribute("data-toggle", "");
        row.title = `${r.key}${r.hint ? ` :: ${r.hint}` : ""}`;
        const label = document.createElement("span");
        label.className = "tune__label";
        const text = document.createElement("span");
        text.textContent = r.label;
        label.append(text);
        const sw = document.createElement("span");
        sw.className = "tune__switch";
        row.append(label, sw);
        const flip = () => {
          set(r, board[r.key] ? 0 : 1);
          onChange(board);
        };
        row.onclick = flip;
        row.onkeydown = (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            flip();
          }
        };
        rowsEl.append(row);
        rowEls.set(r.key, { row, fill: sw, num: sw, text });
        paint(r);
        continue;
      }
      const row = document.createElement("div");
      row.className = "tune__row";
      row.tabIndex = 0;
      row.setAttribute("role", "slider");
      row.setAttribute("aria-label", r.label);
      row.setAttribute("aria-valuemin", String(r.min));
      row.setAttribute("aria-valuemax", String(r.max));
      row.title = `${r.key}${r.hint ? ` :: ${r.hint}` : ""} · baked ${fmt(r, defaults[r.key])} · drag to scrub (Alt = fine) · Alt-click or double-click resets`;
      const fill = document.createElement("div");
      fill.className = "tune__fill";
      // a tick per step for a discrete dial (the interior steps; the ends are the row's own ends), under
      // the fill so the fill covers the steps already taken
      let ticksEl: HTMLElement | null = null;
      const steps = Math.round((r.max - r.min) / r.step);
      if (steps <= TICKS_MAX) {
        const ticks = document.createElement("div");
        ticks.className = "tune__ticks";
        for (let i = 1; i < steps; i++) {
          const t = document.createElement("i");
          t.className = "tune__tick";
          t.style.left = `${((i / steps) * 100).toFixed(3)}%`;
          ticks.append(t);
        }
        row.append(ticks);
        ticksEl = ticks;
      }
      row.append(fill);
      const label = document.createElement("span");
      label.className = "tune__label";
      const text = document.createElement("span");
      text.textContent = r.label;
      label.append(text);
      const val = document.createElement("span");
      val.className = "tune__val";
      const num = document.createElement("span");
      val.append(num);
      if (r.unit) {
        const u = document.createElement("span");
        u.className = "tune__unit";
        u.textContent = r.unit;
        val.append(u);
      }
      row.append(label, val);
      rowEls.set(r.key, { row, fill, num, text });

      // THE SCRUB: relative to the value, never a jump to the pointer. The full row width is the dial's
      // range, Alt makes it a tenth.
      let drag: { id: number; x0: number; v0: number; moved: boolean } | null = null;
      row.onpointerdown = (e) => {
        if (drag || e.button !== 0 || (e.target as Element).closest(".tune__val")) return;
        e.preventDefault();
        drag = { id: e.pointerId, x0: e.clientX, v0: board[r.key], moved: false };
        row.setAttribute("data-held", ""); // the row answers the press, not the release
        row.setPointerCapture(e.pointerId);
        row.focus({ preventScroll: true });
      };
      row.onpointermove = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x0;
        if (!drag.moved && Math.abs(dx) < 2) return;
        drag.moved = true;
        const gain = ((e.altKey ? 0.1 : 1) * (r.max - r.min)) / row.clientWidth;
        const v = snap(r, clamp(drag.v0 + dx * gain, r.min, r.max));
        if (v !== board[r.key]) {
          set(r, v);
          onChange(board);
        }
      };
      row.onpointerup = row.onpointercancel = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        // an Alt click (no travel) puts this one dial back to its baked value; an Alt drag is the fine scrub
        if (!drag.moved && e.altKey && e.type === "pointerup") {
          set(r, defaults[r.key], true);
          onChange(board);
        }
        drag = null;
        row.removeAttribute("data-held");
      };
      row.ondblclick = (e) => {
        if ((e.target as Element).closest(".tune__val")) return;
        set(r, defaults[r.key], true);
        onChange(board);
      };
      row.onkeydown = (e) => {
        const dir =
          e.key === "ArrowRight" || e.key === "ArrowUp"
            ? 1
            : e.key === "ArrowLeft" || e.key === "ArrowDown"
              ? -1
              : 0;
        let v: number | null = null;
        if (dir) v = board[r.key] + dir * r.step * (e.shiftKey ? 10 : 1);
        else if (e.key === "Home") v = r.min;
        else if (e.key === "End") v = r.max;
        if (v === null) return;
        e.preventDefault();
        set(r, snap(r, clamp(v, r.min, r.max))); // a key lands with the key, no glide
        onChange(board);
      };
      // the readout is typed: click, type, Enter (Esc puts it back). A typed value may sit past the row's
      // range; the fill shows its end.
      val.onpointerdown = (e) => e.stopPropagation();
      val.onclick = () => {
        if (val.querySelector("input")) return;
        const inp = document.createElement("input");
        inp.type = "number";
        inp.step = String(r.step);
        inp.value = fmt(r, board[r.key]);
        num.replaceWith(inp);
        inp.focus();
        inp.select();
        const done = (commit: boolean) => {
          if (!inp.isConnected) return;
          const v = Number(inp.value);
          inp.replaceWith(num);
          if (commit && Number.isFinite(v)) {
            set(r, v, true);
            onChange(board);
          }
        };
        inp.onkeydown = (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            done(true);
          } else if (e.key === "Escape") {
            e.preventDefault();
            done(false);
          }
          e.stopPropagation();
        };
        inp.onblur = () => done(true);
      };
      rowsEl.append(row);
      paint(r);
      // once laid out: the ticks live in the open run between the label and the readout, and the caret rule
      // sees the label's true width
      requestAnimationFrame(() => {
        if (ticksEl)
          ticksEl.style.clipPath = `inset(0 ${val.offsetWidth + 2}px 0 ${22 + text.offsetWidth + 2}px)`;
        paint(r);
      });
    }
    gEl.append(rowsEl);
    body.append(gEl);
    groupEls.push({ el: gEl, movedEl: gMoved, rows: g.rows, name: g.group });
  }
  paintCounts();
  paintFold();

  // find: filters rows by label or key; a matching group opens for the search
  const filter = () => {
    const q = find.value.trim().toLowerCase();
    for (const g of groupEls) {
      let shown = 0;
      for (const r of g.rows) {
        const hit = !q || r.label.toLowerCase().includes(q) || r.key.toLowerCase().includes(q);
        rowEls.get(r.key)!.row.toggleAttribute("data-hidden", !hit);
        if (hit) shown++;
      }
      g.el.toggleAttribute("data-empty", shown === 0);
      g.el.toggleAttribute("data-closed", !q && closed.has(g.name));
    }
  };
  find.oninput = filter;
  find.onkeydown = (e) => {
    if (e.key === "Escape") {
      find.value = "";
      filter();
      find.blur();
    }
    e.stopPropagation();
  };

  // the head drags the panel; its spot is remembered per tab
  const posKey = `tune:${name}:pos`;
  const pos = store.get<{ x: number; y: number } | null>(posKey, null);
  const place = (x: number, y: number) => {
    x = clamp(x, 0, innerWidth - el.offsetWidth);
    y = clamp(y, 0, innerHeight - el.offsetHeight);
    el.style.insetInlineEnd = "auto";
    el.style.insetBlockEnd = "auto";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  };
  head.onpointerdown = (e) => {
    if ((e.target as Element).closest("button")) return;
    e.preventDefault();
    const r = el.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    head.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => place(ev.clientX - dx, ev.clientY - dy);
    const up = () => {
      head.removeEventListener("pointermove", move);
      head.removeEventListener("pointerup", up);
      const rr = el.getBoundingClientRect();
      store.set(posKey, { x: rr.left, y: rr.top });
    };
    head.addEventListener("pointermove", move);
    head.addEventListener("pointerup", up);
  };

  el.append(head, tools, body);
  if (opts.side === "start") {
    el.style.insetInlineEnd = "auto";
    el.style.insetInlineStart = "16px";
  }
  // keys typed into the panel are the panel's (the machine behind it listens to the window)
  el.addEventListener("keydown", (e) => e.stopPropagation());
  document.body.append(el);
  if (pos) place(pos.x, pos.y);
  // a View Transition replaces <body>: the panel re-adopts itself so a dial survives a real nav
  const readopt = () => {
    if (!el.isConnected) document.body.append(el);
  };
  if (opts.persist) document.addEventListener("astro:page-load", readopt);
  return () => {
    document.removeEventListener("astro:page-load", readopt);
    el.remove();
  };
}
