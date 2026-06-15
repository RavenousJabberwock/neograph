import { useEffect, useRef, useState } from "react";
import { Play, Pause, Radio, Volume2, VolumeX, ExternalLink } from "lucide-react";

// SomaFM is a listener-supported station that permits direct stream URLs.
// All feeds are free and DRM-free. Streams are 128k MP3.
interface Station {
  id: string;
  name: string;
  tag: string;
  url: string;
}

const STATIONS: Station[] = [
  { id: "groovesalad",   name: "Groove Salad",        tag: "ambient / downtempo",  url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { id: "dronezone",     name: "Drone Zone",          tag: "atmospheric",          url: "https://ice1.somafm.com/dronezone-128-mp3" },
  { id: "spacestation",  name: "Space Station Soma",  tag: "space / ambient",      url: "https://ice1.somafm.com/spacestation-128-mp3" },
  { id: "missioncontrol",name: "Mission Control",     tag: "ambient + nasa audio", url: "https://ice1.somafm.com/missioncontrol-128-mp3" },
  { id: "defcon",        name: "DEF CON Radio",       tag: "electronica · hacker", url: "https://ice1.somafm.com/defcon-128-mp3" },
  { id: "lush",          name: "Lush",                tag: "vocal · downtempo",    url: "https://ice1.somafm.com/lush-128-mp3" },
  { id: "deepspaceone",  name: "Deep Space One",      tag: "deep ambient",         url: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { id: "cliqhop",       name: "Cliqhop IDM",         tag: "intelligent dance",    url: "https://ice1.somafm.com/cliqhop-128-mp3" },
  { id: "beatblender",   name: "Beat Blender",        tag: "deep / chillout",      url: "https://ice1.somafm.com/beatblender-128-mp3" },
  { id: "secretagent",   name: "Secret Agent",        tag: "spy jazz / lounge",    url: "https://ice1.somafm.com/secretagent-128-mp3" },
  { id: "thetrip",       name: "The Trip",            tag: "progressive psy",      url: "https://ice1.somafm.com/thetrip-128-mp3" },
  { id: "thistle",       name: "ThistleRadio",        tag: "celtic · world",       url: "https://ice1.somafm.com/thistle-128-mp3" },
  { id: "n5md",          name: "n5MD Radio",          tag: "modern classical",     url: "https://ice1.somafm.com/n5md-128-mp3" },
  { id: "brfm",          name: "Black Rock FM",       tag: "burning man",          url: "https://ice1.somafm.com/brfm-128-mp3" },
];

export function RadioPanel() {
  const [station, setStation] = useState<Station>(STATIONS[0]);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === "undefined") return 0.7;
    const v = Number(localStorage.getItem("lvbl_radio_vol_v1"));
    return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.7;
  });
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    a.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => { localStorage.setItem("lvbl_radio_vol_v1", String(volume)); }, [volume]);

  // when station changes mid-play, reload and resume
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const wasPlaying = playing;
    a.pause();
    a.src = station.url;
    a.load();
    if (wasPlaying) {
      setStatus("loading");
      a.play().then(() => setStatus("playing")).catch(() => setStatus("error"));
    }
  }, [station.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); setStatus("idle"); return; }
    setStatus("loading");
    try {
      if (!a.src) a.src = station.url;
      await a.play();
      setPlaying(true); setStatus("playing");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-auto">
      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => { setPlaying(true); setStatus("playing"); }}
        onPause={() => setPlaying(false)}
        onError={() => setStatus("error")}
        onWaiting={() => setStatus("loading")}
      />

      <div className="rounded-md border border-border bg-[oklch(0.16_0.03_250)] p-3 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30"
             style={{ background: "repeating-linear-gradient(0deg, oklch(0.85 0.18 195 / 18%) 0 1px, transparent 1px 4px)" }} />
        <div className="relative h-12 w-12 rounded-md grid place-items-center border border-border-strong"
             style={{ background: "var(--gradient-cyan)", boxShadow: "var(--shadow-neon-cyan)" }}>
          <Radio size={22} className="text-[var(--color-background)]" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="text-[0.6rem] tracking-widest text-muted-foreground flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${status === "playing" ? "bg-[var(--color-amber)] animate-pulse" : status === "loading" ? "bg-[var(--color-primary)] animate-pulse" : status === "error" ? "bg-destructive" : "bg-muted-foreground"}`} />
            STATION · {status.toUpperCase()}
          </div>
          <div className="text-base neon-text truncate">{station.name}</div>
          <div className="text-[0.65rem] text-muted-foreground truncate">{station.tag}</div>
        </div>
        <button className="pill-btn !px-3 !py-2" data-active onClick={toggle} title={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="pill-btn !px-1.5" onClick={() => setMuted((m) => !m)} title="mute">
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
        <input
          type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
          className="flex-1"
        />
        <span className="text-[0.6rem] tracking-widest text-muted-foreground tabular-nums w-10 text-right">{Math.round((muted ? 0 : volume) * 100)}%</span>
      </div>

      <div className="rounded-md border border-border bg-[oklch(0.18_0.03_250)] p-2 flex-1 min-h-0 overflow-auto">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1.5">FEEDS · SOMAFM</div>
        <div className="grid gap-1">
          {STATIONS.map((s) => (
            <button
              key={s.id}
              className="text-left rounded-sm border border-border bg-[oklch(0.22_0.03_250)] px-2 py-1.5 hover:border-[var(--color-border-strong)] hover:text-primary transition-colors"
              data-active={s.id === station.id}
              onClick={() => setStation(s)}
              style={s.id === station.id ? { boxShadow: "0 0 0 1px var(--color-border-strong)" } : undefined}
            >
              <div className="text-[0.78rem] flex items-center gap-2">
                <span className={s.id === station.id ? "neon-text" : ""}>{s.name}</span>
                {s.id === station.id && <span className="text-[0.55rem] tracking-widest text-[var(--color-amber)]">▶ LIVE</span>}
              </div>
              <div className="text-[0.6rem] text-muted-foreground">{s.tag}</div>
            </button>
          ))}
        </div>
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
