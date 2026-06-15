/**
 * HelpDialog — global, context-sensitive help overlay.
 * ------------------------------------------------------------------
 * Triggered by:
 *   • F1                                          — opens last-focused panel's help
 *   • The "?" button in every FloatingWindow header
 *   • A custom event:  window.dispatchEvent(new CustomEvent("neograph:help", { detail: { key }}))
 *
 * UI: left rail of all panels, right-hand article with summary,
 * "Math on Keys" concept cards, key reference table, worked examples,
 * and related links.
 * ------------------------------------------------------------------
 */
import { useEffect, useMemo, useState } from "react";
import { HelpCircle, X, ChevronRight, BookOpen, Keyboard, Sigma, Lightbulb, Link2, GraduationCap } from "lucide-react";
import { HELP } from "@/lib/calc/help-content";
import { useCalc, type PanelKey } from "@/lib/calc/store";
import { findLesson, STAGES } from "@/lib/calc/academy-content";
import { openAcademyLesson } from "./AcademyPanel";

const ORDER: PanelKey[] = [
  "calc","graph","plot3d","table","cas","numerics","matrix","stats",
  "gsolve","constants","ide","terminal","notepad","paint","radio","academy","workspace",
];

export interface HelpEventDetail { key?: PanelKey }

export function openHelp(key?: PanelKey) {
  window.dispatchEvent(new CustomEvent<HelpEventDetail>("neograph:help", { detail: { key } }));
}

export function HelpDialog() {
  const { showPanel } = useCalc();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<PanelKey>("calc");

  useEffect(() => {
    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent<HelpEventDetail>).detail;
      if (detail?.key) setActive(detail.key);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F1") { e.preventDefault(); setOpen((v) => !v); return; }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("neograph:help", onEvt as EventListener);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("neograph:help", onEvt as EventListener);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const section = useMemo(() => HELP[active], [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] grid place-items-center bg-[oklch(0_0_0/65%)] backdrop-blur-sm p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="panel w-[min(1024px,96vw)] h-[min(720px,90vh)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 32px 64px -16px oklch(0 0 0 / 80%), 0 0 0 1px var(--color-border-strong)" }}
      >
        <div className="panel-header">
          <span className="panel-title-dot" style={{ background: "var(--color-amber)", boxShadow: "0 0 8px var(--color-amber)" }} />
          <HelpCircle size={12} />
          <span>HELP · {section.title.toUpperCase()}</span>
          <span className="ml-3 text-[0.55rem] tracking-widest text-muted-foreground">F1 · OR ? ON ANY WINDOW</span>
          <button className="ml-auto pill-btn !px-1.5 !py-0.5" onClick={() => setOpen(false)}><X size={10} /></button>
        </div>

        <div className="flex-1 min-h-0 flex">
          {/* Left rail */}
          <aside className="w-[180px] shrink-0 border-r border-border overflow-auto p-2 space-y-0.5">
            <div className="text-[0.55rem] tracking-widest text-muted-foreground px-2 py-1">SECTIONS</div>
            {ORDER.map((k) => (
              <button
                key={k}
                onClick={() => setActive(k)}
                className="w-full text-left text-[0.72rem] px-2 py-1 rounded-sm hover:bg-[oklch(0.25_0.03_250)] flex items-center justify-between"
                data-active={k === active}
                style={k === active ? { background: "oklch(0.25 0.03 250)", color: "var(--color-primary)" } : undefined}
              >
                <span>{HELP[k].title}</span>
                {k === active && <ChevronRight size={10} />}
              </button>
            ))}
          </aside>

          {/* Article */}
          <article className="flex-1 min-w-0 overflow-auto p-5 space-y-5 text-[0.78rem] leading-relaxed">
            <header className="space-y-1">
              <h2 className="text-xl neon-text tracking-wide">{section.title}</h2>
              <div className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">{section.tagline}</div>
              <p className="text-foreground/90 pt-2">{section.summary}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  className="pill-btn !text-[0.6rem]"
                  data-active
                  onClick={() => { showPanel(active); setOpen(false); }}
                >
                  OPEN {section.title.toUpperCase()}
                </button>
              </div>
            </header>

            {section.concepts.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-[0.65rem] tracking-widest text-[var(--color-amber)] flex items-center gap-1.5">
                  <Sigma size={12} /> CONCEPTS · MATH ON KEYS
                </h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {section.concepts.map((c) => (
                    <div key={c.title} className="rounded-md border border-border bg-[oklch(0.21_0.03_250)] p-3">
                      <div className="text-[0.72rem] neon-text mb-1">{c.title}</div>
                      <div className="text-[0.72rem] text-foreground/85">{c.body}</div>
                      {c.formula && (
                        <pre className="mt-2 text-[0.7rem] font-mono px-2 py-1 rounded bg-[oklch(0.16_0.03_250)] border border-border overflow-auto">
                          {c.formula}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {section.keys.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-[0.65rem] tracking-widest text-[var(--color-amber)] flex items-center gap-1.5">
                  <Keyboard size={12} /> KEYS · CONTROLS
                </h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-[0.72rem]">
                    <tbody>
                      {section.keys.map((k, i) => (
                        <tr key={k.key} className={i % 2 ? "bg-[oklch(0.21_0.03_250)]" : "bg-[oklch(0.23_0.03_250)]"}>
                          <td className="px-2.5 py-1.5 align-top w-[28%]">
                            <code className="neon-text">{k.key}</code>
                          </td>
                          <td className="px-2.5 py-1.5 align-top">
                            <div>{k.what}</div>
                            {k.math && <div className="text-[0.66rem] text-muted-foreground font-mono mt-0.5">{k.math}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {section.examples.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-[0.65rem] tracking-widest text-[var(--color-amber)] flex items-center gap-1.5">
                  <BookOpen size={12} /> WORKED EXAMPLES
                </h3>
                <div className="space-y-1.5">
                  {section.examples.map((ex, i) => (
                    <div key={i} className="rounded-md border border-border bg-[oklch(0.21_0.03_250)] p-2 font-mono text-[0.72rem]">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-amber)]">▸</span>
                        <span className="text-foreground/85">{ex.input}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 ml-4">
                        <span className="text-muted-foreground">⇒</span>
                        <span className="neon-text">{ex.result}</span>
                      </div>
                      {ex.note && <div className="ml-4 mt-1 text-[0.65rem] text-muted-foreground">{ex.note}</div>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {section.tips && section.tips.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-[0.65rem] tracking-widest text-[var(--color-amber)] flex items-center gap-1.5">
                  <Lightbulb size={12} /> TIPS
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-foreground/85">
                  {section.tips.map((t, i) => <li key={i} className="text-[0.72rem]">{t}</li>)}
                </ul>
              </section>
            )}

            {section.related && section.related.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-[0.65rem] tracking-widest text-[var(--color-amber)] flex items-center gap-1.5">
                  <Link2 size={12} /> RELATED
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {section.related.map((r) => (
                    <button key={r} className="pill-btn !text-[0.62rem]" onClick={() => setActive(r)}>
                      {HELP[r].title}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
