import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import {
  Medal,
  Sparkles,
  Zap,
  RefreshCw,
  Search,
  Users,
  Award,
  Crown,
  BookOpen,
} from "lucide-react";
import { UserProfile, AppTheme } from "../../types";
import {
  leaderboardService,
  RealLeaderboardEntry,
} from "../../services/leaderboard";
import { socialService } from "../../services/social";
import { FriendsFeedModal } from "../social/FriendsFeedModal";
import { soundFx } from "../../utils/sound";

interface LeagueViewProps {
  user: UserProfile;
  theme?: AppTheme;
}

export const LeagueView: React.FC<LeagueViewProps> = ({
  user,
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const [sortBy, setSortBy] = useState<"sparks" | "xp" | "quests">("sparks");
  const [searchQuery, setSearchQuery] = useState("");
  const [rankings, setRankings] = useState<RealLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudSource, setIsCloudSource] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    setPendingRequestsCount(socialService.getPendingRequestsCount());
    const unsub = socialService.subscribe(() => {
      setPendingRequestsCount(socialService.getPendingRequestsCount());
    });
    return () => unsub();
  }, []);

  const loadRealLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      await leaderboardService.syncUserStats(user);
      const result = await leaderboardService.getRealRankings(user, sortBy);
      setRankings(result.rankings);
      setIsCloudSource(result.isCloudSource);
    } catch (err) {
      console.warn("Error fetching real leaderboard:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    user.id,
    user.sparks,
    user.xp,
    user.level,
    (user.completedQuestIds || []).length,
    user.fullName,
    user.username,
    sortBy,
  ]);

  useEffect(() => {
    loadRealLeaderboard();
  }, [loadRealLeaderboard]);

  const handleRefresh = async () => {
    soundFx.playTap();
    setIsRefreshing(true);
    await loadRealLeaderboard();
  };

  const getTierTextStyle = (tier: string) => {
    switch (tier) {
      case "DIAMOND":
        return isDark ? "text-sky-300" : "text-[#0071E3]";
      case "PLATINUM":
        return isDark ? "text-zinc-300" : "text-slate-600";
      case "GOLD":
        return isDark ? "text-amber-300" : "text-amber-700";
      default:
        return isDark ? "text-zinc-400" : "text-[#6E6E73]";
    }
  };

  const deduplicatedRankings = useMemo(() => {
    const unique: RealLeaderboardEntry[] = [];
    for (const r of rankings) {
      const match = unique.find((u) => {
        if (r.isCurrentUser && u.isCurrentUser) return true;
        if (
          r.id &&
          u.id &&
          r.id.toLowerCase().trim() === u.id.toLowerCase().trim()
        )
          return true;
        if (
          r.email &&
          u.email &&
          r.email.toLowerCase().trim() === u.email.toLowerCase().trim()
        )
          return true;

        const u1 = (r.username || "").toLowerCase().trim();
        const u2 = (u.username || "").toLowerCase().trim();
        if (u1 && u2 && u1 !== "cadet" && u1 !== "you" && u1 === u2) return true;

        const n1 = (r.name || "").toLowerCase().trim();
        const n2 = (u.name || "").toLowerCase().trim();
        if (n1 && n2 && n1 !== "cadet" && n1 !== "you" && n1 === n2) return true;

        return false;
      });

      if (match) {
        match.sparks = Math.max(match.sparks, r.sparks);
        match.xp = Math.max(match.xp, r.xp);
        match.level = Math.max(match.level, r.level);
        match.questsCompletedCount = Math.max(
          match.questsCompletedCount,
          r.questsCompletedCount
        );
        if (r.isCurrentUser) match.isCurrentUser = true;
        if (!match.avatarUrl && r.avatarUrl) match.avatarUrl = r.avatarUrl;
      } else {
        unique.push({ ...r });
      }
    }
    return unique.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [rankings]);

  const filteredRankings = deduplicatedRankings.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.username && r.username.toLowerCase().includes(q))
    );
  });

  const top1 = deduplicatedRankings[0];
  const top2 = deduplicatedRankings[1];
  const top3 = deduplicatedRankings[2];

  const currentUserEntry = deduplicatedRankings.find(
    (r) => r.isCurrentUser
  ) || {
    rank: 1,
    name: user.fullName || "You",
    sparks: user.sparks ?? 0,
    xp: user.xp ?? 0,
    tier: "BRONZE" as const,
  };

  const getMetricValue = (entry: RealLeaderboardEntry) => {
    if (sortBy === "xp") return `${entry.xp.toLocaleString()} XP`;
    if (sortBy === "quests") return `${entry.questsCompletedCount} Quests`;
    return `${entry.sparks.toLocaleString()} Sparks`;
  };

  const sortOptions: {
    id: "sparks" | "xp" | "quests";
    label: string;
    icon: typeof Zap;
  }[] = [
    { id: "sparks", label: "Sparks", icon: Zap },
    { id: "xp", label: "XP Points", icon: Sparkles },
    { id: "quests", label: "Quests", icon: BookOpen },
  ];

  return (
    <div
      id="league-view"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 space-y-6"
    >
      {/* Top Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-open-squad-feed"
          onClick={() => {
            soundFx.playTap();
            setIsFriendsModalOpen(true);
          }}
          className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-colors whitespace-nowrap ${
            isDark
              ? "bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.08] text-zinc-200"
              : "bg-white hover:bg-zinc-50 border-black/[0.07] text-[#1D1D1F] shadow-xs"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
          <span>Study Squad</span>
          {pendingRequestsCount > 0 && (
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-300 tabular-nums">
              · {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          id="refresh-rankings-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-medium transition-colors whitespace-nowrap ${
            isDark
              ? "bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.08] text-zinc-300"
              : "bg-white hover:bg-zinc-50 border-black/[0.07] text-[#1D1D1F] shadow-xs"
          }`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Title Section */}
      <div className="text-center space-y-1.5">
        <p
          className={`text-xs font-medium ${
            isDark ? "text-zinc-400" : "text-[#6E6E73]"
          }`}
        >
          Global Cadet League · {isCloudSource ? "Cloud Synced" : "Live League"}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Cadet Rankings
        </h1>
      </div>

      {/* Frosted Glass Segmented Control */}
      <div className="flex items-center p-1.5 rounded-full max-w-md mx-auto apple-glass-dock">
        {sortOptions.map((opt) => {
          const isActive = sortBy === opt.id;
          const Icon = opt.icon;
          const buttonId =
            opt.id === "sparks"
              ? "filter-sparks-btn"
              : opt.id === "xp"
              ? "filter-xp-btn"
              : "filter-quests-btn";
          return (
            <button
              key={opt.id}
              id={buttonId}
              onClick={() => {
                soundFx.playTap();
                setSortBy(opt.id);
              }}
              className={`relative flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap z-10 ${
                isActive
                  ? isDark
                    ? "text-white"
                    : "text-[#0071E3]"
                  : isDark
                  ? "text-zinc-300/80 hover:text-white"
                  : "text-[#1D1D1F]/70 hover:text-[#1D1D1F]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="league-sort-pill"
                  transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.8 }}
                  className={`absolute inset-0 rounded-full -z-10 ${
                    isDark
                      ? "bg-white/[0.15] border border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                      : "bg-white/80 border border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_10px_rgba(0,113,227,0.12)]"
                  }`}
                />
              )}
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Restrained Podium */}
      {rankings.length > 0 && (
        <div className="pt-2 max-w-xl mx-auto w-full">
          <div className="flex items-end justify-center gap-3 sm:gap-4">
            {/* #2 */}
            {top2 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-semibold text-sm mb-2 apple-surface">
                  {top2.avatarUrl ? (
                    <img
                      src={top2.avatarUrl}
                      alt={top2.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    top2.avatarLetter
                  )}
                </div>
                <div className="text-xs font-semibold truncate max-w-[100px] text-center">
                  {top2.isCurrentUser ? "You" : top2.name}
                </div>
                <div
                  className={`text-[11px] font-mono tabular-nums ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  {getMetricValue(top2)}
                </div>
                <div
                  className={`w-full h-20 mt-2.5 rounded-t-2xl flex items-center justify-center font-bold text-xl border border-b-0 ${
                    isDark
                      ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-400"
                      : "bg-white border-black/[0.06] text-zinc-400"
                  }`}
                >
                  2
                </div>
              </motion.div>
            ) : (
              <div className="flex-1" />
            )}

            {/* #1 */}
            {top1 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center"
              >
                <Crown className="w-4 h-4 text-amber-500 mb-1" />
                <div
                  className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center font-bold text-base mb-2 border-2 ${
                    isDark
                      ? "bg-[#1C1C1E] border-amber-400/60 text-amber-300"
                      : "bg-white border-amber-400/70 text-amber-700 shadow-sm"
                  }`}
                >
                  {top1.avatarUrl ? (
                    <img
                      src={top1.avatarUrl}
                      alt={top1.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    top1.avatarLetter
                  )}
                </div>
                <div className="text-xs font-bold truncate max-w-[120px] text-center">
                  {top1.isCurrentUser ? "You" : top1.name}
                </div>
                <div
                  className={`text-[11px] font-mono tabular-nums ${
                    isDark ? "text-amber-300" : "text-[#0071E3]"
                  }`}
                >
                  {getMetricValue(top1)}
                </div>
                <div
                  className={`w-full h-28 mt-2.5 rounded-t-2xl flex items-center justify-center font-bold text-2xl border border-b-0 ${
                    isDark
                      ? "bg-[#2C2C2E] border-white/[0.1] text-amber-300"
                      : "bg-white border-black/[0.07] text-[#1D1D1F] shadow-sm"
                  }`}
                >
                  1
                </div>
              </motion.div>
            )}

            {/* #3 */}
            {top3 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-semibold text-sm mb-2 apple-surface">
                  {top3.avatarUrl ? (
                    <img
                      src={top3.avatarUrl}
                      alt={top3.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    top3.avatarLetter
                  )}
                </div>
                <div className="text-xs font-semibold truncate max-w-[100px] text-center">
                  {top3.isCurrentUser ? "You" : top3.name}
                </div>
                <div
                  className={`text-[11px] font-mono tabular-nums ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  {getMetricValue(top3)}
                </div>
                <div
                  className={`w-full h-16 mt-2.5 rounded-t-2xl flex items-center justify-center font-bold text-xl border border-b-0 ${
                    isDark
                      ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-500"
                      : "bg-white border-black/[0.06] text-zinc-400"
                  }`}
                >
                  3
                </div>
              </motion.div>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      )}

      {/* Current Standing Summary */}
      <div className="apple-surface p-4 rounded-2xl flex items-center justify-between gap-3 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl font-mono font-semibold flex items-center justify-center text-xs tabular-nums ${
              isDark
                ? "bg-[#2997FF]/15 text-[#2997FF]"
                : "bg-[#0071E3]/10 text-[#0071E3]"
            }`}
          >
            #{currentUserEntry.rank}
          </div>
          <div>
            <div className="text-xs font-semibold">Your Standing</div>
            <div
              className={`text-xs ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              {user.fullName || "You"} · {currentUserEntry.tier}
            </div>
          </div>
        </div>
        <div className="text-right font-mono font-semibold text-xs sm:text-sm tabular-nums">
          {sortBy === "xp"
            ? `${(user.xp ?? 0).toLocaleString()} XP`
            : sortBy === "quests"
            ? `${(user.completedQuestIds || []).length} Quests`
            : `${(user.sparks ?? 0).toLocaleString()} Sparks`}
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-3xl mx-auto w-full">
        <div
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-colors ${
            isDark
              ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-100 focus-within:border-[#2997FF]/60"
              : "bg-white border-black/[0.06] text-[#1D1D1F] focus-within:border-[#0071E3]/50 shadow-xs"
          }`}
        >
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            id="search-cadet-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learners by name or handle..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grouped Rankings List */}
      <div className="apple-surface max-w-3xl mx-auto w-full rounded-3xl overflow-hidden">
        <div
          className={`px-5 py-3.5 flex items-center justify-between text-xs border-b ${
            isDark
              ? "border-white/[0.08] text-zinc-400"
              : "border-black/[0.05] text-[#6E6E73]"
          }`}
        >
          <span className="font-semibold">Leaderboard</span>
          <span className="tabular-nums">
            {filteredRankings.length}{" "}
            {filteredRankings.length === 1 ? "Learner" : "Learners"}
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3 text-xs text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0071E3]" />
            <div>Loading rankings...</div>
          </div>
        ) : filteredRankings.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-zinc-400">
            <Users className="w-7 h-7 mx-auto opacity-40" />
            <div className="text-xs">No registered learners match your search.</div>
          </div>
        ) : (
          <div
            className={`divide-y ${
              isDark ? "divide-white/[0.06]" : "divide-black/[0.05]"
            }`}
          >
            {filteredRankings.map((r) => (
              <div
                key={r.id || r.rank}
                className={`px-5 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                  r.isCurrentUser
                    ? isDark
                      ? "bg-[#2997FF]/[0.08]"
                      : "bg-[#0071E3]/[0.04]"
                    : isDark
                    ? "hover:bg-white/[0.02]"
                    : "hover:bg-black/[0.015]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank Indicator */}
                  <div className="shrink-0 w-9 flex items-center justify-center font-mono text-xs font-semibold tabular-nums">
                    {r.rank === 1 ? (
                      <Crown className="w-4 h-4 text-amber-500" />
                    ) : r.rank === 2 ? (
                      <Medal className="w-4 h-4 text-zinc-400" />
                    ) : r.rank === 3 ? (
                      <Award className="w-4 h-4 text-amber-700 dark:text-amber-500" />
                    ) : (
                      <span
                        className={
                          isDark ? "text-zinc-500" : "text-[#6E6E73]"
                        }
                      >
                        #{r.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold shrink-0 border ${
                      isDark
                        ? "bg-[#2C2C2E] border-white/[0.08] text-zinc-200"
                        : "bg-zinc-100 border-black/[0.05] text-[#1D1D1F]"
                    }`}
                  >
                    {r.avatarUrl ? (
                      <img
                        src={r.avatarUrl}
                        alt={r.name}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      r.avatarLetter
                    )}
                  </div>

                  {/* Name & Metadata (Unboxed inline) */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold truncate">
                        {r.name}
                      </span>
                      {r.isCurrentUser && (
                        <span
                          className={`text-[11px] font-semibold ${
                            isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                          }`}
                        >
                          (You)
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isDark ? "text-zinc-400" : "text-[#6E6E73]"
                      }`}
                    >
                      <span className={`font-medium ${getTierTextStyle(r.tier)}`}>
                        {r.tier}
                      </span>
                      {r.username && <span> · @{r.username}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-mono font-semibold tabular-nums">
                    {getMetricValue(r)}
                  </div>
                  <div
                    className={`text-[11px] tabular-nums ${
                      isDark ? "text-zinc-500" : "text-[#6E6E73]"
                    }`}
                  >
                    Lvl {r.level} · {r.questsCompletedCount} Quests
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FriendsFeedModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        user={user}
        theme={theme}
      />
    </div>
  );
};
