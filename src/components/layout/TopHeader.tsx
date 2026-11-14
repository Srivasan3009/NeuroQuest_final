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
import { BrandLogo } from "./BrandLogo";

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
  theme = "neumorphic",
}) => {
  const [showSparksBanner, setShowSparksBanner] = useState(false);
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const handleSparksClick = () => {
    soundFx.playTap();
    setShowSparksBanner((prev) => !prev);
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 w-full px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pointer-events-none"
    >
      <div
        className={`pointer-events-auto w-full max-w-6xl mx-auto apple-glass-dock rounded-2xl sm:rounded-full px-3 sm:px-5 h-15 flex items-center justify-between gap-2 sm:gap-4 ${
          isDark ? "text-[#F5F5F7]" : "text-[#1D1D1F]"
        }`}
      >
        {/* Left: Course Switcher */}
        <motion.button
          id="btn-choose-course"
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            soundFx.playTap();
            onOpenCoursePicker();
          }}
          className={`min-h-[40px] flex items-center gap-2 px-3 py-1.5 rounded-full apple-glass-pill ${
            isDark ? "text-[#F5F5F7]" : "text-[#1D1D1F]"
          }`}
        >
          <div className="flex flex-col text-left">
            <span
              className={`text-[10px] font-medium leading-none mb-0.5 ${
                isDark ? "text-[#2997FF]" : "text-[#0071E3]"
              }`}
            >
              Track
            </span>
            <span className="text-xs font-semibold truncate max-w-[100px] sm:max-w-[180px] md:max-w-[230px]">
              {activeCourse.title}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-65" />
        </motion.button>

        {/* Center: Brand Identity */}
        <div className="flex items-center">
          <BrandLogo
            theme={theme}
            isDark={isDark}
            size="md"
            showText={true}
          />
        </div>

        {/* Right: Frosted Glass Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle */}
          <motion.button
            id="btn-theme-toggle-top"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              soundFx.playTap();
              onToggleTheme?.();
            }}
            className="min-h-[38px] flex items-center p-0.5 rounded-full apple-glass-pill"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span
              className={`p-1.5 rounded-full transition-all duration-250 ${
                !isDark
                  ? "bg-white/90 text-amber-500 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </span>
            <span
              className={`p-1.5 rounded-full transition-all duration-250 ${
                isDark
                  ? "bg-white/[0.16] text-amber-300 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </span>
          </motion.button>

          {/* Sparks Button */}
          <motion.button
            id="btn-sparks-pill"
            whileTap={{ scale: 0.95 }}
            onClick={handleSparksClick}
            className={`min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold tabular-nums whitespace-nowrap apple-glass-pill ${
              isDark ? "text-amber-300" : "text-amber-700"
            }`}
            title="Sparks Balance"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{user.sparks ?? 45}</span>
          </motion.button>

          {/* Streak Button */}
          <motion.button
            id="btn-streak-pill"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundFx.playTap();
              onOpenStreakModal();
            }}
            className={`min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold tabular-nums whitespace-nowrap apple-glass-pill ${
              isDark ? "text-orange-300" : "text-orange-600"
            }`}
            title="Learning Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{user.streakDays || 1}</span>
          </motion.button>

          {/* Gift Button */}
          <motion.button
            id="btn-gift-box"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              soundFx.playTap();
              onOpenGiftModal();
            }}
            className={`min-h-[38px] min-w-[38px] p-2 rounded-full flex items-center justify-center apple-glass-pill ${
              isDark ? "text-emerald-400" : "text-emerald-600"
            }`}
            title="Daily Mystery Reward"
          >
            <Gift className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Sparks Popover Banner */}
      <AnimatePresence>
        {showSparksBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-full max-w-6xl mx-auto pt-2"
          >
            <div
              id="sparks-notice-banner"
              className={`apple-surface px-4 py-3.5 rounded-2xl relative flex items-start gap-3 ${
                isDark ? "text-[#F5F5F7]" : "text-[#1D1D1F]"
              }`}
            >
              <button
                onClick={() => setShowSparksBanner(false)}
                className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
                  isDark
                    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
                    : "text-zinc-500 hover:bg-black/5 hover:text-zinc-800"
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-500/10 text-amber-600"
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div className="space-y-1.5 pr-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Sparks Balance</span>
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      isDark ? "text-amber-300" : "text-amber-700"
                    }`}
                  >
                    · {user.sparks ?? 45} available
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                  Sparks power deep tutoring sessions with NeuroBot (2 Sparks per AI reply). Watch a brief interactive preview to add 5 Sparks anytime.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setShowSparksBanner(false);
                      onOpenSparksModal();
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Recharge +5 Sparks</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
