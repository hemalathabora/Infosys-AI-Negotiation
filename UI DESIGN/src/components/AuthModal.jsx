import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import OAuthModal from "./OAuthModal";
import { startGoogleSignIn, startGithubSignIn } from "../services/oauthService";

export default function AuthModal({ isOpen, onClose, initialTab = "signin" }) {
  const { signUp, verifyOtp, resendOtp, signIn, signInWithOAuth, authError, setAuthError } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // "signin" | "signup" | "otp"
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
    if (activeTab === "otp" && resendTimer > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [activeTab, resendTimer]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAuthError(null);
    }
  }, [isOpen, initialTab, setAuthError]);

  if (!isOpen) return null;

  // Sign In Handler
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
        setActiveTab("otp");
        setResendTimer(30);
      } else {
        onClose();
      }
    }
  };

  // Sign Up Handler
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
      setActiveTab("otp");
      setResendTimer(30);
    }
  };

  // OTP Verification Handler
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
      onClose();
    }
  };

  const handleResendOtpCode = async () => {
    if (!canResend) return;
    setLoading(true);
    const res = await resendOtp(otpEmail);
    setLoading(false);
    if (res.success) {
      setDemoOtpCode(res.demoOtp || "");
      setResendTimer(30);
      setCanResend(false);
    }
  };

  // OTP Digit Boxes Input Handling
  const handleOtpDigitChange = (index, val) => {
    const digit = val.slice(-1); // Take last character
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto advance focus
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
      const digits = pasted.split("");
      setOtpDigits(digits);
      otpInputRefs[5].current?.focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    if (demoOtpCode && demoOtpCode.length === 6) {
      setOtpDigits(demoOtpCode.split(""));
    }
  };

  // Real Google & GitHub OAuth Handlers
  const handleGoogleAuth = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const oauthData = await startGoogleSignIn();
      const res = await signInWithOAuth("google", oauthData);
      if (res.success) {
        onClose();
      }
    } catch (err) {
      console.warn("Google OAuth direct prompt warning:", err);
      if (err.message && !err.message.includes("closed")) {
        setAuthError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const oauthData = await startGithubSignIn();
      const res = await signInWithOAuth("github", oauthData);
      if (res.success) {
        onClose();
      }
    } catch (err) {
      console.warn("GitHub OAuth direct prompt warning:", err);
      if (err.message && !err.message.includes("closed")) {
        setAuthError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // OAuth Selection Handlers
  const handleOAuthAuthorize = async (oauthUser) => {
    if (!oauthProvider) return;
    setLoading(true);
    const res = await signInWithOAuth(oauthProvider, oauthUser);
    setLoading(false);
    setOauthProvider(null);
    if (res.success) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#2A2938] bg-[#12111A] p-6 shadow-2xl transition-all">
          {/* Glowing Ambient Top Background Accent */}
          <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#1F1E2A] text-slate-400 hover:bg-[#2B2A3B] hover:text-white transition cursor-pointer"
          >
            ✕
          </button>

          {/* Top Title Bar */}
          <div className="text-center mb-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 mb-2 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              {activeTab === "otp" ? "Email Verification" : "NegoMind AI Portal"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === "signin" && "Sign in to access your negotiation agent simulations"}
              {activeTab === "signup" && "Create an account to train and test custom AI agents"}
              {activeTab === "otp" && "Enter the 6-digit OTP verification code sent to your email"}
            </p>
          </div>

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

          {/* Tab Selector (Sign In vs Sign Up) */}
          {activeTab !== "otp" && (
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#1B1A26] p-1 border border-[#272635] mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setAuthError(null);
                }}
                className={`rounded-xl py-2 text-xs font-bold transition-all ${
                  activeTab === "signin"
                    ? "bg-[#282738] text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setAuthError(null);
                }}
                className={`rounded-xl py-2 text-xs font-bold transition-all ${
                  activeTab === "signup"
                    ? "bg-[#282738] text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ==================== SIGN IN VIEW ==================== */}
          {activeTab === "signin" && (
            <div>
              {/* OAuth Social Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#2C2B3A] bg-[#171622] px-3 py-2.5 text-xs font-bold text-slate-200 hover:border-blue-500/50 hover:bg-[#1E1D2B] transition disabled:opacity-50"
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
                  onClick={handleGithubAuth}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#2C2B3A] bg-[#171622] px-3 py-2.5 text-xs font-bold text-slate-200 hover:border-purple-500/50 hover:bg-[#1E1D2B] transition disabled:opacity-50"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#262535]" /></div>
                <span className="relative bg-[#12111A] px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  or sign in with email
                </span>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                  </div>
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
                  className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? "Signing In..." : "Sign In to Dashboard"}
                </button>
              </form>
            </div>
          )}

          {/* ==================== SIGN UP VIEW ==================== */}
          {activeTab === "signup" && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#2C2B3A] bg-[#171622] px-3 py-2.5 text-xs font-bold text-slate-200 hover:border-blue-500/50 hover:bg-[#1E1D2B] transition disabled:opacity-50"
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
                  onClick={handleGithubAuth}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#2C2B3A] bg-[#171622] px-3 py-2.5 text-xs font-bold text-slate-200 hover:border-purple-500/50 hover:bg-[#1E1D2B] transition disabled:opacity-50"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <div className="relative my-3.5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#262535]" /></div>
                <span className="relative bg-[#12111A] px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  or register with email
                </span>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-3">
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
                    className="w-full rounded-xl border border-[#2D2C3D] bg-[#181724] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
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
                    className="w-full rounded-xl border border-[#2D2C3D] bg-[#181724] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
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
                      className="w-full rounded-xl border border-[#2D2C3D] bg-[#181724] px-3.5 py-2 pr-10 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
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
                  className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 mt-1"
                >
                  {loading ? "Sending OTP Code..." : "Create Account & Send Verification Code →"}
                </button>
              </form>
            </div>
          )}

          {/* ==================== OTP VERIFICATION VIEW ==================== */}
          {activeTab === "otp" && (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-3 text-center transition-all ${
                  emailSent
                    ? "border-emerald-500/40 bg-emerald-500/15"
                    : "border-emerald-500/30 bg-emerald-500/10"
                }`}
              >
                <p className="text-xs text-emerald-300 font-semibold">
                  {emailSent
                    ? "✉️ Real OTP Email sent via SMTP to "
                    : "Verification code generated for "}
                  <strong className="text-white">{otpEmail}</strong>
                </p>
                {emailSent && (
                  <p className="text-[11px] text-emerald-400/80 mt-0.5">
                    Please check your email inbox and spam folder.
                  </p>
                )}
              </div>

              {/* Demo Helper Toast Banner */}
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
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-between gap-1.5 sm:gap-2">
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
                  className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-40"
                >
                  {loading ? "Verifying..." : "Verify Code & Complete Sign In"}
                </button>
              </form>

              {/* Resend OTP */}
              <div className="flex items-center justify-between pt-2 border-t border-[#262535] text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
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
          )}
        </div>
      </div>

      {/* Embedded OAuth Interactive Account Chooser */}
      <OAuthModal
        isOpen={!!oauthProvider}
        provider={oauthProvider}
        onClose={() => setOauthProvider(null)}
        onAuthorize={handleOAuthAuthorize}
      />
    </>
  );
}
