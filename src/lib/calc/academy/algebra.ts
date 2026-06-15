import type { Lesson } from "./types";

/** Algebra I + II span. Linear functions, systems, polynomials, factoring,
 *  rational expressions, radicals, exponentials/logs, quadratics, complex
 *  numbers, sequences. Cross-checked with OpenStax Algebra and CCSS. */
export const algebra: Lesson[] = [
  {
    id: "alg-linear-fn",
    title: "Linear functions: forms & graphs",
    summary: "Slope-intercept, point-slope, standard.",
    body: `Three ways to write the same line:

* **Slope-intercept**: \`y = m x + b\`  (slope \`m\`, y-intercept \`b\`).
* **Point-slope**: \`y − y₁ = m(x − x₁)\` from a point \`(x₁, y₁)\`.
* **Standard**: \`A x + B y = C\`  (A, B, C integers, A ≥ 0).

**Parallel lines** share slope; **perpendicular** slopes multiply to −1
(provided neither is horizontal/vertical).`,
    exercises: [
      { q: "Slope of the line  4x − 2y = 6?", kind: "numeric", answer: 2,
        explain: "Rewrite: y = 2x − 3 → m = 2." },
      { q: "Line through (1, 4), slope 3.  y-intercept?", kind: "numeric", answer: 1,
        explain: "y − 4 = 3(x − 1) → y = 3x + 1." },
      { q: "Perpendicular to y = (1/2)x + 7 has slope?", kind: "numeric", answer: -2,
        explain: "−1 / (1/2) = −2." },
    ],
    related: ["graph"],
  },
  {
    id: "alg-systems",
    title: "Systems of equations",
    summary: "Substitution, elimination, geometry.",
    body: `A 2×2 linear system

\`\`\`
a₁ x + b₁ y = c₁
a₂ x + b₂ y = c₂
\`\`\`

has one solution (lines cross), no solutions (parallel), or infinitely
many (same line). Solve by **substitution** (isolate then plug in) or
**elimination** (scale and add to cancel a variable).

For larger systems, matrices and row reduction generalise this (see Linear
Algebra).`,
    exercises: [
      { q: "Solve  x + y = 10, x − y = 4. Enter x.", kind: "numeric", answer: 7,
        explain: "Add: 2x = 14, x = 7 (and y = 3)." },
      { q: "Solve  2x + 3y = 12, 4x − 3y = 6. Enter y.", kind: "numeric", answer: 2,
        explain: "Add: 6x = 18 → x = 3; then y = 2." },
      { q: "Lines  y = 2x+1 and  y = 2x − 5 …",
        kind: "choice", choices: ["meet once", "are parallel", "coincide"], correct: 1,
        explain: "Same slope, different intercepts." },
    ],
    related: ["matrix"],
  },
  {
    id: "alg-poly-factor",
    title: "Polynomial factoring",
    summary: "Common factor, grouping, special forms, trinomials.",
    body: `Strategies, cheapest first:

1. **Pull a common factor**:  \`6x² + 9x = 3x(2x + 3)\`.
2. **Special products**:
   * difference of squares  \`a² − b² = (a − b)(a + b)\`
   * perfect square  \`a² ± 2ab + b² = (a ± b)²\`
   * sum/diff of cubes  \`a³ ± b³ = (a ± b)(a² ∓ ab + b²)\`
3. **Trinomial \`ax² + bx + c\`**: find two numbers multiplying to \`a·c\`
   and adding to \`b\`; split the middle term and group.
4. **Grouping** (four terms): pair and factor.

If nothing works, the quadratic formula handles every degree-2; the
**rational root theorem** narrows candidates for higher degrees.`,
    exercises: [
      { q: "Factor x² − 9.", kind: "expression", answer: "(x-3)*(x+3)",
        explain: "Difference of squares." },
      { q: "Factor x² + 7x + 12.", kind: "expression", answer: "(x+3)*(x+4)",
        explain: "3·4 = 12 and 3+4 = 7." },
      { q: "Factor 2x² + 7x + 3.", kind: "expression", answer: "(2*x+1)*(x+3)",
        explain: "ac = 6: 6 and 1 → split 7x = 6x + x." },
      { q: "Factor x³ − 8.", kind: "expression", answer: "(x-2)*(x^2+2*x+4)",
        explain: "Difference of cubes." },
    ],
    related: ["cas"],
  },
  {
    id: "alg-rational",
    title: "Rational expressions",
    summary: "Simplify, add, multiply, restrict the domain.",
    body: `A **rational expression** is a ratio of polynomials. Simplify by
factoring and cancelling common factors:

\`\`\`
(x² − 1) / (x − 1)  =  (x−1)(x+1)/(x−1)  =  x + 1   (x ≠ 1)
\`\`\`

**Multiply** by multiplying numerators and denominators; **add** by
finding a common denominator. The **domain** excludes any value that
makes any denominator zero — even ones that "cancel".`,
    exercises: [
      { q: "Simplify (x² − 4)/(x − 2).", kind: "expression", answer: "x+2",
        explain: "Factor and cancel (x−2) — but x ≠ 2." },
      { q: "(2/x) + (3/x²).  Enter as a single fraction (a*x+b)/(x^2).",
        kind: "expression", answer: "(2*x+3)/(x^2)",
        explain: "Common denom x²; numerator 2x + 3." },
      { q: "Excluded value of  (x+3)/(x²−9) ?  (the one not removed by cancel)",
        kind: "numeric", answer: 3,
        explain: "x = ±3 forbidden; cancelling leaves 1/(x−3) with x ≠ 3." },
    ],
  },
  {
    id: "alg-radicals",
    title: "Radicals & rational exponents",
    summary: "√, n-th roots, x^(1/n), simplifying.",
    body: `For real \`x ≥ 0\`:

\`\`\`
x^(1/n) = ⁿ√x          x^(m/n) = (ⁿ√x)^m = ⁿ√(x^m)
√(a·b) = √a · √b       √(a/b) = √a / √b   (b ≠ 0)
\`\`\`

**Rationalising** the denominator clears the radical:

\`\`\`
1/√2  ·  √2/√2  =  √2/2
\`\`\``,
    exercises: [
      { q: "Simplify √50 to a√b form. Enter a · √b's b after taking a out of √50 (e.g. for 5√2, b = 2).",
        kind: "numeric", answer: 2, explain: "√50 = 5√2." },
      { q: "Evaluate  8^(2/3).", kind: "numeric", answer: 4,
        explain: "= (∛8)² = 2² = 4." },
      { q: "Rationalise 3/√3. Enter the simplified form.",
        kind: "expression", answer: "sqrt(3)",
        explain: "3/√3 · √3/√3 = 3√3/3 = √3." },
    ],
  },
  {
    id: "alg-quadratic",
    title: "The quadratic formula",
    summary: "Solving a x² + b x + c = 0 for any a, b, c.",
    body: `Every quadratic has roots

$$x = \\frac{-b \\pm \\sqrt{b^{2}-4ac}}{2a}.$$

The **discriminant** \`Δ = b² − 4ac\` decides the nature of the roots:

| Δ      | roots                          |
|--------|--------------------------------|
| Δ > 0  | two distinct real roots        |
| Δ = 0  | one repeated real root         |
| Δ < 0  | complex-conjugate pair         |

The **vertex** of \`f(x) = ax² + bx + c\` is at \`x = −b/(2a)\` —
completing the square gives the proof.`,
    exercises: [
      { q: "Solve  x² − 5x + 6 = 0.  Larger root?", kind: "numeric", answer: 3,
        explain: "(x−2)(x−3) = 0." },
      { q: "Discriminant of  2x² + 3x + 5?", kind: "numeric", answer: -31,
        explain: "9 − 40 = −31." },
      { q: "Real roots of x² − 4x + 4 = 0?",
        kind: "choice", choices: ["0", "1", "2"], correct: 1,
        explain: "Δ = 0 → one repeated root x = 2." },
      { q: "Vertex x of  y = 2x² − 8x + 7?", kind: "numeric", answer: 2,
        explain: "−b/(2a) = 8/4 = 2." },
      { q: "Real solutions of  3x² + 2x + 5 = 0?",
        kind: "choice", choices: ["0", "1", "2"], correct: 0,
        explain: "Δ = 4 − 60 < 0." },
    ],
    related: ["cas", "graph", "gsolve"],
  },
  {
    id: "alg-complex",
    title: "Complex numbers",
    summary: "i² = −1; arithmetic, modulus, conjugate.",
    body: `\`i\` is the imaginary unit with \`i² = −1\`. A **complex number**
\`z = a + b i\` has real part \`a\` and imaginary part \`b\`. Arithmetic:

\`\`\`
(a+bi) + (c+di) = (a+c) + (b+d)i
(a+bi)(c+di)    = (ac − bd) + (ad + bc) i
\`\`\`

**Conjugate** \`z̄ = a − b i\`; **modulus** \`|z| = √(a² + b²)\`. Division:
multiply numerator and denominator by the conjugate of the denominator.`,
    exercises: [
      { q: "(2 + 3i)(1 − i) = ?  Enter the real part.", kind: "numeric", answer: 5,
        explain: "= 2 − 2i + 3i − 3i² = 2 + i + 3 = 5 + i." },
      { q: "|3 − 4i| = ?", kind: "numeric", answer: 5,
        explain: "√(9 + 16) = 5." },
      { q: "1/(1 + i) — enter the real part.", kind: "numeric", answer: 0.5,
        explain: "(1 − i)/((1+i)(1−i)) = (1 − i)/2." },
    ],
  },
  {
    id: "alg-exp-log",
    title: "Exponentials and logarithms",
    summary: "Inverse functions; laws of logs; change of base.",
    body: `If \`b > 0\` and \`b ≠ 1\`, the equation \`b^x = y\` has a unique
solution \`x = log_b(y)\` for every \`y > 0\`. Special bases:

* \`log_{10}\` written \`log\` (engineering, pH, decibels)
* \`log_e\` written \`ln\` (calculus, growth/decay)

Laws (provable from exponent laws):
\`\`\`
log(xy) = log x + log y          log(x/y) = log x − log y
log(x^k) = k · log x             log_b a = log a / log b   (change of base)
\`\`\`

**Exponential growth**: \`P(t) = P₀ e^{r t}\`. **Half-life decay**:
\`P(t) = P₀ · (1/2)^{t/T}\`.`,
    exercises: [
      { q: "log₂ 32 = ?", kind: "numeric", answer: 5, explain: "2⁵ = 32." },
      { q: "Solve 3^x = 81.", kind: "numeric", answer: 4, explain: "81 = 3⁴." },
      { q: "log(100x) − log x = ?  (base 10)", kind: "expression", answer: "2",
        explain: "= log 100 = 2." },
      { q: "Half-life 5 yr, start 80 g. After 15 yr (g)?", kind: "numeric", answer: 10,
        explain: "80·(1/2)³ = 10." },
      { q: "Solve ln x = 2 (3 d.p.).", kind: "numeric", answer: 7.389, tol: 1e-3,
        explain: "x = e² ≈ 7.389." },
    ],
    related: ["calc", "cas"],
  },
  {
    id: "alg-sequences",
    title: "Sequences & series",
    summary: "Arithmetic, geometric, Σ notation.",
    body: `**Arithmetic** sequence with first term \`a₁\` and common
difference \`d\`:  \`a_n = a₁ + (n−1)d\`,  sum \`S_n = (n/2)(a₁ + a_n)\`.

**Geometric** with ratio \`r\`:  \`a_n = a₁ r^{n−1}\`,  sum
\`S_n = a₁ (1 − rⁿ)/(1 − r)\`. If \`|r| < 1\`, infinite sum is
\`a₁/(1 − r)\`.

**Sigma notation**:  \`Σ_{k=1}^{n} k = n(n+1)/2\` (Gauss's pairing).`,
    exercises: [
      { q: "Sum  1 + 2 + … + 100.", kind: "numeric", answer: 5050,
        explain: "100·101/2." },
      { q: "Geometric: a₁ = 3, r = 2. 5th term?", kind: "numeric", answer: 48,
        explain: "3·2⁴." },
      { q: "Infinite sum  1 + 1/2 + 1/4 + …", kind: "numeric", answer: 2,
        explain: "1/(1 − 1/2)." },
    ],
  },
  {
    id: "alg-practice-1",
    kind: "practice",
    title: "Practice set · algebra mixed",
    summary: "12 mixed problems pulling from every algebra lesson.",
    body: `Build fluency. Aim for short, confident steps rather than long
pencil-and-paper detours.`,
    exercises: [
      { q: "Solve  3x − 5 = 2x + 4.", kind: "numeric", answer: 9, explain: "x = 9." },
      { q: "Factor x² − 5x + 6.", kind: "expression", answer: "(x-2)*(x-3)", explain: "2·3=6; 2+3=5." },
      { q: "Solve  x² = 49.  Larger root?", kind: "numeric", answer: 7, explain: "±7." },
      { q: "log₃ 27", kind: "numeric", answer: 3, explain: "3³." },
      { q: "Slope through (2, −1), (5, 8).", kind: "numeric", answer: 3, explain: "9/3." },
      { q: "Simplify  (x²−25)/(x+5).", kind: "expression", answer: "x-5", explain: "Factor & cancel." },
      { q: "(1 + 2i)(3 − i).  Imaginary part?", kind: "numeric", answer: 5,
        explain: "= 3 − i + 6i − 2i² = 5 + 5i." },
      { q: "16^(3/4)", kind: "numeric", answer: 8, explain: "(⁴√16)³ = 2³." },
      { q: "Sum of first 10 odd integers.", kind: "numeric", answer: 100, explain: "n² for n=10." },
      { q: "Solve system  x + y = 7,  2x − y = 5.  Enter x.", kind: "numeric", answer: 4,
        explain: "Add: 3x = 12." },
      { q: "Discriminant of  x² + 6x + 9?", kind: "numeric", answer: 0, explain: "36 − 36." },
      { q: "Solve  2·5^x = 50.", kind: "numeric", answer: 2, explain: "5^x = 25 = 5²." },
    ],
  },
];
