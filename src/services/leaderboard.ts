import { supabase, isSupabaseConfigured } from "./supabase";
import { UserProfile } from "../types";

export interface RealLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  avatarLetter: string;
  tier: "DIAMOND" | "PLATINUM" | "GOLD" | "BRONZE";
  sparks: number;
  xp: number;
  level: number;
  questsCompletedCount: number;
  isCurrentUser: boolean;
  lastActive?: string;
}

export function calculateTier(level: number, sparks: number): "DIAMOND" | "PLATINUM" | "GOLD" | "BRONZE" {
  if (level >= 8 || sparks >= 2500) return "DIAMOND";
  if (level >= 5 || sparks >= 1200) return "PLATINUM";
  if (level >= 3 || sparks >= 500) return "GOLD";
  return "BRONZE";
}

const LOCAL_USERS_REGISTRY_KEY = "neuroquest_registered_users_registry_v1";

const DISALLOWED_MOCK_HANDLES = new Set([
  "alexchen",
  "alex.chen",
  "alex_chen",
  "alex chen",
  "alex.learner@neuroquest.edu",
  "learner-usr-101",
]);

function isMockCadet(id?: string, name?: string, username?: string, email?: string): boolean {
  if (id && DISALLOWED_MOCK_HANDLES.has(id.toLowerCase())) return true;
  if (name && DISALLOWED_MOCK_HANDLES.has(name.toLowerCase())) return true;
  if (username && DISALLOWED_MOCK_HANDLES.has(username.toLowerCase())) return true;
  if (email && DISALLOWED_MOCK_HANDLES.has(email.toLowerCase())) return true;
  return false;
}

export class LeaderboardService {
  private static instance: LeaderboardService;

  private constructor() {}

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * Sync current active user's stats to Cloud database (Supabase) and local registry
   */
  public async syncUserStats(user: UserProfile): Promise<void> {
    if (!user) return;
    if (isMockCadet(user.id, user.fullName, user.username, user.email)) return;

    const userId = user.id || user.email || `cadet_${user.username || "me"}`;

    // 1. Save to local real-users registry
    try {
      const raw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
      const registry: Record<string, Partial<UserProfile>> = raw ? JSON.parse(raw) : {};

      // Filter out any mock accounts from registry
      for (const k of Object.keys(registry)) {
        if (isMockCadet(k, registry[k]?.fullName, registry[k]?.username, registry[k]?.email)) {
          delete registry[k];
        }
      }

      registry[userId] = {
        id: userId,
        fullName: user.fullName || "Cadet",
        username: user.username || user.fullName?.toLowerCase().replace(/\s+/g, "_") || "cadet",
        email: user.email,
        avatarUrl: user.avatarUrl || "",
        sparks: user.sparks ?? 0,
        xp: user.xp ?? 0,
        level: user.level ?? 1,
        completedQuestIds: user.completedQuestIds || [],
        lastActiveDate: new Date().toISOString(),
      };

      localStorage.setItem(LOCAL_USERS_REGISTRY_KEY, JSON.stringify(registry));
    } catch (e) {
      console.warn("Could not save to local user registry", e);
    }

    // 2. Sync to Supabase profiles table
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: userId,
          full_name: user.fullName || "Cadet",
          username: user.username || (user.fullName ? user.fullName.toLowerCase().replace(/\s+/g, "_") : "cadet"),
          avatar_url: user.avatarUrl || "",
          sparks: user.sparks ?? 0,
          xp: user.xp ?? 0,
          level: user.level ?? 1,
          completed_quests_count: (user.completedQuestIds || []).length,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("profiles")
          .upsert(payload, { onConflict: "id" });

        if (error) {
          console.warn("Supabase upsert note:", error.message || error);
        }
      } catch (err) {
        console.info("Cloud leaderboard sync note:", err);
      }
    }
  }

  /**
   * Fetch rankings: strictly 2 users as requested
   * #1 Shanthi: 120 Sparks, Level 2, 3 Quests
   * #2 Srivasan: 70 Sparks, Level 1, 1 Quest
   */
  public async getRealRankings(
    currentUser: UserProfile,
    sortBy: "sparks" | "xp" | "quests" = "sparks"
  ): Promise<{ rankings: RealLeaderboardEntry[]; isCloudSource: boolean }> {
    const isCurrentUserShanthi =
      (currentUser.fullName && currentUser.fullName.toLowerCase().includes("shanthi")) ||
      (currentUser.username && currentUser.username.toLowerCase().includes("shanth")) ||
      (currentUser.email && currentUser.email.toLowerCase().includes("shanth"));

    const isCurrentUserSrivasan =
      (currentUser.fullName && currentUser.fullName.toLowerCase().includes("srivasan")) ||
      (currentUser.username && currentUser.username.toLowerCase().includes("srivasan")) ||
      (currentUser.email && currentUser.email.toLowerCase().includes("srivasan"));

    const shanthiEntry: RealLeaderboardEntry = {
      id: "cadet_shanthi",
      rank: 1,
      name: "Shanthi",
      username: "shanthe2021",
      email: "shanthe2021@gmail.com",
      avatarLetter: "S",
      avatarUrl: isCurrentUserShanthi ? currentUser.avatarUrl : undefined,
      tier: "BRONZE",
      sparks: 120,
      xp: 850,
      level: 2,
      questsCompletedCount: 3,
      isCurrentUser: isCurrentUserShanthi || (!isCurrentUserSrivasan),
      lastActive: "Just now",
    };

    const srivasanEntry: RealLeaderboardEntry = {
      id: "cadet_srivasan",
      rank: 2,
      name: "Srivasan",
      username: "srivasan3009",
      email: "srivasan3009@gmail.com",
      avatarLetter: "S",
      avatarUrl: isCurrentUserSrivasan ? currentUser.avatarUrl : undefined,
      tier: "BRONZE",
      sparks: 70,
      xp: 520,
      level: 1,
      questsCompletedCount: 1,
      isCurrentUser: Boolean(isCurrentUserSrivasan),
      lastActive: "Recently",
    };

    const list = [shanthiEntry, srivasanEntry];

    // Sort according to metric
    list.sort((a, b) => {
      if (sortBy === "xp") return b.xp - a.xp;
      if (sortBy === "quests") return b.questsCompletedCount - a.questsCompletedCount;
      return b.sparks - a.sparks;
    });

    const rankedList = list.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return {
      rankings: rankedList,
      isCloudSource: false,
    };
  }
}

export const leaderboardService = LeaderboardService.getInstance();

