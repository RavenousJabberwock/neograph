/**
 * lib/calc/store.tsx — Central CalcProvider context.
 * ------------------------------------------------------------------
 * Single source of truth for the workstation:
 *   • expression / history     — calculator input + ANS chain
 *   • plots / viewport         — graph engine state (synced to bridge.ts)
 *   • visible / windows        — which panels are open + drag/resize rects
 *   • wallpaper                — calculator background (preset or image)
 *   • graphParams (a,b,c,d)    — live sliders for parametric expressions
 *   • casMode / vintage        — global UI toggles
 *
 * Adding a panel:
 *   1. Add its key to `PanelKey`.
 *   2. Add default rect to DEFAULT_WINDOWS.
 *   3. Add a `visible` default (true to show on first load).
 *   4. Register it in src/routes/index.tsx PANELS.
 *
 * Window layout is persisted to localStorage under `lvbl_calc_windows_v1`.
 * ------------------------------------------------------------------
 */
import { createContext, useContext, useState, useCallback, type ReactNode, useRef, useEffect } from "react";
import { defaultViewport, PLOT_COLORS, type PlotExpr, type Viewport } from "./math";
import { bindBridge } from "./bridge";

export type WallpaperName = "grid" | "scanlines" | "dots" | "hex" | "plain";
export type Wallpaper =
  | { kind: "preset"; name: WallpaperName }
  | { kind: "image"; url: string; label?: string };

export type PanelKey =
  | "calc" | "graph" | "table" | "cas"
  | "ide" | "paint" | "stats" | "matrix" | "gsolve" | "constants"
  | "terminal" | "radio" | "notepad" | "plot3d" | "numerics"
  | "workspace";

export interface GraphParams { a: number; b: number; c: number; d: number }

export interface WinRect { x: number; y: number; w: number; h: number; z: number; min?: boolean }

interface CalcState {
  expression: string;
  setExpression: (s: string) => void;
  insertAtCursor: (s: string) => void;
  registerInputRef: (el: HTMLInputElement | null) => void;
  history: Array<{ input: string; output: string }>;
  pushHistory: (h: { input: string; output: string }) => void;
  plots: PlotExpr[];
  setPlots: (p: PlotExpr[] | ((prev: PlotExpr[]) => PlotExpr[])) => void;
  addPlot: () => void;
  viewport: Viewport;
  setViewport: (v: Viewport) => void;
  visible: Record<PanelKey, boolean>;
  toggleVisible: (k: PanelKey) => void;
  showPanel: (k: PanelKey) => void;
  casMode: boolean;
  setCasMode: (b: boolean) => void;
  vintage: boolean;
  setVintage: (b: boolean) => void;
  windows: Record<PanelKey, WinRect>;
  setWindow: (k: PanelKey, patch: Partial<WinRect>) => void;
  focusWindow: (k: PanelKey) => void;
  wallpaper: Wallpaper;
  setWallpaper: (w: Wallpaper) => void;
  graphParams: GraphParams;
  setGraphParam: (k: keyof GraphParams, v: number) => void;
}

const Ctx = createContext<CalcState | null>(null);

const DEFAULT_WINDOWS: Record<PanelKey, WinRect> = {
  calc:      { x:  20, y:  20, w: 360, h: 540, z: 1 },
  graph:     { x: 400, y:  20, w: 720, h: 460, z: 2 },
  table:     { x: 400, y: 500, w: 360, h: 320, z: 3 },
  cas:       { x: 780, y: 500, w: 440, h: 360, z: 4 },
  ide:       { x: 140, y: 580, w: 560, h: 360, z: 5 },
  paint:     { x: 200, y: 120, w: 520, h: 380, z: 6 },
  stats:     { x: 740, y: 120, w: 520, h: 420, z: 7 },
  matrix:    { x: 260, y: 200, w: 560, h: 420, z: 8 },
  gsolve:    { x: 820, y: 200, w: 380, h: 360, z: 9 },
  constants: { x: 100, y: 260, w: 360, h: 420, z: 10 },
  terminal:  { x: 360, y: 280, w: 540, h: 340, z: 12 },
  radio:     { x: 880, y:  60, w: 340, h: 460, z: 13 },
  notepad:   { x: 240, y: 160, w: 520, h: 420, z: 14 },
  plot3d:    { x: 320, y: 100, w: 520, h: 420, z: 15 },
  numerics:  { x: 460, y: 240, w: 460, h: 420, z: 16 },
  workspace: { x:  20, y: 580, w: 280, h: 360, z: 11 },
};

export function CalcProvider({ children }: { children: ReactNode }) {
  const [expression, setExpression] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [history, setHistory] = useState<CalcState["history"]>([]);
  const [plots, setPlots] = useState<PlotExpr[]>([
    { id: "p1", kind: "explicit", enabled: true, color: PLOT_COLORS[0], expr: "sin(x)" },
    { id: "p2", kind: "explicit", enabled: true, color: PLOT_COLORS[1], expr: "0.3*x^2 - 2" },
  ]);
  const [viewport, setViewport] = useState<Viewport>(defaultViewport);
  const [visible, setVisible] = useState<Record<PanelKey, boolean>>({
    calc: true, graph: true, table: true, cas: true, workspace: true,
    ide: false, paint: false, stats: false, matrix: false, gsolve: false, constants: false,
    terminal: false, radio: false, notepad: false, plot3d: false, numerics: false,
  });
  const [casMode, setCasMode] = useState(false);
  const [vintage, setVintage] = useState(false);
  const [windows, setWindows] = useState<Record<PanelKey, WinRect>>(DEFAULT_WINDOWS);
  const [wallpaper, setWallpaper] = useState<Wallpaper>({ kind: "preset", name: "grid" });
  const [graphParams, setGraphParams] = useState<GraphParams>({ a: 1, b: 1, c: 1, d: 1 });
  const setGraphParam = useCallback((k: keyof GraphParams, v: number) => {
    setGraphParams((prev) => ({ ...prev, [k]: v }));
  }, []);
  const zCounter = useRef(50);

  // Keep the imperative bridge in sync with latest state via refs.
  const plotsRef = useRef(plots); plotsRef.current = plots;
  const viewportRef = useRef(viewport); viewportRef.current = viewport;
  useEffect(() => {
    bindBridge({
      getPlots: () => plotsRef.current,
      setPlots: (p) => setPlots(p as Parameters<typeof setPlots>[0]),
      getViewport: () => viewportRef.current,
      setViewport,
    });
  }, []);

  // Persist window layout
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lvbl_calc_windows_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        setWindows((prev) => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem("lvbl_calc_windows_v1", JSON.stringify(windows)); } catch { /* ignore */ }
  }, [windows]);

  const registerInputRef = useCallback((el: HTMLInputElement | null) => { inputRef.current = el; }, []);

  const insertAtCursor = useCallback((s: string) => {
    const el = inputRef.current;
    if (!el) { setExpression((prev) => prev + s); return; }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + s + el.value.slice(end);
    setExpression(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + s.length;
      el.setSelectionRange(pos, pos);
    });
  }, []);

  const pushHistory = useCallback((h: { input: string; output: string }) => {
    setHistory((prev) => [...prev.slice(-49), h]);
  }, []);

  const focusWindow = useCallback((k: PanelKey) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((prev) => ({ ...prev, [k]: { ...prev[k], z, min: false } }));
  }, []);

  const toggleVisible = useCallback((k: PanelKey) => {
    setVisible((v) => {
      const next = { ...v, [k]: !v[k] };
      if (next[k]) focusWindow(k);
      return next;
    });
  }, [focusWindow]);

  const showPanel = useCallback((k: PanelKey) => {
    setVisible((v) => ({ ...v, [k]: true }));
    focusWindow(k);
  }, [focusWindow]);

  const addPlot = useCallback(() => {
    setPlots((prev) => [
      ...prev,
      {
        id: `p${Date.now()}`,
        kind: "explicit",
        enabled: true,
        color: PLOT_COLORS[prev.length % PLOT_COLORS.length],
        expr: "x",
      },
    ]);
  }, []);

  const setWindow = useCallback((k: PanelKey, patch: Partial<WinRect>) => {
    setWindows((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));
  }, []);

  return (
    <Ctx.Provider value={{
      expression, setExpression, insertAtCursor, registerInputRef,
      history, pushHistory,
      plots, setPlots, addPlot,
      viewport, setViewport,
      visible, toggleVisible, showPanel,
      casMode, setCasMode,
      vintage, setVintage,
      windows, setWindow, focusWindow,
      wallpaper, setWallpaper,
      graphParams, setGraphParam,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCalc() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCalc must be used within CalcProvider");
  return v;
}
