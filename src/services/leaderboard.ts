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

    const userId = user.id || user.email || `cadet_${user.username || "me"}`;

    // 1. Save to local real-users registry
    try {
      const raw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
      const registry: Record<string, Partial<UserProfile>> = raw ? JSON.parse(raw) : {};

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
          id: userId,
          full_name: user.fullName || "Cadet",
          username: user.username || "cadet",
          avatar_url: user.avatarUrl || "",
          sparks: user.sparks ?? 0,
          xp: user.xp ?? 0,
          level: user.level ?? 1,
          completed_quests_count: (user.completedQuestIds || []).length,
          updated_at: new Date().toISOString(),
        };

        await supabase
          .from("profiles")
          .upsert(payload, { onConflict: "id" });
      } catch (err) {
        console.info("Cloud leaderboard sync note:", err);
      }
    }
  }

  /**
   * Fetch real users data strictly from Supabase and local storage registry
   */
  public async getRealRankings(
    currentUser: UserProfile,
    sortBy: "sparks" | "xp" | "quests" = "sparks"
  ): Promise<{ rankings: RealLeaderboardEntry[]; isCloudSource: boolean }> {
    const usersMap = new Map<string, RealLeaderboardEntry>();
    let isCloud = false;

    // 1. Fetch from Supabase real profiles table if connected
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .limit(100);

        if (!error && Array.isArray(data) && data.length > 0) {
          isCloud = true;
          const currentUserId = currentUser.id || currentUser.email || `cadet_${currentUser.username || "me"}`;

          for (const row of data) {
            if (!row) continue;
            const rowId = String(row.id || row.user_id || `user_${Math.random()}`);
            const isMe =
              rowId === currentUserId ||
              rowId === currentUser.id ||
              (row.email && row.email === currentUser.email) ||
              (row.username && row.username === currentUser.username);

            const name = row.full_name || row.name || row.username || (isMe ? (currentUser.fullName || "You") : "Cadet");
            const sparks = typeof row.sparks === "number" ? row.sparks : (isMe ? (currentUser.sparks ?? 0) : 0);
            const xp = typeof row.xp === "number" ? row.xp : (isMe ? (currentUser.xp ?? 0) : 0);
            const level = typeof row.level === "number" ? row.level : (isMe ? (currentUser.level ?? 1) : 1);
            const questsCount = typeof row.completed_quests_count === "number"
              ? row.completed_quests_count
              : (isMe ? (currentUser.completedQuestIds || []).length : 0);

            usersMap.set(rowId, {
              id: rowId,
              rank: 0,
              name: isMe ? (currentUser.fullName || name) : name,
              username: row.username || (isMe ? (currentUser.username || "you") : "cadet"),
              avatarUrl: isMe ? currentUser.avatarUrl : (row.avatar_url || row.avatarUrl),
              avatarLetter: (name.charAt(0) || "C").toUpperCase(),
              tier: calculateTier(level, sparks),
              sparks: isMe ? Math.max(currentUser.sparks ?? 0, sparks) : sparks,
              xp: isMe ? Math.max(currentUser.xp ?? 0, xp) : xp,
              level: isMe ? Math.max(currentUser.level ?? 1, level) : level,
              questsCompletedCount: isMe ? Math.max((currentUser.completedQuestIds || []).length, questsCount) : questsCount,
              isCurrentUser: isMe,
              lastActive: row.updated_at || row.last_active || "Recently",
            });
          }
        }
      } catch (err) {
        console.warn("Could not query Supabase profiles table:", err);
      }
    }

    // 3. Read other registered local/session accounts from local storage registry
    try {
      const raw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
      if (raw) {
        const registry: Record<string, Partial<UserProfile>> = JSON.parse(raw);
        for (const [id, userRecord] of Object.entries(registry)) {
          if (!userRecord || !id) continue;
          const isMe = id === currentUser.id || userRecord.email === currentUser.email;

          const currentName = currentUser.fullName || currentUser.username || "You";
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
            username: userRecord.username || (isMe ? (currentUser.username || "you") : "cadet"),
            avatarUrl: isMe ? currentUser.avatarUrl : userRecord.avatarUrl,
            avatarLetter: (name.charAt(0) || "C").toUpperCase(),
            tier: calculateTier(level, sparks),
            sparks,
            xp,
            level,
            questsCompletedCount: questsCount,
            isCurrentUser: isMe,
            lastActive: userRecord.lastActiveDate || "Recently",
          });
        }
      }
    } catch {
      // Ignore
    }

    // 4. Always set/overwrite active user's current live stats so their real progress is reflected
    const currentUserId = currentUser.id || currentUser.email || `cadet_${currentUser.username || "me"}`;
    const currentName = currentUser.fullName || currentUser.username || "You";
    const currentTier = calculateTier(currentUser.level || 1, currentUser.sparks || 0);

    usersMap.set(currentUserId, {
      id: currentUserId,
      rank: 0,
      name: currentName,
      username: currentUser.username || "you",
      avatarUrl: currentUser.avatarUrl,
      avatarLetter: (currentName.charAt(0) || "Y").toUpperCase(),
      tier: currentTier,
      sparks: currentUser.sparks ?? 0,
      xp: currentUser.xp ?? 0,
      level: currentUser.level ?? 1,
      questsCompletedCount: (currentUser.completedQuestIds || []).length,
      isCurrentUser: true,
      lastActive: "Just now",
    });

    // 5. Sort entries strictly by selected metric
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

    // 6. Assign calculated ranks (1, 2, 3...)
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

