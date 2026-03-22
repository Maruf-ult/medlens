"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getAnalysisHistory, deleteAnalysisDB } from "@/lib/api";
import type { AnalysisRecord } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import Link from "next/link";

function UrgencyDot({ score }: { score: number }) {
  const color = score <= 3 ? "bg-success-500" : score <= 6 ? "bg-warning-500" : "bg-danger-500";
  return <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", color)} />;
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [history, setHistory]   = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getAnalysisHistory(user.id);
        setHistory(data);
      } catch {
        setError("Failed to load history");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isLoaded, user?.id]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAnalysisDB(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const getUrgencyLabel = (score: number) => {
    if (score <= 3) return "Normal";
    if (score <= 6) return "Attention";
    return "Urgent";
  };

  const getUrgencyColor = (score: number) => {
    if (score <= 3) return "text-success-600 dark:text-success-400";
    if (score <= 6) return "text-warning-600 dark:text-warning-400";
    return "text-danger-600 dark:text-danger-400";
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-1">
            Report History
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            All your past analyses — {history.length} total
          </p>
        </div>
        <Link href="/app/analyze">
          <button className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
            New Analysis &#8594;
          </button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="xl" />
            <p className="text-surface-400 text-sm">Loading your history...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && history.length === 0 && (
        <div className={cn(
          "flex flex-col items-center justify-center py-20",
          "bg-white dark:bg-surface-800",
          "rounded-2xl border border-surface-200 dark:border-surface-700"
        )}>
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
            No analyses yet
          </h3>
          <p className="text-surface-400 text-sm mb-6 text-center max-w-sm">
            Your analyzed reports will appear here automatically after each analysis.
          </p>
          <Link href="/app/analyze">
            <button className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
              Analyze First Report &#8594;
            </button>
          </Link>
        </div>
      )}

      {!isLoading && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group p-5 rounded-2xl border",
                "bg-white dark:bg-surface-800",
                "border-surface-200 dark:border-surface-700",
                "hover:shadow-md transition-all duration-200"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <UrgencyDot score={item.urgency_score} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100 truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className={cn("text-xs font-semibold", getUrgencyColor(item.urgency_score))}>
                        {getUrgencyLabel(item.urgency_score)} · {item.urgency_score}/10
                      </span>
                      <span className="text-xs text-surface-400">
                        {item.overall_status}
                      </span>
                      {item.phi_detected && (
                        <span className="text-xs text-success-600 dark:text-success-400">
                          🔒 PHI removed
                        </span>
                      )}
                      <span className="text-xs text-surface-400">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "numeric", minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}