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
  Check
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
    prompt: "How does Retrieval-Augmented Generation (RAG) primarily prevent LLM hallucinations?",
    options: [
      {
        text: "By hard-coding model weights during backpropagation",
        isCorrect: false,
        explanation: "Backpropagation is part of offline training, not real-time query retrieval."
      },
      {
        text: "By fetching verified domain documents into the context window before generation",
        isCorrect: true,
        explanation: "Correct! RAG grounds generation by injecting relevant, trusted factual context at inference time."
      },
      {
        text: "By restricting model output to only one token at a time",
        isCorrect: false,
        explanation: "Token generation rate doesn't guarantee factual accuracy."
      }
    ]
  },
  {
    id: "drill-temp",
    topic: "Sampling & Temperature",
    prompt: "When configuring an LLM, what does raising the 'temperature' parameter from 0.1 to 1.2 do?",
    options: [
      {
        text: "Increases token entropy and randomness, producing more varied and creative responses",
        isCorrect: true,
        explanation: "Spot on! Higher temperature softens the probability distribution, allowing less predictable tokens to be sampled."
      },
      {
        text: "Overheats the GPU cluster and throttles inference speed",
        isCorrect: false,
        explanation: "Temperature in software sampling is mathematical, not physical hardware heat."
      },
      {
        text: "Guarantees deterministic, identical outputs on identical prompts",
        isCorrect: false,
        explanation: "Low temperature (~0.0) produces deterministic outputs; high temperature does the opposite."
      }
    ]
  },
  {
    id: "drill-embeddings",
    topic: "Neural Embeddings",
    prompt: "Why are high-dimensional vector embeddings used instead of simple keyword matching?",
    options: [
      {
        text: "They capture latent semantic meaning so synonyms land close in coordinate space",
        isCorrect: true,
        explanation: "Exact! Embeddings place words with related conceptual meanings near each other in geometric space."
      },
      {
        text: "They encrypt confidential prompts so search engines cannot read them",
        isCorrect: false,
        explanation: "Embeddings are mathematical representations, not cryptographic ciphers."
      },
      {
        text: "They reduce file sizes down to zero bytes",
        isCorrect: false,
        explanation: "Dense floating-point vectors actually take substantial storage."
      }
    ]
  },
  {
    id: "drill-agents",
    topic: "Autonomous AI Agents",
    prompt: "What does the 'Reasoning + Acting' (ReAct) paradigm enable an AI agent to do?",
    options: [
      {
        text: "Run a think-act-observe loop to decide which tools or APIs to call to solve complex tasks",
        isCorrect: true,
        explanation: "Excellent! ReAct allows agents to plan next steps, invoke external tools, and observe intermediate feedback."
      },
      {
        text: "Re-compile React frontend JavaScript bundles",
        isCorrect: false,
        explanation: "In AI, ReAct stands for Reasoning and Acting, not the web framework."
      },
      {
        text: "Bypass security firewalls without authorization",
        isCorrect: false,
        explanation: "ReAct is an architectural pattern for autonomous problem-solving workflows."
      }
    ]
  },
  {
    id: "drill-activation",
    topic: "Neural Networks",
    prompt: "What critical mathematical capability do activation functions (like ReLU) give a deep neural network?",
    options: [
      {
        text: "Non-linearity, allowing the network to approximate complex non-linear decision boundaries",
        isCorrect: true,
        explanation: "Yes! Without non-linear activation functions, stacking layers collapses mathematically into a single linear transformation."
      },
      {
        text: "Converts code comments into Python bytecode",
        isCorrect: false,
        explanation: "Activation functions operate strictly on tensor values inside neurons."
      },
      {
        text: "Limits electricity consumption across data centers",
        isCorrect: false,
        explanation: "Activation functions are mathematical matrix operations."
      }
    ]
  }
];

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  user,
  activeQuest,
  onStartLesson,
  onOpenTutor,
  onAddXP,
  theme = "riso-pop"
}) => {
  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";
  const isNeumorphic = theme === "neumorphic";
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Compute countdown to midnight local time
  const [timeLeft, setTimeLeft] = useState<string>("");
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        return "Resets soon";
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `Resets in ${hours}h ${minutes}m`;
    };

    setTimeLeft(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load or initialize mission states for today
  const [missionsState, setMissionsState] = useState<Record<string, MissionState>>(() => {
    const storageKey = `neuroquest_daily_missions_${todayKey}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return {
      mission_lesson: {
        id: "mission_lesson",
        completed: (user.completedQuestIds?.length || 0) > 0,
        claimed: false,
        progress: (user.completedQuestIds?.length || 0) > 0 ? 1 : 0,
        target: 1
      },
      mission_tutor: {
        id: "mission_tutor",
        completed: false,
        claimed: false,
        progress: 0,
        target: 1
      },
      mission_drill: {
        id: "mission_drill",
        completed: false,
        claimed: false,
        progress: 0,
        target: 1
      }
    };
  });

  // Track all-missions completion bonus
  const [allBonusClaimed, setAllBonusClaimed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`neuroquest_daily_missions_bonus_${todayKey}`) === "true";
    } catch {
      return false;
    }
  });

  // Save changes to localStorage
  const saveMissionState = (updated: Record<string, MissionState>) => {
    setMissionsState(updated);
    try {
      localStorage.setItem(`neuroquest_daily_missions_${todayKey}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Check if quests completed changes in user profile
  useEffect(() => {
    if ((user.completedQuestIds?.length || 0) > 0) {
      if (!missionsState.mission_lesson?.completed) {
        const updated = {
          ...missionsState,
          mission_lesson: {
            ...missionsState.mission_lesson,
            completed: true,
            progress: 1
          }
        };
        saveMissionState(updated);
      }
    }
  }, [user.completedQuestIds?.length]);

  // Micro-drill interactive state
  const [isDrillOpen, setIsDrillOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [drillFeedback, setDrillFeedback] = useState<string | null>(null);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean>(false);
  const [recentlyClaimedId, setRecentlyClaimedId] = useState<string | null>(null);

  // Pick today's drill deterministically based on day of year
  const currentDrill = useMemo(() => {
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return ROTATING_DRILLS[dayOfYear % ROTATING_DRILLS.length];
  }, []);

  // 3 Bite-Sized Learning Goals
  const missionsList = [
    {
      id: "mission_lesson",
      title: "Complete 1 Bite-Sized Lesson",
      description: activeQuest
        ? `Tackle "${activeQuest.quest.title}" or any curriculum stage`
        : "Advance through today's neural architecture module",
      xpReward: 30,
      icon: BookOpen,
      iconColor: isDark ? "text-amber-400 bg-amber-400/15" : "text-[#4F46E5] bg-[#EEF2FF]",
      state: missionsState.mission_lesson,
      actionLabel: "Start Lesson",
      onAction: () => {
        soundFx.playTap();
        onStartLesson();
      }
    },
    {
      id: "mission_tutor",
      title: "Consult with NeuroBot Tutor",
      description: "Ask a question or explore a concept with your Socratic AI guide",
      xpReward: 20,
      icon: MessageSquare,
      iconColor: isDark ? "text-sky-400 bg-sky-400/15" : "text-sky-600 bg-sky-50",
      state: missionsState.mission_tutor,
      actionLabel: "Chat Tutor",
      onAction: () => {
        soundFx.playTap();
        // Mark mission as complete upon initiating session
        if (!missionsState.mission_tutor.completed) {
          const updated = {
            ...missionsState,
            mission_tutor: {
              ...missionsState.mission_tutor,
              completed: true,
              progress: 1
            }
          };
          saveMissionState(updated);
        }
        onOpenTutor();
      }
    },
    {
      id: "mission_drill",
      title: "Daily AI Concept Check",
      description: `Rapid 10-second check on "${currentDrill.topic}"`,
      xpReward: 25,
      icon: Target,
      iconColor: isDark ? "text-emerald-400 bg-emerald-400/15" : "text-emerald-600 bg-emerald-50",
      state: missionsState.mission_drill,
      actionLabel: "Take Drill",
      onAction: () => {
        soundFx.playTap();
        setIsDrillOpen(true);
      }
    }
  ];

  // Calculate Progress
  const completedCount = missionsList.filter((m) => m.state?.completed).length;
  const totalCount = missionsList.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  // Claim Mission XP
  const handleClaimReward = (missionId: string, xp: number) => {
    soundFx.playMissionComplete();
    onAddXP(xp);
    setRecentlyClaimedId(missionId);
    setTimeout(() => setRecentlyClaimedId(null), 2000);

    const updated = {
      ...missionsState,
      [missionId]: {
        ...missionsState[missionId],
        claimed: true
      }
    };
    saveMissionState(updated);
  };

  // Claim All Bonus (+35 XP)
  const handleClaimAllBonus = () => {
    if (!allCompleted || allBonusClaimed) return;
    soundFx.playMissionComplete();
    onAddXP(35);
    setAllBonusClaimed(true);
    try {
      localStorage.setItem(`neuroquest_daily_missions_bonus_${todayKey}`, "true");
    } catch {
      // Ignore
    }
  };

  // Handle Drill Answer
  const handleSelectDrillOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const opt = currentDrill.options[index];
    if (opt.isCorrect) {
      soundFx.playCorrect();
      setIsCorrectFeedback(true);
      setDrillFeedback(opt.explanation);
      // Complete mission
      const updated = {
        ...missionsState,
        mission_drill: {
          ...missionsState.mission_drill,
          completed: true,
          progress: 1
        }
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
      className={`p-4 sm:p-5 rounded-2xl space-y-4 transition-all ${
        isNeumorphic
          ? "neu-raised text-slate-800"
          : isDark
          ? "bg-[#27272A] border border-[#3F3F46] text-[#F4F4F5] shadow-lg"
          : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
      }`}
    >
      {/* Header with Title and Countdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isNeumorphic
                ? "neu-inset text-[#4F46E5]"
                : isDark
                ? "bg-amber-400/20 border border-amber-400/40 text-amber-300"
                : "bg-[#EEF2FF] border border-[#1E1B18] text-[#4F46E5] shadow-[1px_1px_0px_#1E1B18]"
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
              DAILY MISSIONS
            </h3>
            <span
              className={`text-[10px] font-mono font-bold block ${
                isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              3 BITE-SIZED LEARNING GOALS
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
            isNeumorphic
              ? "neu-inset text-slate-600"
              : isDark
              ? "bg-[#18181B] border border-zinc-700 text-zinc-300"
              : "bg-zinc-100 border border-zinc-300 text-zinc-700"
          }`}
        >
          <Clock className="w-3 h-3 text-zinc-400" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Progress Bar Indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className={isNeumorphic ? "text-slate-600" : isDark ? "text-zinc-300" : "text-zinc-700"}>
            Progress:{" "}
            <strong className={isNeumorphic ? "text-[#4F46E5]" : isDark ? "text-amber-400" : "text-[#4F46E5]"}>
              {completedCount} / {totalCount}
            </strong>{" "}
            ({progressPercent}%)
          </span>
          <span
            className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
              allCompleted
                ? isNeumorphic
                  ? "neu-flat text-emerald-600"
                  : isDark
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : isNeumorphic
                ? "text-slate-500"
                : isDark
                ? "text-zinc-400"
                : "text-zinc-500"
            }`}
          >
            {allCompleted ? "All Goals Met! 🎉" : "Extra XP on completion"}
          </span>
        </div>

        {/* Visual Progress Bar with Segment Markers */}
        <div
          className={`relative w-full h-3 rounded-full overflow-hidden ${
            isNeumorphic
              ? "neu-inset p-0.5"
              : isDark
              ? "bg-[#18181B] border-2 border-[#3F3F46]"
              : "bg-zinc-100 border-2 border-[#1E1B18]"
          }`}
        >
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              allCompleted
                ? isNeumorphic
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm"
                  : isDark
                  ? "bg-gradient-to-r from-amber-400 to-emerald-400"
                  : "bg-gradient-to-r from-[#4F46E5] to-[#10B981]"
                : isNeumorphic
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm"
                : isDark
                ? "bg-amber-400"
                : "bg-[#4F46E5]"
            }`}
            style={{ width: `${progressPercent}%` }}
          />

          {/* Segment Markers at 33% and 66% */}
          <div className="absolute inset-0 flex justify-between px-[33%] pointer-events-none">
            <span
              className={`w-0.5 h-full ${
                isDark ? "bg-[#3F3F46]" : "bg-[#1E1B18]/30"
              }`}
            />
            <span
              className={`w-0.5 h-full ${
                isDark ? "bg-[#3F3F46]" : "bg-[#1E1B18]/30"
              }`}
            />
          </div>
        </div>
      </div>

      {/* 3 Mission Cards */}
      <div className="space-y-2.5 pt-1">
        {missionsList.map((mission) => {
          const IconComp = mission.icon;
          const isDone = Boolean(mission.state?.completed);
          const isClaimed = Boolean(mission.state?.claimed);
          const isRecentlyClaimed = recentlyClaimedId === mission.id;

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                isNeumorphic
                  ? isDone
                    ? "neu-inset text-slate-800"
                    : "neu-flat text-slate-800"
                  : isDone
                  ? isDark
                    ? "bg-zinc-900/60 border-2 border-zinc-700 text-zinc-100"
                    : "bg-[#FAFAF8] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                  : isDark
                  ? "bg-[#18181B] border-2 border-zinc-700 text-zinc-200 hover:border-zinc-500"
                  : "bg-white border-2 border-zinc-300 text-[#1E1B18] hover:border-[#1E1B18]"
              }`}
            >
              {/* Left: Icon and Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                    isNeumorphic
                      ? isDone
                        ? "neu-flat text-emerald-600 border border-emerald-400/40"
                        : "neu-inset text-[#4F46E5]"
                      : isDone
                      ? isDark
                        ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300"
                        : "bg-emerald-100 border border-emerald-400 text-emerald-700"
                      : `${mission.iconColor} border`
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 fill-current" />
                  ) : (
                    <IconComp className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isDone && isClaimed
                          ? isNeumorphic
                            ? "text-slate-400 line-through"
                            : isDark
                            ? "text-zinc-400 line-through"
                            : "text-zinc-500"
                          : ""
                      }`}
                    >
                      {mission.title}
                    </h4>
                    <span
                      className={`shrink-0 text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                        isNeumorphic
                          ? isDone
                            ? "neu-inset text-emerald-600"
                            : "neu-pill-accent text-[#4F46E5]"
                          : isDone
                          ? isDark
                            ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isDark
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      +{mission.xpReward} XP
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    {mission.description}
                  </p>
                </div>
              </div>

              {/* Right: Action or Claim Button */}
              <div className="shrink-0 flex items-center gap-1.5">
                {isDone && !isClaimed ? (
                  <button
                    onClick={() => handleClaimReward(mission.id, mission.xpReward)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 animate-pulse ${
                      isNeumorphic
                        ? "neu-btn-primary shadow-md"
                        : isDark
                        ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md"
                        : "bg-[#FEF08A] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] hover:bg-[#FDE047]"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>CLAIM</span>
                  </button>
                ) : isDone && isClaimed ? (
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 ${
                      isNeumorphic
                        ? "neu-inset text-emerald-600"
                        : isDark
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>CLAIMED</span>
                  </span>
                ) : (
                  <button
                    onClick={mission.onAction}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 ${
                      isNeumorphic
                        ? "neu-btn text-slate-700 hover:text-indigo-600"
                        : isDark
                        ? "bg-[#27272A] border border-zinc-600 hover:border-amber-400 text-zinc-200"
                        : "bg-[#EEF2FF] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] hover:bg-[#E0E7FF]"
                    }`}
                  >
                    <span>{mission.actionLabel}</span>
                    <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Micro-Drill Modal / Accordion */}
      {isDrillOpen && (
        <div
          id="micro-drill-widget"
          className={`p-4 rounded-xl border-2 space-y-3 transition-all ${
            isDark
              ? "bg-[#18181B] border-amber-400/50 text-zinc-100"
              : "bg-[#FFFBEB] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                  isDark
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}
              >
                10-SEC MICRO DRILL
              </span>
              <span className={`text-[10px] font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                • {currentDrill.topic}
              </span>
            </div>
            <button
              onClick={() => {
                soundFx.playTap();
                setIsDrillOpen(false);
              }}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1"
            >
              Close ✕
            </button>
          </div>

          <p className="text-xs font-bold leading-relaxed">{currentDrill.prompt}</p>

          {/* Drill Options */}
          <div className="space-y-2">
            {currentDrill.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDrillOption(idx)}
                  disabled={selectedOption !== null && opt.isCorrect}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? opt.isCorrect
                        ? isDark
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                          : "bg-emerald-100 border-emerald-600 text-emerald-900 font-bold"
                        : isDark
                        ? "bg-rose-500/20 border-rose-400 text-rose-300"
                        : "bg-rose-100 border-rose-500 text-rose-900"
                      : isDark
                      ? "bg-[#27272A] border-zinc-700 hover:border-zinc-500 text-zinc-200"
                      : "bg-white border-zinc-300 hover:border-zinc-500 text-zinc-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-black text-[11px] shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{opt.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {drillFeedback && (
            <div
              className={`p-2.5 rounded-lg text-xs leading-normal border ${
                isCorrectFeedback
                  ? isDark
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : isDark
                  ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isCorrectFeedback ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Goal Met! +25 XP Ready to Claim</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Review & Try Again</span>
                  </>
                )}
              </div>
              <p>{drillFeedback}</p>
            </div>
          )}
        </div>
      )}

      {/* All Missions Cleared Bonus Box */}
      {allCompleted && (
        <div
          className={`p-3 rounded-xl border-2 flex items-center justify-between gap-3 ${
            isDark
              ? "bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-amber-400/40 text-zinc-100"
              : "bg-[#FEF9C3] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isDark
                  ? "bg-amber-400/30 border-amber-400 text-amber-300"
                  : "bg-[#FEF08A] border-[#1E1B18] text-[#1E1B18]"
              }`}
            >
              <Award className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <span>ALL MISSIONS CLEARED!</span>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                  +35 BONUS XP
                </span>
              </div>
              <p className={`text-[10px] ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                {allBonusClaimed
                  ? "You've earned all extra XP today! Come back tomorrow for new goals."
                  : "Outstanding work! Claim your daily grand mastery bonus."}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {allBonusClaimed ? (
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 border ${
                  isDark
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                <Check className="w-3 h-3" />
                <span>COMPLETED</span>
              </span>
            ) : (
              <button
                onClick={handleClaimAllBonus}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 ${
                  isDark
                    ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md"
                    : "bg-[#4F46E5] text-white hover:bg-[#4338CA] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>CLAIM +35 XP</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
