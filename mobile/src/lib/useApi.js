import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { apiFetch } from "./api";
import { resetAppState } from "./resetAppState";

// A 401-with-token usually means the server rejected the session (expired,
// or — a known past bug — a token cached on-device from a different Clerk
// instance, e.g. a dev build installed before a production build on the same
// device; iOS Keychain data can outlive an app reinstall). But it can also
// happen transiently right after a fresh sign-in: Clerk's SDK caches tokens
// client-side, and the very first request after setActive() can race a
// not-yet-refreshed cached token, 401, and (before this fix) immediately
// force a sign-out — bouncing the user straight back to the sign-in screen
// on an otherwise-successful login, which then "worked" on the next attempt
// once the cache had caught up. So: retry once with a forced-fresh token
// before concluding the session is actually dead.
export function useApi() {
  const { getToken, signOut } = useAuth();

  return useCallback(
    async (path, options = {}) => {
      try {
        return await apiFetch(path, { ...options, getToken });
      } catch (err) {
        if (err.status === 401 && err.hadToken) {
          try {
            return await apiFetch(path, { ...options, getToken, skipTokenCache: true });
          } catch (retryErr) {
            if (retryErr.status === 401 && retryErr.hadToken) {
              await signOut().catch(() => {});
              await resetAppState();
              const sessionErr = new Error("Your session expired. Please sign in again.");
              sessionErr.status = 401;
              throw sessionErr;
            }
            throw retryErr;
          }
        }
        throw err;
      }
    },
    [getToken, signOut]
  );
}
