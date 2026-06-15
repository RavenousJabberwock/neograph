import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Group as PanelGroup, Panel, Separator } from "react-resizable-panels";
import { CalcProvider, useCalc } from "@/lib/calc/store";
import { TopBar } from "@/components/calc/TopBar";
import { WorkspaceSidebar } from "@/components/calc/WorkspaceSidebar";
import { CalculatorPanel } from "@/components/calc/CalculatorPanel";
import { GraphPanel } from "@/components/calc/GraphPanel";
import { TablePanel } from "@/components/calc/TablePanel";
import { CasPanel } from "@/components/calc/CasPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Λ-Workstation · Cyberpunk Graphing Calculator" },
      { name: "description", content: "Cyberpunk-styled programmable scientific graphing calculator with a CAS, multi-panel workspace, and live function plotting." },
      { property: "og:title", content: "Λ-Workstation · Cyberpunk Graphing Calculator" },
      { property: "og:description", content: "Cyberpunk-styled programmable scientific graphing calculator with a CAS, multi-panel workspace, and live function plotting." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <CalcProvider>
      <Workstation />
    </CalcProvider>
  );
}

function Workstation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { visible } = useCalc();

  const anyRight = visible.graph || visible.table || visible.cas;

  return (
    <div className="flex flex-col h-screen w-screen">
      <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
      <div className="flex-1 min-h-0 p-2">
        <PanelGroup orientation="horizontal" className="gap-0">
          {sidebarOpen && (
            <>
              <Panel defaultSize={16} minSize={12} maxSize={28}>
                <WorkspaceSidebar />
              </Panel>
              <Separator className="resize-handle horizontal" />
            </>
          )}

          {visible.calc && (
            <>
              <Panel defaultSize={26} minSize={18}>
                <CalculatorPanel />
              </Panel>
              {anyRight && <Separator className="resize-handle horizontal" />}
            </>
          )}

          {anyRight && (
            <Panel defaultSize={58} minSize={30}>
              <PanelGroup orientation="vertical">
                {visible.graph && (
                  <>
                    <Panel defaultSize={62} minSize={25}>
                      <GraphPanel />
                    </Panel>
                    {(visible.table || visible.cas) && <Separator className="resize-handle vertical" />}
                  </>
                )}
                {(visible.table || visible.cas) && (
                  <Panel defaultSize={38} minSize={20}>
                    <PanelGroup orientation="horizontal">
                      {visible.table && (
                        <>
                          <Panel defaultSize={50} minSize={25}>
                            <TablePanel />
                          </Panel>
                          {visible.cas && <Separator className="resize-handle horizontal" />}
                        </>
                      )}
                      {visible.cas && (
                        <Panel defaultSize={50} minSize={25}>
                          <CasPanel />
                        </Panel>
                      )}
                    </PanelGroup>
                  </Panel>
                )}
              </PanelGroup>
            </Panel>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}
