import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisResult } from "@/types";

interface AnalysisStore {
  currentResult: AnalysisResult | null;
  currentText: string;
  currentMode: "full" | "redflags" | "layman";
  activeTab: "summary" | "charts" | "findings" | "questions";
  setResult: (result: AnalysisResult | null) => void;
  setText: (text: string) => void;
  setMode: (mode: "full" | "redflags" | "layman") => void;
  setActiveTab: (tab: "summary" | "charts" | "findings" | "questions") => void;
  clearAll: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      currentResult: null,
      currentText: "",
      currentMode: "full",
      activeTab: "summary",
      setResult: (result) => set({ currentResult: result }),
      setText: (text) => set({ currentText: text }),
      setMode: (mode) => set({ currentMode: mode }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      clearAll: () => set({
        currentResult: null,
        currentText: "",
        currentMode: "full",
        activeTab: "summary",
      }),
    }),
    { name: "medlens-analysis" }
  )
);