import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import NegoMindLogo from "../components/NegoMindLogo";

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

function PageStyles() {
    return (
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
    );
}

function Footer({ onNavigate }) {
    return (
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
                            <button
                                type="button"
                                onClick={() => onNavigate("LandingPage")}
                                className="block transition hover:text-[#E8E3D8]"
                            >
                                Workspace
                            </button>

                            <button
                                type="button"
                                onClick={() => onNavigate("Configure Agents")}
                                className="block transition hover:text-[#E8E3D8]"
                            >
                                Practice
                            </button>

                            <button
                                type="button"
                                onClick={() => onNavigate("Analytics")}
                                className="block transition hover:text-[#E8E3D8]"
                            >
                                Analytics
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858880]">
                            Company
                        </p>

                        <div className="mt-5 space-y-3 text-sm text-[#B3B0A7]">
                            <button
                                type="button"
                                onClick={() => onNavigate("AboutPage")}
                                className="block transition hover:text-[#E8E3D8]"
                            >
                                About
                            </button>

                            <button
                                type="button"
                                onClick={() => onNavigate("ContactPage")}
                                className="block transition hover:text-[#E8E3D8]"
                            >
                                Contact
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858880]">
                            Legal
                        </p>

                        <div className="mt-5 space-y-3 text-sm text-[#B3B0A7]">
                            <button
                                type="button"
                                onClick={() => onNavigate("PrivacyPage")}
                                className="block transition hover:text-[#E8E3D8]"
                            >
                                Privacy
                            </button>

                            <button
                                type="button"
                                onClick={() => onNavigate("TermsPage")}
                                className="block transition hover:text-[#E8E3D8]"
                            >
                                Terms
                            </button>
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
    );
}

function ContactPage({ onNavigate }) {
    const navigate = onNavigate || (() => { });
    const { isAuthenticated } = useAuth();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
    };

    const handleWorkspace = () => {
        if (isAuthenticated) {
            navigate("Configure Agents");
        } else {
            navigate("AuthPage");
        }
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[#191A1C] text-[#E8E3D8]">
            <PageStyles />

            <section className="border-b border-[#3B3B39] bg-[#242526]">
                <div className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
                    <div className="max-w-5xl editorial-reveal">
                        <SectionLabel light>Contact NegoMind</SectionLabel>

                        <h1 className="mt-7 max-w-5xl font-serif text-5xl leading-[0.94] tracking-[-0.055em] text-[#F1EEE6] sm:text-7xl lg:text-[8rem]">
                            Let&apos;s talk about the next conversation.
                        </h1>

                        <p className="mt-9 max-w-2xl text-base leading-8 text-[#B5B3AC] sm:text-lg">
                            Have a question about NegoMind, want to explore a team
                            workspace, or simply want to share what you are working on?
                            We&apos;d like to hear from you.
                        </p>
                    </div>
                </div>
            </section>

            <section className="border-b border-[#D7D1C5]/20 bg-[#E8E3D8] text-[#1D1E20]">
                <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.6fr_1fr] lg:px-12 lg:py-28">
                    <div>
                        <SectionLabel>Start a conversation</SectionLabel>

                        <h2 className="mt-7 max-w-md font-serif text-4xl leading-[0.98] tracking-[-0.045em] sm:text-6xl">
                            Bring us the difficult part.
                        </h2>

                        <p className="mt-7 max-w-md text-base leading-8 text-[#68655E]">
                            Tell us what you are trying to prepare for, understand, or
                            improve. We will help you find the clearest next step.
                        </p>

                        <div className="mt-10 space-y-6 border-t border-[#A9A49A] pt-6">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#77736B]">
                                    General enquiries
                                </p>

                                <a
                                    href="mailto:hello@negomind.ai"
                                    className="mt-2 block text-lg font-semibold transition hover:text-[#69665F]"
                                >
                                    negomindai@gmail.com
                                </a>
                            </div>

                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#77736B]">
                                    Product support
                                </p>

                                <a
                                    href="mailto:support@negomind.ai"
                                    className="mt-2 block text-lg font-semibold transition hover:text-[#69665F]"
                                >
                                    negomindai@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="relative
  -translate-y-1 border border-[#B6B0A4] bg-[#724133] p-6 sm:p-8 shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
                        {submitted ? (
                            <div className="flex min-h-[420px] flex-col justify-center">
                                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#77736B]">
                                    Message received
                                </p>

                                <h3 className="mt-5 max-w-lg font-serif text-4xl leading-tight">
                                    Thank you for reaching out.
                                </h3>

                                <p className="mt-5 max-w-md text-sm leading-7 text-[#68655E]">
                                    Your message has been recorded. Connect this form to your
                                    backend or email service to process submissions in production.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="mt-8 w-fit border-b border-[#77736B] pb-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ffffff]"
                                    >
                                        Name
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Your name"
                                        className="mt-3 w-full border-0 border-b border-[#A9A49A] text-[#F3EDE3] bg-transparent px-0 py-3 text-base outline-none placeholder:text-[#ffffff] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#E8DFD2]"
                                    >
                                        Email
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@company.com"
                                        className="
            mt-3 w-full
            border-0 border-b border-[#A98F82]
            bg-transparent
            px-0 py-3
            text-base text-[#F3EDE3]
            outline-none
            placeholder:text-[#C8BFB3]
            focus:outline-none
            focus:border-[#E8DFD2]
        "
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="topic"
                                        className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ffffff]"
                                    >
                                        What can we help with?
                                    </label>

                                    <select
                                        id="topic"
                                        name="topic"
                                        defaultValue=""
                                        required
                                        className="mt-3 w-full border-0 border-b border-[#A9A49A] bg-transparent px-0 py-3 text-base text-white outline-none focus:outline-none"
                                    >
                                        <option value="" disabled className="text-white">
                                            Select a topic
                                        </option>

                                        <option value="product" className="text-black">
                                            Product information
                                        </option>

                                        <option value="demo" className="text-black">
                                            Request a demo
                                        </option>

                                        <option value="support" className="text-black">
                                            Product support
                                        </option>

                                        <option value="partnership" className="text-black">
                                            Partnership
                                        </option>

                                        <option value="other" className="text-black">
                                            Something else
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ffffff]"
                                    >
                                        Message
                                    </label>

                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={5}
                                        required
                                        placeholder="Tell us what you are working through..."
                                        className="mt-3 w-full resize-none border text-[#F3EDE3] border-[#A9A49A] bg-transparent p-3 text-base outline-none placeholder:text-[#ffffff] focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="group inline-flex items-center gap-4 bg-[#1D1E20] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8E3D8] transition hover:bg-[#303133]"
                                >
                                    Send message
                                    <Arrow className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-[#191A1C]">
                <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.7fr] lg:px-12 lg:py-28">
                    <div>
                        <SectionLabel light>Before you write</SectionLabel>

                        <h2 className="mt-7 max-w-3xl font-serif text-4xl leading-[0.98] tracking-[-0.045em] text-[#F1EEE6] sm:text-6xl">
                            Start with the outcome you want to improve.
                        </h2>
                    </div>

                    <div className="border-t border-[#41423F] pt-6">
                        <p className="text-base leading-8 text-[#96938B]">
                            If you are exploring NegoMind for a team, include the type of
                            negotiation you work on, who will use the workspace, and what you
                            want to understand better.
                        </p>

                        <button
                            type="button"
                            onClick={handleWorkspace}
                            className="mt-8 inline-flex items-center gap-4 border-b border-[#8E8B83]/50 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D8D3C8] transition hover:border-[#E8E3D8] hover:text-[#E8E3D8]"
                        >
                            Explore the workspace
                            <Arrow />
                        </button>
                    </div>
                </div>
            </section>

        </main>
    );
}

export default ContactPage;