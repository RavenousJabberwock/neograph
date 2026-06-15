// Extensible terminal command registry.
import { math } from "./math";
import { graphApi, getGraphSnapshot } from "./bridge";
import { newton, solveZero, taylor, numericLimit, adaptiveSimpson, compileFn } from "./numerics";

export interface CommandCtx {
  args: string[];
  raw: string;
  print: (s: string) => void;
  scope: Record<string, unknown>;
}

export type CommandHandler = (ctx: CommandCtx) => void | Promise<void>;

export interface CommandDef {
  name: string;
  help: string;
  run: CommandHandler;
}

const registry = new Map<string, CommandDef>();

export function registerCommand(def: CommandDef) { registry.set(def.name, def); }
export function unregisterCommand(name: string) { registry.delete(name); }
export function listCommands(): CommandDef[] {
  return [...registry.values()].sort((a, b) => a.name.localeCompare(b.name));
}
export function lookupCommand(name: string) { return registry.get(name); }

// ─── Built-ins ────────────────────────────────────────────────────────────
registerCommand({
  name: "help", help: "help [cmd]   ·   list commands or detail one",
  run: ({ args, print }) => {
    if (args[0]) {
      const c = registry.get(args[0]);
      if (!c) return print(`unknown command: ${args[0]}`);
      return print(c.help);
    }
    for (const c of listCommands()) print(`  ${c.name.padEnd(12)}  ${c.help.split("·")[1]?.trim() ?? c.help}`);
  },
});
registerCommand({ name: "clear", help: "clear · wipe console (handled by host)", run: () => { /* host */ } });
registerCommand({ name: "cls",   help: "cls   · alias of clear",                run: () => { /* host */ } });
registerCommand({
  name: "echo", help: "echo <…>  · print arguments",
  run: ({ args, print }) => print(args.join(" ")),
});
registerCommand({
  name: "=", help: "= <expr>   · evaluate with mathjs",
  run: ({ raw, print, scope }) => {
    const expr = raw.slice(raw.indexOf("=") + 1).trim();
    try {
      const v = math.evaluate(expr, scope);
      print(String(v));
    } catch (e) { print(`✖ ${(e as Error).message}`); }
  },
});
registerCommand({
  name: "let", help: "let x = expr · bind a variable",
  run: ({ raw, print, scope }) => {
    const m = raw.match(/^let\s+([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (!m) return print("usage: let name = expr");
    try {
      const v = math.evaluate(m[2], scope);
      scope[m[1]] = v;
      print(`${m[1]} := ${String(v)}`);
    } catch (e) { print(`✖ ${(e as Error).message}`); }
  },
});
registerCommand({
  name: "vars", help: "vars   · list bound variables",
  run: ({ print, scope }) => {
    const ks = Object.keys(scope);
    if (ks.length === 0) return print("(none)");
    for (const k of ks) print(`  ${k} = ${String(scope[k])}`);
  },
});
registerCommand({
  name: "simplify", help: "simplify <expr> · CAS simplify",
  run: ({ raw, print }) => {
    const e = raw.slice("simplify".length).trim();
    try { print(math.simplify(e).toString()); } catch (err) { print(`✖ ${(err as Error).message}`); }
  },
});
registerCommand({
  name: "diff", help: "diff <expr> [var]  · symbolic derivative",
  run: ({ raw, args, print }) => {
    const v = args.at(-1)?.length === 1 ? args.pop()! : "x";
    const e = raw.replace(/^diff\s+/, "").trim().replace(new RegExp(`\\s+${v}$`), "");
    try { print(math.derivative(e, v).toString()); } catch (err) { print(`✖ ${(err as Error).message}`); }
  },
});
registerCommand({
  name: "solve", help: "solve <expr>=0 [near guess]  · roots",
  run: ({ raw, print }) => {
    const m = raw.match(/^solve\s+(.+?)(?:\s+near\s+(-?\d+(?:\.\d+)?))?$/);
    if (!m) return print("usage: solve <expr> [near <guess>]");
    const expr = m[1].includes("=") ? `(${m[1].split("=")[0]}) - (${m[1].split("=")[1]})` : m[1];
    const r = solveZero(expr, "x", m[2] ? Number(m[2]) : undefined);
    print(`method: ${r.method}`);
    print(`roots:  ${r.roots.map((v) => v.toFixed(8)).join(", ") || "(none)"}`);
  },
});
registerCommand({
  name: "limit", help: "limit <expr> as x->a   · numerical two-sided limit",
  run: ({ raw, print }) => {
    const m = raw.match(/^limit\s+(.+?)\s+as\s+([A-Za-z_]\w*)\s*->\s*(-?\d+(?:\.\d+)?|inf|-inf)$/i);
    if (!m) return print("usage: limit <expr> as x -> a");
    const target = /inf/i.test(m[3]) ? (m[3].startsWith("-") ? -1e8 : 1e8) : Number(m[3]);
    const v = numericLimit(m[1], m[2], target);
    print(`limit ≈ ${Number.isFinite(v) ? v : "diverges / undefined"}`);
  },
});
registerCommand({
  name: "taylor", help: "taylor <expr> around x=a order n   · Taylor series",
  run: ({ raw, print }) => {
    const m = raw.match(/^taylor\s+(.+?)\s+around\s+([A-Za-z_]\w*)\s*=\s*(-?\d+(?:\.\d+)?)\s+order\s+(\d+)$/);
    if (!m) return print("usage: taylor <expr> around x=a order n");
    try { print(taylor(m[1], m[2], Number(m[3]), Number(m[4]))); }
    catch (e) { print(`✖ ${(e as Error).message}`); }
  },
});
registerCommand({
  name: "integrate", help: "integrate <expr> from a to b   · adaptive Simpson",
  run: ({ raw, print }) => {
    const m = raw.match(/^integrate\s+(.+?)\s+from\s+(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)$/);
    if (!m) return print("usage: integrate <expr> from a to b");
    const f = compileFn(m[1]);
    const { value, calls } = adaptiveSimpson((x) => f({ x }), Number(m[2]), Number(m[3]));
    print(`∫ ≈ ${value}    (${calls} evals)`);
  },
});
registerCommand({
  name: "newton", help: "newton <expr> at x0   · root finding from initial guess",
  run: ({ raw, print }) => {
    const m = raw.match(/^newton\s+(.+?)\s+at\s+(-?\d+(?:\.\d+)?)$/);
    if (!m) return print("usage: newton <expr> at <x0>");
    const f = compileFn(m[1]);
    const r = newton((x) => f({ x }), Number(m[2]));
    print(`x = ${r.x}   (converged=${r.converged}, iters=${r.iterations})`);
  },
});

// graph.* commands
registerCommand({
  name: "plot", help: "plot <expr>   · push curve to Graph window",
  run: ({ raw, print }) => {
    const e = raw.slice(4).trim();
    if (!e) return print("usage: plot <expr>");
    const id = graphApi.add(e);
    print(`▸ added ${id}`);
  },
});
registerCommand({
  name: "plots", help: "plots   · list curves on the Graph",
  run: ({ print }) => {
    const list = graphApi.list();
    if (list.length === 0) return print("(no plots)");
    for (const p of list) print(`  ${p.id}  ${p.kind.padEnd(10)} ${p.expr}${p.enabled ? "" : "  (off)"}`);
  },
});
registerCommand({
  name: "clear-plots", help: "clear-plots · remove all curves", run: ({ print }) => { graphApi.clear(); print("✓ cleared"); },
});
registerCommand({
  name: "view", help: "view   · print current viewport",
  run: ({ print }) => print(JSON.stringify(graphApi.view())),
});
registerCommand({
  name: "set-view", help: "set-view xmin xmax ymin ymax   · resize viewport",
  run: ({ args, print }) => {
    if (args.length !== 4) return print("usage: set-view xmin xmax ymin ymax");
    const [a, b, c, d] = args.map(Number);
    graphApi.setView(a, b, c, d);
    print("✓ viewport updated");
  },
});
registerCommand({
  name: "snap", help: "snap   · capture graph window → data URL length",
  run: ({ print }) => { const u = getGraphSnapshot(); print(u ? `image/png · ${u.length} bytes` : "(no graph canvas)"); },
});

registerCommand({
  name: "date", help: "date / now · ISO timestamp",
  run: ({ print }) => print(new Date().toISOString()),
});
registerCommand({ name: "now",  help: "alias · date", run: ({ print }) => print(new Date().toISOString()) });

registerCommand({
  name: "rand", help: "rand [n=1]   · uniform [0,1) sample(s)",
  run: ({ args, print }) => {
    const n = Math.max(1, Math.min(64, Number(args[0] ?? 1)));
    print(Array.from({ length: n }, () => Math.random().toFixed(6)).join(" "));
  },
});
