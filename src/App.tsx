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
import { ParticleBackground } from "./components/layout/ParticleBackground";
import { AuthStarterView } from "./components/auth/AuthStarterView";
import { OAuthCallbackHandler } from "./components/auth/OAuthCallbackHandler";
import { motion, AnimatePresence } from "motion/react";
import { audioManager, soundFx } from "./utils/sound";

const isOAuthCallbackWindow = () => {
  try {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isNamedOAuth = window.name === "supabase_google_oauth";
    const hasOAuthHash = hash.includes("access_token=") || hash.includes("error=");
    const hasOAuthQuery = search.includes("code=") || (search.includes("error=") && Boolean(window.opener));
    return isNamedOAuth || hasOAuthHash || hasOAuthQuery;
  } catch {
    return false;
  }
};

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
    x: direction > 0 ? 32 : -32,
    scale: 0.99,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 28,
      mass: 0.75,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -32 : 32,
    scale: 0.99,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function App() {
  const [stages] = useState<Stage[]>(STAGES_CURRICULUM);
  const [courses] = useState<Course[]>(AVAILABLE_COURSES);
  const [activeCourse, setActiveCourse] = useState<Course>(AVAILABLE_COURSES[0]);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem("neuroquest_auth_active") === "true" ||
        localStorage.getItem("neuropath_auth_active") === "true"
      );
    } catch {
      return false;
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

  // Load user profile on startup and subscribe to auth state changes
  useEffect(() => {
    async function loadData() {
      const profile = await dataStore.getUserProfile();
      setUser(profile);
    }
    loadData();

    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        setIsLoggedIn(true);
      }
    });

    return () => {
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
    const updated = await dataStore.completeQuest(questId, xpReward, skillTag);
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

  // Normalize theme: default to neumorphic
  const activeTheme: AppTheme =
    !user?.theme || user.theme === "riso-pop" ? "neumorphic" : user.theme;

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

  const handleLoginSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsLoggedIn(true);
    setCurrentTab("home");
    try {
      localStorage.setItem("neuroquest_auth_active", "true");
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleLogOut = async () => {
    soundFx.playTap();
    setIsLoggedIn(false);
    await authService.signOut();
  };

  // If this window is the Google OAuth popup / callback tab, render the compact login completion screen
  if (isOAuthCallbackWindow()) {
    return <OAuthCallbackHandler onCompleteStandalone={handleLoginSuccess} />;
  }

  if (!user) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-[#18181B] text-zinc-100" : "bg-[#E2E8F0] text-slate-800"} flex items-center justify-center font-mono text-xs`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] animate-ping" />
          <span className="font-bold">Initializing AI Learning Engine...</span>
        </div>
      </div>
    );
  }

  const isRiso = activeTheme === "warm-editorial";

  // Theme-specific root wrapper style
  let themeBg = "bg-[#E2E8F0] text-[#1E293B] theme-neumorphic";
  if (activeTheme === "minimal-light") themeBg = "bg-[#FAFAFA] text-[#09090B]";
  if (isDark) themeBg = "bg-[#18181B] text-[#F4F4F5]";
  if (activeTheme === "warm-editorial") themeBg = "bg-[#FBF9F4] text-[#1E1B18]";

  // If not logged in, display the full Login Starter Page first!
  if (!isLoggedIn) {
    return (
      <div
        className={`min-h-screen ${themeBg} font-sans selection:bg-[#4F46E5]/20 selection:text-[#4F46E5] transition-colors duration-300 relative overflow-x-hidden`}
      >
        <ParticleBackground theme={activeTheme} isDark={isDark} />
        <div className="relative z-10 w-full min-h-screen flex flex-col justify-center">
          <AuthStarterView
            onLoginSuccess={handleLoginSuccess}
            activeTheme={activeTheme}
            onToggleTheme={handleToggleTheme}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeBg} font-sans selection:bg-[#4F46E5]/20 selection:text-[#4F46E5] transition-colors duration-300 relative overflow-x-hidden`}
    >
      {/* Interactive Ambient Falling Particle Canvas with Scrolling Parallax Physics */}
      <ParticleBackground theme={activeTheme} isDark={isDark} />

      {/* Responsive App Shell: auto-flexible across mobile, tablet, desktop, and all aspect ratios */}
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
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{
                  duration: 0.28,
                  ease: [0.16, 1, 0.3, 1],
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

        {/* Persistent 5-Tab Bottom Dock (Hidden only when in full quest challenge mode) */}
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
  );
}
