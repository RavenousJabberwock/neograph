import { useEffect, useRef, useState } from "react";
import { Play, Square, Trash2, Download } from "lucide-react";

// Pyodide is loaded from CDN at runtime.
declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<PyodideAPI>;
    __pyodide?: PyodideAPI;
  }
}
interface PyodideAPI {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  globals: { set: (k: string, v: unknown) => void };
}

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

const SAMPLES = [
  `# Hello, Λ-Workstation
import math
for k in range(5):
    print(k, "→", math.sin(k))
`,
  `# Quick numerics
import statistics as s
xs = [1, 2, 3, 4, 5, 6, 7]
print("mean", s.mean(xs))
print("std ", round(s.pstdev(xs), 4))
`,
  `# Mini script
def fib(n):
    a, b = 0, 1
    out = []
    for _ in range(n):
        out.append(a); a, b = b, a + b
    return out
print(fib(12))
`,
];

export function IdePanel() {
  const [code, setCode] = useState<string>(SAMPLES[0]);
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "running" | "error">("idle");
  const [progress, setProgress] = useState<string>("");
  const apiRef = useRef<PyodideAPI | null>(window.__pyodide ?? null);
  const outRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (apiRef.current) { setStatus("ready"); return; }

    let cancelled = false;
    (async () => {
      try {
        setStatus("loading"); setProgress("Fetching pyodide.js…");
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = `${PYODIDE_URL}pyodide.js`;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load pyodide.js"));
            document.head.appendChild(s);
          });
        }
        setProgress("Booting Python (~10MB)…");
        const py = await window.loadPyodide!({ indexURL: PYODIDE_URL });
        if (cancelled) return;
        py.setStdout({ batched: (s) => setOutput((p) => p + s + "\n") });
        py.setStderr({ batched: (s) => setOutput((p) => p + "⚠ " + s + "\n") });
        window.__pyodide = py;
        apiRef.current = py;
        setStatus("ready"); setProgress("");
      } catch (e) {
        setStatus("error"); setProgress((e as Error).message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { outRef.current?.scrollTo(0, outRef.current.scrollHeight); }, [output]);

  const run = async () => {
    if (!apiRef.current || status === "running") return;
    setStatus("running");
    setOutput((p) => p + (p ? "\n" : "") + "▶ run\n");
    try {
      const result = await apiRef.current.runPythonAsync(code);
      if (result !== undefined && result !== null) {
        setOutput((p) => p + String(result) + "\n");
      }
    } catch (e) {
      setOutput((p) => p + "✖ " + (e as Error).message + "\n");
    } finally {
      setStatus("ready");
    }
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/x-python" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "script.py";
    a.click();
  };

  return (
    <div className="flex flex-col h-full p-2 gap-2">
      <div className="flex items-center gap-1.5">
        <select
          className="field !py-1 text-[0.7rem] w-32"
          onChange={(e) => setCode(SAMPLES[Number(e.target.value)])}
          defaultValue=""
        >
          <option value="" disabled>SAMPLES…</option>
          {SAMPLES.map((_, i) => <option key={i} value={i}>example {i + 1}</option>)}
        </select>
        <button
          className="pill-btn"
          data-active={status === "ready"}
          onClick={run}
          disabled={status !== "ready"}
        >
          <Play size={12} />
          {status === "loading" ? "BOOT…" : status === "running" ? "RUN…" : status === "error" ? "ERR" : "RUN"}
        </button>
        <button className="pill-btn" onClick={() => setOutput("")}><Trash2 size={12} /> CLR</button>
        <button className="pill-btn" onClick={download}><Download size={12} /> .py</button>
        <span className="ml-auto text-[0.6rem] tracking-widest text-muted-foreground">
          {status === "loading" ? progress : `pyodide · ${status}`}
        </span>
      </div>
      <textarea
        spellCheck={false}
        className="field flex-1 !font-mono !text-[0.75rem] resize-none leading-relaxed"
        style={{ background: "oklch(0.14 0.025 250)" }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <div
        ref={outRef}
        className="rounded-md border border-border p-2 text-[0.72rem] font-mono whitespace-pre-wrap overflow-auto"
        style={{ background: "oklch(0.13 0.02 250)", minHeight: 80, maxHeight: "40%" }}
      >
        {output || <span className="text-muted-foreground">// stdout will appear here</span>}
      </div>
    </div>
  );
}
