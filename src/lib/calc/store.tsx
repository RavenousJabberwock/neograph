import { createContext, useContext, useState, useCallback, type ReactNode, useRef } from "react";
import { defaultViewport, PLOT_COLORS, type PlotExpr, type Viewport } from "./math";

export type PanelKey = "calc" | "graph" | "table" | "cas" | "workspace";

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
  casMode: boolean;
  setCasMode: (b: boolean) => void;
  vintage: boolean;
  setVintage: (b: boolean) => void;
}

const Ctx = createContext<CalcState | null>(null);

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
  });
  const [casMode, setCasMode] = useState(false);
  const [vintage, setVintage] = useState(false);

  const registerInputRef = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
  }, []);

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

  const toggleVisible = useCallback((k: PanelKey) => {
    setVisible((v) => ({ ...v, [k]: !v[k] }));
  }, []);

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

  return (
    <Ctx.Provider value={{
      expression, setExpression, insertAtCursor, registerInputRef,
      history, pushHistory,
      plots, setPlots, addPlot,
      viewport, setViewport,
      visible, toggleVisible,
      casMode, setCasMode,
      vintage, setVintage,
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
