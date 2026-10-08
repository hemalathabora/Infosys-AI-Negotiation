import React from "react";
import NegoMindLogo from "../components/NegoMindLogo";

function Logo() {
  return <NegoMindLogo size={42} />;
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

function LegalHeading({ number, children }) {
  return (
    <div className="mt-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#77736B]">
        {number}
      </p>

      <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-4xl">
        {children}
      </h2>
    </div>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#191A1C] text-[#E8E3D8]">
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
                onClick={() => onNavigate("PolicyPage")}
                className="block transition hover:text-[#E8E3D8]"
              >
                Privacy Policy
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

function PolicyPage({ onNavigate }) {
  const navigate = onNavigate || (() => {});

  return (
    <main className="min-h-screen overflow-hidden bg-[#191A1C] text-[#E8E3D8]">
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

      {/* Hero */}
      <section className="border-b border-[#3B3B39] bg-[#242526]">
        <div className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="max-w-5xl editorial-reveal">
            <SectionLabel light>Privacy policy</SectionLabel>

            <h1 className="mt-7 max-w-5xl font-serif text-5xl leading-[0.94] tracking-[-0.055em] text-[#F1EEE6] sm:text-7xl lg:text-[8rem]">
              Your information should be handled with care.
            </h1>

            <p className="mt-9 max-w-2xl text-base leading-8 text-[#B5B3AC] sm:text-lg">
              This policy explains how NegoMind may collect, use, store, and
              protect information when you use our website and services.
            </p>
          </div>
        </div>
      </section>

      {/* Policy content */}
      <section className="bg-[#E8E3D8] text-[#1D1E20]">
        <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.32fr_1fr] lg:px-12 lg:py-28">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <SectionLabel>Privacy</SectionLabel>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-[#77736B]">
              Last updated: October 8, 2026
            </p>

            <div className="mt-8 border-t border-[#A9A49A] pt-5 text-sm leading-7 text-[#68655E]">
              <p>
                This policy is a general template and should be reviewed by
                qualified legal counsel before production use.
              </p>
            </div>
          </aside>

          <article className="max-w-4xl">
            <p className="text-lg leading-8 text-[#4F4C46]">
              NegoMind values clarity, trust, and responsible handling of
              information. This Privacy Policy explains how information may be
              collected and used when you visit our website, create an account,
              or use our negotiation workspace.
            </p>

            <LegalHeading number="01">
              Information we collect
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              We may collect information you provide directly, including your
              name, email address, organization details, account credentials,
              support messages, and information included in scenarios or
              workspace content.
            </p>

            <p className="mt-4 text-base leading-8 text-[#68655E]">
              We may also collect technical information such as browser type,
              device information, approximate location, log data, and
              interactions with our website or services.
            </p>

            <LegalHeading number="02">
              How we use information
            </LegalHeading>

            <ul className="mt-5 list-disc space-y-3 pl-6 text-base leading-8 text-[#68655E]">
              <li>To provide, maintain, and improve NegoMind services.</li>
              <li>To authenticate users and secure accounts.</li>
              <li>To respond to support requests and communications.</li>
              <li>
                To understand product usage and improve the user experience.
              </li>
              <li>
                To detect, prevent, and investigate misuse or security
                incidents.
              </li>
              <li>To comply with applicable legal obligations.</li>
            </ul>

            <LegalHeading number="03">
              Workspace and negotiation data
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              Workspace content may include business information, negotiation
              scenarios, participant profiles, objectives, notes, and
              simulation results. Users should avoid submitting confidential or
              sensitive information unless their organization has authorized
              its use within the service.
            </p>

            <LegalHeading number="04">
              Sharing information
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              We may share information with service providers that help us
              operate the platform, including hosting, analytics,
              communications, security, and customer support providers.
            </p>

            <p className="mt-4 text-base leading-8 text-[#68655E]">
              We may also disclose information when required by law, to protect
              the rights and safety of users or NegoMind, or as part of a
              merger, acquisition, financing, or other business transaction.
            </p>

            <LegalHeading number="05">
              Data retention and security
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              We retain information for as long as reasonably necessary to
              provide services, resolve disputes, maintain records, and meet
              legal requirements.
            </p>

            <p className="mt-4 text-base leading-8 text-[#68655E]">
              We use reasonable administrative, technical, and organizational
              safeguards designed to protect information. No method of storage
              or transmission is completely secure.
            </p>

            <LegalHeading number="06">
              Cookies and analytics
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              NegoMind may use cookies, local storage, and similar technologies
              to remember preferences, maintain sessions, understand product
              usage, and improve website performance.
            </p>

            <p className="mt-4 text-base leading-8 text-[#68655E]">
              You can adjust cookie settings through your browser. Disabling
              certain cookies may affect the functionality of some services.
            </p>

            <LegalHeading number="07">
              Your choices and rights
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              Depending on your location, you may have rights to access,
              correct, delete, or restrict the processing of certain personal
              information. You may also unsubscribe from non-essential
              communications.
            </p>

            <p className="mt-4 text-base leading-8 text-[#68655E]">
              To ask a privacy question or make a request, contact us at{" "}
              <a
                href="mailto:privacy@negomind.ai"
                className="font-semibold underline underline-offset-4"
              >
                privacy@negomind.ai
              </a>
              .
            </p>

            <LegalHeading number="08">
              Children&apos;s privacy
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              NegoMind is intended for professional and business use. We do not
              knowingly collect personal information from children where
              prohibited by applicable law.
            </p>

            <LegalHeading number="09">
              International data transfers
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              Depending on where you use the services, your information may be
              processed in countries other than your own. Where required, we
              use appropriate safeguards for international data transfers.
            </p>

            <LegalHeading number="10">
              Policy updates
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              We may update this Privacy Policy from time to time. When changes
              are made, we will update the date at the top of this page.
              Continued use of the services after an update means the revised
              policy may apply to you.
            </p>

            <div className="mt-16 border-t border-[#A9A49A] pt-6">
              <p className="text-sm leading-7 text-[#68655E]">
                Questions about this policy can be sent to{" "}
                <a
                  href="mailto:privacy@negomind.ai"
                  className="font-semibold underline underline-offset-4"
                >
                  privacy@negomind.ai
                </a>
                .
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default PolicyPage;