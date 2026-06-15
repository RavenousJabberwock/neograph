import type { Lesson } from "./types";

/**
 * K–5 Foundations. Counting, place value, the four operations, fractions,
 * decimals, measurement, intro geometry, and intro data. Cross-checked
 * against the Common Core State Standards (Math) and OpenStax Prealgebra.
 */
export const earlyArithmetic: Lesson[] = [
  {
    id: "k5-counting",
    title: "Counting & one-to-one matching",
    summary: "Cardinality, skip-counting, even and odd.",
    body: `Counting is the act of pairing each object in a set with exactly
one number word from the list 1, 2, 3, … The **last** number you say is the
**cardinality** — the size of the set.

Skip-counting reveals patterns:
\`\`\`
by 2:   2, 4, 6, 8, 10, 12, …    (the even numbers)
by 5:   5, 10, 15, 20, 25, …      (ends in 0 or 5)
by 10:  10, 20, 30, 40, 50, …
\`\`\`

A whole number is **even** if it's divisible by 2 (no remainder), and **odd**
otherwise. Even + even = even, odd + odd = even, even + odd = odd.`,
    exercises: [
      { q: "What number comes next:  3, 6, 9, 12, __ ?", kind: "numeric", answer: 15,
        explain: "Skip-counting by 3: 12 + 3 = 15." },
      { q: "Is 47 even or odd?", kind: "choice", choices: ["Even", "Odd"], correct: 1,
        explain: "47 ends in 7 (odd digit) → 47 is odd." },
      { q: "Count by 5s starting at 25:  25, 30, 35, __ ?", kind: "numeric", answer: 40,
        explain: "35 + 5 = 40." },
      { q: "Sum of the first 5 even numbers: 2+4+6+8+10 =", kind: "numeric", answer: 30,
        explain: "2+4=6, +6=12, +8=20, +10=30." },
    ],
  },
  {
    id: "k5-place-value",
    title: "Place value & whole numbers",
    summary: "Reading and writing multi-digit numbers.",
    body: `In base ten, each position is worth ten times the position to its
right. The digit \`3\` in **307** means three **hundreds** because it sits
in the hundreds place; the \`7\` is just seven ones.

\`\`\`
millions | hundred-thousands | ten-thousands | thousands | hundreds | tens | ones
   2     |        4          |       0       |    1      |    7     |  3   |  6
   →  2 401 736
\`\`\`

Reading: "two million, four hundred one thousand, seven hundred thirty-six."

To **compare** two numbers of equal digit-length, scan left to right and
stop at the first digit that differs.`,
    exercises: [
      { q: "Value of the digit 7 in 4,723?", kind: "numeric", answer: 700,
        explain: "7 sits in the hundreds place: 7 × 100 = 700." },
      { q: "Write three thousand fifty in digits.", kind: "numeric", answer: 3050,
        explain: "Three thousand = 3 000, plus fifty = 50 → 3 050." },
      { q: "Which is larger?", kind: "choice", choices: ["8 091", "8 910", "8 109"], correct: 1,
        explain: "Hundreds digits: 9 > 1 ≥ 0, so 8 910 wins." },
      { q: "Expanded form of 5 074:  5000 + ___ + 70 + 4. Enter the blank.",
        kind: "numeric", answer: 0,
        explain: "There are zero hundreds — the 0 in 5 074 is a place holder." },
      { q: "Round 6 478 to the nearest hundred.", kind: "numeric", answer: 6500,
        explain: "Tens digit is 7 (≥ 5), so round up to 6 500." },
    ],
    related: ["calc"],
  },
  {
    id: "k5-add-sub",
    title: "Addition & subtraction with regrouping",
    summary: "Carrying, borrowing, and mental tricks.",
    body: `**Add** column by column from the ones place. When a column sum
reaches 10 or more, **carry** the 10 into the next column.

\`\`\`
   1                    ← carries
   3 6 8
 + 2 7 4
 ---------
   6 4 2
\`\`\`

**Subtract** the same way, but when the top digit is too small, **borrow**
10 from the next column.

**Useful tricks** (mental math):
* "Make a 10":  \`8 + 7 = 8 + 2 + 5 = 15\`.
* Compensate:  \`53 − 19 = 53 − 20 + 1 = 34\`.
* Doubles + 1: \`6 + 7 = 6 + 6 + 1 = 13\`.`,
    exercises: [
      { q: "457 + 286 = ?", kind: "numeric", answer: 743,
        explain: "7+6=13 carry 1; 5+8+1=14 carry 1; 4+2+1=7 → 743." },
      { q: "802 − 357 = ?", kind: "numeric", answer: 445,
        explain: "Borrow across the 0: 802 − 357 = 445." },
      { q: "Mental:  47 + 38 = ?", kind: "numeric", answer: 85,
        explain: "47 + 40 = 87, then − 2 → 85." },
      { q: "Estimate 612 + 389 to the nearest hundred.", kind: "numeric", answer: 1000,
        explain: "≈ 600 + 400 = 1 000  (actual 1 001)." },
    ],
  },
  {
    id: "k5-mult-div",
    title: "Multiplication & division facts",
    summary: "Times tables, area model, long division.",
    body: `Multiplication is repeated addition: \`4 × 3 = 3 + 3 + 3 + 3\`.
The **area model** shows why \`(a + b)·c = a·c + b·c\`:

\`\`\`
            c
       ┌───────┐
   a   │ a·c   │
       ├───────┤
   b   │ b·c   │
       └───────┘
       total = (a+b)·c
\`\`\`

Division is the inverse: \`20 ÷ 4 = 5\` because \`5 × 4 = 20\`. **Long
division** is the systematic version, processing digits from the highest
place down. **Remainder**: \`23 ÷ 5 = 4 r 3\`  because \`5·4 + 3 = 23\`.`,
    exercises: [
      { q: "7 × 8 = ?", kind: "numeric", answer: 56, hint: "7 × 8 = 7 × 10 − 7 × 2.",
        explain: "70 − 14 = 56." },
      { q: "84 ÷ 6 = ?", kind: "numeric", answer: 14,
        explain: "6 × 14 = 84." },
      { q: "What is 23 ÷ 5? Enter the remainder.", kind: "numeric", answer: 3,
        explain: "5 × 4 = 20; 23 − 20 = 3." },
      { q: "Area of a 12 × 15 rectangle.", kind: "numeric", answer: 180,
        explain: "12 × 15 = 12 × 10 + 12 × 5 = 120 + 60 = 180." },
      { q: "Which property does  3·(4 + 5) = 3·4 + 3·5  illustrate?",
        kind: "choice", choices: ["Commutative", "Associative", "Distributive", "Identity"], correct: 2,
        explain: "Multiplication distributes over addition." },
    ],
  },
  {
    id: "k5-fractions",
    title: "Fractions: parts of a whole",
    summary: "Numerator, denominator, equivalents, comparison.",
    body: `A fraction \`a/b\` means: cut a whole into \`b\` equal parts and
take \`a\` of them. The bottom number is the **denominator**, the top is
the **numerator**.

**Equivalent fractions** name the same amount; multiply (or divide) top
and bottom by the same nonzero number.

\`\`\`
1/2 = 2/4 = 3/6 = 50/100
\`\`\`

Compare \`a/b\` vs \`c/d\` by cross-multiplying:  \`a·d\` vs \`b·c\`
(positive denominators). To add fractions with **different denominators**,
rewrite over a common one (the LCM is tidiest):
\`\`\`
1/4 + 1/6  =  3/12 + 2/12  =  5/12.
\`\`\``,
    exercises: [
      { q: "Which fraction equals 3/4?", kind: "choice",
        choices: ["6/12", "9/12", "8/12"], correct: 1,
        explain: "9/12 = 3/4 after dividing top and bottom by 3." },
      { q: "Add: 1/4 + 1/2.  Enter as a decimal.", kind: "numeric", answer: 0.75,
        explain: "Common denominator 4: 1/4 + 2/4 = 3/4 = 0.75." },
      { q: "Simplify 18/24 to lowest terms (a/b).", kind: "expression", answer: "3/4",
        explain: "Divide top and bottom by GCD 6." },
      { q: "Which is larger, 3/5 or 5/8?", kind: "choice",
        choices: ["3/5", "5/8", "Equal"], correct: 1,
        explain: "Cross-multiply: 3·8 = 24 vs 5·5 = 25 → 5/8 wins." },
      { q: "5/6 − 1/3 = ?  Enter a/b in lowest terms.", kind: "expression", answer: "1/2",
        explain: "1/3 = 2/6, so 5/6 − 2/6 = 3/6 = 1/2." },
    ],
    related: ["calc"],
  },
  {
    id: "k5-decimals",
    title: "Decimals, rounding, money",
    summary: "Tenths/hundredths, rounding rules, dollar arithmetic.",
    body: `Place values continue past the decimal point: tenths,
hundredths, thousandths. \`0.314\` = 3 tenths + 1 hundredth + 4
thousandths.

**Rounding** to a place: look at the digit immediately to the right. If
it's 5 or more, round up; otherwise round down (the "round half up"
convention used in school).

**Money** uses two decimal places (cents): \`$3.05\` = 3 dollars + 5
cents. Add and subtract by lining up the decimal point.`,
    exercises: [
      { q: "Round 3.276 to the nearest tenth.", kind: "numeric", answer: 3.3,
        explain: "Hundredths digit is 7 ≥ 5, round up." },
      { q: "0.4 + 0.07 = ?", kind: "numeric", answer: 0.47,
        explain: "0.40 + 0.07 = 0.47." },
      { q: "$5.00 − $1.65 = ?  Enter dollars (e.g. 3.35).",
        kind: "numeric", answer: 3.35,
        explain: "5.00 − 1.65 = 3.35." },
      { q: "Which is larger, 0.5 or 0.45?",
        kind: "choice", choices: ["0.5", "0.45", "Equal"], correct: 0,
        explain: "0.5 = 0.50 > 0.45." },
    ],
  },
  {
    id: "k5-measurement",
    title: "Measurement & unit conversion",
    summary: "Length, mass, time; metric & US conversions.",
    body: `**Metric** units scale by powers of 10 — easy to convert:
\`\`\`
1 km = 1000 m       1 m = 100 cm       1 cm = 10 mm
1 kg = 1000 g       1 L = 1000 mL
\`\`\`
**US customary** is irregular but worth memorising the basics:
\`\`\`
1 ft = 12 in        1 yd = 3 ft        1 mi = 5280 ft
1 lb = 16 oz        1 gal = 4 qt = 8 pt = 16 cups
\`\`\`
**Time**: 60 s = 1 min, 60 min = 1 h, 24 h = 1 day, 7 days = 1 week.

To **convert**, multiply by a "unit fraction" equal to 1, like
\`(100 cm)/(1 m)\` — the units cancel.`,
    exercises: [
      { q: "How many cm in 3.5 m?", kind: "numeric", answer: 350,
        explain: "3.5 × 100 = 350 cm." },
      { q: "How many minutes in 2 1/2 hours?", kind: "numeric", answer: 150,
        explain: "2.5 × 60 = 150 minutes." },
      { q: "Convert 72 inches to feet.", kind: "numeric", answer: 6,
        explain: "72 / 12 = 6 ft." },
      { q: "A bottle holds 1.5 L.  How many mL?", kind: "numeric", answer: 1500,
        explain: "1.5 × 1000 = 1 500." },
    ],
  },
  {
    id: "k5-geometry",
    title: "Shapes, perimeter, area",
    summary: "Polygons, perimeter formulas, area of rectangles & triangles.",
    body: `A **polygon** is a closed figure made of straight sides.
Common ones: triangle (3 sides), quadrilateral (4), pentagon (5),
hexagon (6).

**Perimeter** = sum of side lengths. **Area** for a rectangle is
\`length × width\`; for a triangle, \`½ × base × height\`.

A **square** is a rectangle with all sides equal. A **circle** has
circumference \`C = 2πr\` and area \`A = π r²\`  (π ≈ 3.14159).`,
    exercises: [
      { q: "Perimeter of a 7×3 rectangle.", kind: "numeric", answer: 20,
        explain: "2·(7+3) = 20." },
      { q: "Area of a triangle with base 10 and height 4.", kind: "numeric", answer: 20,
        explain: "½ · 10 · 4 = 20." },
      { q: "Area of a circle with radius 5 (use π ≈ 3.14).",
        kind: "numeric", answer: 78.54, tol: 0.1,
        explain: "π · 25 ≈ 78.54." },
      { q: "How many sides does a hexagon have?", kind: "numeric", answer: 6,
        explain: "Hexa- means six." },
    ],
  },
  {
    id: "k5-data",
    title: "Data: mean, median, mode",
    summary: "Summarising a small list of numbers.",
    body: `Three quick "centre" measures for a list of numbers:

* **Mean** = sum ÷ count (the arithmetic average).
* **Median** = middle value when the list is sorted (average the two
  middle values if the count is even).
* **Mode** = the value that appears most often (a list can have several
  modes, or none).

**Range** = max − min, a crude spread measure.`,
    exercises: [
      { q: "Mean of  4, 7, 8, 5, 6?", kind: "numeric", answer: 6,
        explain: "Sum 30 ÷ 5 = 6." },
      { q: "Median of  3, 1, 9, 4, 7?", kind: "numeric", answer: 4,
        explain: "Sorted: 1, 3, 4, 7, 9 → middle is 4." },
      { q: "Mode of  2, 5, 2, 3, 5, 5, 1?", kind: "numeric", answer: 5,
        explain: "5 appears three times — more than any other value." },
      { q: "Range of  12, 7, 19, 4?", kind: "numeric", answer: 15,
        explain: "19 − 4 = 15." },
    ],
    related: ["stats"],
  },
  {
    id: "k5-practice-1",
    kind: "practice",
    title: "Practice set · mixed arithmetic",
    summary: "10-question mixed drill on the basics so far.",
    body: `Mix it up. Each problem reaches back into the lessons above. Try
to do them mentally where you can.`,
    exercises: [
      { q: "246 + 159 = ?", kind: "numeric", answer: 405, explain: "6+9=15 c1; 4+5+1=10 c1; 2+1+1=4 → 405." },
      { q: "9 × 7 = ?", kind: "numeric", answer: 63, explain: "Times-table fact." },
      { q: "144 ÷ 12 = ?", kind: "numeric", answer: 12, explain: "12² = 144." },
      { q: "Round 4 567 to the nearest thousand.", kind: "numeric", answer: 5000, explain: "Hundreds digit 5 → round up." },
      { q: "1/2 + 1/3 (decimal, 2 d.p.)", kind: "numeric", answer: 0.83, tol: 0.01, explain: "= 5/6 ≈ 0.833." },
      { q: "0.6 − 0.27 = ?", kind: "numeric", answer: 0.33, explain: "0.60 − 0.27 = 0.33." },
      { q: "Perimeter of a square with side 9.", kind: "numeric", answer: 36, explain: "4 × 9." },
      { q: "How many mL in 0.75 L?", kind: "numeric", answer: 750, explain: "0.75 × 1000." },
      { q: "Mean of  10, 20, 30?", kind: "numeric", answer: 20, explain: "60 ÷ 3 = 20." },
      { q: "What comes next: 1, 4, 9, 16, __?", kind: "numeric", answer: 25, explain: "Perfect squares: 5² = 25." },
    ],
  },
];
