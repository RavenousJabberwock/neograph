// Mini interpreters for languages where shipping a real runtime is overkill.
// Pragmatic, language-flavored — not standards compliant.

import { math } from "./math";
import { graphApi } from "./bridge";

type Emit = (s: string) => void;

// ─── LOGO turtle ──────────────────────────────────────────────────────────
export function runLogo(src: string, emit: Emit) {
  const tokens = src
    .replace(/;[^\n]*/g, " ")
    .replace(/\[/g, " [ ").replace(/\]/g, " ] ")
    .split(/\s+/).filter(Boolean);

  let i = 0;
  const turtle = { x: 0, y: 0, h: 90, down: true, path: [] as Array<[number, number, number, number]> };

  const num = () => {
    const t = tokens[i++];
    const v = Number(t);
    if (!Number.isFinite(v)) throw new Error(`LOGO: expected number, got "${t}"`);
    return v;
  };

  const block = () => {
    if (tokens[i] !== "[") throw new Error("LOGO: expected [");
    i++; const body: string[] = []; let depth = 1;
    while (i < tokens.length && depth > 0) {
      const t = tokens[i++];
      if (t === "[") depth++;
      else if (t === "]") { depth--; if (depth === 0) break; }
      body.push(t);
    }
    return body;
  };

  const exec = (toks: string[]) => {
    let j = 0;
    while (j < toks.length) {
      const cmd = toks[j++].toLowerCase();
      const argN = () => {
        const v = Number(toks[j++]);
        if (!Number.isFinite(v)) throw new Error(`LOGO: bad arg for ${cmd}`);
        return v;
      };
      if (cmd === "fd" || cmd === "forward") {
        const d = argN();
        const rad = (turtle.h * Math.PI) / 180;
        const nx = turtle.x + d * Math.cos(rad);
        const ny = turtle.y + d * Math.sin(rad);
        if (turtle.down) turtle.path.push([turtle.x, turtle.y, nx, ny]);
        turtle.x = nx; turtle.y = ny;
      } else if (cmd === "bk" || cmd === "back") {
        const d = -argN();
        const rad = (turtle.h * Math.PI) / 180;
        const nx = turtle.x + d * Math.cos(rad);
        const ny = turtle.y + d * Math.sin(rad);
        if (turtle.down) turtle.path.push([turtle.x, turtle.y, nx, ny]);
        turtle.x = nx; turtle.y = ny;
      } else if (cmd === "rt" || cmd === "right") turtle.h -= argN();
      else if (cmd === "lt" || cmd === "left") turtle.h += argN();
      else if (cmd === "pu" || cmd === "penup") turtle.down = false;
      else if (cmd === "pd" || cmd === "pendown") turtle.down = true;
      else if (cmd === "home") { turtle.x = 0; turtle.y = 0; turtle.h = 90; }
      else if (cmd === "print") { emit(String(toks[j++])); }
      else if (cmd === "repeat") {
        const n = argN();
        // capture inline block
        const body: string[] = []; let depth = 0;
        if (toks[j] !== "[") throw new Error("LOGO: expected [ after repeat");
        j++; depth = 1;
        while (j < toks.length && depth > 0) {
          const t = toks[j++];
          if (t === "[") depth++;
          else if (t === "]") { depth--; if (depth === 0) break; }
          body.push(t);
        }
        for (let k = 0; k < n; k++) exec(body);
      } else throw new Error(`LOGO: unknown command "${cmd}"`);
    }
  };

  // outer parse uses block()-style for compatibility; run the whole token list
  void block;
  exec(tokens.slice(i));

  emit(`turtle → x=${turtle.x.toFixed(2)} y=${turtle.y.toFixed(2)} h=${turtle.h}°`);
  emit(`segments: ${turtle.path.length}`);
  return turtle;
}

// ─── BASIC (line-numbered) ────────────────────────────────────────────────
export function runBasic(src: string, emit: Emit, dialect: "basic" | "tibasic" = "basic") {
  type Line = { n: number; text: string };
  const lines: Line[] = [];
  for (const raw of src.split(/\r?\n/)) {
    const s = raw.trim(); if (!s) continue;
    const m = s.match(/^(\d+)\s+(.*)$/);
    if (m) lines.push({ n: Number(m[1]), text: m[2] });
    else lines.push({ n: (lines.at(-1)?.n ?? 0) + 10, text: s });
  }
  lines.sort((a, b) => a.n - b.n);
  const index = new Map(lines.map((l, k) => [l.n, k]));

  const scope: Record<string, number | string> = {};
  const stack: Array<{ var: string; to: number; step: number; line: number }> = [];

  const evalExpr = (e: string) => {
    // very loose: substitute graph.add(...) sugar? Skip — use raw math.
    try { return math.evaluate(e, scope as Record<string, unknown>); }
    catch (err) { throw new Error(`expr "${e}": ${(err as Error).message}`); }
  };

  let pc = 0; let steps = 0;
  while (pc < lines.length) {
    if (++steps > 50000) throw new Error("BASIC: step limit (50k)");
    const { text } = lines[pc];
    const stmts = text.split(":").map((s) => s.trim()).filter(Boolean);

    let jumped = false;
    for (const stmt of stmts) {
      const up = stmt.toUpperCase();
      const tag = dialect === "tibasic" ? "TI-BASIC" : "BASIC";
      void tag;

      if (up.startsWith("REM")) continue;
      if (up.startsWith("PRINT") || up.startsWith("DISP")) {
        const rest = stmt.replace(/^(PRINT|DISP)\s*/i, "");
        if (!rest) { emit(""); continue; }
        const parts = rest.split(";").map((p) => p.trim()).filter(Boolean);
        const out: string[] = [];
        for (const p of parts) {
          if (p.startsWith('"') && p.endsWith('"')) out.push(p.slice(1, -1));
          else out.push(String(evalExpr(p)));
        }
        emit(out.join(" "));
      } else if (up.startsWith("LET ") || /^[A-Za-z_]\w*\s*=/.test(stmt)) {
        const body = up.startsWith("LET ") ? stmt.slice(4) : stmt;
        const m = body.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
        if (!m) throw new Error(`BASIC: bad assignment "${stmt}"`);
        scope[m[1]] = evalExpr(m[2]);
      } else if (up.startsWith("GOTO")) {
        const n = Number(stmt.split(/\s+/)[1]);
        const k = index.get(n); if (k === undefined) throw new Error(`GOTO ${n}: no such line`);
        pc = k; jumped = true; break;
      } else if (up.startsWith("IF ")) {
        const m = stmt.match(/^IF\s+(.+?)\s+THEN\s+(.+)$/i);
        if (!m) throw new Error(`BASIC: malformed IF "${stmt}"`);
        const cond = Number(evalExpr(m[1])) !== 0;
        if (cond) {
          const th = m[2].trim();
          const ln = Number(th);
          if (!Number.isNaN(ln)) {
            const k = index.get(ln); if (k === undefined) throw new Error(`THEN ${ln}: no such line`);
            pc = k; jumped = true; break;
          } else {
            // run inline statement
            stmts.push(th);
          }
        }
      } else if (up.startsWith("FOR ")) {
        const m = stmt.match(/^FOR\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i);
        if (!m) throw new Error(`BASIC: malformed FOR "${stmt}"`);
        scope[m[1]] = Number(evalExpr(m[2]));
        stack.push({
          var: m[1], to: Number(evalExpr(m[3])),
          step: m[4] ? Number(evalExpr(m[4])) : 1, line: pc,
        });
      } else if (up.startsWith("NEXT")) {
        const f = stack.at(-1); if (!f) throw new Error("NEXT without FOR");
        const v = (scope[f.var] as number) + f.step;
        scope[f.var] = v;
        if ((f.step > 0 && v <= f.to) || (f.step < 0 && v >= f.to)) {
          pc = f.line; jumped = true; break;
        } else {
          stack.pop();
        }
      } else if (up === "END" || up === "STOP") {
        return;
      } else if (up.startsWith("PLOT")) {
        // PLOT "sin(x)"   → push to graph
        const m = stmt.match(/^PLOT\s+"(.+)"$/i);
        if (!m) throw new Error('PLOT: use PLOT "expr"');
        graphApi.add(m[1]);
        emit(`▸ plotted ${m[1]}`);
      } else {
        throw new Error(`BASIC: unknown statement "${stmt}"`);
      }
    }
    if (!jumped) pc++;
  }
}

// ─── Mathematica-ish (very thin wrapper over mathjs) ──────────────────────
// Persistent scope across lines, head-name rewriting (Sin→sin, Integrate→…),
// and a few special forms mathjs doesn't ship with names Mathematica uses.
const MMA_HEAD_MAP: Record<string, string> = {
  sin: "sin", cos: "cos", tan: "tan", exp: "exp", log: "log", sqrt: "sqrt",
  abs: "abs", floor: "floor", ceiling: "ceil", round: "round",
  integrate: "integrate",   // handled specially below
  d: "derivative",          // D[x^2, x]  → derivative("x^2","x")
  simplify: "simplify", expand: "expand", factor: "factor",
  solve: "solve", n: "number", plot: "plot",
};

export function runMathematica(src: string, emit: Emit) {
  emit("ℳ symbolic · evaluating each line via mathjs (Mathematica-flavor head syntax)");
  const scope: Record<string, unknown> = {};

  const rewrite = (s: string): string => {
    // Strip (* comments *)
    let t = s.replace(/\(\*[\s\S]*?\*\)/g, "").trim();
    // Constants
    t = t.replace(/\bPi\b/g, "pi").replace(/\bE\b/g, "e").replace(/\bInfinity\b/g, "Infinity");
    // Head[args]  → head(args), preferring the map but falling back to lower-case.
    //              Brackets are balanced by walking the string so nested calls survive.
    let out = "";
    let i = 0;
    while (i < t.length) {
      const m = /([A-Za-z]\w*)\[/.exec(t.slice(i));
      if (!m || m.index !== 0) {
        // copy one char and continue scanning for next head
        const next = t.indexOf("[", i);
        if (next < 0) { out += t.slice(i); break; }
        // verify it looks like Head[
        const head = /([A-Za-z]\w*)$/.exec(t.slice(i, next));
        if (!head) { out += t.slice(i, next + 1); i = next + 1; continue; }
        out += t.slice(i, next - head[1].length);
        i = next - head[1].length;
        continue;
      }
      const headRaw = m[1];
      const headLc = headRaw.toLowerCase();
      const mapped = MMA_HEAD_MAP[headLc] ?? headLc;
      // walk to the matching ]
      let depth = 1;
      let j = m[0].length;
      while (j < t.slice(i).length && depth > 0) {
        const ch = t.slice(i)[j++];
        if (ch === "[") depth++;
        else if (ch === "]") depth--;
      }
      const innerRaw = t.slice(i).slice(m[0].length, j - 1);
      const inner = rewrite(innerRaw); // recurse for nested heads
      // Special forms
      if (mapped === "integrate") {
        // Integrate[f, x]  → indefinite integral via derivative inversion is hard;
        //                   fall back to numeric: integrate symbolic only when math.js can.
        // We hand to math.parse + symbolic if available; else flag.
        out += `__integrate(${JSON.stringify(innerRaw)})`;
      } else if (mapped === "derivative") {
        out += `__derivative(${JSON.stringify(innerRaw)})`;
      } else {
        out += `${mapped}(${inner})`;
      }
      i += j;
    }
    // := and =  → assignment (mathjs uses =)
    out = out.replace(/:=/g, "=");
    return out;
  };

  // Inject helpers into scope so the rewritten JS-style calls resolve.
  scope.__integrate = (raw: string) => {
    const parts = raw.split(",").map((p) => p.trim());
    if (parts.length < 2) return "Integrate: needs (expr, var)";
    const [expr, v] = parts;
    try {
      // mathjs has no symbolic integrator; offer a definite numeric form if bounds given,
      // else return a passthrough symbolic string.
      if (parts.length === 4) {
        const [, , a, b] = parts;
        const f = math.compile(expr);
        const lo = Number(math.evaluate(a, scope));
        const hi = Number(math.evaluate(b, scope));
        const N = 2000;
        const h = (hi - lo) / N;
        let s = 0.5 * (f.evaluate({ ...scope, [v]: lo }) + f.evaluate({ ...scope, [v]: hi }));
        for (let k = 1; k < N; k++) s += f.evaluate({ ...scope, [v]: lo + k * h });
        return s * h;
      }
      return `∫(${expr}) d${v}  · symbolic integration not available (mathjs has no integrator)`;
    } catch (e) { return `Integrate error: ${(e as Error).message}`; }
  };
  scope.__derivative = (raw: string) => {
    const parts = raw.split(",").map((p) => p.trim());
    if (parts.length < 2) return "D: needs (expr, var)";
    const [expr, v] = parts;
    try { return math.derivative(expr, v).toString(); }
    catch (e) { return `D error: ${(e as Error).message}`; }
  };

  for (const raw of src.split(/\r?\n/)) {
    const s = raw.replace(/\(\*[\s\S]*?\*\)/g, "").trim();
    if (!s) continue;
    const js = rewrite(s);
    try {
      const v = math.evaluate(js, scope);
      emit(`In:  ${s}`);
      if (v !== undefined) emit(`Out: ${typeof v === "function" ? "<function>" : String(v)}`);
    } catch (e) {
      emit(`✖ ${s} — ${(e as Error).message}`);
    }
  }
}

// (Simulated C/C++/R interpreter removed — replaced by real WebR runtime in IdePanel.)
