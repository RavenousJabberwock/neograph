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
export function runMathematica(src: string, emit: Emit) {
  emit("ℳ simulated · evaluating each line via mathjs (Mathematica-flavor)");
  for (const line of src.split(/\r?\n/)) {
    const s = line.replace(/\(\*.*?\*\)/g, "").trim();
    if (!s) continue;
    // Tiny syntactic glue:  Sin[x] → sin(x), Pi → pi, E → e, := / =
    const js = s
      .replace(/\bPi\b/g, "pi")
      .replace(/\bE\b/g, "e")
      .replace(/([A-Za-z]\w*)\[/g, (_m, n) => `${(n as string).toLowerCase()}(`)
      .replace(/\]/g, ")")
      .replace(/:=/g, "=");
    try {
      const v = math.evaluate(js);
      emit(`In:  ${s}`);
      emit(`Out: ${String(v)}`);
    } catch (e) {
      emit(`✖ ${s} — ${(e as Error).message}`);
    }
  }
}

// ─── Pseudo-C / pseudo-R: simulated compile + interpret of math/print only ─
export function runSimulated(src: string, emit: Emit, label: string) {
  emit(`◆ ${label} — running in simulation mode (no native runtime in browser).`);
  emit(`◆ recognised: printf/print/cout statements + arithmetic expressions.`);
  const lines = src.split(/\r?\n/);
  let n = 0;
  for (const raw of lines) {
    const s = raw.trim();
    if (!s || s.startsWith("//") || s.startsWith("#") || s.startsWith("/*")) continue;

    // printf("...", a, b)  /  cout << x << "..."  /  print(x)  /  cat(x)
    const pf = s.match(/printf\s*\(\s*"([^"]*)"(?:\s*,\s*(.+))?\)\s*;?/);
    if (pf) {
      const fmt = pf[1].replace(/\\n/g, "\n");
      const args = (pf[2] ?? "").split(",").map((a) => a.trim()).filter(Boolean);
      let i = 0;
      const out = fmt.replace(/%[difsg]/g, () => {
        try { return String(math.evaluate(args[i++] ?? "")); } catch { return "?"; }
      });
      emit(out);
      n++; continue;
    }
    const cout = s.match(/cout\s*((?:<<\s*(?:"[^"]*"|[^<;]+)\s*)+);?/);
    if (cout) {
      let out = "";
      for (const m of cout[1].matchAll(/<<\s*("([^"]*)"|[^<;]+)/g)) {
        const tok = (m[1] ?? "").trim();
        if (tok.startsWith('"') && tok.endsWith('"')) out += tok.slice(1, -1);
        else if (tok === "endl") out += "\n";
        else { try { out += String(math.evaluate(tok)); } catch { out += "?"; } }
      }
      emit(out);
      n++; continue;
    }
    const pr = s.match(/^(?:print|cat)\s*\((.+)\)\s*;?$/);
    if (pr) { try { emit(String(math.evaluate(pr[1]))); } catch { emit("?"); } n++; continue; }
    // Bare expression
    try { const v = math.evaluate(s.replace(/;$/, "")); emit(`= ${v}`); n++; } catch { /* skip */ }
  }
  emit(`◆ ${n} statement(s) simulated.`);
}
