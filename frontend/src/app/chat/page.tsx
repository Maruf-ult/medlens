"use client";

import { useState, useRef, useEffect } from "react";
import { askQuestion } from "@/lib/api";
import type { ChatMessage } from "@/types";
import { cn,generateId,formatTime } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const SUGGESTED_QUESTIONS = [
  "What does high creatinine mean?",
  "What is a normal WBC count?",
  "What causes low hemoglobin?",
  "What does high glucose indicate?",
  "How serious is high blood pressure?",
  "What is an eGFR test?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm MedLens AI. Ask me anything about medical terms, lab results, or your report. I'll explain everything in plain language.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [reportContext, setReportContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || isLoading) return;

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

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askQuestion({
        question,
        report_context: reportContext || undefined,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                ...msg,
                content: response.answer,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                ...msg,
                content: err instanceof Error
                  ? `Error: ${err.message}`
                  : "Something went wrong. Please try again.",
                isLoading: false,
              }
            : msg
        )
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

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm MedLens AI. Ask me anything about medical terms, lab results, or your report. I'll explain everything in plain language.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="container-main py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
                Medical Q&A
              </h1>
              <p className="text-surface-500 dark:text-surface-400 mt-1">
                Ask anything about your medical report or health terms
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearChat}>
              Clear Chat
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

         
            <div className="lg:col-span-1 space-y-4">

         
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                  Suggested Questions
                </h3>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className={cn(
                        "w-full text-left text-xs p-2.5 rounded-lg",
                        "text-surface-600 dark:text-surface-400",
                        "bg-surface-50 dark:bg-surface-900",
                        "border border-surface-100 dark:border-surface-700",
                        "hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200",
                        "dark:hover:bg-primary-950 dark:hover:text-primary-400",
                        "transition-all duration-150",
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

            
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm p-4">
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-surface-700 dark:text-surface-300"
                >
                  <span>📋 Add Report Context</span>
                  <span className="text-surface-400">{showContext ? "▲" : "▼"}</span>
                </button>
                {showContext && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-surface-400 dark:text-surface-500">
                      Paste your report so the AI can give more specific answers.
                    </p>
                    <textarea
                      value={reportContext}
                      onChange={(e) => setReportContext(e.target.value)}
                      placeholder="Paste report here..."
                      rows={5}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-xs",
                        "bg-surface-50 dark:bg-surface-900",
                        "border border-surface-200 dark:border-surface-700",
                        "text-surface-700 dark:text-surface-300",
                        "placeholder:text-surface-400",
                        "resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      )}
                    />
                    {reportContext && (
                      <button
                        onClick={() => setReportContext("")}
                        className="text-xs text-danger-500 hover:text-danger-600"
                      >
                        Clear context
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

          
            <div className="lg:col-span-3 flex flex-col">
              <div className={cn(
                "flex-1 bg-white dark:bg-surface-800",
                "rounded-2xl border border-surface-200 dark:border-surface-700",
                "shadow-sm overflow-hidden flex flex-col",
                "min-h-125"
              )}>

            
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" && "flex-row-reverse"
                      )}
                    >
                   
                      <div className={cn(
                        "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm",
                        message.role === "assistant"
                          ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                          : "bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
                      )}>
                        {message.role === "assistant" ? "🔬" : "👤"}
                      </div>

                 
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === "assistant"
                          ? "bg-surface-50 dark:bg-surface-900 text-surface-700 dark:text-surface-300 rounded-tl-sm"
                          : "bg-primary-500 text-white rounded-tr-sm"
                      )}>
                        {message.isLoading ? (
                          <div className="flex items-center gap-2 py-1">
                            <Spinner size="sm" color={message.role === "user" ? "white" : "primary"} />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}
                        <p className={cn(
                          "text-xs mt-1.5",
                          message.role === "assistant"
                            ? "text-surface-400 dark:text-surface-500"
                            : "text-primary-200"
                        )}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

            
                <div className={cn(
                  "border-t border-surface-200 dark:border-surface-700",
                  "p-4 flex gap-3 items-end"
                )}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a medical question... (Enter to send)"
                    rows={2}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl",
                      "bg-surface-50 dark:bg-surface-900",
                      "border border-surface-200 dark:border-surface-700",
                      "text-surface-900 dark:text-surface-100",
                      "placeholder:text-surface-400 dark:placeholder:text-surface-500",
                      "text-sm resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                      "transition-colors duration-150"
                    )}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    isLoading={isLoading}
                    size="lg"
                    className="shrink-0"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}