import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Flame,
  Zap,
  Sparkles,
  Send,
  MessageSquare,
  Share2,
  Heart,
  Search,
  CheckCircle2,
  TrendingUp,
  X,
  Compass,
  Trophy,
  Shield,
  Activity,
  Award,
  Clock,
  Inbox,
  SendHorizonal,
  History,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, AppTheme } from "../../types";
import {
  socialService,
  FriendUser,
  FriendRequest,
  ActivityFeedItem,
  StudyPartyMessage
} from "../../services/social";
import { soundFx } from "../../utils/sound";

interface FriendsFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  theme: AppTheme;
}

export const FriendsFeedModal: React.FC<FriendsFeedModalProps> = ({
  isOpen,
  onClose,
  user,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<"feed" | "friends" | "requests" | "party">("feed");
  const [requestsSubTab, setRequestsSubTab] = useState<"incoming" | "outgoing" | "history">("incoming");
  
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [partyMessages, setPartyMessages] = useState<StudyPartyMessage[]>([]);

  const [searchHandle, setSearchHandle] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [partyInput, setPartyInput] = useState("");

  const isDark = theme === "obsidian-noir" || theme === "obsidian-gold" || theme === "cyber-dark";
  const isNeumorphic = theme === "neumorphic";

  const refreshState = () => {
    setFriends(socialService.getFriends());
    setFriendRequests(socialService.getFriendRequests());
    setFeed(socialService.getFeed());
    setPartyMessages(socialService.getPartyMessages());
  };

  useEffect(() => {
    if (isOpen) {
      refreshState();
      const unsubscribe = socialService.subscribe(() => {
        refreshState();
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pendingIncomingCount = friendRequests.filter((r) => r.status === "pending" && r.direction === "incoming").length;
  const pendingOutgoingCount = friendRequests.filter((r) => r.status === "pending" && r.direction === "outgoing").length;
  const historyRequests = friendRequests.filter((r) => r.status !== "pending");

  const handleSendFriendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playTap();
    if (!searchHandle.trim()) return;

    const res = socialService.sendFriendRequest(
      searchHandle,
      {
        id: user.id || "you",
        fullName: user.fullName || "Cadet",
        username: user.fullName ? user.fullName.toLowerCase().replace(/\s+/g, "_") : "cadet_current",
        level: user.level || 1,
        role: "Neural Cadet",
      },
      customNote.trim() || undefined
    );

    if (res.success) {
      soundFx.playSpark();
      setActionNotice({ type: "success", text: res.message });
      setSearchHandle("");
      setCustomNote("");
      setShowNoteInput(false);
      if (activeTab === "requests") {
        setRequestsSubTab("outgoing");
      }
    } else {
      soundFx.playWrong();
      setActionNotice({ type: "error", text: res.message });
    }

    setTimeout(() => {
      setActionNotice(null);
    }, 4000);
  };

  const handleAcceptRequest = (requestId: string) => {
    soundFx.playSpark();
    const res = socialService.acceptFriendRequest(requestId, user.fullName || "You");
    if (res.success) {
      setActionNotice({ type: "success", text: res.message });
    } else {
      setActionNotice({ type: "error", text: res.message });
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDeclineRequest = (requestId: string) => {
    soundFx.playTap();
    const res = socialService.declineFriendRequest(requestId);
    setActionNotice({ type: "success", text: res.message });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCancelRequest = (requestId: string) => {
    soundFx.playTap();
    const res = socialService.cancelFriendRequest(requestId);
    setActionNotice({ type: "success", text: res.message });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleToggleClap = (item: ActivityFeedItem) => {
    soundFx.playSpark();
    socialService.toggleClap(item.id);
  };

  const handleSendPartyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyInput.trim()) return;
    soundFx.playTap();

    socialService.sendPartyMessage({
      userId: user.id || "you",
      userName: user.fullName || "You",
      userLetter: (user.fullName?.charAt(0) || "Y").toUpperCase(),
      text: partyInput.trim(),
      type: "chat",
    });

    setPartyInput("");
  };

  const handleNudge = (friend: FriendUser) => {
    soundFx.playSpark();
    socialService.sendNudge(friend.name, user.fullName || "You");
    setActionNotice({ type: "success", text: `Sent study boost to ${friend.name}! ⚡` });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const mutualFriends = friends.filter((f) => f.isMutual);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all ${
            isNeumorphic
              ? "neu-raised text-slate-800"
              : isDark
              ? "bg-[#18181B] border-2 border-[#3F3F46] text-zinc-100"
              : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[6px_6px_0px_#1E1B18]"
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 sm:p-5 flex items-center justify-between border-b ${
              isNeumorphic
                ? "border-slate-300/80 bg-slate-100/60"
                : isDark
                ? "border-[#27272A] bg-[#202024]"
                : "border-[#1E1B18] bg-[#FAF5EE]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isNeumorphic
                    ? "neu-inset text-indigo-600"
                    : isDark
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                    : "bg-[#4F46E5] text-white border-2 border-[#1E1B18]"
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-wide uppercase flex items-center gap-2">
                  <span>Cadet Social & Study Squad</span>
                </h2>
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{friends.filter((f) => f.status === "online" || f.status === "in_quest").length} Cadets active right now</span>
                  {pendingIncomingCount > 0 && (
                    <span className="text-amber-500 font-bold">• {pendingIncomingCount} pending request{pendingIncomingCount > 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playTap();
                onClose();
              }}
              className={`p-2 rounded-full transition-colors ${
                isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-200 text-zinc-600"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Notice Alert */}
          {actionNotice && (
            <div
              className={`px-4 py-2.5 text-xs font-mono font-bold flex items-center justify-between border-b animate-in fade-in duration-200 ${
                actionNotice.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionNotice.text}</span>
              </div>
              <button onClick={() => setActionNotice(null)} className="opacity-70 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div
            className={`flex items-center border-b px-4 sm:px-6 gap-1 sm:gap-2 text-xs font-mono font-black overflow-x-auto ${
              isNeumorphic ? "border-slate-300/80 bg-slate-50/50" : isDark ? "border-[#27272A] bg-[#18181B]" : "border-[#1E1B18]/30"
            }`}
          >
            <button
              id="tab-btn-activity-feed"
              onClick={() => {
                soundFx.playTap();
                setActiveTab("feed");
              }}
              className={`py-3 px-2.5 sm:px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === "feed"
                  ? isDark
                    ? "border-amber-400 text-amber-400"
                    : "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>LIVE FEED</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {feed.length}
              </span>
            </button>

            <button
              id="tab-btn-friends-list"
              onClick={() => {
                soundFx.playTap();
                setActiveTab("friends");
              }}
              className={`py-3 px-2.5 sm:px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === "friends"
                  ? isDark
                    ? "border-amber-400 text-amber-400"
                    : "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>PARTNERS ({mutualFriends.length})</span>
            </button>

            <button
              id="tab-btn-friend-requests"
              onClick={() => {
                soundFx.playTap();
                setActiveTab("requests");
              }}
              className={`py-3 px-2.5 sm:px-3 border-b-2 flex items-center gap-1.5 transition-all relative whitespace-nowrap ${
                activeTab === "requests"
                  ? isDark
                    ? "border-amber-400 text-amber-400"
                    : "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>REQUESTS</span>
              {pendingIncomingCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-bold animate-pulse">
                  {pendingIncomingCount}
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {friendRequests.filter((r) => r.status === "pending").length}
                </span>
              )}
            </button>

            <button
              id="tab-btn-study-party"
              onClick={() => {
                soundFx.playTap();
                setActiveTab("party");
              }}
              className={`py-3 px-2.5 sm:px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === "party"
                  ? isDark
                    ? "border-amber-400 text-amber-400"
                    : "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>SQUAD CHAT</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 max-h-[60vh]">
            {/* 1. ACTIVITY FEED TAB */}
            {activeTab === "feed" && (
              <div className="space-y-3.5">
                {feed.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl transition-all ${
                      isNeumorphic
                        ? "neu-flat text-slate-800"
                        : isDark
                        ? "bg-[#202024] border border-[#2E2E32] text-zinc-200 hover:border-zinc-700"
                        : "bg-white border-2 border-[#1E1B18] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                            isNeumorphic
                              ? "neu-inset text-indigo-600"
                              : isDark
                              ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                              : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
                          }`}
                        >
                          {item.userLetter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs">{item.userName}</span>
                            <span className="text-[10px] font-mono text-zinc-500">• {item.timestamp}</span>
                          </div>
                          <div className="font-black text-xs mt-0.5">{item.title}</div>
                          <p className={`text-xs mt-1 ${isNeumorphic ? "text-slate-600" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                            {item.description}
                          </p>

                          {/* Shared Prompt Snippet if any */}
                          {item.sharedPayload?.promptSnippet && (
                            <div
                              className={`mt-2 p-2.5 rounded-xl font-mono text-[11px] border ${
                                isDark
                                  ? "bg-zinc-900/80 border-zinc-800 text-emerald-300"
                                  : "bg-zinc-50 border-zinc-200 text-zinc-800"
                              }`}
                            >
                              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">PROMPT SNIPPET:</div>
                              <code>{item.sharedPayload.promptSnippet}</code>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Clap / Cheer button */}
                      <button
                        onClick={() => handleToggleClap(item)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                          item.hasClapped
                            ? isDark
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                              : "bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]"
                            : isDark
                            ? "bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-700/60"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${item.hasClapped ? "fill-current" : ""}`} />
                        <span>{item.clapsCount}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 2. FRIENDS DIRECTORY */}
            {activeTab === "friends" && (
              <div className="space-y-4">
                {/* Search / Add Friend by Username Quick Bar */}
                <form
                  onSubmit={handleSendFriendRequest}
                  className={`p-3 rounded-2xl flex flex-col gap-2 border transition-all ${
                    isNeumorphic
                      ? "neu-inset bg-slate-100"
                      : isDark
                      ? "bg-[#202024] border-[#2E2E32]"
                      : "bg-white border-2 border-[#1E1B18]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-zinc-400 ml-1 shrink-0" />
                    <input
                      id="input-friend-handle-search"
                      type="text"
                      value={searchHandle}
                      onChange={(e) => setSearchHandle(e.target.value)}
                      placeholder="Enter cadet @handle (e.g. @sophia_ml)..."
                      className="w-full bg-transparent text-xs font-mono outline-none placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNoteInput(!showNoteInput)}
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border transition-all ${
                        showNoteInput
                          ? "bg-amber-400/20 text-amber-400 border-amber-400/40"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-transparent"
                      }`}
                    >
                      {showNoteInput ? "Note ✓" : "+ Note"}
                    </button>
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs uppercase flex items-center gap-1.5 shrink-0 transition-all ${
                        isNeumorphic
                          ? "neu-btn-primary text-white"
                          : isDark
                          ? "bg-amber-400 text-zinc-950 font-bold"
                          : "bg-[#4F46E5] text-white border border-[#1E1B18]"
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Send Request</span>
                    </button>
                  </div>
                  {showNoteInput && (
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Add an optional study invite note (e.g. 'Let's collaborate on RAG systems!')..."
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono outline-none border transition-all ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-zinc-50 border-zinc-200 text-zinc-800"
                      }`}
                    />
                  )}
                </form>

                {/* Friends List Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-500 px-1">
                    <span>CADET DIRECTORY ({friends.length})</span>
                    <span>{mutualFriends.length} MUTUAL PARTNERS</span>
                  </div>

                  {friends.map((f) => {
                    const status = socialService.getUserRelationshipStatus(f.id);
                    return (
                      <div
                        key={f.id}
                        className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                          isNeumorphic
                            ? "neu-flat text-slate-800"
                            : isDark
                            ? "bg-[#202024] border border-[#2E2E32] text-zinc-200"
                            : "bg-white border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
                                isNeumorphic
                                  ? "neu-inset text-indigo-600"
                                  : isDark
                                  ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                                  : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
                              }`}
                            >
                              {f.avatarLetter}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                                isDark ? "border-[#202024]" : "border-white"
                              } ${
                                f.status === "online" || f.status === "in_quest"
                                  ? "bg-emerald-500"
                                  : f.status === "studying"
                                  ? "bg-amber-500"
                                  : "bg-zinc-400"
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs">{f.name}</span>
                              <span className="text-[11px] font-mono text-zinc-500">@{f.username}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5">
                              <span className="text-amber-500 font-bold">LVL {f.level}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-orange-500 font-bold">
                                <Flame className="w-3 h-3" /> {f.streakDays}d
                              </span>
                              <span>•</span>
                              <span>{f.role}</span>
                            </div>
                            {f.activeQuestTitle && (
                              <div className="text-[10px] font-mono text-zinc-500 line-clamp-1 mt-0.5">
                                Studying: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{f.activeQuestTitle}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          {f.isMutual ? (
                            <>
                              <button
                                onClick={() => handleNudge(f)}
                                title="Send study energy boost"
                                className={`p-2 rounded-xl text-xs font-mono font-bold transition-all ${
                                  isNeumorphic
                                    ? "neu-raised text-amber-600 hover:text-amber-700"
                                    : isDark
                                    ? "bg-zinc-800 text-amber-400 hover:bg-zinc-700 border border-zinc-700"
                                    : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
                                }`}
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                              <span
                                className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold ${
                                  isDark
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                }`}
                              >
                                Partner ✓
                              </span>
                            </>
                          ) : status === "pending_outgoing" ? (
                            <span
                              className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1 ${
                                isDark
                                  ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Sent ⏳</span>
                            </span>
                          ) : status === "pending_incoming" ? (
                            <button
                              onClick={() => {
                                soundFx.playTap();
                                setActiveTab("requests");
                                setRequestsSubTab("incoming");
                              }}
                              className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1 transition-all ${
                                isDark
                                  ? "bg-amber-400 text-zinc-950 font-bold"
                                  : "bg-[#4F46E5] text-white"
                              }`}
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Review</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                soundFx.playTap();
                                socialService.sendFriendRequest(f.username, {
                                  id: user.id || "you",
                                  fullName: user.fullName || "Cadet",
                                  username: user.fullName ? user.fullName.toLowerCase().replace(/\s+/g, "_") : "cadet_current",
                                  level: user.level || 1,
                                });
                                setActionNotice({ type: "success", text: `Friend request sent to @${f.username}!` });
                                setTimeout(() => setActionNotice(null), 3000);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all ${
                                isDark
                                  ? "bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700"
                                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300"
                              }`}
                            >
                              + Request
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. FRIEND REQUESTS TAB */}
            {activeTab === "requests" && (
              <div className="space-y-4">
                {/* Send Request Form */}
                <form
                  onSubmit={handleSendFriendRequest}
                  className={`p-3 sm:p-4 rounded-2xl flex flex-col gap-2.5 border transition-all ${
                    isNeumorphic
                      ? "neu-inset bg-slate-100"
                      : isDark
                      ? "bg-[#202024] border-[#2E2E32]"
                      : "bg-white border-2 border-[#1E1B18]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                      <SendHorizonal className="w-3.5 h-3.5" />
                      <span>Send New Friend Request</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNoteInput(!showNoteInput)}
                      className="text-[10px] font-mono text-zinc-500 hover:underline"
                    >
                      {showNoteInput ? "Hide note field" : "+ Add custom note"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="input-send-request-handle"
                      type="text"
                      value={searchHandle}
                      onChange={(e) => setSearchHandle(e.target.value)}
                      placeholder="Cadet @username (e.g. @marcus_v, @tariq_dev)..."
                      className="w-full bg-transparent text-xs font-mono outline-none placeholder:text-zinc-500"
                    />
                    <button
                      type="submit"
                      className={`px-3.5 py-1.5 rounded-xl font-mono font-black text-xs uppercase flex items-center gap-1.5 shrink-0 transition-all ${
                        isNeumorphic
                          ? "neu-btn-primary text-white"
                          : isDark
                          ? "bg-amber-400 text-zinc-950 font-bold"
                          : "bg-[#4F46E5] text-white border border-[#1E1B18]"
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>

                  {showNoteInput && (
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Add an invitation note (e.g. 'Looking to swap system prompt templates!')..."
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono outline-none border transition-all ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-zinc-50 border-zinc-200 text-zinc-800"
                      }`}
                    />
                  )}
                </form>

                {/* Sub-Tabs: Incoming / Sent / History */}
                <div
                  className={`flex items-center gap-2 border-b pb-2 text-xs font-mono font-bold ${
                    isDark ? "border-zinc-800" : "border-zinc-200"
                  }`}
                >
                  <button
                    onClick={() => {
                      soundFx.playTap();
                      setRequestsSubTab("incoming");
                    }}
                    className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all ${
                      requestsSubTab === "incoming"
                        ? isDark
                          ? "bg-amber-400 text-zinc-950 font-black"
                          : "bg-[#4F46E5] text-white"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Incoming ({pendingIncomingCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playTap();
                      setRequestsSubTab("outgoing");
                    }}
                    className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all ${
                      requestsSubTab === "outgoing"
                        ? isDark
                          ? "bg-amber-400 text-zinc-950 font-black"
                          : "bg-[#4F46E5] text-white"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <SendHorizonal className="w-3.5 h-3.5" />
                    <span>Sent / Pending ({pendingOutgoingCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playTap();
                      setRequestsSubTab("history");
                    }}
                    className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all ${
                      requestsSubTab === "history"
                        ? isDark
                          ? "bg-amber-400 text-zinc-950 font-black"
                          : "bg-[#4F46E5] text-white"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History ({historyRequests.length})</span>
                  </button>
                </div>

                {/* SubTab 1: Incoming Requests */}
                {requestsSubTab === "incoming" && (
                  <div className="space-y-3">
                    {friendRequests.filter((r) => r.status === "pending" && r.direction === "incoming").length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <Inbox className="w-5 h-5" />
                        </div>
                        <div className="font-mono text-xs font-bold text-zinc-500">No pending incoming friend requests.</div>
                        <p className="font-mono text-[11px] text-zinc-400">
                          Share your @handle or send requests to peers in the Cadet Directory!
                        </p>
                      </div>
                    ) : (
                      friendRequests
                        .filter((r) => r.status === "pending" && r.direction === "incoming")
                        .map((req) => (
                          <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl transition-all ${
                              isNeumorphic
                                ? "neu-flat text-slate-800"
                                : isDark
                                ? "bg-[#202024] border border-[#2E2E32] text-zinc-200"
                                : "bg-white border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                                    isNeumorphic
                                      ? "neu-inset text-indigo-600"
                                      : isDark
                                      ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                                      : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
                                  }`}
                                >
                                  {req.fromAvatarLetter}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-black text-xs">{req.fromUserName}</span>
                                    <span className="text-[11px] font-mono text-zinc-500">@{req.fromUsername}</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">
                                      LVL {req.fromLevel}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-400">• {req.timestamp}</span>
                                  </div>
                                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{req.fromRole}</div>
                                  {req.note && (
                                    <p className={`text-xs mt-1.5 p-2 rounded-xl italic ${
                                      isDark ? "bg-zinc-900 text-zinc-300" : "bg-zinc-50 text-zinc-700"
                                    }`}>
                                      "{req.note}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Actions: Accept & Decline */}
                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <button
                                  id={`btn-accept-request-${req.id}`}
                                  onClick={() => handleAcceptRequest(req.id)}
                                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 transition-all ${
                                    isNeumorphic
                                      ? "neu-btn-primary text-white"
                                      : isDark
                                      ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                                      : "bg-emerald-600 text-white border border-[#1E1B18]"
                                  }`}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Accept 🤝</span>
                                </button>
                                <button
                                  id={`btn-decline-request-${req.id}`}
                                  onClick={() => handleDeclineRequest(req.id)}
                                  className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                                    isDark
                                      ? "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
                                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-300"
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                    )}
                  </div>
                )}

                {/* SubTab 2: Outgoing / Sent Requests */}
                {requestsSubTab === "outgoing" && (
                  <div className="space-y-3">
                    {friendRequests.filter((r) => r.status === "pending" && r.direction === "outgoing").length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <SendHorizonal className="w-5 h-5" />
                        </div>
                        <div className="font-mono text-xs font-bold text-zinc-500">No pending sent requests.</div>
                        <p className="font-mono text-[11px] text-zinc-400">
                          Type a cadet @handle above to invite them to your squad!
                        </p>
                      </div>
                    ) : (
                      friendRequests
                        .filter((r) => r.status === "pending" && r.direction === "outgoing")
                        .map((req) => (
                          <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                              isNeumorphic
                                ? "neu-flat text-slate-800"
                                : isDark
                                ? "bg-[#202024] border border-[#2E2E32] text-zinc-200"
                                : "bg-white border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                                  isNeumorphic
                                    ? "neu-inset text-indigo-600"
                                    : isDark
                                    ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                                    : "bg-[#FEF08A] text-[#1E1B18] border border-[#1E1B18]"
                                }`}
                              >
                                {req.toUsername.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-xs">{req.toUserName}</span>
                                  <span className="text-[11px] font-mono text-zinc-500">@{req.toUsername}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-500 mt-0.5">
                                  <Clock className="w-3 h-3 animate-spin" />
                                  <span>Pending Approval • {req.timestamp}</span>
                                </div>
                                {req.note && (
                                  <p className="text-[11px] text-zinc-400 mt-1 italic">
                                    "{req.note}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              id={`btn-cancel-request-${req.id}`}
                              onClick={() => handleCancelRequest(req.id)}
                              className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                                isDark
                                  ? "bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-700"
                                  : "bg-zinc-100 text-zinc-600 hover:text-rose-600 border border-zinc-300"
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </motion.div>
                        ))
                    )}
                  </div>
                )}

                {/* SubTab 3: Request History */}
                {requestsSubTab === "history" && (
                  <div className="space-y-2.5">
                    {historyRequests.length === 0 ? (
                      <div className="py-8 text-center text-xs font-mono text-zinc-500">
                        No previous friend request history.
                      </div>
                    ) : (
                      historyRequests.map((req) => (
                        <div
                          key={req.id}
                          className={`p-3 rounded-xl flex items-center justify-between gap-2 text-xs font-mono opacity-80 ${
                            isDark ? "bg-zinc-900/60 border border-zinc-800 text-zinc-300" : "bg-zinc-50 border border-zinc-200 text-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>
                              {req.direction === "incoming" ? `From @${req.fromUsername}` : `To @${req.toUsername}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                req.status === "accepted"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : req.status === "declined"
                                  ? "bg-rose-500/20 text-rose-400"
                                  : "bg-zinc-500/20 text-zinc-400"
                              }`}
                            >
                              {req.status}
                            </span>
                            <span className="text-[10px] text-zinc-500">{req.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. STUDY SQUAD CHAT */}
            {activeTab === "party" && (
              <div className="space-y-3">
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {partyMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.type === "nudge"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                          : isNeumorphic
                          ? "neu-flat text-slate-800"
                          : isDark
                          ? "bg-[#202024] border border-[#2E2E32] text-zinc-200"
                          : "bg-white border-2 border-[#1E1B18] text-[#1E1B18]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                        <span className="font-black">{msg.userName}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="font-sans leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Squad Chat Input */}
                <form onSubmit={handleSendPartyMessage} className="flex items-center gap-2 pt-2">
                  <input
                    id="input-squad-chat-msg"
                    type="text"
                    value={partyInput}
                    onChange={(e) => setPartyInput(e.target.value)}
                    placeholder="Drop a study tip, motivation, or ask the squad..."
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none border transition-all ${
                      isNeumorphic
                        ? "neu-inset bg-slate-100"
                        : isDark
                        ? "bg-[#202024] border-[#2E2E32] text-zinc-100"
                        : "bg-white border-2 border-[#1E1B18] text-[#1E1B18]"
                    }`}
                  />
                  <button
                    type="submit"
                    className={`px-3.5 py-2 rounded-xl font-mono font-black text-xs uppercase flex items-center gap-1.5 ${
                      isNeumorphic
                        ? "neu-btn-primary text-white"
                        : isDark
                        ? "bg-amber-400 text-zinc-950 font-bold"
                        : "bg-[#4F46E5] text-white border-2 border-[#1E1B18]"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div
            className={`p-3 sm:px-6 flex items-center justify-between text-[11px] font-mono border-t ${
              isNeumorphic
                ? "border-slate-300/80 bg-slate-100/60 text-slate-600"
                : isDark
                ? "border-[#27272A] bg-[#202024] text-zinc-400"
                : "border-[#1E1B18] bg-[#FAF5EE] text-zinc-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <span>🤝 {mutualFriends.length} Connected Partners</span>
              {pendingIncomingCount > 0 && (
                <span className="text-amber-500 font-bold">📬 {pendingIncomingCount} New Request{pendingIncomingCount > 1 ? "s" : ""}</span>
              )}
            </div>
            <button
              onClick={() => {
                soundFx.playTap();
                onClose();
              }}
              className="font-bold hover:underline"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

