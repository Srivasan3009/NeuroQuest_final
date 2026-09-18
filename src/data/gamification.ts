import { Achievement, SkillMastery, UserProfile } from "../types";

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-spark",
    title: "First Spark",
    description: "Complete your initial quest on the AI learning journey.",
    iconName: "Zap",
    unlockedAt: null,
    category: "progression",
    rarity: "common"
  },
  {
    id: "boundary-breaker",
    title: "Boundary Breaker",
    description: "Achieve ≥95% linear classification on noisy empirical data.",
    iconName: "Crosshair",
    unlockedAt: null,
    category: "mastery",
    rarity: "rare"
  },
  {
    id: "synaptic-sculptor",
    title: "Synaptic Sculptor",
    description: "Solve a boolean logic classification problem using an artificial neuron.",
    iconName: "Network",
    unlockedAt: null,
    category: "mastery",
    rarity: "rare"
  },
  {
    id: "embedding-alchemist",
    title: "Embedding Alchemist",
    description: "Navigate high-dimensional semantic vector spaces and subword tokens.",
    iconName: "Layers",
    unlockedAt: null,
    category: "experimentation",
    rarity: "epic"
  },
  {
    id: "autonomous-architect",
    title: "Autonomous Architect",
    description: "Execute a complete multi-step ReAct agent observation-action cycle.",
    iconName: "Bot",
    unlockedAt: null,
    category: "mastery",
    rarity: "epic"
  },
  {
    id: "prompt-alchemist",
    title: "Prompt Alchemist",
    description: "Calibrate low-temperature system directives for enterprise JSON output.",
    iconName: "Sparkles",
    unlockedAt: null,
    category: "experimentation",
    rarity: "legendary"
  },
  {
    id: "socratic-disciple",
    title: "Socratic Disciple",
    description: "Engage in 3 interactive mentoring dialogues with Neuro AI Tutor.",
    iconName: "MessageSquare",
    unlockedAt: null,
    category: "experimentation",
    rarity: "common"
  }
];

export const ALL_ACHIEVEMENTS = INITIAL_ACHIEVEMENTS;

export const INITIAL_SKILLS: SkillMastery[] = [
  { name: "Paradigm Modeling", category: "Foundations", points: 30, tier: "Novice" },
  { name: "Decision Boundaries", category: "Machine Learning", points: 25, tier: "Novice" },
  { name: "Neuron Computation", category: "Neural Networks", points: 20, tier: "Novice" },
  { name: "Token Mechanics", category: "Generative AI", points: 15, tier: "Novice" },
  { name: "Agent Loops", category: "AI Agents", points: 10, tier: "Novice" },
  { name: "Prompt Calibration", category: "Production AI", points: 20, tier: "Novice" }
];

export const INITIAL_PROFILE: UserProfile = {
  id: "guest-cadet",
  email: "",
  fullName: "Cadet",
  username: "cadet",
  age: 20,
  avatarUrl: "",
  level: 1,
  xp: 0,
  sparks: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
  currentStageId: "ai-foundations",
  completedQuestIds: [],
  inProgressQuestIds: ["quest-1"],
  openedChests: [],
  mascotRole: "detective",
  isPlus: false,
  theme: "neumorphic",
  questScores: {},
  skills: INITIAL_SKILLS,
  achievements: INITIAL_ACHIEVEMENTS,
  joinedDate: "Recently",
  authProvider: "guest"
};

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  progressPercent: number;
  currentLevelXP: number;
  levelSpanXP: number;
}

const LEVEL_TIERS = [
  { level: 1, title: "Novice Explorer", minXP: 0, maxXP: 150 },
  { level: 2, title: "Pattern Seeker", minXP: 150, maxXP: 350 },
  { level: 3, title: "Neural Apprentice", minXP: 350, maxXP: 600 },
  { level: 4, title: "Transformer Engineer", minXP: 600, maxXP: 950 },
  { level: 5, title: "Autonomous Architect", minXP: 950, maxXP: 1400 },
  { level: 6, title: "AI Grandmaster", minXP: 1400, maxXP: 2500 }
];

export function getLevelInfo(totalXP: number): LevelInfo {
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    const tier = LEVEL_TIERS[i];
    if (totalXP < tier.maxXP || i === LEVEL_TIERS.length - 1) {
      const levelSpanXP = tier.maxXP - tier.minXP;
      const currentLevelXP = Math.max(0, totalXP - tier.minXP);
      const progressPercent = Math.min(100, Math.round((currentLevelXP / levelSpanXP) * 100));
      return {
        level: tier.level,
        title: tier.title,
        minXP: tier.minXP,
        maxXP: tier.maxXP,
        progressPercent,
        currentLevelXP,
        levelSpanXP
      };
    }
  }
  return {
    level: 6,
    title: "AI Grandmaster",
    minXP: 1400,
    maxXP: 2500,
    progressPercent: 100,
    currentLevelXP: 1100,
    levelSpanXP: 1100
  };
}
