import React from "react";
import {
  Home,
  FlaskConical,
  Trophy,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { soundFx } from "../../utils/sound";
import { AppTheme } from "../../types";

export type NavTab = "home" | "lab" | "league" | "you";

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  theme?: AppTheme;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  theme = "riso-pop",
}) => {
  const tabs = [
    { id: "home" as NavTab, label: "HOME", icon: Home },
    { id: "lab" as NavTab, label: "LAB", icon: FlaskConical },
    { id: "league" as NavTab, label: "LEAGUE", icon: Trophy },
    { id: "you" as NavTab, label: "YOU", icon: User },
  ];

  const handleTabClick = (tab: NavTab) => {
    soundFx.playTap();
    onSelectTab(tab);
  };

  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";
  const isNeumorphic = theme === "neumorphic";

  return (
    <motion.nav
      id="app-bottom-dock"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`fixed bottom-0 inset-x-0 z-40 transition-all duration-300 md:bottom-5 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl md:rounded-2xl ${
        isNeumorphic
          ? "bg-[#E2E8F0]/95 backdrop-blur-md border-t md:border border-white/80 shadow-[0_-8px_20px_rgba(163,177,198,0.5)] md:shadow-[0_8px_32px_rgba(163,177,198,0.45)]"
          : isDark
          ? "bg-[#18181B]/95 backdrop-blur-md border-t md:border border-[#27272A] shadow-lg md:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          : "bg-[#FBF9F4]/95 backdrop-blur-md border-t-2 md:border-2 border-[#1E1B18] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:shadow-[4px_4px_0px_#1E1B18]"
      }`}
    >
      <div className="flex items-center justify-around px-3 sm:px-6 py-2 sm:py-2.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          if (isNeumorphic) {
            return (
              <motion.button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-all ${
                  isActive
                    ? "neu-inset text-[#4F46E5] font-black scale-95"
                    : "neu-btn text-slate-600 hover:text-slate-900"
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                </motion.div>
                <span className="text-[10px] tracking-wider mt-0.5 font-bold uppercase">
                  {tab.label}
                </span>
              </motion.button>
            );
          }

          if (isDark) {
            return (
              <motion.button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                </motion.div>
                <span className="text-[10px] tracking-wider mt-0.5 font-bold uppercase">
                  {tab.label}
                </span>
              </motion.button>
            );
          }

          // Warm Editorial (Default)
          return (
            <motion.button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? "bg-[#4F46E5] text-white font-black shadow-[2px_2px_0px_#1E1B18]"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
              </motion.div>
              <span className="text-[10px] tracking-wider mt-0.5 font-bold uppercase">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
