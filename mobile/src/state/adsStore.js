import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Whether this user picked "Continue for free" on the paywall. Persisted so
// they don't hit the paywall again on every launch — they see ads instead
// (see RootNavigator's `entitled` check, unrelated to this flag).
export const useAdsStore = create(
  persist(
    (set) => ({
      continuedFree: false,
      hydrated: false,
      setContinuedFree: () => set({ continuedFree: true }),
    }),
    {
      name: "ads-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ continuedFree: s.continuedFree }),
      onRehydrateStorage: () => () => useAdsStore.setState({ hydrated: true }),
    }
  )
);
