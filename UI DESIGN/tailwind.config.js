/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      /*
       * ============================================================
       * ENTERPRISE AI NEGOTIATION - COLOR SYSTEM (THEME-AWARE)
       * ============================================================
       */

      colors: {
        // Outer Application & Sidebar
        bg: "color-mix(in srgb, var(--bg) calc(<alpha-value> * 100%), transparent)",
        header: "color-mix(in srgb, var(--header) calc(<alpha-value> * 100%), transparent)",
        sidebar: "color-mix(in srgb, var(--sidebar) calc(<alpha-value> * 100%), transparent)",

        // Elevated Main Panel
        mainPanel: "color-mix(in srgb, var(--main-panel) calc(<alpha-value> * 100%), transparent)",

        // Inset Cards & Inner Surfaces
        card: "color-mix(in srgb, var(--card) calc(<alpha-value> * 100%), transparent)",
        cardAlt: "color-mix(in srgb, var(--card-alt) calc(<alpha-value> * 100%), transparent)",

        // Borders & Dividers
        border: "color-mix(in srgb, var(--border) calc(<alpha-value> * 100%), transparent)",
        borderSubtle: "color-mix(in srgb, var(--border-subtle) calc(<alpha-value> * 100%), transparent)",
        borderGlow: "color-mix(in srgb, var(--border-glow) calc(<alpha-value> * 100%), transparent)",

        // Primary Brand Accent
        primary: "color-mix(in srgb, var(--primary) calc(<alpha-value> * 100%), transparent)",
        primaryBright: "color-mix(in srgb, var(--primary-bright) calc(<alpha-value> * 100%), transparent)",
        brandWhite: "color-mix(in srgb, var(--brand-white) calc(<alpha-value> * 100%), transparent)",
        azure: "color-mix(in srgb, var(--azure) calc(<alpha-value> * 100%), transparent)",
        azureBright: "color-mix(in srgb, var(--azure-bright) calc(<alpha-value> * 100%), transparent)",

        // Status & Badge Tones
        success: "color-mix(in srgb, var(--success) calc(<alpha-value> * 100%), transparent)",
        successBright: "color-mix(in srgb, var(--success-bright) calc(<alpha-value> * 100%), transparent)",
        warning: "color-mix(in srgb, var(--warning) calc(<alpha-value> * 100%), transparent)",
        warningBright: "color-mix(in srgb, var(--warning-bright) calc(<alpha-value> * 100%), transparent)",
        danger: "color-mix(in srgb, var(--danger) calc(<alpha-value> * 100%), transparent)",

        // Typography Hierarchy
        textPrimary: "color-mix(in srgb, var(--text-primary) calc(<alpha-value> * 100%), transparent)",
        textSecondary: "color-mix(in srgb, var(--text-secondary) calc(<alpha-value> * 100%), transparent)",
        textMuted: "color-mix(in srgb, var(--text-muted) calc(<alpha-value> * 100%), transparent)",
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