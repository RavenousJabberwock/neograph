import type { Wallpaper } from "./store";

export function wallpaperStyle(w: Wallpaper): React.CSSProperties {
  if (w.kind === "image") {
    return {
      backgroundImage: `url(${w.url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  switch (w.name) {
    case "grid":
      return {
        backgroundColor: "oklch(0.16 0.025 250)",
        backgroundImage:
          "linear-gradient(oklch(0.55 0.08 195 / 18%) 1px, transparent 1px)," +
          "linear-gradient(90deg, oklch(0.55 0.08 195 / 18%) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      };
    case "scanlines":
      return {
        backgroundColor: "oklch(0.18 0.04 320)",
        backgroundImage:
          "repeating-linear-gradient(0deg, oklch(0.85 0.18 195 / 14%) 0 1px, transparent 1px 4px)",
      };
    case "dots":
      return {
        backgroundColor: "oklch(0.17 0.03 250)",
        backgroundImage:
          "radial-gradient(oklch(0.78 0.18 78 / 35%) 1px, transparent 1.4px)",
        backgroundSize: "18px 18px",
      };
    case "hex":
      return {
        backgroundColor: "oklch(0.17 0.03 250)",
        backgroundImage:
          "linear-gradient(60deg, oklch(0.72 0.22 340 / 14%) 25%, transparent 25.5%, transparent 75%, oklch(0.72 0.22 340 / 14%) 75%)," +
          "linear-gradient(-60deg, oklch(0.85 0.18 195 / 14%) 25%, transparent 25.5%, transparent 75%, oklch(0.85 0.18 195 / 14%) 75%)",
        backgroundSize: "28px 48px",
      };
    case "plain":
    default:
      return { backgroundColor: "oklch(0.16 0.03 250)" };
  }
}
