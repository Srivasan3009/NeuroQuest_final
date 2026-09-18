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
   * Fetch all real user profiles strictly from Supabase and local storage registry
   */
  public async getRealRankings(
    currentUser: UserProfile,
    sortBy: "sparks" | "xp" | "quests" = "sparks"
  ): Promise<{ rankings: RealLeaderboardEntry[]; isCloudSource: boolean }> {
    const usersMap = new Map<string, RealLeaderboardEntry>();
    let isCloud = false;

    // 1. Fetch ALL registered profiles from Supabase
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, name, username, email, avatar_url, sparks, xp, level, completed_quests_count, updated_at, created_at")
          .order("sparks", { ascending: false })
          .limit(500);

        if (error) {
          console.warn("Supabase profiles query returned error:", error.message || error);
        } else if (Array.isArray(data)) {
          isCloud = true;
          const currentUserId = currentUser.id || currentUser.email || `cadet_${currentUser.username || "me"}`;

          for (const row of data) {
            if (!row || !row.id) continue;
            const rowId = String(row.id);
            const name = row.full_name || row.name || row.username || "Cadet";
            const username = row.username || "";
            const email = row.email || "";

            // Purge and skip any mock accounts that were synced previously
            if (isMockCadet(rowId, name, username, email)) {
              void supabase.from("profiles").delete().eq("id", rowId);
              continue;
            }

            const isMe =
              rowId === currentUserId ||
              rowId === currentUser.id ||
              (currentUser.email && email && email.toLowerCase() === currentUser.email.toLowerCase()) ||
              (currentUser.username && username && username.toLowerCase() === currentUser.username.toLowerCase());

            const displayName = isMe ? (currentUser.fullName || name) : name;
            const sparks = typeof row.sparks === "number" ? row.sparks : 0;
            const xp = typeof row.xp === "number" ? row.xp : 0;
            const level = typeof row.level === "number" ? row.level : 1;
            const questsCount = typeof row.completed_quests_count === "number"
              ? row.completed_quests_count
              : (isMe ? (currentUser.completedQuestIds || []).length : 0);

            usersMap.set(rowId, {
              id: rowId,
              rank: 0,
              name: displayName,
              username: row.username || (isMe ? (currentUser.username || "you") : "cadet"),
              avatarUrl: isMe ? currentUser.avatarUrl : (row.avatar_url || ""),
              avatarLetter: (displayName.charAt(0) || "C").toUpperCase(),
              tier: calculateTier(level, isMe ? Math.max(currentUser.sparks ?? 0, sparks) : sparks),
              sparks: isMe ? Math.max(currentUser.sparks ?? 0, sparks) : sparks,
              xp: isMe ? Math.max(currentUser.xp ?? 0, xp) : xp,
              level: isMe ? Math.max(currentUser.level ?? 1, level) : level,
              questsCompletedCount: isMe ? Math.max((currentUser.completedQuestIds || []).length, questsCount) : questsCount,
              isCurrentUser: isMe,
              lastActive: row.updated_at || row.created_at || "Recently",
            });
          }
        }
      } catch (err) {
        console.warn("Could not query Supabase profiles table:", err);
      }
    }

    // 2. Read registered local/session accounts to include any additional users
    try {
      const raw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
      if (raw) {
        const registry: Record<string, Partial<UserProfile>> = JSON.parse(raw);
        for (const [id, userRecord] of Object.entries(registry)) {
          if (!userRecord || !id) continue;
          if (isMockCadet(id, userRecord.fullName, userRecord.username, userRecord.email)) continue;

          const isMe =
            id === currentUser.id ||
            id === currentUser.email ||
            (currentUser.email && userRecord.email && userRecord.email.toLowerCase() === currentUser.email.toLowerCase());

          const existingEntry = usersMap.get(id);
          const currentName = currentUser.fullName || currentUser.username || "You";
          const name = userRecord.fullName || userRecord.username || (isMe ? currentName : "Cadet");
          const sparks = isMe ? Math.max(currentUser.sparks ?? 0, userRecord.sparks ?? 0) : (userRecord.sparks ?? 0);
          const xp = isMe ? Math.max(currentUser.xp ?? 0, userRecord.xp ?? 0) : (userRecord.xp ?? 0);
          const level = isMe ? Math.max(currentUser.level ?? 1, userRecord.level ?? 1) : (userRecord.level ?? 1);
          const questsCount = isMe
            ? Math.max((currentUser.completedQuestIds || []).length, (userRecord.completedQuestIds || []).length)
            : (userRecord.completedQuestIds || []).length;

          // If entry already exists from Supabase, preserve highest recorded points
          if (existingEntry) {
            existingEntry.sparks = Math.max(existingEntry.sparks, sparks);
            existingEntry.xp = Math.max(existingEntry.xp, xp);
            existingEntry.level = Math.max(existingEntry.level, level);
            existingEntry.questsCompletedCount = Math.max(existingEntry.questsCompletedCount, questsCount);
            if (isMe) existingEntry.isCurrentUser = true;
          } else {
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
      }
    } catch {
      // Ignore
    }

    // 3. Ensure current active user is always represented with their live session stats
    if (!isMockCadet(currentUser.id, currentUser.fullName, currentUser.username, currentUser.email)) {
      const currentUserId = currentUser.id || currentUser.email || `cadet_${currentUser.username || "me"}`;
      const currentName = currentUser.fullName || currentUser.username || "You";
      const currentSparks = currentUser.sparks ?? 0;
      const currentXP = currentUser.xp ?? 0;
      const currentLevel = currentUser.level ?? 1;
      const currentTier = calculateTier(currentLevel, currentSparks);

      const existingMe = usersMap.get(currentUserId) || Array.from(usersMap.values()).find(e => e.isCurrentUser);

      if (existingMe) {
        existingMe.name = currentName;
        existingMe.sparks = Math.max(existingMe.sparks, currentSparks);
        existingMe.xp = Math.max(existingMe.xp, currentXP);
        existingMe.level = Math.max(existingMe.level, currentLevel);
        existingMe.questsCompletedCount = Math.max(
          existingMe.questsCompletedCount,
          (currentUser.completedQuestIds || []).length
        );
        existingMe.tier = calculateTier(existingMe.level, existingMe.sparks);
        existingMe.isCurrentUser = true;
      } else {
        usersMap.set(currentUserId, {
          id: currentUserId,
          rank: 0,
          name: currentName,
          username: currentUser.username || "you",
          avatarUrl: currentUser.avatarUrl,
          avatarLetter: (currentName.charAt(0) || "Y").toUpperCase(),
          tier: currentTier,
          sparks: currentSparks,
          xp: currentXP,
          level: currentLevel,
          questsCompletedCount: (currentUser.completedQuestIds || []).length,
          isCurrentUser: true,
          lastActive: "Just now",
        });
      }
    }

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

