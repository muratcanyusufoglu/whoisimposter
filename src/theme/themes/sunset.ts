import {AppTheme} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// SUNSET THEME — Light warm orange palette, #FF7A30 as the star.
//
// Color roles:
//  #FF7A30  accent.primary      — vivid sunset orange CTA (main)
//  #FFF0E0  bg.primary          — light warm cream / sunset sky
//  #FFE4CB  bg.surface          — soft peach surface
//  #FFD5B0  bg.elevated         — deeper peach modal / sheet
//  #2D1200  text.primary        — very dark warm brown — readable on light bg
//  #7A3A10  text.secondary      — medium warm brown
//  #B87040  text.muted          — muted orange-brown
//  #DD563D  accent.secondary    — coral-red danger / imposter
//  #E6866D  accent.warm         — warm coral timer / categories
//  #83A7A0  accent.tertiary     — muted teal-grey crew / info
//  #BF94A8  status.info         — dusty rose
//  #AB3C1F  glow.danger source  — deep rust
//  #0D474A  game.crewBg         — crew card reveal teal
// ─────────────────────────────────────────────────────────────────────────────

export const sunsetTheme: AppTheme = {
  id: "sunset",

  bg: {
    primary: "#FFF0E0", // Light warm cream — sunset sky
    surface: "#FFE4CB", // Soft peach surface
    elevated: "#FFD5B0", // Deeper peach — modal / sheet
    overlay: "rgba(0,0,0,0.40)",
    glass: "rgba(255,122,48,0.10)", // Orange glass tint
  },

  accent: {
    primary: "#FF7A30", // Vivid sunset orange — THE main color
    secondary: "#DD563D", // Coral-red — danger / imposter
    tertiary: "#83A7A0", // Muted teal-grey — crew / info
    warm: "#E6866D", // Warm coral — timer / categories
    premium: "#FFD700", // Gold badge
  },

  text: {
    primary: "#2D1200", // Very dark warm brown — main readable text
    secondary: "#7A3A10", // Medium warm brown — supporting text
    muted: "#B87040", // Muted orange-brown — disabled / placeholder
    inverse: "#FFFFFF", // Text on orange button
    onPrimary: "#FFFFFF",
  },

  border: {
    subtle: "rgba(255,122,48,0.15)",
    default: "rgba(255,122,48,0.30)",
    strong: "rgba(255,122,48,0.55)",
    focus: "#FF7A30",
  },

  glow: {
    primary: "rgba(255,122,48,0.25)", // Orange glow
    danger: "rgba(171,60,31,0.30)", // AB3C1F rust glow
    success: "rgba(131,167,160,0.25)", // 83A7A0 teal glow
  },

  game: {
    imposterBg: "#FFF0E0", // Light warm cream — imposter reveal
    crewBg: "#0D474A", // Exact dark teal — crew reveal
    voteBg: "#FFF0E0",
    cardText: "#2D1200",
    cardTextMuted: "rgba(45,18,0,0.50)",
  },

  status: {
    success: "#83A7A0", // Muted teal-grey — calm / good
    warning: "#E6866D", // Warm coral
    error: "#DD563D", // Coral-red
    info: "#BF94A8", // Dusty rose
  },
};
