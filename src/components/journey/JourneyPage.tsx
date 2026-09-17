import React, { useState } from "react";
import {
  Lock,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  Award
} from "lucide-react";
import { Stage, Quest, UserProfile } from "../../types";

interface JourneyPageProps {
  stages: Stage[];
  user: UserProfile;
  onSelectQuest: (quest: Quest, stage: Stage) => void;
}

export const JourneyPage: React.FC<JourneyPageProps> = ({
  stages,
  user,
  onSelectQuest,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const completedQuestIds = new Set(
    (user.completedQuestIds || (user as any).completedQuests?.map((q: any) => (typeof q === "string" ? q : q.questId)) || [])
  );

  // Determine unlock status: A quest is unlocked if it's the first quest or the previous quest is completed
  let previousQuestDone = true;

  return (
    <div id="journey-page-root" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            Structured Path
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight mt-1">
            The AI Learning Journey
          </h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Progress through 6 specialized stages. Complete hands-on interactive quests to advance.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs font-mono">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedFilter === "all" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Stages
          </button>
          <button
            onClick={() => setSelectedFilter("available")}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedFilter === "available"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setSelectedFilter("completed")}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedFilter === "completed"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Vertical Stages Pipeline */}
      <div className="space-y-12">
        {stages.map((st) => {
          const completedInStage = st.quests.filter((q) => completedQuestIds.has(q.id)).length;
          const isStageCompleted = completedInStage === st.quests.length && st.quests.length > 0;

          return (
            <div key={st.id} className="space-y-4">
              {/* Stage Header Banner */}
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      isStageCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    }`}
                  >
                    0{st.number}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
                      {st.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">{st.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">
                    {completedInStage}/{st.quests.length} Completed
                  </span>
                  {isStageCompleted && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Stage Mastered</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Quests Grid within Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {st.quests.map((q, idx) => {
                  const isDone = completedQuestIds.has(q.id);
                  // Available if previous quest is done, or if it's the very first quest
                  const isUnlocked = idx === 0 || previousQuestDone;
                  previousQuestDone = isDone;

                  if (selectedFilter === "completed" && !isDone) return null;
                  if (selectedFilter === "available" && (!isUnlocked || isDone)) return null;

                  return (
                    <div
                      key={q.id}
                      onClick={() => isUnlocked && onSelectQuest(q, st)}
                      className={`relative rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                        isDone
                          ? "bg-slate-950/70 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer"
                          : isUnlocked
                          ? "bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5"
                          : "bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-semibold">
                            {q.skillTag}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>+{q.xpReward} XP</span>
                            </span>
                            {isDone ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            ) : isUnlocked ? (
                              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                                <Play className="w-3 h-3 fill-current ml-0.5" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                                <Lock className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-slate-100 font-sans tracking-tight">
                            {q.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-2">
                            {q.learn.summary}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{q.estimatedMinutes} min</span>
                        </div>

                        {isDone ? (
                          <span className="text-emerald-400 font-semibold">Completed ✓</span>
                        ) : isUnlocked ? (
                          <span className="text-cyan-400 font-semibold flex items-center gap-1">
                            <span>Launch Quest</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-slate-600">Locked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
