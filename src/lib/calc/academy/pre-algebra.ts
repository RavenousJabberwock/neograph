import type { Lesson } from "./types";

/** Grades 6–8. Integers, fractions/decimals fluency, ratio/proportion,
 *  percent, expressions, equations, geometry, intro stats/probability. */
export const preAlgebra: Lesson[] = [
  {
    id: "pre-integers",
    title: "Signed numbers & the number line",
    summary: "Adding, subtracting, multiplying negatives.",
    body: `Integers extend the whole numbers with their negatives:
\`…, −3, −2, −1, 0, 1, 2, 3, …\`. They live on the **number line**, with
positives to the right of zero.

Rules of signs (multiplication and division):
\`\`\`
(+)(+) = +    (+)(−) = −
(−)(−) = +    (−)(+) = −
\`\`\`

Subtraction is "add the opposite":  \`a − b = a + (−b)\`. **Absolute value**
\`|x|\` is the distance from 0, so \`|−7| = 7\`.`,
    exercises: [
      { q: "(−7) + 3 = ?", kind: "numeric", answer: -4, explain: "Move 3 right from −7." },
      { q: "(−4)·(−6) = ?", kind: "numeric", answer: 24, explain: "Negative × negative = positive." },
      { q: "5 − (−2) = ?", kind: "numeric", answer: 7, explain: "Subtracting a negative is adding." },
      { q: "|−12| + |5| = ?", kind: "numeric", answer: 17, explain: "12 + 5 = 17." },
      { q: "(−18) ÷ 3 = ?", kind: "numeric", answer: -6, explain: "Negative ÷ positive = negative." },
      { q: "(−2)³ = ?", kind: "numeric", answer: -8, explain: "Odd power keeps the sign: (−2)(−2)(−2) = −8." },
    ],
    related: ["calc"],
  },
  {
    id: "pre-fractions-fluency",
    title: "Fraction operations: ×, ÷, mixed numbers",
    summary: "Multiply, divide, and convert mixed ↔ improper.",
    body: `Multiplying fractions is straightforward — multiply tops, multiply
bottoms, then simplify:
\`\`\`
(2/3) · (4/5) = 8/15
\`\`\`

To divide, **multiply by the reciprocal**:
\`\`\`
(2/3) ÷ (4/5) = (2/3) · (5/4) = 10/12 = 5/6
\`\`\`

A **mixed number** like \`2 1/3\` equals the **improper** fraction
\`7/3\`  (2·3 + 1 over 3). Convert back by long division of numerator by
denominator.`,
    exercises: [
      { q: "(3/4)·(2/9) in lowest terms (a/b)", kind: "expression", answer: "1/6",
        explain: "6/36 = 1/6." },
      { q: "(5/6) ÷ (10/3) (a/b)", kind: "expression", answer: "1/4",
        explain: "(5/6)·(3/10) = 15/60 = 1/4." },
      { q: "Convert  3 2/5  to improper (a/b)", kind: "expression", answer: "17/5",
        explain: "3·5 + 2 = 17 over 5." },
      { q: "Convert  22/7  to a decimal (3 d.p.)", kind: "numeric", answer: 3.143, tol: 0.001,
        explain: "22 ÷ 7 ≈ 3.1428…" },
    ],
  },
  {
    id: "pre-ratio-proportion",
    title: "Ratios, rates, and proportions",
    summary: "Comparing quantities; solving a/b = c/d.",
    body: `A **ratio** compares two quantities of the same kind (3 cups
flour to 2 sugar → 3 : 2). A **rate** compares different units (60 mph). A
**unit rate** has 1 in the denominator (60 mi per 1 h).

A **proportion** is an equation between two ratios:

$$\\frac{a}{b} = \\frac{c}{d} \\iff a\\,d = b\\,c.$$

Cross-multiply, then divide. The constant ratio \`y/x\` for **directly
proportional** quantities is called the **constant of proportionality**.`,
    exercises: [
      { q: "Solve x/15 = 4/5.", kind: "numeric", answer: 12,
        explain: "5x = 60 → x = 12." },
      { q: "180 mi in 3 h →  __ mi/h?", kind: "numeric", answer: 60,
        explain: "180/3 = 60." },
      { q: "If 8 pencils cost $2, what do 20 cost?  Enter dollars.",
        kind: "numeric", answer: 5,
        explain: "$0.25 each × 20 = $5." },
      { q: "Scale model: 1 cm ↔ 4 m. A 15-m wall is __ cm on the model.",
        kind: "numeric", answer: 3.75, tol: 1e-3,
        explain: "15/4 = 3.75 cm." },
    ],
  },
  {
    id: "pre-percent",
    title: "Percent: rates, increase, discount",
    summary: "% means per hundred — switching forms cleanly.",
    body: `\`p%\` means \`p/100\`. Convert by sliding the decimal point two
places:  \`23% = 0.23\`,  \`0.4 = 40%\`,  \`3/5 = 60%\`.

* **Percent of a number**:  \`12% of 250 = 0.12·250 = 30\`.
* **Percent increase / decrease** from \`old\` to \`new\`:
  \`\`\`
  % change = (new − old) / old · 100%
  \`\`\`
* **Markup / discount**: new price = old · (1 ± rate).
* **Working backwards**: if \`30 = 12% of x\`, then \`x = 30 / 0.12 = 250\`.`,
    exercises: [
      { q: "What is 15% of 80?", kind: "numeric", answer: 12, explain: "0.15·80 = 12." },
      { q: "A shirt is $40, discounted 25%. Sale price?", kind: "numeric", answer: 30,
        explain: "40·(1 − 0.25) = 30." },
      { q: "Price rose from $80 to $100. % increase?", kind: "numeric", answer: 25,
        explain: "(100−80)/80 = 25%." },
      { q: "18 is 30% of __?", kind: "numeric", answer: 60, explain: "18 / 0.30 = 60." },
      { q: "Sales tax 8.5% on $24. Total to pay?", kind: "numeric", answer: 26.04, tol: 0.01,
        explain: "24 + 24·0.085 = 26.04." },
    ],
  },
  {
    id: "pre-exponents-roots",
    title: "Exponents, scientific notation, square roots",
    summary: "Laws of exponents and powers of 10.",
    body: `For nonzero bases, the **laws of exponents** are
\`\`\`
aᵐ · aⁿ = aᵐ⁺ⁿ            (aᵐ)ⁿ = aᵐⁿ
aᵐ / aⁿ = aᵐ⁻ⁿ            a⁰ = 1
a⁻ⁿ = 1 / aⁿ              (ab)ⁿ = aⁿ · bⁿ
\`\`\`

**Scientific notation** writes a number as \`m × 10ⁿ\` with \`1 ≤ |m| < 10\`.
Big numbers get positive exponents, tiny numbers negative:
\`\`\`
93 000 000 = 9.3 × 10⁷       0.00042 = 4.2 × 10⁻⁴
\`\`\`

A **square root** \`√x\` is the non-negative number whose square is \`x\`.
Perfect squares 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, … are worth memorising.`,
    exercises: [
      { q: "2³ · 2⁴ = 2^?", kind: "numeric", answer: 7, explain: "Add exponents." },
      { q: "(10⁵)² in scientific notation, enter the exponent.",
        kind: "numeric", answer: 10, explain: "10^{5·2} = 10¹⁰." },
      { q: "√144 = ?", kind: "numeric", answer: 12, explain: "12² = 144." },
      { q: "Write 0.0065 in scientific notation: 6.5 × 10^n. n = ?",
        kind: "numeric", answer: -3, explain: "Move the decimal three places right." },
      { q: "5⁰ = ?", kind: "numeric", answer: 1, explain: "Any nonzero base to the 0 is 1." },
    ],
  },
  {
    id: "pre-expressions",
    title: "Algebraic expressions & like terms",
    summary: "Variables, evaluating, combining like terms.",
    body: `A **variable** is a letter that stands for a number. An
**expression** is built from numbers, variables and operations.

**Evaluate** by substituting and following PEMDAS / BODMAS:
parentheses → exponents → multiply & divide → add & subtract.

**Like terms** have the same variable part (same letters to the same
powers). Combine by adding coefficients:
\`\`\`
3x + 5x = 8x          2x²y + 3x²y = 5x²y         x + x² (unlike — cannot combine)
\`\`\`

**Distributive property**:  \`a(b + c) = ab + ac\`.`,
    exercises: [
      { q: "Evaluate  3x² − 2x + 1  at x = 4.", kind: "numeric", answer: 41,
        explain: "3·16 − 8 + 1 = 41." },
      { q: "Simplify  4x + 3 − 2x + 7  (in form a*x + b).",
        kind: "expression", answer: "2*x+10",
        explain: "Combine like: (4−2)x + (3+7) = 2x + 10." },
      { q: "Expand  5(2x − 3).", kind: "expression", answer: "10*x-15",
        explain: "Distribute: 10x − 15." },
    ],
    related: ["cas"],
  },
  {
    id: "pre-linear-eq",
    title: "Solving linear equations",
    summary: "Isolating x using inverse operations.",
    body: `To solve \`a·x + b = c\`, undo operations in reverse order (PEMDAS
backwards):

1. Subtract \`b\` from both sides → \`a·x = c − b\`.
2. Divide both sides by \`a\` (provided \`a ≠ 0\`) → \`x = (c − b) / a\`.

Whatever you do to one side, do to the other. The equality is a contract.

**Equations with variables on both sides**: collect x-terms on one side,
constants on the other.  **Watch the sign** when moving terms across the
equals sign.`,
    exercises: [
      { q: "Solve  2x + 5 = 17.", kind: "numeric", answer: 6, explain: "2x = 12; x = 6." },
      { q: "Solve  3(x − 4) = 2x + 1.", kind: "numeric", answer: 13,
        explain: "3x − 12 = 2x + 1 → x = 13." },
      { q: "Solve  (x − 1)/4 = 3.", kind: "numeric", answer: 13,
        explain: "x − 1 = 12 → x = 13." },
      { q: "Solve  5 − 2x = 11.", kind: "numeric", answer: -3,
        explain: "−2x = 6 → x = −3." },
    ],
    related: ["cas", "calc"],
  },
  {
    id: "pre-inequalities",
    title: "Inequalities",
    summary: "<, ≤, >, ≥ and the sign-flip rule.",
    body: `Inequalities behave like equations under addition / subtraction
and under multiplication / division by a **positive** number. The trap:

> Multiplying or dividing by a **negative** flips the inequality sign.

Solution sets are **intervals** on the number line, drawn with an open
circle for strict inequalities and a closed circle for ≤ / ≥.`,
    exercises: [
      { q: "Solve  −3x ≤ 12.  Enter the smallest integer in the solution.",
        kind: "numeric", answer: -4,
        explain: "Divide by −3, flip: x ≥ −4. Smallest integer in the set: −4." },
      { q: "Solve  2x − 5 > 7.  Enter the smallest integer strictly greater than the boundary.",
        kind: "numeric", answer: 7,
        explain: "2x > 12 → x > 6 → smallest integer satisfying is 7." },
    ],
  },
  {
    id: "pre-coords",
    title: "Coordinate plane & slope",
    summary: "(x, y), quadrants, rise over run.",
    body: `The **Cartesian plane** has perpendicular x- and y-axes meeting
at the **origin** \`(0, 0)\`. The four **quadrants** are numbered
counter-clockwise from the upper-right.

The **slope** of the line through \`(x₁, y₁)\` and \`(x₂, y₂)\`:

$$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{\\text{rise}}{\\text{run}}.$$

The line's **slope-intercept form** is \`y = m x + b\`, where \`b\` is the
y-intercept. Horizontal lines have slope 0; vertical lines have undefined
slope.`,
    exercises: [
      { q: "Slope through (1, 2) and (4, 11)?", kind: "numeric", answer: 3,
        explain: "(11−2)/(4−1) = 9/3 = 3." },
      { q: "y-intercept of  y = −2x + 5?", kind: "numeric", answer: 5,
        explain: "b = 5." },
      { q: "Which quadrant contains (−3, 4)?",
        kind: "choice", choices: ["I", "II", "III", "IV"], correct: 1,
        explain: "x<0, y>0 → Q II." },
    ],
    related: ["graph"],
  },
  {
    id: "pre-pythag",
    title: "The Pythagorean theorem",
    summary: "a² + b² = c² for right triangles.",
    body: `In a **right triangle** (one 90° angle), the side opposite the
right angle is the **hypotenuse**. If the legs are \`a, b\` and the
hypotenuse is \`c\`,

$$a^{2} + b^{2} = c^{2}.$$

It also gives the distance between two points in the plane:

$$d = \\sqrt{(x_2 - x_1)^{2} + (y_2 - y_1)^{2}}.$$`,
    exercises: [
      { q: "Legs 3 and 4 → hypotenuse?", kind: "numeric", answer: 5, explain: "9+16=25." },
      { q: "Hypotenuse 13, leg 5 → other leg?", kind: "numeric", answer: 12,
        explain: "13² − 5² = 144." },
      { q: "Distance from (1,2) to (4,6)?", kind: "numeric", answer: 5,
        explain: "√(9 + 16) = 5." },
    ],
  },
  {
    id: "pre-stats",
    title: "Stats & probability basics",
    summary: "Spread, frequency tables, simple probability.",
    body: `Beyond mean/median/mode (Foundations), a **range** is
max − min and **interquartile range** is Q3 − Q1 (middle 50 %).

**Probability** of an event \`E\` from a uniform sample space:

$$P(E) = \\frac{|E|}{|\\Omega|} = \\frac{\\text{favourable}}{\\text{total}}.$$

Independent events: \`P(A and B) = P(A)·P(B)\`. Mutually exclusive:
\`P(A or B) = P(A) + P(B)\`.`,
    exercises: [
      { q: "Roll a fair die. P(roll ≥ 5)?", kind: "numeric", answer: 0.3333, tol: 1e-3,
        explain: "{5,6} out of 6 → 2/6." },
      { q: "Two coin flips. P(both heads)?", kind: "numeric", answer: 0.25,
        explain: "½ · ½ = 1/4." },
      { q: "Range of  4, 8, 15, 3, 11?", kind: "numeric", answer: 12,
        explain: "15 − 3 = 12." },
    ],
    related: ["stats"],
  },
  {
    id: "pre-practice-1",
    kind: "practice",
    title: "Practice set · pre-algebra mixed",
    summary: "12-question retrieval drill mixing the topics so far.",
    body: `Spaced practice strengthens long-term recall. Push yourself to
do each in your head if you can.`,
    exercises: [
      { q: "(−3) + (−9)", kind: "numeric", answer: -12, explain: "Same sign, add and keep." },
      { q: "Solve 4x − 7 = 17.", kind: "numeric", answer: 6, explain: "4x = 24." },
      { q: "20% of 250.", kind: "numeric", answer: 50, explain: "0.2·250 = 50." },
      { q: "GCD(36, 48).", kind: "numeric", answer: 12, explain: "12·3 = 36, 12·4 = 48." },
      { q: "Simplify (3/8)·(4/9) (a/b).", kind: "expression", answer: "1/6", explain: "12/72 = 1/6." },
      { q: "Slope through (0,5) and (4,−3).", kind: "numeric", answer: -2, explain: "−8/4." },
      { q: "(−2)⁴", kind: "numeric", answer: 16, explain: "Even power → positive." },
      { q: "√169", kind: "numeric", answer: 13, explain: "13² = 169." },
      { q: "Solve 5 − 3x > −1.  Largest integer in the set?", kind: "numeric", answer: 1,
        explain: "−3x > −6 → x < 2 → 1." },
      { q: "Expand 2(3x − 5).", kind: "expression", answer: "6*x-10", explain: "Distribute." },
      { q: "Distance (0,0) to (5,12).", kind: "numeric", answer: 13, explain: "5-12-13 triple." },
      { q: "P(odd) on a fair die.", kind: "numeric", answer: 0.5, explain: "{1,3,5} of 6." },
    ],
  },
];
