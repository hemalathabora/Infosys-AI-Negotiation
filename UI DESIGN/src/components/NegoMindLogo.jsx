import React from "react";

export default function NegoMindLogo({
  size = 44,
  showWordmark = true,
  className = "",
  onNavigate
}) {
  const handleAction = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        handleAction("Dashboard");
      }}
      aria-label="NegoMind"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      {/* Logo */}
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-[5px]"
        style={{
          width: size,
          height: size,
          background: "#E8E3D8",
        }}
      >
        <svg
          width={size * 0.78}
          height={size * 0.78}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Left negotiating position */}
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

          {/* Right negotiating position */}
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

          {/* Central negotiation / agreement point */}
          <path
            d="
              M42 35
              L68 50
              L42 65
              Z
            "
            fill="#62858B"
          />

          {/* Small central negative-space cut */}
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

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className="whitespace-nowrap text-[13px] font-bold uppercase"
            style={{
              color: "#E8E3D8",
              letterSpacing: "0.19em",
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            NEGOMIND
          </span>

          <span
            className="mt-[5px] whitespace-nowrap text-[8px] font-medium uppercase"
            style={{
              color: "#777A74",
              letterSpacing: "0.18em",
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