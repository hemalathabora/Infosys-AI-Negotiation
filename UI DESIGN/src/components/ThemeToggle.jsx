import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const THEME_OPTIONS = [
  {
    id: "light",
    label: "Light",
    // description: "Clean, high-contrast daylight theme",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    // description: "Sleek, low-light enterprise theme",
    icon: Moon,
  },
  {
    id: "system",
    label: "System",
    // description: "Sync with your OS color preference",
    icon: Monitor,
  },
];

export default function ThemeToggle({ className = "", compact = false }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation & Escape to close
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleSelect = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  // Determine current active icon to display on the trigger button
  const ActiveIcon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;

  return (
    <div className={`relative inline-block text-left ${isOpen ? "z-50" : "z-20"} ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        id="theme-toggle-button"
        aria-label={`Current theme: ${theme} (${resolvedTheme} active). Click to choose theme.`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group inline-flex items-center justify-center rounded-xl border border-border bg-card text-textSecondary transition-all duration-200 hover:border-borderGlow hover:bg-cardAlt hover:text-textPrimary focus-visible:outline-2 focus-visible:outline-primaryBright active:scale-95 cursor-pointer shadow-sm ${
          compact ? "h-9 w-9 p-2" : "gap-2 px-3 py-1.5 text-xs font-semibold"
        }`}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (${resolvedTheme})`}
      >
        <ActiveIcon
          className={`h-4 w-4 transition-transform duration-300 group-hover:rotate-12 ${
            resolvedTheme === "dark" ? "text-amber-400" : "text-amber-500"
          }`}
          aria-hidden="true"
        />

        {!compact && (
          <span className="hidden capitalize sm:inline-block font-sans font-medium text-textPrimary">
            {theme}
          </span>
        )}

        <svg
          className={`h-3 w-3 text-textMuted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${compact ? "hidden" : "inline-block"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-toggle-button"
          className="absolute right-0 top-full mt-2 z-50 w-52 origin-top-right rounded-2xl border border-border bg-card p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-textMuted">
              Appearance
            </p>
            <p className="text-xs font-semibold text-textPrimary">
              Active: <span className="text-primaryBright capitalize">{resolvedTheme}</span>
            </p>
          </div>

          <div className="space-y-0.5">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-primaryBright/10 font-bold text-primaryBright"
                      : "text-textSecondary hover:bg-cardAlt hover:text-textPrimary"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                        isSelected
                          ? "bg-primaryBright/20 text-primaryBright"
                          : "bg-cardAlt text-textMuted group-hover:text-textPrimary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold leading-tight">{option.label}</p>
                      <p className="text-[10px] text-textMuted truncate font-normal">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-primaryBright ml-2" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
