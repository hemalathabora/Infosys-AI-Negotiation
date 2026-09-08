import { useState, useEffect, useRef } from "react";

// Greeting sequence with native scripts and matching fonts
const GREETINGS = [
  // { text: "Hello", lang: "en", fontFamily: "'Inter', system-ui, sans-serif" },
  { text: "Namaste", lang: "hi", fontFamily: "'Inter', system-ui, sans-serif" },
  { text: "নমস্কার", lang: "bn", fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" },
  { text: "નમસ્તે", lang: "gu", fontFamily: "'Noto Sans Gujarati', 'Inter', sans-serif" },
  { text: "நமஸ்காரம்", lang: "ta", fontFamily: "'Noto Sans Tamil', 'Inter', sans-serif" },
  { text: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", lang: "pa", fontFamily: "'Noto Sans Gurmukhi', 'Inter', sans-serif" },
  { text: "Hello", lang: "en", fontFamily: "'Inter', system-ui, sans-serif" },
];

/**
 * Easing function for smooth organic movement
 */
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export default function CinematicLoader({ onComplete, autoPlay = true }) {
  // Phase management:
  // 0: Greeting sequence on pure white screen (0.0s – 2.4s)
  // 1: Curved wipe white -> black (2.4s – 3.2s)
  // 2: Short black screen pause (3.2s – 3.8s)
  // 3: Fade out overlay & reveal landing page (3.8s – 4.4s+)
  const [phase, setPhase] = useState(0);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [wipeProgress, setWipeProgress] = useState(0); // 0 to 1 for black wipe
  const [loaderOpacity, setLoaderOpacity] = useState(1);
  const [isRevealed, setIsRevealed] = useState(false);

  const startTimeRef = useRef(null);
  const requestRef = useRef(null);

  // Restart sequence function
  const runSequence = () => {
    setPhase(0);
    setGreetingIndex(0);
    setGreetingVisible(true);
    setWipeProgress(0);
    setLoaderOpacity(1);
    setIsRevealed(false);
    startTimeRef.current = performance.now();
  };

  useEffect(() => {
    if (!autoPlay) return;

    startTimeRef.current = performance.now();

    const animate = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000; // time in seconds

      // ----------------------------------------------------
      // PHASE 0: Greeting Sequence on White (0.0s – 2.4s)
      // Starts directly on a white screen with "Hello"
      // ----------------------------------------------------
      if (elapsed < 2.4) {
        setPhase(0);
        setWipeProgress(0);

        const totalGreetings = GREETINGS.length; // 7 greetings
        const stepDuration = 2.4 / totalGreetings; // ~0.342s per greeting

        const currentIndex = Math.min(
          Math.floor(elapsed / stepDuration),
          totalGreetings - 1
        );

        const timeInCurrentGreeting = elapsed % stepDuration;

        // Subtle opacity fade near transition boundaries
        const fadeMargin = 0.05; // 50ms fade
        if (
          timeInCurrentGreeting < fadeMargin ||
          timeInCurrentGreeting > stepDuration - fadeMargin
        ) {
          setGreetingVisible(false);
        } else {
          setGreetingVisible(true);
        }

        setGreetingIndex(currentIndex);
      }
      // ----------------------------------------------------
      // PHASE 1: Curved Wipe White -> Black (2.4s – 3.2s)
      // ----------------------------------------------------
      else if (elapsed >= 2.4 && elapsed < 3.2) {
        setPhase(1);
        const wipeTime = (elapsed - 2.4) / 0.8; // 0.8s duration
        const clampedWipe = Math.min(Math.max(wipeTime, 0), 1);
        setWipeProgress(easeInOutCubic(clampedWipe));
      }
      // ----------------------------------------------------
      // PHASE 2: Short Black Screen Pause (3.2s – 3.8s)
      // ----------------------------------------------------
      else if (elapsed >= 3.2 && elapsed < 3.8) {
        setPhase(2);
        setWipeProgress(1);
        setLoaderOpacity(1);
      }
      // ----------------------------------------------------
      // PHASE 3: Reveal Landing Page (3.8s+)
      // ----------------------------------------------------
      else {
        setPhase(3);
        const fadeOutTime = (elapsed - 3.8) / 0.6; // 0.6s fade out
        if (fadeOutTime < 1) {
          setLoaderOpacity(1 - fadeOutTime);
        } else {
          setLoaderOpacity(0);
          setIsRevealed(true);
          if (onComplete) onComplete();
          return; // Stop animation loop
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [autoPlay, onComplete]);

  // If fully revealed, return null so overlay doesn't block interactions
  if (isRevealed) {
    return null;
  }

  // --------------------------------------------------------
  // SVG Curved Path Construction (Concave Arc Wipe)
  // --------------------------------------------------------
  // ViewBox: 0 0 1000 1000
  const createCurvedPath = (progress) => {
    // progress: 0 to 1
    // edgeY moves from 1100 (below view) to -400 (above view)
    const edgeY = 1100 - progress * 1500;
    // Curve depth sag in middle: creates a deep organic concave arc
    const maxSag = 260;
    const curveSag = maxSag * Math.sin(progress * Math.PI);
    const controlY = edgeY + curveSag;

    return `M 0 1000 L 1000 1000 L 1000 ${edgeY} C 700 ${controlY}, 300 ${controlY}, 0 ${edgeY} Z`;
  };

  const blackWipePath = createCurvedPath(wipeProgress);
  const currentGreeting = GREETINGS[greetingIndex] || GREETINGS[0];

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden select-none pointer-events-auto"
      style={{
        opacity: loaderOpacity,
        transition: phase === 3 ? "none" : undefined,
      }}
      data-testid="cinematic-loader"
    >
      {/* 1. Base Layer: Pure White #FFFFFF */}
      <div className="absolute inset-0 bg-white" />

      {/* 2. Centered Typography Greeting Sequence (On White Screen) */}
      {phase === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="px-6 text-center">
            <span
              key={greetingIndex}
              className={`
                inline-block text-[#101010] text-3xl md:text-5xl lg:text-[54px]
                font-medium tracking-tight text-center
                transition-all duration-200 ease-out
                ${
                  greetingVisible
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-[0.97] translate-y-[2px]"
                }
              `}
              style={{
                fontFamily: currentGreeting.fontFamily,
                willChange: "transform, opacity",
              }}
            >
              {currentGreeting.text}
            </span>
          </div>
        </div>
      )}

      {/* 3. Curved Black Wipe SVG Layer (White to Black Transition) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path d={blackWipePath} fill="#101010" />
      </svg>

      {/* Hidden button for accessibility/testing trigger if needed */}
      <button
        onClick={runSequence}
        tabIndex={-1}
        className="sr-only"
        aria-label="Replay intro animation"
      />
    </div>
  );
}
