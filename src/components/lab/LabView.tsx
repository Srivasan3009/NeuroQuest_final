import React, { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Circle,
  Target,
  BookOpen,
  Award,
  Flame,
  Sparkles,
  Check,
} from "lucide-react";
import { UserProfile, Stage, Quest, AppTheme } from "../../types";
import { soundFx } from "../../utils/sound";

interface LabViewProps {
  user: UserProfile;
  stages: Stage[];
  onStartLesson: (quest: Quest, stage: Stage) => void;
  onAddSparks: (amount: number) => void;
  theme?: AppTheme;
}

interface DailyGoalItem {
  id: string;
  title: string;
  subtitle: string;
  sparksReward: number;
  xpReward: number;
  completed: boolean;
  type: "lesson" | "review" | "streak";
}

export const LabView: React.FC<LabViewProps> = ({
  user,
  stages,
  onStartLesson,
  onAddSparks,
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `neuroquest_daily_goals_${todayKey}`;

  const currentQuest = stages[0]?.quests[0];
  const currentStage = stages[0];

  const [goals, setGoals] = useState<DailyGoalItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }

    const hasCompletedLesson = (user.completedQuestIds || []).length > 0;
    return [
      {
        id: "goal-lesson",
        title: "Complete 1 Mission Lesson",
        subtitle: currentQuest
          ? `Master "${currentQuest.title}"`
          : "Progress through the core AI curriculum",
        sparksReward: 15,
        xpReward: 30,
        completed: hasCompletedLesson,
        type: "lesson",
      },
      {
        id: "goal-review",
        title: "Review Core AI Knowledge",
        subtitle: "Reinforce decision boundaries & neural activations",
        sparksReward: 10,
        xpReward: 20,
        completed: false,
        type: "review",
      },
      {
        id: "goal-streak",
        title: "Maintain Daily Learning Streak",
        subtitle: `Currently on a ${user.streakDays || 1}-day active focus streak`,
        sparksReward: 15,
        xpReward: 25,
        completed: (user.streakDays || 0) >= 1,
        type: "streak",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    } catch {
      // Ignore
    }
  }, [goals, storageKey]);

  useEffect(() => {
    if ((user.completedQuestIds || []).length > 0) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === "goal-lesson" ? { ...g, completed: true } : g
        )
      );
    }
  }, [user.completedQuestIds?.length]);

  const handleToggleGoal = (goalId: string) => {
    soundFx.playTap();
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextCompleted = !g.completed;
          if (nextCompleted) {
            soundFx.playSpark();
            onAddSparks(g.sparksReward);
          }
          return { ...g, completed: nextCompleted };
        }
        return g;
      })
    );
  };

  const handleActionGoal = (goal: DailyGoalItem) => {
    soundFx.playTap();
    if (goal.type === "lesson" && currentQuest && currentStage) {
      onStartLesson(currentQuest, currentStage);
    } else {
      handleToggleGoal(goal.id);
    }
  };

  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const allGoalsDone = completedGoalsCount === 3;

  return (
    <div
      id="lab-view"
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 space-y-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p
            className={`text-xs font-medium ${
              isDark ? "text-[#2997FF]" : "text-[#0071E3]"
            }`}
          >
            Daily Focus
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Daily Goals
          </h1>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold tabular-nums ${
            isDark
              ? "bg-amber-500/10 border-amber-400/20 text-amber-300"
              : "bg-amber-500/10 border-amber-500/15 text-amber-700"
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{user.sparks ?? 45} Sparks</span>
        </div>
      </div>

      {/* Tier Summary Card */}
      <div className="apple-surface p-5 sm:p-6 rounded-3xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDark
                ? "bg-amber-500/15 text-amber-300"
                : "bg-amber-500/10 text-amber-600"
            }`}
          >
            <Award className="w-6 h-6" />
          </div>

          <div className="space-y-0.5">
            <div
              className={`text-xs font-medium ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              League Chest · Level 1
            </div>
            <div className="text-base font-bold">Bronze Tier</div>
            <div
              className={`text-xs font-mono tabular-nums ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              {(user.completedQuestIds || []).length || 1} / 20 to next chest
            </div>
          </div>
        </div>

        <p
          className={`text-xs hidden sm:block max-w-[190px] text-right leading-relaxed ${
            isDark ? "text-zinc-400" : "text-[#6E6E73]"
          }`}
        >
          Complete your daily goals to accelerate league standing.
        </p>
      </div>

      {/* 3 Daily Goals Grouped Card */}
      <div
        id="lab-daily-goals-card"
        className="apple-surface p-6 sm:p-7 rounded-3xl space-y-5"
      >
        <div
          className={`flex items-start justify-between gap-4 pb-4 border-b ${
            isDark ? "border-white/[0.08]" : "border-black/[0.06]"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target
                className={`w-4 h-4 ${
                  isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                }`}
              />
              <h2 className="text-lg font-bold tracking-tight">Today's 3 Goals</h2>
            </div>
            <p
              className={`text-xs ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              Consistency builds intuition. Check off all three for bonus Sparks.
            </p>
          </div>

          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full tabular-nums whitespace-nowrap ${
              allGoalsDone
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : isDark
                ? "bg-white/[0.08] text-zinc-200"
                : "bg-black/[0.05] text-[#1D1D1F]"
            }`}
          >
            {completedGoalsCount} / 3 done
          </span>
        </div>

        <div
          className={`divide-y ${
            isDark ? "divide-white/[0.06]" : "divide-black/[0.05]"
          }`}
        >
          {goals.map((goal, idx) => {
            const isCompleted = goal.completed;

            return (
              <div
                key={goal.id}
                className="py-4 first:pt-1 last:pb-1 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-semibold shrink-0 transition-colors ${
                      isCompleted
                        ? isDark
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-emerald-500/10 text-emerald-600"
                        : isDark
                        ? "bg-white/[0.06] text-zinc-300"
                        : "bg-black/[0.04] text-[#6E6E73]"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      `0${idx + 1}`
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCompleted
                            ? isDark
                              ? "text-zinc-500 line-through"
                              : "text-zinc-400 line-through"
                            : ""
                        }`}
                      >
                        {goal.title}
                      </h4>
                      <span
                        className={`text-xs font-mono tabular-nums ${
                          isDark ? "text-amber-300" : "text-amber-700"
                        }`}
                      >
                        · +{goal.sparksReward} Sparks
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        isDark ? "text-zinc-400" : "text-[#6E6E73]"
                      }`}
                    >
                      {goal.subtitle}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {goal.type === "lesson" && !isCompleted && currentQuest ? (
                    <button
                      id="btn-goal-start-lesson"
                      onClick={() => handleActionGoal(goal)}
                      className="min-h-[38px] px-4 py-1.5 rounded-full font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-toggle-${goal.id}`}
                      onClick={() => handleToggleGoal(goal.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isDark
                          ? "text-zinc-500 hover:text-zinc-300"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                      title={
                        isCompleted ? "Mark incomplete" : "Mark completed"
                      }
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allGoalsDone && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark
                ? "bg-emerald-500/10 border-emerald-500/25 text-zinc-100"
                : "bg-emerald-50/80 border-emerald-200 text-[#1D1D1F]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold">
                  All 3 Goals Completed Today
                </div>
                <div
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  Steady daily progress keeps your mastery sharp.
                </div>
              </div>
            </div>
            <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Streak Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
