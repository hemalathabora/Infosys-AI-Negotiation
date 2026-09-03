/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      /*
       * ============================================================
       * ENTERPRISE AI NEGOTIATION - COLOR SYSTEM
       * ============================================================
       */

      colors: {
        // Application backgrounds & surfaces
        bg: "#0B0F17",
        header: "#0B0F17",
        sidebar: "#0F172A",

        // Elevated Cards & Glass Panels
        card: "#131C2E",
        cardAlt: "#18243B",

        // Borders & Dividers
        border: "#1E293B",
        borderGlow: "#334155",

        // Core Accents: Indigo & Azure
        primary: "#6366F1",
        primaryBright: "#818CF8",
        azure: "#3B82F6",
        azureBright: "#60A5FA",

        // Status Colors (Refined Corporate Tones)
        success: "#10B981",
        successBright: "#34D399",
        warning: "#F59E0B",
        warningBright: "#FBBF24",
        danger: "#EF4444",

        // Professional Typography Hierarchy
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        textMuted: "#64748B",
      },

      /*
       * ============================================================
       * FONTS
       * ============================================================
       */

      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        body: [
          "Inter",
          "system-ui",
          "sans-serif",
        ],

        mono: [
          "JetBrains Mono",
          "monospace",
        ],
      },

      /*
       * ============================================================
       * SHADOWS / SURFACE ELEVATION
       * ============================================================
       */

      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",

        cardHover:
          "0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.35)",

        glow:
          "0 0 24px rgba(99, 102, 241, 0.22), 0 0 0 1px rgba(99, 102, 241, 0.3)",

        glowSm:
          "0 0 12px rgba(99, 102, 241, 0.16), 0 0 0 1px rgba(99, 102, 241, 0.25)",

        successGlow:
          "0 0 16px rgba(16, 185, 129, 0.22)",
      },

      /*
       * ============================================================
       * ANIMATIONS
       * ============================================================
       */

      keyframes: {
        fadeIn: {
          "0%": {
            opacity: 0,
            transform: "translateY(6px)",
          },

          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },

        shimmer: {
          "0%": {
            backgroundPosition: "-400px 0",
          },

          "100%": {
            backgroundPosition: "400px 0",
          },
        },

        pulseSubtle: {
          "0%, 100%": {
            opacity: 1,
            transform: "scale(1)",
          },
          "50%": {
            opacity: 0.6,
            transform: "scale(1.15)",
          },
        },
      },

      animation: {
        fadeIn: "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 1.4s linear infinite",
        pulseSubtle: "pulseSubtle 2.5s ease-in-out infinite",
      },
    },
  },

  plugins: [],
};