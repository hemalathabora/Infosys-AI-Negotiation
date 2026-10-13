import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  RotateCcw, 
  ArrowRightLeft, 
  Sparkles, 
  Activity, 
  User, 
  Building2 
} from "lucide-react";

/**
 * Format currency helper
 */
function formatCurrency(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return "—";
  return `$${Math.round(num).toLocaleString()}`;
}

/**
 * Tug-of-War Bargaining Zone Physics Slider
 * 
 * Styled to perfectly align with system design tokens:
 * - Theme: Dark Glassmorphic (#17161B, #201F25, #2D2C36, #14131A)
 * - Highlights: Emerald (#10B981) for ZOPA/Feasible, Rose (#F43F5E) for Vendor Floor, Sky (#38BDF8) for Buyer Ceiling
 */
export default function TugOfWarBargainingZone({
  scenario,
  negotiationState,
  onSimulateOffer = null,
  customVendorFloor = 40000,
  customBuyerCeiling = 50000,
  className = "",
}) {
  // 1. Determine Floor, Ceiling and bounds based on props/scenario
  const history = negotiationState?.history || [];
  const currentRound = negotiationState?.current_round || 1;

  // Extract scenario default bounds if available
  let initialFloor = customVendorFloor;
  let initialCeiling = customBuyerCeiling;

  if (scenario?.agents && Array.isArray(scenario.agents)) {
    const vendorAgent = scenario.agents.find(a => a.id === "vendor" || a.role?.toLowerCase().includes("vendor") || a.role?.toLowerCase().includes("seller") || a.role?.toLowerCase().includes("department"));
    const buyerAgent = scenario.agents.find(a => a.id === "buyer" || a.role?.toLowerCase().includes("buyer") || a.role?.toLowerCase().includes("candidate") || a.role?.toLowerCase().includes("employer") || a.role?.toLowerCase().includes("finance"));

    if (vendorAgent?.constraints?.[0]?.defaultValue) {
      initialFloor = Number(vendorAgent.constraints[0].defaultValue);
    }
    if (buyerAgent?.constraints?.[0]?.defaultValue) {
      initialCeiling = Number(buyerAgent.constraints[0].defaultValue);
    }
  }

  const [vendorFloor, setVendorFloor] = useState(initialFloor);
  const [buyerCeiling, setBuyerCeiling] = useState(initialCeiling);
  const [selectedTurnIdx, setSelectedTurnIdx] = useState(null);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [customTestPrice, setCustomTestPrice] = useState(null);
  const [isEditingBounds, setIsEditingBounds] = useState(false);

  // Sync state if scenario props change
  useEffect(() => {
    setVendorFloor(initialFloor);
    setBuyerCeiling(initialCeiling);
  }, [initialFloor, initialCeiling]);

  // Derive latest turn / offer details
  const activeTurnIndex = selectedTurnIdx !== null ? selectedTurnIdx : history.length - 1;
  const currentTurnData = history[activeTurnIndex] || null;

  // Determine current active offer price
  let activeOfferPrice = 45000; // Default midpoint fallback
  if (customTestPrice !== null && interactiveMode) {
    activeOfferPrice = customTestPrice;
  } else if (currentTurnData) {
    const rawVal = currentTurnData.proposed_offer ?? currentTurnData.value;
    const extracted = typeof rawVal === "object" ? (rawVal?.price ?? rawVal?.value) : rawVal;
    if (Number.isFinite(Number(extracted))) {
      activeOfferPrice = Number(extracted);
    }
  } else if (negotiationState?.current_offer) {
    const rawVal = negotiationState.current_offer;
    const extracted = typeof rawVal === "object" ? (rawVal?.price ?? rawVal?.value) : rawVal;
    if (Number.isFinite(Number(extracted))) {
      activeOfferPrice = Number(extracted);
    }
  }

  // Calculate track limits (pad 15% lower and higher for full scale view)
  const minScale = Math.min(vendorFloor, buyerCeiling) > 0 
    ? Math.floor(Math.min(vendorFloor, buyerCeiling) * 0.82) 
    : 30000;
  const maxScale = Math.max(vendorFloor, buyerCeiling) > 0 
    ? Math.ceil(Math.max(vendorFloor, buyerCeiling) * 1.18) 
    : 60000;
  const scaleRange = Math.max(1000, maxScale - minScale);

  // Helper to convert price to percentage (0% to 100%)
  const priceToPct = (price) => {
    const clamped = Math.max(minScale, Math.min(maxScale, price));
    return ((clamped - minScale) / scaleRange) * 100;
  };

  const vendorFloorPct = priceToPct(vendorFloor);
  const buyerCeilingPct = priceToPct(buyerCeiling);

  // Determine ZOPA bounds
  const zopaLeftPct = Math.min(vendorFloorPct, buyerCeilingPct);
  const zopaRightPct = Math.max(vendorFloorPct, buyerCeilingPct);
  const zopaWidthPct = Math.max(0, zopaRightPct - zopaLeftPct);
  const hasZopa = buyerCeiling >= vendorFloor;

  // Position of active offer marker
  const offerMarkerPct = priceToPct(activeOfferPrice);

  // Check if offer is inside ZOPA
  const isInsideZopa = hasZopa && activeOfferPrice >= Math.min(vendorFloor, buyerCeiling) && activeOfferPrice <= Math.max(vendorFloor, buyerCeiling);

  // -------------------------------------------------------------
  // CANVAS PARTICLE SYSTEM FOR OFFER MARKER TRAIL
  // -------------------------------------------------------------
  const canvasRef = useRef(null);
  const prevPosRef = useRef(offerMarkerPct);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 120);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Spawn particles around current marker x coordinate
    const targetX = (offerMarkerPct / 100) * width;
    const prevX = (prevPosRef.current / 100) * width;
    const isMoving = Math.abs(targetX - prevX) > 0.5;
    prevPosRef.current = offerMarkerPct;

    const particleColor = isInsideZopa ? "#10B981" : "#FACC15";
    const particleGlow = isInsideZopa ? "rgba(16, 185, 129, 0.8)" : "rgba(250, 204, 21, 0.8)";

    const spawnCount = isMoving ? 8 : 2;
    for (let i = 0; i < spawnCount; i++) {
      particlesRef.current.push({
        x: targetX + (Math.random() - 0.5) * 12,
        y: height / 2 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * (isMoving ? 2.5 : 1.0),
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        size: Math.random() * 3.5 + 2,
        alpha: 0.9,
        life: Math.random() * 0.03 + 0.02,
        color: particleColor,
        glow: particleGlow,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.life;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.glow;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [offerMarkerPct, isInsideZopa]);

  // Track click handler
  const trackRef = useRef(null);
  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = clickX / rect.width;
    const calculatedPrice = Math.round(minScale + pct * scaleRange);
    setInteractiveMode(true);
    setCustomTestPrice(calculatedPrice);
    if (onSimulateOffer) {
      onSimulateOffer(calculatedPrice);
    }
  };

  const handleTurnSelect = (idx) => {
    setInteractiveMode(false);
    setCustomTestPrice(null);
    setSelectedTurnIdx(idx === activeTurnIndex ? null : idx);
  };

  const handleResetTest = () => {
    setInteractiveMode(false);
    setCustomTestPrice(null);
    setSelectedTurnIdx(null);
  };

  // Determine active agent identity & role for icon theming
  const currentAgentId = currentTurnData?.agent_id || negotiationState?.current_agent_turn || "agent";
  const agentObj = scenario?.agents?.find(a => a.id === currentAgentId);
  const agentName = agentObj?.name || (currentAgentId === "buyer" ? "Buyer Agent" : currentAgentId === "vendor" ? "Vendor Agent" : currentAgentId);
  const isBuyerRole = currentAgentId === "buyer" || currentAgentId === "candidate" || currentAgentId === "employer";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-xl font-sans ${className}`}>
      
      {/* Subtle Dark Glassmorphic Ambient FX */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-rose-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* HEADER SECTION */}
      <div className="relative z-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#2D2C36] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              Negotiation Physics Engine
            </span>
            <span className="rounded-lg border border-[#302F39] bg-[#1A191E] px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-300">
              Live Bargaining Track
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
            Tug-of-War Bargaining Zone
          </h2>
          <p className="text-xs text-textSecondary font-body mt-0.5">
            Real-time physics track displaying Vendor Floor, Buyer Ceiling, ZOPA window, and offer dynamics.
          </p>
        </div>

        {/* Action Controls & Edit Bounds */}
        <div className="flex flex-wrap items-center gap-2">
          {interactiveMode && (
            <button
              type="button"
              onClick={handleResetTest}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-mono font-bold text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Interactive Probe
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditingBounds(!isEditingBounds)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-bold transition cursor-pointer ${
              isEditingBounds
                ? "border-sky-400 bg-sky-500/20 text-sky-200"
                : "border-[#302F39] bg-[#1A191E] text-slate-300 hover:bg-[#25242E]"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            {isEditingBounds ? "Close Bounds Editor" : "Adjust Bounds"}
          </button>
        </div>
      </div>

      {/* EDITABLE BOUNDS DRAWER */}
      {isEditingBounds && (
        <div className="relative z-10 mb-6 rounded-xl border border-sky-500/30 bg-[#1A191E] p-4 space-y-3 font-mono animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#2D2C36] pb-2">
            <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-sky-400" />
              Custom Negotiation Limit Anchors
            </h4>
            <span className="text-[11px] text-slate-400">Modify anchors to test dynamic ZOPA expansion or deadlock</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-rose-400 flex items-center justify-between">
                <span>Vendor Floor Limit (Red Anchor):</span>
                <span className="text-white font-extrabold">{formatCurrency(vendorFloor)}</span>
              </label>
              <input
                type="range"
                min="20000"
                max="90000"
                step="500"
                value={vendorFloor}
                onChange={(e) => setVendorFloor(Number(e.target.value))}
                className="w-full h-2 bg-rose-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
                <span>Buyer Ceiling Limit (Blue Anchor):</span>
                <span className="text-white font-extrabold">{formatCurrency(buyerCeiling)}</span>
              </label>
              <input
                type="range"
                min="20000"
                max="90000"
                step="500"
                value={buyerCeiling}
                onChange={(e) => setBuyerCeiling(Number(e.target.value))}
                className="w-full h-2 bg-sky-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TOP ANCHOR METRICS BADGES */}
      <div className="relative z-10 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        {/* Left Anchor Badge (Red) */}
        <div className="rounded-xl border border-rose-500/30 bg-[#1A191E] p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Vendor Floor Limit</p>
              <p className="text-base font-extrabold text-white">{formatCurrency(vendorFloor)}</p>
            </div>
          </div>
          <span className="rounded-lg bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
            Min Floor
          </span>
        </div>

        {/* Middle ZOPA Status Badge */}
        <div className={`rounded-xl border p-3.5 flex items-center justify-between shadow-sm transition-all ${
          isInsideZopa
            ? "border-emerald-500/30 bg-[#1A191E]"
            : "border-amber-500/30 bg-[#1A191E]"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold border ${
              isInsideZopa 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}>
              {isInsideZopa ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </div>
            <div>
              <p className={`text-[10px] uppercase font-bold tracking-wider ${isInsideZopa ? "text-emerald-400" : "text-amber-400"}`}>
                {isInsideZopa ? "ZOPA Active" : "Out of Bounds"}
              </p>
              <p className="text-base font-extrabold text-white">
                {hasZopa ? `${formatCurrency(Math.abs(buyerCeiling - vendorFloor))} Window` : "No ZOPA"}
              </p>
            </div>
          </div>
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
            isInsideZopa 
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
          }`}>
            {isInsideZopa ? "FEASIBLE" : "OUTSIDE ZOPA"}
          </span>
        </div>

        {/* Right Anchor Badge (Blue) */}
        <div className="rounded-xl border border-sky-500/30 bg-[#1A191E] p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Buyer Ceiling Limit</p>
              <p className="text-base font-extrabold text-white">{formatCurrency(buyerCeiling)}</p>
            </div>
          </div>
          <span className="rounded-lg bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/30">
            Max Budget
          </span>
        </div>
      </div>

      {/* =========================================================
          THE MAIN TUG-OF-WAR BARGAINING TRACK CONTAINER
      ========================================================== */}
      <div className="relative z-10 my-6 py-4">
        
        {/* TUG OF WAR TENSION ROPES VISUAL EFFECT */}
        <div className="relative mb-3 flex items-center justify-between px-1 text-[11px] font-mono font-bold text-slate-400">
          <div className="flex items-center gap-2 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>◄ VENDOR PULL (${vendorFloor.toLocaleString()})</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 font-extrabold bg-[#1A191E] px-3.5 py-1 rounded-xl border border-[#302F39]">
            <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>BARGAINING ZONE CONTINUUM</span>
          </div>

          <div className="flex items-center gap-2 text-sky-400">
            <span>BUYER PULL (${buyerCeiling.toLocaleString()}) ►</span>
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
          </div>
        </div>

        {/* TRACK MAIN BODY */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-14 w-full rounded-2xl border border-[#2D2C36] bg-[#14131A] shadow-inner cursor-crosshair overflow-visible select-none"
        >
          {/* Canvas for Particle Trail behind marker */}
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          />

          {/* Background Grid Ticks */}
          <div className="pointer-events-none absolute inset-0 flex justify-between px-4 opacity-15">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-full w-px bg-slate-300" />
            ))}
          </div>

          {/* GLOWING GREEN MIDDLE ZONE: ZOPA (Zone of Possible Agreement) */}
          {hasZopa && zopaWidthPct > 0 && (
            <div
              style={{
                left: `${zopaLeftPct}%`,
                width: `${zopaWidthPct}%`,
              }}
              className="absolute top-0 bottom-0 z-0 bg-gradient-to-r from-emerald-500/15 via-emerald-400/25 to-emerald-500/15 border-x-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] overflow-hidden transition-all duration-300"
            >
              {/* Shimmer animation diagonal lines inside ZOPA */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(16,185,129,0.12)_25%,transparent_25%,transparent_50%,rgba(16,185,129,0.12)_50%,rgba(16,185,129,0.12)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[pulse_3s_infinite]" />

              {/* ZOPA Label Badge centered in zone */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="rounded-lg bg-[#17161B]/90 px-3 py-1 font-mono text-[10px] font-extrabold tracking-widest text-emerald-400 border border-emerald-500/40 shadow-md uppercase">
                  ✨ ZOPA ({formatCurrency(vendorFloor)} – {formatCurrency(buyerCeiling)})
                </span>
              </div>
            </div>
          )}

          {/* LEFT ANCHOR (RED): Vendor Floor Limit */}
          <div
            style={{ left: `${vendorFloorPct}%` }}
            className="absolute top-0 bottom-0 z-20 w-1 bg-rose-500 shadow-[0_0_12px_#F43F5E] transition-all duration-300 pointer-events-none"
          >
            {/* Top Anchor Flag */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-lg bg-[#17161B] px-2 py-0.5 font-mono text-[9px] font-bold text-rose-400 shadow-md whitespace-nowrap flex items-center gap-1 border border-rose-500/40">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              Floor: {formatCurrency(vendorFloor)}
            </div>
            {/* Anchor Pin Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_12px_#F43F5E]" />
          </div>

          {/* RIGHT ANCHOR (BLUE): Buyer Ceiling Limit */}
          <div
            style={{ left: `${buyerCeilingPct}%` }}
            className="absolute top-0 bottom-0 z-20 w-1 bg-sky-500 shadow-[0_0_12px_#38BDF8] transition-all duration-300 pointer-events-none"
          >
            {/* Top Anchor Flag */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-lg bg-[#17161B] px-2 py-0.5 font-mono text-[9px] font-bold text-sky-400 shadow-md whitespace-nowrap flex items-center gap-1 border border-sky-500/40">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              Ceiling: {formatCurrency(buyerCeiling)}
            </div>
            {/* Anchor Pin Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-sky-500 border-2 border-white shadow-[0_0_12px_#38BDF8]" />
          </div>

          {/* ANIMATED THEMED OFFER MARKER NODE */}
          <div
            style={{
              left: `${offerMarkerPct}%`,
              transition: "left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            className="absolute top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            {/* Pulsing Outer Glow Ring */}
            <div
              className={`absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                isInsideZopa
                  ? "bg-emerald-500/20 animate-ping shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                  : "bg-amber-500/25 animate-ping shadow-[0_0_25px_rgba(245,158,11,0.5)]"
              }`}
            />

            {/* Glassmorphic Circle Node Matching System UI */}
            <div
              className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 bg-[#17161B] backdrop-blur-md shadow-2xl transition-all duration-300 ${
                isInsideZopa
                  ? "border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "border-amber-400 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              }`}
            >
              {isBuyerRole ? (
                <User className="h-5 w-5 font-bold" />
              ) : (
                <Building2 className="h-5 w-5 font-bold" />
              )}
            </div>

            {/* Marker Floating Tooltip Card Below */}
            <div
              className={`absolute top-13 left-1/2 -translate-x-1/2 rounded-xl border border-[#302F39] bg-[#17161B]/95 backdrop-blur-md p-3 font-mono shadow-2xl transition-all duration-300 whitespace-nowrap z-40 ${
                isInsideZopa
                  ? "border-emerald-500/40 text-emerald-300 shadow-[0_10px_30px_rgba(16,185,129,0.25)]"
                  : "border-amber-500/40 text-amber-300 shadow-[0_10px_30px_rgba(245,158,11,0.25)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2 w-2 rounded-full ${isInsideZopa ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {interactiveMode ? "Interactive Probe" : `Round ${currentTurnData?.round || currentRound} Offer`}
                </span>
                <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold border ${
                  isInsideZopa 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}>
                  {isInsideZopa ? "IN-ZOPA" : "OUTSIDE ZOPA"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-base font-extrabold text-white font-mono">
                  {formatCurrency(activeOfferPrice)}
                </p>
                <div className="text-[10px] text-slate-400 border-l border-[#302F39] pl-2 font-sans">
                  <span>Proposer: <strong className="text-white">{agentName}</strong></span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SCALE TICKS AND NUMERIC CONTINUUM LABELS */}
        <div className="mt-3 flex justify-between px-1 font-mono text-[10px] font-semibold text-slate-400">
          <span>{formatCurrency(minScale)}</span>
          <span>{formatCurrency(minScale + scaleRange * 0.25)}</span>
          <span className="text-slate-200 font-extrabold">{formatCurrency(minScale + scaleRange * 0.5)}</span>
          <span>{formatCurrency(minScale + scaleRange * 0.75)}</span>
          <span>{formatCurrency(maxScale)}</span>
        </div>
      </div>

      {/* TURN HISTORY STEPPER CONTROLS */}
      {history.length > 0 && (
        <div className="relative z-10 mt-5 border-t border-[#2D2C36] pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                Turn History Playback:
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold">
                {selectedTurnIdx !== null ? `Turn ${selectedTurnIdx + 1} of ${history.length}` : "Latest Live Turn"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono">
              {history.map((turn, idx) => {
                const turnPrice = turn.proposed_offer ?? turn.value;
                const priceNum = typeof turnPrice === "object" ? (turnPrice?.price ?? turnPrice?.value) : turnPrice;
                const turnInside = hasZopa && priceNum >= Math.min(vendorFloor, buyerCeiling) && priceNum <= Math.max(vendorFloor, buyerCeiling);
                const isSelected = activeTurnIndex === idx;

                return (
                  <button
                    key={`turn-btn-${idx}`}
                    type="button"
                    onClick={() => handleTurnSelect(idx)}
                    className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? turnInside
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md"
                          : "border-amber-500 bg-amber-500/20 text-amber-300 shadow-md"
                        : "border-[#302F39] bg-[#1A191E] text-slate-400 hover:bg-[#25242E]"
                    }`}
                  >
                    <span>R{turn.round}</span>
                    <span className="text-[9px] opacity-80">{formatCurrency(priceNum)}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedTurnIdx(null)}
                className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  selectedTurnIdx === null
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    : "border-[#302F39] bg-[#1A191E] text-slate-400 hover:bg-[#25242E]"
                }`}
              >
                Live Turn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
