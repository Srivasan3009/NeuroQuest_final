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
  const isNeumorphic = theme === "neumorphic";
  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";

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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`relative z-10 w-full max-w-md rounded-3xl p-6 space-y-5 text-center transition-all ${
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

            <div className="space-y-2 pt-2">
              <div
                className={`text-[10px] font-mono uppercase tracking-widest font-black ${
                  isNeumorphic ? "text-indigo-600" : isDark ? "text-amber-400" : "text-[#4F46E5]"
                }`}
              >
                DAILY SURPRISE CHEST
              </div>
              <h2 className="text-2xl font-black uppercase">
                {opened ? "Reward Unlocked!" : "Your Daily Mystery Gift"}
              </h2>
              <p className={`text-xs max-w-xs mx-auto ${isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                {opened
                  ? "You claimed today's rewards! Return tomorrow for another mystery drop."
                  : "Tap the mystery chest to synthesize free Sparks and experience points."}
              </p>
            </div>

            {/* Chest Visual */}
            <div className="py-4">
              <motion.button
                whileHover={!opened ? { scale: 1.08, rotate: [-2, 2, -2, 0] } : {}}
                whileTap={!opened ? { scale: 0.92 } : {}}
                onClick={handleOpenChest}
                disabled={opened}
                className={`relative w-28 h-28 mx-auto rounded-3xl flex items-center justify-center transition-all ${
                  isNeumorphic
                    ? opened
                      ? "neu-inset text-amber-500"
                      : "neu-raised text-indigo-600"
                    : opened
                    ? isDark
                      ? "bg-amber-400/20 border-2 border-amber-400 text-amber-300"
                      : "bg-[#FEF08A] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
                    : isDark
                    ? "bg-[#27272A] border-2 border-[#3F3F46] hover:border-amber-400 text-amber-400 cursor-pointer"
                    : "bg-white border-2 border-[#1E1B18] hover:bg-[#FEF08A] text-[#1E1B18] cursor-pointer shadow-[3px_3px_0px_#1E1B18]"
                }`}
              >
                {opened ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Sparkles className="w-14 h-14 text-amber-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <Gift className="w-14 h-14" />
                  </motion.div>
                )}
              </motion.button>
            </div>

            {opened ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`p-3 rounded-2xl flex flex-col items-center ${
                      isNeumorphic
                        ? "neu-inset"
                        : isDark ? "bg-[#27272A] border-2 border-[#3F3F46]" : "bg-white border-2 border-[#1E1B18]"
                    }`}
                  >
                    <Zap className="w-5 h-5 text-amber-500 fill-current mb-1" />
                    <span className="text-lg font-black font-mono">+15</span>
                    <span className={`text-[11px] ${isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      Sparks Added
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`p-3 rounded-2xl flex flex-col items-center ${
                      isNeumorphic
                        ? "neu-inset"
                        : isDark ? "bg-[#27272A] border-2 border-[#3F3F46]" : "bg-white border-2 border-[#1E1B18]"
                    }`}
                  >
                    <Award className="w-5 h-5 text-[#4F46E5] mb-1" />
                    <span className="text-lg font-black font-mono">+50</span>
                    <span className={`text-[11px] ${isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      XP Earned
                    </span>
                  </motion.div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-transform ${
                    isNeumorphic
                      ? "neu-btn-primary text-white"
                      : isDark
                      ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                      : "bg-[#1E1B18] text-white hover:bg-black shadow-[2px_2px_0px_#1E1B18]"
                  }`}
                >
                  Continue Learning
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleOpenChest}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-transform ${
                  isNeumorphic
                    ? "neu-btn-primary text-white"
                    : isDark
                    ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                    : "bg-[#4F46E5] text-white hover:bg-[#4338CA] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                }`}
              >
                Tap to Open Chest
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
