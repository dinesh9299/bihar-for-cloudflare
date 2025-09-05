// Advanced Design System - Inspired by Modern Dashboard Aesthetics
export const designSystem = {
  colors: {
    // Warm gradient backgrounds like the reference
    background: {
      primary: "from-amber-50 via-orange-50 to-yellow-50",
      secondary: "from-stone-100 via-amber-50 to-orange-50",
      tertiary: "from-neutral-50 via-stone-50 to-amber-50",
      card: "rgba(255, 255, 255, 0.7)",
      cardHover: "rgba(255, 255, 255, 0.85)",
    },
    // Yellow/Golden accents like the reference
    accent: {
      primary: "#F59E0B", // amber-500
      secondary: "#FCD34D", // amber-300
      tertiary: "#FEF3C7", // amber-100
      dark: "#D97706", // amber-600
    },
    // Dark elements for contrast
    dark: {
      primary: "#1F2937", // gray-800
      secondary: "#374151", // gray-700
      tertiary: "#4B5563", // gray-600
      text: "#111827", // gray-900
    },
    // Status colors
    status: {
      success: "#10B981", // emerald-500
      warning: "#F59E0B", // amber-500
      error: "#EF4444", // red-500
      info: "#3B82F6", // blue-500
    },
    // Neutral tones
    neutral: {
      50: "#FAFAF9",
      100: "#F5F5F4",
      200: "#E7E5E4",
      300: "#D6D3D1",
      400: "#A8A29E",
      500: "#78716C",
      600: "#57534E",
      700: "#44403C",
      800: "#292524",
      900: "#1C1917",
    },
  },
  gradients: {
    // Main background gradients
    primary: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
    secondary: "bg-gradient-to-r from-stone-100 via-amber-50 to-orange-50",
    tertiary: "bg-gradient-to-bl from-neutral-50 via-stone-50 to-amber-50",

    // Card gradients
    card: "bg-gradient-to-br from-white/70 to-white/50",
    cardHover: "bg-gradient-to-br from-white/80 to-white/60",

    // Accent gradients
    accent: "bg-gradient-to-r from-amber-400 to-yellow-500",
    accentDark: "bg-gradient-to-r from-amber-500 to-orange-600",

    // Dark gradients
    dark: "bg-gradient-to-r from-gray-800 to-gray-900",
    darkCard: "bg-gradient-to-br from-gray-800/90 to-gray-900/90",
  },
  borderRadius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "3rem",
    full: "9999px",
  },
  shadows: {
    soft: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    medium: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    large: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    glow: "0 0 20px rgba(245, 158, 11, 0.3)",
  },
  backdrop: {
    blur: "backdrop-blur-sm",
    blurMd: "backdrop-blur-md",
    blurLg: "backdrop-blur-lg",
  },
}

export const animations = {
  fadeIn: "animate-in fade-in duration-500",
  slideUp: "animate-in slide-in-from-bottom-4 duration-500",
  slideDown: "animate-in slide-in-from-top-4 duration-500",
  scaleIn: "animate-in zoom-in-95 duration-300",
  bounce: "animate-bounce",
  pulse: "animate-pulse",
}
