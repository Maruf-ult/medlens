import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage } from "@/types";
import { generateId } from "@/lib/utils";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  userId: string | null;
}

interface ChatStore {
  conversations: Conversation[];
  activeId: string | null;
  createConversation: (userId: string | null) => string;
  setActiveId: (id: string | null) => void;
  getActive: () => Conversation | null;
  addMessage: (id: string, message: ChatMessage) => void;
  updateLastMessage: (id: string, content: string) => void;
  deleteConversation: (id: string) => void;
  clearAll: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,

      createConversation: (userId) => {
        const id = generateId();
        set((s) => ({
          conversations: [
            {
              id,
              title: "New Chat",
              createdAt: new Date().toISOString(),
              messages: [],
              userId,
            },
            ...s.conversations,
          ],
          activeId: id,
        }));
        return id;
      },

      setActiveId: (id) => set({ activeId: id }),

      getActive: () => {
        const { conversations, activeId } = get();
        return conversations.find((c) => c.id === activeId) ?? null;
      },

      addMessage: (id, message) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== id) return c;

            const updatedMessages = [...c.messages, message];

            // Auto-title from first user message
            let title = c.title;
            if (
              message.role === "user" &&
              c.messages.filter(m => m.role === "user").length === 0
            ) {
              title = message.content.length > 40
                ? message.content.slice(0, 40).trim() + "..."
                : message.content;
            }

            return { ...c, messages: updatedMessages, title };
          }),
        })),

      updateLastMessage: (id, content) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== id) return c;
            const messages = [...c.messages];
            const last = messages[messages.length - 1];
            if (last?.isLoading) {
              messages[messages.length - 1] = {
                ...last,
                content,
                isLoading: false,
              };
            }
            return { ...c, messages };
          }),
        })),

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),

      clearAll: () => set({ conversations: [], activeId: null }),
    }),
    {
      name: "medlens-chat-history",
    }
  )
);