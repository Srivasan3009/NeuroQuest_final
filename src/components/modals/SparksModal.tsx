import React, { useState } from "react";
import { X, Zap, Play, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { soundFx } from "../../utils/sound";
import { AppTheme } from "../../types";

interface SparksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSparks: number;
  onAddSparks: (amount: number) => void;
  theme?: AppTheme;
}

export const SparksModal: React.FC<SparksModalProps> = ({
  isOpen,
  onClose,
  currentSparks,
  onAddSparks,
  theme = "neumorphic",
}) => {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [claimed, setClaimed] = useState(false);

  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const handleWatchDemo = () => {
    setIsPlayingDemo(true);
    setDemoProgress(0);
    soundFx.playTap();

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setDemoProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsPlayingDemo(false);
        setClaimed(true);
        soundFx.playSpark();
        onAddSparks(5);
        setTimeout(() => setClaimed(false), 3000);
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full max-w-md rounded-3xl p-6 space-y-5 apple-surface ${
              isDark ? "text-zinc-100" : "text-[#1D1D1F]"
            }`}
          >
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              aria-label="Close Sparks modal"
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14]"
                  : "bg-black/[0.05] text-[#6E6E73] hover:bg-black/[0.08] hover:text-[#1D1D1F]"
              }`}
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Balance Header */}
            <div className="text-center space-y-2 pt-2">
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                  isDark
                    ? "bg-amber-400/15 text-amber-400"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                <Zap className="w-7 h-7 fill-current" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight tabular-nums">
                {currentSparks} Sparks
              </h2>
              <p
                className={`text-xs max-w-xs mx-auto leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                Sparks power your study progression, unlocks, and deep AI tutoring sessions.
              </p>
            </div>

            {/* Quick Recharge Card */}
            <div className="rounded-2xl p-4 space-y-3 apple-surface-muted">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold">Quick AI Snapshot</span>
                </div>
                <span
                  className={`text-xs font-mono tabular-nums font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                    isDark
                      ? "bg-amber-400/15 text-amber-300"
                      : "bg-amber-500/10 text-amber-700"
                  }`}
                >
                  +5 Sparks
                </span>
              </div>

              <p
                className={`text-xs leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                Run a 2-second interactive calibration snapshot to earn 5 Sparks right away.
              </p>

              {isPlayingDemo ? (
                <div className="space-y-2 pt-1">
                  <div
                    className={`flex items-center justify-between text-xs font-mono tabular-nums ${
                      isDark ? "text-zinc-300" : "text-[#1D1D1F]"
                    }`}
                  >
                    <span>Calibrating neural weights...</span>
                    <span>{demoProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden neu-progress-track">
                    <motion.div
                      className="h-full bg-[#0071E3] rounded-full"
                      animate={{ width: `${demoProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : claimed ? (
                <motion.div
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>+5 Sparks added to your balance</span>
                </motion.div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWatchDemo}
                  className="w-full py-2.5 px-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Snapshot & Earn +5 Sparks</span>
                </motion.button>
              )}
            </div>

            {/* Guide Box */}
            <div className="rounded-2xl p-4 space-y-1.5 apple-surface-muted">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] dark:text-[#2997FF]">
                <Sparkles className="w-4 h-4" />
                <span>How to Earn More</span>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                Complete quests (+10 Sparks), open your Daily Mystery Gift, keep your study streak alive, or run quick snapshots anytime.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
