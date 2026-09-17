import React from "react";
import {
  Sparkles,
  Flame,
  User,
  Layers,
  Bot,
  Compass,
  LayoutDashboard,
  Terminal,
  ShieldCheck
} from "lucide-react";
import { UserProfile } from "../../types";

interface NavbarProps {
  currentTab: "landing" | "journey" | "dashboard" | "playground";
  onTabChange: (tab: "landing" | "journey" | "dashboard" | "playground") => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenTutor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  onOpenAuth,
  onOpenTutor,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          id="brand-logo"
          onClick={() => onTabChange("landing")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-sans font-bold text-lg text-slate-100 tracking-tight">NeuroQuest</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
              EDTECH
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 rounded-full p-1">
          <button
            id="nav-journey-btn"
            onClick={() => onTabChange("journey")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "journey"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Learning Journey</span>
          </button>

          <button
            id="nav-playground-btn"
            onClick={() => onTabChange("playground")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "playground"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>AI Playground</span>
          </button>

          <button
            id="nav-dashboard-btn"
            onClick={() => onTabChange("dashboard")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "dashboard"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Right Stats & Auth Menu */}
        <div className="flex items-center gap-2.5">
          {/* Neuro AI Quick Summon */}
          <button
            id="navbar-tutor-trigger"
            onClick={onOpenTutor}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            title="Ask Neuro AI Tutor"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Neuro AI</span>
          </button>

          {/* Gamification Stats */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1 text-xs font-mono">
            {/* Streak */}
            <div className="flex items-center gap-1 text-orange-400" title="Active Learning Streak">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold">{user.streakDays}d</span>
            </div>

            <span className="text-slate-700">|</span>

            {/* XP */}
            <div className="flex items-center gap-1 text-amber-400" title="Total Accumulated XP">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-bold">{user.xp} XP</span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Level */}
            <div className="hidden sm:flex items-center gap-1 text-cyan-400" title="Learner Level">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-bold">Lv {user.level}</span>
            </div>
          </div>

          {/* User Profile / Auth Button */}
          <button
            id="auth-profile-trigger"
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1 pl-2 pr-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-sans text-slate-200 transition-colors"
          >
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover border border-cyan-500/40"
            />
            <span className="font-medium truncate max-w-[80px] hidden sm:inline">
              {user.fullName.split(" ")[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-slate-950/90 py-1.5 px-2">
        <button
          onClick={() => onTabChange("journey")}
          className={`flex items-center gap-1 text-xs font-mono py-1 px-3 rounded ${
            currentTab === "journey" ? "text-cyan-400 font-bold bg-slate-900" : "text-slate-400"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Journey</span>
        </button>
        <button
          onClick={() => onTabChange("playground")}
          className={`flex items-center gap-1 text-xs font-mono py-1 px-3 rounded ${
            currentTab === "playground" ? "text-cyan-400 font-bold bg-slate-900" : "text-slate-400"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Playground</span>
        </button>
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex items-center gap-1 text-xs font-mono py-1 px-3 rounded ${
            currentTab === "dashboard" ? "text-cyan-400 font-bold bg-slate-900" : "text-slate-400"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
      </div>
    </header>
  );
};
