import { create } from "zustand";

export const useOnboardingStore = create((set) => ({
  answers: {}, // questionId -> answer string
  setAnswer: (questionId, answer) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  reset: () => set({ answers: {} }),
}));
