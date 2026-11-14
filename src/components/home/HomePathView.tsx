import React, { useState } from "react";
import {
  Play,
  Lock,
  Bot,
  ChevronRight,
  Package,
  CheckCircle2,
  Zap,
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
  theme = "neumorphic",
}) => {
  const [chestModal, setChestModal] = useState<{
    id: string;
    sparks: number;
    xp: number;
  } | null>(null);

  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const completedSet = new Set(user.completedQuestIds || []);
  const openedChests = new Set(user.openedChests || []);

  // Filter stages for currently selected course
  const displayStages = activeCourse?.stageIds?.length
    ? stages.filter((st) => activeCourse.stageIds.includes(st.id))
    : stages;

  const allQuestsWithStage: {
    quest: Quest;
    stage: Stage;
    globalIndex: number;
  }[] = [];
  let gIdx = 1;
  displayStages.forEach((st) => {
    st.quests.forEach((q) => {
      allQuestsWithStage.push({ quest: q, stage: st, globalIndex: gIdx });
      gIdx++;
    });
  });

  const totalLessons = allQuestsWithStage.length;
  const completedCount = allQuestsWithStage.filter((item) =>
    completedSet.has(item.quest.id)
  ).length;
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / (totalLessons || 1)) * 100)
  );

  const firstIncompleteIndex = allQuestsWithStage.findIndex(
    (item) => !completedSet.has(item.quest.id)
  );
  const activeIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
  const currentItem = allQuestsWithStage[activeIndex] || allQuestsWithStage[0];

  const handleStartTodayLesson = () => {
    soundFx.playTap();
    if (currentItem) {
      onSelectQuest(currentItem.quest, currentItem.stage);
    }
  };

  const handleNodeClick = (
    item: { quest: Quest; stage: Stage },
    isUnlocked: boolean
  ) => {
    soundFx.playTap();
    if (!isUnlocked) return;
    onSelectQuest(item.quest, item.stage);
  };

  const handleChestClick = (chestId: string, sparks: number, xp: number) => {
    if (openedChests.has(chestId)) return;
    soundFx.playChestOpen();
    onClaimChest(chestId, sparks, xp);
    setChestModal({ id: chestId, sparks, xp });
    setTimeout(() => setChestModal(null), 2600);
  };

  const getNodeOffset = (index: number) => {
    const pattern = [50, 26, 50, 74];
    return pattern[index % 4];
  };

  const renderMascotCard = () => (
    <div className="apple-surface p-5 rounded-3xl flex items-start gap-4 transition-colors">
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
          isDark
            ? "bg-[#2997FF]/15 text-[#2997FF]"
            : "bg-[#0071E3]/10 text-[#0071E3]"
        }`}
      >
        <Bot className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <span>NeuroBot</span>
            <span
              className={`font-normal ${
                isDark ? "text-zinc-500" : "text-[#6E6E73]"
              }`}
            >
              · Ready to help
            </span>
          </div>
          <button
            onClick={onOpenTutor}
            className={`text-xs font-medium inline-flex items-center gap-0.5 transition-colors whitespace-nowrap ${
              isDark
                ? "text-[#2997FF] hover:text-blue-300"
                : "text-[#0071E3] hover:text-[#005BB5]"
            }`}
          >
            <span>Ask Tutor</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p
          className={`text-xs leading-relaxed ${
            isDark ? "text-zinc-400" : "text-[#6E6E73]"
          }`}
        >
          Your next lesson is queued below. Move through concepts at your own pace with interactive explanations.
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
        if (onAddXP) onAddXP(amount);
      }}
      theme={theme}
    />
  );

  return (
    <div
      id="home-path-view"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-32"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Main Column: Progress Card & Learning Path */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCourse?.id || "default-course"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Mobile Tutor Card */}
              <div className="lg:hidden">{renderMascotCard()}</div>

              {/* Track Overview Card */}
              <div className="apple-surface p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold ${
                          isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                        }`}
                      >
                        {activeCourse ? activeCourse.title : "Core Track"}
                      </span>
                      {onOpenCoursePicker && (
                        <button
                          onClick={() => {
                            soundFx.playTap();
                            onOpenCoursePicker();
                          }}
                          className={`text-xs font-medium transition-colors ${
                            isDark
                              ? "text-zinc-400 hover:text-white"
                              : "text-[#6E6E73] hover:text-[#1D1D1F]"
                          }`}
                        >
                          · Switch track
                        </button>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight tabular-nums">
                      Lesson {activeIndex + 1} of {totalLessons}
                    </h2>
                  </div>

                  <span
                    className={`text-sm font-mono font-semibold tabular-nums shrink-0 ${
                      isDark ? "text-zinc-300" : "text-[#1D1D1F]"
                    }`}
                  >
                    {progressPercent}%
                  </span>
                </div>

                {/* Clean Thin Progress Bar */}
                <div className="w-full h-2 rounded-full overflow-hidden neu-progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${
                      isDark ? "bg-[#2997FF]" : "bg-[#0071E3]"
                    }`}
                  />
                </div>

                {/* Primary Lesson CTA */}
                <motion.button
                  id="btn-start-today-lesson"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartTodayLesson}
                  className={`w-full min-h-[46px] py-3 px-5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isDark
                      ? "bg-[#0A84FF] hover:bg-[#2997FF] text-white"
                      : "bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xs"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Today's Lesson</span>
                  <ChevronRight className="w-4 h-4 opacity-80" />
                </motion.button>
              </div>

              {/* Mobile Daily Missions */}
              <div className="lg:hidden">{renderDailyMissions()}</div>

              {/* Learning Path Section */}
              <div className="relative pt-2 space-y-10 max-w-md sm:max-w-lg mx-auto">
                {/* Chapter / Stage Heading */}
                <div className="apple-surface text-center py-5 px-6 rounded-3xl mx-auto max-w-sm space-y-1">
                  <div
                    className={`text-xs font-medium ${
                      isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                    }`}
                  >
                    {activeCourse?.tag || "Chapter 1"}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {displayStages[0]?.title || "AI Foundations"}
                  </h2>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    {displayStages[0]?.subtitle ||
                      "Start curious — explore fundamental paradigm shifts"}
                  </p>
                </div>

                {/* Serpentine Node Path */}
                <div className="relative py-4 min-h-[600px]">
                  <svg
                    className={`absolute inset-0 w-full h-full pointer-events-none ${
                      isDark ? "stroke-white/[0.08]" : "stroke-black/[0.08]"
                    }`}
                    fill="none"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                  >
                    {allQuestsWithStage.slice(0, 8).map((_, idx) => {
                      if (idx >= 7) return null;
                      const y1 = idx * 112 + 42;
                      const y2 = (idx + 1) * 112 + 42;
                      const x1Pct = getNodeOffset(idx);
                      const x2Pct = getNodeOffset(idx + 1);

                      return (
                        <path
                          key={idx}
                          d={`M ${x1Pct}% ${y1} C ${x1Pct}% ${
                            (y1 + y2) / 2
                          }, ${x2Pct}% ${(y1 + y2) / 2}, ${x2Pct}% ${y2}`}
                        />
                      );
                    })}
                  </svg>

                  <div className="relative space-y-14">
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
                        <div
                          key={item.quest.id}
                          className="relative flex flex-col items-center"
                        >
                          {/* Active Lesson Label */}
                          {isCurrent && (
                            <div className="mb-2.5">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold shadow-xs ${
                                  isDark
                                    ? "bg-[#1C1C1E] text-[#2997FF] border border-[#2997FF]/30"
                                    : "bg-white text-[#0071E3] border border-black/[0.07]"
                                }`}
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>Up Next</span>
                              </span>
                            </div>
                          )}

                          <div className="w-full relative flex items-center justify-center">
                            {/* Left Chest */}
                            {hasChestLeft && (
                              <div className="absolute left-3 sm:left-6 -top-2">
                                <motion.button
                                  whileHover={
                                    !isChestClaimed ? { scale: 1.06 } : {}
                                  }
                                  whileTap={
                                    !isChestClaimed ? { scale: 0.94 } : {}
                                  }
                                  onClick={() =>
                                    handleChestClick(chestId, 15, 40)
                                  }
                                  disabled={isChestClaimed}
                                  className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-opacity ${
                                    isChestClaimed
                                      ? "opacity-45 cursor-default"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <div
                                    className={`w-12 h-11 rounded-2xl flex items-center justify-center border transition-colors ${
                                      isChestClaimed
                                        ? isDark
                                          ? "bg-[#1C1C1E] border-white/[0.06] text-zinc-500"
                                          : "bg-zinc-100 border-black/[0.05] text-zinc-400"
                                        : isDark
                                        ? "bg-amber-500/15 border-amber-400/30 text-amber-300"
                                        : "bg-amber-50 border-amber-200/80 text-amber-600 shadow-xs"
                                    }`}
                                  >
                                    <Package className="w-5 h-5" />
                                  </div>
                                  <span
                                    className={`text-[11px] font-medium tabular-nums ${
                                      isChestClaimed
                                        ? isDark
                                          ? "text-zinc-500"
                                          : "text-zinc-400"
                                        : isDark
                                        ? "text-amber-300"
                                        : "text-amber-700"
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
                                transform: `translateX(${
                                  offsetPct === 50
                                    ? 0
                                    : offsetPct < 50
                                    ? -56
                                    : 56
                                }px)`,
                              }}
                              className="transition-transform duration-300 flex flex-col items-center"
                            >
                              <motion.button
                                id={`node-${item.quest.id}`}
                                whileHover={isUnlocked ? { scale: 1.06 } : {}}
                                whileTap={isUnlocked ? { scale: 0.94 } : {}}
                                onClick={() => handleNodeClick(item, isUnlocked)}
                                disabled={!isUnlocked}
                                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                                  isCurrent
                                    ? isDark
                                      ? "bg-[#0A84FF] text-white shadow-[0_8px_24px_rgba(10,132,255,0.35)] ring-4 ring-[#0A84FF]/20"
                                      : "bg-[#0071E3] text-white shadow-[0_8px_24px_rgba(0,113,227,0.28)] ring-4 ring-[#0071E3]/15"
                                    : isCompleted
                                    ? isDark
                                      ? "bg-[#1C1C1E] text-emerald-400 border border-emerald-500/30 shadow-sm"
                                      : "bg-white text-emerald-600 border border-emerald-500/25 shadow-sm"
                                    : isDark
                                    ? "bg-[#1C1C1E] text-zinc-600 border border-white/[0.06] cursor-not-allowed"
                                    : "bg-white/70 text-zinc-400 border border-black/[0.06] cursor-not-allowed"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
                                ) : isCurrent ? (
                                  <Play className="w-6 h-6 fill-current ml-0.5" />
                                ) : (
                                  <Lock className="w-5 h-5 stroke-[1.8]" />
                                )}
                              </motion.button>

                              {/* Node Title */}
                              <div className="mt-2.5 text-center max-w-[155px]">
                                <div
                                  className={`text-xs font-semibold truncate ${
                                    isCurrent
                                      ? isDark
                                        ? "text-white"
                                        : "text-[#1D1D1F]"
                                      : isCompleted
                                      ? isDark
                                        ? "text-zinc-300"
                                        : "text-[#424245]"
                                      : isDark
                                      ? "text-zinc-600"
                                      : "text-zinc-400"
                                  }`}
                                >
                                  {item.quest.title}
                                </div>
                              </div>
                            </div>

                            {/* Right Chest */}
                            {hasChestRight && (
                              <div className="absolute right-3 sm:right-6 -top-2">
                                <motion.button
                                  whileHover={
                                    !isChestClaimed ? { scale: 1.06 } : {}
                                  }
                                  whileTap={
                                    !isChestClaimed ? { scale: 0.94 } : {}
                                  }
                                  onClick={() =>
                                    handleChestClick(chestId, 25, 60)
                                  }
                                  disabled={isChestClaimed}
                                  className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-opacity ${
                                    isChestClaimed
                                      ? "opacity-45 cursor-default"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <div
                                    className={`w-12 h-11 rounded-2xl flex items-center justify-center border transition-colors ${
                                      isChestClaimed
                                        ? isDark
                                          ? "bg-[#1C1C1E] border-white/[0.06] text-zinc-500"
                                          : "bg-zinc-100 border-black/[0.05] text-zinc-400"
                                        : isDark
                                        ? "bg-amber-500/15 border-amber-400/30 text-amber-300"
                                        : "bg-amber-50 border-amber-200/80 text-amber-600 shadow-xs"
                                    }`}
                                  >
                                    <Package className="w-5 h-5" />
                                  </div>
                                  <span
                                    className={`text-[11px] font-medium tabular-nums ${
                                      isChestClaimed
                                        ? isDark
                                          ? "text-zinc-500"
                                          : "text-zinc-400"
                                        : isDark
                                        ? "text-amber-300"
                                        : "text-amber-700"
                                    }`}
                                  >
                                    {isChestClaimed ? "Claimed" : "+25 Sparks"}
                                  </span>
                                </motion.button>
                              </div>
                            )}
                          </div>

                          {/* Milestone Upcoming Card */}
                          {idx === 3 && (
                            <div className="apple-surface w-full max-w-sm mt-10 mb-2 p-5 rounded-3xl text-center space-y-1.5">
                              <div
                                className={`text-xs font-medium ${
                                  isDark ? "text-zinc-500" : "text-[#6E6E73]"
                                }`}
                              >
                                Coming Up
                              </div>
                              <h3 className="text-lg font-bold tracking-tight">
                                Deep Neural Architectures
                              </h3>
                              <div
                                className={`pt-1 flex items-center justify-center gap-1.5 text-xs ${
                                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                                }`}
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Complete earlier lessons to unlock</span>
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

        {/* Right Sticky Sidebar */}
        <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 space-y-5">
          {renderMascotCard()}
          {renderDailyMissions()}
        </div>
      </div>

      {/* Chest Claim Notification Toast */}
      <AnimatePresence>
        {chestModal && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="apple-surface fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl flex items-center gap-3"
          >
            <div
              className={`p-2 rounded-xl ${
                isDark
                  ? "bg-amber-500/15 text-amber-300"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-xs font-semibold">Reward Claimed</div>
              <div
                className={`text-xs font-mono tabular-nums ${
                  isDark ? "text-amber-300" : "text-[#0071E3]"
                }`}
              >
                +{chestModal.sparks} Sparks · +{chestModal.xp} XP
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
