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
    `}</style>
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

function TermsPage({ onNavigate }) {
  const navigate = onNavigate || (() => {});

  return (
    <main className="min-h-screen overflow-hidden bg-[#191A1C] text-[#E8E3D8]">
      <PageStyles />

      <section className="border-b border-[#3B3B39] bg-[#242526]">
        <div className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="max-w-5xl editorial-reveal">
            <SectionLabel light>Terms of use</SectionLabel>

            <h1 className="mt-7 max-w-5xl font-serif text-5xl leading-[0.94] tracking-[-0.055em] text-[#F1EEE6] sm:text-7xl lg:text-[8rem]">
              Clear terms for a clear working relationship.
            </h1>

            <p className="mt-9 max-w-2xl text-base leading-8 text-[#B5B3AC] sm:text-lg">
              These terms describe the basic rules for accessing and using
              NegoMind services.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#E8E3D8] text-[#1D1E20]">
        <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.32fr_1fr] lg:px-12 lg:py-28">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <SectionLabel>Agreement</SectionLabel>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-[#77736B]">
              Last updated: October 8, 2026
            </p>

            <div className="mt-8 border-t border-[#A9A49A] pt-5 text-sm leading-7 text-[#68655E]">
              <p>
                This document is a general template and should be reviewed by
                qualified legal counsel before production use.
              </p>
            </div>
          </aside>

          <article className="max-w-4xl">
            <p className="text-lg leading-8 text-[#4F4C46]">
              These Terms of Use describe the relationship between you and
              NegoMind when you access or use our website, applications, and
              related services. By using the services, you agree to these
              terms.
            </p>

            <LegalHeading number="01">
              Using NegoMind
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              You may use NegoMind only for lawful purposes and in accordance
              with these terms. You are responsible for ensuring that your use
              of the services complies with all laws, regulations, policies,
              and agreements that apply to you or your organization.
            </p>

            <LegalHeading number="02">
              Accounts and access
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              You are responsible for maintaining the confidentiality of your
              account credentials and for activity that occurs through your
              account. You should notify NegoMind promptly if you believe your
              account has been accessed without authorization.
            </p>

            <p className="mt-4 text-base leading-8 text-[#68655E]">
              You may not share access in a way that violates your plan,
              bypasses security controls, or allows unauthorized individuals to
              use the services.
            </p>

            <LegalHeading number="03">
              Workspace content
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              You retain ownership of content that you submit to NegoMind. You
              grant NegoMind the limited rights necessary to host, process,
              display, and operate on that content to provide and improve the
              services.
            </p>

            <p className="mt-4 text-base leading-8 text-[#68655E]">
              You are responsible for ensuring that you have the necessary
              rights and permissions to submit workspace content, including
              information about other people or organizations.
            </p>

            <LegalHeading number="04">
              Acceptable use
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              You may not use NegoMind to violate the law, infringe the rights
              of others, distribute malicious code, interfere with the service,
              attempt unauthorized access, or use the service to create or
              distribute misleading, abusive, discriminatory, or harmful
              content.
            </p>

            <LegalHeading number="05">
              Artificial intelligence features
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              Some NegoMind features may use artificial intelligence or
              automated systems to generate simulations, summaries,
              recommendations, or other outputs. These outputs may be
              incomplete, inaccurate, or unsuitable for a particular decision.
            </p>

            <p className="mt-4 text-base leading-8 text-[#68655E]">
              You are responsible for reviewing outputs and applying your own
              professional judgment. NegoMind does not provide legal,
              financial, employment, or other professional advice through
              automated outputs.
            </p>

            <LegalHeading number="06">
              Intellectual property
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              NegoMind and its licensors own the service, including its
              software, design, branding, documentation, and underlying
              technology. Except for the limited rights expressly granted in
              these terms, no rights are transferred to you.
            </p>

            <LegalHeading number="07">
              Service availability
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              We may modify, suspend, or discontinue all or part of the
              services from time to time. We will make reasonable efforts to
              maintain availability, but we do not guarantee that the services
              will always be uninterrupted, secure, or error-free.
            </p>

            <LegalHeading number="08">
              Disclaimers and limitation of liability
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              To the fullest extent permitted by law, the services are provided
              without warranties of any kind, whether express or implied.
              NegoMind will not be liable for indirect, incidental, special,
              consequential, or punitive damages arising from or related to
              your use of the services, subject to applicable law.
            </p>

            <LegalHeading number="09">
              Termination
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              You may stop using the services at any time. NegoMind may suspend
              or terminate access if you violate these terms, create risk for
              the service or other users, or where required by law.
            </p>

            <LegalHeading number="10">
              Changes to these terms
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              We may update these terms as the services evolve. We will update
              the date at the top of this page when changes are made. Your
              continued use of NegoMind after the updated terms become effective
              means you accept the revised terms.
            </p>

            <LegalHeading number="11">
              Contact
            </LegalHeading>

            <p className="mt-5 text-base leading-8 text-[#68655E]">
              Questions about these terms can be sent to{" "}
              <a
                href="mailto:negomindai@gmail.com"
                className="font-semibold underline underline-offset-4"
              >
                negomindai@gmail.com
              </a>
              .
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default TermsPage;