import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  Users,
  FolderArchive,
  Bookmark,
  Award,
  LogOut,
  ChevronRight,
  ChevronDown,
  Volume2,
  Mic,
  Palette,
  Play,
  Check,
  Sparkles,
  ArrowLeft,
  Trophy,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { UserProfile, MascotRole, AppTheme, Stage } from "../../types";
import { audioManager, soundFx } from "../../utils/sound";
import { Achievements } from "./Achievements";
import {
  computeMilestoneBadges,
  getAchievementsSummary,
} from "../../utils/achievements";
import { AvatarPickerModal } from "./AvatarPickerModal";
import { FriendsFeedModal } from "../social/FriendsFeedModal";
import { dataStore } from "../../services/storage";
import { socialService } from "../../services/social";
import { AppleSurfaceButton } from "../ui/AppleSurfaceButton";

interface YouViewProps {
  user: UserProfile;
  stages?: Stage[];
  onSetTheme: (theme: AppTheme) => void;
  onSetMascotRole: (role: MascotRole) => void;
  onAddSparks: (amount: number) => void;
  onResetProgress: () => void;
  onSetStreakDays?: (days: number) => void;
  onCompleteQuest?: (questId: string, xp: number, skill: string) => void;
  onLogOut?: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
  theme?: AppTheme;
}

export const YouView: React.FC<YouViewProps> = ({
  user,
  stages,
  onSetTheme,
  onAddSparks,
  onResetProgress,
  onSetStreakDays,
  onCompleteQuest,
  onLogOut,
  onUpdateUser,
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const [inSettingsView, setInSettingsView] = useState(false);
  const [inAchievementsView, setInAchievementsView] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    setPendingRequestsCount(socialService.getPendingRequestsCount());
    const unsub = socialService.subscribe(() => {
      setPendingRequestsCount(socialService.getPendingRequestsCount());
    });
    return () => unsub();
  }, []);

  const handleSaveAvatar = async (newAvatarUrl: string) => {
    const updated: UserProfile = { ...user, avatarUrl: newAvatarUrl };
    await dataStore.saveUserProfile(updated);
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
  };

  const milestoneBadges = useMemo(
    () => computeMilestoneBadges(user, stages),
    [user, stages]
  );
  const achievementsSummary = useMemo(
    () => getAchievementsSummary(milestoneBadges),
    [milestoneBadges]
  );

  const [openAccordion, setOpenAccordion] = useState<string | null>(
    "preferences"
  );

  const [soundEnabled, setSoundEnabled] = useState(audioManager.isEnabled());
  const [soundVolume, setSoundVolume] = useState(
    Math.round(audioManager.getVolume() * 100)
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(
    audioManager.isHapticsEnabled()
  );
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState<string | null>(null);

  const userRankLabel =
    (user as { rank?: string }).rank || `Level ${user.level || 1} Cadet`;

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioManager.setEnabled(next);
    audioManager.playToggle(next);
  };

  const handleVolumeChange = (newVal: number) => {
    setSoundVolume(newVal);
    audioManager.setVolume(newVal / 100);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    audioManager.setHapticsEnabled(next);
    audioManager.playTap();
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    audioManager.playTap();
    onSetTheme(newTheme);
  };

  // Apple-style iOS Switch component
  const ToggleSwitch = ({
    id,
    enabled,
    onToggle,
  }: {
    id?: string;
    enabled: boolean;
    onToggle: () => void;
  }) => (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-250 p-0.5 shrink-0 ${
        enabled
          ? "bg-emerald-500"
          : isDark
          ? "bg-white/15"
          : "bg-black/15"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`block w-5 h-5 rounded-full bg-white shadow-sm ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  // -------------------------------------------------------------
  // ACHIEVEMENTS SCREEN VIEW
  // -------------------------------------------------------------
  if (inAchievementsView) {
    return (
      <motion.div
        key="achievements-section"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <Achievements
          user={user}
          stages={stages}
          onBack={() => setInAchievementsView(false)}
          onSetStreakDays={onSetStreakDays}
          onCompleteFoundationQuest={() => {
            if (onCompleteQuest) {
              onCompleteQuest("quest-1", 120, "Paradigm Modeling");
            }
          }}
          onResetProgress={onResetProgress}
          theme={theme}
        />
      </motion.div>
    );
  }

  // -------------------------------------------------------------
  // SETTINGS SCREEN VIEW
  // -------------------------------------------------------------
  if (inSettingsView) {
    return (
      <motion.div
        key="settings-section"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          id="settings-view"
          className="space-y-5 pb-32 max-w-xl mx-auto px-4 sm:px-6 pt-5"
        >
          {/* Settings Header */}
          <div className="flex items-center justify-between py-2">
            <button
              onClick={() => setInSettingsView(false)}
              className={`min-h-[40px] flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isDark
                  ? "text-[#2997FF] hover:text-blue-300"
                  : "text-[#0071E3] hover:text-[#005BB5]"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <h1 className="text-base font-bold tracking-tight">Settings</h1>
            <div className="w-12" />
          </div>

          {/* Account Summary Row */}
          <div className="apple-surface p-4 rounded-3xl flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div
                className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-base border ${
                  isDark
                    ? "bg-[#2C2C2E] border-white/10 text-zinc-100"
                    : "bg-zinc-100 border-black/[0.06] text-[#1D1D1F]"
                }`}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || "Cadet"}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : user.fullName ? (
                  user.fullName.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </div>
              <button
                type="button"
                id="btn-settings-edit-avatar"
                onClick={() => {
                  soundFx.playTap();
                  setIsAvatarModalOpen(true);
                }}
                title="Change Profile Photo"
                className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#0071E3] text-white shadow-xs"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">
                {user.fullName || "Cadet"}
              </div>
              <div
                className={`text-xs truncate ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                @{user.username || user.email?.split("@")[0] || "cadet"} ·{" "}
                {userRankLabel}
              </div>
              {user.email && (
                <div
                  className={`text-[11px] truncate ${
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {user.email}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                soundFx.playTap();
                setIsAvatarModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isDark
                  ? "bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200"
                  : "bg-black/[0.05] hover:bg-black/[0.08] text-[#1D1D1F]"
              }`}
            >
              Photo
            </button>
          </div>

          {/* Grouped Settings Sections */}
          <div className="space-y-4">
            {/* 1. Preferences */}
            <div className="apple-surface rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === "preferences" ? null : "preferences"
                  )
                }
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div>
                  <div className="text-sm font-semibold">Preferences</div>
                  <div
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    Audio, haptics, and appearance
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform opacity-50 ${
                    openAccordion === "preferences" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openAccordion === "preferences" && (
                <div
                  className={`px-5 pb-5 pt-2 space-y-5 border-t text-xs ${
                    isDark ? "border-white/[0.06]" : "border-black/[0.05]"
                  }`}
                >
                  {/* Sound Effects */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <Volume2
                        className={`w-4 h-4 ${
                          isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          UI Sound Effects
                        </div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-zinc-400" : "text-[#6E6E73]"
                          }`}
                        >
                          Subtle clicks and completion chimes
                        </div>
                      </div>
                    </div>
                    <ToggleSwitch
                      id="btn-toggle-sound-fx"
                      enabled={soundEnabled}
                      onToggle={handleToggleSound}
                    />
                  </div>

                  {/* Volume Slider */}
                  {soundEnabled && (
                    <div className="space-y-2 pl-7">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={
                            isDark ? "text-zinc-400" : "text-[#6E6E73]"
                          }
                        >
                          Volume
                        </span>
                        <span className="font-mono tabular-nums font-medium">
                          {soundVolume}%
                        </span>
                      </div>
                      <input
                        id="input-audio-volume-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={soundVolume}
                        onChange={(e) =>
                          handleVolumeChange(Number(e.target.value))
                        }
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#0071E3]"
                      />

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {[
                          { label: "Click", fn: () => audioManager.playClick() },
                          { label: "Spark", fn: () => audioManager.playSpark() },
                          {
                            label: "Correct",
                            fn: () => audioManager.playCorrect(),
                          },
                          {
                            label: "Quest",
                            fn: () => audioManager.playQuestComplete(),
                          },
                          {
                            label: "Level Up",
                            fn: () => audioManager.playLevelUp(),
                          },
                        ].map((sfx) => (
                          <button
                            key={sfx.label}
                            type="button"
                            onClick={sfx.fn}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                              isDark
                                ? "bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300"
                                : "bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F]"
                            }`}
                          >
                            {sfx.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Micro-Haptics */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles
                        className={`w-4 h-4 ${
                          isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          Micro-Haptics
                        </div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-zinc-400" : "text-[#6E6E73]"
                          }`}
                        >
                          Vibration feedback on tap and success
                        </div>
                      </div>
                    </div>
                    <ToggleSwitch
                      id="btn-toggle-haptics"
                      enabled={hapticsEnabled}
                      onToggle={handleToggleHaptics}
                    />
                  </div>

                  {/* NeuroBot Voice */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mic
                        className={`w-4 h-4 ${
                          isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          NeuroBot Narration
                        </div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-zinc-400" : "text-[#6E6E73]"
                          }`}
                        >
                          Spoken explanations during lessons
                        </div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={voiceEnabled}
                      onToggle={() => setVoiceEnabled(!voiceEnabled)}
                    />
                  </div>

                  {/* Appearance Selector */}
                  <div
                    className={`space-y-2.5 pt-4 border-t ${
                      isDark ? "border-white/[0.06]" : "border-black/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
                      <Palette
                        className={`w-4 h-4 ${
                          isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                        }`}
                      />
                      <span>Appearance</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: "neumorphic" as AppTheme,
                          label: "Apple Glass",
                          sub: "Frosted Alabaster",
                        },
                        {
                          id: "minimal-light" as AppTheme,
                          label: "Studio Frost",
                          sub: "Airy & Crisp",
                        },
                        {
                          id: "warm-editorial" as AppTheme,
                          label: "Warm Glass",
                          sub: "Sunlit Ivory",
                        },
                        {
                          id: "obsidian-noir" as AppTheme,
                          label: "Obsidian Glass",
                          sub: "Deep Smoked Frost",
                        },
                        {
                          id: "obsidian-gold" as AppTheme,
                          label: "Midnight Amber",
                          sub: "Warm Dark Frost",
                        },
                      ].map((th) => {
                        const isSelected =
                          theme === th.id ||
                          (th.id === "neumorphic" && !theme);
                        return (
                          <button
                            key={th.id}
                            onClick={() => handleThemeChange(th.id)}
                            className={`p-3 rounded-2xl text-left border transition-all ${
                              isSelected
                                ? isDark
                                  ? "bg-[#2997FF]/15 border-[#2997FF]/50 text-white"
                                  : "bg-[#0071E3]/[0.07] border-[#0071E3]/40 text-[#0071E3]"
                                : isDark
                                ? "bg-white/[0.03] border-white/[0.06] text-zinc-300 hover:bg-white/[0.06]"
                                : "bg-black/[0.02] border-black/[0.05] text-[#1D1D1F] hover:bg-black/[0.04]"
                            }`}
                          >
                            <div className="font-semibold text-xs flex items-center justify-between">
                              <span>{th.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div
                              className={`text-[11px] mt-0.5 ${
                                isSelected
                                  ? "opacity-80"
                                  : isDark
                                  ? "text-zinc-500"
                                  : "text-[#6E6E73]"
                              }`}
                            >
                              {th.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Sparks Demo */}
                  <div className="apple-surface-muted p-3.5 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs">
                        Need Sparks for NeuroBot?
                      </div>
                      <div
                        className={`text-[11px] ${
                          isDark ? "text-zinc-400" : "text-[#6E6E73]"
                        }`}
                      >
                        Add +5 Sparks from interactive demo
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        soundFx.playSpark();
                        onAddSparks(5);
                      }}
                      className="px-3 py-1.5 rounded-full font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>+5 Sparks</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Learning Goals */}
            <div className="apple-surface rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenAccordion(openAccordion === "about" ? null : "about")
                }
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div>
                  <div className="text-sm font-semibold">Learning Profile</div>
                  <div
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    Track focus and daily cadence
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform opacity-50 ${
                    openAccordion === "about" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "about" && (
                <div
                  className={`px-5 pb-5 pt-3 space-y-2 border-t text-xs ${
                    isDark
                      ? "border-white/[0.06] text-zinc-300"
                      : "border-black/[0.05] text-[#424245]"
                  }`}
                >
                  <p>Track Goal: AI Engineer & Autonomous Systems</p>
                  <p>Cadence: 1 bite-sized lesson daily</p>
                </div>
              )}
            </div>

            {/* 3. Account & Cloud Sync */}
            <div className="apple-surface rounded-3xl overflow-hidden">
              <button
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === "account" ? null : "account"
                  )
                }
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div>
                  <div className="text-sm font-semibold">Account & Sync</div>
                  <div
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    {user.email || "Learner account"}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform opacity-50 ${
                    openAccordion === "account" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "account" && (
                <div
                  className={`px-5 pb-5 pt-3 space-y-4 border-t text-xs ${
                    isDark ? "border-white/[0.06]" : "border-black/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Firebase Cloud Sync Active
                    </span>
                  </div>
                  <p
                    className={`leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    Your XP, Sparks, completed lessons, and achievements are synced securely across sessions.
                  </p>

                  <div
                    className={`pt-3 border-t flex justify-between items-center ${
                      isDark ? "border-white/[0.06]" : "border-black/[0.05]"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Profile Picture</div>
                      <div
                        className={`text-[11px] ${
                          isDark ? "text-zinc-400" : "text-[#6E6E73]"
                        }`}
                      >
                        Upload or customize avatar
                      </div>
                    </div>
                    <button
                      type="button"
                      id="btn-settings-manage-avatar"
                      onClick={() => {
                        soundFx.playTap();
                        setIsAvatarModalOpen(true);
                      }}
                      className={`px-3 py-1.5 rounded-full font-medium text-xs flex items-center gap-1.5 transition-colors ${
                        isDark
                          ? "bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200"
                          : "bg-black/[0.05] hover:bg-black/[0.08] text-[#1D1D1F]"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                  </div>

                  <div
                    className={`pt-3 border-t ${
                      isDark ? "border-white/[0.06]" : "border-black/[0.05]"
                    }`}
                  >
                    <button
                      type="button"
                      id="btn-reset-cloud-progress"
                      onClick={() => {
                        if (confirm("Reset learning progress and sparks?")) {
                          onResetProgress();
                        }
                      }}
                      className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-medium text-xs transition-colors"
                    >
                      Reset Learning Progress
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AvatarPickerModal
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            user={user}
            onSaveAvatar={handleSaveAvatar}
            theme={theme}
          />
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------
  // MAIN PROFILE VIEW
  // -------------------------------------------------------------
  return (
    <motion.div
      key="main-profile-section"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        id="you-view"
        className="space-y-6 pb-32 max-w-xl mx-auto px-4 sm:px-6 pt-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-xs font-medium ${
                isDark ? "text-[#2997FF]" : "text-[#0071E3]"
              }`}
            >
              Profile
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Your Account
            </h1>
          </div>

          <button
            id="btn-open-settings"
            onClick={() => {
              soundFx.playTap();
              setInSettingsView(true);
            }}
            className={`min-h-[42px] min-w-[42px] p-2.5 rounded-full border flex items-center justify-center transition-colors ${
              isDark
                ? "bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.08] text-zinc-200"
                : "bg-white hover:bg-zinc-50 border-black/[0.07] text-[#1D1D1F] shadow-xs"
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Identity Card */}
        <div className="apple-surface p-6 sm:p-7 rounded-3xl text-center space-y-4">
          <div className="relative inline-block">
            <div
              className={`w-22 h-22 mx-auto rounded-full overflow-hidden flex items-center justify-center border ${
                isDark
                  ? "bg-[#2C2C2E] border-white/10 text-zinc-100"
                  : "bg-zinc-100 border-black/[0.06] text-[#1D1D1F]"
              }`}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || "Cadet"}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>

            <button
              type="button"
              id="btn-edit-avatar"
              onClick={() => {
                soundFx.playTap();
                setIsAvatarModalOpen(true);
              }}
              title="Change profile photo"
              className="absolute -bottom-0.5 -right-0.5 p-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">
              {user.fullName || "Cadet"}
            </h2>
            <p
              className={`text-xs ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              @{user.username || user.email?.split("@")[0] || "cadet"} ·{" "}
              {userRankLabel}
              {user.age ? ` · ${user.age} yrs` : ""}
            </p>
            {user.email && (
              <p
                className={`text-xs ${
                  isDark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                {user.email}
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              id="btn-quick-change-photo"
              onClick={() => {
                soundFx.playTap();
                setIsAvatarModalOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isDark
                  ? "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200"
                  : "bg-black/[0.04] hover:bg-black/[0.07] text-[#1D1D1F]"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{user.avatarUrl ? "Change Photo" : "Upload Photo"}</span>
            </button>
          </div>
        </div>

        {/* Grouped Menu List (Apple Settings Style) */}
        <div
          className={`apple-surface rounded-3xl overflow-hidden divide-y ${
            isDark ? "divide-white/[0.06]" : "divide-black/[0.05]"
          }`}
        >
          {/* Achievements */}
          <button
            id="btn-open-achievements"
            onClick={() => {
              soundFx.playTap();
              setInAchievementsView(true);
            }}
            className="w-full p-4 sm:px-5 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                <Trophy className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  <span>Achievements</span>
                  <span
                    className={`text-xs font-normal tabular-nums ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    · {achievementsSummary.earned}/{achievementsSummary.total}
                  </span>
                </div>
                <div
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  Badges for streaks and completed stages
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>

          {/* Friends & Squad */}
          <button
            onClick={() => setActiveSubModal("friends")}
            className="w-full p-4 sm:px-5 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark
                    ? "bg-[#2997FF]/15 text-[#2997FF]"
                    : "bg-[#0071E3]/10 text-[#0071E3]"
                }`}
              >
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  <span>Friends & Study Squad</span>
                  {pendingRequestsCount > 0 && (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-300 tabular-nums">
                      · {pendingRequestsCount} pending
                    </span>
                  )}
                </div>
                <div
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  Add @handle and collaborate live
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>

          {/* Portfolio */}
          <button
            onClick={() => setActiveSubModal("portfolio")}
            className="w-full p-4 sm:px-5 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                <FolderArchive className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Portfolio</div>
                <div
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  Saved prompts, checklists, and notes
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>

          {/* Bookmarks */}
          <button
            onClick={() => setActiveSubModal("bookmarks")}
            className="w-full p-4 sm:px-5 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark
                    ? "bg-sky-500/15 text-sky-300"
                    : "bg-sky-500/10 text-sky-600"
                }`}
              >
                <Bookmark className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Bookmarks</div>
                <div
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  Saved lessons and concepts
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>

          {/* Certificates */}
          <button
            onClick={() => setActiveSubModal("certificates")}
            className="w-full p-4 sm:px-5 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark
                    ? "bg-orange-500/15 text-orange-300"
                    : "bg-orange-500/10 text-orange-600"
                }`}
              >
                <Award className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Certificates</div>
                <div
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  Verified AI track credentials
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setInSettingsView(true)}
            className="w-full p-4 sm:px-5 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark
                    ? "bg-zinc-500/20 text-zinc-300"
                    : "bg-zinc-500/10 text-zinc-700"
                }`}
              >
                <Settings className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Settings</div>
                <div
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-[#6E6E73]"
                  }`}
                >
                  Account, sound, and theme
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>
        </div>

        {/* Highlights Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span
              className={`text-xs font-semibold ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              Credentials
            </span>
            <button
              onClick={() => setActiveSubModal("certificates")}
              className={`text-xs font-medium ${
                isDark ? "text-[#2997FF]" : "text-[#0071E3]"
              }`}
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AppleSurfaceButton
              onClick={() => setActiveSubModal("certificates")}
              className="apple-surface p-4 rounded-2xl text-left hover:opacity-95 transition-opacity"
            >
              <Award className="w-5 h-5 text-amber-500 mb-2" />
              <div className="text-xs font-semibold truncate">
                AI Cadet Certificate
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                6 Stages · Verified
              </div>
            </AppleSurfaceButton>

            <AppleSurfaceButton
              onClick={() => {
                soundFx.playTap();
                setInAchievementsView(true);
              }}
              className="apple-surface p-4 rounded-2xl text-left hover:opacity-95 transition-opacity"
            >
              <Trophy
                className={`w-5 h-5 mb-2 ${
                  isDark ? "text-[#2997FF]" : "text-[#0071E3]"
                }`}
              />
              <div className="text-xs font-semibold truncate">
                Cadet Milestones
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                {achievementsSummary.earned} Unlocked
              </div>
            </AppleSurfaceButton>
          </div>
        </div>

        {/* Sign Out */}
        <AppleSurfaceButton
          pressScale={0.985}
          hoverScale={1.004}
          onClick={() => {
            soundFx.playTap();
            if (onLogOut) {
              onLogOut();
            } else if (confirm("Log out of current session?")) {
              onResetProgress();
            }
          }}
          className="apple-surface w-full py-3.5 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 hover:bg-rose-500/[0.04] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </AppleSurfaceButton>

        {/* Sub-modals for Portfolio / Bookmarks / Certificates */}
        <AnimatePresence>
          {activeSubModal && activeSubModal !== "friends" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="apple-surface w-full max-w-md rounded-3xl p-6 space-y-4"
              >
                <h3 className="text-base font-bold capitalize">
                  {activeSubModal}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? "text-zinc-300" : "text-[#6E6E73]"
                  }`}
                >
                  {activeSubModal === "portfolio" &&
                    "All your synthesized prompt templates and solved challenge exercises are archived here."}
                  {activeSubModal === "bookmarks" &&
                    "Review saved lessons and interactive learning tools anytime."}
                  {activeSubModal === "certificates" &&
                    "Complete all 6 core stages to earn your verified Neural Architect certificate."}
                </p>
                <button
                  onClick={() => setActiveSubModal(null)}
                  className="w-full py-2.5 rounded-2xl font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
                >
                  Done
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <FriendsFeedModal
          isOpen={activeSubModal === "friends"}
          onClose={() => setActiveSubModal(null)}
          user={user}
          theme={theme}
        />

        <AvatarPickerModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          user={user}
          onSaveAvatar={handleSaveAvatar}
          theme={theme}
        />
      </div>
    </motion.div>
  );
};
