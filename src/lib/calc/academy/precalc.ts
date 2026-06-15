import type { Lesson } from "./types";

export const precalc: Lesson[] = [
  {
    id: "pre-functions",
    title: "Functions, domain & range",
    summary: "Sets in, sets out, composition, inverses.",
    body: `A **function** \`f : A → B\` assigns each input \`x ∈ A\` to
exactly one output \`f(x) ∈ B\`. The largest \`A\` for which \`f(x)\` makes
sense is the **natural domain**; the set of values \`f\` actually hits is
the **range**.

* \`f(x) = √x\` → domain \`x ≥ 0\`, range \`y ≥ 0\`.
* \`f(x) = 1/x\` → domain \`x ≠ 0\`, range \`y ≠ 0\`.

**Composition**:  \`(g ∘ f)(x) = g(f(x))\`. **Inverse** \`f⁻¹\` exists iff
\`f\` is one-to-one and satisfies \`f(f⁻¹(y)) = y\` for every \`y\` in the
range. To find it algebraically, swap \`x ↔ y\` and solve.`,
    exercises: [
      { q: "Excluded value in dom of f(x)=1/(x−2):", kind: "numeric", answer: 2,
        explain: "x = 2 makes the denominator 0." },
      { q: "f(x)=x+1, g(x)=x².  (g∘f)(3)?", kind: "numeric", answer: 16,
        explain: "f(3)=4; g(4)=16." },
      { q: "Inverse of f(x)=2x−3 at y=5.", kind: "numeric", answer: 4,
        explain: "Solve 2x−3=5 → x=4." },
    ],
    related: ["graph", "cas"],
  },
  {
    id: "pre-transforms",
    title: "Transforming graphs",
    summary: "Shifts, stretches, reflections.",
    body: `Starting from \`y = f(x)\`:

\`\`\`
y = f(x − h)         shift right by h
y = f(x) + k         shift up by k
y = a f(x)           vertical stretch by a (reflect if a < 0)
y = f(b x)           horizontal compress by b (reflect if b < 0)
\`\`\`

Combine in this order: horizontal scale → horizontal shift → vertical
scale → vertical shift. Build instinctively rather than memorising every
combination.`,
    exercises: [
      { q: "y = (x − 3)² + 4 has vertex at (h, k). Enter h.", kind: "numeric", answer: 3,
        explain: "Shift parabola right 3, up 4." },
      { q: "Reflect y = √x across the x-axis. New y at x=4?",
        kind: "numeric", answer: -2,
        explain: "y = −√x → −2." },
    ],
  },
  {
    id: "pre-rational-poly",
    title: "Polynomial & rational function behaviour",
    summary: "End behaviour, asymptotes, holes.",
    body: `For a polynomial \`p(x) = aₙxⁿ + …\`, **end behaviour** is set
by the leading term — \`y → ±∞\` depending on the sign of \`aₙ\` and
parity of \`n\`.

For a rational function \`f = p/q\`:

* **Vertical asymptote** at \`x = a\` if \`q(a) = 0\` and \`p(a) ≠ 0\`.
* **Hole** at \`x = a\` if both vanish (cancelling factor).
* **Horizontal asymptote**:
  * deg p < deg q  → y = 0
  * deg p = deg q  → y = ratio of leading coefficients
  * deg p > deg q  → no horizontal (oblique if exactly one greater)`,
    exercises: [
      { q: "Horizontal asymptote of (3x² + 1)/(2x² − 5)?  (y-value)",
        kind: "numeric", answer: 1.5, tol: 1e-3,
        explain: "Ratio of leading coefficients 3/2." },
      { q: "x with a hole in (x²−1)/(x−1)?", kind: "numeric", answer: 1,
        explain: "Both cancel at x=1." },
    ],
  },
  {
    id: "pre-sequences",
    title: "Sequences & series",
    summary: "Arithmetic, geometric, sigma notation.",
    body: `Arithmetic: \`a_n = a₁ + (n−1)d\`; \`S_n = (n/2)(a₁ + a_n)\`.

Geometric: \`a_n = a₁ rⁿ⁻¹\`; \`S_n = a₁(1 − rⁿ)/(1 − r)\`.

If \`|r| < 1\`, infinite series converges to \`a₁/(1 − r)\`.

Binomial theorem:
$$(a + b)^{n} = \\sum_{k=0}^{n}\\binom{n}{k} a^{n-k} b^{k}.$$`,
    exercises: [
      { q: "Σ_{k=1}^{20} k", kind: "numeric", answer: 210, explain: "20·21/2." },
      { q: "Geometric a₁=4, r=1/2. Infinite sum.", kind: "numeric", answer: 8,
        explain: "4/(1 − 1/2)." },
      { q: "Coefficient of x³ in (1 + x)⁵.", kind: "numeric", answer: 10,
        explain: "C(5,3) = 10." },
    ],
  },
  {
    id: "pre-conics",
    title: "Conic sections",
    summary: "Parabola, ellipse, hyperbola, circle.",
    body: `Standard forms (centre at origin):

\`\`\`
circle:    x² + y² = r²
ellipse:   x²/a² + y²/b² = 1
hyperbola: x²/a² − y²/b² = 1
parabola:  y = (1/(4p)) x²
\`\`\`

Shift by replacing \`x → x − h, y → y − k\`. The **eccentricity** \`e\`
distinguishes them: circle 0, ellipse 0 < e < 1, parabola 1, hyperbola > 1.`,
    exercises: [
      { q: "Radius of  (x−2)² + (y+3)² = 25.", kind: "numeric", answer: 5,
        explain: "r² = 25." },
      { q: "Vertex of y = 3(x − 1)² − 2.  Enter x-coordinate.", kind: "numeric", answer: 1,
        explain: "h = 1." },
    ],
  },
  {
    id: "pre-vectors",
    title: "2-D vectors",
    summary: "Components, dot product, angle.",
    body: `A 2-D **vector** \`v = ⟨a, b⟩\` has magnitude \`|v| = √(a² + b²)\`
and direction \`θ = atan2(b, a)\`. Vectors **add component-wise**.

**Dot product**:  \`u · v = a₁a₂ + b₁b₂ = |u||v| cos θ\`. Zero dot
product ↔ perpendicular vectors.`,
    exercises: [
      { q: "|⟨3, 4⟩|", kind: "numeric", answer: 5, explain: "5-12-13 friend." },
      { q: "⟨1, 2⟩ · ⟨3, 4⟩", kind: "numeric", answer: 11, explain: "3 + 8." },
      { q: "Are ⟨2, 3⟩ and ⟨−3, 2⟩ perpendicular?",
        kind: "choice", choices: ["Yes", "No"], correct: 0,
        explain: "Dot product = −6 + 6 = 0." },
    ],
    related: ["matrix"],
  },
  {
    id: "pre-practice-1",
    kind: "practice",
    title: "Practice set · precalc mixed",
    summary: "10 mixed precalc problems.",
    body: `Each draws on a different lesson; identify the technique first.`,
    exercises: [
      { q: "Domain excluded value of f(x) = ln(x − 3)?  (smallest excluded)",
        kind: "numeric", answer: 3, explain: "ln requires arg > 0." },
      { q: "Sum of 1 + 3 + 9 + 27 + 81.", kind: "numeric", answer: 121,
        explain: "Geometric, r=3, n=5." },
      { q: "Vertex x of y = (x+5)² − 7", kind: "numeric", answer: -5, explain: "h = −5." },
      { q: "Coefficient of x² in (1+x)⁴.", kind: "numeric", answer: 6, explain: "C(4,2)." },
      { q: "Hor asymptote of 5x/(x+1)", kind: "numeric", answer: 5, explain: "Leading ratio." },
      { q: "|⟨6, 8⟩|", kind: "numeric", answer: 10, explain: "√100." },
      { q: "Composition (f∘g)(2) for f=2x, g=x+3.", kind: "numeric", answer: 10, explain: "g=5, then 10." },
      { q: "Inverse of f(x)=3x+1 at y=10.", kind: "numeric", answer: 3, explain: "Solve 3x+1=10." },
      { q: "Eccentricity of a parabola.", kind: "numeric", answer: 1, explain: "By definition." },
      { q: "Σ_{k=0}^{∞} (1/3)ᵏ", kind: "numeric", answer: 1.5, tol: 1e-3, explain: "1/(1 − 1/3) = 3/2." },
    ],
  },
];
