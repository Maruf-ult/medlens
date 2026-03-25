"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { getAnalysisHistory, getAnalysisDetail, deleteAnalysisDB } from "@/lib/api";
import type { AnalysisRecord, AnalysisDetailRecord } from "@/types";
import { cn, formatProcessingTime, getSeverityClasses, getSeverityIcon } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import { SeverityBadge, UrgencyBadge, DatasetBadge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, Legend,
} from "recharts";

const SEVERITY_COLORS = {
  normal: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

/**
 * Helper to ensure JSON fields are arrays even if returned as strings from DB
 */
const safeParseArray = (data: any) => {
  if (Array.isArray(data)) return data;
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function UrgencyDot({ score }: { score: number }) {
  const color = score <= 3 ? "bg-success-500" : score <= 6 ? "bg-warning-500" : "bg-danger-500";
  return <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-1", color)} />;
}

function UrgencyGauge({ score }: { score: number }) {
  const color = score <= 3 ? "#22c55e" : score <= 6 ? "#f59e0b" : "#ef4444";
  const data = [
    { value: score, fill: color },
    { value: 10 - score, fill: "#e2e8f0" },
  ];
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="80%" startAngle={180} endAngle={0} innerRadius={50} outerRadius={68} paddingAngle={2} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-8">
        <p className="text-3xl font-bold" style={{ color }}>{score}</p>
        <p className="text-xs text-surface-400 mt-0.5">out of 10</p>
      </div>
    </div>
  );
}

function DetailView({ detail, onClose }: { detail: AnalysisDetailRecord; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"summary" | "charts" | "findings" | "questions">("summary");

  const findings = useMemo(() => safeParseArray(detail.findings), [detail.findings]);
  const questions = useMemo(() => safeParseArray(detail.doctor_questions), [detail.doctor_questions]);

  const donutData = useMemo(() => [
    { name: "Normal", value: findings.filter((f: any) => f.severity === "normal").length, fill: SEVERITY_COLORS.normal },
    { name: "Attention", value: findings.filter((f: any) => f.severity === "warning").length, fill: SEVERITY_COLORS.warning },
    { name: "Critical", value: findings.filter((f: any) => f.severity === "critical").length, fill: SEVERITY_COLORS.critical },
  ].filter(d => d.value > 0), [findings]);

  const barData = useMemo(() => findings.map((f: any) => ({
    name: f.title.length > 12 ? f.title.slice(0, 12) + "..." : f.title,
    value: f.severity === "normal" ? 1 : f.severity === "warning" ? 2 : 3,
    fill: SEVERITY_COLORS[f.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.normal,
  })), [findings]);

  const radialData = useMemo(() => {
    const total = findings.length || 1;
    return [
      { name: "Normal", value: Math.round((findings.filter((f: any) => f.severity === "normal").length / total) * 100), fill: SEVERITY_COLORS.normal },
      { name: "Attention", value: Math.round((findings.filter((f: any) => f.severity === "warning").length / total) * 100), fill: SEVERITY_COLORS.warning },
      { name: "Critical", value: Math.round((findings.filter((f: any) => f.severity === "critical").length / total) * 100), fill: SEVERITY_COLORS.critical },
    ];
  }, [findings]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-surface-900 rounded-2xl shadow-2xl">
          <div className="flex items-start justify-between p-6 border-b border-surface-200 dark:border-surface-700">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">{detail.title}</h2>
              <p className="text-sm text-surface-400 mt-1">
                {new Date(detail.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex border-b border-surface-200 dark:border-surface-700">
            {[
              { key: "summary", label: "📋 Summary" },
              { key: "charts", label: "📊 Charts" },
              { key: "findings", label: `🔍 Findings (${findings.length})` },
              { key: "questions", label: "💬 Questions" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  "flex-1 py-3 text-xs sm:text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                    : "text-surface-500 hover:text-surface-700 dark:text-surface-400"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "summary" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">Analysis Summary</h3>
                    {detail.processing_time_ms && (
                      <p className="text-sm text-surface-400 mt-1">Processed in {formatProcessingTime(detail.processing_time_ms)}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <UrgencyBadge score={detail.urgency_score} size="lg" />
                    {detail.dataset_context && <DatasetBadge source={detail.dataset_context} />}
                  </div>
                </div>
                <p className="text-surface-600 dark:text-surface-300 leading-relaxed">{detail.summary}</p>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-surface-100 dark:border-surface-700">
                  {[
                    { label: "Normal", count: findings.filter((f: any) => f.severity === "normal").length, color: "text-success-600", bg: "bg-success-50 dark:bg-success-950" },
                    { label: "Attention", count: findings.filter((f: any) => f.severity === "warning").length, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-950" },
                    { label: "Critical", count: findings.filter((f: any) => f.severity === "critical").length, color: "text-danger-600", bg: "bg-danger-50 dark:bg-danger-950" },
                  ].map((s) => (
                    <div key={s.label} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl", s.bg)}>
                      <span className={cn("text-2xl font-bold", s.color)}>{s.count}</span>
                      <span className={cn("text-sm font-medium", s.color)}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "charts" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={cn("p-5 rounded-xl border text-center", "bg-surface-50 dark:bg-surface-800", "border-surface-200 dark:border-surface-700")}>
                    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Urgency Score</h3>
                    <UrgencyGauge score={detail.urgency_score} />
                  </div>
                  <div className={cn("p-5 rounded-xl border", "bg-surface-50 dark:bg-surface-800", "border-surface-200 dark:border-surface-700")}>
                    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Findings Breakdown</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                          {donutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip formatter={(v: number, n: string) => [`${v} findings`, n]} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: "11px", color: "#94a3b8" }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={cn("p-5 rounded-xl border", "bg-surface-50 dark:bg-surface-800", "border-surface-200 dark:border-surface-700")}>
                    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Severity Distribution</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" data={radialData} startAngle={180} endAngle={-180}>
                        <RadialBar dataKey="value" cornerRadius={4} />
                        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: "11px", color: "#94a3b8" }}>{v}</span>} />
                        <Tooltip formatter={(v: number) => [`${v}%`, "Percentage"]} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "findings" && (
              <div className="space-y-3">
                {findings.map((finding: any, index: number) => (
                  <div key={index} className={cn("p-5 rounded-xl border", getSeverityClasses(finding.severity))}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span>{getSeverityIcon(finding.severity)}</span>
                        <h4 className="font-semibold">{finding.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {finding.value && <span className="text-sm font-bold">{finding.value}</span>}
                        <SeverityBadge severity={finding.severity} size="sm" />
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">{finding.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "questions" && (
              <div className="space-y-3">
                {questions.map((q: string, i: number) => (
                  <div key={i} className={cn("flex gap-4 p-4 rounded-xl", "bg-surface-50 dark:bg-surface-900", "border border-surface-200 dark:border-surface-700")}>
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AnalysisDetailRecord | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getAnalysisHistory(user.id);
        setHistory(data || []);
      } catch {
        setError("Failed to load history");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isLoaded, user?.id]);

  const handleOpen = async (id: string) => {
    if (!user?.id) return;
    setLoadingId(id);
    try {
      const detail = await getAnalysisDetail(user.id, id);
      setSelected(detail);
    } catch {
      alert("Failed to load analysis details");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      await deleteAnalysisDB(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const getUrgencyLabel = (score: number) => score <= 3 ? "Normal" : score <= 6 ? "Attention" : "Urgent";
  const getUrgencyColor = (score: number) => score <= 3 ? "text-success-600" : score <= 6 ? "text-warning-600" : "text-danger-600";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {selected && <DetailView detail={selected} onClose={() => setSelected(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-1">Report History</h1>
          <p className="text-surface-500 dark:text-surface-400">{history.length} analyses saved</p>
        </div>
        <Link href="/app/analyze">
          <button className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
            New Analysis →
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner size="xl" />
          <p className="text-surface-400 text-sm">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
          <Link href="/app/analyze">
            <button className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm">Analyze First Report</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpen(item.id)}
              className="group p-5 rounded-2xl border cursor-pointer bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <UrgencyDot score={item.urgency_score} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100 truncate group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-surface-500 mt-1 line-clamp-2">{item.summary}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                      <span className={cn("font-semibold", getUrgencyColor(item.urgency_score))}>
                        {getUrgencyLabel(item.urgency_score)} · {item.urgency_score}/10
                      </span>
                      <span className="text-surface-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loadingId === item.id && <Spinner size="sm" />}
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-surface-400 hover:text-danger-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}