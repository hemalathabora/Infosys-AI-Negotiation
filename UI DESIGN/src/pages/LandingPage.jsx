import React from "react";
import { useAuth } from "../context/AuthContext";

function ArrowUpRight({ size = 16 }) {

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10-6.86a1 1 0 0 0 0-1.66l-10-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.6 5.4L5 10l5.4 1.6L12 17l1.6-5.4L19 10l-5.4-1.6L12 3Z" />
      <path d="m19 16-.8 2.2L16 19l2.2.8L19 22l.8-2.2L22 19l-2.2-.8L19 16Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function AgentMiniCard({ label, name, role, value, color = "blue" }) {
  const isEmerald = color === "emerald";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isEmerald
          ? "border-emerald-500/25 bg-emerald-500/[0.06]"
          : "border-indigo-500/25 bg-indigo-500/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
            isEmerald ? "text-emerald-400" : "text-indigo-300"
          }`}
        >
          {label}
        </span>

        <span
          className={`h-2 w-2 rounded-full ${
            isEmerald ? "bg-emerald-400" : "bg-indigo-400"
          }`}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black ${
            isEmerald
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-indigo-400/15 text-indigo-300"
          }`}
        >
          {label === "Party A" ? "A1" : "A2"}
        </div>

        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{role}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-white/[0.08] pt-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Current position
        </p>
        <p
          className={`mt-1 font-mono text-2xl font-extrabold ${
            isEmerald ? "text-emerald-300" : "text-indigo-300"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ number, title, description, icon }) {
  return (
    <div className="group rounded-2xl border border-[#302F39] bg-[#201F25]/80 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-[#25242C]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-indigo-300">
          {icon}
        </div>

        <span className="font-mono text-xs text-slate-600">{number}</span>
      </div>

      <h3 className="mt-6 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>

      <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-indigo-300 opacity-0 transition-opacity group-hover:opacity-100">
        Learn more
        <ArrowUpRight size={14} />
      </div>
    </div>
  );
}

export default function LandingPage({ onNavigate }) {
  const navigate = onNavigate || (() => {});
  const { isAuthenticated } = useAuth();

  const handleAction = (targetPage) => {
    if (isAuthenticated) {
      navigate(targetPage);
    } else {
      navigate("AuthPage");
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#17161B] text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-360px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/[0.08] blur-3xl" />
        <div className="absolute right-[-180px] top-[420px] h-[420px] w-[420px] rounded-full bg-emerald-500/[0.05] blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">

        {/* Hero */}
        <section
          id="platform"
          className="grid min-h-[720px] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-20"
        >
          <div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              Turn every negotiation into a{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-white to-emerald-300 bg-clip-text text-transparent">
                strategic advantage.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Simulate, analyze, and master high-stakes negotiations with
              intelligent agent personas, live concession tracking, and
              data-driven outcomes.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleAction("Configure Agents")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_0_32px_rgba(52,211,153,0.18)] transition hover:bg-emerald-300 active:scale-95 cursor-pointer"
              >
                Start a negotiation
                <ArrowUpRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => handleAction("Dashboard")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3A3944] bg-[#201F25] px-5 py-3.5 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-[#25242C] cursor-pointer"
              >
                <PlayIcon />
                Explore live demo
              </button>
            </div>


            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <CheckIcon className="text-emerald-400" />
                AI-to-AI simulations
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon className="text-emerald-400" />
                Human practice mode
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon className="text-emerald-400" />
                Real-time analytics
              </span>
            </div>
          </div>

          {/* Hero product preview */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[32px] bg-indigo-500/[0.08] blur-2xl" />

            <div className="relative rounded-[28px] border border-white/[0.12] bg-[#1E1D24]/95 p-3 shadow-2xl shadow-black/40">
              <div className="rounded-[22px] border border-white/[0.08] bg-[#17161B] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                        Live session
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-white">
                      Enterprise Vendor Renewal
                    </h2>
                  </div>

                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-[10px] font-bold text-indigo-300">
                    ROUND 06 / 10
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <AgentMiniCard
                    label="Party A"
                    name="Alex Morgan"
                    role="Procurement Lead"
                    value="$48,000"
                  />

                  <AgentMiniCard
                    label="Party B"
                    name="Daniel Carter"
                    role="Vendor Representative"
                    value="$52,000"
                    color="emerald"
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-[#201F25] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Bid-ask convergence
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      72%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
                  </div>

                  <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-slate-500">
                    <span>Concession velocity: stable</span>
                    <span>Gap: $4,000</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
                  <SparkIcon />
                  <p className="text-xs leading-5 text-slate-300">
                    AI analysis detects a{" "}
                    <span className="font-bold text-emerald-300">
                      high-probability agreement zone
                    </span>{" "}
                    within the next two rounds.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-white/10 bg-[#25242C] px-4 py-3 shadow-xl sm:block">
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                Agreement probability
              </p>
              <p className="mt-1 font-mono text-xl font-black text-emerald-300">
                86.4%
              </p>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-2 gap-4 border-y border-white/[0.08] py-8 sm:grid-cols-4">
          {[
            ["10x", "faster scenario testing"],
            ["24/7", "always-on simulations"],
            ["3", "strategic scenario types"],
            ["100%", "auditable outcomes"],
          ].map(([value, label]) => (
            <div key={label} className="text-center sm:text-left">
              <p className="font-mono text-2xl font-black text-white sm:text-3xl">
                {value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </section>

        {/* Capabilities */}
        <section id="capabilities" className="py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              Built for better decisions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Everything you need to negotiate with confidence.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Move beyond static roleplay. Negotiate.AI gives you a complete
              environment to configure, execute, and understand negotiation
              behavior.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="Configure realistic personas"
              description="Define goals, constraints, personalities, and behavioral policies for every negotiation participant."
              icon={<SparkIcon />}
            />

            <FeatureCard
              number="02"
              title="Practice under pressure"
              description="Switch between AI-versus-AI simulation and human-versus-AI practice modes to sharpen your instincts."
              icon={<PlayIcon />}
            />

            <FeatureCard
              number="03"
              title="Measure every concession"
              description="Track bid movement, concession velocity, convergence, deadlocks, and final settlement quality."
              icon={<ArrowUpRight size={18} />}
            />
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="rounded-[28px] border border-[#302F39] bg-[#201F25] p-6 sm:p-10"
        >
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-300">
                A better negotiation loop
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                From scenario to strategy in three steps.
              </h2>
              <button
                type="button"
                onClick={() => handleAction("Configure Agents")}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-slate-200 cursor-pointer"
              >

                Build your first session
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                ["01", "Select your scenario", "Start with a realistic business situation."],
                ["02", "Tune both parties", "Control goals, constraints, and personalities."],
                ["03", "Run and analyze", "Review every move and improve your strategy."],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="flex gap-4 rounded-2xl border border-white/[0.08] bg-[#17161B] p-4"
                >
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {number}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-28 text-center">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.08] blur-3xl" />

          <div className="relative">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              Your next advantage starts here
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Stop guessing. Start negotiating with intelligence.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400">
              Build a scenario, configure your agents, and discover how better
              preparation changes the outcome.
            </p>

            <button
              type="button"
              onClick={() => handleAction("Configure Agents")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_0_36px_rgba(52,211,153,0.2)] transition hover:bg-emerald-300 active:scale-95 cursor-pointer"
            >

              Launch your first negotiation
              <ArrowUpRight size={17} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-3 border-t border-white/[0.08] py-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Negotiate.AI. Intelligent negotiation
            infrastructure.
          </span>
          <span className="font-mono">SYSTEM STATUS: OPERATIONAL</span>
        </footer>
      </div>
    </main>
  );
}