import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Gamepad2,
  Brain,
  Layers,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Volume2,
  VolumeX,
  Star,
  ChevronRight,
  Flame,
  ArrowRight,
  Lightbulb,
  Heart,
  Shuffle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { soundFx } from "../../utils/sound";
import { AppTheme } from "../../types";

interface KidsLabPlaygroundProps {
  onEarnReward: (sparks: number, xp: number) => void;
  theme?: AppTheme;
}

type MiniGameTab = "bubble-pop" | "memory-match" | "pattern-puzzle" | "astro-logic";

// ==========================================
// 1. MEMORY MATCH CARDS DATA
// ==========================================
interface MemoryCard {
  id: string;
  uniqueId: number;
  label: string;
  symbol: string;
  category: string;
  color: string;
}

const MEMORY_ITEMS = [
  { id: "robot", label: "Robot", symbol: "🤖", category: "AI Bot", color: "from-cyan-500 to-blue-600" },
  { id: "brain", label: "Neural Brain", symbol: "🧠", category: "Thinking", color: "from-pink-500 to-rose-600" },
  { id: "rocket", label: "Rocket", symbol: "🚀", category: "Speed", color: "from-amber-500 to-orange-600" },
  { id: "spark", label: "Spark", symbol: "⚡", category: "Energy", color: "from-yellow-400 to-amber-500" },
  { id: "alien", label: "Astro Cat", symbol: "🐱", category: "Friend", color: "from-emerald-400 to-teal-600" },
  { id: "gem", label: "Data Gem", symbol: "💎", category: "Reward", color: "from-purple-500 to-indigo-600" },
];

// ==========================================
// 2. PATTERN PUZZLE SEQUENCES
// ==========================================
interface SequenceLevel {
  id: number;
  prompt: string;
  hint: string;
  sequence: string[];
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SEQUENCE_LEVELS: SequenceLevel[] = [
  {
    id: 1,
    prompt: "What comes next in the Robot Code sequence?",
    hint: "Notice the alternating colors!",
    sequence: ["🤖", "🚀", "🤖", "🚀", "🤖", "❓"],
    options: ["🤖", "🚀", "🧠", "💎"],
    correctIndex: 1,
    explanation: "Super! The pattern repeats Robot then Rocket!"
  },
  {
    id: 2,
    prompt: "Complete the Neural Spark growth pattern!",
    hint: "Count how many sparks grow each step!",
    sequence: ["⚡", "⚡⚡", "⚡⚡⚡", "❓"],
    options: ["⚡⚡", "⚡⚡⚡⚡", "🤖", "⭐"],
    correctIndex: 1,
    explanation: "Spot on! Each step adds one more electric spark!"
  },
  {
    id: 3,
    prompt: "Find the missing Planetary Orbit cycle!",
    hint: "Look at the circular rotation!",
    sequence: ["🌍", "🌙", "⭐", "🌍", "🌙", "❓"],
    options: ["☀️", "⭐", "🚀", "🪐"],
    correctIndex: 1,
    explanation: "Brilliant! Earth, Moon, Star repeats over and over!"
  },
  {
    id: 4,
    prompt: "Logic Loop: Double Step Pattern",
    hint: "Two cats, two rockets, two...",
    sequence: ["🐱", "🐱", "🚀", "🚀", "🤖", "❓"],
    options: ["🤖", "🐱", "💎", "⚡"],
    correctIndex: 0,
    explanation: "Awesome detective work! Every item comes in a matching pair of two!"
  }
];

// ==========================================
// 3. BUBBLE POPPING SENSORY ENGINE
// ==========================================
interface BubbleItem {
  id: number;
  x: number; // percentage 5% to 90%
  y: number; // percentage 10% to 85%
  size: number;
  emoji: string;
  color: string;
  points: number;
  popped: boolean;
}

const BUBBLE_EMOJIS = [
  { emoji: "✨", color: "from-amber-400 to-yellow-500", pts: 5 },
  { emoji: "🎈", color: "from-rose-400 to-pink-500", pts: 10 },
  { emoji: "🫧", color: "from-cyan-400 to-blue-500", pts: 5 },
  { emoji: "⭐", color: "from-yellow-400 to-amber-500", pts: 15 },
  { emoji: "🤖", color: "from-indigo-400 to-purple-600", pts: 20 },
  { emoji: "💎", color: "from-teal-400 to-emerald-500", pts: 25 },
];

export const KidsLabPlayground: React.FC<KidsLabPlaygroundProps> = ({
  onEarnReward,
  theme = "neumorphic"
}) => {
  const isNeumorphic = theme === "neumorphic";
  const isRiso = theme === "riso-pop" || theme === "warm-editorial";

  const [activeTab, setActiveTab] = useState<MiniGameTab>("bubble-pop");
  const [soundMuted, setSoundMuted] = useState(false);

  // ------------------------------------------
  // BUBBLE POP GAME STATE
  // ------------------------------------------
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [bubbleScore, setBubbleScore] = useState(0);
  const [bubbleCombo, setBubbleCombo] = useState(0);

  const initBubbles = () => {
    const list: BubbleItem[] = [];
    for (let i = 0; i < 14; i++) {
      const template = BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)];
      list.push({
        id: Date.now() + i,
        x: 8 + Math.random() * 80,
        y: 12 + Math.random() * 70,
        size: 52 + Math.random() * 24,
        emoji: template.emoji,
        color: template.color,
        points: template.pts,
        popped: false,
      });
    }
    setBubbles(list);
  };

  useEffect(() => {
    if (activeTab === "bubble-pop" && bubbles.length === 0) {
      initBubbles();
    }
  }, [activeTab]);

  const handlePopBubble = (bId: number, pts: number) => {
    if (!soundMuted) {
      soundFx.playTap();
      soundFx.playSpark();
    }
    setBubbleScore((s) => s + pts);
    setBubbleCombo((c) => c + 1);

    setBubbles((prev) =>
      prev.map((b) => (b.id === bId ? { ...b, popped: true } : b))
    );

    // If popped most, award sparks & respawn
    setTimeout(() => {
      setBubbles((prev) => {
        const remaining = prev.filter((b) => !b.popped);
        if (remaining.length <= 2) {
          onEarnReward(15, 30);
          if (!soundMuted) soundFx.playAchievementUnlock();
          return [];
        }
        return prev;
      });
    }, 450);
  };

  // ------------------------------------------
  // MEMORY MATCH GAME STATE
  // ------------------------------------------
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  const initMemoryGame = () => {
    const deck: MemoryCard[] = [];
    MEMORY_ITEMS.forEach((item) => {
      deck.push({ ...item, uniqueId: Math.random() });
      deck.push({ ...item, uniqueId: Math.random() });
    });
    // Shuffle
    deck.sort(() => Math.random() - 0.5);
    setMemoryCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    if (activeTab === "memory-match") {
      initMemoryGame();
    }
  }, [activeTab]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index)) return;
    const card = memoryCards[index];
    if (matchedIds.includes(card.id)) return;

    if (!soundMuted) soundFx.playTap();
    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const firstCard = memoryCards[nextFlipped[0]];
      const secondCard = memoryCards[nextFlipped[1]];

      if (firstCard.id === secondCard.id) {
        // Matched!
        if (!soundMuted) soundFx.playSpark();
        const nextMatched = [...matchedIds, firstCard.id];
        setMatchedIds(nextMatched);
        setFlippedIndices([]);

        if (nextMatched.length === MEMORY_ITEMS.length) {
          setMemoryWon(true);
          onEarnReward(25, 50);
          if (!soundMuted) soundFx.playAchievementUnlock();
        }
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // ------------------------------------------
  // PATTERN PUZZLE STATE
  // ------------------------------------------
  const [patternLevelIdx, setPatternLevelIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [patternFeedback, setPatternFeedback] = useState<"correct" | "wrong" | null>(null);
  const [patternScore, setPatternScore] = useState(0);

  const currentLevel = SEQUENCE_LEVELS[patternLevelIdx % SEQUENCE_LEVELS.length];

  const handleSelectOption = (optIdx: number) => {
    setSelectedOption(optIdx);
    if (optIdx === currentLevel.correctIndex) {
      setPatternFeedback("correct");
      setPatternScore((s) => s + 20);
      onEarnReward(10, 20);
      if (!soundMuted) soundFx.playSpark();
    } else {
      setPatternFeedback("wrong");
      if (!soundMuted) soundFx.playTap();
    }
  };

  const handleNextPattern = () => {
    setSelectedOption(null);
    setPatternFeedback(null);
    setPatternLevelIdx((i) => (i + 1) % SEQUENCE_LEVELS.length);
  };

  return (
    <div className="space-y-6">
      {/* Top Kids Lab Banner */}
      <div
        className={`p-6 rounded-3xl relative overflow-hidden transition-all ${
          isNeumorphic
            ? "neu-raised text-slate-800"
            : isRiso
            ? "bg-[#FFFDF9] border-3 border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18]"
            : "bg-gradient-to-br from-indigo-950/80 via-slate-900 to-amber-950/40 border border-indigo-500/30 shadow-2xl"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                isNeumorphic
                  ? "neu-inset text-amber-500"
                  : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30"
              }`}
            >
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  KIDS INTERACTIVE LAB
                </span>
                <span className="text-xs">✨ Friendly Mode</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-0.5">
                Mini-Games & Puzzle Nodes
              </h2>
              <p className="text-xs opacity-75 max-w-lg mt-0.5">
                Play tactile puzzle nodes, test your memory, pop cosmic bubbles, and earn bonus Sparks & XP!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              id="btn-kids-sound-toggle"
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isNeumorphic
                  ? "neu-flat text-slate-700"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
              title={soundMuted ? "Unmute Fun Sounds" : "Mute Sounds"}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline">{soundMuted ? "Sound Off" : "Sound On"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="tab-kids-bubble"
            onClick={() => {
              soundFx.playTap();
              setActiveTab("bubble-pop");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "bubble-pop"
                ? isNeumorphic
                  ? "neu-inset text-indigo-600 font-black bg-indigo-50/50"
                  : isRiso
                  ? "bg-[#FEF08A] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : isNeumorphic
                ? "neu-flat text-slate-600"
                : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🫧</span>
            <span>Bubble Pop Zone</span>
          </button>

          <button
            id="tab-kids-memory"
            onClick={() => {
              soundFx.playTap();
              setActiveTab("memory-match");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "memory-match"
                ? isNeumorphic
                  ? "neu-inset text-indigo-600 font-black bg-indigo-50/50"
                  : isRiso
                  ? "bg-[#FEF08A] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : isNeumorphic
                ? "neu-flat text-slate-600"
                : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🧠</span>
            <span>Memory Card Match</span>
          </button>

          <button
            id="tab-kids-pattern"
            onClick={() => {
              soundFx.playTap();
              setActiveTab("pattern-puzzle");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "pattern-puzzle"
                ? isNeumorphic
                  ? "neu-inset text-indigo-600 font-black bg-indigo-50/50"
                  : isRiso
                  ? "bg-[#FEF08A] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : isNeumorphic
                ? "neu-flat text-slate-600"
                : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🧩</span>
            <span>Pattern Logic Node</span>
          </button>
        </div>
      </div>

      {/* GAME 1: BUBBLE POPPING ZONE */}
      {activeTab === "bubble-pop" && (
        <div
          id="game-bubble-pop-container"
          className={`p-6 rounded-3xl relative min-h-[380px] overflow-hidden transition-all ${
            isNeumorphic
              ? "neu-raised"
              : isRiso
              ? "bg-[#FFFDF9] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
              : "bg-slate-900/90 border border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                SENSORY FOCUS PLAYGROUND
              </div>
              <h3 className="text-lg font-black uppercase">Pop All Floating Bubbles!</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold neu-pill-accent text-amber-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>SCORE: {bubbleScore}</span>
              </div>
              <button
                onClick={initBubbles}
                className="p-2 rounded-xl text-xs font-bold neu-flat hover:scale-105 flex items-center gap-1"
                title="Reset Bubbles"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Floating Canvas */}
          <div className="relative w-full h-[280px] rounded-2xl bg-gradient-to-b from-indigo-950/30 to-slate-900/40 border border-slate-700/40 overflow-hidden shadow-inner flex items-center justify-center">
            {bubbles.length === 0 ? (
              <div className="text-center space-y-3 animate-in fade-in">
                <div className="text-4xl animate-bounce">🎉</div>
                <div className="text-base font-black text-emerald-400">All Bubbles Popped! +15 Sparks Earned!</div>
                <button
                  onClick={initBubbles}
                  className="px-4 py-2 rounded-xl neu-btn-primary font-bold text-xs uppercase tracking-wider"
                >
                  Spawn New Bubbles
                </button>
              </div>
            ) : (
              bubbles.map((b) => {
                if (b.popped) return null;
                return (
                  <motion.button
                    key={b.id}
                    onClick={() => handlePopBubble(b.id, b.points)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    animate={{
                      y: [0, -12, 0],
                      x: [0, 8, 0],
                    }}
                    transition={{
                      duration: 3 + (b.id % 3),
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "absolute",
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.size}px`,
                      height: `${b.size}px`,
                    }}
                    className={`rounded-full bg-gradient-to-tr ${b.color} border-2 border-white/80 shadow-lg flex items-center justify-center text-xl cursor-pointer hover:shadow-cyan-400/40 transition-shadow select-none`}
                  >
                    <span>{b.emoji}</span>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* GAME 2: MEMORY MATCH CARDS */}
      {activeTab === "memory-match" && (
        <div
          id="game-memory-match-container"
          className={`p-6 rounded-3xl space-y-6 transition-all ${
            isNeumorphic
              ? "neu-raised"
              : isRiso
              ? "bg-[#FFFDF9] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
              : "bg-slate-900/90 border border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest">
                COGNITIVE NEURAL WORKOUT
              </div>
              <h3 className="text-lg font-black uppercase">Flip & Match the AI Pairs</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl neu-pill-accent text-indigo-600">
                MOVES: {memoryMoves}
              </span>
              <button
                onClick={initMemoryGame}
                className="p-2 rounded-xl text-xs font-bold neu-flat hover:scale-105 flex items-center gap-1"
                title="Restart Game"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {memoryWon ? (
            <div className="p-8 text-center space-y-4 rounded-2xl neu-inset bg-emerald-500/10 border border-emerald-500/30 animate-in zoom-in-95">
              <div className="text-5xl">🏆</div>
              <h4 className="text-xl font-black text-emerald-400 uppercase">Super Memory Master!</h4>
              <p className="text-xs max-w-md mx-auto text-slate-300">
                You matched all 6 pairs in {memoryMoves} moves! +25 Sparks and +50 XP have been added to your profile.
              </p>
              <button
                onClick={initMemoryGame}
                className="px-5 py-2.5 rounded-xl neu-btn-primary font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {memoryCards.map((card, idx) => {
                const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.id);
                const isMatched = matchedIds.includes(card.id);

                return (
                  <motion.button
                    key={`${card.id}-${idx}`}
                    whileHover={{ scale: isMatched ? 1 : 1.05 }}
                    whileTap={{ scale: isMatched ? 1 : 0.95 }}
                    onClick={() => handleCardClick(idx)}
                    disabled={isMatched}
                    className={`h-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all ${
                      isMatched
                        ? "neu-inset bg-emerald-500/20 border-2 border-emerald-500/50 opacity-80"
                        : isFlipped
                        ? "neu-raised bg-gradient-to-br " + card.color + " text-white border-2 border-white/80 shadow-md"
                        : isNeumorphic
                        ? "neu-raised hover:border-indigo-400/50"
                        : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400"
                    }`}
                  >
                    {isFlipped ? (
                      <>
                        <span className="text-2xl sm:text-3xl animate-in zoom-in-75">{card.symbol}</span>
                        <span className="text-[10px] font-bold mt-1 tracking-tight truncate max-w-full">
                          {card.label}
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-60">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <span className="text-[9px] font-mono uppercase font-bold">CARD</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* GAME 3: PATTERN PUZZLE NODE */}
      {activeTab === "pattern-puzzle" && (
        <div
          id="game-pattern-puzzle-container"
          className={`p-6 rounded-3xl space-y-6 transition-all ${
            isNeumorphic
              ? "neu-raised"
              : isRiso
              ? "bg-[#FFFDF9] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
              : "bg-slate-900/90 border border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                LOGIC & PATTERN RECOGNITION
              </div>
              <h3 className="text-lg font-black uppercase">Level {currentLevel.id}: Complete the Sequence</h3>
            </div>
            <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl neu-pill-accent text-amber-600">
              SCORE: {patternScore}
            </div>
          </div>

          {/* Sequence Display Box */}
          <div className="p-6 rounded-2xl neu-inset bg-slate-900/40 border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-sm font-bold text-slate-200">{currentLevel.prompt}</div>

            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {currentLevel.sequence.map((item, sIdx) => (
                <div
                  key={sIdx}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${
                    item === "❓"
                      ? "neu-inset bg-amber-500/20 border-2 border-dashed border-amber-400 text-amber-400 animate-pulse"
                      : "neu-raised bg-slate-800/80 border border-slate-700 text-white"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-amber-400 opacity-90">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hint: {currentLevel.hint}</span>
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase font-bold text-slate-400">Choose the matching piece:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentLevel.options.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentLevel.correctIndex;

                let borderStyle = "";
                if (selectedOption !== null) {
                  if (isSelected && isCorrect) borderStyle = "bg-emerald-500/30 border-2 border-emerald-400 text-emerald-300";
                  else if (isSelected && !isCorrect) borderStyle = "bg-rose-500/30 border-2 border-rose-400 text-rose-300";
                  else if (isCorrect) borderStyle = "border-2 border-emerald-400/60";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={selectedOption !== null}
                    className={`p-4 rounded-2xl text-3xl font-black flex items-center justify-center neu-raised transition-all hover:scale-105 active:scale-95 ${borderStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Next Button */}
          {selectedOption !== null && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in ${
                patternFeedback === "correct"
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                  : "bg-rose-500/20 border border-rose-500/40 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {patternFeedback === "correct" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-2xl shrink-0">🤔</span>
                )}
                <div>
                  <div className="text-xs font-black uppercase">
                    {patternFeedback === "correct" ? "Correct! Great thinking!" : "Oops! Give it another try!"}
                  </div>
                  <div className="text-xs opacity-90">{currentLevel.explanation}</div>
                </div>
              </div>

              <button
                onClick={handleNextPattern}
                className="px-4 py-2 rounded-xl neu-btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
