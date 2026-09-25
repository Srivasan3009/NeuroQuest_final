import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  User,
  Check,
  ShieldCheck,
  RefreshCw,
  Inbox,
  AlertCircle,
  KeyRound,
  Sparkles,
  Sun,
  Moon,
  Compass,
  X,
  PlusCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { AppTheme, UserProfile } from "../../types";
import { soundFx } from "../../utils/sound";
import { authService } from "../../services/auth";

interface AuthStarterViewProps {
  onLoginSuccess: (profile: UserProfile) => void;
  activeTheme: AppTheme;
  onToggleTheme: () => void;
}

export const AuthStarterView: React.FC<AuthStarterViewProps> = ({
  onLoginSuccess,
  activeTheme,
  onToggleTheme,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Sign Up fields
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupAge, setSignupAge] = useState<string>("20");
  const [signupPassword, setSignupPassword] = useState("");

  // Post-Signup Pending Verification screen
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  // Google OAuth popup and account dialog state
  const [googlePopupUrl, setGooglePopupUrl] = useState<string | null>(null);
  const [isGoogleAccountModalOpen, setIsGoogleAccountModalOpen] = useState(false);
  const [googleLoginSuccess, setGoogleLoginSuccess] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [isAddingOtherAccount, setIsAddingOtherAccount] = useState(false);

  // Clear any previously set remove_google_login flag
  useEffect(() => {
    try {
      localStorage.removeItem("neuroquest_remove_google_login");
    } catch {
      // Ignore
    }
  }, []);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const isDark =
    activeTheme === "obsidian-noir" ||
    activeTheme === "obsidian-gold" ||
    activeTheme === "neon-matrix" ||
    activeTheme === "cyber-dark";

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  // Sign In with Supabase
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = signInEmail.trim();
    if (!trimmedEmail) {
      soundFx.playWrong();
      setErrorMessage("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      soundFx.playWrong();
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!signInPassword) {
      soundFx.playWrong();
      setErrorMessage("Please enter your password.");
      return;
    }

    setErrorMessage("");
    setUnverifiedEmail(null);
    setIsLoading(true);
    soundFx.playTap();

    try {
      const user = await authService.signInWithPassword(trimmedEmail, signInPassword);
      soundFx.playMissionComplete();
      onLoginSuccess(user);
    } catch (err: any) {
      soundFx.playWrong();
      const msg = err.message || "Failed to sign in. Please check your credentials.";
      setErrorMessage(msg);
      if (
        msg.toLowerCase().includes("unverified") ||
        msg.toLowerCase().includes("not verified") ||
        msg.toLowerCase().includes("not confirmed")
      ) {
        setUnverifiedEmail(trimmedEmail);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up with Supabase
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = signupName.trim();
    const cleanUsername = signupUsername.trim().replace(/^@/, "");
    const trimmedEmail = signupEmail.trim();

    if (!trimmedName) {
      soundFx.playWrong();
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      soundFx.playWrong();
      setErrorMessage("Please choose a username (at least 3 characters).");
      return;
    }
    if (!trimmedEmail) {
      soundFx.playWrong();
      setErrorMessage("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      soundFx.playWrong();
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    const ageNum = signupAge ? parseInt(signupAge, 10) : undefined;
    const finalAge = ageNum && !isNaN(ageNum) && ageNum > 0 ? ageNum : 16;
    if (signupPassword.length < 6) {
      soundFx.playWrong();
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    soundFx.playTap();

    try {
      const result = await authService.signUpWithDetails({
        fullName: trimmedName,
        username: cleanUsername,
        email: trimmedEmail,
        age: finalAge,
        password: signupPassword,
      });

      if (result.requiresVerification) {
        soundFx.playTap();
        setPendingVerificationEmail(trimmedEmail);
        setResendCountdown(60);
      } else if (result.user) {
        soundFx.playMissionComplete();
        onLoginSuccess(result.user);
      }
    } catch (err: any) {
      soundFx.playWrong();
      setErrorMessage(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async (targetEmail: string) => {
    if (resendCountdown > 0) return;
    try {
      soundFx.playTap();
      setIsLoading(true);
      await authService.resendVerificationEmail(targetEmail);
      setResendCountdown(60);
      setSuccessNotice(`Verification link sent to ${targetEmail}`);
      setTimeout(() => setSuccessNotice(""), 6000);
    } catch (err: any) {
      soundFx.playWrong();
      setErrorMessage(err.message || "Could not resend email. Please wait a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In Actions
  const handleGoogleSignInClick = () => {
    soundFx.playTap();
    setErrorMessage("");
    setIsGoogleAccountModalOpen(true);
  };

  const handleSelectGoogleAccount = async (targetEmail: string, displayName?: string) => {
    soundFx.playTap();
    setIsGoogleLoggingIn(true);
    setGoogleLoginSuccess(false);
    setErrorMessage("");
    try {
      const user = await authService.signInWithGoogleAccount(targetEmail, displayName);
      setGoogleLoginSuccess(true);
      soundFx.playMissionComplete();
      setTimeout(() => {
        setIsGoogleAccountModalOpen(false);
        setIsGoogleLoggingIn(false);
        setGoogleLoginSuccess(false);
        onLoginSuccess(user);
      }, 450);
    } catch (err: any) {
      soundFx.playWrong();
      setErrorMessage(err.message || "Failed to sign in with Google account.");
      setIsGoogleLoggingIn(false);
      setGoogleLoginSuccess(false);
    }
  };

  // Password reset
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) return;

    setIsForgotLoading(true);
    setErrorMessage("");
    try {
      await authService.resetPassword(cleanEmail);
      setForgotSent(true);
      soundFx.playTap();
    } catch (err: any) {
      soundFx.playWrong();
      setErrorMessage(err.message || "Failed to send reset link.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div
      id="neuroquest-auth-container"
      className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300"
    >
      {/* Top Header Bar with Working Theme Changer */}
      <header className="relative z-20 w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-all ${
              isDark
                ? "bg-zinc-800 border border-zinc-700/80 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                : "bg-white border border-slate-200/80 text-[#4F46E5] shadow-[4px_4px_8px_#c5cbd5,-4px_-4px_8px_#ffffff]"
            }`}
          >
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span
              className={`text-base font-bold tracking-tight ${
                isDark ? "text-zinc-100" : "text-slate-900"
              }`}
            >
              NeuroQuest
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-wider opacity-60">
              AI Academy
            </span>
          </div>
        </div>

        {/* Working Theme Switcher Button */}
        <button
          type="button"
          id="btn-toggle-auth-theme"
          onClick={() => {
            soundFx.playTap();
            onToggleTheme();
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 ${
            isDark
              ? "bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 text-amber-300 shadow-sm"
              : "bg-white/90 hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-[3px_3px_6px_#c5cbd5,-3px_-3px_6px_#ffffff]"
          }`}
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="text-xs font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium">Dark Mode</span>
            </>
          )}
        </button>
      </header>

      {/* Main Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 my-auto">
        <div
          className={`w-full max-w-[420px] rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
            isDark
              ? "bg-zinc-900/90 border border-zinc-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] text-zinc-100"
              : "bg-[#E2E8F0]/80 border border-white/60 shadow-[10px_10px_25px_#c5cbd5,-10px_-10px_25px_#ffffff] text-slate-800"
          }`}
        >
          {/* STATE 1: PENDING EMAIL CONFIRMATION */}
          {pendingVerificationEmail ? (
            <div className="text-center space-y-5 py-2 animate-in fade-in duration-200">
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-sm ${
                  isDark
                    ? "bg-zinc-800 border border-zinc-700 text-amber-400"
                    : "bg-white border border-slate-200 text-indigo-600 shadow-[4px_4px_8px_#c5cbd5,-4px_-4px_8px_#ffffff]"
                }`}
              >
                <Inbox className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h2
                  className={`text-xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Verify your email
                </h2>
                <p
                  className={`text-xs leading-relaxed max-w-[280px] mx-auto ${
                    isDark ? "text-zinc-400" : "text-slate-600"
                  }`}
                >
                  We sent a confirmation link to
                  <br />
                  <span
                    className={`font-semibold ${
                      isDark ? "text-amber-400" : "text-indigo-600"
                    }`}
                  >
                    {pendingVerificationEmail}
                  </span>
                </p>
              </div>

              <div
                className={`p-3.5 rounded-2xl text-left text-xs space-y-1.5 ${
                  isDark
                    ? "bg-zinc-800/60 border border-zinc-700/60 text-zinc-300"
                    : "bg-white/80 border border-slate-200 text-slate-700 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Click the link in the email to activate your account.</span>
                </div>
                <p className="text-[11px] opacity-75 pl-6">
                  Check your spam or promotions folder if you don't see it.
                </p>
              </div>

              {/* Feedback Toasts */}
              {successNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{successNotice}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  id="btn-resend-verification"
                  disabled={resendCountdown > 0 || isLoading}
                  onClick={() => handleResendVerification(pendingVerificationEmail)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    resendCountdown > 0
                      ? "opacity-50 cursor-not-allowed bg-transparent border border-current"
                      : isDark
                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                      : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>
                    {resendCountdown > 0
                      ? `Resend in ${resendCountdown}s`
                      : "Resend Verification Email"}
                  </span>
                </button>

                <button
                  type="button"
                  id="btn-back-to-signin"
                  onClick={() => {
                    soundFx.playTap();
                    setPendingVerificationEmail(null);
                    setAuthMode("signin");
                    setSignInEmail(pendingVerificationEmail);
                    setErrorMessage("");
                    setSuccessNotice("Email verified? Enter your password to log in.");
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm ${
                    isDark
                      ? "bg-amber-400 hover:bg-amber-300 text-zinc-950"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  }`}
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header Title */}
              <div className="text-center space-y-1 mb-5">
                <h1
                  className={`text-2xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {authMode === "signin" ? "Welcome Back" : "Join NeuroQuest"}
                </h1>
                <p
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-slate-500"
                  }`}
                >
                  {authMode === "signin"
                    ? "Enter your credentials to access campus"
                    : "Create your cadet account to start learning"}
                </p>
              </div>

              {/* Minimalist Segmented Tabs */}
              <div
                className={`p-1 rounded-2xl flex items-center mb-5 ${
                  isDark
                    ? "bg-zinc-800/80 border border-zinc-700/60"
                    : "bg-slate-200/80 border border-slate-300/60 shadow-inner"
                }`}
              >
                <button
                  type="button"
                  id="tab-signin"
                  onClick={() => {
                    soundFx.playTap();
                    setAuthMode("signin");
                    setErrorMessage("");
                    setSuccessNotice("");
                    setUnverifiedEmail(null);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    authMode === "signin"
                      ? isDark
                        ? "bg-zinc-900 text-amber-400 shadow-sm border border-zinc-700"
                        : "bg-white text-[#4F46E5] shadow-sm"
                      : isDark
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  id="tab-signup"
                  onClick={() => {
                    soundFx.playTap();
                    setAuthMode("signup");
                    setErrorMessage("");
                    setSuccessNotice("");
                    setUnverifiedEmail(null);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    authMode === "signup"
                      ? isDark
                        ? "bg-zinc-900 text-amber-400 shadow-sm border border-zinc-700"
                        : "bg-white text-[#4F46E5] shadow-sm"
                      : isDark
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Google Sign-In */}
              <div className="mb-4">
                <button
                  type="button"
                  id="btn-google-signin"
                  onClick={handleGoogleSignInClick}
                  disabled={isLoading || isGoogleLoggingIn}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.99] ${
                    isDark
                      ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100"
                      : "bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 shadow-[3px_3px_6px_#c5cbd5,-3px_-3px_6px_#ffffff]"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Minimal Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div
                  className={`border-t w-full ${
                    isDark ? "border-zinc-800" : "border-slate-300"
                  }`}
                />
                <span
                  className={`px-3 text-[10px] uppercase tracking-wider font-mono ${
                    isDark
                      ? "bg-zinc-900 text-zinc-500"
                      : "bg-[#E2E8F0] text-slate-500"
                  }`}
                >
                  or with email
                </span>
              </div>

              {/* Alerts */}
              {successNotice && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium space-y-1.5 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                  {unverifiedEmail && (
                    <button
                      type="button"
                      onClick={() => handleResendVerification(unverifiedEmail)}
                      disabled={resendCountdown > 0 || isLoading}
                      className="text-[11px] font-semibold underline block pl-6"
                    >
                      {resendCountdown > 0
                        ? `Resend link in ${resendCountdown}s`
                        : "Resend verification email"}
                    </button>
                  )}
                </div>
              )}

              {/* SIGN IN FORM */}
              {authMode === "signin" && (
                <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-zinc-300" : "text-slate-700"
                      }`}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        id="input-signin-email"
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="cadet@domain.com"
                        required
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all ${
                          isDark
                            ? "bg-zinc-800/80 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                            : "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-500/20 shadow-inner"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label
                        className={`block text-xs font-semibold ${
                          isDark ? "text-zinc-300" : "text-slate-700"
                        }`}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotModalOpen(true);
                          setForgotEmail(signInEmail);
                          setForgotSent(false);
                        }}
                        className={`text-[11px] hover:underline font-medium ${
                          isDark ? "text-amber-400" : "text-indigo-600"
                        }`}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        id="input-signin-password"
                        type={showPassword ? "text" : "password"}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs outline-none transition-all ${
                          isDark
                            ? "bg-zinc-800/80 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                            : "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-500/20 shadow-inner"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    id="btn-submit-signin"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 ${
                      isDark
                        ? "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/20"
                        : "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-500/20"
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Enter Campus</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SIGN UP FORM */}
              {authMode === "signup" && (
                <form onSubmit={handleSignUpSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label
                        className={`block text-xs font-semibold ${
                          isDark ? "text-zinc-300" : "text-slate-700"
                        }`}
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                        <input
                          id="input-signup-name"
                          type="text"
                          value={signupName}
                          onChange={(e) => {
                            setSignupName(e.target.value);
                            if (!signupUsername) {
                              setSignupUsername(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9_]/g, "")
                              );
                            }
                          }}
                          placeholder="Alex Chen"
                          required
                          className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none transition-all ${
                            isDark
                              ? "bg-zinc-800/80 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400"
                              : "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] shadow-inner"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className={`block text-xs font-semibold ${
                          isDark ? "text-zinc-300" : "text-slate-700"
                        }`}
                      >
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-50 font-mono">
                          @
                        </span>
                        <input
                          id="input-signup-username"
                          type="text"
                          value={signupUsername}
                          onChange={(e) =>
                            setSignupUsername(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_]/g, "")
                            )
                          }
                          placeholder="alex_cadet"
                          required
                          className={`w-full pl-7 pr-3 py-2 rounded-xl text-xs outline-none transition-all ${
                            isDark
                              ? "bg-zinc-800/80 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400"
                              : "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] shadow-inner"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2 space-y-1">
                      <label
                        className={`block text-xs font-semibold ${
                          isDark ? "text-zinc-300" : "text-slate-700"
                        }`}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                        <input
                          id="input-signup-email"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="alex@domain.com"
                          required
                          className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none transition-all ${
                            isDark
                              ? "bg-zinc-800/80 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400"
                              : "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] shadow-inner"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className={`block text-xs font-semibold ${
                          isDark ? "text-zinc-300" : "text-slate-700"
                        }`}
                      >
                        Age <span className="text-[10px] font-normal opacity-60">(All ages welcome)</span>
                      </label>
                      <input
                        id="input-signup-age"
                        type="number"
                        min="1"
                        max="120"
                        value={signupAge}
                        onChange={(e) => setSignupAge(e.target.value)}
                        placeholder="Any age"
                        className={`w-full px-3 py-2 rounded-xl text-center text-xs outline-none transition-all ${
                          isDark
                            ? "bg-zinc-800/80 border border-zinc-700 text-white focus:border-amber-400"
                            : "bg-white border border-slate-300 text-slate-900 focus:border-[#4F46E5] shadow-inner"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-zinc-300" : "text-slate-700"
                      }`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        id="input-signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className={`w-full pl-8 pr-8 py-2 rounded-xl text-xs outline-none transition-all ${
                          isDark
                            ? "bg-zinc-800/80 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400"
                            : "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] shadow-inner"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {signupPassword && (
                      <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              passwordStrength >= step
                                ? step === 1
                                  ? "bg-rose-500"
                                  : step === 2
                                  ? "bg-amber-400"
                                  : step === 3
                                  ? "bg-sky-400"
                                  : "bg-emerald-500"
                                : isDark
                                ? "bg-zinc-800"
                                : "bg-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`p-2.5 rounded-xl text-[11px] flex items-center gap-2 ${
                      isDark
                        ? "bg-zinc-800/60 border border-zinc-700/60 text-zinc-400"
                        : "bg-white/80 border border-slate-200 text-slate-600"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>A confirmation email will be sent to activate your ID.</span>
                  </div>

                  <button
                    id="btn-submit-signup"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 ${
                      isDark
                        ? "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/20"
                        : "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-500/20"
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create Cadet Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm p-6 rounded-3xl space-y-4 shadow-2xl transition-all ${
              isDark
                ? "bg-zinc-900 border border-zinc-800 text-zinc-100"
                : "bg-white border border-slate-200 text-slate-900 shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound
                  className={`w-4 h-4 ${
                    isDark ? "text-amber-400" : "text-indigo-600"
                  }`}
                />
                <h3 className="font-bold text-sm">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity"
              >
                Close
              </button>
            </div>

            {forgotSent ? (
              <div className="space-y-3 text-center py-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs leading-relaxed opacity-80">
                  Password reset link sent to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className={`w-full py-2 rounded-xl text-xs font-bold ${
                    isDark
                      ? "bg-amber-400 text-zinc-950"
                      : "bg-[#4F46E5] text-white"
                  }`}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs opacity-80">
                  Enter your registered email to receive a password reset link.
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="cadet@domain.com"
                    className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${
                      isDark
                        ? "bg-zinc-800 border border-zinc-700 text-white"
                        : "bg-slate-50 border border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    isDark
                      ? "bg-amber-400 hover:bg-amber-300 text-zinc-950"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  }`}
                >
                  {isForgotLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google Account In-App Sign-In Dialog (Replaces broken 404 popup) */}
      <AnimatePresence>
        {isGoogleAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`w-full max-w-sm rounded-3xl p-6 space-y-4 relative ${
                isDark
                  ? "bg-[#18181B] border-2 border-zinc-700 text-zinc-100 shadow-2xl"
                  : "bg-white border-2 border-slate-300 text-slate-900 shadow-2xl"
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                id="btn-close-google-modal"
                disabled={isGoogleLoggingIn}
                onClick={() => setIsGoogleAccountModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-500/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Google Brand Header */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-white p-1.5 shadow flex items-center justify-center border border-slate-200 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
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
                <div>
                  <h3 className="text-base font-bold tracking-tight">Sign in with Google</h3>
                  <p className="text-[11px] text-zinc-500">Choose an account for NeuroQuest</p>
                </div>
              </div>

              {/* Loading & Auto-Close Status */}
              {isGoogleLoggingIn ? (
                <div className="py-6 text-center space-y-3">
                  {googleLoginSuccess ? (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="space-y-3"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center shadow-lg">
                        <Check className="w-7 h-7 stroke-[3]" />
                      </div>
                      <p className="text-sm font-bold text-emerald-500">Login Successful!</p>
                      <p className="text-[11px] text-zinc-400 font-mono">Cadet account verified • Auto-closing...</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-10 h-10 mx-auto rounded-full bg-indigo-500/10 border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <p className="text-xs font-semibold">Connecting Google Cadet Account...</p>
                      <p className="text-[10px] text-zinc-400 font-mono">Verifying credentials & auto-closing...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Primary Google Account Card */}
                  <button
                    type="button"
                    id="btn-select-google-account-shanthe"
                    onClick={() => handleSelectGoogleAccount("shanthe2021@gmail.com", "Shanthe")}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                      isDark
                        ? "bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 hover:border-amber-400"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-300 hover:border-indigo-400 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-zinc-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        S
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>Shanthe</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500 font-bold">
                            Active
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">
                          shanthe2021@gmail.com
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </button>

                  {/* Secondary option: Other Account */}
                  {isAddingOtherAccount ? (
                    <div
                      className={`p-3 rounded-2xl border space-y-2 ${
                        isDark ? "bg-zinc-850 border-zinc-700" : "bg-white border-slate-300"
                      }`}
                    >
                      <label className="text-[10px] font-mono font-bold block opacity-75">
                        Enter any Google / Gmail address:
                      </label>
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none ${
                          isDark
                            ? "bg-zinc-800 border border-zinc-700 text-white"
                            : "bg-slate-50 border border-slate-300 text-slate-900"
                        }`}
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingOtherAccount(false)}
                          className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!customGoogleEmail.includes("@")}
                          onClick={() => handleSelectGoogleAccount(customGoogleEmail)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all disabled:opacity-50 ${
                            isDark
                              ? "bg-amber-400 text-zinc-950"
                              : "bg-[#4F46E5] text-white"
                          }`}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingOtherAccount(true)}
                      className={`w-full py-2.5 px-3 rounded-xl border border-dashed text-left flex items-center gap-2.5 text-xs transition-colors ${
                        isDark
                          ? "border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500"
                          : "border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400"
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 text-indigo-500" />
                      <span>Use another Google account</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimal Footer */}
      <footer className="relative z-10 text-center py-2 text-[11px] font-mono opacity-50">
        <span>NeuroQuest AI Academy • Secure Cadet Gateway</span>
      </footer>
    </div>
  );
};
