import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Trash2, Download, LineChart } from "lucide-react";
import { graphApi } from "@/lib/calc/bridge";
import { runLogo, runBasic, runMathematica, runSimulated } from "@/lib/calc/interpreters";
import { math } from "@/lib/calc/math";

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

type Lang =
  | "python" | "javascript" | "logo" | "basic" | "tibasic"
  | "c" | "cpp" | "r" | "mathematica";

const LANGS: { id: Lang; label: string; real: boolean }[] = [
  { id: "python",       label: "Python (Pyodide)", real: true  },
  { id: "javascript",   label: "JavaScript",       real: true  },
  { id: "logo",         label: "LOGO (turtle)",    real: true  },
  { id: "basic",        label: "BASIC",            real: true  },
  { id: "tibasic",      label: "TI-BASIC",         real: true  },
  { id: "c",            label: "C  · simulated",   real: false },
  { id: "cpp",          label: "C++ · simulated",  real: false },
  { id: "r",            label: "R  · simulated",   real: false },
  { id: "mathematica",  label: "Mathematica",      real: false },
];

const EXT: Record<Lang, string> = {
  python: "py", javascript: "js", logo: "logo", basic: "bas", tibasic: "8xp.txt",
  c: "c", cpp: "cpp", r: "R", mathematica: "wl",
};

const SAMPLES: Record<Lang, string> = {
  python: `# Generate & push a curve into the Graph window
import math
graph.clear()
graph.add("sin(x)")
graph.add("sin(x)*cos(2*x)")
print("plots:", list(graph.list()))
print("viewport:", dict(graph.view()))
`,
  javascript: `// Push a few curves & zoom in
graph.clear();
for (let k = 1; k <= 3; k++) graph.add(\`sin(\${k}*x)/\${k}\`);
graph.setView(-6.28, 6.28, -2, 2);
console.log("now plotting", graph.list().length, "curves");
`,
  logo: `; Polygon spiral
repeat 36 [ fd 60 rt 100 ]
`,
  basic: `10 REM Push squared curve to graph
20 PLOT "x^2/4 - 3"
30 FOR I = 1 TO 5
40   PRINT "i="; I; "  i^2="; I*I
50 NEXT I
60 END
`,
  tibasic: `10 DISP "TI-BASIC SIM"
20 LET A = 5
30 LET B = A * 2 + 1
40 DISP "B="; B
50 PLOT "tan(x)/4"
`,
  c: `#include <stdio.h>
int main(void){
    int n = 10;
    printf("n=%d square=%d\\n", n, n*n);
    return 0;
}
`,
  cpp: `#include <iostream>
int main(){
    double r = 7.25;
    std::cout << "area = " << 3.14159 * r * r << std::endl;
}
`,
  r: `x <- 5
y <- x^2 + 2*x + 1
print(y)
cat(sqrt(2))
`,
  mathematica: `(* simple eval *)
Sin[Pi/4]
Integrate[x^2, x]   (* mathjs symbolic *)
a := 3
a*a
`,
};

const HELP_PY = `# bridge available as 'graph':
#   graph.add(expr, kind="explicit")   →  id
#   graph.list()                       →  [{id,kind,expr,enabled,color}, …]
#   graph.clear() / graph.remove(id) / graph.toggle(id, on?)
#   graph.view()                       →  {xMin,xMax,yMin,yMax}
#   graph.setView(xmin,xmax,ymin,ymax)
`;

export function IdePanel() {
  const [lang, setLang] = useState<Lang>("python");
  const [code, setCode] = useState<string>(SAMPLES.python);
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "running" | "error">("ready");
  const [progress, setProgress] = useState<string>("");
  const pyRef = useRef<PyodideAPI | null>(typeof window !== "undefined" ? window.__pyodide ?? null : null);
  const outRef = useRef<HTMLDivElement | null>(null);
  const emit = useMemo(() => (s: string) => setOutput((p) => p + s + "\n"), []);

  // Load pyodide lazily the first time the user selects python and hits RUN.
  // loadPyodide doesn't expose a download-progress callback, so we surface
  // step labels + an elapsed timer (~15MB total: pyodide.js + wasm + stdlib).
  const ensurePyodide = async () => {
    if (pyRef.current) return pyRef.current;
    setStatus("loading");
    const t0 = performance.now();
    let label = "fetching pyodide.js (~250KB)";
    setProgress(`${label} · 0.0s`);
    const tick = window.setInterval(() => {
      const s = ((performance.now() - t0) / 1000).toFixed(1);
      setProgress(`${label} · ${s}s`);
    }, 100);
    try {
      if (!window.loadPyodide) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement("script");
          s.src = `${PYODIDE_URL}pyodide.js`; s.async = true;
          s.onload = () => res();
          s.onerror = () => rej(new Error("pyodide.js failed to load"));
          document.head.appendChild(s);
        });
      }
      label = "downloading runtime (~10MB wasm + stdlib)";
      const py = await window.loadPyodide!({ indexURL: PYODIDE_URL });
      label = "wiring graph bridge";
      py.setStdout({ batched: (s) => setOutput((p) => p + s + "\n") });
      py.setStderr({ batched: (s) => setOutput((p) => p + "⚠ " + s + "\n") });
      py.globals.set("graph", graphApi);
      window.__pyodide = py;
      pyRef.current = py;
      const total = ((performance.now() - t0) / 1000).toFixed(1);
      setProgress(`ready · loaded in ${total}s`);
      window.setTimeout(() => setProgress(""), 2500);
      return py;
    } finally {
      clearInterval(tick);
    }
  };

  useEffect(() => { outRef.current?.scrollTo(0, outRef.current.scrollHeight); }, [output]);

  // when switching language, swap to its sample (only if user hasn't edited away from prior sample)
  const lastSampleRef = useRef<string>(SAMPLES.python);
  useEffect(() => {
    if (code === lastSampleRef.current) {
      const s = SAMPLES[lang];
      setCode(s);
      lastSampleRef.current = s;
    } else {
      lastSampleRef.current = SAMPLES[lang];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const run = async () => {
    setStatus("running");
    setOutput((p) => p + (p ? "\n" : "") + `▶ ${lang}\n`);
    try {
      switch (lang) {
        case "python": {
          const py = await ensurePyodide();
          const result = await py.runPythonAsync(code);
          if (result !== undefined && result !== null) emit(String(result));
          break;
        }
        case "javascript": {
          const orig = console.log;
          console.log = (...a: unknown[]) => emit(a.map(String).join(" "));
          try {
            const fn = new Function("graph", "math", `"use strict"; return (async () => { ${code} })();`);
            const r = await fn(graphApi, math);
            if (r !== undefined) emit(String(r));
          } finally { console.log = orig; }
          break;
        }
        case "logo":         runLogo(code, emit); break;
        case "basic":        runBasic(code, emit, "basic"); break;
        case "tibasic":      runBasic(code, emit, "tibasic"); break;
        case "mathematica":  runMathematica(code, emit); break;
        case "c":            runSimulated(code, emit, "C"); break;
        case "cpp":          runSimulated(code, emit, "C++"); break;
        case "r":            runSimulated(code, emit, "R"); break;
      }
      setStatus("ready");
    } catch (e) {
      emit("✖ " + (e as Error).message);
      setStatus("error");
      setTimeout(() => setStatus("ready"), 600);
    }
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `script.${EXT[lang]}`;
    a.click();
  };

  const dumpGraph = () => {
    const v = graphApi.view();
    emit(`◆ graph.view = ${JSON.stringify(v)}`);
    for (const p of graphApi.list()) emit(`  • ${p.id}  ${p.kind}  ${p.expr}${p.enabled ? "" : "  (off)"}`);
  };

  const langMeta = LANGS.find((l) => l.id === lang)!;

  return (
    <div className="flex flex-col h-full p-2 gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <select
          className="field !py-1 text-[0.7rem] w-44"
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
        >
          {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
        <button
          className="pill-btn"
          data-active={status === "ready"}
          onClick={run}
          disabled={status === "loading" || status === "running"}
        >
          <Play size={12} />
          {status === "loading" ? "BOOT…" : status === "running" ? "RUN…" : status === "error" ? "ERR" : "RUN"}
        </button>
        <button className="pill-btn" onClick={() => setOutput("")}><Trash2 size={12} /> CLR</button>
        <button className="pill-btn" onClick={dumpGraph} title="Dump current graph state"><LineChart size={12} /> GRAPH</button>
        <button className="pill-btn" onClick={download}><Download size={12} /> .{EXT[lang]}</button>
        <span className="ml-auto text-[0.6rem] tracking-widest text-muted-foreground">
          {status === "loading" ? progress : `${langMeta.real ? "runtime" : "simulated"} · ${status}`}
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
        {output || (
          <span className="text-muted-foreground">
            {lang === "python" ? HELP_PY : `// ${langMeta.label} — output appears here. Use the GRAPH button to inspect curves.`}
          </span>
        )}
      </div>
    </div>
  );
}
