import React, { useState, useEffect } from "react";
import { Stage, Quest, UserProfile, Course, AppTheme, MascotRole } from "./types";
import { STAGES_CURRICULUM } from "./data/curriculum";
import { AVAILABLE_COURSES } from "./data/courses";
import { dataStore } from "./services/storage";
import { authService } from "./services/auth";
import { BottomNav, NavTab } from "./components/layout/BottomNav";
import { TopHeader } from "./components/layout/TopHeader";
import { HomePathView } from "./components/home/HomePathView";
import { LabView } from "./components/lab/LabView";
import { LeagueView } from "./components/league/LeagueView";
import { YouView } from "./components/you/YouView";
import { QuestView } from "./components/quest/QuestView";
import { NeuroTutorDrawer } from "./components/tutor/NeuroTutorDrawer";
import { CoursePickerModal } from "./components/modals/CoursePickerModal";
import { SparksModal } from "./components/modals/SparksModal";
import { StreakModal } from "./components/modals/StreakModal";
import { DailyGiftModal } from "./components/modals/DailyGiftModal";
import { INITIAL_PROFILE } from "./data/gamification";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { audioManager, soundFx } from "./utils/sound";

const GUEST_THEME_KEY = "neuroquest_guest_theme";

const TAB_INDICES: Record<string, number> = {
  home: 0,
  lab: 1,
  league: 2,
  you: 3,
  quest: 4,
};

const sectionVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 14 : -14,
    y: 6,
    scale: 0.992,
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.34,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -14 : 14,
    y: -4,
    scale: 0.995,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function App() {
  const [stages] = useState<Stage[]>(STAGES_CURRICULUM);
  const [courses] = useState<Course[]>(AVAILABLE_COURSES);
  const [activeCourse, setActiveCourse] = useState<Course>(AVAILABLE_COURSES[0]);

  const [user, setUser] = useState<UserProfile>(INITIAL_PROFILE);
  const [guestTheme, setGuestTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(GUEST_THEME_KEY) as AppTheme | null;
      return saved || "neumorphic";
    } catch {
      return "neumorphic";
    }
  });
  const [currentTab, setCurrentTab] = useState<NavTab | "quest">("home");
  const [tabDirection, setTabDirection] = useState(1);
  const [activeQuest, setActiveQuest] = useState<{ quest: Quest; stage: Stage } | null>(null);

  const switchTab = (nextTab: NavTab | "quest") => {
    const currentIdx = TAB_INDICES[currentTab] ?? 0;
    const nextIdx = TAB_INDICES[nextTab] ?? 0;
    setTabDirection(nextIdx >= currentIdx ? 1 : -1);
    setCurrentTab(nextTab);
    audioManager.playTabSwitch();
  };

  // Modals
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);
  const [isSparksModalOpen, setIsSparksModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  const [tutorContext, setTutorContext] = useState({
    questTitle: "Artificial Intelligence Foundations",
    stageTitle: "AI Foundations",
    phase: "Learn",
  });

  // Free-entry mode: hydrate saved local profile immediately and sync Firebase user if signed in
  useEffect(() => {
    let active = true;

    dataStore.getUserProfile().then((localProfile) => {
      if (active) {
        setUser(localProfile);
      }
    });

    const unsubscribe = authService.onAuthStateChanged(async (authUser, ready) => {
      if (!active) return;
      if (authUser) {
        setUser(authUser);
      } else if (ready) {
        const guestProfile = await dataStore.getUserProfile();
        if (active) {
          setUser(guestProfile);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleSelectQuest = (quest: Quest, stage: Stage) => {
    audioManager.playTap();
    setActiveQuest({ quest, stage });
    setTutorContext({
      questTitle: quest.title,
      stageTitle: stage.title,
      phase: "Learn",
    });
    switchTab("quest");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCompleteQuest = async (questId: string, xpReward: number, skillTag: string) => {
    const prevLevel = user?.level || 1;
    await dataStore.completeQuest(questId, xpReward, skillTag);
    // Also award +10 sparks on completion!
    const withSparks = await dataStore.addSparks(10);
    setUser(withSparks);

    if (withSparks.level > prevLevel) {
      audioManager.playLevelUp();
    } else {
      audioManager.playQuestComplete();
    }
  };

  const handleClaimChest = async (chestId: string, rewardSparks: number, rewardXP: number) => {
    const prevLevel = user?.level || 1;
    const updated = await dataStore.claimChest(chestId, rewardSparks, rewardXP);
    setUser(updated);

    if (updated.level > prevLevel) {
      audioManager.playLevelUp();
    } else {
      audioManager.playChestOpen();
    }
  };

  const handleAddXP = async (amount: number) => {
    const prevLevel = user?.level || 1;
    const updated = await dataStore.addXP(amount);
    setUser(updated);

    if (updated.level > prevLevel) {
      audioManager.playLevelUp();
    } else {
      audioManager.playSpark();
    }
  };

  const handleAddSparks = async (amount: number) => {
    const updated = await dataStore.addSparks(amount);
    setUser(updated);
    audioManager.playSpark();
  };

  const handleSetTheme = async (theme: AppTheme) => {
    if (!user) {
      setGuestTheme(theme);
      try {
        localStorage.setItem(GUEST_THEME_KEY, theme);
      } catch {
        // Ignore
      }
      return;
    }
    const updated = await dataStore.setTheme(theme);
    setUser(updated);
  };

  const handleSetMascotRole = async (role: MascotRole) => {
    const updated = await dataStore.setMascotRole(role);
    setUser(updated);
  };

  const handleResetProgress = async () => {
    const reset = await dataStore.resetProgress();
    setUser(reset);
    switchTab("home");
  };

  const handleNavigateNextQuest = () => {
    if (!activeQuest) return;
    let foundCurrent = false;
    let nextQ: { quest: Quest; stage: Stage } | null = null;

    for (const st of stages) {
      for (const q of st.quests) {
        if (foundCurrent) {
          nextQ = { quest: q, stage: st };
          break;
        }
        if (q.id === activeQuest.quest.id) {
          foundCurrent = true;
        }
      }
      if (nextQ) break;
    }

    if (nextQ) {
      handleSelectQuest(nextQ.quest, nextQ.stage);
    } else {
      setCurrentTab("home");
    }
  };

  // Normalize theme: default to neumorphic (Apple Light)
  const rawTheme = user?.theme ?? guestTheme;
  const activeTheme: AppTheme =
    !rawTheme || rawTheme === "riso-pop" ? "neumorphic" : rawTheme;

  const isDark =
    activeTheme === "obsidian-gold" ||
    activeTheme === "obsidian-noir" ||
    activeTheme === "cyber-dark" ||
    activeTheme === "neon-matrix";

  // Sync dark class on document element (Must be called unconditionally on every render)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    soundFx.playTap();
    if (isDark) {
      handleSetTheme("neumorphic");
    } else {
      handleSetTheme("obsidian-noir");
    }
  };

  const handleLogOut = async () => {
    soundFx.playTap();
    await authService.signOut();
    setActiveQuest(null);
    setCurrentTab("home");
    const guestProfile = await dataStore.getUserProfile();
    setUser(guestProfile);
  };

  // Unified calm Apple canvas palette across light/warm/dark themes
  let themeBg = "bg-[#F2F4F8] text-[#1D1D1F]";
  if (activeTheme === "minimal-light") themeBg = "bg-[#F9FAFC] text-[#1D1D1F]";
  if (isDark) themeBg = "bg-[#09090C] text-[#F5F5F7]";
  if (activeTheme === "warm-editorial") themeBg = "bg-[#F7F5F1] text-[#1D1D1F]";

  const ambientBackdrop = (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-700"
    >
      <div
        className={`absolute -top-36 -left-24 w-[480px] h-[480px] rounded-full blur-[110px] transition-colors duration-700 ${
          isDark
            ? activeTheme === "obsidian-gold"
              ? "bg-amber-500/[0.10]"
              : "bg-[#2997FF]/[0.13]"
            : activeTheme === "warm-editorial"
            ? "bg-amber-300/[0.18]"
            : "bg-[#0071E3]/[0.09]"
        }`}
      />
      <div
        className={`absolute top-1/3 -right-28 w-[440px] h-[440px] rounded-full blur-[120px] transition-colors duration-700 ${
          isDark
            ? activeTheme === "obsidian-gold"
              ? "bg-sky-500/[0.08]"
              : "bg-indigo-500/[0.09]"
            : activeTheme === "warm-editorial"
            ? "bg-rose-300/[0.12]"
            : "bg-sky-300/[0.14]"
        }`}
      />
      <div
        className={`absolute -bottom-32 left-1/3 w-[460px] h-[460px] rounded-full blur-[120px] transition-colors duration-700 ${
          isDark
            ? "bg-emerald-500/[0.06]"
            : activeTheme === "warm-editorial"
            ? "bg-orange-200/[0.14]"
            : "bg-emerald-300/[0.09]"
        }`}
      />
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`min-h-screen ${themeBg} font-sans selection:bg-[#0071E3]/15 selection:text-[#0071E3] transition-colors duration-500 relative overflow-x-hidden`}
      >
        {ambientBackdrop}

        {/* Responsive App Shell */}
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          {/* Top Header (Shown on Home, Lab, League, You) */}
          {currentTab !== "quest" && (
            <TopHeader
              user={user}
              activeCourse={activeCourse}
              onOpenCoursePicker={() => setIsCoursePickerOpen(true)}
              onOpenSparksModal={() => setIsSparksModalOpen(true)}
              onOpenStreakModal={() => setIsStreakModalOpen(true)}
              onOpenGiftModal={() => setIsGiftModalOpen(true)}
              onToggleTheme={handleToggleTheme}
              theme={activeTheme}
            />
          )}

          {/* Dynamic View Body */}
          <main className="flex-1">
            <AnimatePresence mode="wait" custom={tabDirection}>
              {currentTab === "home" && (
                <motion.div
                  key="home"
                  custom={tabDirection}
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <HomePathView
                    stages={stages}
                    activeCourse={activeCourse}
                    onOpenCoursePicker={() => setIsCoursePickerOpen(true)}
                    user={user}
                    onSelectQuest={handleSelectQuest}
                    onClaimChest={handleClaimChest}
                    onOpenTutor={() => setIsTutorOpen(true)}
                    onAddXP={handleAddXP}
                    theme={activeTheme}
                  />
                </motion.div>
              )}

              {currentTab === "lab" && (
                <motion.div
                  key="lab"
                  custom={tabDirection}
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <LabView
                    user={user}
                    stages={stages}
                    onStartLesson={(q, st) => handleSelectQuest(q, st)}
                    onAddSparks={handleAddSparks}
                    theme={activeTheme}
                  />
                </motion.div>
              )}

              {currentTab === "league" && (
                <motion.div
                  key="league"
                  custom={tabDirection}
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <LeagueView user={user} theme={activeTheme} />
                </motion.div>
              )}

              {currentTab === "you" && (
                <motion.div
                  key="you"
                  custom={tabDirection}
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <YouView
                    user={user}
                    stages={stages}
                    onSetTheme={handleSetTheme}
                    onSetMascotRole={handleSetMascotRole}
                    onAddSparks={handleAddSparks}
                    onResetProgress={handleResetProgress}
                    onSetStreakDays={async (days) => {
                      const updated = await dataStore.setStreakDays(days);
                      setUser(updated);
                    }}
                    onCompleteQuest={handleCompleteQuest}
                    onLogOut={handleLogOut}
                    onUpdateUser={(updated) => setUser(updated)}
                    theme={activeTheme}
                  />
                </motion.div>
              )}

              {currentTab === "quest" && activeQuest && (
                <motion.div
                  key={`quest-${activeQuest.quest.id}`}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.985 }}
                  transition={{
                    duration: 0.34,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <QuestView
                    quest={activeQuest.quest}
                    stage={activeQuest.stage}
                    onBackToJourney={() => switchTab("home")}
                    onCompleteQuest={handleCompleteQuest}
                    onOpenTutor={(title, phase) => {
                      setTutorContext((prev) => ({
                        ...prev,
                        questTitle: title || prev.questTitle,
                        phase: phase || prev.phase,
                      }));
                      setIsTutorOpen(true);
                    }}
                    onNavigateNextQuest={handleNavigateNextQuest}
                    onToggleTheme={handleToggleTheme}
                    theme={activeTheme}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Persistent Bottom Dock (Hidden only when in full quest challenge mode) */}
          {currentTab !== "quest" && (
            <BottomNav
              currentTab={currentTab}
              onSelectTab={(tab) => {
                switchTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              theme={activeTheme}
            />
          )}
        </div>

        {/* Socratic Neuro AI Tutor Drawer */}
        <NeuroTutorDrawer
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          activeQuestTitle={tutorContext.questTitle}
          activeStageTitle={tutorContext.stageTitle}
          activePhase={tutorContext.phase}
          theme={activeTheme}
        />

        {/* Modal: Course Picker */}
        <CoursePickerModal
          isOpen={isCoursePickerOpen}
          onClose={() => setIsCoursePickerOpen(false)}
          courses={courses}
          activeCourseId={activeCourse.id}
          onSelectCourse={(c) => setActiveCourse(c)}
          theme={activeTheme}
        />

        {/* Modal: Sparks Refill & Demo */}
        <SparksModal
          isOpen={isSparksModalOpen}
          onClose={() => setIsSparksModalOpen(false)}
          currentSparks={user.sparks ?? 45}
          onAddSparks={handleAddSparks}
          theme={activeTheme}
        />

        {/* Modal: Streak Calendar */}
        <StreakModal
          isOpen={isStreakModalOpen}
          onClose={() => setIsStreakModalOpen(false)}
          streakDays={user.streakDays || 1}
          theme={activeTheme}
        />

        {/* Modal: Daily Gift Box */}
        <DailyGiftModal
          isOpen={isGiftModalOpen}
          onClose={() => setIsGiftModalOpen(false)}
          onClaimReward={async (sparks, xp) => {
            await dataStore.addSparks(sparks);
            const updated = await dataStore.getUserProfile();
            setUser(updated);
          }}
          theme={activeTheme}
        />
      </div>
    </MotionConfig>
  );
}
