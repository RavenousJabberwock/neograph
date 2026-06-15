import { useCalc } from "@/lib/calc/store";
import { math } from "@/lib/calc/math";
import { wallpaperStyle } from "@/lib/calc/wallpaper";
import { CornerDownLeft, Delete } from "lucide-react";
import { useEffect, useRef } from "react";

type KeyDef = { label: string; insert?: string; variant?: "op" | "fn" | "eq" | "ac"; action?: () => void };

export function CalculatorPanel() {
  const { expression, setExpression, insertAtCursor, registerInputRef, pushHistory, history, casMode, wallpaper } = useCalc();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { registerInputRef(inputRef.current); }, [registerInputRef]);

  const evaluate = () => {
    if (!expression.trim()) return;
    try {
      let out: string;
      if (casMode) {
        // Try symbolic simplify; fallback to numeric
        try {
          const node = math.parse(expression);
          const simp = math.simplify(node);
          out = simp.toString();
        } catch {
          out = String(math.evaluate(expression));
        }
      } else {
        out = String(math.evaluate(expression));
      }
      pushHistory({ input: expression, output: out });
      setExpression(out);
    } catch (e) {
      pushHistory({ input: expression, output: `ERR: ${(e as Error).message}` });
    }
  };

  const ins = (s: string) => insertAtCursor(s);

  const keys: KeyDef[][] = [
    [
      { label: "sin", insert: "sin(", variant: "fn" },
      { label: "cos", insert: "cos(", variant: "fn" },
      { label: "tan", insert: "tan(", variant: "fn" },
      { label: "π",   insert: "pi", variant: "fn" },
      { label: "e",   insert: "e",  variant: "fn" },
      { label: "AC",  variant: "ac", action: () => setExpression("") },
    ],
    [
      { label: "asin", insert: "asin(", variant: "fn" },
      { label: "acos", insert: "acos(", variant: "fn" },
      { label: "atan", insert: "atan(", variant: "fn" },
      { label: "ln",   insert: "log(",  variant: "fn" },
      { label: "log",  insert: "log10(",variant: "fn" },
      { label: "⌫",   variant: "ac", action: () => setExpression(expression.slice(0, -1)) },
    ],
    [
      { label: "x²", insert: "^2", variant: "op" },
      { label: "x^y", insert: "^", variant: "op" },
      { label: "√",  insert: "sqrt(", variant: "fn" },
      { label: "(", insert: "(" },
      { label: ")", insert: ")" },
      { label: "/", insert: "/", variant: "op" },
    ],
    [
      { label: "7", insert: "7" },
      { label: "8", insert: "8" },
      { label: "9", insert: "9" },
      { label: "x", insert: "x", variant: "fn" },
      { label: ",", insert: "," },
      { label: "*", insert: "*", variant: "op" },
    ],
    [
      { label: "4", insert: "4" },
      { label: "5", insert: "5" },
      { label: "6", insert: "6" },
      { label: "A", insert: "A", variant: "fn" },
      { label: "B", insert: "B", variant: "fn" },
      { label: "-", insert: "-", variant: "op" },
    ],
    [
      { label: "1", insert: "1" },
      { label: "2", insert: "2" },
      { label: "3", insert: "3" },
      { label: "ans", insert: "ans", variant: "fn" },
      { label: ":=", insert: " := ", variant: "op" },
      { label: "+", insert: "+", variant: "op" },
    ],
    [
      { label: "0", insert: "0" },
      { label: ".", insert: "." },
      { label: "E", insert: "e", variant: "fn" },
      { label: "abs", insert: "abs(", variant: "fn" },
      { label: "%", insert: "%", variant: "op" },
      { label: "ENTER", variant: "eq", action: evaluate },
    ],
  ];

  return (
    <div className="relative p-3 flex flex-col gap-3 h-full" style={wallpaperStyle(wallpaper)}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, oklch(0.18 0.03 250 / 55%), oklch(0.16 0.03 250 / 78%))" }} />
      <div className="relative text-[0.55rem] tracking-widest text-muted-foreground text-right">
        MODE · {casMode ? "CAS" : "NUM"} · WP · {wallpaper.kind === "preset" ? wallpaper.name.toUpperCase() : (wallpaper.label ?? "IMAGE")}
      </div>
      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-3 shadow-[var(--shadow-inset)]">
        <div className="max-h-28 overflow-auto text-[0.7rem] text-muted-foreground space-y-0.5 mb-2">
          {history.slice(-6).map((h, i) => (
            <div key={i} className="flex items-baseline gap-2">
              <span className="opacity-60">{">"}</span>
              <span className="truncate">{h.input}</span>
              <span className="ml-auto neon-text">= {h.output}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="neon-text-amber text-sm">▸</span>
          <input
            ref={inputRef}
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); evaluate(); } }}
            placeholder="Enter expression"
            className="flex-1 bg-transparent text-base outline-none text-foreground placeholder:text-muted-foreground"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {keys.flat().map((k, i) => (
          <button
            key={i}
            className="calc-key"
            data-variant={k.variant}
            onClick={() => {
              if (k.action) k.action();
              else if (k.insert !== undefined) ins(k.insert);
            }}
          >
            {k.label === "ENTER" ? (
              <span className="flex items-center gap-1"><CornerDownLeft size={12} /> RUN</span>
            ) : k.label === "⌫" ? (
              <Delete size={14} />
            ) : k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
