import { supabase, isSupabaseConfigured } from "./supabase";
import { UserProfile } from "../types";

export interface RealLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string;
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

    // 1. Save to local real-users registry
    try {
      const raw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
      const registry: Record<string, Partial<UserProfile>> = raw ? JSON.parse(raw) : {};
      
      const userId = user.id || user.email || "local-user";
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

    // 2. Sync to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: user.id,
          full_name: user.fullName,
          username: user.username,
          avatar_url: user.avatarUrl,
          sparks: user.sparks,
          xp: user.xp,
          level: user.level,
          completed_quests_count: (user.completedQuestIds || []).length,
          updated_at: new Date().toISOString(),
        };

        // Try upserting to profiles table
        await supabase
          .from("profiles")
          .upsert(payload, { onConflict: "id" });
      } catch (err) {
        // Supabase table may have custom schema or RLS; gracefully fall back
        console.info("Cloud leaderboard sync note:", err);
      }
    }
  }

  /**
   * Fetch real users data from Supabase and registered learners
   */
  public async getRealRankings(
    currentUser: UserProfile,
    sortBy: "sparks" | "xp" | "quests" = "sparks"
  ): Promise<{ rankings: RealLeaderboardEntry[]; isCloudSource: boolean }> {
    const usersMap = new Map<string, RealLeaderboardEntry>();
    let isCloud = false;

    // 1. Add current user as base real entry
    const currentTier = calculateTier(currentUser.level || 1, currentUser.sparks || 0);
    const currentName = currentUser.fullName || currentUser.username || "You";
    const currentLetter = (currentName.charAt(0) || "Y").toUpperCase();

    usersMap.set(currentUser.id || "current-user", {
      id: currentUser.id || "current-user",
      rank: 1,
      name: currentName,
      username: currentUser.username || "you",
      avatarUrl: currentUser.avatarUrl,
      avatarLetter: currentLetter,
      tier: currentTier,
      sparks: currentUser.sparks ?? 0,
      xp: currentUser.xp ?? 0,
      level: currentUser.level ?? 1,
      questsCompletedCount: (currentUser.completedQuestIds || []).length,
      isCurrentUser: true,
      lastActive: currentUser.lastActiveDate,
    });

    // 2. Fetch from Supabase real profiles table
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, sparks, xp, level, completed_quests_count, updated_at")
          .order(sortBy === "xp" ? "xp" : "sparks", { ascending: false })
          .limit(50);

        if (!error && Array.isArray(data) && data.length > 0) {
          isCloud = true;
          for (const row of data) {
            if (!row || !row.id) continue;
            const isMe = row.id === currentUser.id || (row.username && row.username === currentUser.username);
            const name = row.full_name || row.username || (isMe ? currentName : "Cadet");
            const sparks = typeof row.sparks === "number" ? row.sparks : (isMe ? currentUser.sparks : 0);
            const xp = typeof row.xp === "number" ? row.xp : (isMe ? currentUser.xp : 0);
            const level = typeof row.level === "number" ? row.level : (isMe ? currentUser.level : 1);
            const questsCount = typeof row.completed_quests_count === "number" 
              ? row.completed_quests_count 
              : (isMe ? (currentUser.completedQuestIds || []).length : 0);

            usersMap.set(row.id, {
              id: row.id,
              rank: 0,
              name: isMe ? currentName : name,
              username: row.username || (isMe ? currentUser.username || "you" : "cadet"),
              avatarUrl: isMe ? currentUser.avatarUrl : row.avatar_url,
              avatarLetter: (name.charAt(0) || "C").toUpperCase(),
              tier: calculateTier(level, sparks),
              sparks: isMe ? (currentUser.sparks ?? sparks) : sparks,
              xp: isMe ? (currentUser.xp ?? xp) : xp,
              level: isMe ? (currentUser.level ?? level) : level,
              questsCompletedCount: isMe ? (currentUser.completedQuestIds || []).length : questsCount,
              isCurrentUser: isMe,
              lastActive: row.updated_at,
            });
          }
        }
      } catch (err) {
        console.warn("Could not query Supabase profiles table:", err);
      }
    }

    // 3. Read other registered local/session accounts from registry
    try {
      const raw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
      if (raw) {
        const registry: Record<string, Partial<UserProfile>> = JSON.parse(raw);
        for (const [id, userRecord] of Object.entries(registry)) {
          if (!userRecord || !id) continue;
          const isMe = id === currentUser.id || userRecord.email === currentUser.email;
          if (usersMap.has(id) && isCloud) continue; // prefer cloud if available

          const name = userRecord.fullName || userRecord.username || (isMe ? currentName : "Cadet");
          const sparks = isMe ? (currentUser.sparks ?? 0) : (userRecord.sparks ?? 0);
          const xp = isMe ? (currentUser.xp ?? 0) : (userRecord.xp ?? 0);
          const level = isMe ? (currentUser.level ?? 1) : (userRecord.level ?? 1);
          const questsCount = isMe 
            ? (currentUser.completedQuestIds || []).length 
            : (userRecord.completedQuestIds || []).length;

          usersMap.set(id, {
            id,
            rank: 0,
            name: isMe ? currentName : name,
            username: userRecord.username || (isMe ? currentUser.username || "you" : "cadet"),
            avatarUrl: isMe ? currentUser.avatarUrl : userRecord.avatarUrl,
            avatarLetter: (name.charAt(0) || "C").toUpperCase(),
            tier: calculateTier(level, sparks),
            sparks,
            xp,
            level,
            questsCompletedCount: questsCount,
            isCurrentUser: isMe,
            lastActive: userRecord.lastActiveDate,
          });
        }
      }
    } catch {
      // Ignore
    }

    // 4. Sort real entries strictly by requested metric
    const list = Array.from(usersMap.values());
    list.sort((a, b) => {
      if (sortBy === "xp") {
        if (b.xp !== a.xp) return b.xp - a.xp;
        return b.sparks - a.sparks;
      }
      if (sortBy === "quests") {
        if (b.questsCompletedCount !== a.questsCompletedCount) {
          return b.questsCompletedCount - a.questsCompletedCount;
        }
        return b.sparks - a.sparks;
      }
      // default: sparks
      if (b.sparks !== a.sparks) return b.sparks - a.sparks;
      return b.xp - a.xp;
    });

    // 5. Assign real ranks (1, 2, 3...)
    const rankedList: RealLeaderboardEntry[] = list.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return {
      rankings: rankedList,
      isCloudSource: isCloud,
    };
  }
}

export const leaderboardService = LeaderboardService.getInstance();
