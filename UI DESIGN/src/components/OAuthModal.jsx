import { useState } from "react";

export default function OAuthModal({ isOpen, provider, onClose, onAuthorize }) {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [realTokenOrCode, setRealTokenOrCode] = useState("");
  const [activeMode, setActiveMode] = useState("accounts"); // "accounts" | "custom" | "token"

  if (!isOpen || !provider) return null;

  const isGoogle = provider.toLowerCase() === "google";

  const googleDemoAccounts = [
    {
      name: "Alex Johnson",
      email: "alex.johnson@gmail.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Sarah Connor",
      email: "sarah.connor@gmail.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const githubDemoAccounts = [
    {
      name: "Devon Octocat",
      email: "devon.builder@github.com",
      avatar: "https://avatars.githubusercontent.com/u/583231?v=4",
    },
    {
      name: "Elena Rostova",
      email: "elena.code@github.com",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const accounts = isGoogle ? googleDemoAccounts : githubDemoAccounts;

  const handleSelectAccount = (acc) => {
    onAuthorize({
      name: acc.name,
      email: acc.email,
      avatar_url: acc.avatar,
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName || customEmail.split("@")[0];
    const avatar = isGoogle
      ? `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
      : `https://avatars.githubusercontent.com/u/9919?v=4`;

    onAuthorize({
      name,
      email: customEmail,
      avatar_url: avatar,
    });
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (!realTokenOrCode) return;
    onAuthorize({
      token_or_code: realTokenOrCode.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all duration-200 ${
          isGoogle
            ? "border-blue-500/30 bg-[#12141F] text-white"
            : "border-purple-500/30 bg-[#0F0E17] text-white"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262535]">
          <div className="flex items-center gap-3">
            {isGoogle ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24292E] border border-slate-700 shadow-md text-white">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </div>
            )}

            <div>
              <h3 className="font-bold text-lg text-white">
                {isGoogle ? "Sign in with Google" : "Authorize NegoMind AI"}
              </h3>
              <p className="text-xs text-slate-400">
                to continue to <span className="text-slate-200 font-semibold">NegoMind AI Engine</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#252433] hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4">
          {activeMode === "accounts" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Select an account to proceed:
              </p>

              <div className="space-y-2.5">
                {accounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[#272636] bg-[#171622] hover:border-emerald-500/50 hover:bg-[#1E1D2D] transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-100 group-hover:text-white">
                          {acc.name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">{acc.email}</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select →
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveMode("custom")}
                  className="text-slate-400 hover:text-slate-200 underline font-medium"
                >
                  Enter custom email
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode("token")}
                  className="text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  {isGoogle ? "🔑 Real Google Token" : "🔑 Real GitHub Code"}
                </button>
              </div>
            </>
          )}

          {activeMode === "custom" && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder={isGoogle ? "Alex Johnson" : "devon_octocat"}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-[#333245] bg-[#1A1926] px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isGoogle ? "Google Email Address" : "GitHub Email / Handle"}
                </label>
                <input
                  type="email"
                  required
                  placeholder={isGoogle ? "user@gmail.com" : "user@github.com"}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#333245] bg-[#1A1926] px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveMode("accounts")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back to default accounts
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  Confirm & Sign In
                </button>
              </div>
            </form>
          )}

          {activeMode === "token" && (
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                {isGoogle
                  ? "Paste a Google ID Token or Access Token to verify directly against Google OAuth servers."
                  : "Paste a GitHub Authorization Code to exchange directly with GitHub's official OAuth API."}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isGoogle ? "Google ID Token / Credential" : "GitHub OAuth Code"}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isGoogle ? "eyJhbGciOiJSUzI1NiIs..." : "a1b2c3d4e5f6..."}
                  value={realTokenOrCode}
                  onChange={(e) => setRealTokenOrCode(e.target.value)}
                  className="w-full rounded-xl border border-[#333245] bg-[#1A1926] p-3 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveMode("accounts")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back to accounts
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  Verify Live OAuth Token →
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-5 text-[10px] text-center text-slate-500 border-t border-[#262535] pt-3">
          OAuth 2.0 Identity Service • Live Token Verification & Session Creation
        </p>
      </div>
    </div>
  );
}
