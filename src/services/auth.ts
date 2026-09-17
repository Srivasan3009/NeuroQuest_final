import { UserProfile } from "../types";
import { dataStore } from "./storage";
import { INITIAL_PROFILE } from "../data/gamification";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    username?: string;
    age?: number;
    avatarUrl: string;
    isEmailVerified: boolean;
  };
  token: string;
  expiresAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
}

export interface SignUpResult {
  requiresVerification: boolean;
  user?: UserProfile;
  message?: string;
}

const AUTH_SESSION_KEY = "neuroquest_auth_session_v1";

export class AuthService {
  private static instance: AuthService;
  private session: AuthSession | null = null;
  private currentUser: UserProfile | null = null;
  private authStateListeners: Array<(user: UserProfile | null) => void> = [];

  private constructor() {
    this.restoreSession();
    this.initSupabaseListener();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public isConfigured(): boolean {
    return isSupabaseConfigured;
  }

  public isSupabaseConfigured(): boolean {
    return isSupabaseConfigured;
  }

  public onAuthStateChanged(listener: (user: UserProfile | null) => void): () => void {
    this.authStateListeners.push(listener);
    return () => {
      this.authStateListeners = this.authStateListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(user: UserProfile | null) {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(user);
      } catch (err) {
        console.warn("Auth listener error:", err);
      }
    });
  }

  private restoreSession() {
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        this.session = JSON.parse(stored);
      }
    } catch {
      this.session = null;
    }
  }

  /**
   * Listen to real Supabase auth state changes (e.g. email verification link clicks)
   */
  private initSupabaseListener() {
    try {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            const isVerified = Boolean(
              session.user.email_confirmed_at ||
              session.user.confirmed_at ||
              session.user.app_metadata?.provider === "google"
            );

            if (isVerified) {
              const profile = await this.mapSupabaseUserToProfile(session.user);
              this.currentUser = profile;
              this.setSessionFromSupabase(session, profile);
              await dataStore.saveUserProfile(profile);
              this.notifyListeners(profile);
            }
          }
        } else if (event === "SIGNED_OUT") {
          this.session = null;
          this.currentUser = null;
          try {
            localStorage.removeItem(AUTH_SESSION_KEY);
            localStorage.removeItem("neuroquest_auth_active");
          } catch {
            // Ignore
          }
          this.notifyListeners(null);
        }
      });
    } catch (err) {
      console.warn("Supabase auth state listener init warning:", err);
    }
  }

  private async mapSupabaseUserToProfile(
    sbUser: SupabaseUser,
    fallbackName?: string,
    fallbackUsername?: string,
    fallbackAge?: number
  ): Promise<UserProfile> {
    const existing = await dataStore.getUserProfile();
    const meta = sbUser.user_metadata || {};
    const email = (sbUser.email || meta.email || existing.email || "").toLowerCase();
    const fullName =
      meta.full_name || meta.name || fallbackName || existing.fullName || email.split("@")[0] || "Cadet";
    const username =
      meta.username ||
      fallbackUsername ||
      existing.username ||
      email.split("@")[0]?.replace(/[^a-z0-9_]/g, "") ||
      "cadet";
    const age = Number(meta.age || fallbackAge || existing.age || 20);
    const googleAvatar =
      meta.avatar_url ||
      meta.picture ||
      meta.avatarUrl ||
      sbUser.identities?.[0]?.identity_data?.avatar_url ||
      sbUser.identities?.[0]?.identity_data?.picture ||
      "";
    const avatarUrl = googleAvatar || existing.avatarUrl || "";

    const profile: UserProfile = {
      ...existing,
      id: sbUser.id || existing.id,
      email: email,
      fullName: fullName,
      username: username,
      age: age,
      avatarUrl: avatarUrl,
      authProvider: sbUser.app_metadata?.provider || "supabase",
      lastActiveDate: new Date().toISOString().split("T")[0],
    };

    return profile;
  }

  private setSessionFromSupabase(session: SupabaseSession, profile: UserProfile) {
    const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 7 * 24 * 3600 * 1000;
    this.session = {
      user: {
        id: session.user.id,
        email: profile.email,
        name: profile.fullName,
        username: profile.username,
        age: profile.age,
        avatarUrl: profile.avatarUrl,
        isEmailVerified: Boolean(session.user.email_confirmed_at || session.user.confirmed_at),
      },
      token: session.access_token,
      expiresAt,
    };

    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.session));
      localStorage.setItem("neuroquest_auth_active", "true");
    } catch {
      // Ignore
    }
  }

  /**
   * Real Supabase Email & Password Sign-Up with Confirmation Email
   */
  public async signUpWithDetails(details: {
    fullName: string;
    username: string;
    email: string;
    age: number;
    password: string;
  }): Promise<SignUpResult> {
    const { fullName, username, email, age, password } = details;
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().replace(/^@/, "").toLowerCase();

    if (!cleanEmail) {
      throw new Error("Please provide a valid email address.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    // Call real Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: cleanUsername,
          age: Number(age) || 20,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      // Handle known Supabase error messages gracefully
      if (error.message.includes("User already registered")) {
        throw new Error("An account with this email address already exists. Please sign in instead.");
      }
      throw new Error(error.message || "Failed to create account. Please check your details.");
    }

    if (!data.user) {
      throw new Error("Unable to create account. Please try again later.");
    }

    // Check if user already existed (Supabase returns user with empty identities if duplicate exists)
    if (data.user.identities && data.user.identities.length === 0) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    // Check if email confirmation is required (session will be null or email_confirmed_at is null)
    const isEmailVerified = Boolean(data.user.email_confirmed_at || data.user.confirmed_at);

    if (!isEmailVerified) {
      // Real confirmation email was sent by Supabase
      // Unverified users must NOT be marked as verified or logged in automatically
      return {
        requiresVerification: true,
        message: `A real confirmation link has been sent to ${cleanEmail}. Please check your inbox and click the verification link to activate your account before logging in.`,
      };
    }

    // If email confirmation is disabled on Supabase project (immediate session)
    const profile = await this.mapSupabaseUserToProfile(data.user, fullName, cleanUsername, age);
    if (data.session) {
      this.setSessionFromSupabase(data.session, profile);
    }
    this.currentUser = profile;
    await dataStore.saveUserProfile(profile);

    return {
      requiresVerification: false,
      user: profile,
    };
  }

  /**
   * Real Supabase Email & Password Sign-In
   * Checks if user is verified
   */
  public async signInWithPassword(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error("Please enter your email address.");
    }
    if (!password) {
      throw new Error("Please enter your password.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error(
          "Your email address is not verified yet. Please check your inbox for the verification link or request a new one."
        );
      }
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        throw new Error("Invalid email or password. Please verify your credentials.");
      }
      throw new Error(error.message || "Failed to sign in. Please verify your email and password.");
    }

    if (!data.user || !data.session) {
      throw new Error("Failed to start session. Please try again.");
    }

    // Verification check from real provider
    const isVerified = Boolean(
      data.user.email_confirmed_at ||
      data.user.confirmed_at ||
      data.user.app_metadata?.provider === "google"
    );

    if (!isVerified) {
      // Sign out immediately if not verified
      await supabase.auth.signOut();
      throw new Error(
        "Account unverified. Please check your email and click the confirmation link before signing in."
      );
    }

    const profile = await this.mapSupabaseUserToProfile(data.user);
    this.currentUser = profile;
    this.setSessionFromSupabase(data.session, profile);
    await dataStore.saveUserProfile(profile);

    return profile;
  }

  /**
   * Resend Real Verification / Confirmation Email via Supabase
   */
  public async resendVerificationEmail(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error("Please enter your email address.");
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      throw new Error(error.message || "Could not resend verification email. Please wait a minute and try again.");
    }
  }

  /**
   * Real Supabase Google OAuth Sign-In
   * Launches a dedicated login popup window and returns to the app upon completion
   */
  public async signInWithGoogle(): Promise<{ user?: UserProfile; popupUrl?: string }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to initiate Google Sign-In.");
    }

    if (!data?.url) {
      throw new Error("No authorization URL returned from Supabase.");
    }

    const authUrl = data.url;

    // Calculate centered coordinates for popup
    const width = 520;
    const height = 650;
    const left = window.screenLeft !== undefined ? window.screenLeft + (window.outerWidth - width) / 2 : 200;
    const top = window.screenTop !== undefined ? window.screenTop + (window.outerHeight - height) / 2 : 100;

    let popupWindow: Window | null = null;
    try {
      popupWindow = window.open(
        authUrl,
        "supabase_google_oauth",
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,status=no,resizable=yes`
      );
    } catch {
      popupWindow = null;
    }

    const isIframe = window.self !== window.top;
    if (!popupWindow && !isIframe) {
      // If not in iframe and popup was blocked, redirect directly
      window.location.href = authUrl;
      return { popupUrl: authUrl };
    }

    // Return a promise that resolves once OAuth completes via postMessage, storage event, or polling
    return new Promise((resolve, reject) => {
      let resolved = false;

      const cleanup = () => {
        window.removeEventListener("message", onMessage);
        window.removeEventListener("storage", onStorage);
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        if (popupWindow && !popupWindow.closed) {
          try {
            popupWindow.close();
          } catch {
            // Ignore
          }
        }
      };

      const handleSuccess = async (profile?: UserProfile) => {
        if (resolved) return;
        resolved = true;

        let finalProfile = profile;
        if (!finalProfile) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            finalProfile = await this.mapSupabaseUserToProfile(sessionData.session.user);
            this.setSessionFromSupabase(sessionData.session, finalProfile);
          } else {
            finalProfile = await dataStore.getUserProfile();
          }
        }

        this.currentUser = finalProfile;
        await dataStore.saveUserProfile(finalProfile);
        this.notifyListeners(finalProfile);
        cleanup();
        resolve({ user: finalProfile });
      };

      // 1. Listen for postMessage from the popup callback
      const onMessage = async (event: MessageEvent) => {
        if (event.data?.type === "NEUROQUEST_AUTH_CALLBACK_SUCCESS") {
          handleSuccess(event.data.user);
        } else if (event.data?.type === "NEUROQUEST_AUTH_CALLBACK_ERROR") {
          if (!resolved) {
            resolved = true;
            cleanup();
            reject(new Error(event.data.error || "Google Sign-In was cancelled or failed."));
          }
        }
      };
      window.addEventListener("message", onMessage);

      // 2. Listen for cross-tab storage changes
      const onStorage = async (e: StorageEvent) => {
        if (e.key === "neuroquest_auth_active" && e.newValue === "true") {
          handleSuccess();
        }
      };
      window.addEventListener("storage", onStorage);

      // 3. Fallback polling
      const checkInterval = setInterval(async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            handleSuccess();
          }
        } catch {
          // Keep checking
        }
      }, 800);

      // 4. Timeout safety (60s)
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve({ popupUrl: authUrl });
        }
      }, 60000);

      if (!popupWindow) {
        // Popup was blocked by browser
        resolve({ popupUrl: authUrl });
      }
    });
  }

  /**
   * Quick email helper for modal profile sync
   */
  public async signInWithEmail(email: string, fullName?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await dataStore.getUserProfile();
    const derivedUsername = cleanEmail.split("@")[0].replace(/[^a-z0-9_]/g, "");

    const updatedProfile: UserProfile = {
      ...existing,
      email: cleanEmail,
      fullName: fullName || existing.fullName || "Cadet",
      username: existing.username || derivedUsername,
      authProvider: "supabase",
    };

    this.currentUser = updatedProfile;
    await dataStore.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  /**
   * Real Supabase Password Reset Email
   */
  public async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error("Please enter your email address.");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });

    if (error) {
      throw new Error(error.message || "Failed to send password reset email.");
    }
  }

  /**
   * Sign Out
   */
  public async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase sign out error:", err);
    }
    this.session = null;
    this.currentUser = null;
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem("neuroquest_auth_active");
    } catch {
      // Ignore
    }
  }

  public getSession(): AuthSession | null {
    return this.session;
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }
}

export const authService = AuthService.getInstance();
