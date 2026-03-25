import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisResult } from "@/types";

interface FileInfo {
  name: string;
  size: number;
}

interface AnalysisStore {
  currentResult: AnalysisResult | null;
  currentText: string;
  currentFile: FileInfo | null; // Store file metadata
  inputMode: "text" | "file";   // Store whether user was on text or file tab
  currentMode: "full" | "redflags" | "layman";
  activeTab: "summary" | "charts" | "findings" | "questions";
  setResult: (result: AnalysisResult | null) => void;
  setText: (text: string) => void;
  setFile: (file: FileInfo | null) => void;
  setInputMode: (mode: "text" | "file") => void;
  setMode: (mode: "full" | "redflags" | "layman") => void;
  setActiveTab: (tab: "summary" | "charts" | "findings" | "questions") => void;
  clearAll: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      currentResult: null,
      currentText: "",
      currentFile: null,
      inputMode: "text",
      currentMode: "full",
      activeTab: "summary",
      setResult: (result) => set({ currentResult: result }),
      setText: (text) => set({ currentText: text }),
      setFile: (file) => set({ currentFile: file }),
      setInputMode: (inputMode) => set({ inputMode }),
      setMode: (mode) => set({ currentMode: mode }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      clearAll: () => set({
        currentResult: null,
        currentText: "",
        currentFile: null,
        inputMode: "text",
        currentMode: "full",
        activeTab: "summary",
      }),
    }),
    { name: "medlens-analysis" }
  )
);