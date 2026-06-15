// Numerics panel — ODE (RK45), adaptive Simpson, Newton/Brent root finder.
import { useMemo, useState } from "react";
import { useCalc } from "@/lib/calc/store";
import { math, PLOT_COLORS } from "@/lib/calc/math";
import { rk45, adaptiveSimpson, newton, brent, compileFn } from "@/lib/calc/numerics";
import { Activity, Sigma, Crosshair, LineChart } from "lucide-react";

type Mode = "ode" | "quad" | "root";

export function NumericsPanel() {
  const { setPlots, showPanel } = useCalc();
  const [mode, setMode] = useState<Mode>("ode");

  return (
    <div className="flex flex-col h-full p-2 gap-2 overflow-auto">
      <div className="flex gap-1">
        <button className="pill-btn" data-active={mode === "ode"} onClick={() => setMode("ode")}><Activity size={12} /> ODE · RK45</button>
        <button className="pill-btn" data-active={mode === "quad"} onClick={() => setMode("quad")}><Sigma size={12} /> ∫ adaptive</button>
        <button className="pill-btn" data-active={mode === "root"} onClick={() => setMode("root")}><Crosshair size={12} /> root</button>
      </div>
      {mode === "ode" && <OdeUI setPlots={setPlots} showPanel={showPanel} />}
      {mode === "quad" && <QuadUI />}
      {mode === "root" && <RootUI />}
    </div>
  );
}

function OdeUI({ setPlots, showPanel }: { setPlots: ReturnType<typeof useCalc>["setPlots"]; showPanel: ReturnType<typeof useCalc>["showPanel"] }) {
  const [expr, setExpr] = useState("y - t^2 + 1");
  const [t0, setT0] = useState(0);
  const [y0, setY0] = useState(0.5);
  const [tEnd, setTEnd] = useState(2);
  const [tol, setTol] = useState(1e-6);

  const result = useMemo(() => {
    try {
      const f = compileFn(expr, ["t", "y"]);
      return rk45((t, y) => f({ t, y }), Number(t0), Number(y0), Number(tEnd), { tol: Number(tol) });
    } catch (e) { return { ts: [], ys: [], steps: 0, rejected: 0, err: (e as Error).message }; }
  }, [expr, t0, y0, tEnd, tol]);

  const pushToGraph = () => {
    // Build a parametric plot that linearly interpolates the trajectory
    if (result.ts.length < 2) return;
    const pts = result.ts.map((t, i) => [t, result.ys[i]]);
    // pack as JS array literal usable by parametric definition? Simpler: explicit polyline as many tiny linear pieces is overkill;
    // we approximate with a polynomial fit cubic spline → use mathjs interpolation. Quick win: dump up to 200 samples as a piecewise via "approx" key. We'll just push as a parametric using nearest neighbor.
    // Use param: x(s) = ts[floor(s*N)] + frac, y(s) = ys[...]
    const N = pts.length - 1;
    const xExpr = pts.map((p) => p[0].toFixed(6)).join(",");
    const yExpr = pts.map((p) => p[1].toFixed(6)).join(",");
    setPlots((prev) => [
      ...prev,
      {
        id: `ode_${Date.now()}`,
        kind: "parametric",
        enabled: true,
        color: PLOT_COLORS[(prev.length + 2) % PLOT_COLORS.length],
        expr:  `_xs=[${xExpr}]; _xs[floor(t)+1] + (t - floor(t)) * (_xs[floor(t)+2] - _xs[floor(t)+1])`,
        expr2: `_ys=[${yExpr}]; _ys[floor(t)+1] + (t - floor(t)) * (_ys[floor(t)+2] - _ys[floor(t)+1])`,
        tMin: 0, tMax: N - 1e-9,
      },
    ]);
    showPanel("graph");
  };

  return (
    <>
      <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-2 grid grid-cols-2 gap-2 text-[0.7rem]">
        <label className="col-span-2">y′(t) = <input className="field !py-1 !text-[0.72rem]" value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} /></label>
        <label>t₀ <input className="field !py-0.5 !text-[0.72rem]" type="number" value={t0} onChange={(e) => setT0(Number(e.target.value))} /></label>
        <label>y(t₀) <input className="field !py-0.5 !text-[0.72rem]" type="number" value={y0} onChange={(e) => setY0(Number(e.target.value))} /></label>
        <label>t_end <input className="field !py-0.5 !text-[0.72rem]" type="number" value={tEnd} onChange={(e) => setTEnd(Number(e.target.value))} /></label>
        <label>tol <input className="field !py-0.5 !text-[0.72rem]" type="number" value={tol} step="any" onChange={(e) => setTol(Number(e.target.value))} /></label>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-[0.62rem] tracking-widest text-muted-foreground">
          steps {result.ts.length - 1} · rejected {("rejected" in result ? result.rejected : 0)}
        </div>
        <button className="pill-btn ml-auto" data-active disabled={result.ts.length < 2} onClick={pushToGraph}>
          <LineChart size={12} /> push to graph
        </button>
      </div>
      <div className="rounded-md border border-border p-2 max-h-48 overflow-auto text-[0.7rem] font-mono">
        {"err" in result && (result as { err: string }).err
          ? <span className="text-destructive">{(result as { err: string }).err}</span>
          : (
          <table className="w-full">
            <thead><tr className="text-muted-foreground"><th className="text-left">t</th><th className="text-left">y(t)</th></tr></thead>
            <tbody>
              {result.ts.slice(0, 80).map((t, i) => (
                <tr key={i}><td className="neon-text-amber pr-3">{t.toFixed(6)}</td><td className="neon-text">{result.ys[i].toFixed(6)}</td></tr>
              ))}
              {result.ts.length > 80 && <tr><td colSpan={2} className="text-muted-foreground text-center">… {result.ts.length - 80} more</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function QuadUI() {
  const [expr, setExpr] = useState("sin(x)^2 / x");
  const [a, setA] = useState(0.0001);
  const [b, setB] = useState(Math.PI);
  const [tol, setTol] = useState(1e-9);

  const out = useMemo(() => {
    try {
      const f = compileFn(expr);
      return adaptiveSimpson((x) => f({ x }), Number(a), Number(b), { tol: Number(tol) });
    } catch (e) { return { err: (e as Error).message } as const; }
  }, [expr, a, b, tol]);

  return (
    <>
      <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-2 grid grid-cols-2 gap-2 text-[0.7rem]">
        <label className="col-span-2">f(x) = <input className="field !py-1 !text-[0.72rem]" value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} /></label>
        <label>a <input className="field !py-0.5 !text-[0.72rem]" type="number" step="any" value={a} onChange={(e) => setA(Number(e.target.value))} /></label>
        <label>b <input className="field !py-0.5 !text-[0.72rem]" type="number" step="any" value={b} onChange={(e) => setB(Number(e.target.value))} /></label>
        <label className="col-span-2">tol <input className="field !py-0.5 !text-[0.72rem]" type="number" step="any" value={tol} onChange={(e) => setTol(Number(e.target.value))} /></label>
      </div>
      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-3 text-sm font-mono">
        {"err" in out ? <span className="text-destructive">{out.err}</span> : (
          <>
            <div>∫ <span className="text-muted-foreground">f(x) dx</span> ≈ <span className="neon-text">{out.value.toExponential(9)}</span></div>
            <div className="text-[0.65rem] text-muted-foreground tracking-widest mt-1">{out.calls} function evaluations</div>
          </>
        )}
      </div>
    </>
  );
}

function RootUI() {
  const [expr, setExpr] = useState("cos(x) - x");
  const [method, setMethod] = useState<"newton" | "brent">("newton");
  const [x0, setX0] = useState(0);
  const [a, setA] = useState(-1);
  const [b, setB] = useState(2);

  const out = useMemo(() => {
    try {
      const f = compileFn(expr);
      if (method === "newton") return { ...newton((x) => f({ x }), Number(x0)) } as const;
      return { ...brent((x) => f({ x }), Number(a), Number(b)) } as const;
    } catch (e) { return { err: (e as Error).message } as const; }
  }, [expr, method, x0, a, b]);

  return (
    <>
      <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-2 grid grid-cols-2 gap-2 text-[0.7rem]">
        <label className="col-span-2">f(x) = <input className="field !py-1 !text-[0.72rem]" value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} /></label>
        <div className="col-span-2 flex gap-1">
          <button className="pill-btn" data-active={method === "newton"} onClick={() => setMethod("newton")}>newton</button>
          <button className="pill-btn" data-active={method === "brent"} onClick={() => setMethod("brent")}>brent</button>
        </div>
        {method === "newton" && (
          <label>x₀ <input className="field !py-0.5 !text-[0.72rem]" type="number" step="any" value={x0} onChange={(e) => setX0(Number(e.target.value))} /></label>
        )}
        {method === "brent" && (
          <>
            <label>a <input className="field !py-0.5 !text-[0.72rem]" type="number" step="any" value={a} onChange={(e) => setA(Number(e.target.value))} /></label>
            <label>b <input className="field !py-0.5 !text-[0.72rem]" type="number" step="any" value={b} onChange={(e) => setB(Number(e.target.value))} /></label>
          </>
        )}
      </div>
      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-3 text-sm font-mono">
        {"err" in out ? <span className="text-destructive">{out.err}</span> : (
          <>
            <div>root ≈ <span className="neon-text">{Number(out.x).toFixed(12)}</span></div>
            <div className="text-[0.65rem] text-muted-foreground tracking-widest mt-1">
              converged={String(out.converged)} · iterations={out.iterations}
            </div>
          </>
        )}
      </div>
    </>
  );
}

void math; // silence unused warn
