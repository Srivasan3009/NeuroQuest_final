import { Achievement, SkillMastery, UserProfile, AppTheme, MascotRole } from "../types";
import { INITIAL_PROFILE, INITIAL_ACHIEVEMENTS, getLevelInfo } from "../data/gamification";
import { leaderboardService } from "./leaderboard";
import { socialService } from "./social";

const STORAGE_KEY = "neuroquest_learner_profile_v1";

export interface IDataStore {
  getUserProfile(): Promise<UserProfile>;
  saveUserProfile(profile: UserProfile): Promise<void>;
  completeQuest(questId: string, earnedXP: number, skillName: string): Promise<UserProfile>;
  unlockAchievement(achievementId: string): Promise<UserProfile>;
  updateStreak(): Promise<UserProfile>;
  setStreakDays(days: number): Promise<UserProfile>;
  resetProgress(): Promise<UserProfile>;
  addSparks(amount: number): Promise<UserProfile>;
  addXP(amount: number): Promise<UserProfile>;
  claimChest(chestId: string, rewardSparks: number, rewardXP: number): Promise<UserProfile>;
  setMascotRole(role: MascotRole): Promise<UserProfile>;
  setTheme(theme: AppTheme): Promise<UserProfile>;
  togglePlusSubscription(): Promise<UserProfile>;
  isCloudSynced(): boolean;
}

class StorageAdapter implements IDataStore {
  private inMemoryProfile: UserProfile | null = null;

  constructor() {}

  public isCloudSynced(): boolean {
    return true;
  }

  public async getUserProfile(): Promise<UserProfile> {
    if (this.inMemoryProfile) {
      return this.inMemoryProfile;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const rawCompleted = Array.isArray(parsed.completedQuestIds)
          ? parsed.completedQuestIds
          : Array.isArray(parsed.completedQuests)
          ? parsed.completedQuests.map((q: any) => (typeof q === "string" ? q : q?.questId)).filter(Boolean)
          : [];

        this.inMemoryProfile = {
          ...INITIAL_PROFILE,
          ...parsed,
          sparks: typeof parsed.sparks === "number" ? parsed.sparks : 0,
          openedChests: Array.isArray(parsed.openedChests) ? parsed.openedChests : [],
          mascotRole: parsed.mascotRole || "detective",
          isPlus: Boolean(parsed.isPlus),
          theme: parsed.theme === "cyber-dark" ? "neumorphic" : (parsed.theme || "neumorphic"),
          completedQuestIds: rawCompleted,
          inProgressQuestIds: Array.isArray(parsed.inProgressQuestIds) ? parsed.inProgressQuestIds : ["quest-1"],
          skills: Array.isArray(parsed.skills) && parsed.skills.length > 0
            ? parsed.skills.map((s: any) => ({
                name: s.name || s.skill || "AI Mastery",
                category: s.category || "General",
                points: typeof s.points === "number" ? s.points : 20,
                tier: s.tier || "Novice"
              }))
            : INITIAL_PROFILE.skills,
          // Ensure achievements array always has all default items merged
          achievements: INITIAL_ACHIEVEMENTS.map(initial => {
            const match = Array.isArray(parsed.achievements)
              ? parsed.achievements.find((a: any) => (typeof a === "string" ? a === initial.id : a?.id === initial.id))
              : null;
            if (match && typeof match === "object") {
              return { ...initial, ...match };
            } else if (match && typeof match === "string") {
              return { ...initial, unlockedAt: new Date().toISOString() };
            }
            return initial;
          })
        };
        return this.inMemoryProfile!;
      }
    } catch (e) {
      console.warn("Could not parse stored profile, reverting to initial profile", e);
    }

    this.inMemoryProfile = { ...INITIAL_PROFILE };
    await this.saveUserProfile(this.inMemoryProfile);
    return this.inMemoryProfile;
  }

  public async saveUserProfile(profile: UserProfile): Promise<void> {
    this.inMemoryProfile = profile;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      leaderboardService.syncUserStats(profile).catch(() => {});
    } catch (e) {
      console.error("Failed to persist user profile to local storage", e);
    }
  }

  public async completeQuest(questId: string, earnedXP: number, skillName: string): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const currentCompleted = profile.completedQuestIds || [];
    const isAlreadyCompleted = currentCompleted.includes(questId);

    const newXP = isAlreadyCompleted ? profile.xp : profile.xp + earnedXP;
    const levelInfo = getLevelInfo(newXP);

    const completedQuestIds = isAlreadyCompleted
      ? currentCompleted
      : [...currentCompleted, questId];

    const inProgressQuestIds = (profile.inProgressQuestIds || []).filter(id => id !== questId);

    // Update or increment skill points
    const currentSkills = profile.skills || INITIAL_PROFILE.skills;
    const updatedSkills: SkillMastery[] = currentSkills.map(s => {
      if (s.name.toLowerCase() === skillName.toLowerCase()) {
        const newPoints = Math.min(100, s.points + 25);
        let tier: SkillMastery["tier"] = "Novice";
        if (newPoints >= 80) tier = "Master";
        else if (newPoints >= 55) tier = "Specialist";
        else if (newPoints >= 30) tier = "Practitioner";
        return { ...s, points: newPoints, tier };
      }
      return s;
    });

    // Check achievement triggers
    const currentAchievements = profile.achievements || INITIAL_ACHIEVEMENTS;
    const updatedAchievements: Achievement[] = currentAchievements.map(a => {
      let shouldUnlock = false;
      if (a.id === "first-spark" && completedQuestIds.length >= 1) shouldUnlock = true;
      if (a.id === "boundary-breaker" && questId === "quest-2") shouldUnlock = true;
      if (a.id === "synaptic-sculptor" && questId === "quest-3") shouldUnlock = true;
      if (a.id === "embedding-alchemist" && questId === "quest-4") shouldUnlock = true;
      if (a.id === "autonomous-architect" && questId === "quest-5") shouldUnlock = true;
      if (a.id === "prompt-alchemist" && questId === "quest-6") shouldUnlock = true;

      if (shouldUnlock && !a.unlockedAt) {
        return { ...a, unlockedAt: new Date().toISOString() };
      }
      return a;
    });

    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXP,
      level: levelInfo.level,
      completedQuestIds,
      inProgressQuestIds,
      skills: updatedSkills,
      achievements: updatedAchievements,
      questScores: {
        ...profile.questScores,
        [questId]: {
          attempts: (profile.questScores[questId]?.attempts || 0) + 1,
          completedAt: new Date().toISOString()
        }
      }
    };

    await this.saveUserProfile(updatedProfile);

    // Broadcast real-time feed event for peers
    if (!isAlreadyCompleted) {
      socialService.postFeedItem({
        userId: profile.id || "you",
        userName: profile.fullName || "Cadet",
        userLetter: (profile.fullName?.charAt(0) || "C").toUpperCase(),
        type: "quest_complete",
        title: `Conquered '${skillName}' Quest! 🎯`,
        description: `Earned +${earnedXP} XP and advanced towards Neural Master.`,
        timestamp: "Just now",
        xpAwarded: earnedXP,
        sharedPayload: {
          stageName: skillName,
        },
      });

      if (levelInfo.level > profile.level) {
        socialService.postFeedItem({
          userId: profile.id || "you",
          userName: profile.fullName || "Cadet",
          userLetter: (profile.fullName?.charAt(0) || "C").toUpperCase(),
          type: "level_up",
          title: `Ranked up to Level ${levelInfo.level}! 🚀`,
          description: `Unlocked advanced neural architecture toolkits.`,
          timestamp: "Just now",
          xpAwarded: 250,
        });
      }
    }

    return updatedProfile;
  }

  public async unlockAchievement(achievementId: string): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const updatedAchievements = profile.achievements.map(a => {
      if (a.id === achievementId && !a.unlockedAt) {
        return { ...a, unlockedAt: new Date().toISOString() };
      }
      return a;
    });

    const updatedProfile = { ...profile, achievements: updatedAchievements };
    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  public async updateStreak(): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const today = new Date().toISOString().split("T")[0];
    if (profile.lastActiveDate === today) {
      return profile;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      streakDays: profile.streakDays + 1,
      lastActiveDate: today
    };
    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  public async setStreakDays(days: number): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const updatedProfile: UserProfile = {
      ...profile,
      streakDays: Math.max(0, days)
    };
    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  public async addSparks(amount: number): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const updated = {
      ...profile,
      sparks: Math.max(0, (profile.sparks || 0) + amount)
    };
    await this.saveUserProfile(updated);
    return updated;
  }

  public async claimChest(chestId: string, rewardSparks: number, rewardXP: number): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const opened = profile.openedChests || [];
    if (opened.includes(chestId)) return profile;

    const newXP = profile.xp + rewardXP;
    const levelInfo = getLevelInfo(newXP);

    const updated = {
      ...profile,
      openedChests: [...opened, chestId],
      sparks: (profile.sparks || 0) + rewardSparks,
      xp: newXP,
      level: levelInfo.level
    };
    await this.saveUserProfile(updated);
    return updated;
  }

  public async addXP(amount: number): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const newXP = (profile.xp || 0) + amount;
    const levelInfo = getLevelInfo(newXP);
    const updated = {
      ...profile,
      xp: newXP,
      level: levelInfo.level
    };
    await this.saveUserProfile(updated);
    return updated;
  }

  public async setMascotRole(role: MascotRole): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const updated = { ...profile, mascotRole: role };
    await this.saveUserProfile(updated);
    return updated;
  }

  public async setTheme(theme: AppTheme): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const updated = { ...profile, theme };
    await this.saveUserProfile(updated);
    return updated;
  }

  public async togglePlusSubscription(): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const updated = {
      ...profile,
      isPlus: !profile.isPlus,
      sparks: !profile.isPlus ? (profile.sparks || 0) + 200 : profile.sparks
    };
    await this.saveUserProfile(updated);
    return updated;
  }

  public async resetProgress(): Promise<UserProfile> {
    const reset: UserProfile = {
      ...INITIAL_PROFILE,
      sparks: 45,
      openedChests: [],
      completedQuestIds: [],
      inProgressQuestIds: ["quest-1"],
      xp: 0,
      level: 1,
      achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: null })),
      skills: INITIAL_PROFILE.skills.map(s => ({ ...s, points: 10, tier: "Novice" as const }))
    };
    await this.saveUserProfile(reset);
    return reset;
  }
}

export const dataStore: IDataStore = new StorageAdapter();
