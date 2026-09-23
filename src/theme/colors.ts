// Mirrors the FORCOACH brand palette defined in web/src/app/globals.css:
// charcoal + off-white, with a violet accent used for links, active states,
// and highlights.
export const colors = {
  background: "#f7f6f4",
  foreground: "#1c1c1c",
  card: "#ffffff",
  charcoal: "#1c1c1c",
  offWhite: "#f7f6f4",
  accent: "#6d4fe0",
  accentLight: "#efeafc",
  accentForeground: "#ffffff",
  secondary: "#ece9e6",
  mutedForeground: "#6e5f5c",
  border: "#e1dcd8",
  destructive: "#dc2626",
  destructiveMuted: "#fee2e2",
  destructiveText: "#991b1b",
  success: "#16a34a",
  successMuted: "#dcfce7",
  successText: "#166534",
};

// No color field on a studio in the database — this is a purely visual,
// deterministic hash so the same studio always gets the same dot color.
const STUDIO_DOT_COLORS = [
  "#6d4fe0",
  "#16a34a",
  "#dc2626",
  "#0ea5e9",
  "#d97706",
  "#db2777",
  "#65a30d",
];

export function studioColor(studioId: string | null | undefined): string {
  if (!studioId) return colors.mutedForeground;
  let hash = 0;
  for (let i = 0; i < studioId.length; i++) {
    hash = (hash * 31 + studioId.charCodeAt(i)) >>> 0;
  }
  return STUDIO_DOT_COLORS[hash % STUDIO_DOT_COLORS.length];
}

// A soft, modern card elevation — used instead of a hard border on its own
// so surfaces read as "raised" rather than flatly outlined.
export const cardShadow = {
  shadowColor: "#1c1c1c",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};
