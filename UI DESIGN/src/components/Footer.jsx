import NegoMindLogo from "./NegoMindLogo";

export default function Footer({ onNavigate }) {
  const handleAction = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-bg border-t border-border text-textSecondary transition-colors duration-200">
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-10 border-b border-border pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
          
          {/* Brand */}
          <div>
            <NegoMindLogo />

            <p className="mt-6 max-w-xs text-sm leading-7 text-textSecondary">
              Intelligent negotiation infrastructure for better preparation,
              sharper decisions, and stronger outcomes.
            </p>
          </div>

          {/* Company */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textMuted">
              Company
            </p>

            <div className="mt-5 space-y-3 text-sm text-textSecondary">
              <button
                type="button"
                onClick={() => handleAction("About")}
                className="block transition hover:text-textPrimary cursor-pointer"
              >
                About
              </button>

              <button
                type="button"
                onClick={() => handleAction("ContactPage")}
                className="block transition hover:text-textPrimary cursor-pointer"
              >
                Contact Us
              </button>

              <button
                type="button"
                onClick={() => handleAction("PolicyPage")}
                className="block transition hover:text-textPrimary cursor-pointer"
              >
                Policy
              </button>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textMuted">
              Legal
            </p>

            <div className="mt-5 space-y-3 text-sm text-textSecondary">
              <button
                type="button"
                onClick={() => handleAction("PrivacyPage")}
                className="block transition hover:text-textPrimary cursor-pointer"
              >
                Privacy
              </button>

              <button
                type="button"
                onClick={() => handleAction("TermsPage")}
                className="block transition hover:text-textPrimary cursor-pointer"
              >
                Terms
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-textMuted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} NegoMind Ai. All rights reserved.
          </p>

          <p className="font-mono uppercase tracking-[0.16em] text-textMuted">
            Think / Negotiate / Grow
          </p>
        </div>
      </div>
    </footer>
  );
}