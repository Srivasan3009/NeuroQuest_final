import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Medal,
  Sparkles,
  Zap,
  RefreshCw,
  Search,
  Users,
  ShieldCheck,
  Award,
  Crown,
  BookOpen
} from "lucide-react";
import { UserProfile, AppTheme } from "../../types";
import { leaderboardService, RealLeaderboardEntry } from "../../services/leaderboard";
import { socialService } from "../../services/social";
import { FriendsFeedModal } from "../social/FriendsFeedModal";
import { soundFx } from "../../utils/sound";

interface LeagueViewProps {
  user: UserProfile;
  theme?: AppTheme;
}

export const LeagueView: React.FC<LeagueViewProps> = ({
  user,
  theme = "neumorphic"
}) => {
  const isNeumorphic = theme === "neumorphic";
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";
  const isRiso = theme === "riso-pop" || theme === "warm-editorial";

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
      // 1. Sync active user stats first so current scores are always up-to-date
      await leaderboardService.syncUserStats(user);
      // 2. Query real ranked users
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

  const getTierBadgeStyle = (tier: string) => {
    if (isNeumorphic) {
      switch (tier) {
        case "DIAMOND":
          return "neu-pill-accent text-indigo-600 font-black";
        case "PLATINUM":
          return "neu-inset text-slate-700 font-black";
        case "GOLD":
          return "neu-pill-accent text-amber-600 font-black";
        default:
          return "neu-inset text-amber-700 font-black";
      }
    }
    switch (tier) {
      case "DIAMOND":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30";
      case "PLATINUM":
        return "bg-slate-300/10 text-slate-300 border border-slate-400/30";
      case "GOLD":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      default:
        return "bg-amber-800/20 text-amber-500 border border-amber-700/30";
    }
  };

  // Filter rankings by search query
  const filteredRankings = rankings.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.username && r.username.toLowerCase().includes(q))
    );
  });

  // Top 3 real users for the podium
  const top1 = rankings[0];
  const top2 = rankings[1];
  const top3 = rankings[2];

  const currentUserEntry = rankings.find((r) => r.isCurrentUser) || {
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

  return (
    <div
      id="league-view"
      className="w-full max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-32 space-y-6"
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          id="btn-open-squad-feed"
          onClick={() => {
            soundFx.playTap();
            setIsFriendsModalOpen(true);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
            isNeumorphic
              ? "neu-raised text-indigo-600 hover:text-indigo-700"
              : isDark
              ? "bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-400/20"
              : "bg-[#EEF2FF] border-[#1E1B18] text-[#4F46E5] shadow-[2px_2px_0px_#1E1B18]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Squad & Live Feed</span>
          {pendingRequestsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          id="refresh-rankings-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
            isNeumorphic
              ? "neu-raised text-slate-700 hover:text-slate-900"
              : isDark
              ? "bg-[#27272A] border-[#3F3F46] text-zinc-300 hover:text-zinc-100"
              : "bg-white border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
        </motion.button>
      </div>

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <div
            className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
              isNeumorphic ? "text-[#4F46E5]" : isDark ? "text-amber-400" : "text-[#4F46E5]"
            }`}
          >
            GLOBAL CADET LEAGUE
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isCloudSource ? "Cloud Live Synced" : "Global Live League"}</span>
          </div>
        </div>
        <h1
          className={`text-2xl sm:text-3xl font-black tracking-tight uppercase ${
            isNeumorphic ? "text-slate-800" : isDark ? "text-slate-100" : "text-[#1E1B18]"
          }`}
        >
          CADET RANKINGS
        </h1>
        <div
          className={`text-xs font-mono ${
            isNeumorphic ? "text-slate-500" : isDark ? "text-slate-400" : "text-zinc-600"
          }`}
        >
          COMPETE AND CLIMB THE GLOBAL LEADERBOARD
        </div>
      </div>

      {/* Real Metric Filter Tabs */}
      <div
        className={`flex items-center justify-center gap-1.5 p-1.5 rounded-2xl max-w-md mx-auto transition-all ${
          isNeumorphic
            ? "neu-flat"
            : isDark
            ? "bg-[#27272A] border border-[#3F3F46]"
            : "bg-white border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
        }`}
      >
        <button
          id="filter-sparks-btn"
          onClick={() => {
            soundFx.playTap();
            setSortBy("sparks");
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
            sortBy === "sparks"
              ? isNeumorphic
                ? "neu-btn-primary text-white shadow-sm"
                : isDark
                ? "bg-amber-400 text-zinc-950 font-black shadow-sm"
                : "bg-[#1E1B18] text-white"
              : isDark
              ? "text-zinc-400 hover:text-zinc-200"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Sparks</span>
        </button>

        <button
          id="filter-xp-btn"
          onClick={() => {
            soundFx.playTap();
            setSortBy("xp");
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
            sortBy === "xp"
              ? isNeumorphic
                ? "neu-btn-primary text-white shadow-sm"
                : isDark
                ? "bg-amber-400 text-zinc-950 font-black shadow-sm"
                : "bg-[#1E1B18] text-white"
              : isDark
              ? "text-zinc-400 hover:text-zinc-200"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>XP Points</span>
        </button>

        <button
          id="filter-quests-btn"
          onClick={() => {
            soundFx.playTap();
            setSortBy("quests");
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
            sortBy === "quests"
              ? isNeumorphic
                ? "neu-btn-primary text-white shadow-sm"
                : isDark
                ? "bg-amber-400 text-zinc-950 font-black shadow-sm"
                : "bg-[#1E1B18] text-white"
              : isDark
              ? "text-zinc-400 hover:text-zinc-200"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Quests</span>
        </button>
      </div>

      {/* Dynamic Podium Visual Generated from Real Ranked Users */}
      {rankings.length > 0 && (
        <div className="pt-4 pb-2 max-w-xl mx-auto w-full">
          <div className="flex items-end justify-center gap-3">
            {/* #2 Silver / Left (Rendered if at least 2 real users exist) */}
            {top2 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div
                    className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg ${
                      isNeumorphic
                        ? "neu-flat text-slate-700"
                        : "bg-slate-800 border-2 border-slate-400 text-slate-200 shadow-md"
                    }`}
                  >
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
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-1 rounded-md ${
                      isNeumorphic
                        ? "neu-inset text-indigo-600"
                        : "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                    }`}
                  >
                    {top2.tier}
                  </span>
                </div>
                <div
                  className={`text-xs font-bold truncate max-w-[100px] text-center ${
                    isNeumorphic ? "text-slate-800" : "text-slate-200"
                  }`}
                >
                  {top2.isCurrentUser ? "You" : top2.name}
                </div>
                <div
                  className={`text-xs font-mono font-bold ${
                    isNeumorphic ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {getMetricValue(top2)}
                </div>
                {/* Podium Step 2 */}
                <div
                  className={`w-full h-24 mt-2 rounded-t-2xl flex items-center justify-center font-black text-3xl transition-all ${
                    isNeumorphic
                      ? "neu-raised text-slate-600"
                      : isRiso
                      ? "bg-[#E2E8F0] text-[#1E1B18] border-2 border-b-0 border-[#1E1B18]"
                      : "bg-gradient-to-t from-slate-900 to-slate-800 text-slate-400 border-t-2 border-slate-400/60 shadow-md"
                  }`}
                >
                  2
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 opacity-0 pointer-events-none" />
            )}

            {/* #1 Gold / Center Highest (Top 1 Real User) */}
            {top1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div
                    className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center font-black text-xl ${
                      isNeumorphic
                        ? "neu-flat text-amber-500"
                        : "bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
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
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-1.5 rounded-md ${
                      isNeumorphic
                        ? "neu-pill-accent text-amber-600"
                        : "bg-amber-950 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {top1.tier}
                  </span>
                  <Crown className="w-5 h-5 text-amber-400 absolute -top-3 left-1/2 -translate-x-1/2 fill-amber-400 drop-shadow" />
                </div>
                <div
                  className={`text-xs font-bold truncate max-w-[120px] text-center ${
                    isNeumorphic
                      ? "text-amber-600 font-black"
                      : isDark
                      ? "text-amber-300 font-black"
                      : "text-[#1E1B18] font-black"
                  }`}
                >
                  {top1.isCurrentUser ? "You" : top1.name}
                </div>
                <div
                  className={`text-xs font-mono font-bold ${
                    isNeumorphic ? "text-amber-600" : "text-amber-400"
                  }`}
                >
                  {getMetricValue(top1)}
                </div>
                {/* Podium Step 1 */}
                <div
                  className={`w-full h-32 mt-2 rounded-t-2xl flex items-center justify-center font-black text-4xl transition-all ${
                    isNeumorphic
                      ? "neu-raised text-amber-500"
                      : isRiso
                      ? "bg-[#FEF08A] text-[#1E1B18] border-2 border-b-0 border-[#1E1B18]"
                      : "bg-gradient-to-t from-amber-950/60 via-amber-900/40 to-amber-700/50 text-amber-400 border-t-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                  }`}
                >
                  1
                </div>
              </motion.div>
            )}

            {/* #3 Bronze / Right (Rendered if at least 3 real users exist) */}
            {top3 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div
                    className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg ${
                      isNeumorphic
                        ? "neu-flat text-indigo-600"
                        : "bg-amber-950/60 border-2 border-amber-600 text-amber-400 shadow-md"
                    }`}
                  >
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
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-1 rounded-md ${
                      isNeumorphic
                        ? "neu-inset text-amber-700"
                        : "bg-amber-950 text-amber-400 border border-amber-600/30"
                    }`}
                  >
                    {top3.tier}
                  </span>
                </div>
                <div
                  className={`text-xs font-bold truncate max-w-[100px] text-center ${
                    isNeumorphic ? "text-indigo-600" : "text-cyan-400"
                  }`}
                >
                  {top3.isCurrentUser ? "You" : top3.name}
                </div>
                <div
                  className={`text-xs font-mono font-bold ${
                    isNeumorphic ? "text-indigo-500" : "text-cyan-300"
                  }`}
                >
                  {getMetricValue(top3)}
                </div>
                {/* Podium Step 3 */}
                <div
                  className={`w-full h-20 mt-2 rounded-t-2xl flex items-center justify-center font-black text-3xl transition-all ${
                    isNeumorphic
                      ? "neu-raised text-slate-500"
                      : isRiso
                      ? "bg-[#FFEDD5] text-[#1E1B18] border-2 border-b-0 border-[#1E1B18]"
                      : "bg-gradient-to-t from-slate-900 to-amber-950/40 text-amber-600 border-t-2 border-amber-700/60 shadow-md"
                  }`}
                >
                  3
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 opacity-0 pointer-events-none" />
            )}
          </div>
        </div>
      )}

      {/* Current User Quick Floating Stat Strip */}
      <div
        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 max-w-3xl mx-auto w-full ${
          isNeumorphic
            ? "neu-inset text-slate-800"
            : isDark
            ? "bg-amber-400/10 border-amber-400/40 text-amber-200"
            : "bg-[#FEF08A]/70 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl font-mono font-black flex items-center justify-center text-xs ${
              isDark ? "bg-amber-400 text-zinc-950" : "bg-[#1E1B18] text-white"
            }`}
          >
            #{currentUserEntry.rank}
          </div>
          <div>
            <div className="text-xs font-black uppercase">Your Current Standing</div>
            <div className="text-[11px] opacity-80">
              {user.fullName || "You"} • Tier {currentUserEntry.tier}
            </div>
          </div>
        </div>
        <div className="text-right font-mono font-black text-xs sm:text-sm">
          {sortBy === "xp"
            ? `${(user.xp ?? 0).toLocaleString()} XP`
            : sortBy === "quests"
            ? `${(user.completedQuestIds || []).length} Quests`
            : `${(user.sparks ?? 0).toLocaleString()} Sparks`}
        </div>
      </div>

      {/* Search Input for Real Users */}
      <div className="max-w-3xl mx-auto w-full">
        <div
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all ${
            isNeumorphic
              ? "neu-inset text-slate-800"
              : isDark
              ? "bg-[#18181B] border-[#3F3F46] text-zinc-200 focus-within:border-amber-400"
              : "bg-white border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] focus-within:ring-2 focus-within:ring-[#1E1B18]"
          }`}
        >
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            id="search-cadet-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cadet by name or username..."
            className="w-full bg-transparent text-xs font-mono outline-none placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Full Rankings List */}
      <div
        className={`max-w-3xl mx-auto w-full rounded-2xl overflow-hidden transition-all ${
          isNeumorphic
            ? "neu-raised text-slate-800"
            : isRiso
            ? "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
            : "bg-slate-900/90 border border-slate-800 shadow-md"
        }`}
      >
        <div
          className={`px-4 py-3 flex items-center justify-between text-xs font-mono ${
            isNeumorphic
              ? "border-b border-slate-300 text-slate-500"
              : "border-b border-slate-800 text-slate-400"
          }`}
        >
          <span className="uppercase font-bold">CADET RANKINGS</span>
          <span>{filteredRankings.length} Active {filteredRankings.length === 1 ? "Learner" : "Learners"}</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3 font-mono text-xs text-zinc-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <div>Loading verified learner data...</div>
          </div>
        ) : filteredRankings.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-zinc-400">
            <Users className="w-8 h-8 mx-auto opacity-50" />
            <div className="text-xs font-mono font-bold">No registered cadets match your search.</div>
          </div>
        ) : (
          <div
            className={
              isNeumorphic ? "divide-y divide-slate-300/80" : "divide-y divide-slate-800/70"
            }
          >
            {filteredRankings.map((r) => (
              <div
                key={r.id || r.rank}
                className={`px-4 py-3 flex items-center justify-between gap-3 transition-all relative ${
                  r.isCurrentUser
                    ? isDark
                      ? "bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border-l-4 border-l-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]"
                      : isNeumorphic
                      ? "bg-amber-100/90 border-l-4 border-l-amber-500 shadow-sm"
                      : "bg-[#FEF08A] border-l-4 border-l-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                    : isNeumorphic
                    ? "hover:bg-slate-200/50"
                    : "hover:bg-slate-800/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge Column */}
                  <div className="shrink-0 min-w-[90px] sm:min-w-[105px] flex items-center">
                    {r.rank === 1 ? (
                      <div className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.4)] flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-zinc-950 shrink-0" />
                        <span>#1 Champion</span>
                      </div>
                    ) : r.rank === 2 ? (
                      <div className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-950 shadow-sm flex items-center gap-1">
                        <Medal className="w-3 h-3 text-slate-900 shrink-0" />
                        <span>#2 Runner-Up</span>
                      </div>
                    ) : r.rank === 3 ? (
                      <div className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-100 shadow-sm flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-100 shrink-0" />
                        <span>#3 Bronze</span>
                      </div>
                    ) : (
                      <span
                        className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                          isNeumorphic ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        #{r.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold ${
                        r.isCurrentUser
                          ? "bg-amber-500 text-zinc-950 font-black border-2 border-amber-400 ring-2 ring-amber-400/60 ring-offset-1 ring-offset-zinc-900"
                          : isNeumorphic
                          ? "neu-inset text-slate-700"
                          : "bg-slate-800 border border-slate-700 text-slate-200"
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
                    {r.isCurrentUser && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-zinc-950 flex items-center justify-center shadow-sm">
                        <Sparkles className="w-2 h-2 text-zinc-950 fill-zinc-950" />
                      </span>
                    )}
                  </div>

                  {/* Name and Metadata */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-bold truncate ${
                          r.isCurrentUser
                            ? "font-black text-amber-500 dark:text-amber-300"
                            : isNeumorphic
                            ? "text-slate-800"
                            : "text-slate-200"
                        }`}
                      >
                        {r.name}
                      </span>
                      {r.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 shadow-[0_0_10px_rgba(251,191,36,0.4)] flex items-center gap-1 shrink-0">
                          <Sparkles className="w-2.5 h-2.5 fill-zinc-950 shrink-0" />
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded-md ${getTierBadgeStyle(
                          r.tier
                        )}`}
                      >
                        {r.tier}
                      </span>
                      {r.username && (
                        <span className="text-[10px] font-mono text-zinc-500 truncate">
                          @{r.username}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-mono font-bold ${
                      r.isCurrentUser
                        ? "text-amber-600 dark:text-amber-400 font-black"
                        : isNeumorphic
                        ? "text-slate-800"
                        : "text-slate-100"
                    }`}
                  >
                    {getMetricValue(r)}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Lvl {r.level} • {r.questsCompletedCount} Quests
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-Time Social & Friends Feed Modal */}
      <FriendsFeedModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        user={user}
        theme={theme}
      />
    </div>
  );
};
