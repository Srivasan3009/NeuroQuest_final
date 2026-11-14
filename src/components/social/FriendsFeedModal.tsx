import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  Flame,
  Zap,
  Send,
  MessageSquare,
  Heart,
  Search,
  CheckCircle2,
  X,
  Activity,
  Clock,
  Inbox,
  SendHorizonal,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, AppTheme } from "../../types";
import {
  socialService,
  FriendUser,
  FriendRequest,
  ActivityFeedItem,
  StudyPartyMessage,
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
  theme,
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

  const isDark =
    theme === "obsidian-noir" ||
    theme === "obsidian-gold" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

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

  const pendingIncomingCount = friendRequests.filter(
    (r) => r.status === "pending" && r.direction === "incoming"
  ).length;
  const pendingOutgoingCount = friendRequests.filter(
    (r) => r.status === "pending" && r.direction === "outgoing"
  ).length;
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
    setActionNotice({ type: "success", text: `Sent study boost to ${friend.name}` });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const mutualFriends = friends.filter((f) => f.isMutual);
  const activeCount = friends.filter((f) => f.status === "online" || f.status === "in_quest").length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl overflow-hidden apple-surface ${
            isDark ? "text-zinc-100" : "text-[#1D1D1F]"
          }`}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 flex items-center justify-between border-b apple-glass ${
              isDark ? "border-white/[0.08]" : "border-black/[0.06]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isDark
                    ? "bg-[#2997FF]/15 text-[#2997FF]"
                    : "bg-[#0071E3]/10 text-[#0071E3]"
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-semibold tracking-tight">
                  Study Squad & Social
                </h2>
                <div
                  className={`flex items-center gap-1.5 text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono tabular-nums">{activeCount} active</span>
                  {pendingIncomingCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-[#0071E3] dark:text-[#2997FF] font-medium">
                        {pendingIncomingCount} pending request{pendingIncomingCount > 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playTap();
                onClose();
              }}
              aria-label="Close squad modal"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14]"
                  : "bg-black/[0.05] text-[#6E6E73] hover:bg-black/[0.08] hover:text-[#1D1D1F]"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Notice Banner */}
          {actionNotice && (
            <div
              className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
                actionNotice.type === "success"
                  ? isDark
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isDark
                  ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionNotice.text}</span>
              </div>
              <button onClick={() => setActionNotice(null)} className="opacity-70 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Segmented Tab Strip */}
          <div
            className={`px-5 py-2.5 border-b overflow-x-auto no-scrollbar ${
              isDark
                ? "border-white/[0.06] bg-[#141416]/50"
                : "border-black/[0.05] bg-[#F5F5F7]/70"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-max">
              <button
                id="tab-btn-activity-feed"
                onClick={() => {
                  soundFx.playTap();
                  setActiveTab("feed");
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === "feed"
                    ? isDark
                      ? "bg-[#2C2C2E] text-white shadow-xs"
                      : "bg-white text-[#1D1D1F] shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Feed</span>
                <span className="font-mono tabular-nums opacity-65">{feed.length}</span>
              </button>

              <button
                id="tab-btn-friends-list"
                onClick={() => {
                  soundFx.playTap();
                  setActiveTab("friends");
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === "friends"
                    ? isDark
                      ? "bg-[#2C2C2E] text-white shadow-xs"
                      : "bg-white text-[#1D1D1F] shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Partners</span>
                <span className="font-mono tabular-nums opacity-65">{mutualFriends.length}</span>
              </button>

              <button
                id="tab-btn-friend-requests"
                onClick={() => {
                  soundFx.playTap();
                  setActiveTab("requests");
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === "requests"
                    ? isDark
                      ? "bg-[#2C2C2E] text-white shadow-xs"
                      : "bg-white text-[#1D1D1F] shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Requests</span>
                {pendingIncomingCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#0071E3] text-white text-[10px] font-mono tabular-nums font-semibold">
                    {pendingIncomingCount}
                  </span>
                ) : (
                  <span className="font-mono tabular-nums opacity-65">
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === "party"
                    ? isDark
                      ? "bg-[#2C2C2E] text-white shadow-xs"
                      : "bg-white text-[#1D1D1F] shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Squad Chat</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* 1. ACTIVITY FEED TAB */}
            {activeTab === "feed" && (
              <div
                className={`rounded-2xl divide-y border ${
                  isDark
                    ? "bg-[#2C2C2E]/40 border-white/[0.06] divide-white/[0.06]"
                    : "bg-[#F5F5F7]/70 border-black/[0.05] divide-black/[0.05]"
                }`}
              >
                {feed.map((item) => (
                  <div key={item.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-sm shrink-0 ${
                          isDark
                            ? "bg-[#2997FF]/15 text-[#2997FF]"
                            : "bg-[#0071E3]/10 text-[#0071E3]"
                        }`}
                      >
                        {item.userLetter}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="font-semibold">{item.userName}</span>
                          <span className={isDark ? "text-zinc-500" : "text-[#86868B]"}>
                            · {item.timestamp}
                          </span>
                        </div>
                        <div className="font-medium text-sm mt-0.5">{item.title}</div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isDark ? "text-zinc-400" : "text-[#6E6E73]"
                          }`}
                        >
                          {item.description}
                        </p>

                        {item.sharedPayload?.promptSnippet && (
                          <div
                            className={`mt-2.5 p-3 rounded-xl font-mono text-[11px] border ${
                              isDark
                                ? "bg-[#1C1C1E] border-white/[0.06] text-emerald-300"
                                : "bg-white border-black/[0.06] text-[#1D1D1F]"
                            }`}
                          >
                            <div
                              className={`text-[10px] uppercase tracking-wider mb-1 ${
                                isDark ? "text-zinc-500" : "text-[#86868B]"
                              }`}
                            >
                              Prompt Snippet
                            </div>
                            <code>{item.sharedPayload.promptSnippet}</code>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleClap(item)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-mono tabular-nums font-medium flex items-center gap-1.5 transition-colors shrink-0 border ${
                        item.hasClapped
                          ? isDark
                            ? "bg-[#2997FF]/15 text-[#2997FF] border-[#2997FF]/30"
                            : "bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/25"
                          : isDark
                          ? "bg-[#1C1C1E] text-zinc-400 hover:text-white border-white/[0.06]"
                          : "bg-white text-[#6E6E73] hover:text-[#1D1D1F] border-black/[0.06]"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.hasClapped ? "fill-current" : ""}`} />
                      <span>{item.clapsCount}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 2. FRIENDS DIRECTORY */}
            {activeTab === "friends" && (
              <div className="space-y-4">
                {/* Search / Invite Bar */}
                <form
                  onSubmit={handleSendFriendRequest}
                  className="p-3 rounded-2xl flex flex-col gap-2.5 apple-surface-muted"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#86868B] ml-1 shrink-0" />
                    <input
                      id="input-friend-handle-search"
                      type="text"
                      value={searchHandle}
                      onChange={(e) => setSearchHandle(e.target.value)}
                      placeholder="Invite by @handle (e.g. @sophia_ml)"
                      className="w-full bg-transparent text-xs outline-none placeholder:text-[#86868B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNoteInput(!showNoteInput)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${
                        showNoteInput
                          ? "bg-[#0071E3]/15 text-[#0071E3] dark:text-[#2997FF]"
                          : isDark
                          ? "text-zinc-400 hover:text-zinc-200"
                          : "text-[#6E6E73] hover:text-[#1D1D1F]"
                      }`}
                    >
                      {showNoteInput ? "Note ✓" : "+ Note"}
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                  </div>
                  {showNoteInput && (
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Optional note (e.g. 'Let's practice RAG concepts together')"
                      className={`w-full px-3 py-2 rounded-xl text-xs outline-none border ${
                        isDark
                          ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-100 placeholder-zinc-500"
                          : "bg-white border-black/[0.08] text-[#1D1D1F] placeholder-[#86868B]"
                      }`}
                    />
                  )}
                </form>

                {/* Friends Directory List */}
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between text-xs px-1 ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    <span className="font-medium">Directory ({friends.length})</span>
                    <span className="font-mono tabular-nums">{mutualFriends.length} partners</span>
                  </div>

                  <div
                    className={`rounded-2xl divide-y border ${
                      isDark
                        ? "bg-[#2C2C2E]/40 border-white/[0.06] divide-white/[0.06]"
                        : "bg-[#F5F5F7]/70 border-black/[0.05] divide-black/[0.05]"
                    }`}
                  >
                    {friends.map((f) => {
                      const status = socialService.getUserRelationshipStatus(f.id);
                      return (
                        <div key={f.id} className="p-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-sm ${
                                  isDark
                                    ? "bg-[#2997FF]/15 text-[#2997FF]"
                                    : "bg-[#0071E3]/10 text-[#0071E3]"
                                }`}
                              >
                                {f.avatarLetter}
                              </div>
                              <span
                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                                  isDark ? "border-[#1C1C1E]" : "border-[#F5F5F7]"
                                } ${
                                  f.status === "online" || f.status === "in_quest"
                                    ? "bg-emerald-500"
                                    : f.status === "studying"
                                    ? "bg-amber-500"
                                    : "bg-zinc-400"
                                }`}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-sm">{f.name}</span>
                                <span className={`text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                                  @{f.username}
                                </span>
                              </div>
                              <div
                                className={`flex items-center gap-1.5 text-[11px] font-mono tabular-nums mt-0.5 ${
                                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                                }`}
                              >
                                <span>Lvl {f.level}</span>
                                <span>·</span>
                                <span className="flex items-center gap-0.5 text-orange-500">
                                  <Flame className="w-3 h-3" /> {f.streakDays}d
                                </span>
                                <span>·</span>
                                <span className="font-sans truncate">{f.role}</span>
                              </div>
                              {f.activeQuestTitle && (
                                <div
                                  className={`text-[11px] line-clamp-1 mt-0.5 ${
                                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                                  }`}
                                >
                                  Studying:{" "}
                                  <span className="text-[#0071E3] dark:text-[#2997FF] font-medium">
                                    {f.activeQuestTitle}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {f.isMutual ? (
                              <>
                                <button
                                  onClick={() => handleNudge(f)}
                                  title="Send study boost"
                                  className={`p-2 rounded-full transition-colors border ${
                                    isDark
                                      ? "bg-[#1C1C1E] border-white/[0.08] text-amber-400 hover:bg-[#2C2C2E]"
                                      : "bg-white border-black/[0.06] text-amber-600 hover:bg-amber-50"
                                  }`}
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                </button>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${
                                    isDark
                                      ? "bg-emerald-500/15 text-emerald-300"
                                      : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  Partner
                                </span>
                              </>
                            ) : status === "pending_outgoing" ? (
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 whitespace-nowrap ${
                                  isDark
                                    ? "bg-white/[0.08] text-zinc-300"
                                    : "bg-black/[0.05] text-[#6E6E73]"
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>Sent</span>
                              </span>
                            ) : status === "pending_incoming" ? (
                              <button
                                onClick={() => {
                                  soundFx.playTap();
                                  setActiveTab("requests");
                                  setRequestsSubTab("incoming");
                                }}
                                className="px-3 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium flex items-center gap-1 whitespace-nowrap transition-colors"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Review</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  soundFx.playTap();
                                  socialService.sendFriendRequest(f.username, {
                                    id: user.id || "you",
                                    fullName: user.fullName || "Cadet",
                                    username: user.fullName
                                      ? user.fullName.toLowerCase().replace(/\s+/g, "_")
                                      : "cadet_current",
                                    level: user.level || 1,
                                  });
                                  setActionNotice({
                                    type: "success",
                                    text: `Friend request sent to @${f.username}`,
                                  });
                                  setTimeout(() => setActionNotice(null), 3000);
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
                                  isDark
                                    ? "bg-[#1C1C1E] text-zinc-200 hover:bg-[#2C2C2E] border-white/[0.08]"
                                    : "bg-white text-[#1D1D1F] hover:bg-black/[0.03] border-black/[0.08]"
                                }`}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. FRIEND REQUESTS TAB */}
            {activeTab === "requests" && (
              <div className="space-y-4">
                <form
                  onSubmit={handleSendFriendRequest}
                  className="p-4 rounded-2xl flex flex-col gap-2.5 apple-surface-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <SendHorizonal className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                      <span>Send Study Partner Request</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNoteInput(!showNoteInput)}
                      className="text-xs text-[#0071E3] dark:text-[#2997FF] hover:underline"
                    >
                      {showNoteInput ? "Hide note" : "+ Add note"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="input-send-request-handle"
                      type="text"
                      value={searchHandle}
                      onChange={(e) => setSearchHandle(e.target.value)}
                      placeholder="Enter @username (e.g. @marcus_v, @tariq_dev)"
                      className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none border ${
                        isDark
                          ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-100 placeholder-zinc-500"
                          : "bg-white border-black/[0.08] text-[#1D1D1F] placeholder-[#86868B]"
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors"
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
                      placeholder="Invitation note (e.g. 'Let's collaborate on prompt workflows')"
                      className={`w-full px-3 py-2 rounded-xl text-xs outline-none border ${
                        isDark
                          ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-100 placeholder-zinc-500"
                          : "bg-white border-black/[0.08] text-[#1D1D1F] placeholder-[#86868B]"
                      }`}
                    />
                  )}
                </form>

                {/* Sub-Tabs */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundFx.playTap();
                      setRequestsSubTab("incoming");
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      requestsSubTab === "incoming"
                        ? "bg-[#0071E3] text-white"
                        : isDark
                        ? "text-zinc-400 hover:bg-white/[0.06]"
                        : "text-[#6E6E73] hover:bg-black/[0.05]"
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      requestsSubTab === "outgoing"
                        ? "bg-[#0071E3] text-white"
                        : isDark
                        ? "text-zinc-400 hover:bg-white/[0.06]"
                        : "text-[#6E6E73] hover:bg-black/[0.05]"
                    }`}
                  >
                    <SendHorizonal className="w-3.5 h-3.5" />
                    <span>Sent ({pendingOutgoingCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playTap();
                      setRequestsSubTab("history");
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      requestsSubTab === "history"
                        ? "bg-[#0071E3] text-white"
                        : isDark
                        ? "text-zinc-400 hover:bg-white/[0.06]"
                        : "text-[#6E6E73] hover:bg-black/[0.05]"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History ({historyRequests.length})</span>
                  </button>
                </div>

                {/* Incoming */}
                {requestsSubTab === "incoming" && (
                  <div className="space-y-2.5">
                    {friendRequests.filter((r) => r.status === "pending" && r.direction === "incoming")
                      .length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <div className="w-10 h-10 mx-auto rounded-full apple-surface-muted flex items-center justify-center text-[#86868B]">
                          <Inbox className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium">No incoming requests</div>
                        <p className={`text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                          Invite peers from the Partners tab to study together.
                        </p>
                      </div>
                    ) : (
                      friendRequests
                        .filter((r) => r.status === "pending" && r.direction === "incoming")
                        .map((req) => (
                          <div key={req.id} className="p-4 rounded-2xl apple-surface-muted">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-sm shrink-0 ${
                                    isDark
                                      ? "bg-[#2997FF]/15 text-[#2997FF]"
                                      : "bg-[#0071E3]/10 text-[#0071E3]"
                                  }`}
                                >
                                  {req.fromAvatarLetter}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                    <span className="font-semibold text-sm">{req.fromUserName}</span>
                                    <span className={isDark ? "text-zinc-400" : "text-[#6E6E73]"}>
                                      @{req.fromUsername}
                                    </span>
                                    <span className="text-[#86868B]">·</span>
                                    <span className="font-mono tabular-nums text-[#0071E3] dark:text-[#2997FF] font-medium">
                                      Lvl {req.fromLevel}
                                    </span>
                                    <span className="text-[#86868B]">· {req.timestamp}</span>
                                  </div>
                                  <div className={`text-xs mt-0.5 ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                                    {req.fromRole}
                                  </div>
                                  {req.note && (
                                    <p
                                      className={`text-xs mt-2 p-2.5 rounded-xl border ${
                                        isDark
                                          ? "bg-[#1C1C1E] border-white/[0.06] text-zinc-300"
                                          : "bg-white border-black/[0.06] text-[#1D1D1F]"
                                      }`}
                                    >
                                      "{req.note}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <button
                                  id={`btn-accept-request-${req.id}`}
                                  onClick={() => handleAcceptRequest(req.id)}
                                  className="px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  id={`btn-decline-request-${req.id}`}
                                  onClick={() => handleDeclineRequest(req.id)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap transition-colors border ${
                                    isDark
                                      ? "bg-[#1C1C1E] text-zinc-300 hover:bg-[#2C2C2E] border-white/[0.08]"
                                      : "bg-white text-[#6E6E73] hover:text-[#1D1D1F] border-black/[0.08]"
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {/* Outgoing */}
                {requestsSubTab === "outgoing" && (
                  <div className="space-y-2.5">
                    {friendRequests.filter((r) => r.status === "pending" && r.direction === "outgoing")
                      .length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <div className="w-10 h-10 mx-auto rounded-full apple-surface-muted flex items-center justify-center text-[#86868B]">
                          <SendHorizonal className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium">No pending sent requests</div>
                        <p className={`text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                          Enter a @handle above to invite a peer to your squad.
                        </p>
                      </div>
                    ) : (
                      friendRequests
                        .filter((r) => r.status === "pending" && r.direction === "outgoing")
                        .map((req) => (
                          <div
                            key={req.id}
                            className="p-4 rounded-2xl flex items-center justify-between gap-3 apple-surface-muted"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-sm shrink-0 ${
                                  isDark
                                    ? "bg-[#2997FF]/15 text-[#2997FF]"
                                    : "bg-[#0071E3]/10 text-[#0071E3]"
                                }`}
                              >
                                {req.toUsername.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="font-semibold text-sm">{req.toUserName}</span>
                                  <span className={isDark ? "text-zinc-400" : "text-[#6E6E73]"}>
                                    @{req.toUsername}
                                  </span>
                                </div>
                                <div
                                  className={`flex items-center gap-1 text-[11px] mt-0.5 ${
                                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Pending · {req.timestamp}</span>
                                </div>
                                {req.note && (
                                  <p className={`text-xs mt-1 italic ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                                    "{req.note}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              id={`btn-cancel-request-${req.id}`}
                              onClick={() => handleCancelRequest(req.id)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors border ${
                                isDark
                                  ? "bg-[#1C1C1E] text-zinc-300 hover:text-rose-400 border-white/[0.08]"
                                  : "bg-white text-[#6E6E73] hover:text-rose-600 border-black/[0.08]"
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {/* History */}
                {requestsSubTab === "history" && (
                  <div className="space-y-2">
                    {historyRequests.length === 0 ? (
                      <div className={`py-8 text-center text-xs ${isDark ? "text-zinc-400" : "text-[#6E6E73]"}`}>
                        No request history yet.
                      </div>
                    ) : (
                      historyRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-3.5 rounded-2xl flex items-center justify-between gap-2 text-xs apple-surface-muted"
                        >
                          <span>
                            {req.direction === "incoming"
                              ? `From @${req.fromUsername}`
                              : `To @${req.toUsername}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${
                                req.status === "accepted"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : req.status === "declined"
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                  : "bg-zinc-500/15 text-zinc-500"
                              }`}
                            >
                              {req.status}
                            </span>
                            <span className={isDark ? "text-zinc-500" : "text-[#86868B]"}>
                              {req.timestamp}
                            </span>
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
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        msg.type === "nudge"
                          ? isDark
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                            : "bg-amber-50 border border-amber-200 text-amber-800"
                          : "apple-surface-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold">{msg.userName}</span>
                        <span className={isDark ? "text-zinc-500" : "text-[#86868B]"}>
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
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
                    placeholder="Share a study tip or message the squad..."
                    className={`flex-1 px-4 py-2.5 rounded-full text-xs outline-none border ${
                      isDark
                        ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-[#2997FF]"
                        : "bg-white border-black/[0.08] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3]"
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-3 flex items-center justify-between text-xs border-t apple-glass ${
              isDark ? "border-white/[0.08] text-zinc-400" : "border-black/[0.06] text-[#6E6E73]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono tabular-nums">{mutualFriends.length} partners</span>
              {pendingIncomingCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-[#0071E3] dark:text-[#2997FF] font-medium">
                    {pendingIncomingCount} new request{pendingIncomingCount > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                soundFx.playTap();
                onClose();
              }}
              className="font-medium text-[#0071E3] dark:text-[#2997FF] hover:underline"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
