/**
 * TerminalPanel
 * ------------------------------------------------------------------
 * Cyberpunk REPL with an extensible command registry, history (↑/↓),
 * and a per-session script scope. Scripts running in the IDE can
 * extend the terminal at runtime via window.lambda.registerCommand().
 * ------------------------------------------------------------------
 */
import { useEffect, useRef, useState } from "react";
import { Terminal as TermIcon, Trash2 } from "lucide-react";
import { listCommands, lookupCommand, registerCommand, type CommandCtx } from "@/lib/calc/commands";

interface Line { kind: "in" | "out" | "err" | "sys"; text: string }

const HEADER = [
  "neoGraph · Λ-WORKSTATION TERMINAL  v0.3",
  "type `help` to list commands · ↑/↓ for history · `clear` to wipe",
  "",
];

export function TerminalPanel() {
  const [lines, setLines] = useState<Line[]>(HEADER.map((t) => ({ kind: "sys", text: t })));
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number>(-1);
  const scopeRef = useRef<Record<string, unknown>>({});
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight); }, [lines]);

  // expose registerCommand globally so scripts can extend the terminal
  useEffect(() => {
    (window as unknown as { lambda?: Record<string, unknown> }).lambda = {
      ...((window as unknown as { lambda?: Record<string, unknown> }).lambda ?? {}),
      registerCommand,
      lookupCommand,
      listCommands,
    };
  }, []);

  const print = (text: string, kind: Line["kind"] = "out") =>
    setLines((prev) => [...prev, ...text.split("\n").map((t) => ({ kind, text: t }))]);

  const runCommand = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    print(`λ ${trimmed}`, "in");
    setHistory((h) => [...h, trimmed]); setHistIdx(-1);

    if (trimmed === "clear" || trimmed === "cls") {
      setLines([]); return;
    }
    // Allow shorthand: `= expr`
    const head = trimmed.startsWith("=") ? "=" : trimmed.split(/\s+/)[0];
    const cmd = lookupCommand(head);
    if (!cmd) { print(`unknown: ${head}   (try \`help\`)`, "err"); return; }

    const args = trimmed === head ? [] : trimmed.slice(head.length).trim().split(/\s+/).filter(Boolean);
    const ctx: CommandCtx = { args, raw: trimmed, print: (s) => print(s, "out"), scope: scopeRef.current };
    try { await cmd.run(ctx); }
    catch (e) { print(`✖ ${(e as Error).message}`, "err"); }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); runCommand(input); setInput(""); }
    else if (e.key === "ArrowUp") {
      if (history.length === 0) return;
      e.preventDefault();
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx); setInput(history[idx] ?? "");
    } else if (e.key === "ArrowDown") {
      if (history.length === 0) return;
      e.preventDefault();
      const idx = Math.min(history.length, histIdx + 1);
      setHistIdx(idx); setInput(history[idx] ?? "");
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); setLines([]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 py-1 border-b border-border">
        <TermIcon size={12} className="text-[var(--color-primary)]" />
        <span className="text-[0.6rem] tracking-widest text-muted-foreground">/dev/neograph</span>
        <button className="pill-btn ml-auto !text-[0.6rem]" onClick={() => setLines([])}><Trash2 size={10} /> CLR</button>
      </div>
      <div
        ref={bodyRef}
        className="flex-1 overflow-auto p-2 font-mono text-[0.72rem] leading-snug whitespace-pre-wrap"
        style={{ background: "oklch(0.12 0.025 250)" }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "in"  ? "neon-text-amber" :
              l.kind === "err" ? "text-destructive" :
              l.kind === "sys" ? "text-muted-foreground" : "text-foreground"
            }
          >{l.text}</div>
        ))}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="neon-text">λ</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-foreground"
            placeholder="help"
          />
          <span className="blink text-[var(--color-amber)]">▌</span>
        </div>
      </div>
    </div>
  );
}
