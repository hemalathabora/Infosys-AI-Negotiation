import React from "react";
import { useAuth } from "../context/AuthContext";
import NegoMindLogo from "../components/NegoMindLogo";

const photos = {
  hero:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2200&q=85",
  workspace:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=85",
  detail:
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85",
  portrait:
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85",
};

function Arrow({ className = "" }) {
  return (
    <span className={`inline-block text-lg leading-none ${className}`}>
      ↗
    </span>
  );
}

function Logo() {
  return <NegoMindLogo size={42} />;
}

function SectionLabel({ children, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-px w-8 ${light ? "bg-[#403F3C]" : "bg-[#878377]"
          }`}
      />

      <span
        className={`font-mono text-[10px] uppercase tracking-[0.22em] ${light ? "text-[#8D8A82]" : "text-[#69665F]"
          }`}
      >
        {children}
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center justify-center gap-4 border border-[#E8E3D8] bg-[#E8E3D8] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#191A1C] transition-all duration-300 hover:bg-white active:translate-y-px"
    >
      {children}
      <Arrow className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </button>
  );
}

function TextButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-3 border-b border-[#8E8B83]/50 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D8D3C8] transition-colors duration-300 hover:border-[#E8E3D8] hover:text-[#E8E3D8]"
    >
      {children}
      <Arrow className="text-base transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </button>
  );
}

function AboutPage({ onNavigate }) {
  const navigate = onNavigate || (() => { });
  const { isAuthenticated } = useAuth();

  const handleAction = (targetPage) => {
    if (isAuthenticated) {
      navigate(targetPage);
    } else {
      navigate("AuthPage");
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#191A1C] text-[#E8E3D8]">
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

        .image-shift {
          transition:
            transform 900ms cubic-bezier(.2,.7,.2,1),
            filter 900ms ease;
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

      {/* Hero */}
      <section className="relative min-h-[720px] border-b border-[#3B3B39] bg-[#242526]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={photos.hero}
            alt="A team collaborating around a table"
            className="image-shift h-full w-full object-cover opacity-30 grayscale mix-blend-luminosity"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#191A1C] via-[#191A1C]/90 to-[#191A1C]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191A1C] via-transparent to-[#191A1C]/30" />
        </div>

        <div className="relative mx-auto flex min-h-[720px] max-w-[1500px] items-end px-5 pb-16 pt-24 sm:px-8 lg:px-12 lg:pb-24">
          <div className="grid w-full gap-12 lg:grid-cols-[1fr_0.45fr] lg:items-end">
            <div className="max-w-5xl editorial-reveal">
              <SectionLabel light>About NegoMind</SectionLabel>

              <h1 className="mt-7 max-w-5xl font-serif text-5xl leading-[0.92] tracking-[-0.055em] text-[#F1EEE6] sm:text-7xl lg:text-[8.2rem]">
                Better conversations begin with better preparation.
              </h1>

              <p className="mt-9 max-w-2xl text-base leading-8 text-[#B5B3AC] sm:text-lg">
                NegoMind is building the intelligence layer for negotiation:
                a focused environment where teams can prepare, practice, and
                learn before the outcome is on the line.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-6">
                <PrimaryButton onClick={() => handleAction("Configure Agents")}>
                  Start preparing
                </PrimaryButton>

                <TextButton onClick={() => navigate("LandingPage")}>
                  Explore the workspace
                </TextButton>
              </div>
            </div>

            <div className="hidden border-l border-[#D7D1C5]/30 pl-6 lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#AAA79E]">
                What we believe
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "Clarity over noise",
                  "Practice over theory",
                  "Progress over perfection",
                ].map((item) => (
                  <p
                    key={item}
                    className="font-serif text-2xl text-[#D7D1C5]"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#D7D1C5]/20">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#96938B]">
              01 / Our point of view
            </span>

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#96938B]">
              About the company ↓
            </span>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b border-[#D7D1C5]/20 bg-[#102E28] text-white">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.5fr_1fr] lg:px-12 lg:py-28">
          <div className="text-white">
            <SectionLabel>Our mission</SectionLabel>
          </div>

          <div>
            <h2 className="max-w-5xl font-serif text-4xl leading-[1.02] tracking-[-0.045em] sm:text-6xl">
              We help people make clearer decisions in the conversations that
              matter most.
            </h2>

            <div className="mt-12 grid gap-10 border-t border-[#A9A49A] pt-8 sm:grid-cols-3">
              {[
                [
                  "01",
                  "Make it visible",
                  "Turn hidden positions, pressure, and movement into something teams can understand.",
                ],
                [
                  "02",
                  "Make it practical",
                  "Create a realistic place to rehearse decisions before real-world consequences arrive.",
                ],
                [
                  "03",
                  "Make it better",
                  "Transform every conversation into insight that improves the next one.",
                ],
              ].map(([number, title, body]) => (
                <div key={number}>
                  <p className="font-mono text-[10px] text-[#fffff]">
                    {number}
                  </p>

                  <h3 className="mt-5 text-xl font-semibold text-[#724133]">{title}</h3>

                  <p className="mt-3 text-sm leading-7 text-white">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="border-b border-[#3B3B39] bg-[#191A1C]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1fr] lg:items-center">
            <div className="relative overflow-hidden border border-[#494A46]">
              <img
                src={photos.workspace}
                alt="Modern workspace with natural light"
                loading="lazy"
                className="image-shift h-[560px] w-full object-cover grayscale-[20%]"
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#191A1C]/90 to-transparent p-7">
                <p className="max-w-sm font-serif text-3xl leading-tight text-[#F1EEE6]">
                  Negotiation is not a moment. It is a system of decisions.
                </p>
              </div>
            </div>

            <div>
              <SectionLabel light>Why we exist</SectionLabel>

              <h2 className="mt-7 max-w-2xl font-serif text-4xl leading-[0.98] tracking-[-0.045em] text-[#F1EEE6] sm:text-6xl">
                The most important work often happens before anyone speaks.
              </h2>

              <div className="mt-8 max-w-xl space-y-6 text-base leading-8 text-[#96938B]">
                <p>
                  Negotiations shape revenue, partnerships, procurement,
                  careers, and the future of organizations. Yet most teams
                  prepare with scattered notes, assumptions, and incomplete
                  memories of what worked last time.
                </p>

                <p>
                  NegoMind was created to give that preparation the same
                  structure and attention as the conversation itself.
                </p>

                <p>
                  We believe teams should be able to model complexity, test
                  their instincts, and understand the forces shaping an
                  outcome before the stakes become real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-[#3B3B39] bg-[#242526]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.45fr_1fr]">
            <div>
              <SectionLabel light>Our principles</SectionLabel>

              <p className="mt-7 max-w-xs font-serif text-3xl leading-tight tracking-[-0.03em] text-[#F1EEE6]">
                The way we build reflects the way we think about negotiation.
              </p>
            </div>

            <div className="divide-y divide-[#575957] border-y border-[#575957]">
              {[
                [
                  "01",
                  "Respect complexity",
                  "Real conversations rarely follow a script. Our tools should make complexity easier to work with, not pretend it does not exist.",
                ],
                [
                  "02",
                  "Reward curiosity",
                  "The strongest negotiators do not simply defend a position. They investigate what is driving the other side.",
                ],
                [
                  "03",
                  "Keep the signal clear",
                  "Good technology should reduce noise and bring attention back to the decisions that shape the outcome.",
                ],
                [
                  "04",
                  "Learn from movement",
                  "The final agreement matters, but so does the path taken to reach it. Every concession contains information.",
                ],
              ].map(([number, title, body]) => (
                <div
                  key={number}
                  className="grid gap-5 py-8 sm:grid-cols-[70px_0.75fr_1fr] sm:items-start"
                >
                  <span className="font-mono text-xs text-[#9AA18A]">
                    {number}
                  </span>

                  <h3 className="font-serif text-2xl tracking-[-0.02em] text-[#F1EEE6]">
                    {title}
                  </h3>

                  <p className="max-w-sm text-sm leading-7 text-[#96938B]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team / Working style */}
      <section className="border-b border-[#3B3B39] bg-[#102E28] text-[#1D1E20]">
        <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1fr] lg:items-center lg:px-12 lg:py-28">
          <div>
            <SectionLabel>How we work</SectionLabel>

            <h2 className="mt-7 max-w-2xl font-serif text-4xl text-[#E8E3D8] leading-[0.98] tracking-[-0.045em] sm:text-6xl">
              Thoughtful systems for high-stakes human work.
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#E8E3D8]">
              We bring together product thinking, behavioral insight, and
              practical technology to create tools that feel calm, useful, and
              close to the reality of the work.
            </p>

            <div className="mt-10 grid gap-5 border-t border-[#A9A49A] pt-6 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#ffffff]">
                  Product first
                </p>

                <p className="mt-3 text-sm leading-7 text-[#724133]">
                  Every feature should help someone make a better decision.
                </p>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#ffffff]">
                  Human centered
                </p>

                <p className="mt-3 text-sm leading-7 text-[#724133]">
                  Technology supports judgment; it does not replace it.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[470px] overflow-hidden border border-[#B6B0A4]">
              <img
                src={photos.detail}
                alt="Architectural workspace detail"
                loading="lazy"
                className="image-shift h-full w-full object-cover grayscale-[15%]"
              />
            </div>

            <div className="grid gap-4 sm:grid-rows-[1fr_auto]">
              <div className="relative min-h-[270px] overflow-hidden border border-[#B6B0A4]">
                <img
                  src={photos.portrait}
                  alt="People collaborating during a meeting"
                  loading="lazy"
                  className="image-shift h-full w-full object-cover grayscale-[20%]"
                />
              </div>

              <div className="border border-[#B6B0A4] bg-[#1D1E20] p-5 text-[#E8E3D8]">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9AA18A]">
                  Our standard
                </p>

                <p className="mt-3 font-serif text-3xl">
                  Useful by Monday.
                </p>

                <p className="mt-3 text-sm leading-6 text-[#858880]">
                  Clear enough to use, rigorous enough to trust, and practical
                  enough to matter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-[#3B3B39] bg-[#191A1C]">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.55fr] lg:items-end lg:px-12 lg:py-28">
          <div>
            <SectionLabel light>Work with us</SectionLabel>

            <h2 className="mt-7 max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.055em] text-[#F1EEE6] sm:text-7xl">
              The next conversation is already worth preparing for.
            </h2>
          </div>

          <div>
            <p className="text-base leading-8 text-[#96938B]">
              Build a scenario, configure the people involved, and give your
              team a better way to understand the decisions ahead.
            </p>

            <div className="mt-8">
              <PrimaryButton onClick={() => handleAction("Configure Agents")}>
                Build your first negotiation
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

export default AboutPage;