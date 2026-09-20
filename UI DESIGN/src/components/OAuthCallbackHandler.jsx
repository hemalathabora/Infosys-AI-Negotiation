import { useEffect } from "react";

export default function OAuthCallbackHandler() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error") || searchParams.get("error_description");

    const hashString = window.location.hash.startsWith("#")
      ? window.location.hash.substring(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hashString);
    const token = hashParams.get("access_token") || hashParams.get("id_token") || searchParams.get("token");

    if (window.opener) {
      window.opener.postMessage(
        {
          type: "NEGOMIND_OAUTH_RESPONSE",
          code,
          token,
          error,
          url: window.location.href,
        },
        window.location.origin
      );
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          console.warn("Could not auto-close popup window:", e);
        }
      }, 300);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0C0B12] text-white p-6 text-center">
      <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
      <h2 className="text-xl font-bold">Completing Sign-In...</h2>
      <p className="text-xs text-slate-400 mt-2">
        Authenticating with OAuth server. This window will close automatically.
      </p>
    </div>
  );
}
