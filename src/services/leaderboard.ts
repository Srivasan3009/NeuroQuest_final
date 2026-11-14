import { UserProfile } from "../types";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

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

export class LeaderboardService {
  private static instance: LeaderboardService;
  private syncQueue: Promise<void> = Promise.resolve();

  private constructor() {}

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * Sync current authenticated user's public non-PII stats to Firestore /leaderboard/{uid}
   */
  public async syncUserStats(user: UserProfile): Promise<void> {
    const task = this.syncQueue.then(() => this.performSyncUserStats(user));
    this.syncQueue = task.catch(() => {});
    return task;
  }

  private async performSyncUserStats(user: UserProfile): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!user || !firebaseUser) return;

    const uid = firebaseUser.uid;
    const path = `leaderboard/${uid}`;
    const entryRef = doc(db, "leaderboard", uid);

    const payload = {
      uid: uid.slice(0, 128),
      fullName: (user.fullName || "Cadet").trim().slice(0, 100) || "Cadet",
      username: (user.username || "cadet").trim().slice(0, 50) || "cadet",
      avatarUrl: (user.avatarUrl || "").slice(0, 200000),
      sparks: Math.min(10000000, Math.max(0, Math.round(user.sparks ?? 0))),
      xp: Math.min(10000000, Math.max(0, Math.round(user.xp ?? 0))),
      level: Math.min(100, Math.max(1, Math.round(user.level ?? 1))),
      completedQuestsCount: Math.min(500, Math.max(0, (user.completedQuestIds || []).length)),
      isPublic: true,
    };

    try {
      const snap = await getDoc(entryRef);
      if (!snap.exists()) {
        await setDoc(entryRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(entryRef, {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Query live rankings from Firestore /leaderboard
   */
  public async getRealRankings(
    currentUser: UserProfile,
    sortBy: "sparks" | "xp" | "quests" = "sparks"
  ): Promise<{ rankings: RealLeaderboardEntry[]; isCloudSource: boolean }> {
    const currentUid = auth.currentUser?.uid || currentUser.id;
    const path = "leaderboard";

    if (!auth.currentUser) {
      const selfEntry: RealLeaderboardEntry = {
        id: currentUid,
        rank: 1,
        name: currentUser.fullName || "Cadet",
        username: currentUser.username || "cadet",
        avatarUrl: currentUser.avatarUrl,
        avatarLetter: (currentUser.fullName?.charAt(0) || "C").toUpperCase(),
        tier: calculateTier(currentUser.level || 1, currentUser.sparks || 0),
        sparks: currentUser.sparks ?? 0,
        xp: currentUser.xp ?? 0,
        level: currentUser.level ?? 1,
        questsCompletedCount: (currentUser.completedQuestIds || []).length,
        isCurrentUser: true,
        lastActive: "Just now",
      };
      return { rankings: [selfEntry], isCloudSource: false };
    }

    try {
      const q = query(
        collection(db, path),
        where("isPublic", "==", true),
        limit(50)
      );
      const snapshot = await getDocs(q);

      const entries: RealLeaderboardEntry[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const level = typeof d.level === "number" ? d.level : 1;
        const sparks = typeof d.sparks === "number" ? d.sparks : 0;
        const xp = typeof d.xp === "number" ? d.xp : 0;
        const questsCompletedCount =
          typeof d.completedQuestsCount === "number" ? d.completedQuestsCount : 0;
        const name = typeof d.fullName === "string" && d.fullName ? d.fullName : "Cadet";

        entries.push({
          id: docSnap.id,
          rank: 1,
          name,
          username: typeof d.username === "string" && d.username ? d.username : "cadet",
          avatarUrl: typeof d.avatarUrl === "string" ? d.avatarUrl : "",
          avatarLetter: name.charAt(0).toUpperCase(),
          tier: calculateTier(level, sparks),
          sparks,
          xp,
          level,
          questsCompletedCount,
          isCurrentUser: docSnap.id === currentUid,
          lastActive: "Active",
        });
      });

      // Ensure current user appears even if their initial sync is still settling
      if (!entries.some((e) => e.isCurrentUser)) {
        entries.push({
          id: currentUid,
          rank: 1,
          name: currentUser.fullName || "Cadet",
          username: currentUser.username || "cadet",
          avatarUrl: currentUser.avatarUrl || "",
          avatarLetter: (currentUser.fullName?.charAt(0) || "C").toUpperCase(),
          tier: calculateTier(currentUser.level || 1, currentUser.sparks || 0),
          sparks: currentUser.sparks ?? 0,
          xp: currentUser.xp ?? 0,
          level: currentUser.level ?? 1,
          questsCompletedCount: (currentUser.completedQuestIds || []).length,
          isCurrentUser: true,
          lastActive: "Just now",
        });
      }

      entries.sort((a, b) => {
        if (sortBy === "xp") return b.xp - a.xp;
        if (sortBy === "quests") return b.questsCompletedCount - a.questsCompletedCount;
        return b.sparks - a.sparks;
      });

      const rankedList = entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      return {
        rankings: rankedList,
        isCloudSource: true,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
}

export const leaderboardService = LeaderboardService.getInstance();
