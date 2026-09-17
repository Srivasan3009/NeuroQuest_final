import React, { useState } from "react";
import {
  Play,
  Lock,
  Sparkles,
  Bot,
  ChevronRight,
  Package,
  Award,
  CheckCircle2,
  Zap,
  HelpCircle
} from "lucide-react";
import { Stage, Quest, UserProfile, AppTheme, Course } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { soundFx } from "../../utils/sound";
import { DailyMissionsCard } from "./DailyMissionsCard";

interface HomePathViewProps {
  stages: Stage[];
  activeCourse?: Course;
  onOpenCoursePicker?: () => void;
  user: UserProfile;
  onSelectQuest: (quest: Quest, stage: Stage) => void;
  onClaimChest: (chestId: string, sparks: number, xp: number) => void;
  onOpenTutor: () => void;
  onAddXP?: (amount: number) => void;
  theme?: AppTheme;
}

export const HomePathView: React.FC<HomePathViewProps> = ({
  stages,
  activeCourse,
  onOpenCoursePicker,
  user,
  onSelectQuest,
  onClaimChest,
  onOpenTutor,
  onAddXP,
  theme = "riso-pop"
}) => {
  const [chestModal, setChestModal] = useState<{ id: string; sparks: number; xp: number } | null>(null);

  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";
  const isNeumorphic = theme === "neumorphic";
  const completedSet = new Set(user.completedQuestIds || []);
  const openedChests = new Set(user.openedChests || []);

  // Filter stages for currently selected course if activeCourse is provided
  const displayStages = activeCourse?.stageIds?.length
    ? stages.filter((st) => activeCourse.stageIds.includes(st.id))
    : stages;

  // Collect all quests in order to form the linear path for this course
  const allQuestsWithStage: { quest: Quest; stage: Stage; globalIndex: number }[] = [];
  let gIdx = 1;
  displayStages.forEach((st) => {
    st.quests.forEach((q) => {
      allQuestsWithStage.push({ quest: q, stage: st, globalIndex: gIdx });
      gIdx++;
    });
  });

  const totalLessons = allQuestsWithStage.length;
  const completedCount = allQuestsWithStage.filter((item) => completedSet.has(item.quest.id)).length;
  const progressPercent = Math.min(100, Math.round((completedCount / (totalLessons || 1)) * 100));

  // Determine current active quest
  const firstIncompleteIndex = allQuestsWithStage.findIndex((item) => !completedSet.has(item.quest.id));
  const activeIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
  const currentItem = allQuestsWithStage[activeIndex] || allQuestsWithStage[0];

  const handleStartTodayLesson = () => {
    soundFx.playTap();
    if (currentItem) {
      onSelectQuest(currentItem.quest, currentItem.stage);
    }
  };

  const handleNodeClick = (item: { quest: Quest; stage: Stage }, isUnlocked: boolean) => {
    if (!isUnlocked) {
      soundFx.playTap();
      return;
    }
    soundFx.playTap();
    onSelectQuest(item.quest, item.stage);
  };

  const handleChestClick = (chestId: string, sparks: number, xp: number) => {
    if (openedChests.has(chestId)) return;
    soundFx.playChestOpen();
    onClaimChest(chestId, sparks, xp);
    setChestModal({ id: chestId, sparks, xp });
    setTimeout(() => setChestModal(null), 2500);
  };

  // Node positions along a natural sine wave curve
  const getNodeOffset = (index: number) => {
    // 0: center (50%), 1: left (25%), 2: center (50%), 3: right (75%), 4: center (50%)
    const pattern = [50, 26, 50, 74];
    return pattern[index % 4];
  };

  const renderMascotCard = () => (
    <div
      className={`p-4 rounded-2xl flex items-start gap-3.5 transition-all ${
        isNeumorphic
          ? "neu-raised text-slate-800"
          : isDark
          ? "bg-[#27272A] border border-[#3F3F46] text-[#F4F4F5] shadow-lg"
          : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
      }`}
    >
      {/* Robot Mascot Avatar */}
      <div className="relative shrink-0">
        <div
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center p-1 transition-all ${
            isNeumorphic
              ? "neu-inset text-[#4F46E5]"
              : isDark
              ? "bg-amber-500/20 border-amber-400/40 text-amber-300 border-2"
              : "bg-[#EEF2FF] border-2 border-[#1E1B18] text-[#4F46E5] shadow-[2px_2px_0px_#1E1B18]"
          }`}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isNeumorphic ? "bg-[#4F46E5]" : isDark ? "bg-amber-400" : "bg-[#4F46E5]"}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${isNeumorphic ? "bg-[#4F46E5]" : isDark ? "bg-amber-400" : "bg-[#4F46E5]"}`} />
          </div>
          <div className={`w-4 h-1 rounded-full ${isNeumorphic ? "bg-[#4F46E5]/70" : isDark ? "bg-amber-400/60" : "bg-[#4F46E5]/70"}`} />
        </div>
        <span
          className={`absolute -bottom-1 -right-1 text-[8px] font-mono font-black px-1.5 py-0.2 rounded-md ${
            isNeumorphic
              ? "neu-pill-accent text-[#4F46E5]"
              : isDark
              ? "bg-amber-400 text-zinc-950 border border-amber-500"
              : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
          }`}
        >
          BOT
        </span>
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isNeumorphic ? "text-[#4F46E5]" : isDark ? "text-amber-400" : "text-[#4F46E5]"
            }`}
          >
            NEUROBOT • ready to assist
          </div>
          <button
            onClick={onOpenTutor}
            className={`text-[11px] font-mono flex items-center gap-0.5 font-bold ${
              isNeumorphic
                ? "neu-btn px-2 py-0.5 rounded-lg text-slate-700 hover:text-indigo-600"
                : isDark
                ? "text-zinc-400 hover:text-amber-300"
                : "text-zinc-600 hover:text-[#1E1B18]"
            }`}
          >
            <span>Ask Tutor</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <p className={`text-xs font-medium leading-snug ${isNeumorphic ? "text-slate-600" : isDark ? "text-zinc-300" : "text-zinc-700"}`}>
          Hey Learner — your next mission is ready below. Explore at your own pace with bite-size
          challenges.
        </p>
      </div>
    </div>
  );

  const renderDailyMissions = () => (
    <DailyMissionsCard
      user={user}
      activeQuest={currentItem}
      onStartLesson={handleStartTodayLesson}
      onOpenTutor={onOpenTutor}
      onAddXP={(amount) => {
        if (onAddXP) {
          onAddXP(amount);
        }
      }}
      theme={theme}
    />
  );

  return (
    <div id="home-path-view" className="w-full max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column: Path Progress & Winding Path */}
        <div className="lg:col-span-7 xl:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCourse?.id || "default-course"}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -28, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 27 }}
              className="space-y-6"
            >
              {/* Mobile Mascot (shown on smaller screens < lg) */}
              <div className="lg:hidden">
                {renderMascotCard()}
              </div>

              {/* 2. Track Path Progress Card matching selected course */}
              <div
                className={`p-4 rounded-2xl space-y-3 transition-all ${
                  isNeumorphic
                    ? "neu-raised text-slate-800"
                    : isDark
                    ? "bg-[#27272A] border border-[#3F3F46] text-[#F4F4F5] shadow-lg"
                    : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-black block ${isNeumorphic ? "text-[#4F46E5]" : isDark ? "text-amber-400" : "text-[#4F46E5]"}`}>
                        {activeCourse ? activeCourse.title : "CORE TRACK"}
                      </span>
                      {onOpenCoursePicker && (
                        <button
                          onClick={() => {
                            soundFx.playTap();
                            onOpenCoursePicker();
                          }}
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            isNeumorphic
                              ? "neu-btn text-slate-600 hover:text-indigo-600"
                              : isDark
                              ? "border-zinc-700 text-zinc-400 hover:text-amber-300"
                              : "border-zinc-400 text-zinc-700 hover:text-indigo-600"
                          }`}
                        >
                          Change
                        </button>
                      )}
                    </div>
                    <span className={`font-black ${isNeumorphic ? "text-slate-800" : isDark ? "text-zinc-100" : "text-[#1E1B18]"}`}>
                      LESSON {activeIndex + 1} OF {totalLessons}
                    </span>
                  </div>
                  <span className={`font-black ${isNeumorphic ? "text-[#4F46E5]" : isDark ? "text-amber-400" : "text-[#4F46E5]"}`}>
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  className={`w-full h-3 rounded-full overflow-hidden ${
                    isNeumorphic
                      ? "neu-inset p-0.5"
                      : isDark
                      ? "bg-[#18181B] border-2 border-[#3F3F46]"
                      : "bg-zinc-100 border-2 border-[#1E1B18]"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isNeumorphic
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm"
                        : isDark
                        ? "bg-amber-400"
                        : "bg-[#4F46E5]"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Start Today's Lesson Big Button */}
                <button
                  id="btn-start-today-lesson"
                  onClick={handleStartTodayLesson}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:translate-y-1 ${
                    isNeumorphic
                      ? "neu-btn-primary shadow-lg active:scale-98"
                      : isDark
                      ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 font-black shadow-md"
                      : "bg-[#4F46E5] text-white hover:bg-[#4338CA] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START TODAY'S LESSON</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Mobile Daily Missions (shown on smaller screens < lg) */}
              <div className="lg:hidden">
                {renderDailyMissions()}
              </div>

              {/* 4. Winding Path Section matching course */}
              <div className="relative pt-4 space-y-12 max-w-md sm:max-w-lg mx-auto">
                {/* Stage Header Card */}
                <div
                  className={`text-center py-5 px-4 rounded-2xl mx-auto max-w-sm transition-all ${
                    isNeumorphic
                      ? "neu-raised text-slate-800"
                      : isDark
                      ? "bg-[#27272A] border border-[#3F3F46] text-[#F4F4F5] shadow-xl"
                      : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
                  }`}
                >
                  <div
                    className={`text-[10px] font-mono tracking-widest uppercase font-bold ${
                      isNeumorphic ? "text-[#4F46E5]" : isDark ? "text-amber-400" : "text-[#4F46E5]"
                    }`}
                  >
                    {activeCourse?.tag ? `COURSE • ${activeCourse.tag}` : "CHAPTER 1"}
                  </div>
                  <h2
                    className={`text-xl sm:text-2xl font-black tracking-tight uppercase mt-0.5 ${
                      isNeumorphic ? "text-slate-800" : isDark ? "text-[#F4F4F5]" : "text-[#1E1B18]"
                    }`}
                  >
                    {displayStages[0]?.title || "AI Foundations"}
                  </h2>
                  <p className={`text-xs mt-1 font-medium ${isNeumorphic ? "text-slate-600" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {displayStages[0]?.subtitle || "Start curious — explore fundamental paradigm shifts"}
                  </p>
                </div>

                {/* Serpentine Node Path */}
        <div className="relative py-4 min-h-[600px]">
          {/* Background SVG connecting curve line */}
          <svg
            className={`absolute inset-0 w-full h-full pointer-events-none ${
              isDark ? "stroke-[#3F3F46]" : "stroke-[#1E1B18]/25"
            }`}
            fill="none"
            strokeWidth="5"
            strokeDasharray="8 8"
          >
            {allQuestsWithStage.slice(0, 8).map((_, idx) => {
              if (idx >= 7) return null;
              const y1 = idx * 110 + 40;
              const y2 = (idx + 1) * 110 + 40;
              const x1Pct = getNodeOffset(idx);
              const x2Pct = getNodeOffset(idx + 1);

              return (
                <path
                  key={idx}
                  d={`M ${x1Pct}% ${y1} C ${x1Pct}% ${(y1 + y2) / 2}, ${x2Pct}% ${
                    (y1 + y2) / 2
                  }, ${x2Pct}% ${y2}`}
                />
              );
            })}
          </svg>

          {/* Node Render Loop */}
          <div className="relative space-y-16">
            {allQuestsWithStage.slice(0, 8).map((item, idx) => {
              const isCompleted = completedSet.has(item.quest.id);
              const isCurrent = idx === activeIndex;
              const isUnlocked = idx <= activeIndex;
              const offsetPct = getNodeOffset(idx);

              const hasChestLeft = idx === 1;
              const hasChestRight = idx === 3;
              const chestId = `chest-${idx}`;
              const isChestClaimed = openedChests.has(chestId);

              return (
                <div key={item.quest.id} className="relative flex flex-col items-center">
                  {/* Floating START NOW Pill above active node (matching video) */}
                  {isCurrent && (
                    <div className="mb-2 animate-bounce">
                      <div
                        className={`px-3.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg ${
                          isNeumorphic
                            ? "neu-btn-primary"
                            : isDark
                            ? "bg-amber-400 text-zinc-950 border border-amber-500"
                            : "bg-[#4F46E5] text-white border-2 border-[#1E1B18]"
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>START NOW</span>
                      </div>
                    </div>
                  )}

                  {/* The Node Row */}
                  <div className="w-full relative flex items-center justify-center">
                    {/* Collectible Treasure Chest on Left */}
                    {hasChestLeft && (
                      <div className="absolute left-4 -top-3">
                        <motion.button
                          whileHover={!isChestClaimed ? { scale: 1.12, rotate: [-2, 2, 0] } : {}}
                          whileTap={!isChestClaimed ? { scale: 0.92 } : {}}
                          onClick={() => handleChestClick(chestId, 15, 40)}
                          disabled={isChestClaimed}
                          className={`flex flex-col items-center p-2 rounded-2xl transition-transform ${
                            isChestClaimed
                              ? "opacity-60 grayscale cursor-default"
                              : "animate-pulse"
                          }`}
                        >
                          <div
                            className={`w-14 h-12 rounded-2xl flex items-center justify-center transition-all ${
                              isChestClaimed
                                ? isNeumorphic
                                  ? "neu-inset text-slate-400"
                                  : isDark
                                  ? "bg-[#18181B] border-2 border-zinc-700 text-zinc-500"
                                  : "bg-zinc-200 border-2 border-zinc-400 text-zinc-500"
                                : isNeumorphic
                                ? "neu-raised text-amber-500 hover:text-amber-600"
                                : isDark
                                ? "bg-amber-950/40 border-2 border-amber-400 text-amber-300"
                                : "bg-[#FEF08A] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                            }`}
                          >
                            <Package className="w-7 h-7" />
                          </div>
                          <span
                            className={`text-[10px] font-mono font-black mt-1 ${
                              isNeumorphic ? "text-amber-600" : isDark ? "text-amber-400" : "text-[#1E1B18]"
                            }`}
                          >
                            {isChestClaimed ? "Claimed" : "+15 Sparks"}
                          </span>
                        </motion.button>
                      </div>
                    )}

                    {/* Circular Node Button */}
                    <div
                      style={{
                        transform: `translateX(${offsetPct === 50 ? 0 : offsetPct < 50 ? -60 : 60}px)`
                      }}
                      className="transition-transform duration-300 flex flex-col items-center"
                    >
                      <motion.button
                        id={`node-${item.quest.id}`}
                        whileHover={isUnlocked ? { scale: 1.12 } : {}}
                        whileTap={isUnlocked ? { scale: 0.92 } : {}}
                        onClick={() => handleNodeClick(item, isUnlocked)}
                        disabled={!isUnlocked}
                        className={`relative w-18 h-18 rounded-full flex items-center justify-center transition-all ${
                          isNeumorphic
                            ? isCurrent
                              ? "neu-btn-primary scale-105"
                              : isCompleted
                              ? "neu-flat text-emerald-600 border border-emerald-400/40"
                              : "neu-inset text-slate-400 cursor-not-allowed opacity-60"
                            : isCurrent
                            ? isDark
                              ? "bg-amber-400 text-zinc-950 border-4 border-amber-300 shadow-xl scale-105"
                              : "bg-[#4F46E5] text-white border-4 border-[#1E1B18] shadow-[0_6px_0_#1E1B18] scale-105"
                            : isCompleted
                            ? isDark
                              ? "bg-emerald-600 text-white border-3 border-emerald-400 shadow-md"
                              : "bg-[#10B981] text-white border-3 border-[#1E1B18] shadow-[0_4px_0_#1E1B18]"
                            : isDark
                            ? "bg-[#27272A] text-zinc-600 border-2 border-zinc-700 cursor-not-allowed opacity-80"
                            : "bg-[#E5E7EB] text-[#9CA3AF] border-2 border-[#D1D5DB] cursor-not-allowed opacity-80"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                        ) : isCurrent ? (
                          <Play className="w-8 h-8 fill-current ml-0.5" />
                        ) : (
                          <Lock className="w-6 h-6 stroke-[2]" />
                        )}

                        {/* Ring around current active node */}
                        {isCurrent && (
                          <span
                            className={`absolute -inset-2 rounded-full border-2 animate-ping pointer-events-none ${
                              isDark ? "border-amber-400/40" : "border-[#4F46E5]/40"
                            }`}
                          />
                        )}
                      </motion.button>

                      {/* Node Label Badge */}
                      <div className="mt-2 text-center max-w-[140px]">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-md uppercase font-bold tracking-wider ${
                            isCurrent
                              ? isDark
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]"
                              : isDark
                              ? "text-zinc-500"
                              : "text-zinc-500"
                          }`}
                        >
                          MISSION
                        </span>
                        <div
                          className={`text-xs font-bold truncate mt-0.5 ${
                            isCurrent
                              ? isDark
                                ? "text-zinc-100"
                                : "text-[#1E1B18]"
                              : isCompleted
                              ? isDark
                                ? "text-zinc-300"
                                : "text-zinc-700"
                              : "text-zinc-400"
                          }`}
                        >
                          {item.quest.title}
                        </div>
                      </div>
                    </div>

                    {/* Collectible Treasure Chest on Right */}
                    {hasChestRight && (
                      <div className="absolute right-4 -top-3">
                        <button
                          onClick={() => handleChestClick(chestId, 25, 60)}
                          disabled={isChestClaimed}
                          className={`flex flex-col items-center p-2 rounded-2xl transition-transform active:scale-95 ${
                            isChestClaimed
                              ? "opacity-60 grayscale cursor-default"
                              : "hover:scale-105 animate-pulse"
                          }`}
                        >
                          <div
                            className={`w-14 h-12 rounded-2xl flex items-center justify-center border-2 ${
                              isChestClaimed
                                ? isDark
                                  ? "bg-[#18181B] border-zinc-700 text-zinc-500"
                                  : "bg-zinc-200 border-zinc-400 text-zinc-500"
                                : isDark
                                ? "bg-amber-950/40 border-amber-400 text-amber-300"
                                : "bg-[#FEF08A] border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                            }`}
                          >
                            <Package className="w-7 h-7" />
                          </div>
                          <span
                            className={`text-[10px] font-mono font-black mt-1 ${
                              isDark ? "text-amber-400" : "text-[#1E1B18]"
                            }`}
                          >
                            {isChestClaimed ? "Claimed" : "+25 Sparks"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Chapter 2 Locked Milestone Banner (Matching Video "COMING UP: THE FUTURE") */}
                  {idx === 3 && (
                    <div
                      className={`w-full max-w-sm mt-12 mb-4 p-5 rounded-2xl text-center space-y-1.5 transition-all ${
                        isDark
                          ? "bg-[#27272A] border border-[#3F3F46] text-[#F4F4F5] shadow-xl"
                          : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
                      }`}
                    >
                      <div
                        className={`text-[10px] font-mono uppercase font-bold ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        COMING UP
                      </div>
                      <h3
                        className={`text-xl font-black tracking-tight uppercase ${
                          isDark ? "text-zinc-100" : "text-[#1E1B18]"
                        }`}
                      >
                        THE FUTURE
                      </h3>
                      <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                        Finish strong — Deep Neural Architectures
                      </p>
                      <div
                        className={`pt-2 flex items-center justify-center gap-1.5 text-xs font-mono ${
                          isDark ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Keep going to unlock</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</div>

    {/* Right Sticky Sidebar: Desktop & Widescreen */}
    <div className="hidden lg:block lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20 space-y-6">
      {renderMascotCard()}
      {renderDailyMissions()}
    </div>
  </div>

      {/* Chest claim toast modal */}
      {chestModal && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border-2 ${
            isDark
              ? "bg-[#18181B] border-amber-400 text-amber-300"
              : "bg-[#FFFDF9] border-[#1E1B18] text-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
          }`}
        >
          <div className="p-2 rounded-xl bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-xs font-black">Treasure Chest Opened!</div>
            <div className={`text-xs font-mono font-bold ${isDark ? "text-amber-400" : "text-[#4F46E5]"}`}>
              +{chestModal.sparks} Sparks • +{chestModal.xp} XP
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
