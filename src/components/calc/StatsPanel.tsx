import { useMemo, useState } from "react";
import { useCalc } from "@/lib/calc/store";
import { math, PLOT_COLORS } from "@/lib/calc/math";
import { Matrix as MLMatrix, SingularValueDecomposition } from "ml-matrix";
// jstat ships flexible ESM/CJS; use namespace import.
import * as jStatNS from "jstat";
import { Plus, Trash2, LineChart } from "lucide-react";

const jStat: any = (jStatNS as any).jStat ?? (jStatNS as any).default ?? jStatNS;

type Tab = "regression" | "distribution" | "tests" | "logistic";
type Reg = "linear" | "quadratic" | "cubic" | "exponential" | "power" | "multi";
type DistName = "normal" | "studentt" | "chisquare" | "centralF" | "exponential" | "beta" | "gamma" | "uniform" | "poisson" | "binomial";

interface Point { x: number; y: number }
const DEFAULT_DATA: Point[] = [
  { x: 1, y: 1.2 }, { x: 2, y: 1.9 }, { x: 3, y: 3.4 },
  { x: 4, y: 4.3 }, { x: 5, y: 5.1 }, { x: 6, y: 6.8 },
];

function mean(xs: number[]) { return xs.reduce((a, b) => a + b, 0) / (xs.length || 1); }
function pstdev(xs: number[]) { const m = mean(xs); return Math.sqrt(mean(xs.map((v) => (v - m) ** 2))); }
function svar(xs: number[]) { const m = mean(xs); return xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, xs.length - 1); }

function polyFit(pts: Point[], deg: number): number[] {
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
  const [tab, setTab] = useState<Tab>("regression");
  return (
    <div className="flex flex-col h-full p-3 gap-2 overflow-auto">
      <div className="flex gap-1">
        {(["regression", "distribution", "tests", "logistic"] as Tab[]).map((t) => (
          <button key={t} className="pill-btn" data-active={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "regression"   && <RegressionTab />}
      {tab === "distribution" && <DistributionTab />}
      {tab === "tests"        && <TestsTab />}
      {tab === "logistic"     && <LogisticTab />}
    </div>
  );
}

// ─── Regression (incl. multivariate via columns) ──────────────────────────
function RegressionTab() {
  const { setPlots, showPanel } = useCalc();
  const [reg, setReg] = useState<Reg>("linear");
  const [text, setText] = useState<string>(DEFAULT_DATA.map((p) => `${p.x}\t${p.y}`).join("\n"));

  const rows = useMemo(() => text.split(/\n+/).map((l) => l.trim().split(/[\s,\t]+/).map(Number).filter((v) => Number.isFinite(v))).filter((r) => r.length >= 2), [text]);
  const points: Point[] = rows.map((r) => ({ x: r[0], y: r[r.length - 1] }));
  const stats = useMemo(() => {
    if (points.length === 0) return null;
    const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
    return { n: xs.length, meanX: mean(xs), meanY: mean(ys), stdX: pstdev(xs), stdY: pstdev(ys),
      minY: Math.min(...ys), maxY: Math.max(...ys), sumY: ys.reduce((a, b) => a + b, 0),
      corr: points.length > 1 ? jStat.corrcoeff(xs, ys) : NaN,
    };
  }, [points]);

  const fit = useMemo(() => {
    if (points.length < 2) return null;
    try {
      if (reg === "linear")    { const c = polyFit(points, 1); const yh = (x: number) => c[0] + c[1] * x;
        return { expr: `${c[0].toFixed(4)} + ${c[1].toFixed(4)}*x`, r: r2(points, yh) }; }
      if (reg === "quadratic") { const c = polyFit(points, 2); const yh = (x: number) => c[0] + c[1] * x + c[2] * x ** 2;
        return { expr: `${c[0].toFixed(4)} + ${c[1].toFixed(4)}*x + ${c[2].toFixed(4)}*x^2`, r: r2(points, yh) }; }
      if (reg === "cubic")     { const c = polyFit(points, 3); const yh = (x: number) => c[0] + c[1] * x + c[2] * x ** 2 + c[3] * x ** 3;
        return { expr: `${c[0].toFixed(4)} + ${c[1].toFixed(4)}*x + ${c[2].toFixed(4)}*x^2 + ${c[3].toFixed(4)}*x^3`, r: r2(points, yh) }; }
      if (reg === "exponential") {
        const pos = points.filter((p) => p.y > 0); if (pos.length < 2) return null;
        const lin = polyFit(pos.map((p) => ({ x: p.x, y: Math.log(p.y) })), 1);
        const a = Math.exp(lin[0]); const b = lin[1]; const yh = (x: number) => a * Math.exp(b * x);
        return { expr: `${a.toFixed(4)}*exp(${b.toFixed(4)}*x)`, r: r2(points, yh) };
      }
      if (reg === "power") {
        const pos = points.filter((p) => p.x > 0 && p.y > 0); if (pos.length < 2) return null;
        const lin = polyFit(pos.map((p) => ({ x: Math.log(p.x), y: Math.log(p.y) })), 1);
        const a = Math.exp(lin[0]); const b = lin[1]; const yh = (x: number) => a * x ** b;
        return { expr: `${a.toFixed(4)}*x^${b.toFixed(4)}`, r: r2(points, yh) };
      }
      if (reg === "multi") {
        // multivariate linear: rows like  x1 x2 … xk y  →  y = β0 + β1 x1 + …
        const k = rows[0].length - 1;
        if (k < 2) return { expr: "(need ≥ 2 predictors per row)", r: 0 };
        const X: number[][] = rows.map((r) => [1, ...r.slice(0, k)]);
        const y: number[] = rows.map((r) => r[k]);
        const Xt = math.transpose(X) as number[][];
        const XtX = math.multiply(Xt, X) as number[][];
        const Xty = math.multiply(Xt, y) as number[];
        const c = (math.lusolve(XtX, Xty) as number[][]).map((row) => Number(row[0]));
        const yh = (row: number[]) => c[0] + c.slice(1).reduce((a, b, i) => a + b * row[i], 0);
        const m = mean(y);
        const ssTot = y.reduce((a, v) => a + (v - m) ** 2, 0);
        const ssRes = y.reduce((a, v, i) => a + (v - yh(rows[i].slice(0, k))) ** 2, 0);
        const r = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
        const expr = c.map((v, i) => i === 0 ? v.toFixed(4) : `${v >= 0 ? "+" : "−"} ${Math.abs(v).toFixed(4)}·x${i}`).join(" ");
        return { expr, r };
      }
    } catch { return null; }
    return null;
  }, [points, reg, rows]);

  const plotFit = () => {
    if (!fit || reg === "multi") return;
    setPlots((prev) => [
      ...prev,
      { id: `fit_${Date.now()}`, kind: "explicit", enabled: true, color: PLOT_COLORS[2], expr: fit.expr },
    ]);
    showPanel("graph");
  };

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {(["linear","quadratic","cubic","exponential","power","multi"] as Reg[]).map((r) => (
          <button key={r} className="pill-btn !text-[0.6rem]" data-active={reg === r} onClick={() => setReg(r)}>{r}</button>
        ))}
        <button className="pill-btn ml-auto" data-active onClick={plotFit} disabled={!fit || reg === "multi"}>
          <LineChart size={12} /> PLOT FIT
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        <div className="flex flex-col gap-1 min-h-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.6rem] tracking-widest text-muted-foreground">DATA · {reg === "multi" ? "x₁ x₂ … y" : "x y"} per row</span>
            <button className="pill-btn !py-0.5 ml-auto" onClick={() => setText(text + "\n0\t0")}><Plus size={12} /></button>
            <button className="pill-btn !py-0.5" onClick={() => setText("")}><Trash2 size={12} /></button>
          </div>
          <textarea spellCheck={false} className="field flex-1 !text-[0.72rem] !font-mono resize-none" value={text} onChange={(e) => setText(e.target.value)} />
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
                <span className="text-muted-foreground">r</span><span className="neon-text-amber">{Number.isFinite(stats.corr) ? stats.corr.toFixed(4) : "—"}</span>
              </div>
            ) : <span className="text-muted-foreground text-xs">No data</span>}
          </Card>
          <Card title={`REGRESSION · ${reg}`}>
            {fit ? (
              <div className="text-[0.72rem] font-mono space-y-1">
                <div><span className="text-muted-foreground">y = </span><span className="neon-text break-all">{fit.expr}</span></div>
                <div><span className="text-muted-foreground">R² = </span><span className="neon-text-amber">{fit.r.toFixed(6)}</span></div>
              </div>
            ) : <span className="text-muted-foreground text-xs">Need ≥ 2 valid rows</span>}
          </Card>
        </div>
      </div>
    </>
  );
}

// ─── Distribution explorer ────────────────────────────────────────────────
function DistributionTab() {
  const [dist, setDist] = useState<DistName>("normal");
  const [p1, setP1] = useState<number>(0);
  const [p2, setP2] = useState<number>(1);
  const [x, setX] = useState<number>(1);
  const [q, setQ] = useState<number>(0.95);

  const meta = useMemo(() => DIST_META[dist], [dist]);
  const D: any = jStat[dist];
  const safe = <T,>(fn: () => T) => { try { return fn(); } catch { return undefined; } };

  const args1 = meta.params.length === 1 ? [p1] : [p1, p2];

  const pdf = safe(() => D.pdf(x, ...args1));
  const cdf = safe(() => D.cdf(x, ...args1));
  const inv = safe(() => D.inv(q, ...args1));
  const mu  = safe(() => D.mean(...args1));
  const v   = safe(() => D.variance(...args1));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {(["normal","studentt","chisquare","centralF","exponential","beta","gamma","uniform","poisson","binomial"] as DistName[]).map((d) => (
          <button key={d} className="pill-btn !text-[0.6rem]" data-active={dist === d} onClick={() => { setDist(d); const m = DIST_META[d]; setP1(m.defaults[0]); setP2(m.defaults[1] ?? 1); }}>{d}</button>
        ))}
      </div>
      <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-2 grid grid-cols-2 gap-2 text-[0.7rem]">
        <label>{meta.params[0]} <input className="field !py-0.5" type="number" step="any" value={p1} onChange={(e) => setP1(Number(e.target.value))} /></label>
        {meta.params[1] && <label>{meta.params[1]} <input className="field !py-0.5" type="number" step="any" value={p2} onChange={(e) => setP2(Number(e.target.value))} /></label>}
        <label>x <input className="field !py-0.5" type="number" step="any" value={x} onChange={(e) => setX(Number(e.target.value))} /></label>
        <label>quantile q <input className="field !py-0.5" type="number" step="any" min={0} max={1} value={q} onChange={(e) => setQ(Number(e.target.value))} /></label>
      </div>
      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-2 font-mono text-[0.75rem] grid grid-cols-2 gap-x-3 gap-y-0.5">
        <span className="text-muted-foreground">pdf(x)</span><span className="neon-text">{fmt(pdf)}</span>
        <span className="text-muted-foreground">cdf(x)</span><span className="neon-text">{fmt(cdf)}</span>
        <span className="text-muted-foreground">inv(q)</span><span className="neon-text-amber">{fmt(inv)}</span>
        <span className="text-muted-foreground">mean</span><span>{fmt(mu)}</span>
        <span className="text-muted-foreground">variance</span><span>{fmt(v)}</span>
      </div>
    </div>
  );
}

const DIST_META: Record<DistName, { params: string[]; defaults: [number, number?] }> = {
  normal:      { params: ["μ", "σ"],      defaults: [0, 1] },
  studentt:    { params: ["df"],          defaults: [10] },
  chisquare:   { params: ["df"],          defaults: [4] },
  centralF:    { params: ["df₁", "df₂"],  defaults: [5, 10] },
  exponential: { params: ["rate"],        defaults: [1] },
  beta:        { params: ["α", "β"],      defaults: [2, 5] },
  gamma:       { params: ["shape", "rate"], defaults: [2, 1] },
  uniform:     { params: ["a", "b"],      defaults: [0, 1] },
  poisson:     { params: ["λ"],           defaults: [3] },
  binomial:    { params: ["n", "p"],      defaults: [10, 0.5] },
};

// ─── Hypothesis tests ─────────────────────────────────────────────────────
function TestsTab() {
  const [kind, setKind] = useState<"ttest1" | "ttest2" | "paired" | "chisq" | "anova">("ttest1");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {[
          ["ttest1", "one-sample t"], ["ttest2", "two-sample t"], ["paired", "paired t"],
          ["chisq", "χ² GOF"], ["anova", "1-way ANOVA"],
        ].map(([k, lbl]) => (
          <button key={k} className="pill-btn !text-[0.6rem]" data-active={kind === k} onClick={() => setKind(k as typeof kind)}>{lbl}</button>
        ))}
      </div>
      {kind === "ttest1" && <OneSampleT />}
      {kind === "ttest2" && <TwoSampleT />}
      {kind === "paired" && <PairedT />}
      {kind === "chisq"  && <ChisqGOF />}
      {kind === "anova"  && <Anova1 />}
    </div>
  );
}

function dataInput(label: string, value: string, onChange: (v: string) => void) {
  return (
    <label className="block">
      <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">{label}</div>
      <textarea spellCheck={false} className="field !text-[0.72rem] !font-mono w-full h-20 resize-none" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
function parseNums(s: string) { return s.split(/[\s,]+/).map(Number).filter(Number.isFinite); }

function TestResult({ title, rows }: { title: string; rows: Array<[string, string | number]> }) {
  return (
    <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-2 font-mono text-[0.75rem]">
      <div className="text-[0.55rem] tracking-widest neon-text-amber mb-1">{title}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {rows.map(([k, v]) => (<><span key={k + "k"} className="text-muted-foreground">{k}</span><span key={k + "v"} className="neon-text">{v}</span></>))}
      </div>
    </div>
  );
}

function OneSampleT() {
  const [data, setData] = useState("5.1 4.9 5.0 5.3 4.8 5.2 5.0");
  const [mu0, setMu0] = useState(5);
  const xs = parseNums(data);
  const n = xs.length;
  const m = mean(xs), s = Math.sqrt(svar(xs));
  const se = s / Math.sqrt(Math.max(1, n));
  const t = (m - mu0) / (se || NaN);
  const df = n - 1;
  const p = Number.isFinite(t) && df > 0 ? 2 * (1 - jStat.studentt.cdf(Math.abs(t), df)) : NaN;
  return (
    <>
      {dataInput("sample", data, setData)}
      <label className="text-[0.7rem]">μ₀ <input className="field !py-0.5 ml-1" type="number" step="any" value={mu0} onChange={(e) => setMu0(Number(e.target.value))} /></label>
      <TestResult title="H₀: μ = μ₀ · two-sided" rows={[["n", n], ["mean", m.toFixed(4)], ["s", s.toFixed(4)], ["t", fmt(t)], ["df", df], ["p", fmt(p)]]} />
    </>
  );
}
function TwoSampleT() {
  const [a, setA] = useState("12 14 11 13 12 15");
  const [b, setB] = useState("10 9 11 12 8 10");
  const xs = parseNums(a), ys = parseNums(b);
  const ma = mean(xs), mb = mean(ys);
  const va = svar(xs), vb = svar(ys);
  const na = xs.length, nb = ys.length;
  // Welch's t
  const se = Math.sqrt(va / na + vb / nb);
  const t = (ma - mb) / (se || NaN);
  const df = (va / na + vb / nb) ** 2 / ((va / na) ** 2 / Math.max(1, na - 1) + (vb / nb) ** 2 / Math.max(1, nb - 1));
  const p = Number.isFinite(t) && df > 0 ? 2 * (1 - jStat.studentt.cdf(Math.abs(t), df)) : NaN;
  return (
    <>
      {dataInput("sample A", a, setA)} {dataInput("sample B", b, setB)}
      <TestResult title="Welch's two-sample t · two-sided" rows={[["nA / nB", `${na} / ${nb}`], ["x̄A − x̄B", (ma - mb).toFixed(4)], ["t", fmt(t)], ["df", df.toFixed(2)], ["p", fmt(p)]]} />
    </>
  );
}
function PairedT() {
  const [a, setA] = useState("12 14 11 13 12 15");
  const [b, setB] = useState("11 13 12 12 13 14");
  const xs = parseNums(a), ys = parseNums(b);
  const n = Math.min(xs.length, ys.length);
  const d = Array.from({ length: n }, (_, i) => xs[i] - ys[i]);
  const md = mean(d), sd = Math.sqrt(svar(d));
  const t = md / (sd / Math.sqrt(Math.max(1, n)));
  const p = n > 1 ? 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 1)) : NaN;
  return (
    <>
      {dataInput("pre", a, setA)} {dataInput("post", b, setB)}
      <TestResult title="Paired t-test" rows={[["n pairs", n], ["mean diff", md.toFixed(4)], ["sd diff", sd.toFixed(4)], ["t", fmt(t)], ["df", n - 1], ["p", fmt(p)]]} />
    </>
  );
}
function ChisqGOF() {
  const [obs, setObs] = useState("18 22 25 19 16");
  const [exp, setExp] = useState("20 20 20 20 20");
  const o = parseNums(obs), e = parseNums(exp);
  const n = Math.min(o.length, e.length);
  let chi = 0;
  for (let i = 0; i < n; i++) chi += ((o[i] - e[i]) ** 2) / Math.max(1e-9, e[i]);
  const df = n - 1;
  const p = df > 0 ? 1 - jStat.chisquare.cdf(chi, df) : NaN;
  return (
    <>
      {dataInput("observed", obs, setObs)} {dataInput("expected", exp, setExp)}
      <TestResult title="χ² goodness-of-fit" rows={[["bins", n], ["χ²", chi.toFixed(4)], ["df", df], ["p", fmt(p)]]} />
    </>
  );
}
function Anova1() {
  const [text, setText] = useState("12 14 11 13\n10 9 11 12 8\n15 14 16 17");
  const groups = text.split(/\n+/).map(parseNums).filter((g) => g.length > 0);
  const all = groups.flat();
  const grand = mean(all);
  const ssB = groups.reduce((a, g) => a + g.length * (mean(g) - grand) ** 2, 0);
  const ssW = groups.reduce((a, g) => a + g.reduce((s, v) => s + (v - mean(g)) ** 2, 0), 0);
  const dfB = groups.length - 1;
  const dfW = all.length - groups.length;
  const F = (ssB / dfB) / (ssW / dfW);
  const p = dfB > 0 && dfW > 0 ? 1 - jStat.centralF.cdf(F, dfB, dfW) : NaN;
  return (
    <>
      {dataInput("groups (one row per group)", text, setText)}
      <TestResult title="One-way ANOVA" rows={[["groups", groups.length], ["N", all.length], ["SS_between", ssB.toFixed(4)], ["SS_within", ssW.toFixed(4)], ["F", F.toFixed(4)], ["df", `${dfB}, ${dfW}`], ["p", fmt(p)]]} />
    </>
  );
}

// ─── Logistic regression (IRLS for binary y ∈ {0,1}) ─────────────────────
function LogisticTab() {
  const [text, setText] = useState("0.1 0\n0.5 0\n1.0 0\n1.5 1\n2.0 1\n2.5 1\n3.0 1");
  const result = useMemo(() => {
    const rows = text.split(/\n+/).map((l) => l.trim().split(/[\s,\t]+/).map(Number).filter(Number.isFinite)).filter((r) => r.length >= 2);
    if (rows.length < 4) return { err: "need ≥ 4 rows" } as const;
    const k = rows[0].length - 1;
    const X = rows.map((r) => [1, ...r.slice(0, k)]);
    const y = rows.map((r) => r[k]);
    if (y.some((v) => v !== 0 && v !== 1)) return { err: "y must be 0/1" } as const;
    // IRLS
    let beta = new Array(k + 1).fill(0);
    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
    for (let iter = 0; iter < 50; iter++) {
      const p = X.map((row) => sigmoid(row.reduce((a, v, i) => a + v * beta[i], 0)));
      const W = MLMatrix.diag(p.map((pi) => Math.max(1e-6, pi * (1 - pi))));
      const Xm = new MLMatrix(X);
      const XtW = Xm.transpose().mmul(W);
      const H = XtW.mmul(Xm);
      const z = p.map((pi, i) => {
        const eta = X[i].reduce((a, v, j) => a + v * beta[j], 0);
        return eta + (y[i] - pi) / Math.max(1e-6, pi * (1 - pi));
      });
      try {
        const newBeta = new SingularValueDecomposition(H).solve(XtW.mmul(MLMatrix.columnVector(z))).getColumn(0);
        const diff = newBeta.reduce((a, v, i) => a + (v - beta[i]) ** 2, 0);
        beta = newBeta;
        if (diff < 1e-10) break;
      } catch { break; }
    }
    const ll = X.reduce((a, row, i) => {
      const eta = row.reduce((s, v, j) => s + v * beta[j], 0);
      const pi = sigmoid(eta);
      return a + (y[i] === 1 ? Math.log(Math.max(1e-12, pi)) : Math.log(Math.max(1e-12, 1 - pi)));
    }, 0);
    return { beta, ll, n: rows.length, k } as const;
  }, [text]);

  return (
    <>
      {dataInput("rows: x₁ x₂ … y (y ∈ {0,1})", text, (v) => setText(v))}
      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-2 font-mono text-[0.75rem]">
        {"err" in result ? <span className="text-destructive">{result.err}</span> : (
          <>
            <div className="neon-text-amber mb-1">β = [{result.beta.map((b) => b.toFixed(4)).join(", ")}]</div>
            <div className="text-muted-foreground">log-likelihood {result.ll.toFixed(4)}</div>
            <div className="text-muted-foreground">n = {result.n} · predictors = {result.k}</div>
            <div className="text-muted-foreground mt-1">
              P(y=1 | x) = σ(β₀ + β·x)
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-2">
      <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1">{title}</div>
      {children}
    </div>
  );
}
function fmt(v: unknown) {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1e5 || (v !== 0 && Math.abs(v) < 1e-4)) return v.toExponential(4);
  return Number(v.toFixed(6)).toString();
}
