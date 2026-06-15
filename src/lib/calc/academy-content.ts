/**
 * Backwards-compatible re-export. The real curriculum has been split into
 * per-stage modules under ./academy/* — see ./academy/index.ts.
 *
 * Existing imports `from "@/lib/calc/academy-content"` continue to work.
 */
export { STAGES, findLesson } from "./academy";
export type { Stage, Lesson, Exercise, ExerciseKind } from "./academy";
