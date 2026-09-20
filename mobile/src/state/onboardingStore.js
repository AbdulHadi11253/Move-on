import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Answers are collected before the user has an account, so they're persisted
// locally and submitted to the server right after sign-up.
export const useOnboardingStore = create(
  persist(
    (set) => ({
      answers: {}, // questionId -> answer string
      questionsDone: false, // finished (or skipped) the pre-sign-in questions
      hydrated: false,
      setAnswer: (questionId, answer) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
      markDone: () => set({ questionsDone: true }),
      clearAnswers: () => set({ answers: {} }),
    }),
    {
      name: "onboarding-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ answers: s.answers, questionsDone: s.questionsDone }),
      onRehydrateStorage: () => () => useOnboardingStore.setState({ hydrated: true }),
    }
  )
);
