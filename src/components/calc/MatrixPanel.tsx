import { useMemo, useState } from "react";
import { math } from "@/lib/calc/math";
import { Plus, Minus, RotateCcw, Sigma } from "lucide-react";

type Op = "rref" | "det" | "inv" | "transpose" | "mulAB" | "addAB";

const SEED_A: number[][] = [
  [1, 2, 3, 4],
  [2, 3, 1, 5],
  [3, 5, 4, 9],
];
const SEED_B: number[][] = [
  [1, 0, 1],
  [0, 1, 2],
  [1, 1, 0],
  [2, 0, 1],
];

function newMatrix(rows: number, cols: number, fill = 0): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

function clone(m: number[][]) { return m.map((r) => r.slice()); }

function rref(input: number[][]): { matrix: number[][]; steps: string[] } {
  const m = clone(input);
  const rows = m.length, cols = m[0].length;
  const steps: string[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let piv = r;
    for (let i = r + 1; i < rows; i++) if (Math.abs(m[i][c]) > Math.abs(m[piv][c])) piv = i;
    if (Math.abs(m[piv][c]) < 1e-12) continue;
    if (piv !== r) { [m[r], m[piv]] = [m[piv], m[r]]; steps.push(`R${r + 1} ↔ R${piv + 1}`); }
    const pv = m[r][c];
    if (Math.abs(pv - 1) > 1e-12) {
      for (let j = 0; j < cols; j++) m[r][j] /= pv;
      steps.push(`R${r + 1} ← R${r + 1} / ${pv.toFixed(4)}`);
    }
    for (let i = 0; i < rows; i++) {
      if (i !== r && Math.abs(m[i][c]) > 1e-12) {
        const f = m[i][c];
        for (let j = 0; j < cols; j++) m[i][j] -= f * m[r][j];
        steps.push(`R${i + 1} ← R${i + 1} − (${f.toFixed(4)})·R${r + 1}`);
      }
    }
    r++;
  }
  return { matrix: m.map((row) => row.map((v) => (Math.abs(v) < 1e-12 ? 0 : v))), steps };
}

export function MatrixPanel() {
  const [a, setA] = useState<number[][]>(SEED_A);
  const [b, setB] = useState<number[][]>(SEED_B);
  const [op, setOp] = useState<Op>("rref");

  const result = useMemo<{ matrix?: number[][]; scalar?: number; steps?: string[]; err?: string }>(() => {
    try {
      switch (op) {
        case "rref":      return rref(a);
        case "det":       return { scalar: Number(math.det(a)) };
        case "inv":       return { matrix: (math.inv(a) as number[][]) };
        case "transpose": return { matrix: math.transpose(a) as number[][] };
        case "mulAB":     return { matrix: math.multiply(a, b) as number[][] };
        case "addAB":     return { matrix: math.add(a, b) as number[][] };
      }
    } catch (e) {
      return { err: (e as Error).message };
    }
  }, [a, b, op]);

  return (
    <div className="flex flex-col h-full p-3 gap-2 overflow-auto">
      <div className="flex flex-wrap gap-1.5">
        {(["rref", "det", "inv", "transpose", "mulAB", "addAB"] as Op[]).map((o) => (
          <button key={o} className="pill-btn" data-active={op === o} onClick={() => setOp(o)}>{o}</button>
        ))}
      </div>

      <MatEditor label="A" m={a} setM={setA} accent="cyan" />
      {(op === "mulAB" || op === "addAB") && <MatEditor label="B" m={b} setM={setB} accent="amber" />}

      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-2">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
          <Sigma size={10} /> RESULT
        </div>
        {result.err && <div className="text-destructive text-xs">{result.err}</div>}
        {result.scalar !== undefined && (
          <div className="text-base neon-text font-mono">det(A) = {result.scalar.toFixed(6)}</div>
        )}
        {result.matrix && <Matrix matrix={result.matrix} readonly />}
        {result.steps && result.steps.length > 0 && (
          <ol className="mt-2 text-[0.7rem] font-mono space-y-0.5">
            {result.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground w-6 text-right">{(i + 1).toString().padStart(2, "0")}</span>
                <span className="neon-text-amber">{s}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function MatEditor({ label, m, setM, accent }: { label: string; m: number[][]; setM: (m: number[][]) => void; accent: "cyan" | "amber" }) {
  return (
    <div className="rounded-md border border-border bg-[oklch(0.2_0.03_250)] p-2">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[0.7rem] tracking-widest ${accent === "amber" ? "neon-text-amber" : "neon-text"}`}>
          {label} ({m.length}×{m[0]?.length ?? 0})
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button className="pill-btn !px-1.5" onClick={() => setM([...m, new Array(m[0]?.length ?? 1).fill(0)])} title="add row"><Plus size={10} />R</button>
          <button className="pill-btn !px-1.5" onClick={() => m.length > 1 && setM(m.slice(0, -1))} title="rm row"><Minus size={10} />R</button>
          <button className="pill-btn !px-1.5" onClick={() => setM(m.map((r) => [...r, 0]))} title="add col"><Plus size={10} />C</button>
          <button className="pill-btn !px-1.5" onClick={() => (m[0]?.length ?? 0) > 1 && setM(m.map((r) => r.slice(0, -1)))} title="rm col"><Minus size={10} />C</button>
          <button className="pill-btn !px-1.5" onClick={() => setM(newMatrix(m.length, m[0]?.length ?? 1))} title="zero"><RotateCcw size={10} /></button>
        </div>
      </div>
      <Matrix matrix={m} onChange={setM} />
    </div>
  );
}

function Matrix({ matrix, onChange, readonly }: { matrix: number[][]; onChange?: (m: number[][]) => void; readonly?: boolean }) {
  return (
    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${matrix[0]?.length ?? 1}, minmax(0, 1fr))` }}>
      {matrix.map((row, i) =>
        row.map((v, j) => (
          readonly ? (
            <div key={`${i}-${j}`} className="px-2 py-1 text-[0.72rem] font-mono neon-text border border-border rounded-sm bg-[oklch(0.13_0.02_250)] text-right tabular-nums">
              {Math.abs(v) < 1e-12 ? "0" : Number(v.toFixed(4)).toString()}
            </div>
          ) : (
            <input
              key={`${i}-${j}`}
              type="number"
              step="any"
              className="field !py-1 !px-1 !text-[0.72rem] text-right tabular-nums w-16"
              value={v}
              onChange={(e) => {
                if (!onChange) return;
                const next = matrix.map((r) => r.slice());
                next[i][j] = Number(e.target.value);
                onChange(next);
              }}
            />
          )
        )),
      )}
    </div>
  );
}
