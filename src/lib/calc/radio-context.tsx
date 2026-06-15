/**
 * RadioContext — persistent internet-radio engine.
 * ------------------------------------------------------------------
 * Owns a single <audio> element mounted at the provider level so that
 * closing the Radio panel does NOT stop playback. The panel and the
 * mini-dock are both thin views over this context.
 *
 * Stations:
 *   • PRESET_STATIONS — curated SomaFM feeds (listener-supported, free).
 *   • customStations  — user-added URLs, persisted in localStorage.
 *
 * Persistence keys:
 *   • lvbl_radio_vol_v1     — volume (0..1)
 *   • lvbl_radio_custom_v1  — Station[]
 *   • lvbl_radio_station_v1 — last selected station id
 * ------------------------------------------------------------------
 */
import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";

export interface Station {
  id: string;
  name: string;
  tag: string;
  url: string;
  custom?: boolean;
}

export const PRESET_STATIONS: Station[] = [
  { id: "groovesalad",    name: "Groove Salad",       tag: "ambient / downtempo",  url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { id: "dronezone",      name: "Drone Zone",         tag: "atmospheric",          url: "https://ice1.somafm.com/dronezone-128-mp3" },
  { id: "spacestation",   name: "Space Station Soma", tag: "space / ambient",      url: "https://ice1.somafm.com/spacestation-128-mp3" },
  { id: "missioncontrol", name: "Mission Control",    tag: "ambient + nasa audio", url: "https://ice1.somafm.com/missioncontrol-128-mp3" },
  { id: "defcon",         name: "DEF CON Radio",      tag: "electronica · hacker", url: "https://ice1.somafm.com/defcon-128-mp3" },
  { id: "lush",           name: "Lush",               tag: "vocal · downtempo",    url: "https://ice1.somafm.com/lush-128-mp3" },
  { id: "deepspaceone",   name: "Deep Space One",     tag: "deep ambient",         url: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { id: "cliqhop",        name: "Cliqhop IDM",        tag: "intelligent dance",    url: "https://ice1.somafm.com/cliqhop-128-mp3" },
  { id: "beatblender",    name: "Beat Blender",       tag: "deep / chillout",      url: "https://ice1.somafm.com/beatblender-128-mp3" },
  { id: "secretagent",    name: "Secret Agent",       tag: "spy jazz / lounge",    url: "https://ice1.somafm.com/secretagent-128-mp3" },
  { id: "thetrip",        name: "The Trip",           tag: "progressive psy",      url: "https://ice1.somafm.com/thetrip-128-mp3" },
  { id: "thistle",        name: "ThistleRadio",       tag: "celtic · world",       url: "https://ice1.somafm.com/thistle-128-mp3" },
  { id: "n5md",           name: "n5MD Radio",         tag: "modern classical",     url: "https://ice1.somafm.com/n5md-128-mp3" },
  { id: "brfm",           name: "Black Rock FM",      tag: "burning man",          url: "https://ice1.somafm.com/brfm-128-mp3" },
];

const KEY_VOL = "lvbl_radio_vol_v1";
const KEY_CUSTOM = "lvbl_radio_custom_v1";
const KEY_STATION = "lvbl_radio_station_v1";

export type RadioStatus = "idle" | "loading" | "playing" | "error";

interface RadioCtx {
  stations: Station[];                                  // presets + custom
  customStations: Station[];
  addCustom: (s: { name: string; url: string; tag?: string }) => void;
  removeCustom: (id: string) => void;
  station: Station;
  setStation: (s: Station) => void;
  playing: boolean;
  status: RadioStatus;
  volume: number;
  setVolume: (n: number) => void;
  muted: boolean;
  setMuted: (b: boolean) => void;
  toggle: () => void;
}

const Ctx = createContext<RadioCtx | null>(null);

function loadCustom(): Station[] {
  try {
    const raw = localStorage.getItem(KEY_CUSTOM);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr.filter((s) => s && typeof s.id === "string" && typeof s.url === "string")
      : [];
  } catch { return []; }
}

export function RadioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [customStations, setCustomStations] = useState<Station[]>(() => loadCustom());
  const stations = [...PRESET_STATIONS, ...customStations];

  const [station, setStationState] = useState<Station>(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(KEY_STATION) : null;
    const all = [...PRESET_STATIONS, ...loadCustom()];
    return all.find((s) => s.id === id) ?? PRESET_STATIONS[0];
  });
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<RadioStatus>("idle");
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === "undefined") return 0.7;
    const v = Number(localStorage.getItem(KEY_VOL));
    return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.7;
  });
  const [muted, setMuted] = useState(false);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = muted ? 0 : volume; }, [volume, muted]);
  useEffect(() => { try { localStorage.setItem(KEY_VOL, String(volume)); } catch { /* ignore */ } }, [volume]);
  useEffect(() => { try { localStorage.setItem(KEY_CUSTOM, JSON.stringify(customStations)); } catch { /* ignore */ } }, [customStations]);
  useEffect(() => { try { localStorage.setItem(KEY_STATION, station.id); } catch { /* ignore */ } }, [station.id]);

  const setStation = useCallback((s: Station) => {
    setStationState(s);
    const a = audioRef.current; if (!a) return;
    const wasPlaying = playing;
    a.pause();
    a.src = s.url;
    a.load();
    if (wasPlaying) {
      setStatus("loading");
      a.play().then(() => setStatus("playing")).catch(() => setStatus("error"));
    }
  }, [playing]);

  const toggle = useCallback(async () => {
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
  }, [playing, station.url]);

  const addCustom = useCallback(({ name, url, tag }: { name: string; url: string; tag?: string }) => {
    const id = `custom_${Date.now().toString(36)}`;
    setCustomStations((prev) => [
      ...prev,
      { id, name: name.trim() || "Custom Stream", url: url.trim(), tag: (tag ?? "user feed").trim(), custom: true },
    ]);
  }, []);

  const removeCustom = useCallback((id: string) => {
    setCustomStations((prev) => prev.filter((s) => s.id !== id));
    setStationState((cur) => (cur.id === id ? PRESET_STATIONS[0] : cur));
  }, []);

  return (
    <Ctx.Provider value={{
      stations, customStations, addCustom, removeCustom,
      station, setStation,
      playing, status,
      volume, setVolume, muted, setMuted,
      toggle,
    }}>
      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => { setPlaying(true); setStatus("playing"); }}
        onPause={() => setPlaying(false)}
        onError={() => setStatus("error")}
        onWaiting={() => setStatus("loading")}
      />
      {children}
    </Ctx.Provider>
  );
}

export function useRadio() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRadio must be used within RadioProvider");
  return v;
}
