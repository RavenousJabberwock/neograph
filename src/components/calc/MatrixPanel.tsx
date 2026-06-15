import { useMemo, useState } from "react";
import { math } from "@/lib/calc/math";
import {
  Matrix as MLMatrix, EigenvalueDecomposition, SingularValueDecomposition,
  LuDecomposition, QrDecomposition, CholeskyDecomposition,
} from "ml-matrix";
import { Plus, Minus, RotateCcw, Sigma } from "lucide-react";

type Op =
  | "rref" | "det" | "inv" | "transpose" | "rank" | "trace"
  | "eigen" | "svd" | "lu" | "qr" | "cholesky" | "null" | "colspace"
  | "mulAB" | "addAB" | "kron" | "solve";

const SEED_A: number[][] = [
  [4, 1, 2, 0.5],
  [1, 3, 0, 1],
  [2, 0, 5, 1.5],
  [0.5, 1, 1.5, 2],
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

function toArr(m: MLMatrix): number[][] { return m.to2DArray(); }

export function MatrixPanel() {
  const [a, setA] = useState<number[][]>(SEED_A);
  const [b, setB] = useState<number[][]>(SEED_B);
  const [op, setOp] = useState<Op>("eigen");

  type Block = { title: string; matrix?: number[][]; scalar?: number; list?: number[]; complexList?: { real: number; imag: number }[]; note?: string };
  type R = { blocks: Block[]; steps?: string[]; err?: string };

  const result = useMemo<R>(() => {
    try {
      const A = new MLMatrix(a);
      switch (op) {
        case "rref": { const r = rref(a); return { blocks: [{ title: "rref(A)", matrix: r.matrix }], steps: r.steps }; }
        case "det":  return { blocks: [{ title: "det(A)", scalar: Number(math.det(a)) }] };
        case "inv":  return { blocks: [{ title: "A⁻¹", matrix: math.inv(a) as number[][] }] };
        case "transpose": return { blocks: [{ title: "Aᵀ", matrix: math.transpose(a) as number[][] }] };
        case "trace": return { blocks: [{ title: "tr(A)", scalar: A.isSquare() ? A.trace() : NaN, note: A.isSquare() ? "" : "non-square" }] };
        case "rank": {
          // count nonzero pivots in RREF
          const r = rref(a);
          const rk = r.matrix.filter((row) => row.some((v) => Math.abs(v) > 1e-10)).length;
          return { blocks: [{ title: "rank(A)", scalar: rk }] };
        }
        case "eigen": {
          if (!A.isSquare()) return { blocks: [], err: "Eigen requires a square matrix" };
          const e = new EigenvalueDecomposition(A);
          const real = e.realEigenvalues, imag = e.imaginaryEigenvalues;
          return {
            blocks: [
              { title: "eigenvalues", complexList: real.map((r, i) => ({ real: r, imag: imag[i] })) },
              { title: "eigenvectors (cols)", matrix: toArr(e.eigenvectorMatrix) },
            ],
          };
        }
        case "svd": {
          const s = new SingularValueDecomposition(A);
          return {
            blocks: [
              { title: "U", matrix: toArr(s.leftSingularVectors) },
              { title: "Σ (singular values)", list: s.diagonal },
              { title: "Vᵀ", matrix: toArr(s.rightSingularVectors.transpose()) },
              { title: "rank", scalar: s.rank },
              { title: "cond(A)", scalar: s.condition },
            ],
          };
        }
        case "lu": {
          const lu = new LuDecomposition(A);
          return {
            blocks: [
              { title: "L", matrix: toArr(lu.lowerTriangularMatrix) },
              { title: "U", matrix: toArr(lu.upperTriangularMatrix) },
              { title: "P (pivots)", list: lu.pivotPermutationVector },
            ],
          };
        }
        case "qr": {
          const qr = new QrDecomposition(A);
          return {
            blocks: [
              { title: "Q", matrix: toArr(qr.orthogonalMatrix) },
              { title: "R", matrix: toArr(qr.upperTriangularMatrix) },
            ],
          };
        }
        case "cholesky": {
          if (!A.isSquare()) return { blocks: [], err: "Cholesky requires square SPD matrix" };
          const ch = new CholeskyDecomposition(A);
          return { blocks: [{ title: "L (A = LLᵀ)", matrix: toArr(ch.lowerTriangularMatrix) }] };
        }
        case "null": {
          const r = rref(a);
          const rows = a.length, cols = a[0].length;
          const pivotCols: number[] = [];
          for (let i = 0, j = 0; i < rows && j < cols; j++) {
            if (Math.abs(r.matrix[i][j] - 1) < 1e-9) { pivotCols.push(j); i++; }
          }
          const freeCols = Array.from({ length: cols }, (_, j) => j).filter((j) => !pivotCols.includes(j));
          if (freeCols.length === 0) return { blocks: [{ title: "null space", note: "trivial — {0}" }] };
          const basis: number[][] = [];
          for (const fc of freeCols) {
            const v = new Array(cols).fill(0);
            v[fc] = 1;
            for (let i = 0; i < pivotCols.length; i++) v[pivotCols[i]] = -r.matrix[i][fc];
            basis.push(v);
          }
          return { blocks: [{ title: "null(A) basis (rows)", matrix: basis }] };
        }
        case "colspace": {
          const r = rref(a);
          const pivotCols: number[] = [];
          for (let i = 0, j = 0; i < a.length && j < a[0].length; j++) {
            if (Math.abs(r.matrix[i][j] - 1) < 1e-9) { pivotCols.push(j); i++; }
          }
          const basis = pivotCols.map((j) => a.map((row) => row[j]));
          return { blocks: [{ title: "col(A) basis (cols of A at pivot positions)", matrix: math.transpose(basis) as number[][] }] };
        }
        case "mulAB": return { blocks: [{ title: "A · B", matrix: math.multiply(a, b) as number[][] }] };
        case "addAB": return { blocks: [{ title: "A + B", matrix: math.add(a, b) as number[][] }] };
        case "kron":  return { blocks: [{ title: "A ⊗ B", matrix: math.kron(a, b) as number[][] }] };
        case "solve": {
          // Solve A x = b₁ (first column of B). Falls back to least squares via SVD.
          const bcol = b.map((r) => r[0]);
          if (a.length !== bcol.length) return { blocks: [], err: "rows(A) must match rows(B) for A·x = b" };
          try {
            const x = math.lusolve(a, bcol) as number[][];
            return { blocks: [{ title: "x  s.t.  A·x = b₁", matrix: x }] };
          } catch {
            const svd = new SingularValueDecomposition(A);
            const x = svd.solve(MLMatrix.columnVector(bcol));
            return { blocks: [{ title: "x  (least-squares, SVD)", matrix: toArr(x) }] };
          }
        }
      }
    } catch (e) {
      return { blocks: [], err: (e as Error).message };
    }
    return { blocks: [] };
  }, [a, b, op]);

  const needB = op === "mulAB" || op === "addAB" || op === "kron" || op === "solve";

  const opGroups: { title: string; ops: Op[] }[] = [
    { title: "BASIC",   ops: ["rref", "det", "inv", "transpose", "trace", "rank"] },
    { title: "DECOMP",  ops: ["eigen", "svd", "lu", "qr", "cholesky"] },
    { title: "SPACES",  ops: ["null", "colspace"] },
    { title: "A vs B",  ops: ["mulAB", "addAB", "kron", "solve"] },
  ];

  return (
    <div className="flex flex-col h-full p-3 gap-2 overflow-auto">
      <div className="flex flex-wrap gap-3">
        {opGroups.map((g) => (
          <div key={g.title} className="flex items-center gap-1">
            <span className="text-[0.55rem] tracking-widest text-muted-foreground mr-1">{g.title}</span>
            {g.ops.map((o) => (
              <button key={o} className="pill-btn !text-[0.6rem]" data-active={op === o} onClick={() => setOp(o)}>{o}</button>
            ))}
          </div>
        ))}
      </div>

      <MatEditor label="A" m={a} setM={setA} accent="cyan" />
      {needB && <MatEditor label="B" m={b} setM={setB} accent="amber" />}

      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-2 space-y-3">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground flex items-center gap-1">
          <Sigma size={10} /> RESULT · {op}
        </div>
        {result.err && <div className="text-destructive text-xs">{result.err}</div>}
        {result.blocks.map((blk, i) => (
          <div key={i}>
            <div className="text-[0.6rem] tracking-widest neon-text-amber mb-1">{blk.title}</div>
            {blk.note && <div className="text-muted-foreground text-[0.7rem]">{blk.note}</div>}
            {blk.scalar !== undefined && (
              <div className="text-base neon-text font-mono">{Number.isFinite(blk.scalar) ? Number(blk.scalar).toString() : "—"}</div>
            )}
            {blk.list && (
              <div className="flex flex-wrap gap-1 text-[0.72rem] font-mono">
                {blk.list.map((v, k) => (
                  <span key={k} className="px-2 py-0.5 rounded-sm border border-border neon-text">{v.toFixed(4)}</span>
                ))}
              </div>
            )}
            {blk.complexList && (
              <div className="flex flex-wrap gap-1 text-[0.72rem] font-mono">
                {blk.complexList.map((c, k) => (
                  <span key={k} className="px-2 py-0.5 rounded-sm border border-border neon-text">
                    {Number(c.real).toFixed(4)}{Math.abs(c.imag) > 1e-9 ? ` ${c.imag < 0 ? "−" : "+"} ${Math.abs(c.imag).toFixed(4)}i` : ""}
                  </span>
                ))}
              </div>
            )}
            {blk.matrix && <Matrix matrix={blk.matrix} readonly />}
          </div>
        ))}
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
  if (matrix.length === 0) return <div className="text-muted-foreground text-xs">∅</div>;
  return (
    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${matrix[0]?.length ?? 1}, minmax(0, 1fr))` }}>
      {matrix.map((row, i) =>
        row.map((v, j) => (
          readonly ? (
            <div key={`${i}-${j}`} className="px-2 py-1 text-[0.72rem] font-mono neon-text border border-border rounded-sm bg-[oklch(0.13_0.02_250)] text-right tabular-nums min-w-[3.5rem]">
              {Math.abs(v) < 1e-10 ? "0" : Number(v.toFixed(4)).toString()}
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
