import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Award,
  CheckCircle2,
  Sparkles,
  Bot,
  Zap,
  Swords,
  Lightbulb,
  Sun,
  Moon,
} from "lucide-react";
import { Quest, QuestPhase, Stage, AppTheme } from "../../types";
import { triggerCelebrationConfetti } from "../../utils/confetti";
import { soundFx } from "../../utils/sound";

interface QuestViewProps {
  quest: Quest;
  stage: Stage;
  onBackToJourney: () => void;
  onCompleteQuest: (
    questId: string,
    xpReward: number,
    skillTag: string
  ) => void;
  onOpenTutor: (questTitle: string, phase: string) => void;
  onNavigateNextQuest?: (nextQuestId: string) => void;
  onToggleTheme?: () => void;
  theme?: AppTheme;
}

const CHEERFUL_PRAISES = [
  "Well reasoned.",
  "Spot on.",
  "Great intuition.",
  "Clear mastery.",
  "Exact insight.",
];

const MASCOT_TIPS = [
  "NeuroBot: Real-world machine learning is about recognizing patterns rather than memorizing rules.",
  "NeuroBot: Think about the everyday analogy when evaluating edge cases.",
  "NeuroBot: High-dimensional embeddings are simply coordinates for meaning.",
  "NeuroBot: Every breakthrough architecture starts from clear fundamentals.",
];

const PHASE_ORDER: Record<QuestPhase, number> = {
  learn: 0,
  "concept-check": 1,
  "boss-challenge": 2,
  reward: 3,
};

const phaseSlideVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 16 : -16,
    scale: 0.992,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -16 : 16,
    scale: 0.995,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const cardSlideVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 14 : -14,
    scale: 0.992,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -14 : 14,
    scale: 0.995,
    transition: {
      duration: 0.16,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export const QuestView: React.FC<QuestViewProps> = ({
  quest,
  stage,
  onBackToJourney,
  onCompleteQuest,
  onOpenTutor,
  onNavigateNextQuest,
  onToggleTheme,
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const [phase, setPhase] = useState<QuestPhase>("learn");
  const [phaseDirection, setPhaseDirection] = useState(1);

  const [activeQACardIdx, setActiveQACardIdx] = useState(0);
  const [cardDirection, setCardDirection] = useState(1);

  const [selectedConceptOption, setSelectedConceptOption] = useState<
    string | null
  >(null);
  const [conceptSubmitted, setConceptSubmitted] = useState(false);
  const [conceptPraise, setConceptPraise] = useState(CHEERFUL_PRAISES[0]);

  const [selectedBossOption, setSelectedBossOption] = useState<string | null>(
    null
  );
  const [bossSubmitted, setBossSubmitted] = useState(false);
  const [bossPraise, setBossPraise] = useState(CHEERFUL_PRAISES[1]);

  const qaCards = quest.learn.qaCards || [
    {
      badgeEmoji: "💡",
      question: quest.learn.title,
      answer: quest.learn.summary,
      analogy: quest.learn.proTip,
    },
  ];

  const conceptCheckData = quest.conceptCheck || {
    prompt: quest.prove?.question || "What is the core takeaway of this lesson?",
    contextPill: "Concept Check",
    options: quest.prove?.options || [],
    encouragement: "You grasped the core principle.",
  };

  const bossChallengeData = quest.bossChallenge || {
    title: `Scenario Challenge: ${quest.title}`,
    scenario:
      quest.prove?.scenario ||
      "A real-world engineering challenge puts your AI knowledge to the test.",
    question: quest.prove?.question || "How do you solve this scenario?",
    options: quest.prove?.options || [],
    bossAvatar: "🤖",
    bossQuote: "",
    victoryMessage: "Challenge solved with strong engineering judgment.",
    deepDiveExplanation:
      quest.prove?.deepDiveExplanation || "Great job completing this quest!",
  };

  const handleSwitchPhase = (newPhase: QuestPhase) => {
    const currentOrder = PHASE_ORDER[phase];
    const newOrder = PHASE_ORDER[newPhase];
    setPhaseDirection(newOrder >= currentOrder ? 1 : -1);
    setPhase(newPhase);
  };

  const handleNextPhase = () => {
    soundFx.playTap();
    if (phase === "learn") {
      handleSwitchPhase("concept-check");
    } else if (phase === "concept-check") {
      handleSwitchPhase("boss-challenge");
    } else if (phase === "boss-challenge") {
      handleSwitchPhase("reward");
      soundFx.playMissionComplete();
      triggerCelebrationConfetti();
      onCompleteQuest(quest.id, quest.xpReward, quest.skillTag);
    }
  };

  const handleConceptSubmit = () => {
    if (!selectedConceptOption) return;
    setConceptSubmitted(true);
    const chosen = conceptCheckData.options.find(
      (o) => o.id === selectedConceptOption
    );
    if (chosen?.isCorrect) {
      soundFx.playCorrect();
      triggerCelebrationConfetti();
      const randomPraise =
        CHEERFUL_PRAISES[Math.floor(Math.random() * CHEERFUL_PRAISES.length)];
      setConceptPraise(randomPraise);
    } else {
      soundFx.playWrong();
    }
  };

  const handleBossSubmit = () => {
    if (!selectedBossOption) return;
    setBossSubmitted(true);
    const chosen = bossChallengeData.options.find(
      (o) => o.id === selectedBossOption
    );
    if (chosen?.isCorrect) {
      soundFx.playCorrect();
      triggerCelebrationConfetti();
      const randomPraise =
        CHEERFUL_PRAISES[Math.floor(Math.random() * CHEERFUL_PRAISES.length)];
      setBossPraise(randomPraise);
    } else {
      soundFx.playWrong();
    }
  };

  const phasesList: {
    id: QuestPhase;
    label: string;
    shortLabel: string;
    icon: typeof BookOpen;
  }[] = [
    { id: "learn", label: "Learn", shortLabel: "Learn", icon: BookOpen },
    {
      id: "concept-check",
      label: "Concept Check",
      shortLabel: "Check",
      icon: Zap,
    },
    {
      id: "boss-challenge",
      label: "Scenario",
      shortLabel: "Challenge",
      icon: Swords,
    },
    { id: "reward", label: "Complete", shortLabel: "Reward", icon: Award },
  ];

  const currentQACard = qaCards[activeQACardIdx] || qaCards[0];
  const conceptChosenOpt = conceptCheckData.options.find(
    (o) => o.id === selectedConceptOption
  );
  const isConceptCorrect = conceptChosenOpt?.isCorrect ?? false;

  const bossChosenOpt = bossChallengeData.options.find(
    (o) => o.id === selectedBossOption
  );
  const isBossCorrect = bossChosenOpt?.isCorrect ?? false;

  return (
    <motion.div
      id="quest-view-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-6"
    >
      {/* Frosted Glass Upper Dash */}
      <div
        className={`apple-glass-dock rounded-3xl px-4 py-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
          isDark ? "text-[#F5F5F7]" : "text-[#1D1D1F]"
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            id="back-to-journey-btn"
            onClick={onBackToJourney}
            className={`min-h-[40px] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap apple-glass-pill ${
              isDark ? "text-zinc-100" : "text-[#1D1D1F]"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="min-w-0">
            <div
              className={`text-xs font-medium ${
                isDark ? "text-[#2997FF]" : "text-[#0071E3]"
              }`}
            >
              Stage {stage.number} · {stage.title}
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              {quest.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onToggleTheme && (
            <button
              id="btn-quest-theme-toggle"
              onClick={() => {
                soundFx.playTap();
                onToggleTheme();
              }}
              className="min-h-[38px] flex items-center p-0.5 rounded-full apple-glass-pill"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span
                className={`p-1.5 rounded-full ${
                  !isDark
                    ? "bg-white/90 text-amber-500 shadow-xs"
                    : "text-zinc-500"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </span>
              <span
                className={`p-1.5 rounded-full ${
                  isDark
                    ? "bg-white/[0.16] text-amber-300 shadow-xs"
                    : "text-zinc-400"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </span>
            </button>
          )}

          <button
            id="open-neuro-tutor-btn"
            onClick={() => onOpenTutor(quest.title, phase)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap apple-glass-pill ${
              isDark ? "text-[#2997FF]" : "text-[#0071E3]"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask NeuroBot</span>
          </button>

          <div
            className={`min-h-[38px] px-3 py-1.5 rounded-full text-xs font-mono font-semibold tabular-nums flex items-center gap-1.5 whitespace-nowrap apple-glass-pill ${
              isDark ? "text-amber-300" : "text-[#1D1D1F]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>+{quest.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Frosted Glass Segmented 4-Step Phase Stepper */}
      <div className="grid grid-cols-4 gap-1 p-1.5 rounded-full apple-glass-dock">
        {phasesList.map((p) => {
          const Icon = p.icon;
          const isActive = phase === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                soundFx.playTap();
                handleSwitchPhase(p.id);
              }}
              className={`relative py-2 px-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors z-10 whitespace-nowrap ${
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
                  layoutId="quest-phase-pill"
                  transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.8 }}
                  className={`absolute inset-0 rounded-full -z-10 ${
                    isDark
                      ? "bg-white/[0.15] border border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                      : "bg-white/80 border border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_10px_rgba(0,113,227,0.12)]"
                  }`}
                />
              )}
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Calm Tutor Note Strip */}
      <div className="apple-surface px-4 py-3 rounded-2xl flex items-center gap-3 text-xs">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isDark
              ? "bg-[#2997FF]/15 text-[#2997FF]"
              : "bg-[#0071E3]/10 text-[#0071E3]"
          }`}
        >
          <Bot className="w-4 h-4" />
        </div>
        <p className={isDark ? "text-zinc-300" : "text-[#424245]"}>
          {MASCOT_TIPS[Math.abs(quest.title.length) % MASCOT_TIPS.length]}
        </p>
      </div>

      {/* Phase Body */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={phaseDirection}>
          {/* STEP 1: LEARN */}
          {phase === "learn" && (
            <motion.div
              key="phase-learn"
              custom={phaseDirection}
              variants={phaseSlideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              id="quest-phase-learn"
              className="space-y-6"
            >
              <div className="apple-surface rounded-3xl p-6 sm:p-8 space-y-6">
                <div
                  className={`flex items-center justify-between pb-4 border-b ${
                    isDark ? "border-white/[0.08]" : "border-black/[0.06]"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                    }`}
                  >
                    Card {activeQACardIdx + 1} of {qaCards.length}
                  </span>
                  <div className="flex gap-1.5">
                    {qaCards.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          soundFx.playTap();
                          setCardDirection(idx > activeQACardIdx ? 1 : -1);
                          setActiveQACardIdx(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === activeQACardIdx
                            ? "w-7 bg-[#0071E3] dark:bg-[#2997FF]"
                            : isDark
                            ? "w-4 bg-zinc-700"
                            : "w-4 bg-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait" custom={cardDirection}>
                  <motion.div
                    key={`qa-card-${activeQACardIdx}`}
                    custom={cardDirection}
                    variants={cardSlideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-5"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {currentQACard.question}
                    </h2>

                    <div className="apple-surface-muted p-5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Core Concept</span>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed">
                        {currentQACard.answer}
                      </p>
                    </div>

                    <div
                      className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                        isDark
                          ? "bg-[#2997FF]/[0.07] border-[#2997FF]/20 text-zinc-200"
                          : "bg-[#0071E3]/[0.04] border-[#0071E3]/15 text-[#1D1D1F]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isDark
                            ? "bg-[#2997FF]/20 text-[#2997FF]"
                            : "bg-[#0071E3]/15 text-[#0071E3]"
                        }`}
                      >
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <span className="font-semibold block">
                          Real-World Analogy
                        </span>
                        <p
                          className={`leading-relaxed ${
                            isDark ? "text-zinc-300" : "text-[#424245]"
                          }`}
                        >
                          {currentQACard.analogy}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      soundFx.playTap();
                      setCardDirection(-1);
                      setActiveQACardIdx((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={activeQACardIdx === 0}
                    className={`min-h-[42px] px-4 py-2 rounded-full border text-xs font-semibold transition-colors disabled:opacity-30 ${
                      isDark
                        ? "border-white/[0.1] text-zinc-300 hover:bg-white/[0.06]"
                        : "border-black/[0.08] text-[#1D1D1F] hover:bg-black/[0.04]"
                    }`}
                  >
                    Previous
                  </button>

                  {activeQACardIdx < qaCards.length - 1 ? (
                    <button
                      id="next-qa-card-btn"
                      onClick={() => {
                        soundFx.playTap();
                        setCardDirection(1);
                        setActiveQACardIdx((prev) => prev + 1);
                      }}
                      className="min-h-[42px] px-5 py-2 rounded-full font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <span>
                        Next ({activeQACardIdx + 2}/{qaCards.length})
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      id="proceed-to-concept-check-btn"
                      onClick={handleNextPhase}
                      className="min-h-[42px] px-5 py-2 rounded-full font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <span>Continue to Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Key Terms */}
              <div className="apple-surface rounded-3xl p-5 sm:p-6 space-y-3">
                <div
                  className={`flex items-center gap-2 text-xs font-semibold ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                  <span>Key Terms</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(quest.learn.keyConcepts || []).map((kc, idx) => (
                    <div
                      key={idx}
                      className="apple-surface-muted p-3.5 rounded-2xl"
                    >
                      <div className="text-xs font-semibold">{kc.term}</div>
                      <div
                        className={`text-xs mt-1 leading-relaxed ${
                          isDark ? "text-zinc-400" : "text-[#6E6E73]"
                        }`}
                      >
                        {kc.definition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CONCEPT CHECK */}
          {phase === "concept-check" && (
            <motion.div
              key="phase-concept-check"
              custom={phaseDirection}
              variants={phaseSlideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              id="quest-phase-concept-check"
              className="space-y-6"
            >
              <div className="apple-surface rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="space-y-1.5">
                  <div
                    className={`text-xs font-medium ${
                      isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                    }`}
                  >
                    {conceptCheckData.contextPill || "Concept Check"}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {conceptCheckData.prompt}
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {conceptCheckData.options.map((opt) => {
                    const isSelected = selectedConceptOption === opt.id;
                    const showFeedback = conceptSubmitted;

                    let cardStyle = isDark
                      ? "bg-[#2C2C2E]/70 border-white/[0.08] text-zinc-200 hover:border-white/20"
                      : "bg-[#F9F9FB] border-black/[0.06] text-[#1D1D1F] hover:border-black/15";

                    if (isSelected && !showFeedback) {
                      cardStyle = isDark
                        ? "bg-[#2997FF]/15 border-[#2997FF]/60 text-white"
                        : "bg-[#0071E3]/[0.07] border-[#0071E3]/60 text-[#1D1D1F]";
                    } else if (showFeedback) {
                      if (opt.isCorrect) {
                        cardStyle = isDark
                          ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-100"
                          : "bg-emerald-50 border-emerald-300 text-emerald-950";
                      } else if (isSelected && !opt.isCorrect) {
                        cardStyle = isDark
                          ? "bg-rose-500/15 border-rose-400/50 text-rose-100"
                          : "bg-rose-50 border-rose-300 text-rose-950";
                      }
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (!conceptSubmitted) {
                            soundFx.playTap();
                            setSelectedConceptOption(opt.id);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${cardStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-semibold ${
                              isSelected
                                ? "border-[#0071E3] bg-[#0071E3] text-white"
                                : isDark
                                ? "border-zinc-600"
                                : "border-zinc-300"
                            }`}
                          >
                            {isSelected ? "✓" : ""}
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm leading-relaxed font-medium flex-1">
                            <div>{opt.text}</div>
                            {showFeedback && (isSelected || opt.isCorrect) && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                                  opt.isCorrect
                                    ? isDark
                                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                                      : "bg-white border-emerald-200 text-emerald-900"
                                    : isDark
                                    ? "bg-rose-950/40 border-rose-500/30 text-rose-200"
                                    : "bg-white border-rose-200 text-rose-900"
                                }`}
                              >
                                {opt.explanation}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {conceptSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                      isConceptCorrect
                        ? isDark
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                          : "bg-emerald-50 border-emerald-200 text-emerald-950"
                        : isDark
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                        : "bg-rose-50 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        {isConceptCorrect
                          ? conceptPraise
                          : "Not quite — take another look"}
                      </div>
                      <div className="text-xs opacity-85 mt-0.5">
                        {isConceptCorrect
                          ? conceptCheckData.encouragement
                          : "Review the note above and try another option."}
                      </div>
                    </div>
                    {!isConceptCorrect && (
                      <button
                        onClick={() => {
                          soundFx.playTap();
                          setConceptSubmitted(false);
                          setSelectedConceptOption(null);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 shrink-0"
                      >
                        Try Again
                      </button>
                    )}
                  </motion.div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      soundFx.playTap();
                      handleSwitchPhase("learn");
                    }}
                    className={`min-h-[42px] px-4 py-2 rounded-full border text-xs font-semibold transition-colors ${
                      isDark
                        ? "border-white/[0.1] text-zinc-300 hover:bg-white/[0.06]"
                        : "border-black/[0.08] text-[#1D1D1F] hover:bg-black/[0.04]"
                    }`}
                  >
                    Review Cards
                  </button>

                  {!conceptSubmitted ? (
                    <button
                      id="submit-concept-check-btn"
                      onClick={handleConceptSubmit}
                      disabled={!selectedConceptOption}
                      className="min-h-[42px] px-6 py-2 rounded-full font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors disabled:opacity-40"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      id="proceed-to-boss-challenge-btn"
                      onClick={handleNextPhase}
                      className="min-h-[42px] px-5 py-2 rounded-full font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
                    >
                      <span>Continue to Challenge</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SCENARIO CHALLENGE */}
          {phase === "boss-challenge" && (
            <motion.div
              key="phase-boss-challenge"
              custom={phaseDirection}
              variants={phaseSlideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              id="quest-phase-boss-challenge"
              className="space-y-6"
            >
              <div className="apple-surface rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="space-y-1">
                  <div
                    className={`text-xs font-medium ${
                      isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                    }`}
                  >
                    Step 3 · Applied Scenario
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                    {bossChallengeData.title}
                  </h3>
                </div>

                <div className="apple-surface-muted p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1">
                  <span
                    className={`text-xs font-semibold block ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    Scenario
                  </span>
                  <p>{bossChallengeData.scenario}</p>
                </div>

                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  {bossChallengeData.question}
                </h2>

                <div className="space-y-2.5">
                  {bossChallengeData.options.map((opt) => {
                    const isSelected = selectedBossOption === opt.id;
                    const showFeedback = bossSubmitted;

                    let cardStyle = isDark
                      ? "bg-[#2C2C2E]/70 border-white/[0.08] text-zinc-200 hover:border-white/20"
                      : "bg-[#F9F9FB] border-black/[0.06] text-[#1D1D1F] hover:border-black/15";

                    if (isSelected && !showFeedback) {
                      cardStyle = isDark
                        ? "bg-[#2997FF]/15 border-[#2997FF]/60 text-white"
                        : "bg-[#0071E3]/[0.07] border-[#0071E3]/60 text-[#1D1D1F]";
                    } else if (showFeedback) {
                      if (opt.isCorrect) {
                        cardStyle = isDark
                          ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-100"
                          : "bg-emerald-50 border-emerald-300 text-emerald-950";
                      } else if (isSelected && !opt.isCorrect) {
                        cardStyle = isDark
                          ? "bg-rose-500/15 border-rose-400/50 text-rose-100"
                          : "bg-rose-50 border-rose-300 text-rose-950";
                      }
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (!bossSubmitted) {
                            soundFx.playTap();
                            setSelectedBossOption(opt.id);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${cardStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-semibold ${
                              isSelected
                                ? "border-[#0071E3] bg-[#0071E3] text-white"
                                : isDark
                                ? "border-zinc-600"
                                : "border-zinc-300"
                            }`}
                          >
                            {isSelected ? "✓" : ""}
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm leading-relaxed font-medium flex-1">
                            <div>{opt.text}</div>
                            {showFeedback && (isSelected || opt.isCorrect) && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                                  opt.isCorrect
                                    ? isDark
                                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                                      : "bg-white border-emerald-200 text-emerald-900"
                                    : isDark
                                    ? "bg-rose-950/40 border-rose-500/30 text-rose-200"
                                    : "bg-white border-rose-200 text-rose-900"
                                }`}
                              >
                                {opt.explanation}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {bossSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                        isBossCorrect
                          ? isDark
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                            : "bg-emerald-50 border-emerald-200 text-emerald-950"
                          : isDark
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                          : "bg-rose-50 border-rose-200 text-rose-950"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">
                          {isBossCorrect
                            ? bossPraise
                            : "Try another strategy"}
                        </div>
                        <div className="text-xs opacity-85 mt-0.5">
                          {isBossCorrect
                            ? bossChallengeData.victoryMessage
                            : "Review the feedback above and refine your choice."}
                        </div>
                      </div>
                      {!isBossCorrect && (
                        <button
                          onClick={() => {
                            soundFx.playTap();
                            setBossSubmitted(false);
                            setSelectedBossOption(null);
                          }}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 shrink-0"
                        >
                          Retry
                        </button>
                      )}
                    </div>

                    <div className="apple-surface-muted p-4 rounded-2xl space-y-1">
                      <span
                        className={`text-xs font-semibold block ${
                          isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                        }`}
                      >
                        Engineering Takeaway
                      </span>
                      <p className="text-xs leading-relaxed">
                        {bossChallengeData.deepDiveExplanation}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      soundFx.playTap();
                      handleSwitchPhase("concept-check");
                    }}
                    className={`min-h-[42px] px-4 py-2 rounded-full border text-xs font-semibold transition-colors ${
                      isDark
                        ? "border-white/[0.1] text-zinc-300 hover:bg-white/[0.06]"
                        : "border-black/[0.08] text-[#1D1D1F] hover:bg-black/[0.04]"
                    }`}
                  >
                    Concept Check
                  </button>

                  {!bossSubmitted ? (
                    <button
                      id="submit-boss-challenge-btn"
                      onClick={handleBossSubmit}
                      disabled={!selectedBossOption}
                      className="min-h-[42px] px-6 py-2 rounded-full font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors disabled:opacity-40"
                    >
                      Submit Strategy
                    </button>
                  ) : (
                    <button
                      id="claim-quest-reward-btn"
                      onClick={handleNextPhase}
                      className="min-h-[42px] px-5 py-2 rounded-full font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
                    >
                      <span>Complete & Claim XP</span>
                      <Award className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REWARD */}
          {phase === "reward" && (
            <motion.div
              key="phase-reward"
              custom={phaseDirection}
              variants={phaseSlideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              id="quest-phase-reward"
              className="apple-surface rounded-3xl p-8 sm:p-10 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                  isDark
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                <Award className="w-8 h-8" />
              </motion.div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Mission Accomplished
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Quest Complete
                </h2>
                <p
                  className={`text-sm max-w-md mx-auto ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  You mastered{" "}
                  <span className="font-semibold text-current">
                    {quest.title}
                  </span>
                  .
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                <div className="apple-surface-muted p-4 rounded-2xl">
                  <div
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    XP Awarded
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-[#0071E3] dark:text-[#2997FF] mt-0.5">
                    +{quest.xpReward} XP
                  </div>
                </div>
                <div className="apple-surface-muted p-4 rounded-2xl">
                  <div
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    Skill Unlocked
                  </div>
                  <div className="text-sm font-semibold truncate mt-1">
                    {quest.skillTag}
                  </div>
                </div>
                <div className="apple-surface-muted p-4 rounded-2xl">
                  <div
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    Badge
                  </div>
                  <div className="text-sm font-semibold truncate text-emerald-600 dark:text-emerald-400 mt-1">
                    {quest.badgeTitle || "Mastery"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="return-journey-finish-btn"
                  onClick={onBackToJourney}
                  className={`w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full border text-xs font-semibold transition-colors ${
                    isDark
                      ? "border-white/[0.1] text-zinc-200 hover:bg-white/[0.06]"
                      : "border-black/[0.08] text-[#1D1D1F] hover:bg-black/[0.04]"
                  }`}
                >
                  Back to Path
                </button>
                {onNavigateNextQuest && (
                  <button
                    id="next-quest-btn"
                    onClick={() => onNavigateNextQuest("next")}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Next Lesson</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
