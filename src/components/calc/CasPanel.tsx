import { useCalc } from "@/lib/calc/store";
import { math } from "@/lib/calc/math";
import { useState } from "react";
import { Sparkles, Sigma, FunctionSquare, Variable } from "lucide-react";

type Op = "simplify" | "expand" | "derivative" | "integrate" | "factor";

const OPS: { id: Op; label: string; icon: React.ComponentType<{ size?: number }>; placeholder: string }[] = [
  { id: "simplify", label: "Simplify", icon: Sparkles, placeholder: "(x+1)^2 - x^2" },
  { id: "expand",    label: "Expand",   icon: Variable, placeholder: "(x+2)(x-3)" },
  { id: "derivative",label: "d/dx",     icon: FunctionSquare, placeholder: "x^3 + sin(x)" },
  { id: "integrate", label: "∫ dx (sym.)", icon: Sigma, placeholder: "x^2" },
  { id: "factor",    label: "Rational", icon: Variable, placeholder: "1/3 + 2/5" },
];

export function CasPanel() {
  const { casMode, setCasMode } = useCalc();
  const [op, setOp] = useState<Op>("simplify");
  const [input, setInput] = useState("(x+1)^2 - x^2");
  const [result, setResult] = useState<string>("");
  const [steps, setSteps] = useState<string[]>([]);

  const run = () => {
    try {
      const node = math.parse(input);
      let out = "";
      const trace: string[] = [`parse → ${node.toString()}`];
      switch (op) {
        case "simplify": {
          const s = math.simplify(node);
          out = s.toString();
          trace.push(`simplify → ${out}`);
          break;
        }
        case "expand": {
          const s = math.simplify(node, [
            "n1 * (n2 + n3) -> n1*n2 + n1*n3",
            "(n1 + n2) * n3 -> n1*n3 + n2*n3",
          ]);
          out = s.toString();
          trace.push(`distribute → ${out}`);
          out = math.simplify(out).toString();
          trace.push(`simplify → ${out}`);
          break;
        }
        case "derivative": {
          const d = math.derivative(node, "x");
          out = d.toString();
          trace.push(`d/dx → ${out}`);
          const s = math.simplify(out).toString();
          if (s !== out) { trace.push(`simplify → ${s}`); out = s; }
          break;
        }
        case "integrate": {
          // mathjs has no symbolic integrate. Handle polynomial terms only.
          out = symbolicIntegratePoly(input);
          trace.push(`∫ polynomial rule → ${out}`);
          break;
        }
        case "factor": {
          // exact rational arithmetic
          const f = math.evaluate(input);
          const frac = math.fraction(f);
          out = `${frac.s * frac.n}/${frac.d} ≈ ${Number(f).toString()}`;
          trace.push(`exact rational → ${out}`);
          break;
        }
      }
      setResult(out);
      setSteps(trace);
    } catch (e) {
      setResult(`ERR: ${(e as Error).message}`);
      setSteps([]);
    }
  };

  const Icon = OPS.find((o) => o.id === op)!.icon;

  return (
    <div className="p-3 flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <span className="text-[0.6rem] tracking-widest text-muted-foreground">SYMBOLIC ENGINE</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[0.55rem] tracking-widest text-muted-foreground">MODE</span>
          <button className="pill-btn" data-active={casMode} onClick={() => setCasMode(!casMode)}>
            {casMode ? "ON" : "OFF"}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {OPS.map((o) => (
          <button key={o.id} className="pill-btn" data-active={op === o.id} onClick={() => { setOp(o.id); setInput(o.placeholder); }}>
            <o.icon size={12} /> {o.label}
          </button>
        ))}
      </div>
      <div className="flex items-stretch gap-2">
        <Icon size={16} />
        <input
          className="field flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") run(); }}
          placeholder={OPS.find((o) => o.id === op)!.placeholder}
          spellCheck={false}
        />
        <button className="pill-btn" data-active={true} onClick={run}>EVAL</button>
      </div>
      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-3 shadow-[var(--shadow-inset)]">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1">RESULT</div>
        <div className="text-base neon-text font-mono break-all min-h-6">{result || <span className="text-muted-foreground">—</span>}</div>
      </div>
      <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-3 flex-1 min-h-0 overflow-auto">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1">STACK TRACE</div>
        <ol className="text-[0.72rem] font-mono space-y-0.5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-foreground w-5 text-right">{(i + 1).toString().padStart(2, "0")}</span>
              <span className="neon-text-amber">{s}</span>
            </li>
          ))}
          {steps.length === 0 && <li className="text-muted-foreground">No trace yet.</li>}
        </ol>
      </div>
    </div>
  );
}

// Polynomial-only symbolic integration (sum of a*x^n terms, including constants).
function symbolicIntegratePoly(input: string): string {
  const node = math.simplify(input);
  const expanded = math.simplify(node, [
    "n1 * (n2 + n3) -> n1*n2 + n1*n3",
    "(n1 + n2) * n3 -> n1*n3 + n2*n3",
  ]).toString();
  // Split on + / - at top level
  const tokens = expanded.replace(/\s+/g, "").replace(/-/g, "+-").split("+").filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    // match a*x^n, a*x, a, x^n, x
    const m = t.match(/^(-?\d*\.?\d*)\*?x(?:\^(-?\d+(?:\.\d+)?))?$/) ||
              t.match(/^(-?\d+(?:\.\d+)?)$/);
    if (!m) return `(no closed form for ${t})`;
    if (m.length === 2) {
      // constant
      out.push(`${m[1]}*x`);
    } else {
      let a = m[1]; if (a === "" || a === "+") a = "1"; if (a === "-") a = "-1";
      const n = m[2] ? Number(m[2]) : 1;
      const np1 = n + 1;
      if (np1 === 0) { out.push(`${a}*ln(abs(x))`); continue; }
      out.push(`(${a}/${np1})*x^${np1}`);
    }
  }
  return math.simplify(out.join(" + ")).toString() + " + C";
}
