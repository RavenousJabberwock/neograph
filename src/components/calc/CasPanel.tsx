import { useCalc } from "@/lib/calc/store";
import { math } from "@/lib/calc/math";
import { solveZero, taylor, numericLimit, adaptiveSimpson, compileFn } from "@/lib/calc/numerics";
import { renderExpr, tex } from "@/lib/calc/latex";
import { useMemo, useState } from "react";
import { Sparkles, Sigma, FunctionSquare, Variable, Crosshair, Infinity as InfIcon, ScrollText } from "lucide-react";

type Op = "simplify" | "expand" | "derivative" | "integrate" | "solve" | "limit" | "taylor" | "factor";

const OPS: { id: Op; label: string; icon: React.ComponentType<{ size?: number }>; placeholder: string }[] = [
  { id: "simplify",   label: "simplify",   icon: Sparkles,        placeholder: "(x+1)^2 - x^2" },
  { id: "expand",     label: "expand",     icon: Variable,        placeholder: "(x+2)(x-3)(x+1)" },
  { id: "derivative", label: "d/dx",       icon: FunctionSquare,  placeholder: "x^3*sin(x)" },
  { id: "integrate",  label: "∫ a→b",      icon: Sigma,           placeholder: "exp(-x^2)" },
  { id: "solve",      label: "solve = 0",  icon: Crosshair,       placeholder: "x^3 - 6*x^2 + 11*x - 6" },
  { id: "limit",      label: "lim",        icon: InfIcon,         placeholder: "sin(x)/x" },
  { id: "taylor",     label: "taylor",     icon: ScrollText,      placeholder: "exp(x)" },
  { id: "factor",     label: "rational",   icon: Variable,        placeholder: "1/3 + 2/5" },
];

export function CasPanel() {
  const { casMode, setCasMode } = useCalc();
  const [op, setOp] = useState<Op>("simplify");
  const [input, setInput] = useState("(x+1)^2 - x^2");
  // extra params
  const [a, setA] = useState<string>("0");
  const [b, setB] = useState<string>("1");
  const [varName, setVarName] = useState<string>("x");
  const [order, setOrder] = useState<number>(5);

  const [result, setResult] = useState<string>("");
  const [resultTex, setResultTex] = useState<string>("");
  const [steps, setSteps] = useState<string[]>([]);

  const run = () => {
    try {
      let out = ""; let outTex = "";
      const trace: string[] = [`parse → ${input}`];
      switch (op) {
        case "simplify": {
          const s = math.simplify(input).toString();
          out = s; trace.push(`simplify → ${s}`); break;
        }
        case "expand": {
          const s = math.simplify(input, [
            "n1 * (n2 + n3) -> n1*n2 + n1*n3",
            "(n1 + n2) * n3 -> n1*n3 + n2*n3",
          ]).toString();
          out = math.simplify(s).toString();
          trace.push(`distribute → ${s}`); trace.push(`simplify → ${out}`); break;
        }
        case "derivative": {
          const d = math.derivative(input, varName).toString();
          trace.push(`d/d${varName} → ${d}`);
          out = math.simplify(d).toString();
          if (out !== d) trace.push(`simplify → ${out}`);
          break;
        }
        case "integrate": {
          // numerical adaptive Simpson on [a, b]
          const f = compileFn(input, [varName]);
          const r = adaptiveSimpson((x) => f({ [varName]: x }), Number(a), Number(b), { tol: 1e-10 });
          out = `${r.value}    (≈, ${r.calls} evals)`;
          outTex = `\\displaystyle \\int_{${a}}^{${b}} ${exprTex(input)}\\,d${varName} \\;\\approx\\; ${r.value.toExponential(8)}`;
          trace.push(`adaptive Simpson on [${a}, ${b}] → ${r.value}`);
          break;
        }
        case "solve": {
          const r = solveZero(input, varName);
          out = r.roots.length ? r.roots.map((v) => Number(v.toFixed(10))).join(", ") : "(no real roots found)";
          outTex = `${varName} \\in \\{${r.roots.map((v) => v.toFixed(6)).join(",\\ ")}\\}`;
          trace.push(`method · ${r.method}`);
          if ("degree" in r) trace.push(`polynomial degree ${r.degree}`);
          if ("iterations" in r) trace.push(`Newton iters ${r.iterations}, converged=${r.converged}`);
          break;
        }
        case "limit": {
          const both = numericLimit(input, varName, Number(a));
          const L = numericLimit(input, varName, Number(a), "left");
          const R = numericLimit(input, varName, Number(a), "right");
          out = `${Number.isFinite(both) ? both : "DNE"}`;
          outTex = `\\lim_{${varName} \\to ${a}} ${exprTex(input)} = ${Number.isFinite(both) ? both : "\\text{DNE}"}`;
          trace.push(`left  → ${L}`);
          trace.push(`right → ${R}`);
          trace.push(`combined → ${out}`);
          break;
        }
        case "taylor": {
          const series = taylor(input, varName, Number(a), Math.max(1, Math.min(20, order)));
          out = series + (order > 0 ? ` + O((${varName} − ${a})^${order + 1})` : "");
          outTex = `${exprTex(series)} \\;+\\; \\mathcal{O}\\!\\left((${varName} - ${a})^{${order + 1}}\\right)`;
          trace.push(`expanded around ${varName}=${a}, order ${order}`);
          break;
        }
        case "factor": {
          const v = math.evaluate(input);
          const fr = math.fraction(v) as { s: number; n: number; d: number };
          out = `${fr.s * fr.n}/${fr.d}  ≈  ${Number(v).toString()}`;
          outTex = `\\frac{${fr.s * fr.n}}{${fr.d}} \\approx ${Number(v).toString()}`;
          trace.push(`exact rational → ${out}`);
          break;
        }
      }
      setResult(out);
      setResultTex(outTex || exprTex(out));
      setSteps(trace);
    } catch (e) {
      setResult(`ERR: ${(e as Error).message}`); setResultTex(""); setSteps([]);
    }
  };

  const Icon = OPS.find((o) => o.id === op)!.icon;
  const inputTex = useMemo(() => renderExpr(input, { displayMode: false }), [input]);

  return (
    <div className="p-3 flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <span className="text-[0.6rem] tracking-widest text-muted-foreground">SYMBOLIC ENGINE</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[0.55rem] tracking-widest text-muted-foreground">MODE</span>
          <button className="pill-btn" data-active={casMode} onClick={() => setCasMode(!casMode)}>{casMode ? "ON" : "OFF"}</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {OPS.map((o) => (
          <button key={o.id} className="pill-btn !text-[0.6rem]" data-active={op === o.id} onClick={() => { setOp(o.id); setInput(o.placeholder); }}>
            <o.icon size={11} /> {o.label}
          </button>
        ))}
      </div>
      <div className="flex items-stretch gap-2">
        <Icon size={16} />
        <input className="field flex-1" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder={OPS.find((o) => o.id === op)!.placeholder} spellCheck={false} />
        <button className="pill-btn" data-active onClick={run}>EVAL</button>
      </div>
      {(op === "integrate" || op === "solve" || op === "derivative" || op === "limit" || op === "taylor") && (
        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] tracking-widest text-muted-foreground">
          <label>var <input className="field !py-0.5 !w-12 !text-[0.7rem]" value={varName} onChange={(e) => setVarName(e.target.value || "x")} /></label>
          {(op === "integrate" || op === "limit" || op === "taylor") && (
            <label>{op === "integrate" ? "a" : op === "limit" ? `${varName}→` : "around"} <input className="field !py-0.5 !w-16 !text-[0.7rem]" value={a} onChange={(e) => setA(e.target.value)} /></label>
          )}
          {op === "integrate" && (
            <label>b <input className="field !py-0.5 !w-16 !text-[0.7rem]" value={b} onChange={(e) => setB(e.target.value)} /></label>
          )}
          {op === "taylor" && (
            <label>order <input className="field !py-0.5 !w-14 !text-[0.7rem]" type="number" min={1} max={20} value={order} onChange={(e) => setOrder(Number(e.target.value))} /></label>
          )}
        </div>
      )}

      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-3 shadow-[var(--shadow-inset)] space-y-2">
        <div>
          <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">INPUT · LaTeX</div>
          <div className="text-base" dangerouslySetInnerHTML={{ __html: inputTex }} />
        </div>
        <div>
          <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-0.5">RESULT</div>
          {resultTex
            ? <div className="text-base neon-text" dangerouslySetInnerHTML={{ __html: tex(resultTex, { displayMode: true }) }} />
            : <div className="text-base neon-text font-mono break-all min-h-6">{result || <span className="text-muted-foreground">—</span>}</div>
          }
          {resultTex && result && (
            <div className="text-[0.7rem] text-muted-foreground font-mono mt-1 break-all">{result}</div>
          )}
        </div>
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

// helper: convert expression string → TeX safely
function exprTex(expr: string): string {
  try { return math.parse(expr).toTex({ parenthesis: "auto", implicit: "hide" }); }
  catch { return expr.replace(/[\\{}&%$#_^~]/g, (m) => "\\" + m); }
}
