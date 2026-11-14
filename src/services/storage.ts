import { Achievement, SkillMastery, UserProfile, AppTheme, MascotRole } from "../types";
import { INITIAL_PROFILE, INITIAL_ACHIEVEMENTS, getLevelInfo } from "../data/gamification";
import { leaderboardService } from "./leaderboard";
import { socialService } from "./social";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const STORAGE_KEY = "neuroquest_learner_profile_v1";

const VALID_THEMES = new Set<AppTheme>([
  "neumorphic",
  "riso-pop",
  "warm-editorial",
  "minimal-light",
  "obsidian-noir",
  "obsidian-gold",
  "neon-matrix",
  "cyber-dark",
]);

const VALID_MASCOTS = new Set<MascotRole>([
  "detective",
  "focus",
  "builder",
  "data",
  "sage",
  "architect",
]);

const BRANCH_1_KEYS = new Set([
  "level",
  "xp",
  "sparks",
  "streakDays",
  "lastActiveDate",
  "currentStageId",
  "completedQuestIds",
  "inProgressQuestIds",
  "openedChests",
  "questScores",
  "skills",
  "achievements",
]);

const BRANCH_2_KEYS = new Set([
  "email",
  "fullName",
  "username",
  "age",
  "avatarUrl",
  "mascotRole",
  "isPlus",
  "sparks",
  "theme",
  "authProvider",
  "lastActiveDate",
]);

function getUserStorageKey(uid?: string | null): string {
  return uid ? `${STORAGE_KEY}_${uid}` : STORAGE_KEY;
}

function normalizeProfile(parsed: Partial<UserProfile>, uid?: string): UserProfile {
  const rawCompleted = Array.isArray(parsed.completedQuestIds)
    ? parsed.completedQuestIds
    : Array.isArray((parsed as any).completedQuests)
    ? (parsed as any).completedQuests
        .map((q: any) => (typeof q === "string" ? q : q?.questId))
        .filter(Boolean)
    : [];

  const rawTheme = parsed.theme === "cyber-dark" ? "neumorphic" : parsed.theme;
  const theme: AppTheme = rawTheme && VALID_THEMES.has(rawTheme) ? rawTheme : "neumorphic";
  const mascotRole: MascotRole =
    parsed.mascotRole && VALID_MASCOTS.has(parsed.mascotRole) ? parsed.mascotRole : "detective";

  return {
    ...INITIAL_PROFILE,
    ...parsed,
    id: uid || parsed.id || INITIAL_PROFILE.id,
    email: typeof parsed.email === "string" ? parsed.email : "",
    fullName: typeof parsed.fullName === "string" && parsed.fullName.trim() ? parsed.fullName.trim() : "Cadet",
    username: typeof parsed.username === "string" && parsed.username.trim() ? parsed.username.trim() : "cadet",
    avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : "",
    level: typeof parsed.level === "number" ? Math.max(1, parsed.level) : 1,
    xp: typeof parsed.xp === "number" ? Math.max(0, parsed.xp) : 0,
    sparks: typeof parsed.sparks === "number" ? Math.max(0, parsed.sparks) : 0,
    streakDays: typeof parsed.streakDays === "number" ? Math.max(0, parsed.streakDays) : 1,
    lastActiveDate:
      typeof parsed.lastActiveDate === "string" && parsed.lastActiveDate
        ? parsed.lastActiveDate
        : new Date().toISOString().split("T")[0],
    currentStageId:
      typeof parsed.currentStageId === "string" && parsed.currentStageId
        ? parsed.currentStageId
        : INITIAL_PROFILE.currentStageId,
    openedChests: Array.isArray(parsed.openedChests) ? parsed.openedChests : [],
    mascotRole,
    isPlus: Boolean(parsed.isPlus),
    theme,
    completedQuestIds: rawCompleted,
    inProgressQuestIds: Array.isArray(parsed.inProgressQuestIds) ? parsed.inProgressQuestIds : ["quest-1"],
    questScores: parsed.questScores && typeof parsed.questScores === "object" ? parsed.questScores : {},
    skills:
      Array.isArray(parsed.skills) && parsed.skills.length > 0
        ? parsed.skills.map((s: any) => ({
            name: s.name || s.skill || "AI Mastery",
            category: s.category || "General",
            points: typeof s.points === "number" ? s.points : 20,
            tier: s.tier || "Novice",
          }))
        : INITIAL_PROFILE.skills,
    achievements: INITIAL_ACHIEVEMENTS.map((initial) => {
      const match = Array.isArray(parsed.achievements)
        ? parsed.achievements.find((a: any) =>
            typeof a === "string" ? a === initial.id : a?.id === initial.id
          )
        : null;
      if (match && typeof match === "object") {
        return { ...initial, ...match };
      } else if (match && typeof match === "string") {
        return { ...initial, unlockedAt: new Date().toISOString() };
      }
      return initial;
    }),
    joinedDate: typeof parsed.joinedDate === "string" && parsed.joinedDate ? parsed.joinedDate : "Recently",
    authProvider: typeof parsed.authProvider === "string" && parsed.authProvider ? parsed.authProvider : "google",
  };
}

function sanitizeUserProfileForFirestore(profile: UserProfile, uid: string): Record<string, any> {
  const safeTheme: AppTheme = VALID_THEMES.has(profile.theme) ? profile.theme : "neumorphic";
  const safeMascot: MascotRole = VALID_MASCOTS.has(profile.mascotRole) ? profile.mascotRole : "detective";

  const payload: Record<string, any> = {
    id: uid.slice(0, 128),
    email: (profile.email || "").slice(0, 254),
    fullName: (profile.fullName || "Cadet").trim().slice(0, 100) || "Cadet",
    username: (profile.username || "cadet").trim().slice(0, 50) || "cadet",
    avatarUrl: (profile.avatarUrl || "").slice(0, 200000),
    level: Math.min(100, Math.max(1, Math.round(profile.level || 1))),
    xp: Math.min(10000000, Math.max(0, Math.round(profile.xp || 0))),
    sparks: Math.min(10000000, Math.max(0, Math.round(profile.sparks || 0))),
    streakDays: Math.min(36500, Math.max(0, Math.round(profile.streakDays ?? 1))),
    lastActiveDate: (profile.lastActiveDate || new Date().toISOString().split("T")[0]).slice(0, 32),
    currentStageId: (profile.currentStageId || "ai-foundations").slice(0, 64),
    completedQuestIds: (profile.completedQuestIds || [])
      .filter((q): q is string => typeof q === "string")
      .map((q) => q.slice(0, 64))
      .slice(0, 200),
    inProgressQuestIds: (profile.inProgressQuestIds || [])
      .filter((q): q is string => typeof q === "string")
      .map((q) => q.slice(0, 64))
      .slice(0, 50),
    openedChests: (profile.openedChests || [])
      .filter((c): c is string => typeof c === "string")
      .map((c) => c.slice(0, 64))
      .slice(0, 100),
    mascotRole: safeMascot,
    isPlus: Boolean(profile.isPlus),
    theme: safeTheme,
    questScores: profile.questScores || {},
    skills: (profile.skills || INITIAL_PROFILE.skills).slice(0, 50),
    achievements: (profile.achievements || INITIAL_ACHIEVEMENTS).slice(0, 100),
    joinedDate: (profile.joinedDate || "Recently").slice(0, 64),
    authProvider: (profile.authProvider || "google").slice(0, 32),
  };

  if (typeof profile.age === "number" && !isNaN(profile.age) && profile.age >= 1 && profile.age <= 150) {
    payload.age = Math.round(profile.age);
  }

  return payload;
}

export interface IDataStore {
  getUserProfile(): Promise<UserProfile>;
  loadUserProfileFromCloud(uid: string): Promise<UserProfile | null>;
  saveUserProfile(profile: UserProfile): Promise<void>;
  clearInMemoryProfile(): void;
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
  private writeQueue: Promise<void> = Promise.resolve();

  constructor() {}

  private enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
    const task = this.writeQueue.then(fn);
    this.writeQueue = task.then(
      () => undefined,
      () => undefined
    );
    return task;
  }

  public isCloudSynced(): boolean {
    return Boolean(auth.currentUser);
  }

  public clearInMemoryProfile(): void {
    this.inMemoryProfile = null;
  }

  public async loadUserProfileFromCloud(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    const userRef = doc(db, "users", uid);
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        return null;
      }
      const data = snap.data() as Partial<UserProfile>;
      const hydrated = normalizeProfile(data, uid);
      this.inMemoryProfile = hydrated;
      this.persistLocal(hydrated, uid);
      return hydrated;
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("permission")) {
        handleFirestoreError(error, OperationType.GET, path);
      }
      console.warn("Could not load user profile from Firestore:", error);
      return null;
    }
  }

  private persistLocal(profile: UserProfile, uid?: string | null) {
    try {
      const serialized = JSON.stringify(profile);
      localStorage.setItem(getUserStorageKey(uid), serialized);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.error("Failed to persist user profile to local storage", e);
    }
  }

  public async getUserProfile(): Promise<UserProfile> {
    const currentUid = auth.currentUser?.uid;

    if (this.inMemoryProfile && (!currentUid || this.inMemoryProfile.id === currentUid)) {
      return this.inMemoryProfile;
    }

    if (currentUid) {
      const cloudProfile = await this.loadUserProfileFromCloud(currentUid);
      if (cloudProfile) {
        return cloudProfile;
      }
    }

    try {
      const stored =
        (currentUid ? localStorage.getItem(getUserStorageKey(currentUid)) : null) ||
        localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = normalizeProfile(parsed, currentUid || undefined);
        this.inMemoryProfile = normalized;
        return normalized;
      }
    } catch (e) {
      console.warn("Could not parse stored profile, reverting to initial profile", e);
    }

    this.inMemoryProfile = { ...INITIAL_PROFILE, id: currentUid || INITIAL_PROFILE.id };
    this.persistLocal(this.inMemoryProfile, currentUid);
    return this.inMemoryProfile;
  }

  public async saveUserProfile(profile: UserProfile): Promise<void> {
    return this.enqueueWrite(() => this.performSaveUserProfile(profile));
  }

  private async performSaveUserProfile(profile: UserProfile): Promise<void> {
    const currentUser = auth.currentUser;
    const uid = currentUser?.uid;
    const normalized = normalizeProfile(profile, uid || profile.id);
    this.inMemoryProfile = normalized;
    this.persistLocal(normalized, uid);

    if (currentUser && uid) {
      const path = `users/${uid}`;
      const userRef = doc(db, "users", uid);
      const sanitized = sanitizeUserProfileForFirestore(normalized, uid);

      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const existingData = snap.data() || {};
          const diffFields: Record<string, any> = {};
          for (const [key, val] of Object.entries(sanitized)) {
            if (key === "id") continue;
            if (JSON.stringify(existingData[key]) !== JSON.stringify(val)) {
              diffFields[key] = val;
            }
          }

          if (Object.keys(diffFields).length > 0) {
            const keys = Object.keys(diffFields);
            const fitsBranch1 = keys.every((k) => BRANCH_1_KEYS.has(k));
            const fitsBranch2 = keys.every((k) => BRANCH_2_KEYS.has(k));

            if (fitsBranch1 || fitsBranch2) {
              await updateDoc(userRef, {
                ...diffFields,
                updatedAt: serverTimestamp(),
              });
            } else {
              // Split cleanly across action branches if a combined update occurs
              const branch1Payload: Record<string, any> = {};
              const branch2Payload: Record<string, any> = {};
              for (const k of keys) {
                if (BRANCH_1_KEYS.has(k)) {
                  branch1Payload[k] = diffFields[k];
                } else if (BRANCH_2_KEYS.has(k)) {
                  branch2Payload[k] = diffFields[k];
                }
              }
              if (Object.keys(branch2Payload).length > 0) {
                await updateDoc(userRef, {
                  ...branch2Payload,
                  updatedAt: serverTimestamp(),
                });
              }
              if (Object.keys(branch1Payload).length > 0) {
                await updateDoc(userRef, {
                  ...branch1Payload,
                  updatedAt: serverTimestamp(),
                });
              }
            }
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }

      leaderboardService.syncUserStats(normalized).catch((err) => {
        console.warn("Leaderboard sync warning:", err);
      });
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

    const inProgressQuestIds = (profile.inProgressQuestIds || []).filter((id) => id !== questId);

    const currentSkills = profile.skills || INITIAL_PROFILE.skills;
    const updatedSkills: SkillMastery[] = currentSkills.map((s) => {
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

    const currentAchievements = profile.achievements || INITIAL_ACHIEVEMENTS;
    const updatedAchievements: Achievement[] = currentAchievements.map((a) => {
      let shouldUnlock = false;
      if ((a.id === "first-quest" || a.id === "first-spark") && completedQuestIds.length >= 1) shouldUnlock = true;
      if ((a.id === "week-streak" || a.id === "streak-7") && profile.streakDays >= 7) shouldUnlock = true;
      if (
        (a.id === "neural-explorer" || a.id === "synaptic-sculptor") &&
        (questId === "quest-3" || questId.includes("neural") || completedQuestIds.length >= 2)
      ) {
        shouldUnlock = true;
      }
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
          completedAt: new Date().toISOString(),
        },
      },
    };

    await this.saveUserProfile(updatedProfile);

    if (!isAlreadyCompleted) {
      socialService.postFeedItem({
        userId: profile.id || "you",
        userName: profile.fullName || "Cadet",
        userLetter: (profile.fullName?.charAt(0) || "C").toUpperCase(),
        type: "quest_complete",
        title: `Conquered '${skillName}' Quest!`,
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
          title: `Ranked up to Level ${levelInfo.level}!`,
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
    const updatedAchievements = profile.achievements.map((a) => {
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
      lastActiveDate: today,
    };
    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  public async setStreakDays(days: number): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const streakDays = Math.max(0, days);
    const updatedAchievements = (profile.achievements || INITIAL_ACHIEVEMENTS).map((a) => {
      if ((a.id === "week-streak" || a.id === "streak-7") && streakDays >= 7 && !a.unlockedAt) {
        return { ...a, unlockedAt: new Date().toISOString() };
      }
      return a;
    });

    const updatedProfile: UserProfile = {
      ...profile,
      streakDays,
      achievements: updatedAchievements,
    };
    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  public async addSparks(amount: number): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const updated = {
      ...profile,
      sparks: Math.max(0, (profile.sparks || 0) + amount),
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
      level: levelInfo.level,
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
      level: levelInfo.level,
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
      sparks: !profile.isPlus ? (profile.sparks || 0) + 200 : profile.sparks,
    };
    await this.saveUserProfile(updated);
    return updated;
  }

  public async resetProgress(): Promise<UserProfile> {
    const current = await this.getUserProfile();
    const reset: UserProfile = {
      ...current,
      sparks: 45,
      openedChests: [],
      completedQuestIds: [],
      inProgressQuestIds: ["quest-1"],
      xp: 0,
      level: 1,
      questScores: {},
      achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlockedAt: null })),
      skills: INITIAL_PROFILE.skills.map((s) => ({ ...s, points: 10, tier: "Novice" as const })),
    };

    const currentUser = auth.currentUser;
    const uid = currentUser?.uid;
    this.inMemoryProfile = reset;
    this.persistLocal(reset, uid);

    if (currentUser && uid) {
      await this.enqueueWrite(async () => {
        const path = `users/${uid}`;
        const userRef = doc(db, "users", uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            const sanitized = sanitizeUserProfileForFirestore(reset, uid);
            await setDoc(userRef, {
              ...sanitized,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            await updateDoc(userRef, {
              sparks: reset.sparks,
              openedChests: reset.openedChests,
              completedQuestIds: reset.completedQuestIds,
              inProgressQuestIds: reset.inProgressQuestIds,
              xp: reset.xp,
              level: reset.level,
              questScores: reset.questScores,
              achievements: reset.achievements,
              skills: reset.skills,
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }
      });
      leaderboardService.syncUserStats(reset).catch(() => {});
    }

    return reset;
  }
}

export const dataStore: IDataStore = new StorageAdapter();
