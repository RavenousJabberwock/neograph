import { useCalc } from "@/lib/calc/store";
import { math } from "@/lib/calc/math";
import { useMemo, useState } from "react";
import { Crosshair, Zap } from "lucide-react";

type Mode = "root" | "min" | "max" | "yAtX" | "xAtY" | "intersect" | "integral";

export function GSolvePanel() {
  const { plots, viewport } = useCalc();
  const explicit = plots.filter((p) => p.kind === "explicit" && p.enabled);
  const [fid, setFid] = useState<string>(explicit[0]?.id ?? "");
  const [gid, setGid] = useState<string>(explicit[1]?.id ?? explicit[0]?.id ?? "");
  const [mode, setMode] = useState<Mode>("root");
  const [xVal, setXVal] = useState<number>(1);
  const [yVal, setYVal] = useState<number>(0);
  const [aVal, setAVal] = useState<number>(viewport.xMin);
  const [bVal, setBVal] = useState<number>(viewport.xMax);
  const [output, setOutput] = useState<string>("");

  const fExpr = explicit.find((p) => p.id === fid)?.expr ?? "";
  const gExpr = explicit.find((p) => p.id === gid)?.expr ?? "";

  const compile = (e: string) => {
    try { return math.compile(e); } catch { return null; }
  };

  const evalAt = (expr: string, x: number) => {
    const c = compile(expr); if (!c) return NaN;
    try { return Number(c.evaluate({ x })); } catch { return NaN; }
  };

  const result = useMemo(() => {
    if (!fExpr) return "";
    const N = 1200;
    const xs: number[] = [];
    for (let i = 0; i <= N; i++) xs.push(viewport.xMin + ((viewport.xMax - viewport.xMin) * i) / N);
    const ys = xs.map((x) => evalAt(fExpr, x));

    const bisect = (f: (x: number) => number, a: number, b: number) => {
      let fa = f(a), fb = f(b);
      if (!Number.isFinite(fa) || !Number.isFinite(fb) || fa * fb > 0) return null;
      for (let i = 0; i < 80; i++) {
        const m = (a + b) / 2; const fm = f(m);
        if (!Number.isFinite(fm)) return null;
        if (Math.abs(fm) < 1e-10 || (b - a) < 1e-12) return m;
        if (fa * fm < 0) { b = m; fb = fm; } else { a = m; fa = fm; }
      }
      return (a + b) / 2;
    };
    try {
      switch (mode) {
        case "root": {
          const f = (x: number) => evalAt(fExpr, x);
          const roots: number[] = [];
          for (let i = 0; i < N; i++) {
            if (Number.isFinite(ys[i]) && Number.isFinite(ys[i + 1]) && ys[i] * ys[i + 1] < 0) {
              const r = bisect(f, xs[i], xs[i + 1]);
              if (r != null) roots.push(r);
            }
          }
          if (!roots.length) return "no roots in viewport";
          return roots.map((r, i) => `x${i + 1} = ${r.toFixed(6)}`).join("\n");
        }
        case "min":
        case "max": {
          let bestI = 0;
          for (let i = 1; i < ys.length; i++) {
            if (!Number.isFinite(ys[i])) continue;
            if (!Number.isFinite(ys[bestI])) { bestI = i; continue; }
            if (mode === "min" ? ys[i] < ys[bestI] : ys[i] > ys[bestI]) bestI = i;
          }
          return `${mode === "min" ? "min" : "max"} ≈ (${xs[bestI].toFixed(6)}, ${ys[bestI].toFixed(6)})`;
        }
        case "yAtX": {
          const y = evalAt(fExpr, xVal);
          return `f(${xVal}) = ${Number.isFinite(y) ? y.toFixed(8) : "undefined"}`;
        }
        case "xAtY": {
          const f = (x: number) => evalAt(fExpr, x) - yVal;
          const sols: number[] = [];
          for (let i = 0; i < N; i++) {
            const fa = ys[i] - yVal, fb = ys[i + 1] - yVal;
            if (Number.isFinite(fa) && Number.isFinite(fb) && fa * fb < 0) {
              const r = bisect(f, xs[i], xs[i + 1]);
              if (r != null) sols.push(r);
            }
          }
          if (!sols.length) return "no solutions in viewport";
          return sols.map((r, i) => `x${i + 1} = ${r.toFixed(6)}`).join("\n");
        }
        case "intersect": {
          if (!gExpr) return "pick a second curve";
          const f = (x: number) => evalAt(fExpr, x) - evalAt(gExpr, x);
          const diffs = xs.map(f);
          const sols: number[] = [];
          for (let i = 0; i < N; i++) {
            if (Number.isFinite(diffs[i]) && Number.isFinite(diffs[i + 1]) && diffs[i] * diffs[i + 1] < 0) {
              const r = bisect(f, xs[i], xs[i + 1]);
              if (r != null) sols.push(r);
            }
          }
          if (!sols.length) return "no intersection in viewport";
          return sols.map((r, i) => `(${r.toFixed(6)}, ${evalAt(fExpr, r).toFixed(6)})`).join("\n");
        }
        case "integral": {
          const n = 1000;
          const step = (bVal - aVal) / n;
          let acc = 0;
          for (let i = 0; i <= n; i++) {
            const x = aVal + i * step;
            const w = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
            const y = evalAt(fExpr, x);
            if (!Number.isFinite(y)) return "undefined in interval";
            acc += w * y;
          }
          return `∫_${aVal}^${bVal} f dx ≈ ${(acc * step / 3).toFixed(8)}  (Simpson, n=${n})`;
        }
      }
    } catch (e) {
      return `err: ${(e as Error).message}`;
    }
    return "";
  }, [mode, fExpr, gExpr, xVal, yVal, aVal, bVal, viewport.xMin, viewport.xMax]);

  return (
    <div className="flex flex-col h-full p-3 gap-2 overflow-auto">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">f(x)</div>
          <select className="field !py-1 text-[0.72rem]" value={fid} onChange={(e) => setFid(e.target.value)}>
            {explicit.length === 0 && <option value="">— none —</option>}
            {explicit.map((p) => <option key={p.id} value={p.id}>{p.expr}</option>)}
          </select>
        </div>
        <div>
          <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">g(x) for intersect</div>
          <select className="field !py-1 text-[0.72rem]" value={gid} onChange={(e) => setGid(e.target.value)}>
            {explicit.map((p) => <option key={p.id} value={p.id}>{p.expr}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["root", "min", "max", "yAtX", "xAtY", "intersect", "integral"] as Mode[]).map((m) => (
          <button key={m} className="pill-btn" data-active={mode === m} onClick={() => setMode(m)}>
            <Crosshair size={10} /> {m}
          </button>
        ))}
      </div>

      {mode === "yAtX" && (
        <Field label="X" v={xVal} onChange={setXVal} />
      )}
      {mode === "xAtY" && (
        <Field label="Y" v={yVal} onChange={setYVal} />
      )}
      {mode === "integral" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="A" v={aVal} onChange={setAVal} />
          <Field label="B" v={bVal} onChange={setBVal} />
        </div>
      )}

      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-3 flex-1 min-h-0 overflow-auto">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
          <Zap size={10} /> RESULT
        </div>
        <pre className="text-[0.78rem] neon-text font-mono whitespace-pre-wrap">{output || result || "—"}</pre>
        <button className="pill-btn mt-2" onClick={() => setOutput(result)}>STORE</button>
      </div>

      <div className="text-[0.55rem] tracking-widest text-muted-foreground">
        scan domain = current graph viewport [{viewport.xMin.toFixed(2)}, {viewport.xMax.toFixed(2)}]
      </div>
    </div>
  );
}

function Field({ label, v, onChange }: { label: string; v: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">{label}</div>
      <input type="number" step="any" className="field !py-1 text-[0.72rem]" value={v} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
