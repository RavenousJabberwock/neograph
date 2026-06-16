// Cross-panel imperative bridge. Lives outside React so async runtimes
// (Pyodide, eval'd JS, mini interpreters) can poke at the latest state
// without re-rendering. Keep the surface area tiny and the contract stable.

import { safeCompile, PLOT_COLORS, type PlotExpr, type Viewport } from "./math";

type PlotsUpdater = (p: PlotExpr[] | ((prev: PlotExpr[]) => PlotExpr[])) => void;

interface BridgeState {
  graphCanvas: HTMLCanvasElement | null;
  getPlots: () => PlotExpr[];
  setPlots: PlotsUpdater;
  getViewport: () => Viewport;
  setViewport: (v: Viewport) => void;
}

const state: BridgeState = {
  graphCanvas: null,
  getPlots: () => [],
  setPlots: () => {},
  getViewport: () => ({ xMin: -10, xMax: 10, yMin: -6.5, yMax: 6.5 }),
  setViewport: () => {},
};

export function bindBridge(patch: Partial<BridgeState>) {
  Object.assign(state, patch);
}

export function getGraphSnapshot(): string | null {
  try {
    return state.graphCanvas?.toDataURL("image/png") ?? null;
  } catch (e) {
    console.warn("[bridge] snapshot failed:", e);
    return null;
  }
}

/** Collision-resistant plot ID. Falls back to a high-entropy string when
 *  crypto.randomUUID is unavailable (very old browsers, sandboxed contexts). */
export function freshId(prefix = "p"): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.randomUUID) return `${prefix}_${c.randomUUID().slice(0, 8)}`;
  const buf = new Uint32Array(2);
  c?.getRandomValues?.(buf);
  const rand = (buf[0] ^ buf[1]) || Math.floor(Math.random() * 1e9);
  return `${prefix}_${Date.now().toString(36)}${rand.toString(36).slice(0, 6)}`;
}

// Public API exposed to user scripts (IDE, terminal, Pyodide).
export const graphApi = {
  /** Snapshot of all curves currently on the graph. */
  list() {
    return state.getPlots().map((p) => ({
      id: p.id, kind: p.kind, expr: p.expr, expr2: p.expr2 ?? null,
      enabled: p.enabled, color: p.color,
    }));
  },
  /** Push a new curve. Returns its ID. Throws on syntactically invalid expr. */
  add(expr: string, opts: { kind?: PlotExpr["kind"]; expr2?: string; tMin?: number; tMax?: number; color?: string } = {}) {
    if (typeof expr !== "string" || !expr.trim()) throw new Error("graph.add: expr must be a non-empty string");
    if (!safeCompile(expr)) throw new Error(`graph.add: expr did not compile → ${expr}`);
    if (opts.expr2 && !safeCompile(opts.expr2)) throw new Error(`graph.add: expr2 did not compile → ${opts.expr2}`);
    const id = freshId("p");
    state.setPlots((prev) => [
      ...prev,
      {
        id, kind: opts.kind ?? "explicit", enabled: true,
        color: opts.color ?? PLOT_COLORS[prev.length % PLOT_COLORS.length],
        expr, expr2: opts.expr2, tMin: opts.tMin, tMax: opts.tMax,
      },
    ]);
    return id;
  },
  remove(id: string) { state.setPlots((prev) => prev.filter((p) => p.id !== id)); },
  clear() { state.setPlots([]); },
  toggle(id: string, on?: boolean) {
    state.setPlots((prev) => prev.map((p) => p.id === id ? { ...p, enabled: on ?? !p.enabled } : p));
  },
  view() { return { ...state.getViewport() }; },
  setView(xMin: number, xMax: number, yMin: number, yMax: number) {
    if (![xMin, xMax, yMin, yMax].every(Number.isFinite)) throw new Error("graph.setView: all bounds must be finite numbers");
    if (xMin >= xMax || yMin >= yMax) throw new Error("graph.setView: min must be < max");
    state.setViewport({ xMin, xMax, yMin, yMax });
  },
  snapshot() { return getGraphSnapshot(); },
};

export type GraphApi = typeof graphApi;
