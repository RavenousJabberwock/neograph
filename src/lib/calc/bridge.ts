// Cross-panel imperative bridge. Lives outside React so async runtimes
// (Pyodide, eval'd JS, mini interpreters) can poke at the latest state.

import type { PlotExpr, Viewport } from "./math";

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
  try { return state.graphCanvas?.toDataURL("image/png") ?? null; }
  catch { return null; }
}

// Public API exposed to user scripts.
export const graphApi = {
  list() {
    return state.getPlots().map((p) => ({
      id: p.id, kind: p.kind, expr: p.expr, expr2: p.expr2 ?? null,
      enabled: p.enabled, color: p.color,
    }));
  },
  add(expr: string, opts: { kind?: PlotExpr["kind"]; expr2?: string; tMin?: number; tMax?: number; color?: string } = {}) {
    const id = `p${Date.now().toString(36)}${Math.floor(Math.random() * 999)}`;
    state.setPlots((prev) => [
      ...prev,
      {
        id, kind: opts.kind ?? "explicit", enabled: true,
        color: opts.color ?? PALETTE[prev.length % PALETTE.length],
        expr, expr2: opts.expr2, tMin: opts.tMin, tMax: opts.tMax,
      },
    ]);
    return id;
  },
  remove(id: string) {
    state.setPlots((prev) => prev.filter((p) => p.id !== id));
  },
  clear() { state.setPlots([]); },
  toggle(id: string, on?: boolean) {
    state.setPlots((prev) => prev.map((p) => p.id === id ? { ...p, enabled: on ?? !p.enabled } : p));
  },
  view() { return { ...state.getViewport() }; },
  setView(xMin: number, xMax: number, yMin: number, yMax: number) {
    state.setViewport({ xMin, xMax, yMin, yMax });
  },
  snapshot() { return getGraphSnapshot(); },
};

const PALETTE = [
  "oklch(0.85 0.18 195)",
  "oklch(0.82 0.18 78)",
  "oklch(0.72 0.22 340)",
  "oklch(0.78 0.18 140)",
  "oklch(0.75 0.2 30)",
  "oklch(0.78 0.18 260)",
];

export type GraphApi = typeof graphApi;
