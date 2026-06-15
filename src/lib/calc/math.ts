import { create, all } from "mathjs";

export const math = create(all, { number: "number" });

export type PlotKind = "explicit" | "parametric" | "polar";

export interface PlotExpr {
  id: string;
  kind: PlotKind;
  enabled: boolean;
  color: string;
  // explicit: y = f(x)  -> expr
  // parametric: x(t), y(t) -> expr "x_t", "y_t"; range [tMin,tMax]
  // polar: r(θ) -> expr, range [tMin,tMax]
  expr: string;
  expr2?: string;
  tMin?: number;
  tMax?: number;
}

export function safeCompile(expr: string) {
  try {
    return math.compile(expr);
  } catch {
    return null;
  }
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export const defaultViewport: Viewport = { xMin: -10, xMax: 10, yMin: -6.5, yMax: 6.5 };

export const PLOT_COLORS = [
  "oklch(0.85 0.18 195)", // cyan
  "oklch(0.82 0.18 78)",  // amber
  "oklch(0.72 0.22 340)", // magenta
  "oklch(0.78 0.18 140)", // green
  "oklch(0.75 0.2 30)",   // orange
  "oklch(0.78 0.18 260)", // violet
];
