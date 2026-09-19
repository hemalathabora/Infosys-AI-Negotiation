import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import OAuthModal from "../components/OAuthModal";

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.5 17.5 0 0 1-3 3.8" />
        <path d="M6.7 6.8C4 8.4 2.5 12 2.5 12S6 18 12 18c1.2 0 2.3-.2 3.3-.6" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5.2-3.4 8.5-8 10-4.6-1.5-8-4.8-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return <svg {...common}>{icons[name]}</svg>;
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
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
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function FloatingInput({
  id,
  label,
  icon,
  type = "text",
  value,
  onChange,
  required = false,
  minLength,
  showPassword,
  onTogglePassword,
}) {
  const hasValue = value.length > 0;

  return (
    <div className="group relative">
      

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        placeholder={label}
        className="peer h-[50px] w-full border border-[#302E42] bg-[#161522]/80 p-5 text-sm text-white outline-none backdrop-blur-md transition-all duration-300"
      />

      

      {onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
        </button>
      )}
    </div>
  );
}

export default function AuthPage({ onNavigate, initialMode = "signin" }) {
  const {
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signInWithOAuth,
    authError,
    setAuthError,
  } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [otpEmail, setOtpEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [demoOtpCode, setDemoOtpCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [oauthProvider, setOauthProvider] = useState(null);
  const otpInputRefs = useRef([]);

  const isSignup = mode === "signup";
  const isOtp = mode === "otp";

  useEffect(() => {
    if (mode !== "otp") return undefined;

    if (resendTimer <= 0) {
      setCanResend(true);
      return undefined;
    }

    setCanResend(false);

    const timer = setInterval(() => {
      setResendTimer((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, resendTimer]);

  const switchMode = (nextMode) => {
    setAuthError(null);
    setShowPassword(false);
    setMode(nextMode);
  };

  const handleSignInSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    const result = await signIn(signInEmail, signInPassword, rememberMe);
    setLoading(false);

    if (result.success) {
      if (result.requiresOtp) {
        setOtpEmail(result.email);
        setEmailSent(Boolean(result.emailSent));
        setDemoOtpCode(result.demoOtp || "");
        setOtpDigits(["", "", "", "", "", ""]);
        setResendTimer(30);
        setMode("otp");
      } else {
        onNavigate?.("Dashboard");
      }
    }
  };

  const handleSignUpSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    const result = await signUp(signUpName, signUpEmail, signUpPassword);
    setLoading(false);

    if (result.success) {
      setOtpEmail(result.email);
      setEmailSent(Boolean(result.emailSent));
      setDemoOtpCode(result.demoOtp || "");
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(30);
      setMode("otp");
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    const code = otpDigits.join("");

    if (code.length !== 6) {
      setAuthError("Please enter all 6 digits of the verification code.");
      return;
    }

    setLoading(true);
    setAuthError(null);

    const result = await verifyOtp(otpEmail, code);
    setLoading(false);

    if (result.success) {
      onNavigate?.("Dashboard");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;

    setLoading(true);
    setAuthError(null);

    const result = await resendOtp(otpEmail);
    setLoading(false);

    if (result.success) {
      setDemoOtpCode(result.demoOtp || "");
      setEmailSent(Boolean(result.emailSent));
      setResendTimer(30);
      setCanResend(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...otpDigits];

    nextDigits[index] = digit;
    setOtpDigits(nextDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleOAuthAuthorize = async (oauthUser) => {
    if (!oauthProvider) return;

    setLoading(true);
    const result = await signInWithOAuth(oauthProvider, oauthUser);
    setLoading(false);
    setOauthProvider(null);

    if (result.success) {
      onNavigate?.("Dashboard");
    }
  };

  return (
    <main className="relative h-[98%] max-h-screen w-[97%] overflow-hidden bg-[#0C0B12] text-white">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[560px] w-[560px] rounded-full bg-indigo-500/10 blur-[140px]" />

      <div className="relative grid h-full min-h-0 lg:grid-cols-2">
        {/* Authentication panel */}
        <section
          className={`relative z-20  min-h-0 overflow-y-auto bg-[#0C0B12] px-5 py-5 transition-transform duration-700 ease-in-out sm:px-10 lg:col-start-1 lg:row-start-1 lg:h-full lg:overflow-y-auto lg:px-12 lg:py-6 xl:px-20 ${isSignup ? "lg:translate-x-full" : "lg:translate-x-0"
            }`}
        >
          <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col justify-center">

            {/* Heading and tab switcher */}
            <div className="mb-6">
              <div className="w-full flex justify-around mb-5 inline-flex rounded-2xl border border-[#2F2E3E] bg-[#161522]/80 py-1.5 px-0.5 shadow-xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`rounded-xl px-24 py-2.5 text-md font-black transition-all ${!isSignup
                    ? "bg-[#29283A] text-emerald-400 shadow-lg"
                    : "text-slate-500 hover:text-slate-200"
                    }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`rounded-xl px-20 py-2.5 text-md font-black transition-all ${isSignup
                    ? "bg-[#29283A] text-emerald-400 shadow-lg"
                    : "text-slate-500 hover:text-slate-200"
                    }`}
                >
                  Sign Up
                </button>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                {isOtp
                  ? "Verify your identity"
                  : isSignup
                    ? "Build your edge."
                    : "Welcome back."}
              </h1>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                {isOtp
                  ? `Enter the verification code sent to ${otpEmail}.`
                  : isSignup
                    ? "Create an account and unlock autonomous negotiation intelligence."
                    : "Sign in to continue to your negotiation strategy workspace."}
              </p>
            </div>

            {/* Error state */}
            {authError && (
              <div className="mb-3 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs leading-5 text-red-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/50 text-[11px] font-black">
                  !
                </span>
                <span>{authError}</span>
              </div>
            )}

            {/* OTP form */}
            {isOtp ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                      <Icon name="mail" size={19} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-emerald-200">
                        Verification code dispatched
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-300/70">
                        Check your inbox and spam folder.
                      </p>
                    </div>
                  </div>
                </div>


                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          otpInputRefs.current[index] = element;
                        }}
                        value={digit}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        onPaste={handleOtpPaste}
                        className="h-14 w-full rounded-2xl border border-[#302E42] bg-[#161522]/80 text-center font-mono text-xl font-black text-emerald-400 outline-none backdrop-blur-md transition focus:border-emerald-500 focus:bg-[#1A1928] focus:ring-4 focus:ring-emerald-500/10"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length !== 6}
                    className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 text-sm font-black text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                    {!loading && <Icon name="arrow" size={18} strokeWidth={2.2} />}
                  </button>
                </form>

                <div className="flex items-center justify-between border-t border-[#29283A] pt-5 text-xs">
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="text-slate-500 transition hover:text-white"
                  >
                    ← Back to sign in
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-emerald-400 hover:underline"
                    >
                      Resend code
                    </button>
                  ) : (
                    <span className="font-mono text-slate-600">
                      Resend in 00:{String(resendTimer).padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Social providers */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOauthProvider("google")}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#302E42] bg-[#161522]/80 text-xs font-bold text-slate-200 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-[#1D1C2B]"
                  >
                    <GoogleIcon />
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={() => setOauthProvider("github")}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#302E42] bg-[#161522]/80 text-xs font-bold text-slate-200 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-purple-500/50 hover:bg-[#1D1C2B]"
                  >
                    <GithubIcon />
                    GitHub
                  </button>
                </div>

                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#29283A]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                    Or continue with
                  </span>
                  <div className="h-px flex-1 bg-[#29283A]" />
                </div>

                {isSignup ? (
                  <form onSubmit={handleSignUpSubmit} className="space-y-3">
                    <FloatingInput
                      id="signup-name"
                      label="Full name"
                      icon="user"
                      value={signUpName}
                      onChange={(event) => setSignUpName(event.target.value)}
                      required
                    />

                    <FloatingInput
                      id="signup-email"
                      label="Email address"
                      icon="mail"
                      type="email"
                      value={signUpEmail}
                      onChange={(event) => setSignUpEmail(event.target.value)}
                      required
                    />

                    <FloatingInput
                      id="signup-password"
                      label="Password"
                      icon="lock"
                      type={showPassword ? "text" : "password"}
                      value={signUpPassword}
                      onChange={(event) => setSignUpPassword(event.target.value)}
                      required
                      minLength={6}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword((value) => !value)}
                    />

                    <p className="px-1 text-[11px] text-slate-600">
                      Use at least 6 characters for your password.
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex h-12 w-full items-center justify-center gap-3 bg-emerald-500 text-sm font-black text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Sending verification code..." : "Create Account"}
                      {!loading && <Icon name="arrow" size={18} strokeWidth={2.2} />}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <FloatingInput
                      id="signin-email"
                      label="Email address"
                      icon="mail"
                      type="email"
                      value={signInEmail}
                      onChange={(event) => setSignInEmail(event.target.value)}
                      required
                    />

                    <FloatingInput
                      id="signin-password"
                      label="Password"
                      icon="lock"
                      type={showPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(event) => setSignInPassword(event.target.value)}
                      required
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword((value) => !value)}
                    />

                    <div className="flex items-center justify-between px-1 pt-1">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(event) => setRememberMe(event.target.checked)}
                          className="h-4 w-4 rounded border-[#3B394D] bg-[#161522] text-emerald-500 accent-emerald-500 focus:ring-emerald-500"
                        />
                        Remember me
                      </label>

                      <button
                        type="button"
                        onClick={() => setAuthError("Password reset is not available yet.")}
                        className="text-xs font-bold text-emerald-400 transition hover:text-emerald-300 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex h-12 w-full items-center justify-center gap-3  bg-emerald-500 text-sm font-black text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Signing in..." : "Sign In to Engine"}
                      {!loading && <Icon name="arrow" size={18} strokeWidth={2.2} />}
                    </button>
                  </form>
                )}

                <p className="mt-7 text-center text-xs text-slate-500">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(isSignup ? "signin" : "signup")}
                    className="font-bold text-emerald-400 transition hover:text-emerald-300 hover:underline"
                  >
                    {isSignup ? "Sign in" : "Create one"}
                  </button>
                </p>
              </>
            )}
          </div>
        </section>

        {/* Visual hero panel */}
        <section
          className={`relative z-10 hidden min-h-0 overflow-hidden border-l border-[#262536] transition-transform duration-700 ease-in-out lg:col-start-2 lg:row-start-1 lg:block lg:h-full ${isSignup ? "lg:-translate-x-full" : "lg:translate-x-0"
            }`}
        >
          <img
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=90"
            alt="Modern collaborative workspace"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark integration overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0C0B12]/95 via-[#0C0B12]/55 to-[#0C0B12]/20" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_25%_75%,rgba(99,102,241,0.18),transparent_30%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-16">

            <div className="max-w-xl">

              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
                Autonomous negotiation systems
              </p>

              <h2 className="max-w-lg text-4xl font-black leading-[1.05] tracking-[-0.05em] text-white xl:text-6xl">
                Turn every deal into a{" "}
                <span className="text-emerald-400">strategic advantage.</span>
              </h2>
            </div>
          </div>
        </section>
      </div>

      <OAuthModal
        isOpen={Boolean(oauthProvider)}
        provider={oauthProvider}
        onClose={() => setOauthProvider(null)}
        onAuthorize={handleOAuthAuthorize}
      />

      <style>{`
        @keyframes authEnter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}