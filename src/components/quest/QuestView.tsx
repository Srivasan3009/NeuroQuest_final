import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Award,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Bot,
  Zap,
  Flame,
  Star,
  Swords,
  Check,
  X,
  Lightbulb,
  Sun,
  Moon
} from "lucide-react";
import { Quest, QuestPhase, Stage, AppTheme } from "../../types";
import { triggerCelebrationConfetti } from "../../utils/confetti";
import { soundFx } from "../../utils/sound";

interface QuestViewProps {
  quest: Quest;
  stage: Stage;
  onBackToJourney: () => void;
  onCompleteQuest: (questId: string, xpReward: number, skillTag: string) => void;
  onOpenTutor: (questTitle: string, phase: string) => void;
  onNavigateNextQuest?: (nextQuestId: string) => void;
  onToggleTheme?: () => void;
  theme?: AppTheme;
}

const CHEERFUL_PRAISES = [
  "Nailed it! 🚀",
  "You're on fire! 🔥",
  "Genius brain move! 💡",
  "Flawless reasoning! ✨",
  "Supercharged intelligence! ⚡",
  "Absolute mastery! 🌟"
];

const MASCOT_TIPS = [
  "NeuroBot says: 'Real-world machine learning is all about recognizing patterns rather than memorizing rules!'",
  "NeuroBot says: 'You've got this! Think about the real-world analogy.'",
  "NeuroBot says: 'High-dimensional space sounds scary, but it's just fancy coordinates!'",
  "NeuroBot says: 'Every AI engineer started right where you are today!'"
];

const PHASE_ORDER: Record<QuestPhase, number> = {
  learn: 0,
  "concept-check": 1,
  "boss-challenge": 2,
  reward: 3,
};

const containerVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.22,
      ease: "easeInOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

const phaseSlideVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 36 : -36,
    scale: 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 26,
      mass: 0.75,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -36 : 36,
    scale: 0.98,
    transition: {
      duration: 0.18,
      ease: "easeInOut",
    },
  }),
};

const cardSlideVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
    scale: 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 26,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    scale: 0.98,
    transition: {
      duration: 0.16,
      ease: "easeInOut",
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
  theme = "neumorphic"
}) => {
  const isNeumorphic = theme === "neumorphic";
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const [phase, setPhase] = useState<QuestPhase>("learn");
  const [phaseDirection, setPhaseDirection] = useState(1);

  // Step 1: Learn Card Navigation
  const [activeQACardIdx, setActiveQACardIdx] = useState(0);
  const [cardDirection, setCardDirection] = useState(1);

  // Step 2: Gamified Concept Check State
  const [selectedConceptOption, setSelectedConceptOption] = useState<string | null>(null);
  const [conceptSubmitted, setConceptSubmitted] = useState(false);
  const [conceptPraise, setConceptPraise] = useState(CHEERFUL_PRAISES[0]);

  // Step 3: Boss Challenge State
  const [selectedBossOption, setSelectedBossOption] = useState<string | null>(null);
  const [bossSubmitted, setBossSubmitted] = useState(false);
  const [bossPraise, setBossPraise] = useState(CHEERFUL_PRAISES[1]);

  const qaCards = quest.learn.qaCards || [
    {
      badgeEmoji: "💡",
      question: quest.learn.title,
      answer: quest.learn.summary,
      analogy: quest.learn.proTip
    }
  ];

  const conceptCheckData = quest.conceptCheck || {
    prompt: quest.prove?.question || "What is the core takeaway of this lesson?",
    contextPill: "Step 2: Rapid Concept Check",
    options: quest.prove?.options || [],
    encouragement: "Fantastic instinct! You've grasped the fundamental concept."
  };

  const bossChallengeData = quest.bossChallenge || {
    title: `Boss Challenge: ${quest.title}`,
    scenario: quest.prove?.scenario || "A real-world engineering challenge puts your AI knowledge to the test.",
    question: quest.prove?.question || "How do you solve this scenario?",
    options: quest.prove?.options || [],
    bossAvatar: "🤖",
    bossQuote: "'Let's see if you truly mastered this concept!'",
    victoryMessage: "BOSS DEFEATED! 🏆 You proved your conceptual mastery under real-world pressure!",
    deepDiveExplanation: quest.prove?.deepDiveExplanation || "Great job completing this quest!"
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
    const chosen = conceptCheckData.options.find((o) => o.id === selectedConceptOption);
    if (chosen?.isCorrect) {
      soundFx.playCorrect();
      triggerCelebrationConfetti();
      const randomPraise = CHEERFUL_PRAISES[Math.floor(Math.random() * CHEERFUL_PRAISES.length)];
      setConceptPraise(randomPraise);
    } else {
      soundFx.playWrong();
    }
  };

  const handleBossSubmit = () => {
    if (!selectedBossOption) return;
    setBossSubmitted(true);
    const chosen = bossChallengeData.options.find((o) => o.id === selectedBossOption);
    if (chosen?.isCorrect) {
      soundFx.playCorrect();
      triggerCelebrationConfetti();
      const randomPraise = CHEERFUL_PRAISES[Math.floor(Math.random() * CHEERFUL_PRAISES.length)];
      setBossPraise(randomPraise);
    } else {
      soundFx.playWrong();
    }
  };

  const phasesList: { id: QuestPhase; label: string; icon: any; stepNumber: string }[] = [
    { id: "learn", label: "Learn & Discover", icon: BookOpen, stepNumber: "Step 1" },
    { id: "concept-check", label: "Concept Check", icon: Zap, stepNumber: "Step 2" },
    { id: "boss-challenge", label: "Boss Challenge", icon: Swords, stepNumber: "Step 3" },
    { id: "reward", label: "Victory Reward", icon: Award, stepNumber: "Step 4" }
  ];

  const currentQACard = qaCards[activeQACardIdx] || qaCards[0];
  const conceptChosenOpt = conceptCheckData.options.find((o) => o.id === selectedConceptOption);
  const isConceptCorrect = conceptChosenOpt?.isCorrect ?? false;

  const bossChosenOpt = bossChallengeData.options.find((o) => o.id === selectedBossOption);
  const isBossCorrect = bossChosenOpt?.isCorrect ?? false;

  return (
    <motion.div
      id="quest-view-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6"
    >
      {/* Top Header Bar */}
      <motion.div
        variants={itemVariants}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isDark ? "border-[#27272A]" : "border-[#1E1B18]"
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04, x: -2 }}
            whileTap={{ scale: 0.95 }}
            id="back-to-journey-btn"
            onClick={onBackToJourney}
            className={`p-2.5 rounded-xl border-2 transition-colors flex items-center gap-2 text-xs font-mono font-black uppercase ${
              isDark
                ? "bg-[#27272A] border-[#3F3F46] text-zinc-300 hover:text-zinc-100"
                : "bg-white border-[#1E1B18] text-[#1E1B18] hover:bg-zinc-100 shadow-[2px_2px_0px_#1E1B18]"
            }`}
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Journey Path</span>
          </motion.button>
          <div>
            <div
              className={`text-[10px] font-mono font-black tracking-widest uppercase ${
                isDark ? "text-amber-400" : "text-[#4F46E5]"
              }`}
            >
              Stage {stage.number}: {stage.title}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
              {quest.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {onToggleTheme && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="btn-quest-theme-toggle"
              onClick={() => {
                soundFx.playTap();
                onToggleTheme();
              }}
              className={`flex items-center p-1 rounded-xl transition-all ${
                isNeumorphic
                  ? "neu-inset border border-slate-300/60"
                  : isDark
                  ? "bg-[#202023] border border-[#3F3F46] hover:border-amber-400/50"
                  : "bg-[#F3EFE6] border-2 border-[#1E1B18] shadow-[1.5px_1.5px_0px_#1E1B18]"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span
                className={`p-1.5 rounded-lg transition-all ${
                  !isDark
                    ? isNeumorphic
                      ? "neu-raised text-amber-500 shadow-sm"
                      : "bg-[#FEF08A] text-[#1E1B18] font-black border border-[#1E1B18]"
                    : "text-zinc-500 hover:text-zinc-300 opacity-60"
                }`}
              >
                <Sun className={`w-3.5 h-3.5 stroke-[2.5] ${!isDark ? "fill-amber-400/40 text-amber-500" : ""}`} />
              </span>
              <span
                className={`p-1.5 rounded-lg transition-all ${
                  isDark
                    ? "bg-amber-400/20 text-amber-300 font-black border border-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                    : isNeumorphic
                    ? "text-slate-400 hover:text-slate-600 opacity-60"
                    : "text-zinc-500 hover:text-zinc-700 opacity-60"
                }`}
              >
                <Moon className={`w-3.5 h-3.5 stroke-[2.5] ${isDark ? "fill-amber-400/30 text-amber-400" : ""}`} />
              </span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            id="open-neuro-tutor-btn"
            onClick={() => onOpenTutor(quest.title, phase)}
            className={`px-3.5 py-2 rounded-xl border-2 text-xs font-mono font-black uppercase flex items-center gap-2 transition-colors ${
              isDark
                ? "bg-amber-400/10 border-amber-400 text-amber-300 hover:bg-amber-400/20"
                : "bg-[#FEF08A] border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
            }`}
          >
            <Bot className="w-4 h-4 stroke-[2.5]" />
            <span>Ask NeuroBot</span>
          </motion.button>

          <div
            className={`px-3 py-2 rounded-xl border-2 text-xs font-mono font-black flex items-center gap-1.5 ${
              isDark
                ? "bg-[#27272A] border-[#3F3F46] text-amber-300"
                : "bg-[#FFE4E6] border-[#1E1B18] text-[#E11D48] shadow-[2px_2px_0px_#1E1B18]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{quest.xpReward} XP</span>
          </div>
        </div>
      </motion.div>

        {/* Gamified 4-Step Journey Stepper */}
        <motion.div
          variants={itemVariants}
          className={`grid grid-cols-4 gap-2 p-2 rounded-2xl transition-all ${
            isNeumorphic
              ? "neu-flat"
              : isDark
              ? "bg-[#27272A]/80 border-2 border-[#3F3F46]"
              : "bg-white border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
          }`}
        >
          {phasesList.map((p) => {
            const Icon = p.icon;
            const isActive = phase === p.id;
            return (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundFx.playTap();
                  handleSwitchPhase(p.id);
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-mono font-black flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? isNeumorphic
                      ? "neu-btn-primary text-white shadow-md"
                      : isDark
                      ? "bg-amber-400 text-zinc-950 border border-amber-500 shadow-md"
                      : "bg-[#1E1B18] text-white border border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                    : isNeumorphic
                    ? "neu-inset text-slate-500 hover:text-slate-900"
                    : isDark
                    ? "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    : "border border-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <div className="text-center sm:text-left">
                  <span className="block text-[9px] uppercase tracking-wider opacity-75">
                    {p.stepNumber}
                  </span>
                  <span className="hidden sm:inline">{p.label}</span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Cheerful Mascot Coach Banner */}
        <motion.div
          variants={itemVariants}
          className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs transition-all ${
            isNeumorphic
              ? "neu-raised text-slate-800"
              : isDark
              ? "bg-[#18181B] border-2 border-amber-400/30 text-amber-300"
              : "bg-[#FEF9C3] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              isNeumorphic ? "neu-inset" : "bg-white border-2 border-current shadow-sm"
            }`}
          >
            🤖
          </div>
          <div className="flex-1 font-bold">
            {MASCOT_TIPS[Math.abs(quest.title.length) % MASCOT_TIPS.length]}
          </div>
          <div
            className={`hidden sm:flex items-center gap-1 text-[11px] font-mono font-black px-2.5 py-1 rounded-lg uppercase ${
              isNeumorphic ? "neu-inset text-amber-600" : "bg-black/5 dark:bg-white/10"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Curious Mode</span>
          </div>
        </motion.div>

        {/* Phase Body Animated Container */}
        <div className="relative overflow-hidden pt-1">
          <AnimatePresence mode="wait" custom={phaseDirection}>
            {/* ========================================================= */}
            {/* STEP 1: BITE-SIZED Q&A CARD JOURNEY */}
            {/* ========================================================= */}
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
                {/* Active Card Viewer */}
                <div
                  className={`border-2 rounded-3xl p-6 sm:p-8 space-y-6 relative transition-all ${
                    isDark
                      ? "bg-[#18181B] border-[#3F3F46] text-zinc-100 shadow-xl"
                      : "bg-[#FFFDF9] border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] text-[#1E1B18]"
                  }`}
                >
                  {/* Card Progress Pills */}
                  <div className="flex items-center justify-between border-b pb-4 border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currentQACard.badgeEmoji || "💡"}</span>
                      <span
                        className={`text-xs font-mono uppercase tracking-widest font-black ${
                          isDark ? "text-amber-400" : "text-[#4F46E5]"
                        }`}
                      >
                        Step 1: Bite-Sized Q&A Card {activeQACardIdx + 1} of {qaCards.length}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {qaCards.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            soundFx.playTap();
                            setCardDirection(idx > activeQACardIdx ? 1 : -1);
                            setActiveQACardIdx(idx);
                          }}
                          className={`w-7 h-2 rounded-full transition-all ${
                            idx === activeQACardIdx
                              ? isDark
                                ? "bg-amber-400 w-9"
                                : "bg-[#4F46E5] w-9"
                              : isDark
                              ? "bg-zinc-700"
                              : "bg-zinc-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Animated Inner Q&A Content */}
                  <AnimatePresence mode="wait" custom={cardDirection}>
                    <motion.div
                      key={`qa-card-${activeQACardIdx}`}
                      custom={cardDirection}
                      variants={cardSlideVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-6"
                    >
                      {/* The Big Question */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-amber-400/20 text-amber-500 border border-amber-400/40">
                            Question
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                          {currentQACard.question}
                        </h2>
                      </div>

                      {/* Plain English Answer */}
                      <div
                        className={`p-5 rounded-2xl border-2 space-y-2 ${
                          isDark
                            ? "bg-[#27272A] border-[#3F3F46] text-zinc-100"
                            : "bg-white border-[#1E1B18] text-zinc-900 shadow-[2px_2px_0px_#1E1B18]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>The Core Concept</span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed font-medium">
                          {currentQACard.answer}
                        </p>
                      </div>

                      {/* Real-World Analogy (Ages 15+ Friendly) */}
                      <div
                        className={`p-5 rounded-2xl border-2 flex items-start gap-3.5 ${
                          isDark
                            ? "bg-amber-950/20 border-amber-400/40 text-amber-200"
                            : "bg-[#EEF2FF] border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-sm">
                          <Lightbulb className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm">
                          <span className="font-mono font-black uppercase tracking-wider text-[11px] block">
                            Real-World Analogy:
                          </span>
                          <p className="leading-relaxed font-medium">
                            {currentQACard.analogy}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Card Switcher Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        soundFx.playTap();
                        setCardDirection(-1);
                        setActiveQACardIdx((prev) => Math.max(0, prev - 1));
                      }}
                      disabled={activeQACardIdx === 0}
                      className={`px-4 py-2.5 rounded-xl border-2 text-xs font-mono font-black uppercase transition-all disabled:opacity-30 ${
                        isDark
                          ? "border-[#3F3F46] text-zinc-400 hover:text-zinc-100 bg-[#27272A]"
                          : "border-[#1E1B18] text-[#1E1B18] bg-white hover:bg-zinc-100 shadow-[2px_2px_0px_#1E1B18]"
                      }`}
                    >
                      ← Previous Card
                    </motion.button>

                    {activeQACardIdx < qaCards.length - 1 ? (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        id="next-qa-card-btn"
                        onClick={() => {
                          soundFx.playTap();
                          setCardDirection(1);
                          setActiveQACardIdx((prev) => prev + 1);
                        }}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                          isDark
                            ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md"
                            : "bg-[#1E1B18] text-white hover:bg-black border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                        }`}
                      >
                        <span>Next Card ({activeQACardIdx + 2}/{qaCards.length})</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        id="proceed-to-concept-check-btn"
                        onClick={handleNextPhase}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                          isDark
                            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md"
                            : "bg-[#059669] text-white hover:bg-emerald-700 border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                        }`}
                      >
                        <span>Ready for Rapid Quiz! 🚀</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Key Concepts Mini Glossary */}
                <div
                  className={`border-2 rounded-2xl p-5 space-y-3 ${
                    isDark ? "bg-[#18181B] border-[#3F3F46]" : "bg-white border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-zinc-500">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Key Terms in this Quest</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(quest.learn.keyConcepts || []).map((kc, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${
                          isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                        }`}
                      >
                        <div className="text-xs font-black">{kc.term}</div>
                        <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          {kc.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: GAMIFIED CONCEPT CHECK (RAPID-FIRE QUIZ) */}
            {/* ========================================================= */}
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
                <div
                  className={`border-2 rounded-3xl p-6 sm:p-8 space-y-6 ${
                    isDark
                      ? "bg-[#18181B] border-[#3F3F46] text-zinc-100 shadow-xl"
                      : "bg-[#FFFDF9] border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] text-[#1E1B18]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono uppercase tracking-widest font-black ${
                          isDark ? "text-amber-400" : "text-[#4F46E5]"
                        }`}
                      >
                        {conceptCheckData.contextPill || "Step 2: Rapid Concept Check"}
                      </span>
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/40">
                        Instant Feedback ⚡
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      {conceptCheckData.prompt}
                    </h2>
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-3 pt-2">
                    {conceptCheckData.options.map((opt) => {
                      const isSelected = selectedConceptOption === opt.id;
                      const showFeedback = conceptSubmitted;

                      let cardStyle = isDark
                        ? "bg-[#27272A] border-[#3F3F46] text-zinc-200 hover:border-zinc-500"
                        : "bg-white border-[#1E1B18] text-[#1E1B18] hover:bg-zinc-50 shadow-[2px_2px_0px_#1E1B18]";

                      if (isSelected && !showFeedback) {
                        cardStyle = isDark
                          ? "bg-amber-400/20 border-amber-400 text-amber-200 shadow-md"
                          : "bg-[#EEF2FF] border-[#4F46E5] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]";
                      } else if (showFeedback) {
                        if (opt.isCorrect) {
                          cardStyle = isDark
                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md"
                            : "bg-[#ECFDF5] border-emerald-700 text-emerald-950 shadow-[3px_3px_0px_#047857]";
                        } else if (isSelected && !opt.isCorrect) {
                          cardStyle = isDark
                            ? "bg-rose-950/60 border-rose-500 text-rose-200 shadow-md"
                            : "bg-[#FFF1F2] border-rose-700 text-rose-950 shadow-[3px_3px_0px_#BE123C]";
                        }
                      }

                      return (
                        <motion.div
                          key={opt.id}
                          whileHover={!conceptSubmitted ? { scale: 1.01, x: 2 } : {}}
                          whileTap={!conceptSubmitted ? { scale: 0.99 } : {}}
                          onClick={() => {
                            if (!conceptSubmitted) {
                              soundFx.playTap();
                              setSelectedConceptOption(opt.id);
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${cardStyle}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black font-mono ${
                                isSelected
                                  ? isDark
                                    ? "border-amber-400 bg-amber-400 text-zinc-950"
                                    : "border-[#1E1B18] bg-[#4F46E5] text-white"
                                  : isDark
                                  ? "border-zinc-600"
                                  : "border-[#1E1B18]"
                              }`}
                            >
                              {isSelected ? "✓" : ""}
                            </div>
                            <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed font-bold flex-1">
                              <div>{opt.text}</div>
                              {showFeedback && (isSelected || opt.isCorrect) && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-2.5 rounded-xl border text-xs font-mono font-medium ${
                                    opt.isCorrect
                                      ? isDark
                                        ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-300"
                                        : "bg-emerald-100/70 border-emerald-300 text-emerald-900"
                                      : isDark
                                      ? "bg-rose-900/30 border-rose-700/50 text-rose-300"
                                      : "bg-rose-100/70 border-rose-300 text-rose-900"
                                  }`}
                                >
                                  {opt.explanation}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Gamified Success / Try Again Feedback Banner */}
                  {conceptSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                        isConceptCorrect
                          ? isDark
                            ? "bg-emerald-950/50 border-emerald-500 text-emerald-200"
                            : "bg-[#DCFCE7] border-emerald-700 text-emerald-950 shadow-[2px_2px_0px_#047857]"
                          : isDark
                          ? "bg-rose-950/50 border-rose-500 text-rose-200"
                          : "bg-[#FFE4E6] border-rose-700 text-rose-950 shadow-[2px_2px_0px_#BE123C]"
                      }`}
                    >
                      <div className="text-2xl">{isConceptCorrect ? "🎉" : "💡"}</div>
                      <div className="flex-1">
                        <div className="font-black text-sm uppercase tracking-wide">
                          {isConceptCorrect ? conceptPraise : "Not quite, but you're learning!"}
                        </div>
                        <div className="text-xs font-medium opacity-90 mt-0.5">
                          {isConceptCorrect
                            ? conceptCheckData.encouragement
                            : "Check the explanation above and try another option!"}
                        </div>
                      </div>
                      {!isConceptCorrect && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            soundFx.playTap();
                            setConceptSubmitted(false);
                            setSelectedConceptOption(null);
                          }}
                          className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono font-black uppercase bg-white dark:bg-zinc-800 text-current hover:opacity-80"
                        >
                          Try Again
                        </motion.button>
                      )}
                    </motion.div>
                  )}

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        soundFx.playTap();
                        handleSwitchPhase("learn");
                      }}
                      className={`px-4 py-2.5 rounded-xl border-2 text-xs font-mono font-black uppercase transition-all ${
                        isDark
                          ? "border-[#3F3F46] text-zinc-400 hover:text-zinc-100 bg-[#27272A]"
                          : "border-[#1E1B18] text-[#1E1B18] bg-white hover:bg-zinc-100 shadow-[2px_2px_0px_#1E1B18]"
                      }`}
                    >
                      ← Review Cards
                    </motion.button>

                    {!conceptSubmitted ? (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        id="submit-concept-check-btn"
                        onClick={handleConceptSubmit}
                        disabled={!selectedConceptOption}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 ${
                          isDark
                            ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md"
                            : "bg-[#1E1B18] text-white hover:bg-black border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                        }`}
                      >
                        Check Answer ⚡
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        id="proceed-to-boss-challenge-btn"
                        onClick={handleNextPhase}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                          isDark
                            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md"
                            : "bg-[#059669] text-white hover:bg-emerald-700 border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                        }`}
                      >
                        <span>Advance to Boss Challenge ⚔️</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: SCENARIO-BASED BOSS CHALLENGE */}
            {/* ========================================================= */}
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
                <div
                  className={`border-2 rounded-3xl p-6 sm:p-8 space-y-6 relative ${
                    isDark
                      ? "bg-[#18181B] border-[#3F3F46] text-zinc-100 shadow-xl"
                      : "bg-[#FFFDF9] border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] text-[#1E1B18]"
                  }`}
                >
                  {/* Boss Banner */}
                  <div
                    className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark
                        ? "bg-gradient-to-r from-red-950/40 to-amber-950/30 border-red-500/40 text-red-200"
                        : "bg-[#FFF1F2] border-[#E11D48] text-[#1E1B18] shadow-[2px_2px_0px_#E11D48]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md border-2 border-current">
                        {bossChallengeData.bossAvatar || "⚔️"}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                          Step 3: Final Boss Encounter
                        </div>
                        <h3 className="text-base sm:text-lg font-black uppercase">
                          {bossChallengeData.title}
                        </h3>
                      </div>
                    </div>
                    {bossChallengeData.bossQuote && (
                      <div className="text-xs italic font-serif opacity-80 sm:text-right">
                        {bossChallengeData.bossQuote}
                      </div>
                    )}
                  </div>

                  {/* Scenario Card */}
                  <div
                    className={`p-4 rounded-2xl border-2 text-xs sm:text-sm leading-relaxed space-y-1 ${
                      isDark
                        ? "bg-[#27272A] border-[#3F3F46] text-zinc-300"
                        : "bg-white border-[#1E1B18] text-zinc-800 shadow-[2px_2px_0px_#1E1B18]"
                    }`}
                  >
                    <span className="font-mono font-black uppercase tracking-wider text-[10px] text-amber-500 block">
                      The Real-World Scenario:
                    </span>
                    <p className="font-medium">{bossChallengeData.scenario}</p>
                  </div>

                  {/* The Boss Question */}
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                      {bossChallengeData.question}
                    </h2>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {bossChallengeData.options.map((opt) => {
                      const isSelected = selectedBossOption === opt.id;
                      const showFeedback = bossSubmitted;

                      let cardStyle = isDark
                        ? "bg-[#27272A] border-[#3F3F46] text-zinc-200 hover:border-zinc-500"
                        : "bg-white border-[#1E1B18] text-[#1E1B18] hover:bg-zinc-50 shadow-[2px_2px_0px_#1E1B18]";

                      if (isSelected && !showFeedback) {
                        cardStyle = isDark
                          ? "bg-amber-400/20 border-amber-400 text-amber-200"
                          : "bg-[#EEF2FF] border-[#4F46E5] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]";
                      } else if (showFeedback) {
                        if (opt.isCorrect) {
                          cardStyle = isDark
                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md"
                            : "bg-[#ECFDF5] border-emerald-700 text-emerald-950 shadow-[3px_3px_0px_#047857]";
                        } else if (isSelected && !opt.isCorrect) {
                          cardStyle = isDark
                            ? "bg-rose-950/60 border-rose-500 text-rose-200 shadow-md"
                            : "bg-[#FFF1F2] border-rose-700 text-rose-950 shadow-[3px_3px_0px_#BE123C]";
                        }
                      }

                      return (
                        <motion.div
                          key={opt.id}
                          whileHover={!bossSubmitted ? { scale: 1.01, x: 2 } : {}}
                          whileTap={!bossSubmitted ? { scale: 0.99 } : {}}
                          onClick={() => {
                            if (!bossSubmitted) {
                              soundFx.playTap();
                              setSelectedBossOption(opt.id);
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${cardStyle}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black font-mono ${
                                isSelected
                                  ? isDark
                                    ? "border-amber-400 bg-amber-400 text-zinc-950"
                                    : "border-[#1E1B18] bg-[#4F46E5] text-white"
                                  : isDark
                                  ? "border-zinc-600"
                                  : "border-[#1E1B18]"
                              }`}
                            >
                              {isSelected ? "✓" : ""}
                            </div>
                            <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed font-bold flex-1">
                              <div>{opt.text}</div>
                              {showFeedback && (isSelected || opt.isCorrect) && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-2.5 rounded-xl border text-xs font-mono font-medium ${
                                    opt.isCorrect
                                      ? isDark
                                        ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-300"
                                        : "bg-emerald-100/70 border-emerald-300 text-emerald-900"
                                      : isDark
                                      ? "bg-rose-900/30 border-rose-700/50 text-rose-300"
                                      : "bg-rose-100/70 border-rose-300 text-rose-900"
                                  }`}
                                >
                                  {opt.explanation}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Boss Defeated Takeaway Banner */}
                  {bossSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="space-y-3"
                    >
                      <div
                        className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                          isBossCorrect
                            ? isDark
                              ? "bg-emerald-950/50 border-emerald-500 text-emerald-200"
                              : "bg-[#DCFCE7] border-emerald-700 text-emerald-950 shadow-[2px_2px_0px_#047857]"
                            : isDark
                            ? "bg-rose-950/50 border-rose-500 text-rose-200"
                            : "bg-[#FFE4E6] border-rose-700 text-rose-950 shadow-[2px_2px_0px_#BE123C]"
                        }`}
                      >
                        <div className="text-2xl">{isBossCorrect ? "🏆" : "🛡️"}</div>
                        <div className="flex-1">
                          <div className="font-black text-sm uppercase tracking-wide">
                            {isBossCorrect ? bossPraise : "The Boss parried your move!"}
                          </div>
                          <div className="text-xs font-medium opacity-90 mt-0.5">
                            {isBossCorrect
                              ? bossChallengeData.victoryMessage
                              : "Review the logic and try an alternate strategy."}
                          </div>
                        </div>
                        {!isBossCorrect && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              soundFx.playTap();
                              setBossSubmitted(false);
                              setSelectedBossOption(null);
                            }}
                            className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono font-black uppercase bg-white dark:bg-zinc-800 text-current hover:opacity-80"
                          >
                            Retry Challenge
                          </motion.button>
                        )}
                      </div>

                      {/* Deep Dive Note */}
                      <div
                        className={`p-4 border-2 rounded-2xl space-y-1 ${
                          isDark
                            ? "bg-[#27272A] border-[#3F3F46]"
                            : "bg-[#FEF08A]/60 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                        }`}
                      >
                        <span
                          className={`text-[11px] font-mono uppercase font-black ${
                            isDark ? "text-amber-400" : "text-[#4F46E5]"
                          }`}
                        >
                          Engineering Deep Dive Takeaway:
                        </span>
                        <p className={`text-xs leading-relaxed font-medium ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>
                          {bossChallengeData.deepDiveExplanation}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        soundFx.playTap();
                        handleSwitchPhase("concept-check");
                      }}
                      className={`px-4 py-2.5 rounded-xl border-2 text-xs font-mono font-black uppercase transition-all ${
                        isDark
                          ? "border-[#3F3F46] text-zinc-400 hover:text-zinc-100 bg-[#27272A]"
                          : "border-[#1E1B18] text-[#1E1B18] bg-white hover:bg-zinc-100 shadow-[2px_2px_0px_#1E1B18]"
                      }`}
                    >
                      ← Concept Check
                    </motion.button>

                    {!bossSubmitted ? (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        id="submit-boss-challenge-btn"
                        onClick={handleBossSubmit}
                        disabled={!selectedBossOption}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 ${
                          isDark
                            ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md"
                            : "bg-[#1E1B18] text-white hover:bg-black border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                        }`}
                      >
                        Execute Battle Strategy ⚔️
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        id="claim-quest-reward-btn"
                        onClick={handleNextPhase}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                          isDark
                            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md"
                            : "bg-[#059669] text-white hover:bg-emerald-700 border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                        }`}
                      >
                        <span>Claim XP & Victory! 🌟</span>
                        <Award className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 4: REWARD & VICTORY SCREEN */}
            {/* ========================================================= */}
            {phase === "reward" && (
              <motion.div
                key="phase-reward"
                custom={phaseDirection}
                variants={phaseSlideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                id="quest-phase-reward"
                className={`border-2 rounded-3xl p-8 text-center space-y-6 ${
                  isDark
                    ? "bg-[#18181B] border-[#3F3F46] text-zinc-100 shadow-2xl"
                    : "bg-[#FFFDF9] border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] text-[#1E1B18]"
                }`}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                  className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center mx-auto shadow-md ${
                    isDark
                      ? "bg-amber-400/20 border-amber-400 text-amber-300"
                      : "bg-[#FEF08A] border-[#1E1B18] text-[#1E1B18]"
                  }`}
                >
                  <Award className="w-10 h-10 stroke-[2.5]" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-1"
                >
                  <span
                    className={`text-xs font-mono uppercase tracking-widest font-black ${
                      isDark ? "text-emerald-400" : "text-[#059669]"
                    }`}
                  >
                    Mission Accomplished
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    Quest Mastered! 🚀
                  </h2>
                  <p className={`text-sm max-w-md mx-auto font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    You successfully mastered <span className="font-black uppercase">{quest.title}</span> through the pure Q&A learning journey!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left"
                >
                  <div
                    className={`border-2 p-3.5 rounded-2xl ${
                      isDark
                        ? "bg-[#27272A] border-[#3F3F46]"
                        : "bg-white border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                    }`}
                  >
                    <div className={`text-[11px] font-mono font-bold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      XP Awarded
                    </div>
                    <div className="text-xl font-black font-mono text-amber-500">+{quest.xpReward} XP</div>
                  </div>
                  <div
                    className={`border-2 p-3.5 rounded-2xl ${
                      isDark
                        ? "bg-[#27272A] border-[#3F3F46]"
                        : "bg-white border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                    }`}
                  >
                    <div className={`text-[11px] font-mono font-bold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      Skill Unlocked
                    </div>
                    <div className="text-sm font-black truncate">{quest.skillTag}</div>
                  </div>
                  <div
                    className={`border-2 p-3.5 rounded-2xl ${
                      isDark
                        ? "bg-[#27272A] border-[#3F3F46]"
                        : "bg-white border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                    }`}
                  >
                    <div className={`text-[11px] font-mono font-bold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      Badge Earned
                    </div>
                    <div className="text-sm font-black truncate text-emerald-600 dark:text-emerald-400">
                      {quest.badgeTitle || "Mastery"}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    id="return-journey-finish-btn"
                    onClick={onBackToJourney}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl border-2 text-xs font-mono font-black uppercase transition-all ${
                      isDark
                        ? "bg-[#27272A] border-[#3F3F46] text-zinc-300 hover:text-zinc-100"
                        : "bg-white border-[#1E1B18] text-[#1E1B18] hover:bg-zinc-100 shadow-[2px_2px_0px_#1E1B18]"
                    }`}
                  >
                    Return to Journey Path
                  </motion.button>
                  {onNavigateNextQuest && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      id="next-quest-btn"
                      onClick={() => onNavigateNextQuest("next")}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl border-2 text-xs font-mono font-black uppercase flex items-center justify-center gap-2 transition-all ${
                        isDark
                          ? "bg-amber-400 border-amber-500 text-zinc-950 hover:bg-amber-300 shadow-md"
                          : "bg-[#1E1B18] border-[#1E1B18] text-white hover:bg-black shadow-[3px_3px_0px_#1E1B18]"
                      }`}
                    >
                      <span>Continue to Next Quest</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
  );
};
