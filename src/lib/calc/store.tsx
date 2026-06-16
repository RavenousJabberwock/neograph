/**
 * lib/calc/store.tsx — Central CalcProvider context.
 * ------------------------------------------------------------------
 * Single source of truth for the workstation:
 *   • expression / history     — calculator input + ANS chain
 *   • ans                      — last numeric result, also injected into
 *                                math.evaluate scopes via `mathScope`
 *   • plots / viewport         — graph engine state (synced to bridge.ts)
 *   • plotHistory              — undo/redo stack for plot edits
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
 * Persistence:
 *   • lvbl_calc_windows_v2  — window rects + visibility + wallpaper
 *   • lvbl_calc_workspaces_v2 — saved named workspaces (in sidebar)
 *   • Version bumps invalidate older keys instead of crashing on parse.
 * ------------------------------------------------------------------
 */
import { createContext, useContext, useState, useCallback, type ReactNode, useRef, useEffect } from "react";
import { defaultViewport, PLOT_COLORS, type PlotExpr, type Viewport } from "./math";
import { bindBridge } from "./bridge";
import { applyTheme, isTheme, THEMES, type Theme } from "./themes";

export type WallpaperName = "grid" | "scanlines" | "dots" | "hex" | "plain";
export type Wallpaper =
  | { kind: "preset"; name: WallpaperName }
  | { kind: "image"; url: string; label?: string };

export type PanelKey =
  | "calc" | "graph" | "table" | "cas"
  | "ide" | "paint" | "stats" | "matrix" | "gsolve" | "constants"
  | "terminal" | "radio" | "notepad" | "plot3d" | "numerics"
  | "academy"
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
  ans: number | null;
  setAns: (v: number | null) => void;
  /** Inject this into math.evaluate(expr, mathScope) to make `ans` available. */
  mathScope: Record<string, unknown>;
  plots: PlotExpr[];
  setPlots: (p: PlotExpr[] | ((prev: PlotExpr[]) => PlotExpr[])) => void;
  addPlot: () => void;
  undoPlots: () => void;
  redoPlots: () => void;
  canUndoPlots: boolean;
  canRedoPlots: boolean;
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
  theme: Theme;
  setTheme: (t: Theme) => void;
  graphParams: GraphParams;
  setGraphParam: (k: keyof GraphParams, v: number) => void;
  /** Full workstation state → JSON string (for download). */
  exportState: () => string;
  /** Restore workstation from a previously exported JSON string. */
  importState: (json: string) => boolean;
}

const Ctx = createContext<CalcState | null>(null);

const STORAGE_LAYOUT = "lvbl_calc_windows_v2";

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
  academy:   { x: 120, y:  80, w: 920, h: 580, z: 17 },
  workspace: { x:  20, y: 580, w: 280, h: 360, z: 11 },
};

const DEFAULT_VISIBLE: Record<PanelKey, boolean> = {
  calc: true, graph: true, table: true, cas: true, workspace: true,
  ide: false, paint: false, stats: false, matrix: false, gsolve: false, constants: false,
  terminal: false, radio: false, notepad: false, plot3d: false, numerics: false, academy: false,
};

// ─── Type guards for hydrated state ─────────────────────────────────────────
function isWallpaper(x: unknown): x is Wallpaper {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (o.kind === "preset") return typeof o.name === "string" && ["grid","scanlines","dots","hex","plain"].includes(o.name);
  if (o.kind === "image") return typeof o.url === "string" && o.url.length < 10_000_000; // ~10MB cap
  return false;
}

interface PersistedLayout {
  windows?: Partial<Record<PanelKey, WinRect>>;
  visible?: Partial<Record<PanelKey, boolean>>;
  wallpaper?: Wallpaper;
  casMode?: boolean;
  vintage?: boolean;
}

function loadLayout(): PersistedLayout {
  try {
    const raw = localStorage.getItem(STORAGE_LAYOUT);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (e) {
    console.warn("[store] failed to load layout:", e);
    return {};
  }
}

export function CalcProvider({ children }: { children: ReactNode }) {
  const [expression, setExpression] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [history, setHistory] = useState<CalcState["history"]>([]);
  const [ans, setAns] = useState<number | null>(null);
  // mathScope is mutated in-place so newly evaluated expressions see latest ans.
  const mathScopeRef = useRef<Record<string, unknown>>({});

  const [plots, setPlotsRaw] = useState<PlotExpr[]>([
    { id: "p1", kind: "explicit", enabled: true, color: PLOT_COLORS[0], expr: "sin(x)" },
    { id: "p2", kind: "explicit", enabled: true, color: PLOT_COLORS[1], expr: "0.3*x^2 - 2" },
  ]);
  // Undo/redo stacks for plot edits.
  const undoStack = useRef<PlotExpr[][]>([]);
  const redoStack = useRef<PlotExpr[][]>([]);
  const [undoTick, setUndoTick] = useState(0);

  const setPlots = useCallback<CalcState["setPlots"]>((p) => {
    setPlotsRaw((prev) => {
      const next = typeof p === "function" ? (p as (q: PlotExpr[]) => PlotExpr[])(prev) : p;
      // Skip no-op writes (e.g. identical re-render)
      if (next !== prev) {
        undoStack.current.push(prev);
        if (undoStack.current.length > 100) undoStack.current.shift();
        redoStack.current = [];
        setUndoTick((t) => t + 1);
      }
      return next;
    });
  }, []);

  const undoPlots = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setPlotsRaw((cur) => { redoStack.current.push(cur); return prev; });
    setUndoTick((t) => t + 1);
  }, []);
  const redoPlots = useCallback(() => {
    const nxt = redoStack.current.pop();
    if (!nxt) return;
    setPlotsRaw((cur) => { undoStack.current.push(cur); return nxt; });
    setUndoTick((t) => t + 1);
  }, []);

  const [viewport, setViewport] = useState<Viewport>(defaultViewport);
  const [visible, setVisible] = useState<Record<PanelKey, boolean>>(DEFAULT_VISIBLE);
  const [casMode, setCasMode] = useState(false);
  const [vintage, setVintage] = useState(false);
  const [windows, setWindows] = useState<Record<PanelKey, WinRect>>(DEFAULT_WINDOWS);
  const [wallpaper, setWallpaper] = useState<Wallpaper>({ kind: "preset", name: "grid" });
  const [graphParams, setGraphParams] = useState<GraphParams>({ a: 1, b: 1, c: 1, d: 1 });
  const setGraphParam = useCallback((k: keyof GraphParams, v: number) => {
    setGraphParams((prev) => ({ ...prev, [k]: v }));
  }, []);
  const zCounter = useRef(50);

  // Keep ANS available to math.evaluate() consumers via a shared scope object.
  useEffect(() => { mathScopeRef.current.ans = ans ?? 0; }, [ans]);

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
  }, [setPlots]);

  // ─── Hydrate persisted layout on mount ────────────────────────────────────
  useEffect(() => {
    const parsed = loadLayout();
    if (parsed.windows) setWindows((prev) => ({ ...prev, ...parsed.windows }));
    if (parsed.visible) setVisible((prev) => ({ ...prev, ...parsed.visible }));
    if (parsed.wallpaper && isWallpaper(parsed.wallpaper)) setWallpaper(parsed.wallpaper);
    if (typeof parsed.casMode === "boolean") setCasMode(parsed.casMode);
    if (typeof parsed.vintage === "boolean") setVintage(parsed.vintage);
  }, []);

  // Persist layout snapshot.
  useEffect(() => {
    try {
      const snap: PersistedLayout = { windows, visible, wallpaper, casMode, vintage };
      localStorage.setItem(STORAGE_LAYOUT, JSON.stringify(snap));
    } catch (e) {
      console.warn("[store] failed to persist layout:", e);
    }
  }, [windows, visible, wallpaper, casMode, vintage]);

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
    const n = Number(h.output);
    if (Number.isFinite(n)) setAns(n);
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
  }, [setPlots]);

  const setWindow = useCallback((k: PanelKey, patch: Partial<WinRect>) => {
    setWindows((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));
  }, []);

  const exportState = useCallback(() => {
    return JSON.stringify({
      _version: 1,
      _app: "neograph",
      _exportedAt: new Date().toISOString(),
      plots, viewport, visible, windows, wallpaper, casMode, vintage, graphParams,
    }, null, 2);
  }, [plots, viewport, visible, windows, wallpaper, casMode, vintage, graphParams]);

  const importState = useCallback((json: string): boolean => {
    try {
      const o = JSON.parse(json);
      if (!o || typeof o !== "object" || o._app !== "neograph") return false;
      if (Array.isArray(o.plots)) setPlots(o.plots);
      if (o.viewport) setViewport(o.viewport);
      if (o.visible) setVisible((prev) => ({ ...prev, ...o.visible }));
      if (o.windows) setWindows((prev) => ({ ...prev, ...o.windows }));
      if (o.wallpaper && isWallpaper(o.wallpaper)) setWallpaper(o.wallpaper);
      if (typeof o.casMode === "boolean") setCasMode(o.casMode);
      if (typeof o.vintage === "boolean") setVintage(o.vintage);
      if (o.graphParams) setGraphParams((prev) => ({ ...prev, ...o.graphParams }));
      return true;
    } catch (e) {
      console.warn("[store] import failed:", e);
      return false;
    }
  }, [setPlots]);

  return (
    <Ctx.Provider value={{
      expression, setExpression, insertAtCursor, registerInputRef,
      history, pushHistory,
      ans, setAns, mathScope: mathScopeRef.current,
      plots, setPlots, addPlot,
      undoPlots, redoPlots,
      canUndoPlots: undoStack.current.length > 0 && undoTick >= 0,
      canRedoPlots: redoStack.current.length > 0 && undoTick >= 0,
      viewport, setViewport,
      visible, toggleVisible, showPanel,
      casMode, setCasMode,
      vintage, setVintage,
      windows, setWindow, focusWindow,
      wallpaper, setWallpaper,
      graphParams, setGraphParam,
      exportState, importState,
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
