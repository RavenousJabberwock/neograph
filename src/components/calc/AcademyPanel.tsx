/**
 * AcademyPanel — interactive K-through-Postgrad math curriculum.
 * ------------------------------------------------------------------
 * Three-pane layout:
 *   ┌──────────────┬──────────────┬──────────────────────────────┐
 *   │   Stages     │   Lessons    │   Lesson body + Exercises    │
 *   └──────────────┴──────────────┴──────────────────────────────┘
 *
 * Progress (lessons completed, per-exercise pass/fail) is stored in
 * localStorage under `lvbl_academy_progress_v1`. Exercises check answers
 * symbolically (math.js) for "expression" kind and numerically with
 * tolerance for "numeric" kind.
 *
 * Extending the curriculum: add lessons/stages in academy-content.ts —
 * this UI requires no changes.
 * ------------------------------------------------------------------
 */
import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap, BookOpen, ChevronRight, Check, X as XIcon,
  RotateCcw, ExternalLink, Lightbulb,
} from "lucide-react";
import { STAGES, type Exercise, type Lesson, type Stage, findLesson } from "@/lib/calc/academy-content";
import { MarkdownView } from "./MarkdownView";
import { math } from "@/lib/calc/math";
import { useCalc } from "@/lib/calc/store";

const PROGRESS_KEY = "lvbl_academy_progress_v1";
const SELECT_KEY   = "lvbl_academy_last_v1";

interface Progress {
  /** lessonId → exerciseIndex → "ok" | "miss" */
  ex: Record<string, Record<number, "ok" | "miss">>;
}

function loadProgress(): Progress {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{"ex":{}}'); }
  catch { return { ex: {} }; }
}
function saveProgress(p: Progress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* quota */ }
}

/** Symbolic / numeric grader. Returns true if `user` matches `target`. */
function gradeExpression(user: string, target: string, tol = 1e-6): boolean {
  if (!user.trim()) return false;
  // Normalize unicode minus
  const norm = (s: string) => s.replace(/[−–]/g, "-").replace(/\s+/g, "");
  if (norm(user) === norm(target)) return true;
  // Try symbolic equality via difference simplification.
  try {
    const diff = math.simplify(`(${user}) - (${target})`).toString();
    if (diff === "0") return true;
  } catch { /* fall through */ }
  // Numeric sampling fallback: probe at a handful of x-values.
  try {
    const f = math.compile(user);
    const g = math.compile(target);
    const xs = [-1.7, -0.3, 0.2, 0.9, 1.4, 2.5];
    for (const x of xs) {
      const a = Number(f.evaluate({ x, y: x * 0.3, t: x }));
      const b = Number(g.evaluate({ x, y: x * 0.3, t: x }));
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      if (Math.abs(a - b) > tol * (1 + Math.abs(b))) return false;
    }
    return true;
  } catch { return false; }
}

function gradeNumeric(user: string, target: number, tol: number): boolean {
  if (!user.trim()) return false;
  // Accept arithmetic expressions like "1/2" or "sqrt(2)".
  let v = NaN;
  try { v = Number(math.evaluate(user)); }
  catch { v = Number(user); }
  if (!Number.isFinite(v)) return false;
  return Math.abs(v - target) <= tol;
}

// ─── Sub-components ────────────────────────────────────────────────────────
function ExerciseCard({
  ex, idx, lessonId, status, onResult,
}: {
  ex: Exercise; idx: number; lessonId: string;
  status?: "ok" | "miss";
  onResult: (ok: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [pick, setPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<"ok" | "miss" | null>(status ?? null);
  const [hintOn, setHintOn] = useState(false);

  // Reset local state when navigating between lessons / exercises.
  useEffect(() => {
    setInput(""); setPick(null); setRevealed(status ?? null); setHintOn(false);
  }, [lessonId, idx, status]);

  const check = () => {
    let ok = false;
    if (ex.kind === "choice")        ok = pick !== null && pick === ex.correct;
    else if (ex.kind === "numeric")  ok = gradeNumeric(input, Number(ex.answer), ex.tol ?? 1e-3);
    else if (ex.kind === "expression") ok = gradeExpression(input, String(ex.answer ?? ""), ex.tol ?? 1e-6);
    else                              ok = input.trim().length > 0; // free text — trust submission
    setRevealed(ok ? "ok" : "miss");
    onResult(ok);
  };

  return (
    <div className="rounded-md border border-border bg-[oklch(0.21_0.03_250)] p-3 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-[var(--color-amber)] text-[0.7rem] mt-0.5">Q{idx + 1}.</span>
        <div className="flex-1 text-[0.78rem]"><MarkdownView source={ex.q} /></div>
        {revealed === "ok"   && <Check size={14} className="text-[oklch(0.78_0.18_140)] mt-0.5" />}
        {revealed === "miss" && <XIcon  size={14} className="text-destructive mt-0.5" />}
      </div>

      {ex.kind === "choice" && (
        <div className="space-y-1">
          {ex.choices!.map((c, i) => (
            <button
              key={i}
              className="w-full text-left text-[0.72rem] px-2 py-1 rounded-sm border border-border hover:bg-[oklch(0.25_0.03_250)]"
              data-active={pick === i}
              style={pick === i ? { background: "oklch(0.25 0.03 250)", color: "var(--color-primary)" } : undefined}
              onClick={() => setPick(i)}
            >{String.fromCharCode(65 + i)}. {c}</button>
          ))}
        </div>
      )}
      {(ex.kind === "numeric" || ex.kind === "expression" || ex.kind === "text") && (
        <input
          className="field !py-1 text-[0.75rem] font-mono w-full"
          placeholder={ex.kind === "numeric" ? "number or arithmetic" : "expression"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") check(); }}
        />
      )}

      <div className="flex flex-wrap gap-1.5 items-center">
        <button className="pill-btn !text-[0.62rem]" onClick={check}>CHECK</button>
        {ex.hint && (
          <button className="pill-btn !text-[0.62rem]" onClick={() => setHintOn((v) => !v)}>
            <Lightbulb size={10} /> {hintOn ? "HIDE HINT" : "HINT"}
          </button>
        )}
        {revealed && (
          <button className="pill-btn !text-[0.62rem]" onClick={() => { setRevealed(null); setInput(""); setPick(null); }}>
            <RotateCcw size={10} /> RETRY
          </button>
        )}
      </div>

      {hintOn && ex.hint && (
        <div className="text-[0.7rem] text-muted-foreground border-l-2 border-[var(--color-amber)] pl-2">{ex.hint}</div>
      )}
      {revealed && (
        <div className="text-[0.72rem] rounded-sm bg-[oklch(0.18_0.03_250)] border border-border p-2">
          <div className="text-[0.58rem] tracking-widest text-[var(--color-amber)] mb-0.5">EXPLANATION</div>
          <MarkdownView source={ex.explain} />
        </div>
      )}
    </div>
  );
}

function LessonView({ lesson, progress, setProgress }: {
  lesson: Lesson;
  progress: Progress;
  setProgress: (p: Progress) => void;
}) {
  const { showPanel } = useCalc();
  const done = progress.ex[lesson.id] ?? {};
  const total = lesson.exercises.length;
  const okCount = Object.values(done).filter((v) => v === "ok").length;

  const record = (i: number, ok: boolean) => {
    const next: Progress = { ex: { ...progress.ex, [lesson.id]: { ...done, [i]: ok ? "ok" : "miss" } } };
    setProgress(next); saveProgress(next);
  };

  return (
    <div className="flex-1 min-w-0 overflow-auto p-4 space-y-4">
      <header className="space-y-1 border-b border-border pb-3">
        <h2 className="text-lg neon-text">{lesson.title}</h2>
        <div className="text-[0.7rem] text-muted-foreground">{lesson.summary}</div>
        <div className="flex flex-wrap gap-1.5 pt-1 items-center">
          <span className="text-[0.6rem] tracking-widest text-[var(--color-amber)]">
            PROGRESS · {okCount}/{total}
          </span>
          <div className="h-1.5 flex-1 max-w-[160px] rounded-full bg-[oklch(0.2_0.03_250)] overflow-hidden">
            <div className="h-full bg-[var(--color-amber)]" style={{ width: `${total ? (okCount / total) * 100 : 0}%` }} />
          </div>
          {lesson.related?.map((k) => (
            <button key={k} className="pill-btn !text-[0.6rem]" onClick={() => showPanel(k)}>
              <ExternalLink size={9} /> {k.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="prose-md"><MarkdownView source={lesson.body} /></section>

      {lesson.exercises.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-[0.65rem] tracking-widest text-[var(--color-amber)]">PRACTICE</h3>
          {lesson.exercises.map((ex, i) => (
            <ExerciseCard
              key={i}
              ex={ex}
              idx={i}
              lessonId={lesson.id}
              status={done[i]}
              onResult={(ok) => record(i, ok)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

// ─── Main panel ────────────────────────────────────────────────────────────
export function AcademyPanel() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [stageId, setStageId] = useState<string>(() => localStorage.getItem(SELECT_KEY + ":stage") || STAGES[0].id);
  const [lessonId, setLessonId] = useState<string>(() => localStorage.getItem(SELECT_KEY + ":lesson") || STAGES[0].lessons[0].id);

  // Listen for academy:open events (fired from HelpDialog deep-links).
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;
      const hit = findLesson(id);
      if (hit) { setStageId(hit.stage.id); setLessonId(hit.lesson.id); }
    };
    window.addEventListener("neograph:academy", onOpen as EventListener);
    return () => window.removeEventListener("neograph:academy", onOpen as EventListener);
  }, []);

  useEffect(() => { localStorage.setItem(SELECT_KEY + ":stage",  stageId);  }, [stageId]);
  useEffect(() => { localStorage.setItem(SELECT_KEY + ":lesson", lessonId); }, [lessonId]);

  const stage: Stage = useMemo(
    () => STAGES.find((s) => s.id === stageId) ?? STAGES[0],
    [stageId],
  );
  const lesson: Lesson = useMemo(
    () => stage.lessons.find((l) => l.id === lessonId) ?? stage.lessons[0],
    [stage, lessonId],
  );

  // Keep lesson selection consistent when the stage changes via the rail.
  useEffect(() => {
    if (!stage.lessons.some((l) => l.id === lessonId)) {
      setLessonId(stage.lessons[0].id);
    }
  }, [stage, lessonId]);

  const lessonsDone = (s: Stage) =>
    s.lessons.filter((l) => {
      const d = progress.ex[l.id]; if (!d) return false;
      return Object.values(d).filter((v) => v === "ok").length === l.exercises.length && l.exercises.length > 0;
    }).length;

  return (
    <div className="flex h-full w-full text-foreground/95">
      {/* Stages rail */}
      <aside className="w-[170px] shrink-0 border-r border-border overflow-auto p-2 space-y-0.5">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground px-1 py-1 flex items-center gap-1">
          <GraduationCap size={10} /> STAGES
        </div>
        {STAGES.map((s) => {
          const done = lessonsDone(s);
          return (
            <button
              key={s.id}
              onClick={() => setStageId(s.id)}
              className="w-full text-left text-[0.7rem] px-2 py-1 rounded-sm hover:bg-[oklch(0.25_0.03_250)]"
              style={s.id === stageId ? { background: "oklch(0.25 0.03 250)", color: "var(--color-primary)" } : undefined}
            >
              <div className="flex items-center justify-between">
                <span>{s.title}</span>
                {s.id === stageId && <ChevronRight size={10} />}
              </div>
              <div className="text-[0.55rem] text-muted-foreground tracking-widest">
                {s.band} · {done}/{s.lessons.length}
              </div>
            </button>
          );
        })}
      </aside>

      {/* Lessons rail */}
      <aside className="w-[200px] shrink-0 border-r border-border overflow-auto p-2 space-y-0.5">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground px-1 py-1 flex items-center gap-1">
          <BookOpen size={10} /> {stage.title.toUpperCase()}
        </div>
        <div className="text-[0.6rem] text-muted-foreground px-1 pb-1">{stage.description}</div>
        {stage.lessons.map((l) => {
          const d = progress.ex[l.id] ?? {};
          const ok = Object.values(d).filter((v) => v === "ok").length;
          const complete = ok === l.exercises.length && l.exercises.length > 0;
          return (
            <button
              key={l.id}
              onClick={() => setLessonId(l.id)}
              className="w-full text-left text-[0.7rem] px-2 py-1 rounded-sm hover:bg-[oklch(0.25_0.03_250)] flex items-start gap-1.5"
              style={l.id === lessonId ? { background: "oklch(0.25 0.03 250)", color: "var(--color-primary)" } : undefined}
            >
              <span className={`mt-0.5 inline-block w-1.5 h-1.5 rounded-full ${complete ? "bg-[oklch(0.78_0.18_140)]" : ok > 0 ? "bg-[var(--color-amber)]" : "bg-[oklch(0.4_0.03_250)]"}`} />
              <span className="flex-1">{l.title}</span>
            </button>
          );
        })}
      </aside>

      <LessonView lesson={lesson} progress={progress} setProgress={setProgress} />
    </div>
  );
}

/** Convenience helper for HelpDialog deep-links. */
export function openAcademyLesson(id: string) {
  window.dispatchEvent(new CustomEvent("neograph:academy", { detail: { id } }));
}
