/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#071018",
        card: "#0D1924",
        cardAlt: "#101F2C",
        border: "#203442",
        borderGlow: "#2C4A66",
        primary: "#38BDF8",
        primaryBright: "#7DD3FC",
        success: "#22C55E",
        warning: "#F59E0B",
        textPrimary: "#F1F5F9",
        textSecondary: "#8195AC",
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.5)",
        cardHover:
          "0 0 0 1px rgba(56,189,248,0.35), 0 8px 28px rgba(56,189,248,0.12)",
        glow: "0 0 0 1px rgba(56,189,248,0.4), 0 0 24px rgba(56,189,248,0.18)",
        glowSm:
          "0 0 0 1px rgba(56,189,248,0.3), 0 0 12px rgba(56,189,248,0.12)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-out",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};
