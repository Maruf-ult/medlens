"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { askQuestion } from "@/lib/api";
import type { ChatMessage } from "@/types";
import { cn, generateId, formatTime } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import { useChatStore } from "@/store/useChatStore";

const SUGGESTED_QUESTIONS = [
  "What does high creatinine mean?",
  "What is a normal WBC count?",
  "What causes low hemoglobin?",
  "What does high glucose indicate?",
  "How serious is high blood pressure?",
  "What is an eGFR test?",
  "What does low platelet count mean?",
  "What is HbA1c and what does it measure?",
];

const WELCOME_CONTENT = "Hello! I'm MedLens AI. Ask me anything about medical terms, lab results, or your report. I'll explain everything in plain language.";

function groupByDate(conversations: { id: string; title: string; createdAt: string }[]) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups: Record<string, typeof conversations> = {};
  conversations.forEach((c) => {
    const date = new Date(c.createdAt).toDateString();
    const label = date === today ? "Today" : date === yesterday ? "Yesterday" : new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  });
  return groups;
}

export default function ChatPage() {
  const { user, isSignedIn } = useUser();
  const {
    conversations,
    activeId,
    createConversation,
    setActiveId,
    getActive,
    addMessage,
    updateLastMessage,
    deleteConversation,
  } = useChatStore();

  const [input, setInput]             = useState("");
  const [reportContext, setReportContext] = useState("");
  const [showContext, setShowContext]  = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const activeConv = getActive();
  const messages   = activeConv?.messages ?? [];
  const messageCount = messages.filter(m => m.role === "user").length;

  const filteredConversations = isSignedIn
    ? conversations.filter(c => c.userId === user?.id || c.userId === null)
    : conversations.filter(c => c.userId === null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    const userId = isSignedIn ? user?.id ?? null : null;
    createConversation(userId);
  };

  const sendMessage = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || isLoading) return;

    let convId = activeId;
    if (!convId) {
      const userId = isSignedIn ? user?.id ?? null : null;
      convId = createConversation(userId);
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    const loadingMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    addMessage(convId, userMessage);
    addMessage(convId, loadingMessage);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askQuestion({
        question,
        report_context: reportContext || undefined,
      });
      updateLastMessage(convId, response.answer);
    } catch (err) {
      updateLastMessage(
        convId,
        err instanceof Error ? `Error: ${err.message}` : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const grouped = groupByDate(filteredConversations);

  return (
    <div className="flex bg-surface-50 dark:bg-surface-950 overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>

      {/* SIDEBAR */}
      <div className={cn(
        "flex flex-col shrink-0 border-r border-surface-200 dark:border-surface-700",
        "bg-white dark:bg-surface-900 transition-all duration-300",
        showSidebar ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className="p-3 border-b border-surface-200 dark:border-surface-700">
          <button
            onClick={handleNewChat}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl",
              "border border-dashed border-surface-300 dark:border-surface-600",
              "text-sm text-surface-500 dark:text-surface-400",
              "hover:bg-surface-50 dark:hover:bg-surface-800",
              "hover:border-primary-400 hover:text-primary-600",
              "dark:hover:border-primary-500 dark:hover:text-primary-400",
              "transition-all duration-150"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filteredConversations.length === 0 ? (
            <p className="text-xs text-surface-400 dark:text-surface-500 text-center py-8 px-4">
              No conversations yet. Start a new one!
            </p>
          ) : (
            Object.entries(grouped).map(([label, convs]) => (
              <div key={label}>
                <p className="text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider px-4 py-2">
                  {label}
                </p>
                {convs.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      "group flex items-center justify-between mx-2 px-3 py-2.5 rounded-xl cursor-pointer",
                      "transition-colors duration-150",
                      activeId === conv.id
                        ? "bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900"
                        : "hover:bg-surface-50 dark:hover:bg-surface-800"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm shrink-0">💬</span>
                      <p className={cn(
                        "text-xs truncate",
                        activeId === conv.id
                          ? "text-primary-700 dark:text-primary-300 font-medium"
                          : "text-surface-600 dark:text-surface-400"
                      )}>
                        {conv.title}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-surface-400 hover:text-danger-500 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-surface-200 dark:border-surface-700">
          <p className="text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider px-2 mb-2">
            Quick Questions
          </p>
          <div className="space-y-0.5">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className={cn(
                  "w-full text-left text-xs px-3 py-2 rounded-lg",
                  "text-surface-500 dark:text-surface-400",
                  "hover:bg-surface-50 dark:hover:bg-surface-800",
                  "hover:text-primary-600 dark:hover:text-primary-400",
                  "transition-all duration-150 truncate",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {!isSignedIn && (
          <div className={cn(
            "mx-3 mb-3 p-3 rounded-xl",
            "bg-surface-50 dark:bg-surface-800",
            "border border-surface-200 dark:border-surface-700"
          )}>
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">
              Sign in to save your chat history forever
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warning-400" />
              <span className="text-xs text-warning-600 dark:text-warning-400">
                Session only — not saved
              </span>
            </div>
          </div>
        )}

        {isSignedIn && (
          <div className="p-3 border-t border-surface-200 dark:border-surface-700 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-400">
              {user?.firstName?.[0] ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate">
                {user?.firstName ?? "User"}
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
                <span className="text-xs text-success-600 dark:text-success-400">History saved</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3",
          "border-b border-surface-200 dark:border-surface-700",
          "bg-white dark:bg-surface-900 shrink-0"
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "text-surface-400 hover:text-surface-700",
                "hover:bg-surface-100 dark:hover:bg-surface-800",
                "transition-colors duration-150"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center text-white text-xs">
                🔬
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                  MedLens AI
                </p>
                <p className="text-xs text-success-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-500 inline-block" />
                  Online
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {reportContext && (
              <span className={cn(
                "hidden sm:flex px-2.5 py-1 rounded-full text-xs font-medium",
                "bg-success-50 dark:bg-success-950 text-success-600 dark:text-success-400",
                "border border-success-200 dark:border-success-800"
              )}>
                📋 Report context active
              </span>
            )}
            <button
              onClick={() => setShowContext(!showContext)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "border border-surface-200 dark:border-surface-700",
                "text-surface-600 dark:text-surface-400",
                "hover:bg-surface-50 dark:hover:bg-surface-800",
                "transition-colors duration-150"
              )}
            >
              {showContext ? "Hide Context" : "Add Context"}
            </button>
            <button
              onClick={handleNewChat}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "border border-surface-200 dark:border-surface-700",
                "text-surface-600 dark:text-surface-400",
                "hover:bg-surface-50 dark:hover:bg-surface-800",
                "transition-colors duration-150"
              )}
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Context panel */}
        {showContext && (
          <div className={cn(
            "px-4 py-3 border-b border-surface-200 dark:border-surface-700",
            "bg-surface-50 dark:bg-surface-900 shrink-0"
          )}>
            <div className="max-w-3xl mx-auto">
              <p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">
                Paste your medical report for more specific answers:
              </p>
              <textarea
                value={reportContext}
                onChange={(e) => setReportContext(e.target.value)}
                placeholder="Paste your report here..."
                rows={3}
                className={cn(
                  "w-full px-3 py-2 rounded-xl text-xs",
                  "bg-white dark:bg-surface-800",
                  "border border-surface-200 dark:border-surface-700",
                  "text-surface-700 dark:text-surface-300",
                  "placeholder:text-surface-400",
                  "resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                )}
              />
              {reportContext && (
                <button
                  onClick={() => setReportContext("")}
                  className="text-xs text-danger-500 hover:text-danger-600 mt-1"
                >
                  Clear context
                </button>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

            {messageCount === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-3xl mx-auto mb-4 border border-primary-100 dark:border-primary-900">
                  🔬
                </div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                  Ask MedLens AI
                </h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm max-w-md mx-auto mb-8">
                  Get plain language explanations for medical terms, lab results, and health questions — powered by 16,000+ verified Q&A pairs.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className={cn(
                        "p-3 rounded-xl text-left text-xs",
                        "bg-white dark:bg-surface-800",
                        "border border-surface-200 dark:border-surface-700",
                        "text-surface-600 dark:text-surface-400",
                        "hover:bg-primary-50 dark:hover:bg-primary-950/30",
                        "hover:border-primary-200 dark:hover:border-primary-800",
                        "hover:text-primary-600 dark:hover:text-primary-400",
                        "transition-all duration-150 shadow-sm"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.filter(m => m.id !== "welcome").map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm mt-1",
                  message.role === "assistant"
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                    : "bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
                )}>
                  {message.role === "assistant" ? "🔬" : "👤"}
                </div>

                <div className="max-w-[75%] space-y-1">
                  <div className={cn(
                    "rounded-2xl px-4 py-3",
                    message.role === "assistant"
                      ? "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-tl-sm shadow-sm"
                      : "bg-primary-500 text-white rounded-tr-sm"
                  )}>
                    {message.isLoading ? (
                      <div className="flex items-center gap-2 py-1">
                        <Spinner size="sm" color="primary" />
                        <span className="text-sm text-surface-500">Thinking...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs px-1",
                    message.role === "assistant"
                      ? "text-surface-400 dark:text-surface-500"
                      : "text-right text-surface-400 dark:text-surface-500"
                  )}>
                    {formatTime(new Date(message.timestamp))}
                  </p>
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className={cn(
          "border-t border-surface-200 dark:border-surface-700",
          "bg-white dark:bg-surface-900 px-4 py-3 shrink-0"
        )}>
          <div className="max-w-3xl mx-auto">
            <div className={cn(
              "flex gap-3 items-end",
              "bg-surface-50 dark:bg-surface-800",
              "border border-surface-200 dark:border-surface-700",
              "rounded-2xl px-4 py-3",
              "focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent",
              "transition-all duration-150"
            )}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a medical question..."
                rows={1}
                className={cn(
                  "flex-1 bg-transparent resize-none",
                  "text-sm text-surface-900 dark:text-surface-100",
                  "placeholder:text-surface-400 dark:placeholder:text-surface-500",
                  "focus:outline-none max-h-32 overflow-y-auto"
                )}
                style={{ minHeight: "24px" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 128) + "px";
                }}
              />
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-surface-300 dark:text-surface-600 hidden sm:block">Enter ↵</span>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
                    input.trim() && !isLoading
                      ? "bg-primary-500 hover:bg-primary-600 text-white"
                      : "bg-surface-200 dark:bg-surface-700 text-surface-400 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Spinner size="xs" color="primary" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-center text-surface-300 dark:text-surface-600 mt-2">
              MedLens AI · For educational purposes only · Not medical advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}