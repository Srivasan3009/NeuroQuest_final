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
  X,
} from "lucide-react";
import { UserProfile, AppTheme, MilestoneBadge, Stage } from "../../types";
import {
  computeMilestoneBadges,
  getAchievementsSummary,
} from "../../utils/achievements";
import { soundFx } from "../../utils/sound";
import { AppleSurfaceButton } from "../ui/AppleSurfaceButton";

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
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const [filterStatus, setFilterStatus] = useState<
    "all" | "earned" | "in-progress"
  >("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(
    null
  );
  const [showSimBench, setShowSimBench] = useState(false);

  const badges = useMemo(
    () => computeMilestoneBadges(user, stages),
    [user, stages]
  );
  const summary = useMemo(() => getAchievementsSummary(badges), [badges]);

  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      if (filterStatus === "earned" && !b.isEarned) return false;
      if (filterStatus === "in-progress" && b.isEarned) return false;
      if (selectedCategory !== "all" && b.category !== selectedCategory)
        return false;
      return true;
    });
  }, [badges, filterStatus, selectedCategory]);

  const renderBadgeIcon = (iconName: string, className = "w-5 h-5") => {
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

  const getRarityColor = (rarity: MilestoneBadge["rarity"]) => {
    switch (rarity) {
      case "legendary":
        return isDark ? "text-amber-300" : "text-amber-700";
      case "epic":
        return isDark ? "text-purple-300" : "text-purple-700";
      case "rare":
        return isDark ? "text-[#2997FF]" : "text-[#0071E3]";
      default:
        return isDark ? "text-zinc-400" : "text-[#6E6E73]";
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
    <div
      id="achievements-view"
      className="space-y-5 pb-32 max-w-xl mx-auto px-4 sm:px-6 pt-5"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <button
          id="btn-back-to-profile"
          onClick={() => {
            soundFx.playTap();
            onBack();
          }}
          className={`min-h-[40px] flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            isDark
              ? "text-[#2997FF] hover:text-blue-300"
              : "text-[#0071E3] hover:text-[#005BB5]"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <h1 className="text-base font-bold tracking-tight">Achievements</h1>

        <button
          onClick={() => {
            soundFx.playTap();
            setShowSimBench(!showSimBench);
          }}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            showSimBench
              ? "bg-[#0071E3] text-white"
              : isDark
              ? "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
              : "bg-black/[0.05] text-[#1D1D1F] hover:bg-black/[0.08]"
          }`}
          title="Toggle Milestone Test Bench"
        >
          {showSimBench ? "Hide Sim" : "Test"}
        </button>
      </div>

      {/* Milestone Test Bench */}
      {showSimBench && (
        <div className="apple-surface p-4 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Milestone Simulator</span>
            <span className={isDark ? "text-zinc-400" : "text-[#6E6E73]"}>
              Preview triggers
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="test-bench-week-streak"
              onClick={() => handleTestStreak(7)}
              className={`p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs font-medium transition-colors ${
                user.streakDays >= 7
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : isDark
                  ? "bg-white/[0.03] border-white/[0.08]"
                  : "bg-black/[0.02] border-black/[0.06]"
              }`}
            >
              <span>7-Day Streak</span>
              <span className="text-[11px] opacity-75">
                {user.streakDays >= 7 ? "Active" : "Set 7d"}
              </span>
            </button>

            <button
              id="test-bench-first-quest"
              onClick={handleTestFoundation}
              className={`p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs font-medium transition-colors ${
                (user.completedQuestIds || []).length >= 1
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : isDark
                  ? "bg-white/[0.03] border-white/[0.08]"
                  : "bg-black/[0.02] border-black/[0.06]"
              }`}
            >
              <span>First Quest</span>
              <span className="text-[11px] opacity-75">
                {(user.completedQuestIds || []).length >= 1 ? "Done" : "+1"}
              </span>
            </button>

            <button
              id="test-bench-neural-explorer"
              onClick={() => {
                if (onCompleteFoundationQuest) onCompleteFoundationQuest();
              }}
              className={`p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs font-medium transition-colors ${
                (user.completedQuestIds || []).length >= 2
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : isDark
                  ? "bg-white/[0.03] border-white/[0.08]"
                  : "bg-black/[0.02] border-black/[0.06]"
              }`}
            >
              <span>Neural Explorer</span>
              <span className="text-[11px] opacity-75">Test</span>
            </button>

            <button
              id="test-bench-streak-reset"
              onClick={() => handleTestStreak(4)}
              className={`p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs font-medium transition-colors ${
                isDark
                  ? "bg-white/[0.03] border-white/[0.08]"
                  : "bg-black/[0.02] border-black/[0.06]"
              }`}
            >
              <span>Set 4d Streak</span>
              <span className="text-[11px] opacity-75">{user.streakDays}d</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="apple-surface p-6 rounded-3xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div
              className={`text-xs font-medium ${
                isDark ? "text-[#2997FF]" : "text-[#0071E3]"
              }`}
            >
              Milestones
            </div>
            <h2 className="text-xl font-bold tracking-tight">Earned Badges</h2>
            <p
              className={`text-xs ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              Permanent credentials earned through streaks and mastery.
            </p>
          </div>

          <div
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
              isDark
                ? "bg-[#2997FF]/15 text-[#2997FF]"
                : "bg-[#0071E3]/10 text-[#0071E3]"
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[11px] font-mono font-semibold tabular-nums mt-0.5">
              {summary.percent}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs tabular-nums">
            <span className={isDark ? "text-zinc-300" : "text-[#424245]"}>
              {summary.earned} of {summary.total} unlocked
            </span>
            <span
              className={`font-medium ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              {summary.percent}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden neu-progress-track">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isDark ? "bg-[#2997FF]" : "bg-[#0071E3]"
              }`}
              style={{ width: `${summary.percent}%` }}
            />
          </div>
        </div>

        {/* Highlights Row */}
        <div
          className={`pt-4 border-t grid grid-cols-2 gap-4 ${
            isDark ? "border-white/[0.06]" : "border-black/[0.05]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                user.streakDays >= 7
                  ? "bg-orange-500/15 text-orange-500"
                  : isDark
                  ? "bg-white/[0.05] text-zinc-400"
                  : "bg-black/[0.04] text-zinc-500"
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div
                className={`text-[11px] ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                7-Day Streak
              </div>
              <div className="text-xs font-semibold tabular-nums">
                {user.streakDays >= 7 ? "Achieved" : `${user.streakDays}/7 Days`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                user.completedQuestIds?.includes("quest-1")
                  ? "bg-[#0071E3]/15 text-[#0071E3]"
                  : isDark
                  ? "bg-white/[0.05] text-zinc-400"
                  : "bg-black/[0.04] text-zinc-500"
              }`}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div
                className={`text-[11px] ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                Foundations
              </div>
              <div className="text-xs font-semibold">
                {user.completedQuestIds?.includes("quest-1")
                  ? "Completed"
                  : "In Progress"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Target */}
      {summary.nextMilestone && (
        <AppleSurfaceButton
          onClick={() => handleSelectBadge(summary.nextMilestone!)}
          className="apple-surface w-full p-4 rounded-2xl flex items-center justify-between text-left hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark
                  ? "bg-amber-500/15 text-amber-300"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              {renderBadgeIcon(summary.nextMilestone.iconName, "w-5 h-5")}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">
                Next · {summary.nextMilestone.title}
              </div>
              <div
                className={`text-xs truncate tabular-nums ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                {summary.nextMilestone.currentValue} /{" "}
                {summary.nextMilestone.targetValue}{" "}
                {summary.nextMilestone.unit} ({summary.nextMilestone.progressPercent}%)
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
        </AppleSurfaceButton>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div
          className={`flex items-center p-1 rounded-full border ${
            isDark
              ? "bg-[#1C1C1E] border-white/[0.08]"
              : "bg-black/[0.05] border-black/[0.04]"
          }`}
        >
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
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all tabular-nums whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? "bg-[#2C2C2E] text-white shadow-xs"
                      : "bg-white text-[#1D1D1F] shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status === "earned"
                  ? "Earned"
                  : "Locked"}{" "}
                ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All Categories" },
            { id: "streaks", label: "Streaks" },
            { id: "curriculum", label: "Curriculum" },
            { id: "mastery", label: "Mastery" },
            { id: "milestones", label: "Sparks & Level" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playTap();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#0071E3] text-white"
                  : isDark
                  ? "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
                  : "bg-black/[0.04] text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.isEarned;

          return (
            <AppleSurfaceButton
              key={badge.id}
              onClick={() => handleSelectBadge(badge)}
              className={`apple-surface p-4 rounded-3xl text-left space-y-3 transition-opacity ${
                isUnlocked ? "opacity-100" : "opacity-65 hover:opacity-90"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className={`capitalize ${getRarityColor(badge.rarity)}`}>
                  {badge.rarity}
                </span>

                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Earned</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-zinc-400 tabular-nums">
                    <Lock className="w-3 h-3" />
                    <span>{badge.progressPercent}%</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? isDark
                        ? "bg-[#2997FF]/15 text-[#2997FF]"
                        : "bg-[#0071E3]/10 text-[#0071E3]"
                      : isDark
                      ? "bg-white/[0.05] text-zinc-500"
                      : "bg-black/[0.04] text-zinc-400"
                  }`}
                >
                  {renderBadgeIcon(badge.iconName, "w-5 h-5")}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold truncate">
                    {badge.title}
                  </h3>
                  <div
                    className={`text-xs truncate ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    {badge.milestoneGoal}
                  </div>
                </div>
              </div>

              <p
                className={`text-xs line-clamp-2 ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                {badge.description}
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                  <span>
                    {badge.currentValue} / {badge.targetValue} {badge.unit}
                  </span>
                  <span className={isDark ? "text-[#2997FF]" : "text-[#0071E3]"}>
                    +{badge.xpBonus} XP
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden neu-progress-track">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isUnlocked
                        ? "bg-emerald-500"
                        : isDark
                        ? "bg-[#2997FF]"
                        : "bg-[#0071E3]"
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>
              </div>
            </AppleSurfaceButton>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="apple-surface p-8 rounded-3xl text-center space-y-2">
          <Trophy className="w-7 h-7 mx-auto opacity-40" />
          <p className="text-sm font-semibold">No matching badges</p>
          <button
            onClick={() => {
              setFilterStatus("all");
              setSelectedCategory("all");
            }}
            className="text-xs font-medium text-[#0071E3] hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="apple-surface w-full max-w-sm rounded-3xl p-6 space-y-5 relative">
            <button
              onClick={() => {
                soundFx.playTap();
                setSelectedBadge(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div
                className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                  selectedBadge.isEarned
                    ? isDark
                      ? "bg-[#2997FF]/15 text-[#2997FF]"
                      : "bg-[#0071E3]/10 text-[#0071E3]"
                    : isDark
                    ? "bg-white/[0.06] text-zinc-500"
                    : "bg-black/[0.04] text-zinc-400"
                }`}
              >
                {renderBadgeIcon(selectedBadge.iconName, "w-8 h-8")}
              </div>

              <div className="text-xs font-medium capitalize text-[#0071E3] dark:text-[#2997FF]">
                {selectedBadge.rarity} ·{" "}
                {selectedBadge.isEarned ? "Unlocked" : "Locked"}
              </div>

              <h2 className="text-lg font-bold tracking-tight">
                {selectedBadge.title}
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                {selectedBadge.milestoneGoal}
              </p>
            </div>

            <p
              className={`apple-surface-muted p-3.5 rounded-2xl text-xs leading-relaxed ${
                isDark ? "text-zinc-300" : "text-[#424245]"
              }`}
            >
              {selectedBadge.description}
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-mono tabular-nums">
                <span className={isDark ? "text-zinc-400" : "text-[#6E6E73]"}>
                  Progress
                </span>
                <span>
                  {selectedBadge.currentValue} / {selectedBadge.targetValue}{" "}
                  {selectedBadge.unit} ({selectedBadge.progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden neu-progress-track">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    selectedBadge.isEarned ? "bg-emerald-500" : "bg-[#0071E3]"
                  }`}
                  style={{ width: `${selectedBadge.progressPercent}%` }}
                />
              </div>
            </div>

            <div
              className={`pt-3 border-t space-y-2 text-xs ${
                isDark ? "border-white/[0.08]" : "border-black/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-zinc-400" : "text-[#6E6E73]"}>
                  Reward
                </span>
                <span className="font-mono font-semibold text-[#0071E3] dark:text-[#2997FF]">
                  +{selectedBadge.xpBonus} XP
                </span>
              </div>
              {selectedBadge.isEarned ? (
                <div className="flex items-center justify-between">
                  <span className={isDark ? "text-zinc-400" : "text-[#6E6E73]"}>
                    Status
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {selectedBadge.unlockedAt || "Verified"}
                  </span>
                </div>
              ) : (
                <p
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  Tip: {selectedBadge.tips}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                soundFx.playTap();
                setSelectedBadge(null);
              }}
              className="w-full py-2.5 rounded-2xl font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
