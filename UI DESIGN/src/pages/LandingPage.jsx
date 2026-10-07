import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import NegoMindLogo from "../components/NegoMindLogo";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Method", href: "#method" },
  { label: "Practice", href: "#practice" },
  { label: "About", href: "#about" },
];

const photos = {
  hero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=85",
  meeting:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85",
  detail:
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85",
  workspace:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=85",
  portrait:
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85",
};

function Logo() {
  return <NegoMindLogo size={42} />;
}

function Arrow({ className = "" }) {
  return (
    <span className={`inline-block text-lg leading-none ${className}`}>↗</span>
  );
}

function PrimaryButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-4 border border-[#E8E3D8] bg-[#E8E3D8] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#191A1C] transition-all duration-300 hover:bg-[#FFFFFF] active:translate-y-px ${className}`}
    >
      {children}
      <Arrow className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </button>
  );
}

function TextButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-3 border-b border-[#8E8B83]/50 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D8D3C8] transition-colors duration-300 hover:border-[#E8E3D8] hover:text-[#E8E3D8] ${className}`}
    >
      {children}
      <Arrow className="text-base transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </button>
  );
}

function SectionLabel({ children, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-px w-8 ${
          light ? "bg-[#403F3C]" : "bg-[#878377]"
        }`}
      />
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
          light ? "text-[#8D8A82]" : "text-[#69665F]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative overflow-hidden border border-[#4B4A45] bg-[#1F2022] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <div className="flex h-10 items-center justify-between border-b border-[#3A3B3D] px-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#9AA18A]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#9B9C96]">
            Live negotiation
          </span>
        </div>

        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#737570]">
          Session 024
        </span>
      </div>

      <div className="grid min-h-[390px] grid-cols-[1fr_220px]">
        <div className="border-r border-[#3A3B3D] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7F817A]">
                Enterprise vendor renewal
              </p>
              <h3 className="mt-2 max-w-md font-serif text-2xl leading-tight text-[#F1EEE6]">
                A negotiation in motion.
              </h3>
            </div>

            <span className="border border-[#737B69]/50 bg-[#737B69]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#B8C0A7]">
              Round 06
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="border border-[#4C5363] bg-[#26282E] p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#858995]">
                Party A
              </p>
              <p className="mt-5 text-sm font-semibold text-[#E9E7E0]">
                Alex Morgan
              </p>
              <p className="mt-1 text-[10px] text-[#898B91]">
                Procurement lead
              </p>
              <p className="mt-6 font-mono text-2xl font-bold text-[#AEB9D3]">
                $48k
              </p>
            </div>

            <div className="border border-[#566357] bg-[#252A27] p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#87948A]">
                Party B
              </p>
              <p className="mt-5 text-sm font-semibold text-[#E9E7E0]">
                Daniel Carter
              </p>
              <p className="mt-1 text-[10px] text-[#89928C]">
                Vendor representative
              </p>
              <p className="mt-6 font-mono text-2xl font-bold text-[#B9C8B5]">
                $52k
              </p>
            </div>
          </div>

          <div className="mt-5 border border-[#3D4145] bg-[#242629] p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#858880]">
                Bid / ask convergence
              </p>
              <p className="font-mono text-xs text-[#B9C8B5]">72%</p>
            </div>

            <div className="mt-4 h-1.5 bg-[#111315]">
              <div className="h-full w-[72%] bg-[#9FAA91]" />
            </div>

            <div className="mt-4 flex justify-between font-mono text-[9px] text-[#747871]">
              <span>Concession velocity: stable</span>
              <span>Gap: $4,000</span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-[#3A3B3D] pt-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#747871]">
                Agreement probability
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#C4CDBD]">
                86.4%
              </p>
            </div>

            <div className="text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#747871]">
                Current status
              </p>
              <p className="mt-1 text-xs font-semibold text-[#C4CDBD]">
                Agreement zone detected
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#242528] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#858880]">
            Decision log
          </p>

          <div className="mt-5 space-y-5">
            {[
              ["01", "Initial position", "Opening ask submitted"],
              ["04", "Concession movement", "Boundary tested"],
              ["06", "Agreement zone", "High probability"],
            ].map(([number, title, detail]) => (
              <div key={number} className="relative pl-8">
                <span className="absolute left-0 top-0 font-mono text-[10px] text-[#9FAA91]">
                  {number}
                </span>
                <p className="text-xs font-semibold text-[#E1DED5]">{title}</p>
                <p className="mt-1 text-[10px] leading-5 text-[#858880]">
                  {detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-[#3A3B3D] pt-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#858880]">
              Concession velocity
            </p>

            <div className="mt-5 flex h-24 items-end gap-2">
              {[26, 36, 32, 52, 48, 67, 72, 86].map((height, index) => (
                <span
                  key={index}
                  className={`flex-1 ${
                    index === 7 ? "bg-[#B6C3A9]" : "bg-[#656F63]"
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage({ onNavigate }) {
  const navigate = onNavigate || (() => {});
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Simulation");

  const handleAction = (targetPage) => {
    if (isAuthenticated) {
      navigate(targetPage);
    } else {
      navigate("AuthPage");
    }
  };

  return (
    <main
      id="top"
      className="min-h-screen overflow-hidden bg-[#191A1C] text-[#E8E3D8]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');

        :root {
          font-family: "DM Sans", sans-serif;
        }

        .font-serif {
          font-family: "Fraunces", Georgia, serif;
        }

        .font-mono {
          font-family: "DM Mono", monospace;
        }

        .editorial-grain {
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px);
          background-size: 5px 5px;
        }

        .image-shift {
          transition: transform 900ms cubic-bezier(.2,.7,.2,1), filter 900ms ease;
        }

        .image-shift:hover {
          transform: scale(1.035);
          filter: saturate(1.08) contrast(1.04);
        }

        @keyframes editorialReveal {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .editorial-reveal {
          animation: editorialReveal 900ms cubic-bezier(.2,.7,.2,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>



      <section className="relative min-h-[760px] border-b border-[#3B3B39] bg-[#242526]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={photos.hero}
            alt="A quiet modern workspace prepared for a negotiation"
            className="image-shift h-full w-full object-cover opacity-35 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#191A1C] via-[#191A1C]/85 to-[#191A1C]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191A1C] via-transparent to-[#191A1C]/30" />
        </div>

        <div className="relative mx-auto flex min-h-[760px] max-w-[1500px] items-end px-5 pb-14 pt-24 sm:px-8 lg:px-12 lg:pb-20">
          <div className="grid w-full gap-12 lg:grid-cols-[1fr_0.45fr] lg:items-end">
            <div className="max-w-4xl editorial-reveal">
              <SectionLabel light>Negotiation intelligence infrastructure</SectionLabel>

              <h1 className="mt-7 max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.055em] text-[#F1EEE6] sm:text-7xl lg:text-[8.2rem]">
                Make the next move with clarity.
              </h1>

              <div className="mt-9 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
                <p className="max-w-xl text-base leading-8 text-[#B5B3AC] sm:text-lg">
                  NegoMind gives teams a realistic environment to configure,
                  practice, and understand complex negotiations before the
                  outcome is on the line.
                </p>

                <div className="flex flex-col items-start gap-5">
                  <PrimaryButton onClick={() => handleAction("Configure Agents")}>
                    Build a negotiation
                  </PrimaryButton>

                  <TextButton onClick={() => handleAction("Dashboard")}>
                    Explore the workspace
                  </TextButton>
                </div>
              </div>
            </div>

            <div className="hidden border-l border-[#D7D1C5]/30 pl-6 lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#AAA79E]">
                A working system for
              </p>

              <div className="mt-5 space-y-3">
                {["Procurement", "Revenue teams", "Commercial strategy"].map(
                  (item) => (
                    <p
                      key={item}
                      className="font-serif text-2xl text-[#D7D1C5]"
                    >
                      {item}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#D7D1C5]/20">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#96938B]">
              01 / The workspace
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#96938B]">
              Scroll to explore ↓
            </span>
          </div>
        </div>
      </section>

      <section className="border-b border-[#D7D1C5]/20 bg-[#E8E3D8] text-[#1D1E20]">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.55fr_1fr] lg:px-12 lg:py-24">
          <div>
            <SectionLabel>What changes</SectionLabel>
          </div>

          <div>
            <h2 className="max-w-4xl font-serif text-4xl leading-[1.02] tracking-[-0.045em] sm:text-6xl">
              Better preparation creates better leverage.
            </h2>

            <div className="mt-12 grid gap-10 border-t border-[#A9A49A] pt-8 sm:grid-cols-3">
              {[
                ["01", "Prepare", "Model the people, pressure, and boundaries before the first conversation."],
                ["02", "Practice", "Run the difficult version of the conversation without real-world cost."],
                ["03", "Learn", "Review the movement behind each decision and carry it forward."],
              ].map(([number, title, body]) => (
                <div key={number}>
                  <p className="font-mono text-[10px] text-[#77736B]">{number}</p>
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#68655E]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="border-b border-[#3B3B39] bg-[#191A1C]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.42fr_1fr] lg:items-end">
            <div>
              <SectionLabel light>The product</SectionLabel>
              <h2 className="mt-6 max-w-md font-serif text-4xl leading-[0.98] tracking-[-0.04em] text-[#F1EEE6] sm:text-5xl">
                A clear view of the room before you enter it.
              </h2>
            </div>

            <p className="max-w-xl text-base leading-8 text-[#96938B]">
              Every session is designed to feel close to the work: visible
              positions, real constraints, evolving pressure, and a record of
              how the conversation moved.
            </p>
          </div>

          <div className="mt-14 lg:pl-[18%]">
            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-[#3B3B39] bg-[#222426]">
        <div className="grid min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[420px] overflow-hidden">
            <img
              src={photos.meeting}
              alt="Professionals discussing a business decision around a table"
              loading="lazy"
              className="image-shift h-full w-full object-cover grayscale-[20%]"
            />
            <div className="absolute inset-0 bg-[#202224]/25 mix-blend-multiply" />
            <div className="absolute bottom-6 left-6 border border-[#E8E3D8]/40 bg-[#191A1C]/70 px-4 py-3 backdrop-blur-sm sm:bottom-10 sm:left-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#BFBAB0]">
                Real-world practice
              </p>
            </div>
          </div>

          <div className="flex items-center px-5 py-16 sm:px-10 lg:px-20">
            <div className="max-w-2xl">
              <SectionLabel light>Practice under pressure</SectionLabel>

              <h2 className="mt-7 font-serif text-4xl leading-[0.98] tracking-[-0.045em] text-[#F1EEE6] sm:text-6xl">
                The room is easier when you have already been in it.
              </h2>

              <p className="mt-7 max-w-xl text-base leading-8 text-[#A8A69E]">
                Move from abstract roleplay to structured rehearsal. Test
                opening positions, hold boundaries, explore concessions, and
                see how the other side responds.
              </p>

              <div className="mt-10 grid gap-5 border-t border-[#575957] pt-6 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#898B85]">
                    Human practice
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#D7D3C9]">
                    Take the seat of one party and practice the conversation
                    against a responsive agent.
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#898B85]">
                    AI simulation
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#D7D3C9]">
                    Watch both parties negotiate to study patterns, pressure,
                    and settlement behavior.
                  </p>
                </div>
              </div>

              <div className="mt-9">
                <TextButton onClick={() => handleAction("Configure Agents")}>
                  Configure your first scenario
                </TextButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="method" className="border-b border-[#3B3B39] bg-[#E8E3D8] text-[#1D1E20]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.5fr_1fr]">
            <div>
              <SectionLabel>How it works</SectionLabel>
              <p className="mt-7 max-w-xs font-serif text-3xl leading-tight tracking-[-0.03em]">
                Designed around the decisions that shape the outcome.
              </p>
            </div>

            <div className="divide-y divide-[#A9A49A] border-y border-[#A9A49A]">
              {[
                [
                  "01",
                  "Define the situation",
                  "Set the scenario, stakes, parties, objectives, and non-negotiables.",
                ],
                [
                  "02",
                  "Tune the participants",
                  "Give each agent a point of view, behavioral policy, and room to move.",
                ],
                [
                  "03",
                  "Run the conversation",
                  "Move through each round and observe how positions change under pressure.",
                ],
                [
                  "04",
                  "Review the record",
                  "Use the resulting data to understand the quality of each decision.",
                ],
              ].map(([number, title, body]) => (
                <div
                  key={number}
                  className="grid gap-5 py-7 sm:grid-cols-[70px_0.8fr_1fr] sm:items-start"
                >
                  <span className="font-mono text-xs text-[#77736B]">{number}</span>
                  <h3 className="font-serif text-2xl tracking-[-0.02em]">{title}</h3>
                  <p className="max-w-sm text-sm leading-7 text-[#68655E]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="practice" className="border-b border-[#3B3B39] bg-[#191A1C]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.58fr] lg:items-center">
            <div className="relative">
              <div className="absolute -left-8 top-12 hidden h-40 w-40 border border-[#7F887A]/30 lg:block" />

              <div className="relative overflow-hidden border border-[#494A46]">
                <img
                  src={photos.detail}
                  alt="Architectural workspace detail with natural light"
                  loading="lazy"
                  className="image-shift h-[540px] w-full object-cover grayscale-[15%]"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#191A1C]/80 to-transparent p-6">
                  <p className="max-w-xs font-serif text-3xl leading-tight text-[#F1EEE6]">
                    Understand the movement, not just the result.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel light>Decision intelligence</SectionLabel>

              <h2 className="mt-7 max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.045em] text-[#F1EEE6] sm:text-6xl">
                Every concession tells you something.
              </h2>

              <p className="mt-7 max-w-lg text-base leading-8 text-[#96938B]">
                NegoMind captures the details most teams lose after the call:
                who moved, when they moved, what changed the pressure, and
                whether the final agreement was actually strong.
              </p>

              <div className="mt-10 space-y-4 border-t border-[#41423F] pt-6">
                {[
                  ["Concession velocity", "See whether movement is accelerating or stalling."],
                  ["Boundary tracking", "Know how much room remains before a position breaks."],
                  ["Settlement quality", "Compare the final agreement to the original objectives."],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="grid gap-3 border-b border-[#363735] pb-4 sm:grid-cols-[190px_1fr]"
                  >
                    <p className="text-sm font-semibold text-[#D9D5CA]">{title}</p>
                    <p className="text-sm leading-6 text-[#888A84]">{body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <TextButton onClick={() => handleAction("Analytics")}>
                  See the analytics layer
                </TextButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-[#3B3B39] bg-[#242526]">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.65fr_1fr] lg:items-center lg:px-12 lg:py-28">
          <div>
            <SectionLabel light>Built for the work</SectionLabel>

            <blockquote className="mt-7 max-w-xl font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-[#F1EEE6] sm:text-6xl">
              “Preparation is not a script. It is a way of seeing.”
            </blockquote>

            <p className="mt-8 max-w-md text-sm leading-7 text-[#96938B]">
              A focused workspace for teams who treat negotiation as a craft:
              observable, repeatable, and worth improving.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[420px] overflow-hidden border border-[#4B4C48]">
              <img
                src={photos.workspace}
                alt="Bright modern office interior"
                loading="lazy"
                className="image-shift h-full w-full object-cover grayscale-[25%]"
              />
            </div>

            <div className="grid gap-4 sm:grid-rows-[1fr_auto]">
              <div className="relative min-h-[250px] overflow-hidden border border-[#4B4C48]">
                <img
                  src={photos.portrait}
                  alt="Professionals working together in a meeting"
                  loading="lazy"
                  className="image-shift h-full w-full object-cover grayscale-[25%]"
                />
              </div>

              <div className="border border-[#4B4C48] bg-[#1D1E20] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9AA18A]">
                  System status
                </p>
                <p className="mt-3 font-serif text-3xl text-[#E8E3D8]">
                  Operational
                </p>
                <p className="mt-3 text-sm leading-6 text-[#858880]">
                  Clear data. Calm decisions. Better conversations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#3B3B39] bg-[#191A1C]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <SectionLabel light>Inside the workspace</SectionLabel>
              <h2 className="mt-7 max-w-md font-serif text-4xl leading-[0.98] tracking-[-0.045em] text-[#F1EEE6] sm:text-6xl">
                See the conversation from more than one angle.
              </h2>
            </div>

            <div>
              <div className="flex flex-wrap gap-3 border-b border-[#3D3E3B] pb-5">
                {["Simulation", "Practice", "Insights"].map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`border-b pb-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                      activeTab === tab
                        ? "border-[#E8E3D8] text-[#E8E3D8]"
                        : "border-transparent text-[#777A74] hover:text-[#D8D3C8]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-[0.7fr_1fr]">
                <div className="border border-[#41423F] bg-[#202123] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#858880]">
                    Current view
                  </p>

                  <h3 className="mt-5 font-serif text-3xl text-[#F1EEE6]">
                    {activeTab === "Simulation"
                      ? "Two agents. One moving deal."
                      : activeTab === "Practice"
                      ? "Your position. Their response."
                      : "The pattern behind the outcome."}
                  </h3>

                  <p className="mt-5 text-sm leading-7 text-[#999B94]">
                    {activeTab === "Simulation"
                      ? "Observe both parties respond to objectives, pressure, and changing boundaries."
                      : activeTab === "Practice"
                      ? "Take the seat of one party and test the decisions you would make in the room."
                      : "Review the signals that reveal momentum, risk, and agreement quality."}
                  </p>
                </div>

                <div className="border border-[#41423F] bg-[#252628] p-5">
                  <div className="flex items-center justify-between border-b border-[#41423F] pb-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#858880]">
                      {activeTab} / live view
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#AAB79D]" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      ["Position", "$48,000 → $50,000", "moving"],
                      ["Concession velocity", "stable", "measured"],
                      ["Agreement zone", "within 2 rounds", "likely"],
                    ].map(([label, value, status]) => (
                      <div
                        key={label}
                        className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#3B3C39] pb-3"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#DAD6CD]">{label}</p>
                          <p className="mt-1 font-mono text-[10px] text-[#868981]">
                            {value}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#AAB79D]">
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#E8E3D8] text-[#1D1E20]">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.55fr] lg:items-end lg:px-12 lg:py-28">
          <div>
            <SectionLabel>Begin with the next conversation</SectionLabel>

            <h2 className="mt-7 max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.055em] sm:text-7xl">
              Better outcomes start before the meeting.
            </h2>
          </div>

          <div>
            <p className="text-base leading-8 text-[#68655E]">
              Build a scenario, configure the people involved, and give your
              team a place to practice the decisions that matter.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => handleAction("Configure Agents")}
                className="group inline-flex items-center gap-4 border border-[#1D1E20] bg-[#1D1E20] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8E3D8] transition hover:bg-[#303133]"
              >
                Launch your first negotiation
                <Arrow className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#191A1C]">
        <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid gap-10 border-b border-[#3B3B39] pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
            <div>
              <Logo />
              <p className="mt-6 max-w-xs text-sm leading-7 text-[#858880]">
                Intelligent negotiation infrastructure for better preparation,
                sharper decisions, and stronger outcomes.
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858880]">
                Product
              </p>
              <div className="mt-5 space-y-3 text-sm text-[#B3B0A7]">
                <a href="#product" className="block transition hover:text-[#E8E3D8]">Workspace</a>
                <a href="#method" className="block transition hover:text-[#E8E3D8]">Method</a>
                <a href="#practice" className="block transition hover:text-[#E8E3D8]">Practice</a>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858880]">
                Company
              </p>
              <div className="mt-5 space-y-3 text-sm text-[#B3B0A7]">
                <a href="#about" className="block transition hover:text-[#E8E3D8]">About</a>
                <a href="#" className="block transition hover:text-[#E8E3D8]">Contact</a>
                <a href="#" className="block transition hover:text-[#E8E3D8]">Journal</a>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858880]">
                Legal
              </p>
              <div className="mt-5 space-y-3 text-sm text-[#B3B0A7]">
                <a href="#" className="block transition hover:text-[#E8E3D8]">Privacy</a>
                <a href="#" className="block transition hover:text-[#E8E3D8]">Terms</a>
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#858880]">
                  System operational
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-xs text-[#777A74] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} NegoMind Ai. All rights reserved.
            </p>
            <p className="font-mono uppercase tracking-[0.16em]">
              Think / Negotiate / Grow
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;