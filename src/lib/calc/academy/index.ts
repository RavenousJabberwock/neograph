/**
 * Academy curriculum registry.
 * ------------------------------------------------------------------
 * The Academy spans K–Postgrad mathematics. Each stage lives in its own
 * module so the curriculum can be expanded without bloating a single
 * file. Sources cross-checked against OpenStax, Khan Academy outlines,
 * MIT OCW, Wikipedia, and NIST DLMF; prose, examples, and exercises are
 * written fresh here.
 *
 * To extend: add a lesson to the relevant stage module, or create a new
 * stage module and register it below. The Academy UI auto-renders.
 * ------------------------------------------------------------------
 */
import type { Stage } from "./types";
import { earlyArithmetic } from "./early";
import { preAlgebra }      from "./pre-algebra";
import { algebra }         from "./algebra";
import { trig }            from "./trig";
import { precalc }         from "./precalc";
import { calc1 }           from "./calc1";
import { multivar }        from "./multivar";
import { linalg }          from "./linalg";
import { probstats }       from "./probstats";
import { diffeq }          from "./diffeq";
import { discrete }        from "./discrete";
import { analysis }        from "./analysis";
import { abstract as abstr } from "./abstract";
import { numerical }       from "./numerical";

export const STAGES: Stage[] = [
  { id: "early",     title: "Foundations",            band: "K–5",          description: "Counting, place value, fractions, decimals, measurement, geometry, data.", lessons: earlyArithmetic },
  { id: "pre",       title: "Pre-Algebra",            band: "Gr 6–8",       description: "Integers, ratios, percent, expressions, equations, Pythagoras.",          lessons: preAlgebra },
  { id: "algebra",   title: "Algebra I–II",           band: "Gr 9–10",      description: "Linear, quadratic, polynomial, rational, exponential & logarithmic.",     lessons: algebra },
  { id: "trig",      title: "Trigonometry",           band: "Gr 10–11",     description: "Unit circle, identities, equations, laws of sines/cosines, polar.",      lessons: trig },
  { id: "precalc",   title: "Precalculus",            band: "Gr 11–12",     description: "Functions, transformations, conics, sequences, vectors.",                lessons: precalc },
  { id: "calc1",     title: "Single-Variable Calculus",band: "Yr 1",        description: "Limits, derivatives, integrals, series.",                                lessons: calc1 },
  { id: "multivar",  title: "Multivariable Calculus", band: "Yr 2",         description: "Partials, gradients, multiple integrals, vector calculus.",             lessons: multivar },
  { id: "linalg",    title: "Linear Algebra",         band: "Yr 2",         description: "Vectors, systems, determinants, eigenvalues, SVD.",                     lessons: linalg },
  { id: "probstats", title: "Probability & Statistics", band: "Yr 2–3",     description: "Distributions, CLT, inference, regression.",                            lessons: probstats },
  { id: "ode",       title: "Differential Equations", band: "Yr 3",         description: "First-, second-order, systems, numerics.",                              lessons: diffeq },
  { id: "discrete",  title: "Discrete Math",          band: "Yr 2–3",       description: "Logic, sets, induction, combinatorics, graphs.",                        lessons: discrete },
  { id: "analysis",  title: "Analysis",               band: "Yr 4 / Grad",  description: "Real & complex foundations, series, measure.",                          lessons: analysis },
  { id: "abstract",  title: "Abstract Algebra",       band: "Yr 4 / Grad",  description: "Groups, rings, fields, homomorphisms.",                                 lessons: abstr },
  { id: "numerical", title: "Numerical Methods",      band: "Grad",         description: "Floating point, root-finding, linear solve, quadrature, FFT.",          lessons: numerical },
];

export function findLesson(id: string) {
  for (const s of STAGES) {
    const l = s.lessons.find((x) => x.id === id);
    if (l) return { stage: s, lesson: l };
  }
  return null;
}

export type { Stage, Lesson, Exercise, ExerciseKind } from "./types";
