export const theme = {
  colors: {
    primary: "#7A4B29",          // Warm Deep Brown
    primaryDark: "#5C371D",      // Rich Chocolate Brown
    primaryLight: "#F0E8DF",     // Very Light Soft Brown
    background: "#FAF7F2",       // Warm Cream Off-White
    surface: "#FFFFFF",          // Pure White for Cards
    surfaceAlt: "#F4EFEA",       // Light Cream Accent Surface
    text: "#2C1A0E",             // Espresso Dark Brown
    textMuted: "#8C7A6B",        // Warm Muted Brown
    textLight: "#A8998C",        // Subtle Light Brown Text
    border: "#EBE4DC",           // Soft Creamy Border
    borderActive: "#7A4B29",     // Active Brown Border
    accent: "#9E6438",           // Terracotta Brown Accent
    badgeAvailable: "#F5EDE4",   // Soft Brown Cream Badge
    badgeAvailableText: "#7A4B29",
    badgeBusy: "#FDF2F2",
    badgeBusyText: "#DC2626",
    error: "#EF4444",
    success: "#7A4B29",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 40,
  },
  radii: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 24,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: "#2C1A0E",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
  },
  typography: {
    h1: { fontSize: 30, fontWeight: "800" as const, color: "#2C1A0E" },
    h2: { fontSize: 22, fontWeight: "700" as const, color: "#2C1A0E" },
    h3: { fontSize: 17, fontWeight: "700" as const, color: "#2C1A0E" },
    body: { fontSize: 15, fontWeight: "400" as const, color: "#2C1A0E" },
    bodySmall: { fontSize: 13, fontWeight: "400" as const, color: "#8C7A6B" },
    caption: { fontSize: 11, fontWeight: "600" as const, color: "#8C7A6B" },
  },
};
