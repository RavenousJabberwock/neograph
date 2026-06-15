// Numerical analysis primitives: root finding, ODE integration, quadrature,
// numerical limits, finite differences, Taylor series, symbolic solve for
// polynomials. Built on mathjs.

import { math } from "./math";

// Centralised tolerance + iteration constants so callers don't sprinkle
// magic numbers. Tune here; every algorithm below references these.
export const TOL = {
  newton: 1e-10,
  brent: 1e-12,
  ode: 1e-6,
  quadrature: 1e-9,
  limit: 1e-9,
  poly: 1e-10,
  derivativeH: 1e-7,
  zero: 1e-14,
} as const;

type Scope = Record<string, number>;

export function compileFn(expr: string, vars: string[] = ["x"]) {
  const c = math.compile(expr);
  return (args: Record<string, number>) => {
    const scope: Scope = { ...args };
    for (const v of vars) if (!(v in scope)) scope[v] = 0;
    return Number(c.evaluate(scope));
  };
}

// ─── Root finders ────────────────────────────────────────────────────────
export function newton(
  f: (x: number) => number,
  x0: number,
  opts: { tol?: number; maxIter?: number; df?: (x: number) => number } = {},
) {
  const tol = opts.tol ?? 1e-10;
  const maxIter = opts.maxIter ?? 64;
  const trace: Array<{ i: number; x: number; fx: number }> = [];
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    trace.push({ i, x, fx });
    if (!Number.isFinite(fx)) break;
    if (Math.abs(fx) < tol) return { x, iterations: i, converged: true, trace };
    const h = Math.max(1e-7, Math.abs(x) * 1e-7);
    const dfx = opts.df ? opts.df(x) : (f(x + h) - f(x - h)) / (2 * h);
    if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-14) break;
    x = x - fx / dfx;
  }
  return { x, iterations: maxIter, converged: false, trace };
}

export function brent(
  f: (x: number) => number, a: number, b: number,
  opts: { tol?: number; maxIter?: number } = {},
) {
  const tol = opts.tol ?? 1e-12;
  const maxIter = opts.maxIter ?? 128;
  let fa = f(a), fb = f(b);
  const trace: Array<{ i: number; a: number; b: number; fa: number; fb: number }> = [];
  if (fa * fb > 0) return { x: NaN, converged: false, iterations: 0, trace, error: "no sign change on [a,b]" };
  if (Math.abs(fa) < Math.abs(fb)) { [a, b] = [b, a]; [fa, fb] = [fb, fa]; }
  let c = a, fc = fa, d = b - a, e = d;
  for (let i = 0; i < maxIter; i++) {
    trace.push({ i, a, b, fa, fb });
    if (Math.abs(fb) < tol) return { x: b, converged: true, iterations: i, trace };
    if (fa !== fc && fb !== fc) {
      // inverse quadratic
      const s = a * fb * fc / ((fa - fb) * (fa - fc))
              + b * fa * fc / ((fb - fa) * (fb - fc))
              + c * fa * fb / ((fc - fa) * (fc - fb));
      const cond = (s < (3 * a + b) / 4 && s > b) || (s > (3 * a + b) / 4 && s < b);
      if (cond) { e = d; d = s - b; } else { d = (a - b) / 2; e = d; }
    } else {
      d = (a - b) / 2; e = d;
    }
    c = b; fc = fb;
    b = b + (Math.abs(d) > tol ? d : Math.sign(a - b) * tol);
    fb = f(b);
    if (fa * fb < 0) { /* keep a */ } else { a = c; fa = fc; }
    if (Math.abs(fa) < Math.abs(fb)) { [a, b] = [b, a]; [fa, fb] = [fb, fa]; }
  }
  return { x: b, converged: false, iterations: maxIter, trace };
}

// ─── ODE  y' = f(t, y) — RK45 (Dormand-Prince) ────────────────────────────
export function rk45(
  f: (t: number, y: number) => number,
  t0: number, y0: number, tEnd: number,
  opts: { tol?: number; hMax?: number; hMin?: number; maxSteps?: number } = {},
) {
  const tol = opts.tol ?? 1e-6;
  const hMax = opts.hMax ?? (tEnd - t0) / 50;
  const hMin = opts.hMin ?? 1e-9;
  const maxSteps = opts.maxSteps ?? 20000;
  const dir = Math.sign(tEnd - t0) || 1;

  // Dormand-Prince coefficients
  const a21 = 1 / 5;
  const a31 = 3 / 40, a32 = 9 / 40;
  const a41 = 44 / 45, a42 = -56 / 15, a43 = 32 / 9;
  const a51 = 19372 / 6561, a52 = -25360 / 2187, a53 = 64448 / 6561, a54 = -212 / 729;
  const a61 = 9017 / 3168, a62 = -355 / 33, a63 = 46732 / 5247, a64 = 49 / 176, a65 = -5103 / 18656;
  const a71 = 35 / 384, a73 = 500 / 1113, a74 = 125 / 192, a75 = -2187 / 6784, a76 = 11 / 84;
  const e1 = 71 / 57600, e3 = -71 / 16695, e4 = 71 / 1920, e5 = -17253 / 339200, e6 = 22 / 525, e7 = -1 / 40;
  const c2 = 1 / 5, c3 = 3 / 10, c4 = 4 / 5, c5 = 8 / 9;

  let t = t0, y = y0;
  let h = dir * Math.min(Math.abs(hMax), Math.abs(tEnd - t0) / 10 || 0.01);
  const ts: number[] = [t]; const ys: number[] = [y];
  let steps = 0, rejected = 0;

  while ((dir > 0 ? t < tEnd : t > tEnd) && steps < maxSteps) {
    if ((dir > 0 ? t + h > tEnd : t + h < tEnd)) h = tEnd - t;
    const k1 = f(t, y);
    const k2 = f(t + c2 * h, y + h * a21 * k1);
    const k3 = f(t + c3 * h, y + h * (a31 * k1 + a32 * k2));
    const k4 = f(t + c4 * h, y + h * (a41 * k1 + a42 * k2 + a43 * k3));
    const k5 = f(t + c5 * h, y + h * (a51 * k1 + a52 * k2 + a53 * k3 + a54 * k4));
    const k6 = f(t + h, y + h * (a61 * k1 + a62 * k2 + a63 * k3 + a64 * k4 + a65 * k5));
    const yNew = y + h * (a71 * k1 + a73 * k3 + a74 * k4 + a75 * k5 + a76 * k6);
    const k7 = f(t + h, yNew);
    const err = h * (e1 * k1 + e3 * k3 + e4 * k4 + e5 * k5 + e6 * k6 + e7 * k7);
    const sc = tol + Math.max(Math.abs(y), Math.abs(yNew)) * tol;
    const errNorm = Math.abs(err / sc);
    if (errNorm <= 1 || Math.abs(h) <= hMin) {
      t += h; y = yNew; ts.push(t); ys.push(y); steps++;
    } else { rejected++; }
    const factor = errNorm === 0 ? 5 : 0.9 * Math.pow(errNorm, -1 / 5);
    h = dir * Math.max(hMin, Math.min(Math.abs(hMax), Math.abs(h) * Math.min(5, Math.max(0.1, factor))));
  }
  return { ts, ys, steps, rejected };
}

// ─── Adaptive Simpson's rule ──────────────────────────────────────────────
export function adaptiveSimpson(
  f: (x: number) => number, a: number, b: number,
  opts: { tol?: number; maxDepth?: number } = {},
) {
  const tol = opts.tol ?? 1e-9;
  const maxDepth = opts.maxDepth ?? 24;
  let calls = 0;
  const evalF = (x: number) => { calls++; return f(x); };
  const simpson = (l: number, r: number, fl: number, fm: number, fr: number) =>
    ((r - l) / 6) * (fl + 4 * fm + fr);
  const rec = (l: number, r: number, fl: number, fm: number, fr: number, whole: number, eps: number, depth: number): number => {
    const m = (l + r) / 2;
    const lm = (l + m) / 2, rm = (m + r) / 2;
    const flm = evalF(lm), frm = evalF(rm);
    const left = simpson(l, m, fl, flm, fm);
    const right = simpson(m, r, fm, frm, fr);
    const diff = left + right - whole;
    if (depth <= 0 || Math.abs(diff) <= 15 * eps)
      return left + right + diff / 15;
    return rec(l, m, fl, flm, fm, left, eps / 2, depth - 1)
         + rec(m, r, fm, frm, fr, right, eps / 2, depth - 1);
  };
  const fa = evalF(a), fb = evalF(b), fm = evalF((a + b) / 2);
  const whole = simpson(a, b, fa, fm, fb);
  const value = rec(a, b, fa, fm, fb, whole, tol, maxDepth);
  return { value, calls };
}

// ─── Numerical limit ──────────────────────────────────────────────────────
export function numericLimit(expr: string, varName: string, target: number, side: "both" | "left" | "right" = "both") {
  const f = compileFn(expr, [varName]);
  const probe = (dir: 1 | -1) => {
    let prev = NaN;
    for (let k = 1; k < 18; k++) {
      const h = Math.pow(10, -k);
      const v = f({ [varName]: target + dir * h });
      if (!Number.isFinite(v)) return prev;
      if (Math.abs(v - prev) < 1e-9 * (1 + Math.abs(v))) return v;
      prev = v;
    }
    return prev;
  };
  if (side === "left")  return probe(-1);
  if (side === "right") return probe( 1);
  const L = probe(-1), R = probe(1);
  if (Math.abs(L - R) > 1e-5 * (1 + Math.abs(L) + Math.abs(R))) return NaN;
  return (L + R) / 2;
}

// ─── Taylor series via repeated symbolic derivative ───────────────────────
export function taylor(expr: string, varName: string, a: number, order: number) {
  let node = math.parse(expr);
  const terms: string[] = [];
  let factorial = 1;
  // 0-th term
  {
    const v = Number(node.evaluate({ [varName]: a }));
    if (Number.isFinite(v) && v !== 0) terms.push(`${formatCoef(v)}`);
  }
  for (let n = 1; n <= order; n++) {
    node = math.derivative(node, varName);
    factorial *= n;
    let v: number;
    try { v = Number(node.evaluate({ [varName]: a })); } catch { break; }
    if (!Number.isFinite(v)) break;
    const c = v / factorial;
    if (Math.abs(c) < 1e-12) continue;
    const xpart = a === 0 ? `${varName}^${n}` : `(${varName} - ${a})^${n}`;
    terms.push(`${formatCoef(c)}*${xpart}`);
  }
  return terms.join(" + ").replace(/\+ -/g, "- ") || "0";
}

function formatCoef(v: number) {
  return Number(v.toFixed(8)).toString();
}

// ─── Solve f(x) = 0 — polynomial roots, fall back to Newton from guess ────
export function solveZero(expr: string, varName: string, guess?: number) {
  // Try polynomial root path.
  try {
    const node = math.simplify(expr);
    const coeffs = polyCoeffs(node.toString(), varName);
    if (coeffs) {
      const roots = polynomialRoots(coeffs);
      return { method: "polynomial-roots", roots, degree: coeffs.length - 1 };
    }
  } catch { /* ignore */ }
  // Numeric fallback
  const f = compileFn(expr, [varName]);
  const res = newton((x) => f({ [varName]: x }), guess ?? 1);
  return { method: "newton", roots: [res.x], converged: res.converged, iterations: res.iterations };
}

// extract polynomial coefficients (ascending in `varName`) from a flattened expr.
function polyCoeffs(expr: string, v: string): number[] | null {
  const stripped = expr.replace(/\s+/g, "");
  // Split additive top-level
  const parts: string[] = [];
  let depth = 0, buf = "";
  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (ch === "(") depth++;
    else if (ch === ")") { depth--; if (depth < 0) return null; }
    if (depth === 0 && (ch === "+" || ch === "-") && i !== 0 && stripped[i - 1] !== "*" && stripped[i - 1] !== "/" && stripped[i - 1] !== "^") {
      parts.push(buf); buf = ch === "-" ? "-" : "";
    } else buf += ch;
  }
  if (depth !== 0) return null; // unbalanced parens
  if (buf) parts.push(buf);
  const out: number[] = [];
  for (const t of parts) {
    if (!t) continue;
    // matches:  c, c*v, c*v^n, v, v^n
    const re = new RegExp(`^(-?\\d*\\.?\\d*)\\*?${v}(?:\\^(\\d+))?$|^(-?\\d+(?:\\.\\d+)?)$`);
    const m = t.match(re);
    if (!m) return null;
    if (m[3] !== undefined) { out[0] = (out[0] ?? 0) + Number(m[3]); continue; }
    let a = m[1]; if (a === "" || a === "+") a = "1"; if (a === "-") a = "-1";
    const n = m[2] ? Number(m[2]) : 1;
    out[n] = (out[n] ?? 0) + Number(a);
  }
  if (out.length === 0) return null;
  for (let i = 0; i < out.length; i++) if (out[i] === undefined) out[i] = 0;
  return out;
}

// Durand-Kerner root finder (complex-aware would be nicer; we keep real-ish).
function polynomialRoots(coefAsc: number[]): number[] {
  const deg = coefAsc.length - 1;
  if (deg <= 0) return [];
  if (deg === 1) return [-coefAsc[0] / coefAsc[1]];
  if (deg === 2) {
    const [c, b, a] = coefAsc;
    const d = b * b - 4 * a * c;
    if (d >= 0) { const s = Math.sqrt(d); return [(-b - s) / (2 * a), (-b + s) / (2 * a)]; }
    return []; // complex
  }
  // numeric: Aberth-style on real seeds
  const lead = coefAsc[deg];
  const norm = coefAsc.map((c) => c / lead);
  // initial seeds spaced on a circle of radius max(|c_i|) + 1
  const R = 1 + Math.max(...norm.slice(0, -1).map(Math.abs));
  const seeds: number[] = Array.from({ length: deg }, (_, k) => R * Math.cos((2 * Math.PI * k) / deg));
  // refine each seed via Newton on derivative-augmented poly
  const evalP = (x: number) => norm.reduce((acc, c, i) => acc + c * Math.pow(x, i), 0);
  const evalDP = (x: number) =>
    norm.reduce((acc, c, i) => (i === 0 ? acc : acc + i * c * Math.pow(x, i - 1)), 0);
  const roots: number[] = [];
  for (const s of seeds) {
    const r = newton(evalP, s, { df: evalDP, maxIter: 80, tol: 1e-10 });
    if (r.converged && Number.isFinite(r.x) && roots.every((q) => Math.abs(q - r.x) > 1e-5))
      roots.push(r.x);
  }
  return roots.sort((a, b) => a - b);
}
