import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import OAuthModal from "../components/OAuthModal";

export default function AuthPage({ onNavigate, initialMode = "signin" }) {
  const { signUp, verifyOtp, resendOtp, signIn, signInWithOAuth, authError, setAuthError } = useAuth();

  const [mode, setMode] = useState(initialMode); // "signin" | "signup" | "otp"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  // OTP State
  const [otpEmail, setOtpEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [demoOtpCode, setDemoOtpCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // OAuth Modal State
  const [oauthProvider, setOauthProvider] = useState(null);

  const otpInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Timer countdown for OTP resend
  useEffect(() => {
    let timer;
    if (mode === "otp" && resendTimer > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [mode, resendTimer]);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const res = await signIn(signInEmail, signInPassword);
    setLoading(false);

    if (res.success) {
      if (res.requiresOtp) {
        setOtpEmail(res.email);
        setEmailSent(!!res.emailSent);
        setDemoOtpCode(res.demoOtp || "");
        setMode("otp");
        setResendTimer(30);
      } else {
        if (onNavigate) onNavigate("Dashboard");
      }
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const res = await signUp(signUpName, signUpEmail, signUpPassword);
    setLoading(false);

    if (res.success) {
      setOtpEmail(res.email);
      setEmailSent(!!res.emailSent);
      setDemoOtpCode(res.demoOtp || "");
      setMode("otp");
      setResendTimer(30);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const fullCode = otpDigits.join("");
    if (fullCode.length < 6) {
      setAuthError("Please enter all 6 digits of the OTP code.");
      return;
    }

    setLoading(true);
    setAuthError(null);

    const res = await verifyOtp(otpEmail, fullCode);
    setLoading(false);

    if (res.success) {
      if (onNavigate) onNavigate("Dashboard");
    }
  };

  const handleResendOtpCode = async () => {
    if (!canResend) return;
    setLoading(true);
    const res = await resendOtp(otpEmail);
    setLoading(false);
    if (res.success) {
      setDemoOtpCode(res.demoOtp || "");
      setEmailSent(!!res.emailSent);
      setResendTimer(30);
      setCanResend(false);
    }
  };

  const handleOtpDigitChange = (index, val) => {
    const digit = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpDigits(pasted.split(""));
      otpInputRefs[5].current?.focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    if (demoOtpCode && demoOtpCode.length === 6) {
      setOtpDigits(demoOtpCode.split(""));
    }
  };

  const handleOAuthAuthorize = async (oauthUser) => {
    if (!oauthProvider) return;
    setLoading(true);
    const res = await signInWithOAuth(oauthProvider, oauthUser);
    setLoading(false);
    setOauthProvider(null);
    if (res.success) {
      if (onNavigate) onNavigate("Dashboard");
    }
  };

  const isSignUp = mode === "signup";
  const isOtp = mode === "otp";

  return (
    <div className="min-h-full w-full bg-[#0C0B12] text-white flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8 overflow-y-auto relative">
      {/* Background Ambient Glowing Lights */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Top Header Navigation Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-4 z-20">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate("Dashboard")}
          className="flex items-center gap-2 rounded-2xl border border-[#2F2E3E] bg-[#161522]/90 px-4 py-2 text-xs font-bold text-slate-300 hover:border-slate-400 hover:text-white backdrop-blur-md transition shadow-md cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        {/* TOP SLIDING TAB BAR SWITCHER ABOVE THE PAGE */}
        <div className="relative inline-flex items-center rounded-2xl border border-[#2B2A3C] bg-[#151421] p-1.5 shadow-2xl backdrop-blur-xl">
          {/* Sliding Pill Background Indicator */}
          <div
            className={`absolute top-1.5 bottom-1.5 rounded-xl bg-[#282738] border border-emerald-500/40 shadow-lg transition-all duration-500 ease-out ${
              isSignUp ? "left-[50%] right-1.5" : "left-1.5 right-[50%]"
            }`}
          />

          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setMode("signin");
            }}
            className={`relative z-10 px-6 py-2 text-xs font-black transition-colors duration-300 cursor-pointer ${
              !isSignUp ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setMode("signup");
            }}
            className={`relative z-10 px-6 py-2 text-xs font-black transition-colors duration-300 cursor-pointer ${
              isSignUp ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Main Full-Body Split Container with Animated Panel Swap */}
      <div className="w-full max-w-6xl min-h-[640px] flex-1 overflow-hidden rounded-3xl border border-[#272635] bg-[#12111A] shadow-2xl relative my-auto">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 min-h-[640px] transition-all duration-700 ease-in-out ${
            isSignUp ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* ============================================================
              FORM PANEL (Slides smoothly between Left & Right)
          ============================================================ */}
          <div
            className={`p-6 sm:p-10 lg:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
              isSignUp ? "lg:order-2" : "lg:order-1"
            }`}
          >
            {/* Error Alert Box */}
            {authError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 animate-in fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{authError}</span>
              </div>
            )}

            {/* OTP VERIFICATION VIEW */}
            {isOtp ? (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-white">Email Verification</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the 6-digit verification code dispatched to your email
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-3.5 text-center transition-all ${
                    emailSent
                      ? "border-emerald-500/40 bg-emerald-500/15"
                      : "border-emerald-500/30 bg-emerald-500/10"
                  }`}
                >
                  <p className="text-xs text-emerald-300 font-semibold">
                    {emailSent ? "✉️ Real OTP Email sent via SMTP to " : "Verification code generated for "}
                    <strong className="text-white">{otpEmail}</strong>
                  </p>
                  {emailSent && (
                    <p className="text-[11px] text-emerald-400/80 mt-0.5">
                      Please check your inbox and spam folder.
                    </p>
                  )}
                </div>

                {demoOtpCode && (
                  <div className="flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-500/15 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                      <div>
                        <p className="font-bold text-indigo-200">
                          {emailSent ? "Active Verification OTP:" : "Demo Verification OTP:"}
                        </p>
                        <p className="font-mono text-base font-black text-white">{demoOtpCode}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoFillDemoOtp}
                      className="rounded-lg bg-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/50 hover:text-white transition"
                    >
                      Auto-Fill OTP
                    </button>
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpInputRefs[idx]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="h-12 w-11 sm:w-12 rounded-xl border border-[#353447] bg-[#181724] text-center font-mono text-xl font-black text-emerald-400 focus:border-emerald-500 focus:bg-[#201F30] focus:outline-none shadow-sm"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length < 6}
                    className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-40"
                  >
                    {loading ? "Verifying..." : "Verify Code & Sign In →"}
                  </button>
                </form>

                <div className="flex items-center justify-between pt-2 border-t border-[#262535] text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="hover:text-slate-200 text-[11px]"
                  >
                    ← Back to Sign In
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtpCode}
                      className="font-bold text-emerald-400 hover:underline text-[11px]"
                    >
                      Resend OTP Code
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">
                      Resend code in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                    </span>
                  )}
                </div>
              </div>
            ) : mode === "signin" ? (
              /* SIGN IN FORM VIEW */
              <div className="space-y-5 animate-in fade-in duration-500">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white font-sans">
                    Welcome Back to <span className="text-emerald-400">NegoMind AI</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Sign in to access your multi-agent negotiation engine & strategy dashboard
                  </p>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOauthProvider("google")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#2C2B3A] bg-[#171622] px-3 py-2.5 text-xs font-bold text-slate-200 hover:border-blue-500/50 hover:bg-[#1E1D2B] transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOauthProvider("github")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#2C2B3A] bg-[#171622] px-3 py-2.5 text-xs font-bold text-slate-200 hover:border-purple-500/50 hover:bg-[#1E1D2B] transition"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#262535]" /></div>
                  <span className="relative bg-[#12111A] px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    or sign in with email
                  </span>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#2D2C3D] bg-[#181724] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full rounded-xl border border-[#2D2C3D] bg-[#181724] px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? "Signing In..." : "Sign In to Engine →"}
                  </button>
                </form>

                {/* Switcher Link */}
                <div className="pt-3 text-center text-xs text-slate-400 border-t border-[#242332]">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setMode("signup");
                    }}
                    className="font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Slide to Sign Up →
                  </button>
                </div>
              </div>
            ) : (
              /* SIGN UP FORM VIEW */
              <div className="space-y-4 animate-in fade-in duration-500">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white font-sans">
                    Create Your Account
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Join Team 4 and configure AI agents for automated deal negotiation
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOauthProvider("google")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#2C2B3A] bg-[#171622] px-3 py-2.5 text-xs font-bold text-slate-200 hover:border-blue-500/50 hover:bg-[#1E1D2B] transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOauthProvider("github")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#2C2B3A] bg-[#171622] px-3 py-2.5 text-xs font-bold text-slate-200 hover:border-purple-500/50 hover:bg-[#1E1D2B] transition"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#262535]" /></div>
                  <span className="relative bg-[#12111A] px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    or register with email
                  </span>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full rounded-xl border border-[#2D2C3D] bg-[#181724] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#2D2C3D] bg-[#181724] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full rounded-xl border border-[#2D2C3D] bg-[#181724] px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? "Sending Verification OTP..." : "Create Account & Send Code →"}
                  </button>
                </form>

                {/* Switcher Link */}
                <div className="pt-3 text-center text-xs text-slate-400 border-t border-[#242332]">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setMode("signin");
                    }}
                    className="font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Slide to Sign In →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
              HERO ANIMATED VISUAL PANEL (Slides smoothly between Right & Left)
          ============================================================ */}
          <div
            className={`relative p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#161524] via-[#11101C] to-[#0A0A12] border-l lg:border-l-0 lg:border-r-0 border-[#2A2938] flex flex-col justify-between overflow-hidden transition-all duration-700 ease-in-out ${
              isSignUp ? "lg:order-1 border-r border-[#2A2938]" : "lg:order-2 border-l border-[#2A2938]"
            }`}
          >
            {/* Pulsing Ambient Glowing Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute top-1/4 right-10 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

            {/* Top Visual Header Pill */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono font-bold text-emerald-400 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>NegoMind AI • Multi-Agent Engine</span>
              </div>

              <span className="font-mono text-xs font-extrabold text-slate-400">
                TEAM 4
              </span>
            </div>

            {/* Center Graphic Animation */}
            <div className="relative z-10 my-8 flex flex-col items-center justify-center text-center">
              {/* Animated Strategy Matrix Graphic */}
              <div className="relative h-64 w-64 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30 animate-[spin_25s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-teal-500/20 animate-[spin_15s_linear_infinite_reverse]" />

                {/* Pulsing Central Agent Node */}
                <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-2xl shadow-emerald-500/30">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-[11px] font-mono tracking-widest mt-1 uppercase font-black">AI AGENT</span>
                </div>

                {/* Floating Orbiting Micro Badge Nodes */}
                <div className="absolute -top-3 left-4 rounded-xl border border-indigo-500/40 bg-[#1A192A] px-3 py-1.5 text-[11px] font-mono text-indigo-300 font-bold shadow-md animate-bounce">
                  Buyer Strategy
                </div>

                <div className="absolute bottom-1 right-2 rounded-xl border border-emerald-500/40 bg-[#1A192A] px-3 py-1.5 text-[11px] font-mono text-emerald-300 font-bold shadow-md animate-pulse">
                  Seller Utility
                </div>

                <div className="absolute top-1/2 -right-8 -translate-y-1/2 rounded-xl border border-amber-500/40 bg-[#1A192A] px-3 py-1.5 text-[11px] font-mono text-amber-300 font-bold shadow-md">
                  Nash Equilibrium
                </div>
              </div>

              <h3 className="text-2xl font-black text-white font-sans tracking-tight">
                {isSignUp ? "Join the Multi-Agent Platform" : "Autonomous Strategic Intelligence"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
                {isSignUp
                  ? "Create custom buyer/seller personas, simulate multi-round concession strategies, and measure optimal Pareto efficiency."
                  : "Train AI agents with Google Gemini LLM reasoning, monitor live concession steps, and generate automated audit reports."}
              </p>
            </div>

            {/* Bottom Floating Stats Telemetry Card */}
            <div className="relative z-10 rounded-2xl border border-[#2B2A3B] bg-[#161524]/90 p-4 shadow-xl backdrop-blur-md">
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Success Rate</p>
                  <p className="text-lg font-black text-emerald-400">99.4%</p>
                </div>
                <div className="border-x border-[#282738]">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Simulations</p>
                  <p className="text-lg font-black text-white">12,400+</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Engine</p>
                  <p className="text-lg font-black text-teal-300">LLM Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded OAuth Interactive Account Chooser */}
      <OAuthModal
        isOpen={!!oauthProvider}
        provider={oauthProvider}
        onClose={() => setOauthProvider(null)}
        onAuthorize={handleOAuthAuthorize}
      />
    </div>
  );
}
