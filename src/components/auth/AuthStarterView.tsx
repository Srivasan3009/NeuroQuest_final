import React, { useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  Cloud,
  CheckCircle2,
} from "lucide-react";
import { AppTheme, UserProfile } from "../../types";
import { soundFx } from "../../utils/sound";
import { authService } from "../../services/auth";
import { BrandLogo } from "../layout/BrandLogo";

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isDark =
    activeTheme === "obsidian-noir" ||
    activeTheme === "obsidian-gold" ||
    activeTheme === "neon-matrix" ||
    activeTheme === "cyber-dark";

  const mapFirebaseAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || "";
    switch (code) {
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Sign-in window was closed before completing. Please try again.";
      case "auth/popup-blocked":
        return "Your browser blocked the Google sign-in popup. Please allow popups for this site and retry.";
      case "auth/network-request-failed":
        return "Network connection error. Please check your internet connection and try again.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized for Google Sign-In in Firebase Auth settings.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      default: {
        const msg = err instanceof Error ? err.message : "";
        return msg || "Could not sign in with Google. Please try again.";
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    soundFx.playTap();
    setErrorMessage("");
    setIsGoogleLoading(true);

    try {
      const { user } = await authService.signInWithGoogle();
      soundFx.playMissionComplete();
      onLoginSuccess(user);
    } catch (err) {
      soundFx.playWrong();
      setErrorMessage(mapFirebaseAuthError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      id="neuroquest-auth-container"
      className="min-h-screen relative flex flex-col justify-between px-4 sm:px-8 py-5 transition-colors duration-300"
    >
      {/* Top Minimal Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo theme={activeTheme} isDark={isDark} size="md" showText={true} />
          <span
            className={`hidden sm:inline text-xs font-medium whitespace-nowrap ${
              isDark ? "text-zinc-500" : "text-[#6E6E73]"
            }`}
          >
            · Interactive AI Academy
          </span>
        </div>

        <button
          type="button"
          id="btn-toggle-auth-theme"
          onClick={() => {
            soundFx.playTap();
            onToggleTheme();
          }}
          className={`min-h-[40px] px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-2 border transition-colors ${
            isDark
              ? "bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.08] text-zinc-200"
              : "bg-white hover:bg-zinc-50 border-black/[0.07] text-[#1D1D1F] shadow-xs"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="whitespace-nowrap">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#0071E3]" />
              <span className="whitespace-nowrap">Dark</span>
            </>
          )}
        </button>
      </header>

      {/* Main Centered Apple-Style Card */}
      <main className="flex-1 flex items-center justify-center py-8 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="apple-surface w-full max-w-[440px] rounded-3xl p-7 sm:p-10 space-y-7"
        >
          {/* Headline */}
          <div className="text-center space-y-2.5">
            <p
              className={`text-xs font-medium tracking-wide ${
                isDark ? "text-[#2997FF]" : "text-[#0071E3]"
              }`}
            >
              Welcome to NeuroQuest
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Learn AI with clarity.
            </h1>
            <p
              className={`text-sm leading-relaxed ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              Sign in with Google to save your progress, daily streaks, and guided NeuroBot sessions across all devices.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Google Sign-In Action */}
          <motion.button
            type="button"
            id="btn-google-signin"
            whileHover={{ scale: isGoogleLoading ? 1 : 1.01 }}
            whileTap={{ scale: isGoogleLoading ? 1 : 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className={`w-full min-h-[48px] py-3 px-5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 border transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              isDark
                ? "bg-white hover:bg-zinc-100 text-[#1D1D1F] border-transparent shadow-sm"
                : "bg-[#1D1D1F] hover:bg-[#323236] text-white border-transparent shadow-sm"
            }`}
          >
            {isGoogleLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
              </>
            )}
          </motion.button>

          {/* Grouped Feature Summary List (Hairline-divided, zero box clutter) */}
          <div
            className={`pt-2 border-t divide-y ${
              isDark
                ? "border-white/[0.08] divide-white/[0.06]"
                : "border-black/[0.06] divide-black/[0.05]"
            }`}
          >
            <div className="py-3 flex items-start gap-3">
              <Cloud
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                }`}
              />
              <div>
                <div className="text-xs font-semibold">Cloud Progress Sync</div>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                  Quests, XP, Sparks, and streaks sync automatically.
                </p>
              </div>
            </div>

            <div className="py-3 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold">Private Google Auth</div>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                  Fast one-tap sign-in with protected profile storage.
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold">Self-Paced Curriculum</div>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                  Bite-sized interactive AI lessons designed for everyone.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer
        className={`text-center py-2 text-xs ${
          isDark ? "text-zinc-500" : "text-[#6E6E73]"
        }`}
      >
        NeuroQuest AI Academy · Secure Learning Gateway
      </footer>
    </div>
  );
};
