import React, { useState } from "react";
import { X, Gift, Sparkles, Zap, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { soundFx } from "../../utils/sound";
import { AppTheme } from "../../types";

interface DailyGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (sparks: number, xp: number) => void;
  theme?: AppTheme;
}

export const DailyGiftModal: React.FC<DailyGiftModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
  theme = "neumorphic",
}) => {
  const [opened, setOpened] = useState(false);

  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const handleOpenChest = () => {
    if (opened) return;
    setOpened(true);
    soundFx.playChestOpen();
    onClaimReward(15, 50);
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
            className={`relative z-10 w-full max-w-md rounded-3xl p-6 space-y-5 text-center apple-surface ${
              isDark ? "text-zinc-100" : "text-[#1D1D1F]"
            }`}
          >
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              aria-label="Close Daily Gift modal"
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14]"
                  : "bg-black/[0.05] text-[#6E6E73] hover:bg-black/[0.08] hover:text-[#1D1D1F]"
              }`}
            >
              <X className="w-4 h-4" />
            </motion.button>

            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#0071E3] dark:text-[#2997FF]">
                Daily Surprise
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {opened ? "Reward Unlocked" : "Your Daily Mystery Gift"}
              </h2>
              <p
                className={`text-xs max-w-xs mx-auto leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                {opened
                  ? "Today's rewards have been added. Check back tomorrow for another gift."
                  : "Tap the chest below to collect bonus Sparks and experience points."}
              </p>
            </div>

            {/* Gift Tile */}
            <div className="py-3">
              <motion.button
                whileHover={!opened ? { scale: 1.04 } : {}}
                whileTap={!opened ? { scale: 0.95 } : {}}
                onClick={handleOpenChest}
                disabled={opened}
                className={`relative w-24 h-24 mx-auto rounded-3xl flex items-center justify-center transition-colors ${
                  opened
                    ? isDark
                      ? "bg-amber-400/15 text-amber-400"
                      : "bg-amber-500/10 text-amber-600"
                    : isDark
                    ? "bg-[#2C2C2E] hover:bg-[#3A3A3C] text-[#2997FF] cursor-pointer"
                    : "bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#0071E3] cursor-pointer"
                }`}
              >
                {opened ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  >
                    <Sparkles className="w-11 h-11" />
                  </motion.div>
                ) : (
                  <Gift className="w-11 h-11" />
                )}
              </motion.button>
            </div>

            {opened ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl flex flex-col items-center apple-surface-muted">
                    <Zap className="w-5 h-5 text-amber-500 fill-current mb-1" />
                    <span className="text-lg font-bold font-mono tabular-nums">+15</span>
                    <span className={`text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                      Sparks Added
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl flex flex-col items-center apple-surface-muted">
                    <Award className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF] mb-1" />
                    <span className="text-lg font-bold font-mono tabular-nums">+50</span>
                    <span className={`text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                      XP Earned
                    </span>
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
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenChest}
                className="w-full py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm transition-colors"
              >
                Open Daily Gift
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
