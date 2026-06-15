/**
 * RadioMiniDock — tiny floating transport that appears when the Radio
 * panel is closed (or minimized) AND a stream is playing/loading. Lets the
 * user pause without re-opening the full panel.
 */
import { useRadio } from "@/lib/calc/radio-context";
import { useCalc } from "@/lib/calc/store";
import { Play, Pause, Radio, ExternalLink } from "lucide-react";

export function RadioMiniDock() {
  const { playing, status, station, toggle } = useRadio();
  const { visible, windows, showPanel } = useCalc();

  // Show only when the panel isn't on-screen and something is happening.
  const panelOnScreen = visible.radio && !windows.radio.min;
  if (panelOnScreen) return null;
  if (!playing && status === "idle") return null;

  const dot =
    status === "playing" ? "var(--color-amber)" :
    status === "loading" ? "var(--color-primary)" :
    status === "error"   ? "var(--destructive)" : "var(--muted-foreground)";

  return (
    <div
      className="fixed bottom-3 right-3 z-[9998] panel flex items-center gap-2 px-2 py-1.5"
      style={{ boxShadow: "0 8px 32px -8px oklch(0 0 0 / 70%), 0 0 0 1px var(--color-border-strong)" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot, boxShadow: `0 0 6px ${dot}` }} />
      <Radio size={12} className="text-muted-foreground" />
      <div className="min-w-0 max-w-[180px]">
        <div className="text-[0.7rem] neon-text truncate">{station.name}</div>
        <div className="text-[0.55rem] tracking-widest text-muted-foreground truncate uppercase">{status}</div>
      </div>
      <button className="pill-btn !px-1.5 !py-1" data-active onClick={toggle} title={playing ? "Pause" : "Play"}>
        {playing ? <Pause size={12} /> : <Play size={12} />}
      </button>
      <button className="pill-btn !px-1.5 !py-1" onClick={() => showPanel("radio")} title="Open radio panel">
        <ExternalLink size={12} />
      </button>
    </div>
  );
}
