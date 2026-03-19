"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AppDashboard() {
  const { user } = useUser();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
          Welcome, {user?.firstName ?? "there"}! 👋
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          What would you like to do today?
        </p>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: "🔬",
            title: "New Analysis",
            desc: "Upload or paste a medical report for instant AI analysis",
            href: "/app/analyze",
            primary: true,
          },
          {
            icon: "💬",
            title: "Ask a Question",
            desc: "Get plain language answers to any medical question",
            href: "/app/chat",
            primary: false,
          },
          {
            icon: "📋",
            title: "Report History",
            desc: "See all your past reports and analyses",
            href: "/app/history",
            primary: false,
          },
        ].map((action) => (
          <Link key={action.title} href={action.href}>
            <div className={cn(
              "p-6 rounded-2xl border cursor-pointer h-full",
              "transition-all duration-200 hover:shadow-md",
              action.primary
                ? "bg-primary-500 border-primary-500 hover:bg-primary-600"
                : "bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-surface-300"
            )}>
              <div className="text-3xl mb-4">{action.icon}</div>
              <h3 className={cn(
                "font-semibold mb-2",
                action.primary ? "text-white" : "text-surface-900 dark:text-surface-100"
              )}>
                {action.title}
              </h3>
              <p className={cn(
                "text-sm leading-relaxed",
                action.primary ? "text-primary-100" : "text-surface-500 dark:text-surface-400"
              )}>
                {action.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Records",  value: "26,321+", icon: "🗃️" },
          { label: "Q&A Pairs",      value: "16,401",  icon: "💬" },
          { label: "Specialties",    value: "40+",     icon: "🏥" },
          { label: "Avg Analysis",   value: "2s",      icon: "⚡" },
        ].map((stat) => (
          <div key={stat.label} className={cn(
            "p-4 rounded-xl text-center",
            "bg-white dark:bg-surface-800",
            "border border-surface-200 dark:border-surface-700"
          )}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-primary-500">{stat.value}</div>
            <div className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Getting started */}
      <div className={cn(
        "p-6 rounded-2xl border",
        "bg-white dark:bg-surface-800",
        "border-surface-200 dark:border-surface-700"
      )}>
        <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-4">
          💡 Getting Started
        </h2>
        <div className="space-y-3">
          {[
            "Click New Analysis to upload or paste your medical report",
            "AI will analyze every finding and show visual charts",
            "Ask follow-up questions about your results",
            "All your reports are saved automatically to your account",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-surface-600 dark:text-surface-400">{tip}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}