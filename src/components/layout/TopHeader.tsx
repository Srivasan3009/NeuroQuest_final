import React, { useState } from "react";
import {
  ChevronDown,
  Zap,
  Flame,
  Gift,
  X,
  PlayCircle,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Course, AppTheme } from "../../types";
import { soundFx } from "../../utils/sound";

interface TopHeaderProps {
  user: UserProfile;
  activeCourse: Course;
  onOpenCoursePicker: () => void;
  onOpenSparksModal: () => void;
  onOpenStreakModal: () => void;
  onOpenGiftModal: () => void;
  onToggleTheme?: () => void;
  theme?: AppTheme;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  activeCourse,
  onOpenCoursePicker,
  onOpenSparksModal,
  onOpenStreakModal,
  onOpenGiftModal,
  onToggleTheme,
  theme = "riso-pop",
}) => {
  const [showSparksBanner, setShowSparksBanner] = useState(false);
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";
  const isNeumorphic = theme === "neumorphic";

  const handleSparksClick = () => {
    soundFx.playTap();
    setShowSparksBanner(!showSparksBanner);
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="sticky top-0 z-30 w-full backdrop-blur-md transition-colors duration-300"
    >
      <div
        className={`w-full transition-colors ${
          isNeumorphic
            ? "bg-[#E2E8F0]/95 border-b border-white/80 shadow-[0_4px_12px_rgba(163,177,198,0.4)] text-[#1E293B]"
            : isDark
            ? "bg-[#18181B]/95 border-b border-[#27272A] text-[#F4F4F5]"
            : "bg-[#FBF9F4]/95 border-b-2 border-[#1E1B18] text-[#1E1B18]"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Choose Course Button */}
          <motion.button
            id="btn-choose-course"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundFx.playTap();
              onOpenCoursePicker();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              isNeumorphic
                ? "neu-btn text-slate-800"
                : isDark
                ? "bg-[#27272A] border border-[#3F3F46] text-[#F4F4F5] hover:border-amber-400/60"
                : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] font-black shadow-[2px_2px_0px_#1E1B18]"
            }`}
          >
            <div className="flex flex-col text-left">
              <span
                className={`text-[9px] uppercase tracking-wider font-extrabold ${
                  isNeumorphic
                    ? "text-[#4F46E5] font-black"
                    : isDark
                    ? "text-amber-400 font-mono"
                    : "text-[#4F46E5] font-black"
                }`}
              >
                CHOOSE COURSE
              </span>
              <span
                className={`text-xs font-bold truncate max-w-[120px] sm:max-w-[200px] md:max-w-[260px] ${
                  isNeumorphic ? "text-slate-800" : isDark ? "text-[#F4F4F5]" : "text-[#1E1B18]"
                }`}
              >
                {activeCourse.title}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 ml-0.5 shrink-0 transition-transform ${
                isNeumorphic ? "text-[#4F46E5]" : isDark ? "text-amber-400" : "text-[#1E1B18]"
              }`}
            />
          </motion.button>

          {/* Center Brand Identity */}
          <div className="hidden md:flex items-center gap-2">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`text-xs font-black tracking-widest uppercase font-mono px-2.5 py-1 rounded-lg ${
                isNeumorphic
                  ? "neu-inset text-indigo-600"
                  : isDark
                  ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                  : "bg-[#EEF2FF] text-[#4F46E5] border border-[#1E1B18]"
              }`}
            >
              ✦ NEUROQUEST AI
            </motion.span>
          </div>

          {/* Right Stats: Theme Toggle ☀️🌙, Sparks ⚡, Streak 🔥, Gift 🎁 */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dark / Light Mode Toggle */}
            <motion.button
              id="btn-theme-toggle-top"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                soundFx.playTap();
                onToggleTheme?.();
              }}
              className={`flex items-center p-1 rounded-xl transition-all ${
                isNeumorphic
                  ? "neu-inset border border-slate-300/60"
                  : isDark
                  ? "bg-[#202023] border border-[#3F3F46] hover:border-amber-400/50"
                  : "bg-[#F3EFE6] border-2 border-[#1E1B18] shadow-[1.5px_1.5px_0px_#1E1B18]"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span
                className={`flex items-center gap-1 p-1 rounded-lg text-[10px] font-mono font-bold transition-all duration-200 ${
                  !isDark
                    ? isNeumorphic
                      ? "neu-raised text-amber-500 shadow-sm"
                      : "bg-[#FEF08A] text-[#1E1B18] font-black border border-[#1E1B18]"
                    : "text-zinc-500 hover:text-zinc-300 opacity-60"
                }`}
              >
                <Sun className={`w-3.5 h-3.5 stroke-[2.5] ${!isDark ? "fill-amber-400/40 text-amber-500" : ""}`} />
              </span>

              <span
                className={`flex items-center gap-1 p-1 rounded-lg text-[10px] font-mono font-bold transition-all duration-200 ${
                  isDark
                    ? "bg-amber-400/20 text-amber-300 font-black border border-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                    : isNeumorphic
                    ? "text-slate-400 hover:text-slate-600 opacity-60"
                    : "text-zinc-500 hover:text-zinc-700 opacity-60"
                }`}
              >
                <Moon className={`w-3.5 h-3.5 stroke-[2.5] ${isDark ? "fill-amber-400/30 text-amber-400" : ""}`} />
              </span>
            </motion.button>

            {/* Sparks Pill */}
            <motion.button
              id="btn-sparks-pill"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSparksClick}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-transform ${
                isNeumorphic
                  ? "neu-pill-accent text-amber-600 font-black"
                  : isDark
                  ? "bg-amber-950/40 border border-amber-500/40 text-amber-300"
                  : "bg-[#FEF08A] border-2 border-[#1E1B18] text-[#1E1B18] font-black shadow-[1.5px_1.5px_0px_#1E1B18]"
              }`}
            >
              <Zap className={`w-4 h-4 fill-current ${isNeumorphic ? "text-amber-500" : isDark ? "text-amber-400" : "text-[#1E1B18]"}`} />
              <span className="text-xs font-mono font-black">{user.sparks ?? 45}</span>
            </motion.button>

            {/* Streak Pill */}
            <motion.button
              id="btn-streak-pill"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                soundFx.playTap();
                onOpenStreakModal();
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-transform ${
                isNeumorphic
                  ? "neu-pill-accent text-rose-600 font-black"
                  : isDark
                  ? "bg-rose-950/40 border border-rose-500/40 text-rose-300"
                  : "bg-[#FFEDD5] border-2 border-[#1E1B18] text-[#1E1B18] font-black shadow-[1.5px_1.5px_0px_#1E1B18]"
              }`}
            >
              <Flame className={`w-4 h-4 fill-current ${isNeumorphic ? "text-rose-500" : isDark ? "text-rose-400" : "text-[#E11D48]"}`} />
              <span className="text-xs font-mono font-black">{user.streakDays || 1}</span>
            </motion.button>

            {/* Gift Box */}
            <motion.button
              id="btn-gift-box"
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                soundFx.playTap();
                onOpenGiftModal();
              }}
              className={`p-2 rounded-xl transition-transform ${
                isNeumorphic
                  ? "neu-btn text-emerald-600 hover:text-emerald-700"
                  : isDark
                  ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400"
                  : "bg-[#99F6E4] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[1.5px_1.5px_0px_#1E1B18]"
              }`}
              title="Daily Mystery Reward"
            >
              <Gift className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sparks Popover Banner */}
      <AnimatePresence>
        {showSparksBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1 overflow-hidden"
          >
            <div
              id="sparks-notice-banner"
              className={`px-4 py-3 my-2 rounded-2xl relative transition-all ${
                isNeumorphic
                  ? "neu-raised text-slate-800"
                  : isDark
                  ? "bg-[#27272A] border border-[#3F3F46] text-[#F4F4F5] shadow-xl"
                  : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
              }`}
            >
              <button
                onClick={() => setShowSparksBanner(false)}
                className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-2.5 pr-6">
                <div
                  className={`p-1.5 rounded-xl shrink-0 ${
                    isDark ? "bg-amber-500/20 text-amber-400" : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span>SPARKS</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        isDark ? "bg-[#18181B] text-amber-400 border border-amber-500/30" : "bg-amber-100 text-[#1E1B18] border border-[#1E1B18]"
                      }`}
                    >
                      {user.sparks ?? 45} Available
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed font-sans ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    Low on Sparks? Tap below to watch a quick demo and earn more. NEUROBOT tutoring costs 2
                    Sparks per answer.
                  </p>
                  <div className="flex items-center gap-2 pt-1.5">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowSparksBanner(false);
                        onOpenSparksModal();
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                        isDark
                          ? "bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold"
                          : "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-[2px_2px_0px_#1E1B18]"
                      }`}
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Get +5 Sparks Free</span>
                    </motion.button>
                    <span className="text-[10px] text-zinc-500 font-mono">TAP TO OPEN • X = CLOSE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
