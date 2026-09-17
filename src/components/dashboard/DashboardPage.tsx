import React from "react";
import {
  Sparkles,
  Flame,
  Award,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  Compass
} from "lucide-react";
import { UserProfile, Stage, Quest } from "../../types";
import { getLevelInfo, ALL_ACHIEVEMENTS } from "../../data/gamification";

interface DashboardPageProps {
  user: UserProfile;
  stages: Stage[];
  onStartQuest: (questId: string) => void;
  onNavigateJourney: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  stages,
  onStartQuest,
  onNavigateJourney,
}) => {
  const levelInfo = getLevelInfo(user.xp);

  // Find next recommended quest
  const completedSet = new Set(
    (user.completedQuestIds || (user as any).completedQuests?.map((q: any) => (typeof q === "string" ? q : q.questId)) || [])
  );
  let nextRecommendedQuest: Quest | null = null;
  let nextStage: Stage | null = null;

  for (const st of stages) {
    for (const q of st.quests) {
      if (!completedSet.has(q.id)) {
        nextRecommendedQuest = q;
        nextStage = st;
        break;
      }
    }
    if (nextRecommendedQuest) break;
  }

  // Fallback to first quest if all completed
  if (!nextRecommendedQuest && stages[0]?.quests[0]) {
    nextRecommendedQuest = stages[0].quests[0];
    nextStage = stages[0];
  }

  return (
    <div id="dashboard-page-root" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Profile Summary */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans tracking-tight">
                  {user.fullName}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                  {levelInfo.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Learner ID: <span className="text-slate-300">{user.id}</span> • Auth: {user.authProvider}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-slate-100">{user.streakDays} Days</div>
                <div className="text-[10px] text-slate-400 font-mono">Active Streak</div>
              </div>
            </div>

            {/* Total XP */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-amber-400">{user.xp} XP</div>
                <div className="text-[10px] text-slate-400 font-mono">Accumulated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold">
              Level {levelInfo.level}: <span className="text-cyan-400">{levelInfo.title}</span>
            </span>
            <span className="text-slate-400">
              {levelInfo.currentLevelXP} / {levelInfo.levelSpanXP} XP ({levelInfo.progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recommended Next Quest Card */}
      {nextRecommendedQuest && (
        <div className="bg-gradient-to-r from-slate-900 to-cyan-950/30 border border-cyan-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono">
              <Compass className="w-3 h-3" />
              <span>Recommended Next Step</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 font-sans">
              {nextRecommendedQuest.title}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl line-clamp-2">
              {nextRecommendedQuest.learn.summary}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>Stage: {nextStage?.title}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">+{nextRecommendedQuest.xpReward} XP</span>
              <span>•</span>
              <span>{nextRecommendedQuest.estimatedMinutes} min</span>
            </div>
          </div>

          <button
            id="dashboard-resume-quest-btn"
            onClick={() => onStartQuest(nextRecommendedQuest!.id)}
            className="shrink-0 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-sans text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <span>Resume Quest</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two Column Grid: Mastered Skills & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastered Skills */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 font-sans">Skill Mastery</h3>
            <span className="text-xs font-mono text-slate-400">
              {(user.skills || []).length} competencies tracked
            </span>
          </div>

          <div className="space-y-3">
            {(user.skills || []).map((s) => {
              const maxXP = 100;
              const pct = Math.min(100, Math.round((s.points / maxXP) * 100));
              return (
                <div key={s.name} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200 font-semibold">{s.name}</span>
                    <span className="text-cyan-400 capitalize">{s.tier}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Mastery Progress</span>
                    <span>{s.points} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements Showcase */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 font-sans">Achievements</h3>
            <span className="text-xs font-mono text-slate-400">
              {(user.achievements || []).filter(a => typeof a === "string" ? true : Boolean(a.unlockedAt)).length}/{ALL_ACHIEVEMENTS.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_ACHIEVEMENTS.map((ach) => {
              const isUnlocked = (user.achievements || []).some(a =>
                typeof a === "string" ? a === ach.id : a.id === ach.id && Boolean(a.unlockedAt)
              );
              return (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    isUnlocked
                      ? "bg-slate-950 border-emerald-500/30 text-slate-200"
                      : "bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isUnlocked ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold font-sans">{ach.title}</div>
                    <div className="text-[11px] text-slate-400 font-sans leading-tight">
                      {ach.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
