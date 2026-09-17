import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Trophy,
  Flame,
  Cpu,
  Zap,
  Calendar,
  Award,
  GraduationCap,
  Crosshair,
  Network,
  Layers,
  Bot,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Check,
  Lock,
  ChevronRight,
  Info,
  X,
  PlusCircle,
  RotateCcw
} from "lucide-react";
import { UserProfile, AppTheme, MilestoneBadge, Stage } from "../../types";
import { computeMilestoneBadges, getAchievementsSummary } from "../../utils/achievements";
import { soundFx } from "../../utils/sound";

interface AchievementsProps {
  user: UserProfile;
  stages?: Stage[];
  onBack: () => void;
  onSetStreakDays?: (days: number) => void;
  onCompleteFoundationQuest?: () => void;
  onResetProgress?: () => void;
  theme?: AppTheme;
}

export const Achievements: React.FC<AchievementsProps> = ({
  user,
  stages,
  onBack,
  onSetStreakDays,
  onCompleteFoundationQuest,
  onResetProgress,
  theme = "neumorphic"
}) => {
  const isNeumorphic = theme === "neumorphic";
  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";
  const isRiso = !isDark && !isNeumorphic;

  // Filter and Category States
  const [filterStatus, setFilterStatus] = useState<"all" | "earned" | "in-progress">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);
  const [showSimBench, setShowSimBench] = useState(false);

  // Compute live badges
  const badges = useMemo(() => computeMilestoneBadges(user, stages), [user, stages]);
  const summary = useMemo(() => getAchievementsSummary(badges), [badges]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      // Status filter
      if (filterStatus === "earned" && !b.isEarned) return false;
      if (filterStatus === "in-progress" && b.isEarned) return false;

      // Category filter
      if (selectedCategory !== "all" && b.category !== selectedCategory) return false;

      return true;
    });
  }, [badges, filterStatus, selectedCategory]);

  // Icon mapping
  const renderBadgeIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "Flame":
        return <Flame className={className} />;
      case "Cpu":
        return <Cpu className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Calendar":
        return <Calendar className={className} />;
      case "Award":
        return <Award className={className} />;
      case "GraduationCap":
        return <GraduationCap className={className} />;
      case "Crosshair":
        return <Crosshair className={className} />;
      case "Network":
        return <Network className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "Bot":
        return <Bot className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "TrendingUp":
        return <TrendingUp className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  const getRarityBadgeStyle = (rarity: MilestoneBadge["rarity"]) => {
    switch (rarity) {
      case "legendary":
        return isDark
          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
          : "bg-amber-100 text-amber-900 border-amber-300";
      case "epic":
        return isDark
          ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
          : "bg-purple-100 text-purple-900 border-purple-300";
      case "rare":
        return isDark
          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
          : "bg-indigo-100 text-indigo-900 border-indigo-300";
      case "common":
      default:
        return isDark
          ? "bg-zinc-800 text-zinc-300 border-zinc-700"
          : "bg-zinc-100 text-zinc-700 border-zinc-300";
    }
  };

  const handleSelectBadge = (badge: MilestoneBadge) => {
    soundFx.playTap();
    setSelectedBadge(badge);
  };

  const handleTestStreak = (days: number) => {
    if (onSetStreakDays) {
      soundFx.playSpark();
      onSetStreakDays(days);
    }
  };

  const handleTestFoundation = () => {
    if (onCompleteFoundationQuest) {
      soundFx.playSpark();
      onCompleteFoundationQuest();
    }
  };

  return (
    <div id="achievements-view" className="space-y-5 pb-28 max-w-lg mx-auto px-4 pt-2 animate-in fade-in duration-200">
      {/* Top Header */}
      <div
        className={`flex items-center justify-between py-2 border-b ${
          isDark ? "border-[#27272A]" : "border-[#1E1B18]"
        }`}
      >
        <button
          id="btn-back-to-profile"
          onClick={() => {
            soundFx.playTap();
            onBack();
          }}
          className={`flex items-center gap-1.5 font-black text-xs uppercase tracking-wider transition-colors ${
            isDark ? "text-zinc-300 hover:text-amber-400" : "text-[#1E1B18] hover:text-[#4F46E5]"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>YOU PROFILE</span>
        </button>

        <div className="flex items-center gap-2">
          <Trophy className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-[#4F46E5]"}`} />
          <span
            className={`text-xs font-black uppercase tracking-wide ${
              isDark ? "text-zinc-100" : "text-[#1E1B18]"
            }`}
          >
            ACHIEVEMENTS
          </span>
        </div>

        {/* Milestone Simulation Toggle */}
        <button
          onClick={() => {
            soundFx.playTap();
            setShowSimBench(!showSimBench);
          }}
          className={`text-[10px] font-mono px-2 py-1 rounded-lg border font-bold ${
            showSimBench
              ? isDark
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-[#FEF08A] text-[#1E1B18] border-[#1E1B18]"
              : isDark
              ? "bg-[#27272A] text-zinc-400 border-zinc-700 hover:text-zinc-200"
              : "bg-white text-zinc-600 border-zinc-300 hover:border-[#1E1B18]"
          }`}
          title="Toggle Milestone Test Bench"
        >
          {showSimBench ? "HIDE SIM" : "TEST BENCH"}
        </button>
      </div>

      {/* Interactive Milestone Testing Bench */}
      {showSimBench && (
        <div
          className={`p-4 rounded-2xl border-2 space-y-3 animate-in slide-in-from-top-2 ${
            isDark
              ? "bg-[#18181B] border-amber-500/50 text-zinc-200"
              : "bg-[#FFF9EA] border-[#1E1B18] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black uppercase">MILESTONE TEST BENCH</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Live preview triggers</span>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            Quickly trigger milestone thresholds to inspect unlocked badge states and sound feedback:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleTestStreak(7)}
              className={`p-2 rounded-xl border text-left flex items-center justify-between font-mono text-[11px] font-bold transition-all active:scale-95 ${
                user.streakDays >= 7
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : isDark
                  ? "bg-[#27272A] border-zinc-700 hover:border-amber-400"
                  : "bg-white border-[#1E1B18] hover:bg-[#FEF08A]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>7-Day Streak</span>
              </span>
              <span className="text-[10px]">{user.streakDays >= 7 ? "✓ Active" : "Set 7d"}</span>
            </button>

            <button
              onClick={() => handleTestStreak(4)}
              className={`p-2 rounded-xl border text-left flex items-center justify-between font-mono text-[11px] font-bold transition-all active:scale-95 ${
                isDark
                  ? "bg-[#27272A] border-zinc-700 hover:border-zinc-500"
                  : "bg-white border-[#1E1B18] hover:bg-zinc-100"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset to 4d</span>
              </span>
              <span className="text-[10px]">{user.streakDays}d</span>
            </button>

            <button
              onClick={handleTestFoundation}
              className={`p-2 rounded-xl border text-left flex items-center justify-between font-mono text-[11px] font-bold transition-all active:scale-95 ${
                user.completedQuestIds?.includes("quest-1")
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : isDark
                  ? "bg-[#27272A] border-zinc-700 hover:border-indigo-400"
                  : "bg-white border-[#1E1B18] hover:bg-[#EEF2FF]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>Foundations Q1</span>
              </span>
              <span className="text-[10px]">
                {user.completedQuestIds?.includes("quest-1") ? "✓ Done" : "+ Complete"}
              </span>
            </button>

            <button
              onClick={() => handleTestStreak(14)}
              className={`p-2 rounded-xl border text-left flex items-center justify-between font-mono text-[11px] font-bold transition-all active:scale-95 ${
                user.streakDays >= 14
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : isDark
                  ? "bg-[#27272A] border-zinc-700 hover:border-amber-400"
                  : "bg-white border-[#1E1B18] hover:bg-[#FEF08A]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>14-Day Streak</span>
              </span>
              <span className="text-[10px]">{user.streakDays >= 14 ? "✓ 14d" : "Set 14d"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Overall Progress Showcase Card */}
      <div
        className={`p-5 rounded-3xl space-y-4 transition-all ${
          isNeumorphic
            ? "neu-raised text-slate-800"
            : isDark
            ? "bg-[#27272A] border-2 border-[#3F3F46] text-zinc-100 shadow-xl"
            : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div
              className={`text-[10px] font-mono font-black uppercase tracking-widest ${
                isNeumorphic ? "text-[#4F46E5]" : isDark ? "text-amber-400" : "text-[#4F46E5]"
              }`}
            >
              MASTER MILESTONES
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">EARNED BADGES</h1>
            <p className={`text-xs ${isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Unlock permanent credentials by conquering daily streaks and stage curricula.
            </p>
          </div>

          <div
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
              isNeumorphic
                ? "neu-flat text-indigo-600"
                : isDark
                ? "bg-amber-500/10 border-2 border-amber-400/80 text-amber-400 shadow-lg"
                : "bg-[#FEF08A] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
            }`}
          >
            <Trophy className="w-7 h-7" />
            <span className="text-[10px] font-mono font-black">{summary.percent}%</span>
          </div>
        </div>

        {/* Big Striped Progress Bar */}
        <div className="space-y-1.5">
          <div className={`flex items-center justify-between text-xs font-mono font-bold ${isNeumorphic ? "text-slate-600" : ""}`}>
            <span>
              {summary.earned} of {summary.total} Unlocked
            </span>
            <span className={isNeumorphic ? "text-indigo-600 font-black" : ""}>{summary.percent}% Completed</span>
          </div>
          <div
            className={`w-full h-3.5 rounded-full overflow-hidden ${
              isNeumorphic ? "neu-progress-track" : isDark ? "bg-[#18181B] border-2 border-[#3F3F46]" : "bg-zinc-100 border-2 border-[#1E1B18]"
            }`}
          >
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isNeumorphic ? "neu-progress-fill" : isDark ? "bg-amber-400" : "bg-[#4F46E5]"
              }`}
              style={{ width: `${summary.percent}%` }}
            />
          </div>
        </div>

        {/* Milestone Quick Highlights (Streak & Foundations Status) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* 7-Day Streak Status Card */}
          <div
            className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
              isNeumorphic
                ? "neu-flat text-slate-800"
                : user.streakDays >= 7
                ? isDark
                  ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-200"
                  : "bg-emerald-50 border-2 border-emerald-300 text-emerald-950"
                : isDark
                ? "bg-[#18181B] border border-zinc-700 text-zinc-300"
                : "bg-zinc-50 border border-zinc-200 text-zinc-800"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isNeumorphic
                  ? "neu-inset text-amber-500"
                  : user.streakDays >= 7
                  ? "bg-amber-500 text-zinc-950 border border-amber-600"
                  : isDark
                  ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  : "bg-white text-zinc-500 border border-zinc-300"
              }`}
            >
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className={`text-[10px] font-mono font-bold uppercase truncate ${isNeumorphic ? "text-slate-500" : ""}`}>
                7-Day Streak
              </div>
              <div className="text-xs font-black">
                {user.streakDays >= 7 ? "Achieved! ✓" : `${user.streakDays}/7 Days`}
              </div>
            </div>
          </div>

          {/* Foundation Quests Status Card */}
          <div
            className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
              isNeumorphic
                ? "neu-flat text-slate-800"
                : user.completedQuestIds?.includes("quest-1")
                ? isDark
                  ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-200"
                  : "bg-emerald-50 border-2 border-emerald-300 text-emerald-950"
                : isDark
                ? "bg-[#18181B] border border-zinc-700 text-zinc-300"
                : "bg-zinc-50 border border-zinc-200 text-zinc-800"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isNeumorphic
                  ? "neu-inset text-indigo-600"
                  : user.completedQuestIds?.includes("quest-1")
                  ? "bg-indigo-600 text-white border border-indigo-700"
                  : isDark
                  ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  : "bg-white text-zinc-500 border border-zinc-300"
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className={`text-[10px] font-mono font-bold uppercase truncate ${isNeumorphic ? "text-slate-500" : ""}`}>
                Foundations
              </div>
              <div className="text-xs font-black">
                {user.completedQuestIds?.includes("quest-1") ? "Completed! ✓" : "In Progress"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Closest Milestone Banner */}
      {summary.nextMilestone && (
        <div
          onClick={() => handleSelectBadge(summary.nextMilestone!)}
          className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
            isNeumorphic
              ? "neu-raised text-slate-800"
              : isDark
              ? "bg-[#1C1917] border-2 border-amber-500/40 hover:border-amber-400 text-zinc-200"
              : "bg-[#FFF9EA] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] hover:translate-y-0.5"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isNeumorphic
                  ? "neu-inset text-amber-500"
                  : isDark
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
              }`}
            >
              {renderBadgeIcon(summary.nextMilestone.iconName, "w-5 h-5")}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase text-amber-500">
                  NEXT TARGET
                </span>
                <span className="text-[10px] font-mono opacity-60">
                  {summary.nextMilestone.progressPercent}%
                </span>
              </div>
              <div className="text-xs font-black uppercase truncate">
                {summary.nextMilestone.title}
              </div>
              <div className="text-[11px] opacity-75 truncate">
                {summary.nextMilestone.currentValue} / {summary.nextMilestone.targetValue}{" "}
                {summary.nextMilestone.unit}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
        </div>
      )}

      {/* Filter Tabs & Category Selector */}
      <div className="space-y-2.5">
        {/* Status Pills */}
        <div className="flex items-center gap-2">
          {(["all", "earned", "in-progress"] as const).map((status) => {
            const isActive = filterStatus === status;
            const count =
              status === "all"
                ? summary.total
                : status === "earned"
                ? summary.earned
                : summary.total - summary.earned;

            return (
              <button
                key={status}
                onClick={() => {
                  soundFx.playTap();
                  setFilterStatus(status);
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? isNeumorphic
                      ? "neu-btn-primary text-white"
                      : isDark
                      ? "bg-amber-400 border-2 border-amber-500 text-zinc-950 shadow-sm"
                      : "bg-[#1E1B18] border-2 border-[#1E1B18] text-white shadow-[2px_2px_0px_#1E1B18]"
                    : isNeumorphic
                    ? "neu-flat text-slate-600 hover:text-slate-900"
                    : isDark
                    ? "bg-[#27272A] border-2 border-[#3F3F46] text-zinc-400 hover:text-zinc-200"
                    : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[1px_1px_0px_#1E1B18]"
                }`}
              >
                {status === "all" ? "ALL" : status === "earned" ? "EARNED" : "LOCKED"} ({count})
              </button>
            );
          })}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All Categories" },
            { id: "streaks", label: "Streaks 🔥" },
            { id: "curriculum", label: "Curriculum 📚" },
            { id: "mastery", label: "Mastery ⚡" },
            { id: "milestones", label: "Sparks & Level ✨" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playTap();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? isNeumorphic
                    ? "neu-btn-primary text-white"
                    : isDark
                    ? "bg-zinc-100 text-zinc-900 border border-white"
                    : "bg-[#1E1B18] text-white border border-[#1E1B18]"
                  : isNeumorphic
                  ? "neu-flat text-slate-600 hover:text-slate-900"
                  : isDark
                  ? "bg-[#18181B] text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                  : "bg-white text-zinc-600 border border-zinc-300 hover:border-[#1E1B18]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.isEarned;

          return (
            <div
              key={badge.id}
              onClick={() => handleSelectBadge(badge)}
              className={`p-4 rounded-2xl text-left space-y-3 cursor-pointer transition-all active:scale-[0.98] ${
                isNeumorphic
                  ? isUnlocked
                    ? "neu-raised text-slate-800"
                    : "neu-flat text-slate-500 opacity-80"
                  : isUnlocked
                  ? isDark
                    ? "bg-[#27272A] border-2 border-amber-400/70 text-zinc-100 shadow-md hover:border-amber-400"
                    : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] hover:translate-y-0.5"
                  : isDark
                  ? "bg-[#18181B] border-2 border-[#27272A] text-zinc-500 hover:border-zinc-700"
                  : "bg-zinc-50/80 border-2 border-zinc-200 text-zinc-500 hover:border-zinc-400"
              }`}
            >
              {/* Header: Rarity & Status */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase border ${getRarityBadgeStyle(
                    badge.rarity
                  )}`}
                >
                  {badge.rarity}
                </span>

                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-black text-emerald-500">
                    <Check className="w-3.5 h-3.5" />
                    <span>EARNED</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                    <Lock className="w-3 h-3" />
                    <span>{badge.progressPercent}%</span>
                  </span>
                )}
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isNeumorphic
                      ? isUnlocked
                        ? "neu-flat text-indigo-600"
                        : "neu-inset text-slate-400"
                      : isUnlocked
                      ? isDark
                        ? "bg-amber-500/20 text-amber-400 border-2 border-amber-400 shadow-sm"
                        : "bg-[#FEF08A] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                      : isDark
                      ? "bg-zinc-800 text-zinc-600 border-2 border-zinc-700"
                      : "bg-zinc-200 text-zinc-400 border-2 border-zinc-300"
                  }`}
                >
                  {renderBadgeIcon(badge.iconName, "w-6 h-6")}
                </div>

                <div className="min-w-0">
                  <h3
                    className={`text-sm font-black uppercase tracking-tight truncate ${
                      isUnlocked
                        ? isNeumorphic
                          ? "text-slate-800"
                          : isDark
                          ? "text-zinc-100"
                          : "text-[#1E1B18]"
                        : isNeumorphic
                        ? "text-slate-500"
                        : isDark
                        ? "text-zinc-400"
                        : "text-zinc-700"
                    }`}
                  >
                    {badge.title}
                  </h3>
                  <div className={`text-[11px] font-mono truncate ${isNeumorphic ? "text-slate-500" : "opacity-70"}`}>
                    {badge.milestoneGoal}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p
                className={`text-xs line-clamp-2 ${
                  isUnlocked
                    ? isNeumorphic
                      ? "text-slate-600"
                      : isDark
                      ? "text-zinc-300"
                      : "text-zinc-700"
                    : isNeumorphic
                    ? "text-slate-400"
                    : isDark
                    ? "text-zinc-500"
                    : "text-zinc-500"
                }`}
              >
                {badge.description}
              </p>

              {/* Progress Bar & Metric */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span>
                    {badge.currentValue} / {badge.targetValue} {badge.unit}
                  </span>
                  <span className={isNeumorphic ? "text-indigo-600" : "opacity-80"}>+{badge.xpBonus} XP</span>
                </div>
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    isNeumorphic
                      ? "neu-progress-track"
                      : isDark
                      ? "bg-zinc-800 border border-zinc-700"
                      : "bg-zinc-200 border border-zinc-300"
                  }`}
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      isUnlocked
                        ? isNeumorphic ? "bg-emerald-500" : "bg-emerald-500"
                        : isNeumorphic
                        ? "neu-progress-fill"
                        : isDark
                        ? "bg-amber-400/80"
                        : "bg-[#4F46E5]"
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div
          className={`p-8 rounded-3xl border-2 text-center space-y-2 ${
            isDark ? "bg-[#18181B] border-zinc-800 text-zinc-400" : "bg-white border-zinc-200 text-zinc-500"
          }`}
        >
          <Trophy className="w-8 h-8 mx-auto opacity-40" />
          <p className="text-sm font-bold">No badges matching this filter.</p>
          <button
            onClick={() => {
              setFilterStatus("all");
              setSelectedCategory("all");
            }}
            className="text-xs font-mono font-black text-[#4F46E5] hover:underline uppercase"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl border-2 p-6 space-y-5 animate-in zoom-in-95 relative ${
              isDark
                ? "bg-[#27272A] border-amber-400/70 text-zinc-100 shadow-2xl"
                : "bg-[#FFFDF9] border-[#1E1B18] text-[#1E1B18] shadow-[6px_6px_0px_#1E1B18]"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                soundFx.playTap();
                setSelectedBadge(null);
              }}
              className={`absolute top-4 right-4 p-1.5 rounded-full border transition-all ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                  : "bg-zinc-100 border-[#1E1B18] text-[#1E1B18] hover:bg-zinc-200"
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badge Medallion */}
            <div className="text-center space-y-3 pt-2">
              <div
                className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border-2 transition-transform hover:scale-105 ${
                  selectedBadge.isEarned
                    ? isDark
                      ? "bg-amber-500/20 text-amber-400 border-amber-400 shadow-lg"
                      : "bg-[#FEF08A] text-[#1E1B18] border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                    : isDark
                    ? "bg-zinc-800 text-zinc-500 border-zinc-700"
                    : "bg-zinc-100 text-zinc-400 border-zinc-300"
                }`}
              >
                {renderBadgeIcon(selectedBadge.iconName, "w-10 h-10")}
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase border ${getRarityBadgeStyle(
                      selectedBadge.rarity
                    )}`}
                  >
                    {selectedBadge.rarity}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      selectedBadge.isEarned
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-zinc-500/20 text-zinc-400 border-zinc-500/40"
                    }`}
                  >
                    {selectedBadge.isEarned ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>

                <h2 className="text-xl font-black uppercase tracking-tight mt-1.5">
                  {selectedBadge.title}
                </h2>
                <div className="text-xs font-mono opacity-70">
                  {selectedBadge.milestoneGoal}
                </div>
              </div>
            </div>

            {/* Lore / Description */}
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                isDark ? "bg-[#18181B] border-zinc-700 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
              }`}
            >
              {selectedBadge.description}
            </div>

            {/* Progress Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>Current Progress</span>
                <span>
                  {selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.unit} (
                  {selectedBadge.progressPercent}%)
                </span>
              </div>
              <div
                className={`w-full h-3 rounded-full overflow-hidden border ${
                  isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-200 border-zinc-300"
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    selectedBadge.isEarned
                      ? "bg-emerald-500"
                      : isDark
                      ? "bg-amber-400"
                      : "bg-[#4F46E5]"
                  }`}
                  style={{ width: `${selectedBadge.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tips or Unlocked Date */}
            <div className="space-y-2 pt-1 border-t border-zinc-500/20 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="opacity-70">XP Reward:</span>
                <span className="font-bold text-amber-500">+{selectedBadge.xpBonus} XP</span>
              </div>

              {selectedBadge.isEarned ? (
                <div className="flex items-center justify-between font-mono">
                  <span className="opacity-70">Unlocked On:</span>
                  <span className="font-bold text-emerald-500">
                    {selectedBadge.unlockedAt || "Verified Learner"}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-400">
                  <strong>How to Unlock:</strong> {selectedBadge.tips}
                </div>
              )}
            </div>

            {/* Done / Action Button */}
            <button
              onClick={() => {
                soundFx.playTap();
                setSelectedBadge(null);
              }}
              className={`w-full py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-wider transition-all ${
                isDark
                  ? "bg-amber-400 border-amber-500 text-zinc-950 hover:bg-amber-300"
                  : "bg-[#1E1B18] border-[#1E1B18] text-white shadow-[2px_2px_0px_#1E1B18] hover:translate-y-0.5"
              }`}
            >
              Close Badge Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
