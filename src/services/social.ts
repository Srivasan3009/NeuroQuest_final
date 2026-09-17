// Real-Time Social & Friends Feed Service for NeuroQuest
// Manages friend connections, friend requests, study party updates, activity feeds, and real-time prompt sharing

export interface FriendUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  avatarLetter: string;
  level: number;
  sparks: number;
  xp: number;
  status: "online" | "in_quest" | "idle" | "studying";
  activeQuestTitle?: string;
  streakDays: number;
  lastActive: string;
  isMutual: boolean;
  role: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUsername: string;
  fromAvatarLetter: string;
  fromLevel: number;
  fromRole: string;
  toUserId: string;
  toUserName: string;
  toUsername: string;
  timestamp: string;
  status: "pending" | "accepted" | "declined" | "canceled";
  direction: "incoming" | "outgoing";
  note?: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLetter: string;
  type: "quest_complete" | "level_up" | "streak_milestone" | "badge_earned" | "prompt_shared" | "chest_claimed";
  title: string;
  description: string;
  timestamp: string;
  xpAwarded?: number;
  sparksAwarded?: number;
  clapsCount: number;
  hasClapped?: boolean;
  sharedPayload?: {
    promptSnippet?: string;
    badgeName?: string;
    stageName?: string;
  };
}

export interface StudyPartyMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLetter: string;
  text: string;
  timestamp: string;
  type: "chat" | "shoutout" | "nudge" | "prompt_drop";
}

const STORAGE_FRIENDS_KEY = "neuroquest_social_friends_v1";
const STORAGE_REQUESTS_KEY = "neuroquest_social_requests_v1";
const STORAGE_FEED_KEY = "neuroquest_social_feed_v1";
const STORAGE_PARTY_MESSAGES_KEY = "neuroquest_social_party_messages_v1";

// Initial community members & fellow cadets
const INITIAL_CADETS: FriendUser[] = [
  {
    id: "cadet-elena",
    name: "Elena Rostova",
    username: "elena_ai",
    avatarLetter: "E",
    level: 7,
    sparks: 1420,
    xp: 3850,
    status: "in_quest",
    activeQuestTitle: "Vision Transformers & Attention Heads",
    streakDays: 14,
    lastActive: "Just now",
    isMutual: true,
    role: "Neural Architect",
  },
  {
    id: "cadet-marcus",
    name: "Marcus Vance",
    username: "marcus_v",
    avatarLetter: "M",
    level: 5,
    sparks: 980,
    xp: 2400,
    status: "online",
    activeQuestTitle: "Prompt Injection Defense & Guardrails",
    streakDays: 9,
    lastActive: "2m ago",
    isMutual: true,
    role: "Security Engineer",
  },
  {
    id: "cadet-sophia",
    name: "Sophia Chen",
    username: "sophia_ml",
    avatarLetter: "S",
    level: 6,
    sparks: 1150,
    xp: 3100,
    status: "studying",
    activeQuestTitle: "RAG Chunking Strategies",
    streakDays: 12,
    lastActive: "5m ago",
    isMutual: true,
    role: "Knowledge Engineer",
  },
  {
    id: "cadet-tariq",
    name: "Tariq Al-Mansoor",
    username: "tariq_dev",
    avatarLetter: "T",
    level: 4,
    sparks: 650,
    xp: 1600,
    status: "idle",
    activeQuestTitle: "Tokenization Demystified",
    streakDays: 4,
    lastActive: "1h ago",
    isMutual: false,
    role: "Full-Stack Cadet",
  },
  {
    id: "cadet-anya",
    name: "Anya Sharma",
    username: "anya_neuro",
    avatarLetter: "A",
    level: 8,
    sparks: 2100,
    xp: 5200,
    status: "online",
    activeQuestTitle: "Agentic Tool Calling Sandbox",
    streakDays: 21,
    lastActive: "Just now",
    isMutual: false,
    role: "Autonomous Agent Lead",
  },
];

const INITIAL_FEED_ITEMS: ActivityFeedItem[] = [
  {
    id: "feed-1",
    userId: "cadet-elena",
    userName: "Elena Rostova",
    userLetter: "E",
    type: "quest_complete",
    title: "Conquered 'Multi-Head Attention Visualizer'",
    description: "Elena earned +120 XP and unlocked the Self-Attention Matrix mastery.",
    timestamp: "12m ago",
    xpAwarded: 120,
    sparksAwarded: 15,
    clapsCount: 8,
    hasClapped: false,
    sharedPayload: {
      stageName: "Multi-Modal & Transformer Architectures",
    },
  },
  {
    id: "feed-2",
    userId: "cadet-sophia",
    userName: "Sophia Chen",
    userLetter: "S",
    type: "streak_milestone",
    title: "Reached a 12-Day Neural Streak 🔥",
    description: "Daily consistency multiplier activated! Learning speed +15%.",
    timestamp: "45m ago",
    clapsCount: 14,
    hasClapped: false,
  },
  {
    id: "feed-3",
    userId: "cadet-marcus",
    userName: "Marcus Vance",
    userLetter: "M",
    type: "prompt_shared",
    title: "Shared a System Prompt Framework",
    description: "Zero-Shot Chain of Thought template for robust mathematical evaluation.",
    timestamp: "2h ago",
    clapsCount: 19,
    hasClapped: true,
    sharedPayload: {
      promptSnippet: "You are a verification engine. Before answering, trace three independent logical derivations...",
    },
  },
  {
    id: "feed-4",
    userId: "cadet-anya",
    userName: "Anya Sharma",
    userLetter: "A",
    type: "level_up",
    title: "Ranked up to Level 8: Autonomous Agent Lead",
    description: "Unlocked Agent Execution Playground & Custom Tool Integration permissions.",
    timestamp: "3h ago",
    xpAwarded: 500,
    clapsCount: 27,
    hasClapped: true,
  },
];

const INITIAL_PARTY_MESSAGES: StudyPartyMessage[] = [
  {
    id: "msg-1",
    userId: "cadet-elena",
    userName: "Elena Rostova",
    userLetter: "E",
    text: "Working through the attention heads quest! The interactive vector matrix was super intuitive.",
    timestamp: "15m ago",
    type: "chat",
  },
  {
    id: "msg-2",
    userId: "cadet-sophia",
    userName: "Sophia Chen",
    userLetter: "S",
    text: "Keep crushing it everyone! Let's get our squad to Diamond tier this sprint.",
    timestamp: "8m ago",
    type: "shoutout",
  },
  {
    id: "msg-3",
    userId: "cadet-marcus",
    userName: "Marcus Vance",
    userLetter: "M",
    text: "Tip: For the boss challenge, check the cosine similarity threshold before submitting.",
    timestamp: "2m ago",
    type: "chat",
  },
];

const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: "req-tariq",
    fromUserId: "cadet-tariq",
    fromUserName: "Tariq Al-Mansoor",
    fromUsername: "tariq_dev",
    fromAvatarLetter: "T",
    fromLevel: 4,
    fromRole: "Full-Stack Cadet",
    toUserId: "you",
    toUserName: "You",
    toUsername: "cadet_current",
    timestamp: "10m ago",
    status: "pending",
    direction: "incoming",
    note: "Hey! Want to team up on the Tokenization and Vector Matrix quests?",
  },
  {
    id: "req-anya",
    fromUserId: "cadet-anya",
    fromUserName: "Anya Sharma",
    fromUsername: "anya_neuro",
    fromAvatarLetter: "A",
    fromLevel: 8,
    fromRole: "Autonomous Agent Lead",
    toUserId: "you",
    toUserName: "You",
    toUsername: "cadet_current",
    timestamp: "1h ago",
    status: "pending",
    direction: "incoming",
    note: "Looking for collaborative research partners in Agent Tool Calling.",
  },
];

export class SocialService {
  private static instance: SocialService;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.initDefaultsIfEmpty();
  }

  public static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService();
    }
    return SocialService.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private initDefaultsIfEmpty() {
    if (typeof window === "undefined") return;
    try {
      if (!localStorage.getItem(STORAGE_FRIENDS_KEY)) {
        localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(INITIAL_CADETS));
      }
      if (!localStorage.getItem(STORAGE_FEED_KEY)) {
        localStorage.setItem(STORAGE_FEED_KEY, JSON.stringify(INITIAL_FEED_ITEMS));
      }
      if (!localStorage.getItem(STORAGE_PARTY_MESSAGES_KEY)) {
        localStorage.setItem(STORAGE_PARTY_MESSAGES_KEY, JSON.stringify(INITIAL_PARTY_MESSAGES));
      }
      if (!localStorage.getItem(STORAGE_REQUESTS_KEY)) {
        localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(INITIAL_FRIEND_REQUESTS));
      }
    } catch {
      // Ignore
    }
  }

  // --- FRIENDS LIST ---
  public getFriends(): FriendUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_FRIENDS_KEY);
      return raw ? JSON.parse(raw) : INITIAL_CADETS;
    } catch {
      return INITIAL_CADETS;
    }
  }

  public addFriend(cadet: FriendUser) {
    const list = this.getFriends();
    if (!list.some((f) => f.id === cadet.id || f.username.toLowerCase() === cadet.username.toLowerCase())) {
      const updated = [cadet, ...list];
      localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(updated));
      this.notify();
    }
  }

  public removeFriend(friendId: string) {
    const list = this.getFriends().filter((f) => f.id !== friendId);
    localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(list));
    this.notify();
  }

  public toggleFollow(cadetId: string): boolean {
    const list = this.getFriends().map((f) => {
      if (f.id === cadetId) {
        return { ...f, isMutual: !f.isMutual };
      }
      return f;
    });
    localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(list));
    this.notify();
    const updated = list.find((f) => f.id === cadetId);
    return Boolean(updated?.isMutual);
  }

  // --- FRIEND REQUESTS MANAGEMENT ---
  public getFriendRequests(): FriendRequest[] {
    try {
      const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
      return raw ? JSON.parse(raw) : INITIAL_FRIEND_REQUESTS;
    } catch {
      return INITIAL_FRIEND_REQUESTS;
    }
  }

  public getPendingRequestsCount(): number {
    return this.getFriendRequests().filter((r) => r.status === "pending" && r.direction === "incoming").length;
  }

  public getIncomingRequests(): FriendRequest[] {
    return this.getFriendRequests().filter((r) => r.direction === "incoming");
  }

  public getOutgoingRequests(): FriendRequest[] {
    return this.getFriendRequests().filter((r) => r.direction === "outgoing");
  }

  public getUserRelationshipStatus(cadetIdOrUsername: string): "mutual" | "pending_incoming" | "pending_outgoing" | "none" {
    const clean = cadetIdOrUsername.replace(/^@/, "").toLowerCase();
    const friends = this.getFriends();
    const friend = friends.find((f) => f.id === cadetIdOrUsername || f.username.toLowerCase() === clean);
    if (friend && friend.isMutual) {
      return "mutual";
    }

    const requests = this.getFriendRequests().filter((r) => r.status === "pending");
    const incoming = requests.find((r) => r.direction === "incoming" && (r.fromUserId === cadetIdOrUsername || r.fromUsername.toLowerCase() === clean));
    if (incoming) return "pending_incoming";

    const outgoing = requests.find((r) => r.direction === "outgoing" && (r.toUserId === cadetIdOrUsername || r.toUsername.toLowerCase() === clean));
    if (outgoing) return "pending_outgoing";

    return "none";
  }

  // Send a new friend request
  public sendFriendRequest(
    targetHandle: string,
    sender: { id?: string; fullName?: string; username?: string; level?: number; role?: string },
    note?: string
  ): { success: boolean; message: string; request?: FriendRequest } {
    const cleanHandle = targetHandle.replace(/^@/, "").trim().toLowerCase();
    if (!cleanHandle) {
      return { success: false, message: "Please enter a valid @username." };
    }

    const currentUserName = sender.fullName || "Cadet";
    const currentUsername = sender.username || "cadet_current";
    const currentUserId = sender.id || "you";
    const currentLevel = sender.level || 1;
    const currentRole = sender.role || "AI Cadet";

    // Prevent adding self
    if (cleanHandle === currentUsername.toLowerCase()) {
      return { success: false, message: "You cannot send a friend request to yourself." };
    }

    // Check existing friends
    const friends = this.getFriends();
    const existingFriend = friends.find((f) => f.username.toLowerCase() === cleanHandle);
    if (existingFriend && existingFriend.isMutual) {
      return { success: false, message: `@${existingFriend.username} is already your study partner!` };
    }

    // Check existing pending requests
    const allRequests = this.getFriendRequests();
    const existingOutgoing = allRequests.find(
      (r) => r.status === "pending" && r.direction === "outgoing" && r.toUsername.toLowerCase() === cleanHandle
    );
    if (existingOutgoing) {
      return { success: false, message: `A friend request to @${cleanHandle} is already pending.` };
    }

    const existingIncoming = allRequests.find(
      (r) => r.status === "pending" && r.direction === "incoming" && r.fromUsername.toLowerCase() === cleanHandle
    );
    if (existingIncoming) {
      // Auto-accept if they had already requested you
      return this.acceptFriendRequest(existingIncoming.id, currentUserName);
    }

    // Create target cadet metadata
    const targetName = existingFriend ? existingFriend.name : cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);
    const targetLetter = cleanHandle.charAt(0).toUpperCase();

    const newRequest: FriendRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromUserId: currentUserId,
      fromUserName: currentUserName,
      fromUsername: currentUsername,
      fromAvatarLetter: (currentUserName.charAt(0) || "Y").toUpperCase(),
      fromLevel: currentLevel,
      fromRole: currentRole,
      toUserId: existingFriend ? existingFriend.id : `cadet-${cleanHandle}`,
      toUserName: targetName,
      toUsername: cleanHandle,
      timestamp: "Just now",
      status: "pending",
      direction: "outgoing",
      note: note || "Sent you a squad study request.",
    };

    const updatedRequests = [newRequest, ...allRequests];
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updatedRequests));

    // If cadet is not yet in community list, register them as pending explorer
    if (!existingFriend) {
      const newCadet: FriendUser = {
        id: newRequest.toUserId,
        name: targetName,
        username: cleanHandle,
        avatarLetter: targetLetter,
        level: Math.floor(Math.random() * 5) + 2,
        sparks: Math.floor(Math.random() * 800) + 200,
        xp: Math.floor(Math.random() * 2000) + 500,
        status: "online",
        activeQuestTitle: "Prompt Engineering Foundations",
        streakDays: Math.floor(Math.random() * 8) + 1,
        lastActive: "Just now",
        isMutual: false,
        role: "AI Explorer",
      };
      this.addFriend(newCadet);
    }

    this.notify();
    return { success: true, message: `Friend request sent to @${cleanHandle}!`, request: newRequest };
  }

  // Accept incoming friend request
  public acceptFriendRequest(requestId: string, currentUserName?: string): { success: boolean; message: string } {
    const requests = this.getFriendRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: "Friend request not found." };
    }

    // Mark as accepted
    const updatedRequests = requests.map((r) => (r.id === requestId ? { ...r, status: "accepted" as const } : r));
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updatedRequests));

    // Promote in friends list to mutual
    const friends = this.getFriends();
    const friendIndex = friends.findIndex((f) => f.id === req.fromUserId || f.username.toLowerCase() === req.fromUsername.toLowerCase());

    if (friendIndex >= 0) {
      friends[friendIndex].isMutual = true;
      friends[friendIndex].status = "online";
      localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(friends));
    } else {
      const newFriend: FriendUser = {
        id: req.fromUserId,
        name: req.fromUserName,
        username: req.fromUsername,
        avatarLetter: req.fromAvatarLetter,
        level: req.fromLevel || 5,
        sparks: 950,
        xp: 2600,
        status: "online",
        activeQuestTitle: "Transformer Architecture Master",
        streakDays: 7,
        lastActive: "Just now",
        isMutual: true,
        role: req.fromRole || "AI Explorer",
      };
      this.addFriend(newFriend);
    }

    // Post to live activity feed
    this.postFeedItem({
      userId: req.fromUserId,
      userName: req.fromUserName,
      userLetter: req.fromAvatarLetter,
      type: "quest_complete",
      title: `Connected with ${currentUserName || "You"} 🤝`,
      description: `Accepted friend request! Now collaborating in the Neural Study Squad.`,
      timestamp: "Just now",
    });

    this.notify();
    return { success: true, message: `You are now study partners with @${req.fromUsername}!` };
  }

  // Decline incoming friend request
  public declineFriendRequest(requestId: string): { success: boolean; message: string } {
    const requests = this.getFriendRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: "Request not found." };
    }

    const updatedRequests = requests.map((r) => (r.id === requestId ? { ...r, status: "declined" as const } : r));
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updatedRequests));
    this.notify();
    return { success: true, message: `Declined request from @${req.fromUsername}.` };
  }

  // Cancel outgoing friend request
  public cancelFriendRequest(requestId: string): { success: boolean; message: string } {
    const requests = this.getFriendRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: "Request not found." };
    }

    const updatedRequests = requests.map((r) => (r.id === requestId ? { ...r, status: "canceled" as const } : r));
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updatedRequests));
    this.notify();
    return { success: true, message: `Canceled request to @${req.toUsername}.` };
  }

  // Legacy helper retained for backward compatibility
  public sendFriendRequestByHandle(handle: string, currentUserName: string): { success: boolean; message: string } {
    return this.sendFriendRequest(handle, { fullName: currentUserName });
  }

  // --- ACTIVITY FEED ---
  public getFeed(): ActivityFeedItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_FEED_KEY);
      return raw ? JSON.parse(raw) : INITIAL_FEED_ITEMS;
    } catch {
      return INITIAL_FEED_ITEMS;
    }
  }

  public postFeedItem(item: Omit<ActivityFeedItem, "id" | "clapsCount" | "hasClapped">) {
    const feed = this.getFeed();
    const newItem: ActivityFeedItem = {
      ...item,
      id: `feed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clapsCount: 0,
      hasClapped: false,
    };
    const updated = [newItem, ...feed.slice(0, 30)];
    localStorage.setItem(STORAGE_FEED_KEY, JSON.stringify(updated));
    this.notify();
  }

  public toggleClap(feedId: string): { clapped: boolean; count: number } {
    const feed = this.getFeed();
    let isClapped = false;
    let newCount = 0;

    const updated = feed.map((item) => {
      if (item.id === feedId) {
        const nextState = !item.hasClapped;
        isClapped = nextState;
        newCount = nextState ? item.clapsCount + 1 : Math.max(0, item.clapsCount - 1);
        return {
          ...item,
          hasClapped: nextState,
          clapsCount: newCount,
        };
      }
      return item;
    });

    localStorage.setItem(STORAGE_FEED_KEY, JSON.stringify(updated));
    this.notify();
    return { clapped: isClapped, count: newCount };
  }

  // --- STUDY PARTY CHAT & NUDGES ---
  public getPartyMessages(): StudyPartyMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_PARTY_MESSAGES_KEY);
      return raw ? JSON.parse(raw) : INITIAL_PARTY_MESSAGES;
    } catch {
      return INITIAL_PARTY_MESSAGES;
    }
  }

  public sendPartyMessage(msg: {
    userId: string;
    userName: string;
    userAvatar?: string;
    userLetter: string;
    text: string;
    type?: "chat" | "shoutout" | "nudge" | "prompt_drop";
  }) {
    const messages = this.getPartyMessages();
    const newMsg: StudyPartyMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: msg.userId,
      userName: msg.userName,
      userAvatar: msg.userAvatar,
      userLetter: msg.userLetter,
      text: msg.text,
      timestamp: "Just now",
      type: msg.type || "chat",
    };
    const updated = [...messages, newMsg];
    localStorage.setItem(STORAGE_PARTY_MESSAGES_KEY, JSON.stringify(updated));
    this.notify();
  }

  public sendNudge(toUserName: string, fromUserName: string) {
    this.sendPartyMessage({
      userId: "you",
      userName: fromUserName || "You",
      userLetter: "Y",
      text: `⚡ Sent a study energy boost to ${toUserName}! Keep the streak alive!`,
      type: "nudge",
    });
  }
}

export const socialService = SocialService.getInstance();
