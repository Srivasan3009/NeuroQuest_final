import React, { useEffect, useState } from "react";
import { Shield, CheckCircle2, AlertCircle, RefreshCw, LogIn, ExternalLink } from "lucide-react";
import { supabase } from "../../services/supabase";
import { authService } from "../../services/auth";
import { dataStore } from "../../services/storage";
import { UserProfile } from "../../types";

interface OAuthCallbackHandlerProps {
  onCompleteStandalone?: (user: UserProfile) => void;
}

export const OAuthCallbackHandler: React.FC<OAuthCallbackHandlerProps> = ({
  onCompleteStandalone,
}) => {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [statusMessage, setStatusMessage] = useState("Connecting to Google Authentication...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPopup, setIsPopup] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const hasOpener = Boolean(window.opener && window.opener !== window);
    const isNamedPopup = window.name === "supabase_google_oauth";
    const inPopupMode = hasOpener || isNamedPopup;
    setIsPopup(inPopupMode);

    const processOAuth = async () => {
      try {
        // Check for error in hash or search query
        const hash = window.location.hash || "";
        const search = window.location.search || "";
        const urlParams = new URLSearchParams(search);
        const hashParams = new URLSearchParams(hash.replace(/^#/, "?"));

        const errorDesc =
          urlParams.get("error_description") ||
          hashParams.get("error_description") ||
          urlParams.get("error") ||
          hashParams.get("error");

        if (errorDesc) {
          if (!isMounted) return;
          setStatus("error");
          setErrorMessage(
            errorDesc.replace(/\+/g, " ") || "Google Sign-In was cancelled or denied."
          );

          if (hasOpener && window.opener) {
            try {
              window.opener.postMessage(
                {
                  type: "NEUROQUEST_AUTH_CALLBACK_ERROR",
                  error: errorDesc,
                },
                "*"
              );
            } catch (postErr) {
              console.warn("Could not post message to opener:", postErr);
            }
          }

          // Auto-close popup on error after a brief delay
          if (inPopupMode) {
            setTimeout(() => {
              try {
                window.close();
              } catch {
                // Ignore
              }
            }, 3000);
          }
          return;
        }

        setStatusMessage("Verifying Google credentials with Supabase...");

        // Give Supabase a moment to process the URL fragment automatically
        let session = null;
        let attempts = 0;
        const maxAttempts = 12;

        while (attempts < maxAttempts && !session) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            session = data.session;
            break;
          }
          attempts++;
          await new Promise((r) => setTimeout(r, 250));
        }

        if (!session?.user) {
          // If detectSessionInUrl did not catch it automatically, check if there is an access_token in the hash
          const accessToken = hashParams.get("access_token") || urlParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token") || urlParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!setSessionError && setSessionData?.session?.user) {
              session = setSessionData.session;
            }
          }
        }

        if (!session?.user) {
          // Fallback: check currentUser in authService
          const current = authService.getCurrentUser();
          if (current) {
            if (!isMounted) return;
            setStatus("success");
            setStatusMessage("Logged in successfully! Returning to app...");
            finishAuth(current, hasOpener);
            return;
          }
          throw new Error("Unable to retrieve session from Google callback.");
        }

        if (!isMounted) return;
        setStatusMessage("Creating cadet profile and syncing data...");

        // Map Supabase user to UserProfile
        const meta = session.user.user_metadata || {};
        const email = (session.user.email || meta.email || "").toLowerCase();
        const fullName =
          meta.full_name || meta.name || email.split("@")[0] || "Cadet";
        const username =
          meta.username ||
          email.split("@")[0]?.replace(/[^a-z0-9_]/g, "") ||
          "cadet";
        const googleAvatar =
          meta.avatar_url ||
          meta.picture ||
          meta.avatarUrl ||
          session.user.identities?.[0]?.identity_data?.avatar_url ||
          session.user.identities?.[0]?.identity_data?.picture ||
          "";

        const existing = await dataStore.getUserProfile();
        const profile: UserProfile = {
          ...existing,
          id: session.user.id || existing.id,
          email: email,
          fullName: fullName,
          username: username,
          avatarUrl: googleAvatar || existing.avatarUrl,
          authProvider: "google",
          lastActiveDate: new Date().toISOString().split("T")[0],
        };

        // Save session locally
        try {
          const authSession = {
            user: {
              id: session.user.id,
              email: profile.email,
              name: profile.fullName,
              username: profile.username,
              age: profile.age,
              avatarUrl: profile.avatarUrl,
              isEmailVerified: true,
            },
            token: session.access_token,
            expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 7 * 86400000,
          };
          localStorage.setItem("neuroquest_auth_session_v1", JSON.stringify(authSession));
          localStorage.setItem("neuroquest_auth_active", "true");
        } catch {
          // Ignore localStorage errors
        }

        await dataStore.saveUserProfile(profile);

        if (!isMounted) return;
        setStatus("success");
        setStatusMessage("Google Sign-In verified! Returning to NeuroQuest...");

        finishAuth(profile, hasOpener);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("OAuth callback error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Failed to complete Google authentication.");

        if (hasOpener && window.opener) {
          try {
            window.opener.postMessage(
              {
                type: "NEUROQUEST_AUTH_CALLBACK_ERROR",
                error: err.message || "Authentication failed.",
              },
              "*"
            );
          } catch {
            // Ignore
          }
        }
      }
    };

    const finishAuth = (profile: UserProfile, hasOpener: boolean) => {
      // Clean up URL fragments
      try {
        if (window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        // Ignore
      }

      // Notify window.opener if this is a popup
      if (hasOpener && window.opener) {
        try {
          window.opener.postMessage(
            {
              type: "NEUROQUEST_AUTH_CALLBACK_SUCCESS",
              user: profile,
            },
            "*"
          );
        } catch (e) {
          console.warn("postMessage to opener failed:", e);
        }

        // Attempt closing popup immediately
        setTimeout(() => {
          try {
            window.close();
          } catch {
            // Browser might block scripts from closing
          }
        }, 400);
      } else if (onCompleteStandalone) {
        // Standalone browser tab flow: transition main app to logged in
        setTimeout(() => {
          onCompleteStandalone(profile);
        }, 500);
      }
    };

    processOAuth();

    return () => {
      isMounted = false;
    };
  }, [onCompleteStandalone]);

  const handleManualClose = () => {
    try {
      window.close();
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

      <div
        id="oauth-callback-card"
        className="relative z-10 w-full max-w-sm bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5 backdrop-blur-md"
      >
        {/* Header Badges */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <span className="text-slate-600 font-mono text-xs">⟷</span>
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic Status Display */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {status === "processing"
              ? "Google Authentication"
              : status === "success"
              ? "Signed In Successfully!"
              : "Authentication Issue"}
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
            {statusMessage}
          </p>
        </div>

        {/* Status Graphic */}
        <div className="py-2 flex justify-center">
          {status === "processing" && (
            <div className="relative flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="absolute w-12 h-12 rounded-full border-2 border-indigo-500/20 animate-ping pointer-events-none" />
            </div>
          )}

          {status === "success" && (
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-in zoom-in-90 duration-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          )}

          {status === "error" && (
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center animate-in zoom-in-90 duration-200">
              <AlertCircle className="w-7 h-7" />
            </div>
          )}
        </div>

        {/* Error Detail */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-left">
            <p className="font-mono text-[11px] break-words">{errorMessage}</p>
          </div>
        )}

        {/* Action Controls / Instructions */}
        <div className="pt-2 space-y-2">
          {status === "success" && isPopup && (
            <div className="space-y-2">
              <p className="text-[11px] text-emerald-400/90 font-medium">
                Returning you to NeuroQuest automatically...
              </p>
              <button
                type="button"
                id="btn-oauth-close-tab"
                onClick={handleManualClose}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95"
              >
                Close Tab & Return to App
              </button>
            </div>
          )}

          {status === "error" && isPopup && (
            <button
              type="button"
              id="btn-oauth-dismiss"
              onClick={handleManualClose}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            >
              Close Window
            </button>
          )}

          {!isPopup && status === "success" && (
            <button
              type="button"
              id="btn-oauth-enter-app"
              onClick={() => {
                if (onCompleteStandalone) {
                  const current = authService.getCurrentUser();
                  if (current) onCompleteStandalone(current);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Enter NeuroQuest</span>
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
