import { useCalc } from "@/lib/calc/store";
import { math, type PlotExpr } from "@/lib/calc/math";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";

export function TablePanel() {
  const { plots } = useCalc();
  const explicit = plots.filter((p) => p.kind === "explicit" && p.enabled);
  const [selected, setSelected] = useState<string | null>(explicit[0]?.id ?? null);
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [step, setStep] = useState(0.5);

  const active: PlotExpr | undefined = explicit.find((p) => p.id === selected) ?? explicit[0];

  const rows = useMemo(() => {
    if (!active) return [];
    let compiled;
    try { compiled = math.compile(active.expr); } catch { return []; }
    const r: { x: number; y: number | string }[] = [];
    const s = Math.max(1e-6, Math.abs(step));
    for (let x = xMin; x <= xMax + 1e-9; x += s) {
      let y: number | string;
      try {
        const v = Number(compiled.evaluate({ x }));
        y = Number.isFinite(v) ? Number(v.toFixed(6)) : "—";
      } catch { y = "ERR"; }
      r.push({ x: Number(x.toFixed(6)), y });
      if (r.length > 800) break;
    }
    return r;
  }, [active, xMin, xMax, step]);

  const exportCsv = () => {
    if (!active) return;
    const lines = ["x,y", ...rows.map((r) => `${r.x},${r.y}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `table_${active.id}.csv`;
    a.click();
  };

  return (
    <div className="p-3 flex flex-col gap-2 h-full">
      <div className="flex items-center">
        <span className="text-[0.6rem] tracking-widest text-muted-foreground">TABLE</span>
        <button className="pill-btn ml-auto" onClick={exportCsv} disabled={!active}>
          <Download size={12} />CSV
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select className="field col-span-2 !py-1 text-[0.72rem]" value={active?.id ?? ""} onChange={(e) => setSelected(e.target.value)}>
          {explicit.length === 0 && <option value="">No explicit curves</option>}
          {explicit.map((p) => <option key={p.id} value={p.id}>{p.expr}</option>)}
        </select>
        <div>
          <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">X MIN</div>
          <input type="number" className="field !py-1 text-[0.72rem]" value={xMin} onChange={(e) => setXMin(Number(e.target.value))} />
        </div>
        <div>
          <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">X MAX</div>
          <input type="number" className="field !py-1 text-[0.72rem]" value={xMax} onChange={(e) => setXMax(Number(e.target.value))} />
        </div>
        <div className="col-span-2">
          <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">STEP</div>
          <input type="number" step="0.1" className="field !py-1 text-[0.72rem]" value={step} onChange={(e) => setStep(Number(e.target.value))} />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border">
        <table className="w-full text-[0.72rem] font-mono">
          <thead className="sticky top-0 bg-[oklch(0.22_0.03_250)] text-muted-foreground">
            <tr><th className="text-left px-3 py-1.5">X</th><th className="text-left px-3 py-1.5">Y</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 ? "bg-[oklch(0.2_0.03_250)]" : ""}>
                <td className="px-3 py-0.5 neon-text-amber">{r.x}</td>
                <td className="px-3 py-0.5 neon-text">{r.y}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={2} className="px-3 py-4 text-center text-muted-foreground">No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
