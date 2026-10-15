import React from "react";

export default function NegoMindLogo({
  size = 44,
  showWordmark = true,
  className = "",
  onNavigate,
  onClick,
}) {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
      return;
    }
    if (onNavigate) {
      e.preventDefault();
      onNavigate("Dashboard");
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      aria-label="NegoMind - Negotiation Intelligence"
      className={`group inline-flex items-center gap-3 select-none ${className}`}
    >
      {/* 2nd Logo Mark: Cream faceted tile */}
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-[6px] shadow-sm transition-transform duration-200 group-hover:scale-[1.03]"
        style={{
          width: size,
          height: size,
          background: "#E8E3D8",
        }}
      >
        <svg
          width={size * 0.8}
          height={size * 0.8}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Left negotiating position - deep charcoal black */}
          <path
            d="
              M18 18
              L48 35
              L48 65
              L18 82
              Z
            "
            fill="#191A1C"
          />

          {/* Right negotiating position - muted olive/sage green */}
          <path
            d="
              M82 18
              L52 35
              L52 65
              L82 82
              Z
            "
            fill="#737B69"
          />

          {/* Central negotiation agreement point - teal outline triangle */}
          <path
            d="
              M42 35
              L68 50
              L42 65
              Z
            "
            fill="#62858B"
          />

          {/* Central negative space core cut */}
          <path
            d="
              M48 42
              L60 50
              L48 58
              Z
            "
            fill="#E8E3D8"
          />
        </svg>
      </div>

      {/* 2nd Logo Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className="whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.19em] text-textPrimary dark:text-[#E8E3D8] transition-colors"
            style={{
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            NEGOMIND
          </span>

          <span
            className="mt-[5px] whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.18em] text-textMuted dark:text-[#8E918B] transition-colors"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            NEGOTIATION INTELLIGENCE
          </span>
        </div>
      )}
    </a>
  );
}