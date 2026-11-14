import React from "react";
import { X, Flame, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppTheme } from "../../types";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  theme?: AppTheme;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = 3;

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
              aria-label="Close Streak modal"
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14]"
                  : "bg-black/[0.05] text-[#6E6E73] hover:bg-black/[0.08] hover:text-[#1D1D1F]"
              }`}
            >
              <X className="w-4 h-4" />
            </motion.button>

            <div className="text-center space-y-2 pt-2">
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                  isDark
                    ? "bg-orange-500/15 text-orange-400"
                    : "bg-orange-500/10 text-orange-600"
                }`}
              >
                <Flame className="w-7 h-7 fill-current" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight tabular-nums">
                {streakDays} Day Streak
              </h2>
              <p
                className={`text-xs max-w-xs mx-auto leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                Complete at least one bite-sized lesson every day to keep your momentum going.
              </p>
            </div>

            {/* Weekly Tracker */}
            <div className="rounded-2xl p-4 space-y-3 apple-surface-muted">
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? "text-zinc-400 font-medium" : "text-[#6E6E73] font-medium"}>
                  This Week
                </span>
                <span className="font-mono tabular-nums font-semibold text-orange-500">
                  4 / 7 Active
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                  const isPast = idx <= currentDayIndex;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-colors ${
                          isPast
                            ? "bg-orange-500 text-white"
                            : isDark
                            ? "bg-[#1C1C1E] text-zinc-500 border border-white/[0.06]"
                            : "bg-white text-[#86868B] border border-black/[0.06]"
                        }`}
                      >
                        {isPast ? <Flame className="w-4 h-4 fill-current" /> : day}
                      </div>
                      <span
                        className={`text-[11px] font-mono ${
                          isDark ? "text-zinc-500" : "text-[#86868B]"
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak Freeze */}
            <div className="flex items-center gap-3 p-4 rounded-2xl apple-surface-muted">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-[#2997FF]/15 text-[#2997FF]"
                    : "bg-[#0071E3]/10 text-[#0071E3]"
                }`}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-semibold">Streak Freeze Active</div>
                <div
                  className={`text-xs mt-0.5 leading-snug ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  One missed day is automatically protected without resetting your streak.
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm transition-colors"
            >
              Continue Learning
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
