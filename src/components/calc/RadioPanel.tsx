/**
 * RadioPanel — thin view over RadioProvider. Audio playback lives in the
 * provider so closing this panel does NOT interrupt the stream.
 *
 * Adds:
 *  • Custom-URL form (saves into the user station list).
 *  • Section to remove user feeds.
 */
import { useState } from "react";
import { Play, Pause, Radio, Volume2, VolumeX, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useRadio, PRESET_STATIONS, type Station } from "@/lib/calc/radio-context";

export function RadioPanel() {
  const {
    stations, customStations, addCustom, removeCustom,
    station, setStation,
    playing, status,
    volume, setVolume, muted, setMuted,
    toggle,
  } = useRadio();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newTag, setNewTag] = useState("");

  const submitAdd = () => {
    if (!newUrl.trim()) return;
    try { new URL(newUrl.trim()); } catch { alert("That URL doesn't look valid."); return; }
    addCustom({ name: newName, url: newUrl, tag: newTag });
    setNewName(""); setNewUrl(""); setNewTag(""); setShowAdd(false);
  };

  const renderRow = (s: Station) => (
    <div
      key={s.id}
      className="group flex items-center gap-1 rounded-sm border border-border bg-[oklch(0.22_0.03_250)] px-2 py-1.5 hover:border-[var(--color-border-strong)] transition-colors"
      data-active={s.id === station.id}
      style={s.id === station.id ? { boxShadow: "0 0 0 1px var(--color-border-strong)" } : undefined}
    >
      <button
        className="flex-1 text-left hover:text-primary min-w-0"
        onClick={() => setStation(s)}
      >
        <div className="text-[0.78rem] flex items-center gap-2 truncate">
          <span className={s.id === station.id ? "neon-text" : ""}>{s.name}</span>
          {s.id === station.id && status === "playing" && (
            <span className="text-[0.55rem] tracking-widest text-[var(--color-amber)]">▶ LIVE</span>
          )}
        </div>
        <div className="text-[0.6rem] text-muted-foreground truncate">{s.tag}</div>
      </button>
      {s.custom && (
        <button
          className="pill-btn !px-1.5 opacity-0 group-hover:opacity-100"
          title="Remove custom feed"
          onClick={() => removeCustom(s.id)}
        ><Trash2 size={10} /></button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-auto">
      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-3 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30"
             style={{ background: "repeating-linear-gradient(0deg, oklch(0.85 0.18 195 / 18%) 0 1px, transparent 1px 4px)" }} />
        <div className="relative h-12 w-12 rounded-md grid place-items-center border border-border-strong"
             style={{ background: "var(--gradient-cyan)", boxShadow: "var(--shadow-neon-cyan)" }}>
          <Radio size={22} className="text-[var(--color-background)]" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="text-[0.6rem] tracking-widest text-muted-foreground flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${
              status === "playing" ? "bg-[var(--color-amber)] animate-pulse" :
              status === "loading" ? "bg-[var(--color-primary)] animate-pulse" :
              status === "error" ? "bg-destructive" : "bg-muted-foreground"}`} />
            STATION · {status.toUpperCase()} · PERSISTS WHEN CLOSED
          </div>
          <div className="text-base neon-text truncate">{station.name}</div>
          <div className="text-[0.65rem] text-muted-foreground truncate">{station.tag}</div>
        </div>
        <button className="pill-btn !px-3 !py-2" data-active onClick={toggle} title={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="pill-btn !px-1.5" onClick={() => setMuted(!muted)} title="mute">
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
        <input
          type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
          className="flex-1"
        />
        <span className="text-[0.6rem] tracking-widest text-muted-foreground tabular-nums w-10 text-right">
          {Math.round((muted ? 0 : volume) * 100)}%
        </span>
      </div>

      <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-2 flex-1 min-h-0 overflow-auto">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1.5 flex items-center justify-between">
          <span>FEEDS · SOMAFM ({PRESET_STATIONS.length})</span>
          <button className="pill-btn !text-[0.55rem] !px-1.5 !py-0.5" onClick={() => setShowAdd((v) => !v)}>
            <Plus size={10} /> ADD URL
          </button>
        </div>

        {showAdd && (
          <div className="mb-2 rounded-sm border border-border-strong bg-[oklch(0.22_0.03_250)] p-2 space-y-1.5">
            <input className="field !py-1 text-[0.7rem] w-full" placeholder="name (e.g. SomaFM Indie Pop)"
                   value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className="field !py-1 text-[0.7rem] w-full" placeholder="stream URL (https://… .mp3 / .aac / .m3u8)"
                   value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
            <input className="field !py-1 text-[0.7rem] w-full" placeholder="tag / genre (optional)"
                   value={newTag} onChange={(e) => setNewTag(e.target.value)} />
            <div className="flex gap-1">
              <button className="pill-btn flex-1" data-active onClick={submitAdd}>SAVE</button>
              <button className="pill-btn flex-1" onClick={() => setShowAdd(false)}>CANCEL</button>
            </div>
            <div className="text-[0.55rem] text-muted-foreground">
              MP3 / AAC HTTP-icecast streams work best. Some hosts block CORS — try another if it errors.
            </div>
          </div>
        )}

        <div className="grid gap-1">
          {stations.filter((s) => !s.custom).map(renderRow)}
        </div>

        {customStations.length > 0 && (
          <>
            <div className="text-[0.55rem] tracking-widest text-muted-foreground mt-3 mb-1.5">
              YOUR FEEDS ({customStations.length})
            </div>
            <div className="grid gap-1">
              {customStations.map(renderRow)}
            </div>
          </>
        )}
      </div>

      <a
        href="https://somafm.com"
        target="_blank"
        rel="noreferrer noopener"
        className="text-[0.55rem] tracking-widest text-muted-foreground inline-flex items-center gap-1 hover:text-primary"
      >
        feeds courtesy of SomaFM · listener-supported <ExternalLink size={10} />
      </a>
    </div>
  );
}
