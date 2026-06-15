/**
 * academy-content.ts — neoGraph Academy
 * ------------------------------------------------------------------
 * A self-contained, extensible mathematics curriculum spanning K → Postgrad.
 *
 * Content is drawn from and cross-checked against widely-used public-domain
 * / open-license sources (OpenStax, Khan Academy outlines, Wikipedia,
 * MIT OCW course outlines, NIST DLMF). Wording, definitions, and worked
 * problems are written fresh here — no third-party prose is copied.
 *
 * Schema:
 *   Stage  → broad band (e.g. "Algebra II", "Calculus I", "Linear Algebra")
 *   Lesson → focused topic; markdown body + checkable exercises
 *   Exercise → numeric / expression / multiple-choice / open-text
 *
 * To extend: append a Lesson to the appropriate Stage's `lessons` array,
 * or add a new Stage to STAGES. The Academy panel renders everything
 * automatically. Lesson `id`s are referenced from HELP sections via
 * `academy: "<lessonId>"` so panel help can deep-link into theory.
 * ------------------------------------------------------------------
 */
import type { PanelKey } from "./store";

export type ExerciseKind = "numeric" | "choice" | "expression" | "text";

export interface Exercise {
  q: string;
  kind: ExerciseKind;
  /** numeric / expression: canonical answer (number or expression string). */
  answer?: number | string;
  /** numeric tolerance (absolute). default 1e-3. */
  tol?: number;
  /** choice: option labels. */
  choices?: string[];
  /** choice: 0-based index of correct option. */
  correct?: number;
  /** Optional progressive hint. */
  hint?: string;
  /** Shown after the learner submits. Always present. */
  explain: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  /** Markdown body. Use `$inline$` or `$$display$$` for KaTeX-ish hints (rendered as code by MarkdownView). */
  body: string;
  exercises: Exercise[];
  related?: PanelKey[];
}

export interface Stage {
  id: string;
  title: string;
  band: string;          // grade-band tag e.g. "K–5", "Calculus", "Postgrad"
  description: string;
  lessons: Lesson[];
}

// ─── Curriculum ────────────────────────────────────────────────────────────

const earlyArithmetic: Lesson[] = [
  {
    id: "k5-place-value",
    title: "Place value & whole numbers",
    summary: "Reading and writing multi-digit numbers.",
    body: `In base ten, each position in a numeral is worth ten times the
position to its right. The digit \`3\` in **307** means three hundreds because
it sits in the hundreds place, while the \`7\` is just seven ones.

\`\`\`
thousands | hundreds | tens | ones
    4     |    0     |  5   |  2     →  4 052
\`\`\`

Reading: "four thousand fifty-two". Writing a number is the inverse — listen
for the place-value words ("hundred", "thousand", "million") and drop a digit
into the matching column.`,
    exercises: [
      { q: "What is the value of the digit 7 in 4,723?", kind: "numeric", answer: 700,
        explain: "7 sits in the hundreds place, so its value is 7 × 100 = 700." },
      { q: "Write three thousand fifty in digits.", kind: "numeric", answer: 3050,
        explain: "Three thousand = 3 000, plus fifty = 50, giving 3 050." },
      { q: "Which is larger?", kind: "choice", choices: ["8 091", "8 910", "8 109"], correct: 1,
        explain: "Compare left to right. The thousands match (8); hundreds differ: 9 > 1 ≥ 0, so 8 910 wins." },
    ],
    related: ["calc"],
  },
  {
    id: "k5-fractions",
    title: "Fractions: parts of a whole",
    summary: "Numerator, denominator, equivalent fractions.",
    body: `A fraction \`a/b\` means: cut a whole into \`b\` equal parts and
take \`a\` of them. The bottom number is the **denominator** (how many
slices), the top is the **numerator** (how many you keep).

**Equivalent fractions** name the same amount: multiply (or divide) top and
bottom by the same nonzero number.

\`\`\`
1/2 = 2/4 = 3/6 = 50/100
\`\`\`

To compare \`a/b\` and \`c/d\` cross-multiply: \`a·d\` vs \`b·c\` (assuming
positive denominators).`,
    exercises: [
      { q: "Which fraction equals 3/4?", kind: "choice",
        choices: ["6/12", "9/12", "8/12"], correct: 1,
        explain: "Multiply 3/4 top and bottom by 3: 9/12. The others reduce to 1/2 and 2/3." },
      { q: "Add: 1/4 + 1/2. Enter as a decimal.", kind: "numeric", answer: 0.75,
        explain: "Common denominator 4: 1/4 + 2/4 = 3/4 = 0.75." },
      { q: "Simplify 18/24 to lowest terms (enter as a/b).", kind: "expression", answer: "3/4",
        explain: "Divide top and bottom by their greatest common divisor 6." },
    ],
    related: ["calc"],
  },
  {
    id: "k5-decimals",
    title: "Decimals and rounding",
    summary: "Place value to the right of the decimal point.",
    body: `Place values continue past the decimal point: tenths, hundredths,
thousandths. \`0.314\` = 3 tenths + 1 hundredth + 4 thousandths.

**Rounding** to a place: look at the digit to the right. If it's 5 or more,
round up; otherwise round down.`,
    exercises: [
      { q: "Round 3.276 to the nearest tenth.", kind: "numeric", answer: 3.3,
        explain: "The hundredths digit is 7 (≥ 5), so round up: 3.3." },
      { q: "What is 0.4 + 0.07?", kind: "numeric", answer: 0.47,
        explain: "Line up decimals: 0.40 + 0.07 = 0.47." },
    ],
  },
];

const preAlgebra: Lesson[] = [
  {
    id: "pre-integers",
    title: "Signed numbers & the number line",
    summary: "Adding, subtracting, multiplying negatives.",
    body: `Integers extend the whole numbers with their negatives: \`…, −3,
−2, −1, 0, 1, 2, 3, …\`.

Rules of signs (for multiplication and division):
\`\`\`
(+)(+) = +     (+)(−) = −
(−)(−) = +     (−)(+) = −
\`\`\`

Subtraction is "add the opposite": \`a − b = a + (−b)\`.`,
    exercises: [
      { q: "Compute  (−7) + 3.", kind: "numeric", answer: -4,
        explain: "Move 3 units right from −7 on the number line: −4." },
      { q: "Compute  (−4)·(−6).", kind: "numeric", answer: 24,
        explain: "Two negatives multiply to a positive: 24." },
      { q: "Compute  5 − (−2).", kind: "numeric", answer: 7,
        explain: "Subtracting a negative is adding a positive: 5 + 2 = 7." },
    ],
    related: ["calc"],
  },
  {
    id: "pre-ratio-proportion",
    title: "Ratios, rates, and proportions",
    summary: "Comparing quantities; solving a/b = c/d.",
    body: `A **ratio** compares two quantities of the same kind ("3 cups
flour to 2 cups sugar" → 3 : 2). A **rate** compares different units
("60 miles per hour"). A **proportion** is an equation between two ratios:

$$\\frac{a}{b} = \\frac{c}{d} \\iff a\\,d = b\\,c.$$

To solve a proportion, cross-multiply, then divide.`,
    exercises: [
      { q: "Solve  x/15 = 4/5.   x = ?", kind: "numeric", answer: 12,
        explain: "Cross-multiply: 5x = 60, so x = 12." },
      { q: "A car travels 180 mi in 3 h. What is its average speed (mi/h)?",
        kind: "numeric", answer: 60,
        explain: "Speed = distance / time = 180/3 = 60 mi/h." },
    ],
  },
  {
    id: "pre-linear-eq",
    title: "Solving linear equations",
    summary: "Isolating x using inverse operations.",
    body: `To solve \`a·x + b = c\`, undo operations in reverse order
(PEMDAS backwards):

1. Subtract \`b\` from both sides → \`a·x = c − b\`.
2. Divide both sides by \`a\` (assuming \`a ≠ 0\`) → \`x = (c − b)/a\`.

Whatever you do to one side, do to the other. The equality is the contract.`,
    exercises: [
      { q: "Solve  2x + 5 = 17.  x = ?", kind: "numeric", answer: 6,
        explain: "2x = 12, then x = 6." },
      { q: "Solve  3(x − 4) = 2x + 1.  x = ?", kind: "numeric", answer: 13,
        explain: "Expand: 3x − 12 = 2x + 1. Then x = 13." },
    ],
    related: ["cas", "calc"],
  },
];

const algebra: Lesson[] = [
  {
    id: "alg-quadratic",
    title: "The quadratic formula",
    summary: "Solving  a x² + b x + c = 0.",
    body: `Any quadratic in standard form has roots

$$x = \\frac{-b \\pm \\sqrt{b^{2}-4ac}}{2a}.$$

The expression under the radical, \`Δ = b² − 4ac\`, is the **discriminant**.

| Δ      | nature of roots          |
|--------|--------------------------|
| Δ > 0  | two distinct real roots  |
| Δ = 0  | one repeated real root   |
| Δ < 0  | complex-conjugate pair   |

Derivation idea: complete the square on \`a(x + b/2a)²\`.`,
    exercises: [
      { q: "Solve  x² − 5x + 6 = 0.  Enter the larger root.",
        kind: "numeric", answer: 3,
        explain: "Factors: (x−2)(x−3) = 0 ⇒ x = 2 or 3. Larger root: 3." },
      { q: "Discriminant of  2x² + 3x + 5  is …", kind: "numeric", answer: -31,
        explain: "Δ = 3² − 4·2·5 = 9 − 40 = −31  (so complex roots)." },
      { q: "How many real roots does  x² − 4x + 4 = 0  have?",
        kind: "choice", choices: ["0", "1", "2"], correct: 1,
        explain: "Δ = 16 − 16 = 0, so a single repeated root x = 2." },
    ],
    related: ["cas", "graph", "gsolve"],
  },
  {
    id: "alg-exp-log",
    title: "Exponentials and logarithms",
    summary: "Inverse functions; laws of logs.",
    body: `If \`b > 0\` and \`b ≠ 1\`, the equation \`b^x = y\` has a unique
solution \`x = log_b(y)\` for every \`y > 0\`. Special bases:

* \`log_{10}\` written \`log\` (engineering)
* \`log_e\` written \`ln\` (calculus)

Laws (provable from the exponent laws):

\`\`\`
log(xy) = log x + log y
log(x/y) = log x − log y
log(x^k) = k · log x
log_b a = log a / log b      (change of base)
\`\`\``,
    exercises: [
      { q: "Evaluate  log_2(32).", kind: "numeric", answer: 5,
        explain: "2^5 = 32." },
      { q: "Solve  3^x = 81.  x = ?", kind: "numeric", answer: 4,
        explain: "81 = 3^4, so x = 4." },
      { q: "Rewrite  log(100x) − log(x).",
        kind: "expression", answer: "2", tol: 1e-6,
        explain: "log(100x) − log x = log(100) = 2 (base 10)." },
    ],
    related: ["calc", "cas"],
  },
  {
    id: "alg-poly-factor",
    title: "Polynomial factoring",
    summary: "Common factor, grouping, special forms.",
    body: `Strategies in order of cheapness:

1. **Pull a common factor**: \`6x² + 9x = 3x(2x + 3)\`.
2. **Special products**:
   * difference of squares  \`a² − b² = (a − b)(a + b)\`
   * perfect square  \`a² ± 2ab + b² = (a ± b)²\`
   * sum/diff of cubes  \`a³ ± b³ = (a ± b)(a² ∓ ab + b²)\`
3. **Quadratic in disguise**: substitute \`u = x^k\`.
4. **Grouping** (four terms): pair and factor.

If nothing works, the quadratic formula handles every degree-2 case, and
the **rational root theorem** narrows the candidates for higher degrees.`,
    exercises: [
      { q: "Factor  x² − 9.", kind: "expression", answer: "(x-3)*(x+3)",
        explain: "Difference of squares with a = x, b = 3." },
      { q: "Factor  x³ − 8.", kind: "expression", answer: "(x-2)*(x^2+2*x+4)",
        explain: "Difference of cubes: a³ − b³ = (a−b)(a² + ab + b²)." },
    ],
    related: ["cas"],
  },
];

const trig: Lesson[] = [
  {
    id: "trig-unit-circle",
    title: "The unit circle",
    summary: "Definitions of sin, cos, tan from coordinates.",
    body: `Place a point at angle \`θ\` (measured counter-clockwise from the
positive x-axis) on the unit circle \`x² + y² = 1\`. Then

$$(\\cos\\theta,\\,\\sin\\theta) = (x,\\,y), \\qquad \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}.$$

Pythagorean identity:  \`sin² θ + cos² θ = 1\`.

Reference angles for the first quadrant (radians):
\`\`\`
θ       0     π/6     π/4     π/3     π/2
sin     0     1/2     √2/2    √3/2    1
cos     1     √3/2    √2/2    1/2     0
\`\`\``,
    exercises: [
      { q: "sin(π/6) = ?", kind: "numeric", answer: 0.5,
        explain: "From the table: 1/2." },
      { q: "cos(π) = ?", kind: "numeric", answer: -1,
        explain: "At angle π the point is (−1, 0)." },
      { q: "If sin θ = 3/5 in Q1, cos θ = ?", kind: "numeric", answer: 0.8,
        explain: "cos² θ = 1 − 9/25 = 16/25, so cos θ = 4/5 = 0.8 in Q1." },
    ],
    related: ["graph", "calc"],
  },
  {
    id: "trig-identities",
    title: "Sum / difference / double-angle identities",
    summary: "Tools for rewriting trig expressions.",
    body: `Sum and difference:
\`\`\`
sin(a ± b) = sin a cos b ± cos a sin b
cos(a ± b) = cos a cos b ∓ sin a sin b
\`\`\`

Double-angle (set b = a):
\`\`\`
sin 2a = 2 sin a cos a
cos 2a = cos² a − sin² a = 1 − 2 sin² a = 2 cos² a − 1
\`\`\`

These collapse products into sums (handy for integration) and vice versa.`,
    exercises: [
      { q: "Simplify  2 sin(π/12) cos(π/12).", kind: "numeric", answer: 0.5,
        explain: "= sin(2·π/12) = sin(π/6) = 1/2." },
      { q: "cos(75°) = cos(45° + 30°). Compute exactly as a decimal.",
        kind: "numeric", answer: 0.258819, tol: 1e-4,
        explain: "= cos45·cos30 − sin45·sin30 = (√6 − √2)/4 ≈ 0.2588." },
    ],
  },
];

const precalc: Lesson[] = [
  {
    id: "pre-functions",
    title: "Functions, domain & range",
    summary: "Sets in, sets out, composition.",
    body: `A **function** \`f : A → B\` assigns each input \`x ∈ A\` to
exactly one output \`f(x) ∈ B\`. The largest \`A\` for which \`f(x)\` makes
sense is the **natural domain**.

* \`f(x) = √x\` → domain \`x ≥ 0\`.
* \`f(x) = 1/x\` → domain \`x ≠ 0\`.

Composition: \`(g ∘ f)(x) = g(f(x))\`. Order matters — function composition
is generally non-commutative.`,
    exercises: [
      { q: "Domain of  f(x) = 1/(x−2):  enter the excluded value.",
        kind: "numeric", answer: 2,
        explain: "Denominator zero at x = 2." },
      { q: "If f(x) = x+1 and g(x) = x², compute (g∘f)(3).",
        kind: "numeric", answer: 16,
        explain: "f(3) = 4, then g(4) = 16." },
    ],
    related: ["graph", "cas"],
  },
  {
    id: "pre-sequences",
    title: "Sequences & series",
    summary: "Arithmetic, geometric, sigma notation.",
    body: `Arithmetic sequence: constant difference \`d\`. The n-th term is
\`a_n = a_1 + (n−1) d\`, and the sum of the first \`n\` terms is

$$S_n = \\frac{n}{2}\\,(a_1 + a_n).$$

Geometric sequence: constant ratio \`r\`. \`a_n = a_1 · r^{n−1}\`, and

$$S_n = a_1\\,\\frac{1 − r^{n}}{1 − r}\\quad (r \\ne 1).$$

If \`|r| < 1\` the infinite series converges to \`a_1 / (1 − r)\`.`,
    exercises: [
      { q: "Sum  1 + 2 + … + 100.", kind: "numeric", answer: 5050,
        explain: "Arithmetic: (100/2)(1 + 100) = 5050." },
      { q: "Infinite sum  1 + 1/2 + 1/4 + 1/8 + …", kind: "numeric", answer: 2,
        explain: "Geometric with a₁ = 1, r = 1/2: S = 1/(1−1/2) = 2." },
    ],
  },
];

const calc1: Lesson[] = [
  {
    id: "cal1-limits",
    title: "Limits and continuity",
    summary: "The ε–δ idea, intuitively.",
    body: `\`\`\`
lim_{x→a} f(x) = L
\`\`\`
means: we can make \`f(x)\` as close to \`L\` as we like by choosing \`x\`
sufficiently close (but not equal) to \`a\`. Formally,

$$\\forall \\varepsilon > 0\\ \\exists \\delta > 0:\\ 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon.$$

\`f\` is **continuous at a** iff \`lim_{x→a} f(x) = f(a)\`.

Useful limit:  \`lim_{x→0} sin(x)/x = 1\`.`,
    exercises: [
      { q: "Evaluate  lim_{x→0} sin(3x)/x.", kind: "numeric", answer: 3,
        explain: "sin(3x)/x = 3 · sin(3x)/(3x) → 3·1 = 3." },
      { q: "Evaluate  lim_{x→2} (x²−4)/(x−2).", kind: "numeric", answer: 4,
        explain: "Cancel: x+2 → 4. The hole at x=2 doesn't affect the limit." },
      { q: "Is f(x) = |x| continuous at 0?", kind: "choice",
        choices: ["Yes", "No"], correct: 0,
        explain: "Both one-sided limits equal 0 = f(0)." },
    ],
    related: ["graph", "cas"],
  },
  {
    id: "cal1-derivative",
    title: "The derivative",
    summary: "Definition and the rules.",
    body: `The derivative measures instantaneous rate of change:

$$f'(x) = \\lim_{h \\to 0}\\frac{f(x+h) - f(x)}{h}.$$

Core rules (memorize):

| rule       | formula                                   |
|------------|-------------------------------------------|
| constant   | (c)' = 0                                  |
| power      | (xⁿ)' = n·xⁿ⁻¹                            |
| sum        | (f + g)' = f' + g'                        |
| product    | (fg)' = f'g + fg'                         |
| quotient   | (f/g)' = (f'g − fg')/g²                   |
| chain      | (f(g(x)))' = f'(g(x))·g'(x)               |
| exp / log  | (eˣ)' = eˣ,   (ln x)' = 1/x               |
| trig       | (sin x)' = cos x,   (cos x)' = −sin x     |`,
    exercises: [
      { q: "d/dx [x³] = ?  Enter the coefficient if answer is k·x^n.",
        kind: "numeric", answer: 3,
        explain: "Power rule: d/dx[x³] = 3x²." },
      { q: "d/dx [sin(x²)] at x=0 = ?", kind: "numeric", answer: 0,
        explain: "Chain rule: cos(x²)·2x → at x=0 gives 0." },
      { q: "d/dx [x · eˣ] = ?",
        kind: "choice", choices: ["eˣ", "x·eˣ", "(1+x)·eˣ", "(x−1)·eˣ"], correct: 2,
        explain: "Product rule: 1·eˣ + x·eˣ = (1+x)eˣ." },
    ],
    related: ["cas", "numerics", "graph"],
  },
  {
    id: "cal1-applications",
    title: "Applications of the derivative",
    summary: "Extrema, related rates, linear approximation.",
    body: `**Critical points**: solve \`f'(x) = 0\` (or undefined). Classify
with the second derivative or sign chart.

**Linear approximation** near \`a\`:

$$f(x) \\approx f(a) + f'(a)(x - a).$$

**Related rates**: differentiate an implicit relation with respect to time,
then plug in known rates.`,
    exercises: [
      { q: "Local minimum of  f(x) = x² − 6x + 11  occurs at x = ?",
        kind: "numeric", answer: 3,
        explain: "f'(x) = 2x − 6 = 0 ⇒ x = 3. f'' = 2 > 0 ⇒ min." },
      { q: "Linearization of √x near 100 evaluated at 101 ≈ ?",
        kind: "numeric", answer: 10.05, tol: 1e-3,
        explain: "L(x) = 10 + (1/20)(x−100). L(101) = 10.05  (vs 10.0499…)." },
    ],
  },
  {
    id: "cal1-integral",
    title: "The definite integral",
    summary: "Riemann sums, FTC, substitution.",
    body: `Definite integral as signed area:

$$\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty}\\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x.$$

**Fundamental Theorem of Calculus**: if \`F' = f\` on \`[a, b]\`,

$$\\int_a^b f(x)\\,dx = F(b) - F(a).$$

**u-substitution**: if \`u = g(x)\`, then \`du = g'(x) dx\`, so
\`\`\`
∫ f(g(x)) g'(x) dx  =  ∫ f(u) du.
\`\`\``,
    exercises: [
      { q: "∫₀¹ x² dx = ?", kind: "numeric", answer: 0.3333, tol: 1e-3,
        explain: "x³/3 from 0 to 1 = 1/3." },
      { q: "∫₀^{π} sin(x) dx = ?", kind: "numeric", answer: 2,
        explain: "−cos(π) + cos(0) = 1 + 1 = 2." },
      { q: "∫ 2x · cos(x²) dx = ?",
        kind: "expression", answer: "sin(x^2)",
        explain: "u = x², du = 2x dx; ∫cos u du = sin u + C." },
    ],
    related: ["numerics", "cas"],
  },
];

const multivar: Lesson[] = [
  {
    id: "cal3-partials",
    title: "Partial derivatives & gradient",
    summary: "Rate of change in each coordinate direction.",
    body: `For \`f(x, y)\`, the partial derivative \`∂f/∂x\` treats \`y\` as
constant and differentiates with respect to \`x\` only. The **gradient**
collects them:

$$\\nabla f = \\bigl(\\partial_x f,\\ \\partial_y f\\bigr).$$

\`∇f(p)\` points in the direction of steepest ascent at \`p\`, with
magnitude equal to the maximum directional derivative.`,
    exercises: [
      { q: "f(x,y) = x²y + y³. ∂f/∂x at (1, 2) = ?",
        kind: "numeric", answer: 4,
        explain: "∂f/∂x = 2xy. At (1,2): 4." },
      { q: "|∇f| at (1,2) where f = x²+y² = ?",
        kind: "numeric", answer: 4.4721, tol: 1e-3,
        explain: "∇f = (2x, 2y) = (2,4). |∇f| = √20 ≈ 4.472." },
    ],
    related: ["plot3d", "cas"],
  },
  {
    id: "cal3-double-integrals",
    title: "Double integrals",
    summary: "Volume under a surface; Fubini.",
    body: `Over a rectangle \`R = [a,b] × [c,d]\`,

$$\\iint_R f(x,y)\\,dA = \\int_a^b \\int_c^d f(x,y)\\,dy\\,dx.$$

**Fubini's theorem** says the order of integration may be swapped when
\`f\` is continuous (or absolutely integrable). For general regions, set
inner limits as functions of the outer variable.`,
    exercises: [
      { q: "∫₀¹ ∫₀² (x + y) dy dx = ?", kind: "numeric", answer: 3,
        explain: "Inner: 2x + 2; outer: ∫₀¹(2x+2)dx = 1 + 2 = 3." },
    ],
  },
];

const linalg: Lesson[] = [
  {
    id: "la-matmul",
    title: "Matrix multiplication & linear maps",
    summary: "(AB)ᵢⱼ = Σ Aᵢₖ·Bₖⱼ. Why it composes maps.",
    body: `A matrix \`A ∈ ℝ^{m×n}\` encodes a linear map \`T: ℝⁿ → ℝᵐ\`.
The product \`AB\` is the matrix of the composed map \`T_A ∘ T_B\`:

$$(AB)_{ij} = \\sum_{k} A_{ik}\\,B_{kj}.$$

Hence matrix multiplication is associative but in general **not**
commutative.`,
    exercises: [
      { q: "[[1,2],[3,4]] · [[0,1],[1,0]] = ?  Enter the (1,1) entry.",
        kind: "numeric", answer: 2,
        explain: "Row 1 · col 1 = 1·0 + 2·1 = 2." },
      { q: "If A is 3×4 and B is 4×2, AB is …×…", kind: "choice",
        choices: ["3×2", "4×4", "2×3", "undefined"], correct: 0,
        explain: "Inner dims (4) match; outer dims give 3×2." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-determinant",
    title: "Determinant: signed volume scaler",
    summary: "Properties, computation, geometric meaning.",
    body: `\`det A\` is the signed factor by which \`A\` scales \`n\`-dimensional
volume. Key facts:

* \`det(AB) = det A · det B\`
* \`det A^T = det A\`
* \`det A = 0  ⇔  A\` is singular (columns linearly dependent)
* Cofactor expansion lets you compute it by hand; row reduction gives an
  \`O(n³)\` algorithm.`,
    exercises: [
      { q: "det [[2,1],[3,4]] = ?", kind: "numeric", answer: 5,
        explain: "2·4 − 1·3 = 5." },
      { q: "If det A = 3 and det B = −2, det(AB) = ?",
        kind: "numeric", answer: -6,
        explain: "Multiplicative: 3·(−2) = −6." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-eigen",
    title: "Eigenvalues & eigenvectors",
    summary: "Av = λv.  Diagonalization.",
    body: `An **eigenvector** of \`A\` is a non-zero \`v\` with \`A v = λ v\`
for some scalar \`λ\` (the **eigenvalue**). Eigenvalues are roots of the
characteristic polynomial \`det(A − λI) = 0\`.

If \`A\` has \`n\` independent eigenvectors, \`A = P D P^{−1}\` (the
diagonalization) with \`D = diag(λ₁, …, λₙ)\`. Then \`A^k = P D^k P^{−1}\`
is cheap to compute.`,
    exercises: [
      { q: "Eigenvalues of [[2,0],[0,3]] (enter the smaller).",
        kind: "numeric", answer: 2,
        explain: "Diagonal matrix → eigenvalues are the diagonal entries." },
      { q: "trace of A = sum of …", kind: "choice",
        choices: ["eigenvectors", "eigenvalues", "singular values", "determinants"], correct: 1,
        explain: "tr A = Σ λᵢ; det A = Π λᵢ." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-svd",
    title: "Singular Value Decomposition",
    summary: "A = U Σ Vᵀ.  Best low-rank approximation.",
    body: `Every real matrix factors as \`A = U Σ Vᵀ\` with \`U, V\`
orthogonal and \`Σ\` diagonal of non-negative **singular values**
\`σ₁ ≥ σ₂ ≥ … ≥ 0\`.

The rank-\`k\` truncation \`A_k = Σᵢ≤k σᵢ uᵢ vᵢᵀ\` is the best Frobenius
approximation of rank ≤ k (**Eckart–Young theorem**). Foundation of PCA,
image compression, latent semantic analysis.`,
    exercises: [
      { q: "Number of singular values of a 5×3 matrix:",
        kind: "numeric", answer: 3,
        explain: "min(m,n) = 3." },
    ],
    related: ["matrix", "stats"],
  },
];

const probstats: Lesson[] = [
  {
    id: "prob-basics",
    title: "Probability axioms & combinatorics",
    summary: "Sample spaces, counting, conditional.",
    body: `Kolmogorov axioms: \`P(A) ≥ 0\`, \`P(Ω) = 1\`, and countable
additivity for disjoint events.

Counting tools:
\`\`\`
permutations:  P(n,k) = n!/(n−k)!
combinations:  C(n,k) = n!/(k!(n−k)!)
\`\`\`

Conditional probability:  \`P(A|B) = P(A ∩ B)/P(B)\`  for \`P(B) > 0\`.

**Bayes' theorem**:

$$P(A\\mid B) = \\frac{P(B\\mid A)\\,P(A)}{P(B)}.$$`,
    exercises: [
      { q: "How many 5-card poker hands from a 52-card deck? Enter C(52,5).",
        kind: "numeric", answer: 2598960,
        explain: "52!/(5!·47!) = 2 598 960." },
      { q: "P(heart | red card) drawn from a standard deck =",
        kind: "numeric", answer: 0.5,
        explain: "13 hearts among 26 red cards." },
    ],
    related: ["stats"],
  },
  {
    id: "prob-distributions",
    title: "Discrete & continuous distributions",
    summary: "Bernoulli, Binomial, Normal, Exponential.",
    body: `Common probability laws:

| name        | pmf / pdf                                        | mean       | variance   |
|-------------|--------------------------------------------------|------------|------------|
| Bernoulli(p)| P(1)=p, P(0)=1−p                                  | p          | p(1−p)     |
| Binomial(n,p)| C(n,k) pᵏ(1−p)ⁿ⁻ᵏ                                | n p        | n p(1−p)   |
| Poisson(λ)  | e⁻λ λᵏ/k!                                         | λ          | λ          |
| Normal(μ,σ²)| (1/√(2πσ²)) exp(−(x−μ)²/(2σ²))                    | μ          | σ²         |
| Exponential(λ)| λ e⁻λx,  x ≥ 0                                  | 1/λ        | 1/λ²       |`,
    exercises: [
      { q: "X ~ Binomial(10, 0.5). E[X] = ?", kind: "numeric", answer: 5,
        explain: "n·p = 10·0.5." },
      { q: "Z ~ N(0,1).  P(Z ≤ 0) = ?", kind: "numeric", answer: 0.5,
        explain: "The normal is symmetric about its mean." },
    ],
    related: ["stats"],
  },
  {
    id: "prob-hypothesis",
    title: "Hypothesis testing & CIs",
    summary: "p-values, type I / II error, t-tests.",
    body: `Frame the question with a **null** \`H₀\` and **alternative**
\`H₁\`. The **p-value** is \`P(test statistic at least as extreme | H₀)\`.
Reject \`H₀\` when \`p < α\` (commonly 0.05).

One-sample t-statistic:

$$t = \\frac{\\bar x - \\mu_0}{s / \\sqrt{n}} \\sim t_{n-1}.$$

A \`(1 − α)\` confidence interval for the mean:
\`\`\`
x̄ ± t_{α/2, n−1} · s/√n
\`\`\``,
    exercises: [
      { q: "If p = 0.03 and α = 0.05, do we reject H₀?",
        kind: "choice", choices: ["Reject", "Fail to reject"], correct: 0,
        explain: "0.03 < 0.05, so we reject the null at the 5 % level." },
    ],
    related: ["stats"],
  },
];

const diffeq: Lesson[] = [
  {
    id: "ode-first-order",
    title: "First-order ODEs",
    summary: "Separable and linear equations.",
    body: `Separable:  if  \`y' = g(x) h(y)\`,  rearrange

$$\\int \\frac{dy}{h(y)} = \\int g(x)\\,dx.$$

Linear:  \`y' + p(x) y = q(x)\`.  Multiply by integrating factor
\`μ(x) = exp(∫ p dx)\` so the left side becomes \`(μy)'\`.`,
    exercises: [
      { q: "Solve y' = y, y(0)=1, find y(1).",
        kind: "numeric", answer: 2.71828, tol: 1e-3,
        explain: "y = eˣ; y(1) = e ≈ 2.71828." },
      { q: "Solve y' + 2y = 0, y(0)=3.  y(1) = ?",
        kind: "numeric", answer: 0.40601, tol: 1e-3,
        explain: "y = 3 e^{−2x}; y(1) = 3/e² ≈ 0.4060." },
    ],
    related: ["numerics"],
  },
  {
    id: "ode-linear-systems",
    title: "Linear systems via eigenvalues",
    summary: "x' = A x.  Modes and stability.",
    body: `Solutions of \`x' = A x\` decompose into modes \`e^{λᵢ t} vᵢ\`
where \`(λᵢ, vᵢ)\` are eigenpairs of \`A\`. Stability of the origin:

* All Re(λᵢ) < 0: asymptotically stable.
* Any Re(λᵢ) > 0: unstable.
* Pure imaginary eigenvalues: center (orbits).`,
    exercises: [
      { q: "x' = [[0,1],[−1,0]] x. Origin is …",
        kind: "choice",
        choices: ["sink", "source", "center", "saddle"], correct: 2,
        explain: "Eigenvalues ±i  → center; trajectories are circles." },
    ],
    related: ["matrix", "numerics"],
  },
];

const discrete: Lesson[] = [
  {
    id: "disc-induction",
    title: "Mathematical induction",
    summary: "Base case → inductive step.",
    body: `To prove \`P(n)\` for all integers \`n ≥ n₀\`:
1. **Base**: verify \`P(n₀)\`.
2. **Step**: assume \`P(k)\` for some \`k ≥ n₀\` and prove \`P(k+1)\`.

Conclusion: \`P(n)\` holds for every \`n ≥ n₀\`.`,
    exercises: [
      { q: "Closed form for 1 + 2 + … + n. Enter formula in terms of n.",
        kind: "expression", answer: "n*(n+1)/2",
        explain: "Provable by induction; matches Gauss's pairing trick." },
    ],
  },
  {
    id: "disc-modular",
    title: "Modular arithmetic & gcd",
    summary: "a ≡ b (mod n); Euclidean algorithm.",
    body: `\`a ≡ b (mod n)\` means \`n | (a − b)\`. Arithmetic respects ≡
in addition, subtraction and multiplication (but not division — use the
modular inverse, which exists iff \`gcd(a, n) = 1\`).

**Euclidean algorithm**:
\`\`\`
gcd(a, b) = gcd(b, a mod b),   gcd(a, 0) = a.
\`\`\`
Linear in the number of digits; foundation of RSA and lattice algorithms.`,
    exercises: [
      { q: "gcd(252, 198) = ?", kind: "numeric", answer: 18,
        explain: "252 = 198·1 + 54; gcd(198,54)=gcd(54,36)=gcd(36,18)=18." },
      { q: "7 · ? ≡ 1 (mod 26). Enter the inverse in [1,25].",
        kind: "numeric", answer: 15,
        explain: "7·15 = 105 = 4·26 + 1, so 7⁻¹ ≡ 15 (mod 26)." },
    ],
  },
];

const analysis: Lesson[] = [
  {
    id: "an-epsilon-delta",
    title: "Real analysis: ε–δ continuity",
    summary: "The precise definition and a model proof.",
    body: `**Definition.** \`f: ℝ → ℝ\` is continuous at \`a\` iff

$$\\forall \\varepsilon > 0\\ \\exists \\delta > 0:\\ |x - a| < \\delta \\Rightarrow |f(x) - f(a)| < \\varepsilon.$$

**Model proof** that \`f(x) = 2x + 1\` is continuous at every \`a\`:
Given \`ε > 0\`, choose \`δ = ε/2\`. Then \`|x − a| < δ\` ⇒
\`|f(x) − f(a)| = 2|x − a| < 2δ = ε\`.

Uniform continuity tightens this: a single \`δ\` works for the whole domain
(see Heine–Cantor: continuous + compact ⇒ uniformly continuous).`,
    exercises: [
      { q: "For f(x)=3x, a δ that works for ε=0.6 is δ = ?",
        kind: "numeric", answer: 0.2,
        explain: "|f(x)−f(a)| = 3|x−a| < 3·δ = ε; pick δ = ε/3 = 0.2." },
    ],
  },
  {
    id: "an-complex-cr",
    title: "Complex analysis: Cauchy–Riemann",
    summary: "When a complex function is differentiable.",
    body: `Write \`f(z) = u(x, y) + i v(x, y)\` with \`z = x + iy\`.
\`f\` is **holomorphic** on an open set iff \`u, v\` are real-differentiable
there and satisfy the Cauchy–Riemann equations:

$$\\partial_x u = \\partial_y v, \\qquad \\partial_y u = -\\partial_x v.$$

Consequence: \`u\` and \`v\` are harmonic (each satisfies Laplace's equation
\`Δφ = 0\`).`,
    exercises: [
      { q: "Is f(z) = z̄ (complex conjugate) holomorphic?",
        kind: "choice", choices: ["Yes", "No"], correct: 1,
        explain: "u = x, v = −y; ∂x u = 1, ∂y v = −1. Cauchy–Riemann fails." },
    ],
  },
];

const abstract: Lesson[] = [
  {
    id: "ab-groups",
    title: "Groups, subgroups, Lagrange",
    summary: "Closure, associativity, identity, inverses.",
    body: `A **group** is a set \`G\` with an associative operation \`·\`,
identity \`e ∈ G\`, and inverses for every element.

Examples: \`(ℤ, +)\`, \`(ℝ\\{0}, ×)\`, symmetry group of a square \`D₄\`.

**Lagrange's theorem**: in a finite group, the order of any subgroup
divides the order of the group.`,
    exercises: [
      { q: "Order of the cyclic group ℤ/6ℤ:", kind: "numeric", answer: 6,
        explain: "Elements {0,1,2,3,4,5}, six in total." },
      { q: "Is (ℕ, +) a group?", kind: "choice",
        choices: ["Yes", "No — missing inverses"], correct: 1,
        explain: "No additive inverses inside ℕ (e.g. 3 has no −3)." },
    ],
  },
];

const numerical: Lesson[] = [
  {
    id: "num-newton",
    title: "Newton's method",
    summary: "Quadratic convergence near a simple root.",
    body: `Given a differentiable \`f\` and a starting guess \`x₀\`, iterate

$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}.$$

Near a simple root \`x*\` (i.e. \`f(x*)=0, f'(x*)≠0\`) convergence is
**quadratic**: the number of correct digits roughly doubles each step.

Pitfalls: division by zero when \`f'(xₙ)=0\`; divergence with a bad start;
slow on multiple roots — use modified Newton or bisection fallback.`,
    exercises: [
      { q: "Newton on f(x)=x²−2 from x₀=1.  One step gives x₁ = ?",
        kind: "numeric", answer: 1.5,
        explain: "x₁ = 1 − (1−2)/(2·1) = 1 + 0.5 = 1.5." },
    ],
    related: ["numerics"],
  },
  {
    id: "num-fft",
    title: "Discrete Fourier Transform",
    summary: "Frequency decomposition; O(n log n) via FFT.",
    body: `For \`x ∈ ℂⁿ\`, the DFT is

$$X_k = \\sum_{j=0}^{n-1} x_j\\,\\omega^{jk},\\quad \\omega = e^{-2\\pi i/n}.$$

The **Fast Fourier Transform** computes it in \`O(n log n)\` by recursive
halving (Cooley–Tukey). Underlies signal processing, polynomial
multiplication, and PDE solvers.`,
    exercises: [
      { q: "Naive DFT cost for n=1024 is O(n²) flops ≈ ?  Enter n².",
        kind: "numeric", answer: 1048576,
        explain: "1024² = 1 048 576; FFT does it in ~10·1024 ≈ 10 k." },
    ],
  },
];

// ─── Stage registry ────────────────────────────────────────────────────────
export const STAGES: Stage[] = [
  { id: "early",     title: "Foundations",            band: "K–5",          description: "Counting, place value, fractions, decimals.", lessons: earlyArithmetic },
  { id: "pre",       title: "Pre-Algebra",            band: "Gr 6–8",       description: "Integers, ratios, linear equations.",         lessons: preAlgebra },
  { id: "algebra",   title: "Algebra",                band: "Gr 9–10",      description: "Polynomials, factoring, exponentials & logs.", lessons: algebra },
  { id: "trig",      title: "Trigonometry",           band: "Gr 10–11",     description: "Unit circle, identities.",                    lessons: trig },
  { id: "precalc",   title: "Precalculus",            band: "Gr 11–12",     description: "Functions, sequences, series.",               lessons: precalc },
  { id: "calc1",     title: "Calculus I–II",          band: "Yr 1",         description: "Limits, derivatives, integrals.",             lessons: calc1 },
  { id: "multivar",  title: "Multivariable Calculus", band: "Yr 2",         description: "Partials, gradients, multiple integrals.",    lessons: multivar },
  { id: "linalg",    title: "Linear Algebra",         band: "Yr 2",         description: "Matrices, determinants, eigen, SVD.",         lessons: linalg },
  { id: "probstats", title: "Probability & Stats",    band: "Yr 2–3",       description: "Distributions, inference.",                   lessons: probstats },
  { id: "ode",       title: "Differential Equations", band: "Yr 3",         description: "First-order, linear systems.",                lessons: diffeq },
  { id: "discrete",  title: "Discrete Math",          band: "Yr 2–3",       description: "Induction, modular arithmetic.",              lessons: discrete },
  { id: "analysis",  title: "Analysis",               band: "Yr 4 / Grad",  description: "Real & complex foundations.",                 lessons: analysis },
  { id: "abstract",  title: "Abstract Algebra",       band: "Yr 4 / Grad",  description: "Groups, rings, fields.",                      lessons: abstract },
  { id: "numerical", title: "Numerical Methods",      band: "Grad",         description: "Newton, FFT, stability.",                     lessons: numerical },
];

export function findLesson(id: string): { stage: Stage; lesson: Lesson } | null {
  for (const s of STAGES) {
    const l = s.lessons.find((x) => x.id === id);
    if (l) return { stage: s, lesson: l };
  }
  return null;
}
