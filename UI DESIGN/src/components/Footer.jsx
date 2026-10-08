import NegoMindLogo from "./NegoMindLogo";

export default function Footer({ onNavigate }) {
  const handleAction = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-[#191A1C]">
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-10 border-b border-[#3B3B39] pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
          
          {/* Brand */}
          <div>
            <NegoMindLogo />

            <p className="mt-6 max-w-xs text-sm leading-7 text-[#858880]">
              Intelligent negotiation infrastructure for better preparation,
              sharper decisions, and stronger outcomes.
            </p>
          </div>

          {/* Company */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858880]">
              Company
            </p>

            <div className="mt-5 space-y-3 text-sm text-[#B3B0A7]">
              <button
                type="button"
                onClick={() => handleAction("About")}
                className="block transition hover:text-[#E8E3D8]"
              >
                About
              </button>

              <button
                type="button"
                onClick={() => handleAction("ContactPage")}
                className="block transition hover:text-[#E8E3D8]"
              >
                Contact Us
              </button>

              <button
                type="button"
                onClick={() => handleAction("PolicyPage")}
                className="block transition hover:text-[#E8E3D8]"
              >
                Policy
              </button>
            </div>
          </div>

          {/* Product */}
          {/* <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858880]">
              Product
            </p>

            <div className="mt-5 space-y-3 text-sm text-[#B3B0A7]">
              <button
                type="button"
                onClick={() => handleAction("Landing")}
                className="block transition hover:text-[#E8E3D8]"
              >
                Workspace
              </button>

              <button
                type="button"
                onClick={() => handleAction("Configure Agents")}
                className="block transition hover:text-[#E8E3D8]"
              >
                Practice
              </button>

              <button
                type="button"
                onClick={() => handleAction("Analytics")}
                className="block transition hover:text-[#E8E3D8]"
              >
                Analytics
              </button>
            </div>
          </div> */}

          {/* Legal */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858880]">
              Legal
            </p>

            <div className="mt-5 space-y-3 text-sm text-[#B3B0A7]">
              <button
                type="button"
                onClick={() => handleAction("PrivacyPage")}
                className="block transition hover:text-[#E8E3D8]"
              >
                Privacy
              </button>

              <button
                type="button"
                onClick={() => handleAction("TermsPage")}
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