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
       * NEGOTIATION AI - COLOR SYSTEM
       * ============================================================
       */

      colors: {
        // Main application backgrounds
        bg: "#071018",
        header: "#04070D",
        sidebar: "#071018",

        // Cards and panels
        card: "#0C212F",
        cardAlt: "#0E2338",

        // Borders
        border: "#203442",
        borderGlow: "#1E607F",

        // Primary cyan theme
        primary: "#4DD0FF",
        primaryBright: "#38BDF8",

        // Status colors
        success: "#B6FF00",
        warning: "#F59E0B",
        danger: "#EF4444",

        // Text
        textPrimary: "#F1F5F9",
        textSecondary: "#8CA6BB",
        textMuted: "#60788C",
      },

      /*
       * ============================================================
       * FONTS
       * ============================================================
       */

      fontFamily: {
        sans: [
          "Space Grotesk",
          "system-ui",
          "sans-serif",
        ],

        mono: [
          "DM Mono",
          "monospace",
        ],
      },

      /*
       * ============================================================
       * SHADOWS / GLOW
       * ============================================================
       */

      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.5)",

        cardHover:
          "0 0 0 1px rgba(77, 208, 255, 0.35), 0 8px 28px rgba(77, 208, 255, 0.12)",

        glow:
          "0 0 0 1px rgba(77, 208, 255, 0.4), 0 0 24px rgba(77, 208, 255, 0.18)",

        glowSm:
          "0 0 0 1px rgba(77, 208, 255, 0.3), 0 0 12px rgba(77, 208, 255, 0.12)",

        successGlow:
          "0 0 12px rgba(182, 255, 0, 0.20)",
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
            transform: "translateY(4px)",
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
      },

      animation: {
        fadeIn: "fadeIn 0.25s ease-out",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },

  plugins: [],
};