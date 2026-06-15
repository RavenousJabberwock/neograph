import type { Lesson } from "./types";

/** Trigonometry: right triangles, unit circle, identities, equations,
 *  laws of sines/cosines, polar coordinates. */
export const trig: Lesson[] = [
  {
    id: "trig-right-triangle",
    title: "Right-triangle trig: SOH-CAH-TOA",
    summary: "Ratios in a right triangle.",
    body: `In a right triangle with an acute angle \`θ\`,

\`\`\`
sin θ = opposite / hypotenuse        (SOH)
cos θ = adjacent / hypotenuse        (CAH)
tan θ = opposite / adjacent          (TOA)
\`\`\`

Reciprocals: \`csc = 1/sin\`, \`sec = 1/cos\`, \`cot = 1/tan\`. These
solve almost every "find the side / angle" classroom problem.

**Special triangles** worth memorising:
\`\`\`
30–60–90: sides 1 : √3 : 2          45–45–90: sides 1 : 1 : √2
\`\`\``,
    exercises: [
      { q: "In a right Δ with opp = 3, hyp = 5, sin θ = ?", kind: "numeric", answer: 0.6,
        explain: "3/5." },
      { q: "tan 45° = ?", kind: "numeric", answer: 1, explain: "From the 45-45-90 triangle." },
      { q: "Adjacent leg if hyp = 10, θ = 60°. (1 d.p.)", kind: "numeric", answer: 5,
        explain: "10 · cos 60° = 5." },
    ],
    related: ["graph"],
  },
  {
    id: "trig-unit-circle",
    title: "The unit circle",
    summary: "Definitions of sin, cos, tan from coordinates; radians.",
    body: `Place a point at angle \`θ\` (counter-clockwise from the +x axis)
on the unit circle \`x² + y² = 1\`. Then

$$(\\cos\\theta,\\,\\sin\\theta) = (x,\\,y), \\qquad \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}.$$

**Radians**: \`π rad = 180°\`. Arc length on a circle of radius \`r\`
subtending angle \`θ\` (radians) is \`s = r θ\`.

Pythagorean identity:  \`sin² θ + cos² θ = 1\`.

\`\`\`
θ       0     π/6     π/4     π/3     π/2
sin     0     1/2     √2/2    √3/2    1
cos     1     √3/2    √2/2    1/2     0
\`\`\``,
    exercises: [
      { q: "sin(π/6) = ?", kind: "numeric", answer: 0.5, explain: "Table value." },
      { q: "cos(π) = ?", kind: "numeric", answer: -1, explain: "(−1, 0)." },
      { q: "If sin θ = 3/5 in Q I, cos θ = ?", kind: "numeric", answer: 0.8,
        explain: "cos²θ = 16/25." },
      { q: "Convert 270° to radians (as a multiple of π). Enter the coefficient.",
        kind: "numeric", answer: 1.5,
        explain: "270/180 · π = 3π/2." },
      { q: "Arc length, radius 4 m, angle π/3.", kind: "numeric", answer: 4.18879, tol: 1e-3,
        explain: "s = 4 · π/3." },
    ],
    related: ["graph", "calc"],
  },
  {
    id: "trig-graphs",
    title: "Graphs of sin, cos, tan",
    summary: "Amplitude, period, phase shift.",
    body: `For \`y = A sin(B(x − C)) + D\`:

* **Amplitude** \`|A|\`  — vertical stretch.
* **Period** \`2π / |B|\` — horizontal compression by factor \`B\`.
* **Phase shift** \`C\` to the right.
* **Vertical shift** \`D\`.

\`tan\` has period \`π\` and asymptotes at \`x = π/2 + kπ\`.`,
    exercises: [
      { q: "Period of y = sin(3x)?  (as multiple of π, enter coefficient)",
        kind: "numeric", answer: 0.6667, tol: 0.01,
        explain: "2π/3 → coefficient 2/3 ≈ 0.667." },
      { q: "Amplitude of y = −4 cos x?", kind: "numeric", answer: 4,
        explain: "|−4|." },
      { q: "Max value of  3 sin x + 2?", kind: "numeric", answer: 5,
        explain: "3·1 + 2 = 5." },
    ],
  },
  {
    id: "trig-identities",
    title: "Sum / difference / double-angle identities",
    summary: "Tools for rewriting trig expressions.",
    body: `Sum & difference:
\`\`\`
sin(a ± b) = sin a cos b ± cos a sin b
cos(a ± b) = cos a cos b ∓ sin a sin b
\`\`\`

Double-angle (b = a):
\`\`\`
sin 2a = 2 sin a cos a
cos 2a = cos² a − sin² a = 1 − 2 sin² a = 2 cos² a − 1
\`\`\`

Half-angle (from cos 2a):
\`\`\`
sin²(a/2) = (1 − cos a)/2          cos²(a/2) = (1 + cos a)/2
\`\`\`

Pythagorean cousins:  \`1 + tan² = sec²\`, \`1 + cot² = csc²\`.`,
    exercises: [
      { q: "Simplify  2 sin(π/12) cos(π/12).", kind: "numeric", answer: 0.5,
        explain: "= sin(π/6)." },
      { q: "cos 75° (4 d.p., decimal).", kind: "numeric", answer: 0.2588, tol: 1e-3,
        explain: "= (√6 − √2)/4 ≈ 0.2588." },
      { q: "If cos a = 4/5 in Q I, sin 2a = ?", kind: "numeric", answer: 0.96, tol: 1e-3,
        explain: "sin a = 3/5; 2·(3/5)·(4/5) = 24/25." },
    ],
  },
  {
    id: "trig-equations",
    title: "Solving trig equations",
    summary: "All solutions on [0, 2π); inverse functions.",
    body: `Isolate the trig function, take an inverse, and then **add every
period** to capture all solutions. The principal values of \`asin\` and
\`atan\` lie in \`[−π/2, π/2]\`; \`acos\` in \`[0, π]\`. Use symmetries
to find the other quadrant.`,
    exercises: [
      { q: "Smallest positive x with sin x = 1/2.", kind: "numeric", answer: 0.5236, tol: 1e-3,
        explain: "π/6 ≈ 0.5236." },
      { q: "Number of solutions of 2 cos x − 1 = 0 on [0, 2π).",
        kind: "numeric", answer: 2,
        explain: "cos x = 1/2 → x = π/3 or 5π/3." },
    ],
  },
  {
    id: "trig-laws",
    title: "Law of sines & cosines",
    summary: "General triangles (not just right ones).",
    body: `For any triangle with sides \`a, b, c\` opposite angles
\`A, B, C\`:

$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}\\qquad
c^{2} = a^{2} + b^{2} - 2ab\\cos C.$$

Use **law of sines** when you have an angle and its opposite side; use
**law of cosines** with three sides (find an angle) or two sides + the
included angle.`,
    exercises: [
      { q: "a = 7, b = 9, C = 60°. Find c (3 d.p.).",
        kind: "numeric", answer: 8.185, tol: 1e-2,
        explain: "c² = 49 + 81 − 2·7·9·(1/2) = 67 → c ≈ 8.185." },
      { q: "Triangle: A = 30°, a = 5, B = 90°. Find side b (1 d.p.).",
        kind: "numeric", answer: 10, tol: 1e-2,
        explain: "b/sin 90° = 5/sin 30° = 10." },
    ],
  },
  {
    id: "trig-polar",
    title: "Polar coordinates",
    summary: "(r, θ) ↔ (x, y).",
    body: `\`(x, y) = (r cos θ, r sin θ)\`;  conversely
\`r = √(x²+y²),  θ = atan2(y, x)\`.

Polar form clarifies rotational symmetry: \`r = a\` is a circle of radius
\`a\`; \`r = 1 + cos θ\` is a cardioid; \`r = a sin(kθ)\` is a rose curve
with petals.`,
    exercises: [
      { q: "Polar (r=2, θ=π/3) → x. (3 d.p.)", kind: "numeric", answer: 1, tol: 1e-3,
        explain: "2·cos(π/3) = 2·0.5 = 1." },
      { q: "Cartesian (3, 4) → r.", kind: "numeric", answer: 5,
        explain: "√(9+16)." },
    ],
  },
  {
    id: "trig-practice-1",
    kind: "practice",
    title: "Practice set · trig mixed",
    summary: "10 mixed trig problems.",
    body: `Reach for the unit circle before you reach for a calculator
whenever possible — building that mental model pays off later in calculus.`,
    exercises: [
      { q: "cos(π/3)", kind: "numeric", answer: 0.5, explain: "Table." },
      { q: "Period of cos(2x)/2 (as multiple of π)", kind: "numeric", answer: 1, explain: "2π/2 = π." },
      { q: "tan(0)", kind: "numeric", answer: 0, explain: "sin 0 / cos 0." },
      { q: "If sin θ = 0 and θ ∈ [0, 2π), how many solutions?", kind: "numeric", answer: 2,
        explain: "θ = 0, π." },
      { q: "Convert 60° to radians (decimal, 3 d.p.).", kind: "numeric", answer: 1.047, tol: 1e-2,
        explain: "π/3 ≈ 1.047." },
      { q: "cos² 30° + sin² 30°", kind: "numeric", answer: 1, explain: "Pythagorean identity." },
      { q: "Law of cosines: a=3,b=4,C=90°. Find c.", kind: "numeric", answer: 5,
        explain: "Reduces to Pythagoras." },
      { q: "Polar r=1, θ=π → x", kind: "numeric", answer: -1, explain: "cos π." },
      { q: "Amplitude of 5 sin(2x − 1) − 3", kind: "numeric", answer: 5, explain: "|5|." },
      { q: "sin(π/2) + cos(π/2)", kind: "numeric", answer: 1, explain: "1 + 0." },
    ],
  },
];
