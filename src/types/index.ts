export type StageId = string;

export type QuestStatus = "locked" | "available" | "in-progress" | "completed";

export type QuestPhase = "learn" | "concept-check" | "boss-challenge" | "reward";

export interface OptionItem {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface BiteSizedQACard {
  question: string;
  answer: string;
  analogy: string;
  badgeEmoji?: string;
}

export interface ConceptCheckQuestion {
  prompt: string;
  contextPill?: string;
  options: OptionItem[];
  encouragement: string;
}

export interface BossChallenge {
  title: string;
  scenario: string;
  question: string;
  options: OptionItem[];
  bossAvatar?: string;
  bossQuote?: string;
  victoryMessage: string;
  deepDiveExplanation: string;
}

export interface LearnSection {
  title: string;
  summary: string;
  qaCards: BiteSizedQACard[];
  keyConcepts: {
    term: string;
    definition: string;
  }[];
  contentMarkdown?: string;
  mentalModelDiagram?: {
    type: "flow" | "comparison" | "hierarchy";
    labels: string[];
    description: string;
  };
  proTip: string;
}

export interface InteractSection {
  title?: string;
  instruction?: string;
  widgetType?:
    | "decision-boundary"
    | "neuron-weights"
    | "token-embeddings"
    | "prompt-tuning"
    | "agent-loop";
  initialState?: Record<string, any>;
  guidanceNotes?: string[];
}

export interface SolveSection {
  title?: string;
  missionBrief?: string;
  targetObjective?: string;
  validationType?:
    | "accuracy-threshold"
    | "neuron-threshold"
    | "token-alignment"
    | "prompt-pass"
    | "agent-task-solved";
  criteria?: Record<string, any>;
  firstHint?: string;
  secondHint?: string;
}

export interface ProveSection {
  question: string;
  scenario: string;
  options: OptionItem[];
  deepDiveExplanation: string;
}

export interface Quest {
  id: string;
  stageId: StageId;
  title: string;
  slug: string;
  shortDescription: string;
  xpReward: number;
  estimatedMinutes: number;
  skillTag: string;
  badgeTitle?: string;
  learn: LearnSection;
  conceptCheck?: ConceptCheckQuestion;
  bossChallenge?: BossChallenge;
  interact?: InteractSection;
  solve?: SolveSection;
  prove?: ProveSection;
}

export interface Stage {
  id: StageId;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  skillsAcquired: string[];
  quests: Quest[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: string | null;
  category: "progression" | "mastery" | "experimentation" | "streak" | "curriculum" | "milestone";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  milestoneGoal: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  isEarned: boolean;
  progressPercent: number;
  category: "streaks" | "curriculum" | "mastery" | "milestones";
  rarity: "common" | "rare" | "epic" | "legendary";
  iconName: string;
  xpBonus: number;
  unlockedAt: string | null;
  tips?: string;
}

export interface SkillMastery {
  name: string;
  category: string;
  points: number; // 0 to 100
  tier: "Novice" | "Practitioner" | "Specialist" | "Master";
}

export type AppTheme =
  | "neumorphic"
  | "riso-pop"
  | "warm-editorial"
  | "minimal-light"
  | "obsidian-noir"
  | "obsidian-gold"
  | "neon-matrix"
  | "cyber-dark";

export type MascotRole = "detective" | "focus" | "builder" | "data" | "sage" | "architect";

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  lessonsCount: number;
  icon: string;
  stageIds: StageId[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  age?: number;
  avatarUrl: string;
  level: number;
  xp: number;
  sparks: number;
  streakDays: number;
  lastActiveDate: string;
  currentStageId: StageId;
  completedQuestIds: string[];
  inProgressQuestIds: string[];
  openedChests: string[];
  mascotRole: MascotRole;
  isPlus: boolean;
  theme: AppTheme;
  questScores: Record<string, { attempts: number; completedAt: string }>;
  skills: SkillMastery[];
  achievements: Achievement[];
  joinedDate: string;
  authProvider: "google" | "supabase_email" | "firebase_email" | "firebase" | "guest" | string;
}

export type TutorDifficulty = "beginner" | "intermediate" | "advanced";
export type TutorMode = "explain" | "hint" | "misconceptions" | "practice" | "chat";

export interface TutorChatMessage {
  id: string;
  sender: "user" | "neuro-ai";
  text: string;
  timestamp: string;
  mode?: TutorMode;
  difficulty?: TutorDifficulty;
  source?: "pedagogical_engine" | "fallback";
}
