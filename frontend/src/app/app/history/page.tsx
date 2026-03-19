"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
          Report History
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          All your past analyses saved automatically
        </p>
      </div>

      <div className={cn(
        "flex flex-col items-center justify-center py-20",
        "bg-white dark:bg-surface-800",
        "rounded-2xl border border-surface-200 dark:border-surface-700"
      )}>
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
          No analyses yet
        </h3>
        <p className="text-surface-400 dark:text-surface-500 text-sm mb-6 text-center max-w-sm">
          Your analyzed reports will appear here. Start by analyzing your first report.
        </p>
        <Link href="/app/analyze">
          <button className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
            New Analysis &#8594;
          </button>
        </Link>
      </div>
    </div>
  );
}