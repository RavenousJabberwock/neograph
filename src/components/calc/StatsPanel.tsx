import { useMemo, useState } from "react";
import { useCalc } from "@/lib/calc/store";
import { math, PLOT_COLORS } from "@/lib/calc/math";
import { Plus, Trash2, LineChart } from "lucide-react";

type Reg = "linear" | "quadratic" | "cubic" | "exponential" | "power";

interface Point { x: number; y: number }

const DEFAULT_DATA: Point[] = [
  { x: 1, y: 1.2 }, { x: 2, y: 1.9 }, { x: 3, y: 3.4 },
  { x: 4, y: 4.3 }, { x: 5, y: 5.1 }, { x: 6, y: 6.8 },
];

function mean(xs: number[]) { return xs.reduce((a, b) => a + b, 0) / (xs.length || 1); }
function pstdev(xs: number[]) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((v) => (v - m) ** 2)));
}

// Normal equations for y = c0 + c1*x + c2*x^2 + ... using mathjs.
function polyFit(pts: Point[], deg: number): number[] {
  const n = pts.length;
  const X: number[][] = [];
  const y: number[] = [];
  for (const p of pts) {
    const row: number[] = [];
    for (let d = 0; d <= deg; d++) row.push(p.x ** d);
    X.push(row); y.push(p.y);
  }
  const Xt = math.transpose(X) as number[][];
  const XtX = math.multiply(Xt, X) as number[][];
  const Xty = math.multiply(Xt, y) as number[];
  const c = math.lusolve(XtX, Xty) as number[][];
  return c.map((row) => Number(row[0]));
}

function r2(pts: Point[], yhat: (x: number) => number) {
  const m = mean(pts.map((p) => p.y));
  const ssTot = pts.reduce((a, p) => a + (p.y - m) ** 2, 0);
  const ssRes = pts.reduce((a, p) => a + (p.y - yhat(p.x)) ** 2, 0);
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

export function StatsPanel() {
  const { setPlots, showPanel } = useCalc();
  const [reg, setReg] = useState<Reg>("linear");
  const [text, setText] = useState<string>(
    DEFAULT_DATA.map((p) => `${p.x}\t${p.y}`).join("\n"),
  );

  const points = useMemo<Point[]>(() => {
    return text.split(/\n+/).map((line) => {
      const m = line.trim().split(/[\s,\t]+/);
      if (m.length < 2) return null;
      const x = Number(m[0]); const y = Number(m[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    }).filter((p): p is Point => p !== null);
  }, [text]);

  const stats = useMemo(() => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    if (xs.length === 0) return null;
    return {
      n: xs.length,
      meanX: mean(xs), meanY: mean(ys),
      stdX: pstdev(xs), stdY: pstdev(ys),
      minY: Math.min(...ys), maxY: Math.max(...ys),
      sumY: ys.reduce((a, b) => a + b, 0),
    };
  }, [points]);

  const fit = useMemo(() => {
    if (points.length < 2) return null;
    try {
      if (reg === "linear") {
        const c = polyFit(points, 1);
        const yhat = (x: number) => c[0] + c[1] * x;
        return { expr: `${c[0].toFixed(4)} + ${c[1].toFixed(4)}*x`, r: r2(points, yhat), coeffs: c };
      }
      if (reg === "quadratic") {
        const c = polyFit(points, 2);
        const yhat = (x: number) => c[0] + c[1] * x + c[2] * x ** 2;
        return { expr: `${c[0].toFixed(4)} + ${c[1].toFixed(4)}*x + ${c[2].toFixed(4)}*x^2`, r: r2(points, yhat), coeffs: c };
      }
      if (reg === "cubic") {
        const c = polyFit(points, 3);
        const yhat = (x: number) => c[0] + c[1] * x + c[2] * x ** 2 + c[3] * x ** 3;
        return { expr: `${c[0].toFixed(4)} + ${c[1].toFixed(4)}*x + ${c[2].toFixed(4)}*x^2 + ${c[3].toFixed(4)}*x^3`, r: r2(points, yhat), coeffs: c };
      }
      if (reg === "exponential") {
        // y = a*e^(b*x)  -> ln y = ln a + b x  (requires y > 0)
        const pos = points.filter((p) => p.y > 0);
        if (pos.length < 2) return null;
        const lin = polyFit(pos.map((p) => ({ x: p.x, y: Math.log(p.y) })), 1);
        const a = Math.exp(lin[0]); const b = lin[1];
        const yhat = (x: number) => a * Math.exp(b * x);
        return { expr: `${a.toFixed(4)}*exp(${b.toFixed(4)}*x)`, r: r2(points, yhat), coeffs: [a, b] };
      }
      if (reg === "power") {
        // y = a*x^b (requires x,y > 0)
        const pos = points.filter((p) => p.x > 0 && p.y > 0);
        if (pos.length < 2) return null;
        const lin = polyFit(pos.map((p) => ({ x: Math.log(p.x), y: Math.log(p.y) })), 1);
        const a = Math.exp(lin[0]); const b = lin[1];
        const yhat = (x: number) => a * x ** b;
        return { expr: `${a.toFixed(4)}*x^${b.toFixed(4)}`, r: r2(points, yhat), coeffs: [a, b] };
      }
    } catch { return null; }
    return null;
  }, [points, reg]);

  const plotFit = () => {
    if (!fit) return;
    setPlots((prev) => [
      ...prev,
      {
        id: `fit_${Date.now()}`,
        kind: "explicit",
        enabled: true,
        color: PLOT_COLORS[2],
        expr: fit.expr,
      },
    ]);
    showPanel("graph");
  };

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="flex flex-wrap gap-1.5">
        {(["linear", "quadratic", "cubic", "exponential", "power"] as Reg[]).map((r) => (
          <button key={r} className="pill-btn" data-active={reg === r} onClick={() => setReg(r)}>{r}</button>
        ))}
        <button className="pill-btn ml-auto" data-active onClick={plotFit} disabled={!fit}>
          <LineChart size={12} /> PLOT FIT
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        <div className="flex flex-col gap-1 min-h-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.6rem] tracking-widest text-muted-foreground">DATA · x  y per row</span>
            <button className="pill-btn !py-0.5 ml-auto" onClick={() => setText(text + "\n0\t0")}><Plus size={12} /></button>
            <button className="pill-btn !py-0.5" onClick={() => setText("")}><Trash2 size={12} /></button>
          </div>
          <textarea
            spellCheck={false}
            className="field flex-1 !text-[0.72rem] !font-mono resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 min-h-0 overflow-auto">
          <Card title="SUMMARY">
            {stats ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[0.72rem] font-mono">
                <span className="text-muted-foreground">n</span><span className="neon-text">{stats.n}</span>
                <span className="text-muted-foreground">x̄</span><span className="neon-text">{stats.meanX.toFixed(4)}</span>
                <span className="text-muted-foreground">ȳ</span><span className="neon-text">{stats.meanY.toFixed(4)}</span>
                <span className="text-muted-foreground">σx</span><span className="neon-text">{stats.stdX.toFixed(4)}</span>
                <span className="text-muted-foreground">σy</span><span className="neon-text">{stats.stdY.toFixed(4)}</span>
                <span className="text-muted-foreground">Σy</span><span className="neon-text">{stats.sumY.toFixed(4)}</span>
                <span className="text-muted-foreground">min y</span><span className="neon-text">{stats.minY.toFixed(4)}</span>
                <span className="text-muted-foreground">max y</span><span className="neon-text">{stats.maxY.toFixed(4)}</span>
              </div>
            ) : <span className="text-muted-foreground text-xs">No data</span>}
          </Card>
          <Card title="REGRESSION">
            {fit ? (
              <div className="text-[0.72rem] font-mono space-y-1">
                <div>
                  <span className="text-muted-foreground">y(x) = </span>
                  <span className="neon-text break-all">{fit.expr}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">R² = </span>
                  <span className="neon-text-amber">{fit.r.toFixed(6)}</span>
                </div>
              </div>
            ) : <span className="text-muted-foreground text-xs">Need ≥ 2 valid points</span>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-2">
      <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1">{title}</div>
      {children}
    </div>
  );
}
