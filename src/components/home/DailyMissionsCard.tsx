import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Clock,
  HelpCircle,
  Award,
  BookOpen,
  MessageSquare,
  Flame,
  Check,
} from "lucide-react";
import { UserProfile, AppTheme, Quest, Stage } from "../../types";
import { soundFx } from "../../utils/sound";

interface DailyMissionsCardProps {
  user: UserProfile;
  activeQuest?: { quest: Quest; stage: Stage } | null;
  onStartLesson: () => void;
  onOpenTutor: () => void;
  onAddXP: (amount: number) => void;
  theme?: AppTheme;
}

interface MissionState {
  id: string;
  completed: boolean;
  claimed: boolean;
  progress: number;
  target: number;
}

interface MicroDrillQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: { text: string; isCorrect: boolean; explanation: string }[];
}

const ROTATING_DRILLS: MicroDrillQuestion[] = [
  {
    id: "drill-rag",
    topic: "Generative AI & Grounding",
    prompt:
      "How does Retrieval-Augmented Generation (RAG) primarily prevent LLM hallucinations?",
    options: [
      {
        text: "By hard-coding model weights during backpropagation",
        isCorrect: false,
        explanation:
          "Backpropagation is part of offline training, not real-time query retrieval.",
      },
      {
        text: "By fetching verified domain documents into the context window before generation",
        isCorrect: true,
        explanation:
          "Correct! RAG grounds generation by injecting relevant, trusted factual context at inference time.",
      },
      {
        text: "By restricting model output to only one token at a time",
        isCorrect: false,
        explanation:
          "Token generation rate doesn't guarantee factual accuracy.",
      },
    ],
  },
  {
    id: "drill-temp",
    topic: "Sampling & Temperature",
    prompt:
      "When configuring an LLM, what does raising the 'temperature' parameter from 0.1 to 1.2 do?",
    options: [
      {
        text: "Increases token entropy and randomness, producing more varied and creative responses",
        isCorrect: true,
        explanation:
          "Spot on! Higher temperature softens the probability distribution, allowing less predictable tokens to be sampled.",
      },
      {
        text: "Overheats the GPU cluster and throttles inference speed",
        isCorrect: false,
        explanation:
          "Temperature in software sampling is mathematical, not physical hardware heat.",
      },
      {
        text: "Guarantees deterministic, identical outputs on identical prompts",
        isCorrect: false,
        explanation:
          "Low temperature (~0.0) produces deterministic outputs; high temperature does the opposite.",
      },
    ],
  },
  {
    id: "drill-embeddings",
    topic: "Neural Embeddings",
    prompt:
      "Why are high-dimensional vector embeddings used instead of simple keyword matching?",
    options: [
      {
        text: "They capture latent semantic meaning so synonyms land close in coordinate space",
        isCorrect: true,
        explanation:
          "Exact! Embeddings place words with related conceptual meanings near each other in geometric space.",
      },
      {
        text: "They encrypt confidential prompts so search engines cannot read them",
        isCorrect: false,
        explanation:
          "Embeddings are mathematical representations, not cryptographic ciphers.",
      },
      {
        text: "They reduce file sizes down to zero bytes",
        isCorrect: false,
        explanation:
          "Dense floating-point vectors actually take substantial storage.",
      },
    ],
  },
  {
    id: "drill-agents",
    topic: "Autonomous AI Agents",
    prompt:
      "What does the 'Reasoning + Acting' (ReAct) paradigm enable an AI agent to do?",
    options: [
      {
        text: "Run a think-act-observe loop to decide which tools or APIs to call to solve complex tasks",
        isCorrect: true,
        explanation:
          "Excellent! ReAct allows agents to plan next steps, invoke external tools, and observe intermediate feedback.",
      },
      {
        text: "Re-compile React frontend JavaScript bundles",
        isCorrect: false,
        explanation:
          "In AI, ReAct stands for Reasoning and Acting, not the web framework.",
      },
      {
        text: "Bypass security firewalls without authorization",
        isCorrect: false,
        explanation:
          "ReAct is an architectural pattern for autonomous problem-solving workflows.",
      },
    ],
  },
  {
    id: "drill-activation",
    topic: "Neural Networks",
    prompt:
      "What critical mathematical capability do activation functions (like ReLU) give a deep neural network?",
    options: [
      {
        text: "Non-linearity, allowing the network to approximate complex non-linear decision boundaries",
        isCorrect: true,
        explanation:
          "Yes! Without non-linear activation functions, stacking layers collapses mathematically into a single linear transformation.",
      },
      {
        text: "Converts code comments into Python bytecode",
        isCorrect: false,
        explanation:
          "Activation functions operate strictly on tensor values inside neurons.",
      },
      {
        text: "Limits electricity consumption across data centers",
        isCorrect: false,
        explanation:
          "Activation functions are mathematical matrix operations.",
      },
    ],
  },
];

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  user,
  activeQuest,
  onStartLesson,
  onOpenTutor,
  onAddXP,
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [timeLeft, setTimeLeft] = useState<string>("");
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) return "Resets soon";
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m left`;
    };

    setTimeLeft(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const [missionsState, setMissionsState] = useState<Record<string, MissionState>>(() => {
    const storageKey = `neuroquest_daily_missions_${todayKey}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      mission_lesson: {
        id: "mission_lesson",
        completed: (user.completedQuestIds?.length || 0) > 0,
        claimed: false,
        progress: (user.completedQuestIds?.length || 0) > 0 ? 1 : 0,
        target: 1,
      },
      mission_tutor: {
        id: "mission_tutor",
        completed: false,
        claimed: false,
        progress: 0,
        target: 1,
      },
      mission_drill: {
        id: "mission_drill",
        completed: false,
        claimed: false,
        progress: 0,
        target: 1,
      },
    };
  });

  const [allBonusClaimed, setAllBonusClaimed] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(`neuroquest_daily_missions_bonus_${todayKey}`) ===
        "true"
      );
    } catch {
      return false;
    }
  });

  const saveMissionState = (updated: Record<string, MissionState>) => {
    setMissionsState(updated);
    try {
      localStorage.setItem(
        `neuroquest_daily_missions_${todayKey}`,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if ((user.completedQuestIds?.length || 0) > 0) {
      if (!missionsState.mission_lesson?.completed) {
        const updated = {
          ...missionsState,
          mission_lesson: {
            ...missionsState.mission_lesson,
            completed: true,
            progress: 1,
          },
        };
        saveMissionState(updated);
      }
    }
  }, [user.completedQuestIds?.length]);

  const [isDrillOpen, setIsDrillOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [drillFeedback, setDrillFeedback] = useState<string | null>(null);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean>(false);

  const currentDrill = useMemo(() => {
    const dayOfYear = Math.floor(
      (new Date().getTime() -
        new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return ROTATING_DRILLS[dayOfYear % ROTATING_DRILLS.length];
  }, []);

  const missionsList = [
    {
      id: "mission_lesson",
      title: "Complete 1 Lesson",
      description: activeQuest
        ? activeQuest.quest.title
        : "Advance through today's module",
      xpReward: 30,
      icon: BookOpen,
      iconColor: isDark
        ? "text-[#2997FF] bg-[#2997FF]/15"
        : "text-[#0071E3] bg-[#0071E3]/10",
      state: missionsState.mission_lesson,
      actionLabel: "Start",
      onAction: () => {
        soundFx.playTap();
        onStartLesson();
      },
    },
    {
      id: "mission_tutor",
      title: "Consult NeuroBot",
      description: "Explore a concept with your AI guide",
      xpReward: 20,
      icon: MessageSquare,
      iconColor: isDark
        ? "text-sky-300 bg-sky-400/15"
        : "text-sky-600 bg-sky-500/10",
      state: missionsState.mission_tutor,
      actionLabel: "Open",
      onAction: () => {
        soundFx.playTap();
        if (!missionsState.mission_tutor.completed) {
          const updated = {
            ...missionsState,
            mission_tutor: {
              ...missionsState.mission_tutor,
              completed: true,
              progress: 1,
            },
          };
          saveMissionState(updated);
        }
        onOpenTutor();
      },
    },
    {
      id: "mission_drill",
      title: "Daily Concept Check",
      description: currentDrill.topic,
      xpReward: 25,
      icon: Target,
      iconColor: isDark
        ? "text-emerald-300 bg-emerald-400/15"
        : "text-emerald-600 bg-emerald-500/10",
      state: missionsState.mission_drill,
      actionLabel: "Quiz",
      onAction: () => {
        soundFx.playTap();
        setIsDrillOpen(true);
      },
    },
  ];

  const completedCount = missionsList.filter((m) => m.state?.completed).length;
  const totalCount = missionsList.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  const handleClaimReward = (missionId: string, xp: number) => {
    soundFx.playMissionComplete();
    onAddXP(xp);

    const updated = {
      ...missionsState,
      [missionId]: {
        ...missionsState[missionId],
        claimed: true,
      },
    };
    saveMissionState(updated);
  };

  const handleClaimAllBonus = () => {
    if (!allCompleted || allBonusClaimed) return;
    soundFx.playMissionComplete();
    onAddXP(35);
    setAllBonusClaimed(true);
    try {
      localStorage.setItem(
        `neuroquest_daily_missions_bonus_${todayKey}`,
        "true"
      );
    } catch {
      // Ignore
    }
  };

  const handleSelectDrillOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const opt = currentDrill.options[index];
    if (opt.isCorrect) {
      soundFx.playCorrect();
      setIsCorrectFeedback(true);
      setDrillFeedback(opt.explanation);
      const updated = {
        ...missionsState,
        mission_drill: {
          ...missionsState.mission_drill,
          completed: true,
          progress: 1,
        },
      };
      saveMissionState(updated);
    } else {
      soundFx.playTap();
      setIsCorrectFeedback(false);
      setDrillFeedback(opt.explanation);
    }
  };

  return (
    <div
      id="daily-missions-container"
      className="apple-surface p-5 sm:p-6 rounded-3xl space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDark
                ? "bg-orange-500/15 text-orange-300"
                : "bg-orange-500/10 text-orange-600"
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Daily Missions</h3>
            <p
              className={`text-xs ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              3 bite-sized goals
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1 text-xs tabular-nums ${
            isDark ? "text-zinc-400" : "text-[#6E6E73]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Clean Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs tabular-nums">
          <span className={isDark ? "text-zinc-300" : "text-[#424245]"}>
            {completedCount} of {totalCount} completed
          </span>
          <span
            className={`font-medium ${
              allCompleted
                ? "text-emerald-600 dark:text-emerald-400"
                : isDark
                ? "text-zinc-400"
                : "text-[#6E6E73]"
            }`}
          >
            {allCompleted ? "Bonus unlocked" : `${progressPercent}%`}
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full overflow-hidden neu-progress-track">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              allCompleted
                ? "bg-emerald-500"
                : isDark
                ? "bg-[#2997FF]"
                : "bg-[#0071E3]"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Hairline-divided Mission List */}
      <div
        className={`divide-y ${
          isDark ? "divide-white/[0.06]" : "divide-black/[0.05]"
        }`}
      >
        {missionsList.map((mission) => {
          const IconComp = mission.icon;
          const isDone = Boolean(mission.state?.completed);
          const isClaimed = Boolean(mission.state?.claimed);

          return (
            <div
              key={mission.id}
              className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                    isDone
                      ? isDark
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-emerald-500/10 text-emerald-600"
                      : mission.iconColor
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  ) : (
                    <IconComp className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-xs font-semibold truncate ${
                        isDone && isClaimed
                          ? isDark
                            ? "text-zinc-500 line-through"
                            : "text-zinc-400 line-through"
                          : ""
                      }`}
                    >
                      {mission.title}
                    </h4>
                    <span
                      className={`shrink-0 text-[11px] font-mono tabular-nums ${
                        isDark ? "text-zinc-400" : "text-[#6E6E73]"
                      }`}
                    >
                      · +{mission.xpReward} XP
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    {mission.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {isDone && !isClaimed ? (
                  <button
                    onClick={() =>
                      handleClaimReward(mission.id, mission.xpReward)
                    }
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors whitespace-nowrap"
                  >
                    Claim
                  </button>
                ) : isDone && isClaimed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </span>
                ) : (
                  <button
                    onClick={mission.onAction}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-0.5 transition-colors whitespace-nowrap ${
                      isDark
                        ? "bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200"
                        : "bg-black/[0.05] hover:bg-black/[0.08] text-[#1D1D1F]"
                    }`}
                  >
                    <span>{mission.actionLabel}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Micro-Drill Expandable Panel */}
      {isDrillOpen && (
        <div
          id="micro-drill-widget"
          className="apple-surface-muted p-4 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-semibold ${
                isDark ? "text-[#2997FF]" : "text-[#0071E3]"
              }`}
            >
              Concept Check · {currentDrill.topic}
            </span>
            <button
              onClick={() => {
                soundFx.playTap();
                setIsDrillOpen(false);
              }}
              className={`text-xs font-medium ${
                isDark
                  ? "text-zinc-400 hover:text-white"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              Close
            </button>
          </div>

          <p className="text-xs font-medium leading-relaxed">
            {currentDrill.prompt}
          </p>

          <div className="space-y-2">
            {currentDrill.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDrillOption(idx)}
                  disabled={selectedOption !== null && opt.isCorrect}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? opt.isCorrect
                        ? isDark
                          ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-200 font-medium"
                          : "bg-emerald-50 border-emerald-300 text-emerald-900 font-medium"
                        : isDark
                        ? "bg-rose-500/15 border-rose-400/40 text-rose-200"
                        : "bg-rose-50 border-rose-300 text-rose-900"
                      : isDark
                      ? "bg-[#1C1C1E] border-white/[0.08] hover:border-white/20 text-zinc-200"
                      : "bg-white border-black/[0.06] hover:border-black/15 text-[#1D1D1F]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-semibold text-[11px] shrink-0 mt-0.5 opacity-60">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{opt.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {drillFeedback && (
            <div
              className={`p-3 rounded-xl text-xs leading-relaxed border ${
                isCorrectFeedback
                  ? isDark
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-200"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : isDark
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-200"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                {isCorrectFeedback ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Goal met (+25 XP ready)</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Review & Retry</span>
                  </>
                )}
              </div>
              <p>{drillFeedback}</p>
            </div>
          )}
        </div>
      )}

      {/* All Missions Cleared Bonus */}
      {allCompleted && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isDark
              ? "bg-emerald-500/10 border-emerald-500/25 text-zinc-100"
              : "bg-emerald-50/80 border-emerald-200 text-[#1D1D1F]"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">
                All Daily Missions Complete
              </div>
              <p
                className={`text-[11px] truncate ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                {allBonusClaimed
                  ? "Bonus claimed for today"
                  : "Ready for +35 bonus XP"}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {allBonusClaimed ? (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Claimed
              </span>
            ) : (
              <button
                onClick={handleClaimAllBonus}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3" />
                <span>+35 XP</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
