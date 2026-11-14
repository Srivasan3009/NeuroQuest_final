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
  theme = "neumorphic",
}) => {
  const tabs = [
    { id: "home" as NavTab, label: "Learn", icon: Home },
    { id: "lab" as NavTab, label: "Goals", icon: FlaskConical },
    { id: "league" as NavTab, label: "League", icon: Trophy },
    { id: "you" as NavTab, label: "Profile", icon: User },
  ];

  const handleTabClick = (tab: NavTab) => {
    soundFx.playTap();
    onSelectTab(tab);
  };

  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  return (
    <motion.nav
      id="app-bottom-dock"
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-5 z-40 sm:w-auto sm:min-w-[400px] apple-glass-dock rounded-full"
    >
      <div className="flex items-center justify-around sm:justify-center sm:gap-1.5 p-1.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              onClick={() => handleTabClick(tab.id)}
              className={`relative min-h-[44px] flex-1 sm:flex-initial sm:min-w-[88px] flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? isDark
                    ? "text-white"
                    : "text-[#0071E3]"
                  : isDark
                  ? "text-zinc-300/80 hover:text-white"
                  : "text-[#1D1D1F]/70 hover:text-[#1D1D1F]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="apple-bottom-nav-pill"
                  transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.8 }}
                  className={`absolute inset-0 rounded-full -z-10 ${
                    isDark
                      ? "bg-white/[0.15] border border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                      : "bg-white/75 border border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_10px_rgba(0,113,227,0.12)]"
                  }`}
                />
              )}
              <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
              <span className="text-[11px] sm:text-xs font-medium tracking-tight">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
