import type { Lesson } from "./types";

export const multivar: Lesson[] = [
  {
    id: "cal3-partials",
    title: "Partial derivatives & gradient",
    summary: "Rate of change in each coordinate direction.",
    body: `For \`f(x, y)\`, the partial \`∂f/∂x\` treats \`y\` as constant.
The **gradient** collects all partials:

$$\\nabla f = (\\partial_x f,\\ \\partial_y f).$$

\`∇f(p)\` points in the direction of steepest ascent at \`p\`, with
magnitude equal to the maximum directional derivative. **Directional
derivative** in unit direction \`u\`: \`D_u f = ∇f · u\`.`,
    exercises: [
      { q: "f=x²y + y³.  ∂f/∂x at (1, 2).", kind: "numeric", answer: 4,
        explain: "∂_x = 2xy = 4." },
      { q: "|∇f| at (1,2), f=x²+y².", kind: "numeric", answer: 4.4721, tol: 1e-3,
        explain: "(2, 4), √20." },
      { q: "D_u f at (0,0) for f=x+2y, u=(1,0).", kind: "numeric", answer: 1,
        explain: "∇f=(1,2)·(1,0)=1." },
    ],
    related: ["plot3d", "cas"],
  },
  {
    id: "cal3-extrema",
    title: "Critical points & 2nd-derivative test",
    summary: "Local max / min / saddle from the Hessian.",
    body: `Critical points solve \`∇f = 0\`. With
\`D = f_{xx} f_{yy} − f_{xy}²\` at a critical point:

* \`D > 0, f_{xx} > 0\`  → local min
* \`D > 0, f_{xx} < 0\`  → local max
* \`D < 0\`               → saddle
* \`D = 0\`               → test is inconclusive`,
    exercises: [
      { q: "Critical point of f = x² + y².  At (0,0) it is a … (max/min/saddle)?",
        kind: "choice", choices: ["max", "min", "saddle"], correct: 1,
        explain: "D = 4 > 0 and f_xx = 2 > 0." },
      { q: "f = x² − y² at (0,0):",
        kind: "choice", choices: ["max", "min", "saddle"], correct: 2,
        explain: "D = (2)(−2) − 0 = −4 < 0." },
    ],
  },
  {
    id: "cal3-double-integrals",
    title: "Double integrals",
    summary: "Volume under a surface; Fubini.",
    body: `Over a rectangle \`R = [a, b] × [c, d]\`,

$$\\iint_R f(x,y)\\,dA = \\int_a^b \\int_c^d f(x,y)\\,dy\\,dx.$$

**Fubini** allows swapping the order when \`f\` is continuous (or
absolutely integrable). For general regions, set inner limits as functions
of the outer variable. **Polar** \`dA = r dr dθ\`.`,
    exercises: [
      { q: "∫₀¹ ∫₀² (x + y) dy dx", kind: "numeric", answer: 3,
        explain: "Inner: 2x + 2; outer = 1 + 2." },
      { q: "Area of disk radius 1 (polar).", kind: "numeric", answer: 3.1416, tol: 1e-3,
        explain: "∫₀^{2π}∫₀¹ r dr dθ = π." },
    ],
  },
  {
    id: "cal3-vector",
    title: "Vector calculus essentials",
    summary: "Divergence, curl, line integrals, Green's theorem.",
    body: `For a 2-D field \`F = (P, Q)\`:

* **Divergence** \`∇·F = ∂_xP + ∂_yQ\`  (sources / sinks).
* **Curl** \`∇×F = ∂_xQ − ∂_yP\`  (rotation).
* **Line integral**  \`∫_C F · dr\`  measures work done along \`C\`.

**Green's theorem** ties these together: for a simple closed positively
oriented \`C\` bounding region \`D\`,

$$\\oint_{C}\\!P\\,dx + Q\\,dy = \\iint_{D}\\!(\\partial_x Q - \\partial_y P)\\,dA.$$`,
    exercises: [
      { q: "div(F) for F=(x, y)", kind: "numeric", answer: 2, explain: "1 + 1." },
      { q: "curl(F) for F=(−y, x)", kind: "numeric", answer: 2, explain: "∂xQ − ∂yP = 1 − (−1)." },
    ],
  },
  {
    id: "cal3-practice-1",
    kind: "practice",
    title: "Practice set · multivariable mixed",
    summary: "8 mixed multivar problems.",
    body: ``,
    exercises: [
      { q: "∂/∂y[x sin y] at (1, π/2)", kind: "numeric", answer: 0, explain: "cos(π/2)=0." },
      { q: "|∇(xy)| at (3, 4)", kind: "numeric", answer: 5, explain: "(4, 3)." },
      { q: "∫₀¹∫₀¹ x dA", kind: "numeric", answer: 0.5, explain: "Inner x; outer 1·0.5." },
      { q: "Critical pt count for f=x²+xy+y² at origin (single point yes/no):  yes=1/no=0",
        kind: "numeric", answer: 1, explain: "Quadratic form, only (0,0)." },
      { q: "div(F) for F=(x²,y²) at (1,1)", kind: "numeric", answer: 4, explain: "2x+2y." },
      { q: "Total mass: ρ=2 over unit square area.", kind: "numeric", answer: 2,
        explain: "2 × 1." },
      { q: "Curl of conservative field.", kind: "numeric", answer: 0,
        explain: "Mixed partials match." },
      { q: "Polar area of region 0≤r≤2, 0≤θ≤π/2", kind: "numeric", answer: 3.1416, tol: 1e-3,
        explain: "(1/2)·r²·θ = (1/2)·4·(π/2) = π." },
    ],
  },
];
