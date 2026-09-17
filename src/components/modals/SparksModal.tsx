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

  const isNeumorphic = theme === "neumorphic";
  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";

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

            {/* Big Sparks Header */}
            <div className="text-center space-y-2 pt-2">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${
                  isNeumorphic
                    ? "neu-inset text-amber-500"
                    : isDark
                    ? "bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-md"
                    : "bg-[#FEF08A] border-2 border-[#1E1B18] text-[#1E1B18] shadow-md"
                }`}
              >
                <Zap className="w-9 h-9 fill-current" />
              </motion.div>
              <h2 className="text-2xl font-black tracking-tight uppercase">
                {currentSparks} Sparks
              </h2>
              <p
                className={`text-xs max-w-xs mx-auto ${
                  isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Sparks power deep queries with NEUROBOT. Each AI tutor response consumes 2 Sparks.
              </p>
            </div>

            {/* Demo Reward Card */}
            <div
              className={`rounded-2xl p-4 space-y-3 transition-all ${
                isNeumorphic
                  ? "neu-flat"
                  : isDark
                  ? "bg-[#27272A] border-2 border-[#3F3F46]"
                  : "bg-[#FEF08A]/40 border-2 border-[#1E1B18]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-wide">
                    Quick AI Demo
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${
                    isNeumorphic
                      ? "neu-inset text-amber-600"
                      : isDark
                      ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                      : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
                  }`}
                >
                  +5 Sparks
                </span>
              </div>

              <p className={`text-xs leading-relaxed ${isNeumorphic ? "text-slate-600" : isDark ? "text-zinc-400" : "text-zinc-700"}`}>
                Watch a 2-second interactive AI research snapshot to immediately recharge 5 free Sparks.
              </p>

              {isPlayingDemo ? (
                <div className="space-y-1.5 pt-1">
                  <div
                    className={`flex items-center justify-between text-[11px] font-mono font-bold ${
                      isNeumorphic ? "text-amber-600" : isDark ? "text-amber-400" : "text-[#4F46E5]"
                    }`}
                  >
                    <span>Calibrating Neural Weights...</span>
                    <span>{demoProgress}%</span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${isNeumorphic ? "neu-inset" : "bg-zinc-200 dark:bg-zinc-800 border border-zinc-400"}`}>
                    <motion.div
                      className="h-full bg-amber-400"
                      animate={{ width: `${demoProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : claimed ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-2 text-emerald-600 dark:text-emerald-400 text-xs font-black font-mono"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>+5 Sparks Added to Balance!</span>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleWatchDemo}
                  className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-transform ${
                    isNeumorphic
                      ? "neu-btn-primary text-white"
                      : isDark
                      ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md"
                      : "bg-[#1E1B18] text-white hover:bg-black shadow-[2px_2px_0px_#1E1B18]"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Demo & Earn +5 Sparks</span>
                </motion.button>
              )}
            </div>

            {/* Tips on earning sparks card */}
            <div
              className={`rounded-2xl p-4 space-y-2 transition-all ${
                isNeumorphic
                  ? "neu-flat"
                  : isDark
                  ? "bg-[#27272A] border-2 border-[#3F3F46]"
                  : "bg-[#EEF2FF] border-2 border-[#1E1B18]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isNeumorphic ? "text-indigo-600" : isDark ? "text-amber-300" : "text-[#4F46E5]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>How to Earn Sparks</span>
                </span>
              </div>
              <p className={`text-xs ${isNeumorphic ? "text-slate-600" : isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                Complete quests (+10 Sparks), claim your Daily Mystery Gift, maintain daily streaks, and watch quick interactive demos to replenish Sparks anytime!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
