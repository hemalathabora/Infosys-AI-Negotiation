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
        bg: "var(--bg)",
        header: "var(--header)",
        sidebar: "var(--sidebar)",

        // Elevated Main Panel
        mainPanel: "var(--main-panel)",

        // Inset Cards & Inner Surfaces
        card: "var(--card)",
        cardAlt: "var(--card-alt)",

        // Borders & Dividers
        border: "var(--border)",
        borderSubtle: "var(--border-subtle)",
        borderGlow: "var(--border-glow)",

        // Primary Brand Accent
        primary: "var(--primary)",
        primaryBright: "var(--primary-bright)",
        brandWhite: "var(--brand-white)",
        azure: "var(--azure)",
        azureBright: "var(--azure-bright)",

        // Status & Badge Tones
        success: "var(--success)",
        successBright: "var(--success-bright)",
        warning: "var(--warning)",
        warningBright: "var(--warning-bright)",
        danger: "var(--danger)",

        // Typography Hierarchy
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
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