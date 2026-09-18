// Centralized Audio Manager & Web Audio Synthesizer
// Provides subtle, sci-fi tactile audio feedback and mobile micro-haptics across NeuroQuest

export interface AudioSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  hapticsEnabled: boolean;
}

const STORAGE_KEY = "neuroquest_audio_config_v1";

class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = {
    enabled: true,
    volume: 0.8,
    hapticsEnabled: true,
  };

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private loadSettings() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = {
          enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
          volume: typeof parsed.volume === "number" ? Math.max(0, Math.min(1, parsed.volume)) : 0.8,
          hapticsEnabled: typeof parsed.hapticsEnabled === "boolean" ? parsed.hapticsEnabled : true,
        };
      }
    } catch {
      // Keep defaults
    }
  }

  private saveSettings() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore
    }
  }

  // --- Setting Getters & Setters ---
  public isEnabled(): boolean {
    return this.settings.enabled;
  }

  public setEnabled(val: boolean): void {
    this.settings.enabled = val;
    this.saveSettings();
  }

  public getVolume(): number {
    return this.settings.volume;
  }

  public setVolume(vol: number): void {
    this.settings.volume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public isHapticsEnabled(): boolean {
    return this.settings.hapticsEnabled;
  }

  public setHapticsEnabled(val: boolean): void {
    this.settings.hapticsEnabled = val;
    this.saveSettings();
  }

  // --- Tactile Haptics (Vibration API) ---
  public triggerHaptic(pattern: number | number[]) {
    if (!this.settings.hapticsEnabled || typeof window === "undefined" || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }

  // --- Web Audio Context Lifecycle ---
  private initCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private getEffectiveGain(baseGain: number): number {
    return baseGain * this.settings.volume;
  }

  // =========================================================================
  // 1. UI CLICKS & TACTILE TAPS
  // =========================================================================

  /** Subtle UI button click / tap */
  public playTap() {
    this.playClick();
  }

  public playClick() {
    if (!this.settings.enabled) return;
    this.triggerHaptic(8);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.035);

      const gainVal = this.getEffectiveGain(0.08);
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore audio failure
    }
  }

  /** Ultra-subtle hover / micro-tick */
  public playHover() {
    if (!this.settings.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(1250, now + 0.015);

      const gainVal = this.getEffectiveGain(0.025);
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Ignore
    }
  }

  /** Interactive toggle switch chime */
  public playToggle(isOn: boolean = true) {
    if (!this.settings.enabled) return;
    this.triggerHaptic(12);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = isOn ? [480, 720] : [720, 480];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        const gainVal = this.getEffectiveGain(0.07);
        gain.gain.setValueAtTime(gainVal, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.07);
      });
    } catch {
      // Ignore
    }
  }

  /** Tab switch / page glide sound */
  public playTabSwitch() {
    if (!this.settings.enabled) return;
    this.triggerHaptic(6);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);

      const gainVal = this.getEffectiveGain(0.05);
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 2. SPARKS, CHESTS & REWARDS
  // =========================================================================

  /** Single spark / energy crystal chime */
  public playSpark() {
    if (!this.settings.enabled) return;
    this.triggerHaptic(15);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, now + idx * 0.035);

        const gainVal = this.getEffectiveGain(0.07);
        gain.gain.setValueAtTime(gainVal, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.13);
      });
    } catch {
      // Ignore
    }
  }

  /** Spark shower cascade for multi-rewards */
  public playSparkShower() {
    if (!this.settings.enabled) return;
    this.triggerHaptic([10, 30, 10, 30, 10]);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.03);

        const gainVal = this.getEffectiveGain(0.06);
        gain.gain.setValueAtTime(gainVal, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.16);
      });
    } catch {
      // Ignore
    }
  }

  /** Mystery chest opening resonance */
  public playChestOpen() {
    if (!this.settings.enabled) return;
    this.triggerHaptic([20, 40, 20, 40]);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [392, 440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx < 3 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        const gainVal = this.getEffectiveGain(0.08);
        gain.gain.setValueAtTime(gainVal, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.29);
      });
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 3. QUIZ & VERIFICATION RESPONSES
  // =========================================================================

  /** Correct concept answer chime */
  public playCorrect() {
    if (!this.settings.enabled) return;
    this.triggerHaptic([15, 30, 20]);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        const gainVal = this.getEffectiveGain(0.085);
        gain.gain.setValueAtTime(gainVal, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.19);
      });
    } catch {
      // Ignore
    }
  }

  /** Wrong concept answer soft buzz */
  public playWrong() {
    if (!this.settings.enabled) return;
    this.triggerHaptic([40, 40]);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      [293.66, 261.63].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Low-pass filter to make error sound soft rather than harsh
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(700, now);

        const gainVal = this.getEffectiveGain(0.055);
        gain.gain.setValueAtTime(gainVal, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.15);
      });
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 4. QUEST COMPLETION & LEVEL UP (KEY DIRECTIVE)
  // =========================================================================

  /** Quest completion celebratory fanfare */
  public playQuestComplete() {
    this.playMissionComplete();
  }

  public playMissionComplete() {
    if (!this.settings.enabled) return;
    this.triggerHaptic([25, 40, 25, 60]);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Majestic 5-note pentatonic arpeggio (C5 -> E5 -> G5 -> B5 -> C6)
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);

        const isFinal = idx >= notes.length - 2;
        const decayDuration = isFinal ? 0.38 : 0.22;
        const gainVal = this.getEffectiveGain(isFinal ? 0.095 : 0.075);

        gain.gain.setValueAtTime(gainVal, now + idx * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + decayDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.065);
        osc.stop(now + idx * 0.065 + decayDuration + 0.01);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * LEVEL UP TRIUMPH FANFARE
   * Layered brassy synthesis with ascending progression and harmonic shimmer
   */
  public playLevelUp() {
    if (!this.settings.enabled) return;
    this.triggerHaptic([30, 50, 40, 80, 100]);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Chord 1 (C Major): C4, E4, G4 -> 0.0s
      // Chord 2 (F Major): F4, A4, C5 -> 0.15s
      // Chord 3 (G Major): G4, B4, D5 -> 0.30s
      // Chord 4 (C Octave Climax): C5, E5, G5, C6 -> 0.48s
      const progression = [
        { time: 0.00, chord: [261.63, 329.63, 392.00], dur: 0.18, vol: 0.06 },
        { time: 0.14, chord: [349.23, 440.00, 523.25], dur: 0.18, vol: 0.07 },
        { time: 0.28, chord: [392.00, 493.88, 587.33], dur: 0.22, vol: 0.08 },
        { time: 0.45, chord: [523.25, 659.25, 783.99, 1046.50], dur: 0.55, vol: 0.10 },
      ];

      progression.forEach((step) => {
        step.chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + step.time);

          const gainVal = this.getEffectiveGain(step.vol);
          gain.gain.setValueAtTime(gainVal, now + step.time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + step.time + step.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + step.time);
          osc.stop(now + step.time + step.dur + 0.02);
        });
      });

      // High Shimmer Particle Overtones
      const sparkleNotes = [1046.5, 1318.5, 1567.98, 2093.0];
      sparkleNotes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + 0.48 + idx * 0.05);

        const gainVal = this.getEffectiveGain(0.04);
        gain.gain.setValueAtTime(gainVal, now + 0.48 + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48 + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.48 + idx * 0.05);
        osc.stop(now + 0.48 + idx * 0.05 + 0.36);
      });
    } catch {
      // Ignore
    }
  }

  /** Milestone Achievement Unlocked */
  public playAchievementUnlock() {
    if (!this.settings.enabled) return;
    this.triggerHaptic([20, 40, 20, 60]);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const gainVal = this.getEffectiveGain(0.08);
        gain.gain.setValueAtTime(gainVal, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.33);
      });
    } catch {
      // Ignore
    }
  }

  /** Daily Streak Milestone */
  public playStreakMilestone() {
    if (!this.settings.enabled) return;
    this.triggerHaptic([30, 40, 30]);
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      [330, 392, 493.88, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        const gainVal = this.getEffectiveGain(0.08);
        gain.gain.setValueAtTime(gainVal, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.26);
      });
    } catch {
      // Ignore
    }
  }
}

// Global Singleton Instance & Backwards Compatible Alias
export const audioManager = AudioManager.getInstance();
export const soundFx = audioManager;
export default audioManager;
