/**
 * Shared Academy types. Re-exported from academy-content.ts so existing
 * imports (`@/lib/calc/academy-content`) keep working.
 */
import type { PanelKey } from "../store";

export type ExerciseKind = "numeric" | "choice" | "expression" | "text";

export interface Exercise {
  q: string;
  kind: ExerciseKind;
  answer?: number | string;
  tol?: number;
  choices?: string[];
  correct?: number;
  hint?: string;
  explain: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  body: string;
  exercises: Exercise[];
  related?: PanelKey[];
  /** Optional badge: "practice" lessons are pure drill sets. */
  kind?: "lesson" | "practice";
}

export interface Stage {
  id: string;
  title: string;
  band: string;
  description: string;
  lessons: Lesson[];
}
