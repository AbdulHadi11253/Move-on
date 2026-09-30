import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { apiFetch } from "./api";
import { resetAppState } from "./resetAppState";

// A 401 here always means the server rejected the session (missing, expired,
// or — the known cause of a real bug — a token cached on-device from a
// different Clerk instance, e.g. a dev build installed before a production
// build on the same device; iOS Keychain data can outlive an app reinstall).
// Rather than leaving the app stuck retrying a call that can never succeed,
// force a clean sign-out so RootNavigator sends the user back to SignIn.
export function useApi() {
  const { getToken, signOut } = useAuth();

  return useCallback(
    async (path, options = {}) => {
      try {
        return await apiFetch(path, { ...options, getToken });
      } catch (err) {
        if (err.status === 401) {
          await signOut().catch(() => {});
          await resetAppState();
          const sessionErr = new Error("Your session expired. Please sign in again.");
          sessionErr.status = 401;
          throw sessionErr;
        }
        throw err;
      }
    },
    [getToken, signOut]
  );
}
