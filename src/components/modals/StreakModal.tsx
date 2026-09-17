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
  const isNeumorphic = theme === "neumorphic";
  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = 3; // e.g. Thursday

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`relative z-10 w-full max-w-md rounded-3xl p-6 space-y-5 transition-all ${
              isNeumorphic
                ? "neu-raised text-slate-800"
                : isDark
                ? "bg-[#18181B] border-2 border-[#3F3F46] shadow-2xl text-zinc-100"
                : "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] text-[#1E1B18]"
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
                isNeumorphic
                  ? "neu-btn text-slate-600 hover:text-slate-950"
                  : isDark
                  ? "border border-[#3F3F46] text-zinc-400 hover:text-zinc-100"
                  : "border border-[#1E1B18] text-[#1E1B18] bg-white hover:bg-zinc-100"
              }`}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="text-center space-y-2 pt-2">
              <motion.div
                animate={{ scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${
                  isNeumorphic
                    ? "neu-inset text-rose-500"
                    : isDark
                    ? "bg-rose-500/20 border-2 border-rose-400 text-rose-400 shadow-md"
                    : "bg-[#FFE4E6] border-2 border-[#1E1B18] text-[#E11D48] shadow-md"
                }`}
              >
                <Flame className="w-9 h-9 fill-current" />
              </motion.div>
              <h2 className="text-2xl font-black tracking-tight uppercase">
                {streakDays} Day Streak!
              </h2>
              <p className={`text-xs max-w-xs mx-auto ${isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                You're building continuous momentum. Complete at least one bite-sized lesson every day
                to keep your streak alive.
              </p>
            </div>

            {/* Weekly tracker bar */}
            <div
              className={`rounded-2xl p-4 space-y-3 transition-all ${
                isNeumorphic
                  ? "neu-flat"
                  : isDark ? "bg-[#27272A] border-2 border-[#3F3F46]" : "bg-white border-2 border-[#1E1B18]"
              }`}
            >
              <div
                className={`flex items-center justify-between text-xs font-mono ${
                  isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                <span className="font-bold">This Week</span>
                <span className="text-rose-500 font-black">4/7 Active</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                  const isPast = idx <= currentDayIndex;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black font-mono transition-all ${
                          isPast
                            ? isNeumorphic
                              ? "neu-btn-primary text-white"
                              : isDark
                              ? "bg-rose-500 text-zinc-950 border-2 border-rose-400"
                              : "bg-[#FFE4E6] text-[#E11D48] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                            : isNeumorphic
                            ? "neu-inset text-slate-400"
                            : isDark
                            ? "bg-zinc-800 text-zinc-500 border-2 border-zinc-700"
                            : "bg-zinc-100 text-zinc-400 border-2 border-zinc-200"
                        }`}
                      >
                        {isPast ? <Flame className="w-4 h-4 fill-current" /> : day}
                      </motion.div>
                      <span
                        className={`text-[10px] font-mono ${
                          isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak Freeze Shield perk */}
            <div
              className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                isNeumorphic
                  ? "neu-flat"
                  : isDark ? "bg-[#27272A] border-2 border-[#3F3F46]" : "bg-[#EEF2FF] border-2 border-[#1E1B18]"
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  isNeumorphic
                    ? "neu-inset text-indigo-600"
                    : isDark
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                    : "bg-[#4F46E5] text-white border border-[#1E1B18]"
                }`}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-black uppercase">Streak Freeze Active</div>
                <div className={`text-[11px] ${isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  1 missed day will be automatically protected without resetting your counter.
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-transform ${
                isNeumorphic
                  ? "neu-btn-primary text-white"
                  : isDark
                  ? "bg-rose-500 text-zinc-950 hover:bg-rose-400 shadow-md"
                  : "bg-[#1E1B18] text-white hover:bg-black shadow-[2px_2px_0px_#1E1B18]"
              }`}
            >
              Keep Building Momentum
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
