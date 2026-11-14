import { UserProfile } from "../types";
import { INITIAL_PROFILE } from "../data/gamification";
import { dataStore } from "./storage";
import { auth, googleProvider } from "./firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";

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
  expiresAt: number;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  private authReady = false;
  private authStateListeners: Array<(user: UserProfile | null, ready: boolean) => void> = [];
  private inFlightHydration = new Map<string, Promise<UserProfile>>();

  private constructor() {
    this.initFirebaseAuthListener();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public isConfigured(): boolean {
    return true;
  }

  public isAuthReady(): boolean {
    return this.authReady;
  }

  public onAuthStateChanged(
    listener: (user: UserProfile | null, ready: boolean) => void
  ): () => void {
    this.authStateListeners.push(listener);
    if (this.authReady) {
      try {
        listener(this.currentUser, true);
      } catch (err) {
        console.warn("Auth listener immediate call error:", err);
      }
    }
    return () => {
      this.authStateListeners = this.authStateListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(user: UserProfile | null, ready: boolean) {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(user, ready);
      } catch (err) {
        console.warn("Auth listener error:", err);
      }
    });
  }

  private initFirebaseAuthListener() {
    onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const profile = await this.hydrateOrCreateProfile(fbUser);
          this.currentUser = profile;
          this.authReady = true;
          try {
            localStorage.setItem("neuroquest_auth_active", "true");
          } catch {
            // Ignore
          }
          this.notifyListeners(profile, true);
        } else {
          this.currentUser = null;
          this.authReady = true;
          dataStore.clearInMemoryProfile();
          try {
            localStorage.removeItem("neuroquest_auth_active");
          } catch {
            // Ignore
          }
          this.notifyListeners(null, true);
        }
      } catch (err) {
        console.error("Firebase auth state sync error:", err);
        this.authReady = true;
        this.notifyListeners(this.currentUser, true);
      }
    });
  }

  private async hydrateOrCreateProfile(fbUser: FirebaseUser): Promise<UserProfile> {
    const existingPromise = this.inFlightHydration.get(fbUser.uid);
    if (existingPromise) {
      return existingPromise;
    }

    const hydrationTask = (async (): Promise<UserProfile> => {
      const email = (fbUser.email || "").toLowerCase();
      const derivedName = fbUser.displayName?.trim() || email.split("@")[0] || "Cadet";
      const derivedUsername =
        email.split("@")[0]?.replace(/[^a-z0-9_]/g, "") ||
        derivedName.toLowerCase().replace(/[^a-z0-9_]/g, "") ||
        "cadet";
      const today = new Date().toISOString().split("T")[0];

      // Check if this user already has saved cloud progress in Firestore
      const cloudProfile = await dataStore.loadUserProfileFromCloud(fbUser.uid);

      if (cloudProfile) {
        // Calculate streak progression if returning on a new day
        let streakDays = cloudProfile.streakDays || 1;
        if (cloudProfile.lastActiveDate && cloudProfile.lastActiveDate !== today) {
          const lastDate = new Date(cloudProfile.lastActiveDate);
          const currentDate = new Date(today);
          const diffDays = Math.round(
            (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            streakDays += 1;
          } else if (diffDays > 1) {
            streakDays = 1;
          }
        }

        const updated: UserProfile = {
          ...cloudProfile,
          id: fbUser.uid,
          email: email || cloudProfile.email,
          fullName: cloudProfile.fullName || derivedName,
          username: cloudProfile.username || derivedUsername,
          avatarUrl: cloudProfile.avatarUrl || fbUser.photoURL || "",
          authProvider: "google",
          lastActiveDate: today,
          streakDays,
        };

        await dataStore.saveUserProfile(updated);
        return updated;
      }

      // Brand new Google user: create fresh profile in Firestore (no age restriction)
      const newProfile: UserProfile = {
        ...INITIAL_PROFILE,
        id: fbUser.uid,
        email,
        fullName: derivedName,
        username: derivedUsername,
        avatarUrl: fbUser.photoURL || "",
        authProvider: "google",
        lastActiveDate: today,
        joinedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      };

      await dataStore.saveUserProfile(newProfile);
      return newProfile;
    })().finally(() => {
      this.inFlightHydration.delete(fbUser.uid);
    });

    this.inFlightHydration.set(fbUser.uid, hydrationTask);
    return hydrationTask;
  }

  /**
   * Real Google Authentication via Firebase Auth Popup (all ages welcome)
   */
  public async signInWithGoogle(): Promise<{ user: UserProfile }> {
    const result = await signInWithPopup(auth, googleProvider);
    if (!result.user) {
      throw new Error("Google sign-in did not return a user account.");
    }

    const profile = await this.hydrateOrCreateProfile(result.user);
    this.currentUser = profile;
    try {
      localStorage.setItem("neuroquest_auth_active", "true");
    } catch {
      // Ignore
    }
    this.notifyListeners(profile, true);
    return { user: profile };
  }

  public async signOut(): Promise<void> {
    await firebaseSignOut(auth);
    this.currentUser = null;
    dataStore.clearInMemoryProfile();
    try {
      localStorage.removeItem("neuroquest_auth_active");
    } catch {
      // Ignore
    }
    this.notifyListeners(null, true);
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }
}

export const authService = AuthService.getInstance();
