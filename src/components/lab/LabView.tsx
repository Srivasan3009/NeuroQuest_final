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
  ChevronRight,
  RotateCcw,
  Check
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
  theme = "neumorphic"
}) => {
  const isNeumorphic = theme === "neumorphic";
  const isRiso = theme === "riso-pop" || theme === "warm-editorial";
  const isDark = theme === "dark-editorial";

  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `neuroquest_daily_goals_${todayKey}`;

  // Find the next active or first lesson
  const currentQuest = stages[0]?.quests[0];
  const currentStage = stages[0];

  // 3 Daily Goals state with localStorage persistence
  const [goals, setGoals] = useState<DailyGoalItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }

    const hasCompletedLesson = (user.completedQuestIds || []).length > 0;
    return [
      {
        id: "goal-lesson",
        title: "Complete 1 Mission Lesson",
        subtitle: currentQuest ? `Master "${currentQuest.title}"` : "Progress through the core AI curriculum",
        sparksReward: 15,
        xpReward: 30,
        completed: hasCompletedLesson,
        type: "lesson"
      },
      {
        id: "goal-review",
        title: "Review Core AI Knowledge",
        subtitle: "Reinforce decision boundaries & neural activations",
        sparksReward: 10,
        xpReward: 20,
        completed: false,
        type: "review"
      },
      {
        id: "goal-streak",
        title: "Maintain Daily Learning Streak",
        subtitle: `Currently on a ${user.streakDays || 1}-day active focus streak`,
        sparksReward: 15,
        xpReward: 25,
        completed: (user.streakDays || 0) >= 1,
        type: "streak"
      }
    ];
  });

  // Keep storage in sync
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    } catch {
      // Ignore
    }
  }, [goals, storageKey]);

  // Update lesson goal if user completes a quest
  useEffect(() => {
    if ((user.completedQuestIds || []).length > 0) {
      setGoals((prev) =>
        prev.map((g) => (g.id === "goal-lesson" ? { ...g, completed: true } : g))
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
    <div id="lab-view" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-32 space-y-8">
      {/* 1. Header with Sparks pill */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <div className={`text-[10px] font-mono uppercase font-bold tracking-widest ${isNeumorphic ? "text-slate-500" : "text-slate-400"}`}>
            DAILY ACCELERATOR
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight uppercase ${isNeumorphic ? "text-slate-800" : "text-slate-100"}`}>
            LAB
          </h1>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold ${
            isNeumorphic
              ? "neu-pill-accent text-amber-600"
              : isRiso
              ? "bg-[#FEF08A] border-2 border-[#1E1B18] text-[#1E1B18]"
              : "bg-amber-950/40 border border-amber-500/40 text-amber-400"
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>SPARKS {user.sparks ?? 45}</span>
        </div>
      </div>

      {/* 2. League Chest Progress Card */}
      <div
        className={`p-5 rounded-2xl flex items-center justify-between gap-4 transition-all ${
          isNeumorphic
            ? "neu-raised text-slate-800"
            : isRiso
            ? "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
            : "bg-gradient-to-r from-slate-900 to-amber-950/30 border border-amber-500/30 shadow-lg"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isNeumorphic
                ? "neu-inset text-amber-500"
                : "bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            }`}
          >
            <Award className="w-7 h-7" />
          </div>

          <div>
            <div className={`text-[10px] font-mono uppercase tracking-wider ${isNeumorphic ? "text-slate-500" : "text-slate-400"}`}>
              LEAGUE • CHEST LV.1
            </div>
            <div className="text-base font-black text-amber-500 uppercase tracking-wide">
              BRONZE TIER
            </div>
            <div className={`text-xs font-mono ${isNeumorphic ? "text-slate-500" : "text-slate-400"}`}>
              {(user.completedQuestIds || []).length || 1}/20 to next chest unlock
            </div>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className={`text-xs font-medium block max-w-[140px] leading-tight ${isNeumorphic ? "text-slate-500" : "text-slate-400"}`}>
            Complete your 3 daily goals to accelerate league standing
          </span>
        </div>
      </div>

      {/* 3. The 3 Daily Goals Section */}
      <div
        id="lab-daily-goals-card"
        className={`p-6 rounded-3xl space-y-6 transition-all ${
          isNeumorphic
            ? "neu-raised text-slate-800"
            : isRiso
            ? "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
            : "bg-slate-900/90 border border-slate-800 shadow-xl"
        }`}
      >
        {/* Section Header */}
        <div className={`flex items-center justify-between pb-4 ${isNeumorphic ? "border-b border-slate-300" : "border-b border-slate-800"}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-xl ${isNeumorphic ? "neu-inset text-amber-500" : "bg-amber-500/15 text-amber-400"}`}>
                <Target className="w-4 h-4" />
              </span>
              <h2 className={`text-lg sm:text-xl font-black uppercase tracking-tight ${isNeumorphic ? "text-slate-800" : "text-slate-100"}`}>
                3 DAILY GOALS
              </h2>
            </div>
            <p className={`text-xs font-sans mt-1 ${isNeumorphic ? "text-slate-500" : "text-slate-400"}`}>
              Consistency breeds mastery. Check off all three daily goals to earn bonus Sparks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                allGoalsDone
                  ? isNeumorphic
                    ? "neu-flat text-emerald-600 font-black"
                    : "bg-emerald-500 text-slate-950 font-black"
                  : isNeumorphic
                  ? "neu-inset text-[#4F46E5]"
                  : isRiso
                  ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#1E1B18]"
                  : "bg-cyan-950 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              {completedGoalsCount}/3 COMPLETED
            </span>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((goal, idx) => {
            const isCompleted = goal.completed;

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl flex items-center justify-between gap-4 transition-all ${
                  isCompleted
                    ? isNeumorphic
                      ? "neu-inset bg-slate-200/50"
                      : "bg-slate-950/40 border border-slate-800/80 opacity-90"
                    : isNeumorphic
                    ? "neu-flat hover:translate-y-[-1px]"
                    : isRiso
                    ? "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                    : "bg-slate-800/60 border border-slate-700/80 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Goal Number Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 ${
                      isCompleted
                        ? isNeumorphic
                          ? "neu-flat text-emerald-600"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : isNeumorphic
                        ? "neu-inset text-slate-600"
                        : "bg-slate-900 border border-slate-700 text-slate-300"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : `0${idx + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isCompleted
                            ? "line-through opacity-70 text-slate-400"
                            : isNeumorphic
                            ? "text-slate-800"
                            : "text-slate-100"
                        }`}
                      >
                        {goal.title}
                      </h4>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isNeumorphic
                            ? "neu-pill-accent text-amber-600"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        +{goal.sparksReward} Sparks
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        isNeumorphic ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {goal.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Interactive Toggle / Action Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {goal.type === "lesson" && !isCompleted && currentQuest ? (
                    <button
                      id="btn-goal-start-lesson"
                      onClick={() => handleActionGoal(goal)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        isNeumorphic
                          ? "neu-btn-primary"
                          : isRiso
                          ? "bg-[#4F46E5] text-white border-2 border-[#1E1B18]"
                          : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-toggle-${goal.id}`}
                      onClick={() => handleToggleGoal(goal.id)}
                      className={`p-2 rounded-xl transition-all ${
                        isCompleted
                          ? isNeumorphic
                            ? "neu-flat text-emerald-600"
                            : "text-emerald-400 bg-emerald-950/40"
                          : isNeumorphic
                          ? "neu-inset text-slate-400 hover:text-slate-600"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 fill-emerald-500/20" />
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

        {/* Completion Celebration Footer */}
        {allGoalsDone && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in ${
              isNeumorphic
                ? "neu-inset bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-xs font-black uppercase tracking-wider">All 3 Goals Completed Today!</div>
                <div className="text-[11px] opacity-80">You're making steady daily progress toward AI mastery.</div>
              </div>
            </div>
            <div className="font-mono text-xs font-black text-amber-500 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-current" />
              <span>STREAK ACTIVE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
