import { UserProfile, MilestoneBadge, Stage } from "../types";

export function computeMilestoneBadges(
  user: UserProfile,
  stages?: Stage[]
): MilestoneBadge[] {
  const completedIds = user.completedQuestIds || [];
  const streak = user.streakDays || 0;
  const sparks = user.sparks || 0;
  const level = user.level || 1;

  // Foundation quests: find all quests in stage "ai-foundations"
  const foundationStage = stages?.find((s) => s.id === "ai-foundations");
  const foundationQuestIds = foundationStage
    ? foundationStage.quests.map((q) => q.id)
    : ["quest-1"];
  
  const completedFoundations = foundationQuestIds.filter((id) =>
    completedIds.includes(id)
  ).length;
  const totalFoundations = Math.max(1, foundationQuestIds.length);
  const isFoundationsComplete = completedFoundations >= totalFoundations;

  // Find saved unlocked date from user profile achievements if present
  const getSavedUnlockedAt = (id: string, isEarned: boolean): string | null => {
    if (!isEarned) return null;
    const match = user.achievements?.find((a) => a.id === id);
    if (match?.unlockedAt) return match.unlockedAt;
    // Fallback to active date
    return user.lastActiveDate || new Date().toISOString().split("T")[0];
  };

  const badges: MilestoneBadge[] = [
    // 1. 7-DAY STREAK (Explicitly requested by user)
    {
      id: "streak-7",
      title: "Streak Titan",
      description: "Maintain a continuous 7-day daily learning streak without missing a day.",
      milestoneGoal: "7-Day Continuous Streak",
      currentValue: Math.min(streak, 7),
      targetValue: 7,
      unit: "days",
      isEarned: streak >= 7,
      progressPercent: Math.min(100, Math.round((streak / 7) * 100)),
      category: "streaks",
      rarity: "epic",
      iconName: "Flame",
      xpBonus: 150,
      unlockedAt: getSavedUnlockedAt("streak-7", streak >= 7),
      tips: "Practice at least one lesson or review a concept each day to protect your streak flame."
    },

    // 2. COMPLETING ALL FOUNDATION QUESTS (Explicitly requested by user)
    {
      id: "foundation-master",
      title: "Foundation Architect",
      description: "Master all core AI Foundations quests: Rules vs. Learning and Inductive Bias.",
      milestoneGoal: "Complete All Foundation Quests",
      currentValue: completedFoundations,
      targetValue: totalFoundations,
      unit: "quests",
      isEarned: isFoundationsComplete,
      progressPercent: Math.min(100, Math.round((completedFoundations / totalFoundations) * 100)),
      category: "curriculum",
      rarity: "rare",
      iconName: "Cpu",
      xpBonus: 120,
      unlockedAt: getSavedUnlockedAt("foundation-master", isFoundationsComplete),
      tips: "Navigate to the Home journey tab and complete 'The Paradigm Shift: Rules vs. Learning'."
    },

    // 3. 3-DAY STREAK
    {
      id: "streak-3",
      title: "Habit Spark",
      description: "Establish strong learning momentum with a 3-day consecutive study streak.",
      milestoneGoal: "3-Day Learning Streak",
      currentValue: Math.min(streak, 3),
      targetValue: 3,
      unit: "days",
      isEarned: streak >= 3,
      progressPercent: Math.min(100, Math.round((streak / 3) * 100)),
      category: "streaks",
      rarity: "common",
      iconName: "Zap",
      xpBonus: 50,
      unlockedAt: getSavedUnlockedAt("streak-3", streak >= 3),
      tips: "Log in and complete an activity for 3 consecutive calendar days."
    },

    // 4. 14-DAY STREAK
    {
      id: "streak-14",
      title: "Neural Marathoner",
      description: "Achieve the discipline of an AI researcher with a 14-day study streak.",
      milestoneGoal: "14-Day Learning Streak",
      currentValue: Math.min(streak, 14),
      targetValue: 14,
      unit: "days",
      isEarned: streak >= 14,
      progressPercent: Math.min(100, Math.round((streak / 14) * 100)),
      category: "streaks",
      rarity: "legendary",
      iconName: "Calendar",
      xpBonus: 300,
      unlockedAt: getSavedUnlockedAt("streak-14", streak >= 14),
      tips: "Consistency beats intensity. Review daily for two solid weeks."
    },

    // 5. FIRST SPARK (First Quest Completed)
    {
      id: "first-spark",
      title: "First Spark",
      description: "Complete your initial quest on the AI learning journey.",
      milestoneGoal: "Complete 1 Quest",
      currentValue: Math.min(completedIds.length, 1),
      targetValue: 1,
      unit: "quest",
      isEarned: completedIds.length >= 1,
      progressPercent: Math.min(100, Math.round((completedIds.length / 1) * 100)),
      category: "curriculum",
      rarity: "common",
      iconName: "Award",
      xpBonus: 50,
      unlockedAt: getSavedUnlockedAt("first-spark", completedIds.length >= 1),
      tips: "Finish the 5 stages (Learn, Interact, Solve, Prove, Reward) of any quest."
    },

    // 6. SCHOLAR (3 Quests Completed)
    {
      id: "scholar-3",
      title: "Scholar",
      description: "Complete 3 distinct curriculum quests across multiple stages.",
      milestoneGoal: "Complete 3 Quests",
      currentValue: Math.min(completedIds.length, 3),
      targetValue: 3,
      unit: "quests",
      isEarned: completedIds.length >= 3,
      progressPercent: Math.min(100, Math.round((completedIds.length / 3) * 100)),
      category: "curriculum",
      rarity: "rare",
      iconName: "GraduationCap",
      xpBonus: 100,
      unlockedAt: getSavedUnlockedAt("scholar-3", completedIds.length >= 3),
      tips: "Explore Machine Learning and Neural Networks to broaden your repertoire."
    },

    // 7. BOUNDARY BREAKER (Machine Learning Quest)
    {
      id: "boundary-breaker",
      title: "Boundary Breaker",
      description: "Conquer linear decision boundaries and the bias-variance tradeoff.",
      milestoneGoal: "Finish Machine Learning Quest",
      currentValue: completedIds.includes("quest-2") ? 1 : 0,
      targetValue: 1,
      unit: "quest",
      isEarned: completedIds.includes("quest-2"),
      progressPercent: completedIds.includes("quest-2") ? 100 : 0,
      category: "mastery",
      rarity: "rare",
      iconName: "Crosshair",
      xpBonus: 100,
      unlockedAt: getSavedUnlockedAt("boundary-breaker", completedIds.includes("quest-2")),
      tips: "Solve the Decision Boundary challenge in the Machine Learning track."
    },

    // 8. SYNAPTIC SCULPTOR (Neural Networks Quest)
    {
      id: "synaptic-sculptor",
      title: "Synaptic Sculptor",
      description: "Configure weights and non-linear activation functions to solve logic gates.",
      milestoneGoal: "Finish Neural Networks Quest",
      currentValue: completedIds.includes("quest-3") ? 1 : 0,
      targetValue: 1,
      unit: "quest",
      isEarned: completedIds.includes("quest-3"),
      progressPercent: completedIds.includes("quest-3") ? 100 : 0,
      category: "mastery",
      rarity: "rare",
      iconName: "Network",
      xpBonus: 120,
      unlockedAt: getSavedUnlockedAt("synaptic-sculptor", completedIds.includes("quest-3")),
      tips: "Engineer the logical AND gate perceptron in Stage 3."
    },

    // 9. EMBEDDING ALCHEMIST (Generative AI Quest)
    {
      id: "embedding-alchemist",
      title: "Embedding Alchemist",
      description: "Navigate high-dimensional semantic vector spaces and subword token projections.",
      milestoneGoal: "Finish Generative AI Quest",
      currentValue: completedIds.includes("quest-4") ? 1 : 0,
      targetValue: 1,
      unit: "quest",
      isEarned: completedIds.includes("quest-4"),
      progressPercent: completedIds.includes("quest-4") ? 100 : 0,
      category: "mastery",
      rarity: "epic",
      iconName: "Layers",
      xpBonus: 150,
      unlockedAt: getSavedUnlockedAt("embedding-alchemist", completedIds.includes("quest-4")),
      tips: "Align token vectors with >0.85 cosine similarity in the Generative AI lab."
    },

    // 10. AUTONOMOUS ARCHITECT (AI Agents Quest)
    {
      id: "autonomous-architect",
      title: "Autonomous Architect",
      description: "Execute a multi-step ReAct agent observation-action decision loop.",
      milestoneGoal: "Finish AI Agents Quest",
      currentValue: completedIds.includes("quest-5") ? 1 : 0,
      targetValue: 1,
      unit: "quest",
      isEarned: completedIds.includes("quest-5"),
      progressPercent: completedIds.includes("quest-5") ? 100 : 0,
      category: "mastery",
      rarity: "epic",
      iconName: "Bot",
      xpBonus: 150,
      unlockedAt: getSavedUnlockedAt("autonomous-architect", completedIds.includes("quest-5")),
      tips: "Complete the Agent Loops mission in Stage 5."
    },

    // 11. SPARKS HOARDER
    {
      id: "sparks-50",
      title: "Energy Surge",
      description: "Accumulate 50 or more Sparks in your treasury through dedicated practice.",
      milestoneGoal: "Amass 50 Sparks",
      currentValue: Math.min(sparks, 50),
      targetValue: 50,
      unit: "sparks",
      isEarned: sparks >= 50,
      progressPercent: Math.min(100, Math.round((sparks / 50) * 100)),
      category: "milestones",
      rarity: "common",
      iconName: "Sparkles",
      xpBonus: 60,
      unlockedAt: getSavedUnlockedAt("sparks-50", sparks >= 50),
      tips: "Claim milestone chests, complete daily reviews, and earn bonus sparks."
    },

    // 12. SPARKS CENTURION
    {
      id: "sparks-100",
      title: "Sparks Centurion",
      description: "Reach a major energy reserve of 100+ Sparks.",
      milestoneGoal: "Amass 100 Sparks",
      currentValue: Math.min(sparks, 100),
      targetValue: 100,
      unit: "sparks",
      isEarned: sparks >= 100,
      progressPercent: Math.min(100, Math.round((sparks / 100) * 100)),
      category: "milestones",
      rarity: "rare",
      iconName: "ShieldCheck",
      xpBonus: 120,
      unlockedAt: getSavedUnlockedAt("sparks-100", sparks >= 100),
      tips: "Keep answering Prove questions on your first attempt to earn maximum sparks."
    },

    // 13. LEVEL 2 PIONEER
    {
      id: "level-2",
      title: "Pattern Seeker",
      description: "Ascend past the Novice Explorer rank to achieve Learner Level 2.",
      milestoneGoal: "Reach Level 2 (150 XP)",
      currentValue: Math.min(level, 2),
      targetValue: 2,
      unit: "level",
      isEarned: level >= 2,
      progressPercent: level >= 2 ? 100 : Math.min(100, Math.round((user.xp / 150) * 100)),
      category: "milestones",
      rarity: "common",
      iconName: "TrendingUp",
      xpBonus: 80,
      unlockedAt: getSavedUnlockedAt("level-2", level >= 2),
      tips: "Earn at least 150 total XP by solving challenges and interactive stages."
    },

    // 14. CURRICULUM CONQUEROR
    {
      id: "curriculum-conqueror",
      title: "Curriculum Conqueror",
      description: "Conquer all 6 foundational through autonomous agent quests in the curriculum.",
      milestoneGoal: "Complete All 6 Quests",
      currentValue: Math.min(completedIds.length, 6),
      targetValue: 6,
      unit: "quests",
      isEarned: completedIds.length >= 6,
      progressPercent: Math.min(100, Math.round((completedIds.length / 6) * 100)),
      category: "curriculum",
      rarity: "legendary",
      iconName: "Trophy",
      xpBonus: 500,
      unlockedAt: getSavedUnlockedAt("curriculum-conqueror", completedIds.length >= 6),
      tips: "Finish every quest on the road to becoming a full AI engineer."
    }
  ];

  return badges;
}

export function getAchievementsSummary(badges: MilestoneBadge[]) {
  const total = badges.length;
  const earned = badges.filter((b) => b.isEarned).length;
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;

  // Find next closest milestone (in progress, highest progress % < 100)
  const inProgress = badges
    .filter((b) => !b.isEarned)
    .sort((a, b) => b.progressPercent - a.progressPercent);
  
  const nextMilestone = inProgress.length > 0 ? inProgress[0] : null;

  return {
    total,
    earned,
    percent,
    nextMilestone
  };
}
