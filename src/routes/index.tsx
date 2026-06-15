import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalcProvider, useCalc, type PanelKey } from "@/lib/calc/store";
import { TopBar } from "@/components/calc/TopBar";
import { FloatingWindow } from "@/components/calc/FloatingWindow";
import { PanelErrorBoundary } from "@/components/calc/PanelErrorBoundary";
import { ShortcutsDialog } from "@/components/calc/ShortcutsDialog";
import { WorkspaceSidebar } from "@/components/calc/WorkspaceSidebar";
import { CalculatorPanel } from "@/components/calc/CalculatorPanel";
import { GraphPanel } from "@/components/calc/GraphPanel";
import { TablePanel } from "@/components/calc/TablePanel";
import { CasPanel } from "@/components/calc/CasPanel";
import { IdePanel } from "@/components/calc/IdePanel";
import { PaintPanel } from "@/components/calc/PaintPanel";
import { StatsPanel } from "@/components/calc/StatsPanel";
import { MatrixPanel } from "@/components/calc/MatrixPanel";
import { GSolvePanel } from "@/components/calc/GSolvePanel";
import { ConstantsPanel } from "@/components/calc/ConstantsPanel";
import { TerminalPanel } from "@/components/calc/TerminalPanel";
import { RadioPanel } from "@/components/calc/RadioPanel";
import { NotepadPanel } from "@/components/calc/NotepadPanel";
import { Plot3DPanel } from "@/components/calc/Plot3DPanel";
import { NumericsPanel } from "@/components/calc/NumericsPanel";
import { AcademyPanel } from "@/components/calc/AcademyPanel";
import { RadioProvider } from "@/lib/calc/radio-context";
import { RadioMiniDock } from "@/components/calc/RadioMiniDock";
import { HelpDialog } from "@/components/calc/HelpDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "neoGraph · Λ-Workstation — Cyberpunk Programmable Calculator" },
      { name: "description", content: "neoGraph is a cyberpunk multi-window programmable scientific graphing calculator: CAS, ODE/quadrature/root finders, Python IDE, 3D surfaces, matrix decomp, distributions & hypothesis tests, terminal, internet radio, and a tabbed notepad." },
      { property: "og:title", content: "neoGraph · Λ-Workstation" },
      { property: "og:description", content: "Postgrad-grade scientific workstation in the browser." },
    ],
  }),
  component: Index,
});

// ----------------------------------------------------------------------------
// Panel registry. Each entry binds a stable PanelKey to its window chrome
// (title + accent color) and a render function. Adding a new panel: create
// the component, add its key to `PanelKey` in lib/calc/store.tsx, then drop
// an entry below — the floating-window manager and sidebar pick it up.
// ----------------------------------------------------------------------------
interface PanelDef {
  key: PanelKey;
  title: string;
  accent?: "cyan" | "amber" | "magenta";
  render: () => React.ReactNode;
}

const PANELS: PanelDef[] = [
  { key: "calc",      title: "CALCULATOR",            accent: "cyan",    render: () => <CalculatorPanel /> },
  { key: "graph",     title: "GRAPH · ENGINE",        accent: "cyan",    render: () => <GraphPanel /> },
  { key: "table",     title: "TABLE · VIEW",          accent: "amber",   render: () => <TablePanel /> },
  { key: "cas",       title: "CAS · SYMBOLIC",        accent: "magenta", render: () => <CasPanel /> },
  { key: "ide",       title: "IDE · MULTILANG",       accent: "cyan",    render: () => <IdePanel /> },
  { key: "paint",     title: "PAINT · CANVAS",        accent: "magenta", render: () => <PaintPanel /> },
  { key: "stats",     title: "STATS · REGRESSION",    accent: "amber",   render: () => <StatsPanel /> },
  { key: "matrix",    title: "MATRIX · DECOMP",       accent: "cyan",    render: () => <MatrixPanel /> },
  { key: "gsolve",    title: "G-SOLVE",               accent: "magenta", render: () => <GSolvePanel /> },
  { key: "constants", title: "CONSTANTS",             accent: "amber",   render: () => <ConstantsPanel /> },
  { key: "terminal",  title: "TERMINAL · /dev/neograph", accent: "cyan", render: () => <TerminalPanel /> },
  { key: "radio",     title: "RADIO · FOCUS FEEDS",   accent: "amber",   render: () => <RadioPanel /> },
  { key: "notepad",   title: "NOTEPAD",               accent: "amber",   render: () => <NotepadPanel /> },
  { key: "plot3d",    title: "3D · z = f(x,y)",       accent: "magenta", render: () => <Plot3DPanel /> },
  { key: "numerics",  title: "NUMERICS · ODE / ∫ / ROOT", accent: "cyan", render: () => <NumericsPanel /> },
  { key: "academy",   title: "ACADEMY · K → POSTGRAD",   accent: "amber",   render: () => <AcademyPanel /> },
];

function Index() {
  return (
    <CalcProvider>
      <RadioProvider>
        <Workstation />
      </RadioProvider>
    </CalcProvider>
  );
}

function Workstation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { visible, windows } = useCalc();

  const minimized = PANELS.filter((p) => visible[p.key] && windows[p.key].min);

  return (
    <div className="flex flex-col h-screen w-screen">
      <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
      <div className="flex-1 min-h-0 relative overflow-hidden"
           style={{
             backgroundImage: "linear-gradient(oklch(0.55 0.08 195 / 8%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.08 195 / 8%) 1px, transparent 1px)",
             backgroundSize: "32px 32px",
           }}>
        {sidebarOpen && (
          <FloatingWindow
            panelKey="workspace"
            title="WORKSPACE"
            accent="amber"
            onClose={() => setSidebarOpen(false)}
          >
            <WorkspaceSidebar />
          </FloatingWindow>
        )}
        {PANELS.map((p) =>
          visible[p.key] ? (
            <FloatingWindow key={p.key} panelKey={p.key} title={p.title} accent={p.accent}>
              <PanelErrorBoundary label={p.title}>{p.render()}</PanelErrorBoundary>
            </FloatingWindow>
          ) : null,
        )}
        {minimized.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex flex-wrap gap-1.5 border-t border-border bg-[oklch(0.16_0.03_250/85%)] backdrop-blur z-[9999]">
            <span className="text-[0.55rem] tracking-widest text-muted-foreground self-center">DOCK</span>
          </div>
        )}
        <ShortcutsDialog />
        <HelpDialog />
        <RadioMiniDock />
      </div>
    </div>
  );
}
