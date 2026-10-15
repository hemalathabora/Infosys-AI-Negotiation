import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

const THEME_STORAGE_KEY = "negomind_theme";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function getInitialTheme() {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    // Fallback: check legacy 'theme' key if present
    const legacy = localStorage.getItem("theme");
    if (legacy === "light" || legacy === "dark") {
      return legacy;
    }
  } catch (e) {
    console.warn("Could not read theme from localStorage:", e);
  }
  return "system";
}

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children, defaultTheme = "system" }) {
  const [theme, setThemeState] = useState(() => {
    const initial = getInitialTheme();
    return initial || defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // Compute resolvedTheme
  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      return systemTheme;
    }
    return theme === "light" ? "light" : "dark";
  }, [theme, systemTheme]);

  // Listen to system preference changes only when theme === 'system'
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Modern and backward-compatible event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Synchronize document classes and meta theme-color whenever resolvedTheme changes
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }

    // Update theme-color meta tag for mobile browsers and PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolvedTheme === "dark" ? "#0C0C0F" : "#F8FAFC"
      );
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark" && newTheme !== "system") return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Could not save theme to localStorage:", e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : current === "light" ? "system" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) {
        console.warn("Could not save theme to localStorage:", e);
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
