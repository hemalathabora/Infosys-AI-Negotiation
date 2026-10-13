import { useState } from "react";
import { startGoogleSignIn, startGithubSignIn } from "../services/oauthService";

export default function OAuthModal({ isOpen, provider, onClose, onAuthorize }) {
  const [realTokenOrCode, setRealTokenOrCode] = useState("");
  const [activeMode, setActiveMode] = useState("popup"); // "popup" | "manual"
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !provider) return null;

  const isGoogle = provider.toLowerCase() === "google";

  const handleLaunchPopup = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let result;
      if (isGoogle) {
        result = await startGoogleSignIn();
      } else {
        result = await startGithubSignIn();
      }
      onAuthorize(result);
    } catch (err) {
      setErrorMsg(err.message || `${isGoogle ? "Google" : "GitHub"} OAuth sign in failed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!realTokenOrCode.trim()) return;
    onAuthorize({
      token_or_code: realTokenOrCode.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl transition-all duration-200 ${
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
                Live OAuth 2.0 verification via <span className="text-slate-200 font-semibold">{isGoogle ? "Google Identity Services" : "GitHub OAuth"}</span>
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

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
            <span className="font-bold">!</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body content */}
        <div className="mt-5 space-y-4">
          {activeMode === "popup" ? (
            <div className="space-y-4 text-center">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                <p className="font-bold text-sm text-emerald-200 mb-1">
                  {isGoogle ? "Official Google Sign-In" : "Official GitHub Sign-In"}
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {isGoogle
                    ? "Click below to open Google's authentication popup and select your Google account."
                    : "Click below to authenticate with your official GitHub account."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLaunchPopup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Connecting to {isGoogle ? "Google" : "GitHub"}...</span>
                  </>
                ) : (
                  <span>Launch {isGoogle ? "Google" : "GitHub"} Login Window →</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveMode("manual")}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Advanced: Manual Token / Code Entry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                {isGoogle
                  ? "Paste a valid Google ID Token or Access Token to verify directly against Google's tokeninfo API."
                  : "Paste a valid GitHub OAuth Authorization Code or Personal Access Token to verify directly with GitHub."}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isGoogle ? "Google ID Token / Access Token" : "GitHub Code / Access Token"}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isGoogle ? "eyJhbGciOiJSUzI1NiIs..." : "ghp_... or auth_code..."}
                  value={realTokenOrCode}
                  onChange={(e) => setRealTokenOrCode(e.target.value)}
                  className="w-full rounded-xl border border-[#333245] bg-[#1A1926] p-3 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveMode("popup")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back to OAuth popup
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  Verify Token with Backend →
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-5 text-[10px] text-center text-slate-500 border-t border-[#262535] pt-3">
          NegoMind OAuth Engine • Real-time Token Exchange & Verification
        </p>
      </div>
    </div>
  );
}
