"use client";

import { useState, useEffect } from "react";
import { getDatasetStatus, isBackendOnline } from "@/lib/api";
import type { DatasetStatus } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { StatCard } from "@/components/ui/Card";
import { BackendOfflineAlert } from "@/components/ui/ErrorAlert";
import { Spinner } from "@/components/ui/Spinner";
import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from "recharts";

const DATASETS = [
  {
    key: "mtsamples",
    name: "MTSamples",
    icon: "🏥",
    desc: "Clinical transcriptions across 40 medical specialties",
    source: "Kaggle",
    sourceUrl: "https://www.kaggle.com/datasets/tboyle10/medicaltranscriptions",
    iconBg: "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400",
    color: "#3b82f6",
  },
  {
    key: "medquad",
    name: "MedQuAD",
    icon: "💬",
    desc: "Medical Q&A pairs from NIH, CDC, NLM and other official sources",
    source: "GitHub",
    sourceUrl: "https://github.com/abachaa/MedQuAD",
    iconBg: "bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400",
    color: "#22c55e",
  },
  {
    key: "pmcpatients",
    name: "PMC-Patients",
    icon: "🔬",
    desc: "Patient case reports and summaries extracted from PubMed Central",
    source: "HuggingFace",
    sourceUrl: "https://huggingface.co/datasets/zhengyun21/PMC-Patients",
    iconBg: "bg-warning-100 dark:bg-warning-900 text-warning-600 dark:text-warning-400",
    color: "#f59e0b",
  },
  {
    key: "mimic",
    name: "MIMIC-IV",
    icon: "🏨",
    desc: "ICU clinical data including lab results, medications, and diagnoses",
    source: "PhysioNet",
    sourceUrl: "https://physionet.org/content/mimiciv/",
    iconBg: "bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400",
    color: "#94a3b8",
  },
];

const SPECIALTY_DATA = [
  { name: "Surgery",      value: 1081 },
  { name: "Cardiology",   value: 368  },
  { name: "Neurology",    value: 223  },
  { name: "Orthopedic",   value: 346  },
  { name: "Radiology",    value: 271  },
  { name: "General Med",  value: 257  },
  { name: "Gastro",       value: 220  },
  { name: "OB/GYN",       value: 155  },
];

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

const GROWTH_DATA = [
  { month: "Oct", records: 4920  },
  { month: "Nov", records: 9920  },
  { month: "Dec", records: 14920 },
  { month: "Jan", records: 19920 },
  { month: "Feb", records: 24920 },
  { month: "Mar", records: 26321 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2 shadow-lg text-sm">
        <p className="font-semibold text-surface-900 dark:text-surface-100">{label}</p>
        <p className="text-primary-500">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [status, setStatus]   = useState<DatasetStatus | null>(null);
  const [online, setOnline]   = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [backendOnline, datasetStatus] = await Promise.all([
          isBackendOnline(),
          getDatasetStatus(),
        ]);
        setOnline(backendOnline);
        setStatus(datasetStatus);
      } catch {
        setOnline(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRecordCount = (key: string): number => {
    if (!status) return 0;
    return (status[key as keyof DatasetStatus] as number) ?? 0;
  };

  const barData = DATASETS.map((d) => ({
    name:  d.name,
    value: d.key === "mimic" ? 0 : getRecordCount(d.key),
    fill:  d.color,
  }));

  const pieData = DATASETS.filter(d => d.key !== "mimic").map((d) => ({
    name:  d.name,
    value: getRecordCount(d.key),
    fill:  d.color,
  }));

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="container-main py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
              Dashboard
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              System status, dataset overview and analytics
            </p>
          </div>
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border",
            online === null
              ? "bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-500"
              : online
                ? "bg-success-50 dark:bg-success-950 border-success-200 dark:border-success-800 text-success-700 dark:text-success-400"
                : "bg-danger-50 dark:bg-danger-950 border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              online === null ? "bg-surface-400" : online ? "bg-success-500 animate-pulse" : "bg-danger-500"
            )} />
            {online === null ? "Checking..." : online ? "Backend Online" : "Backend Offline"}
          </div>
        </div>

        {online === false && <BackendOfflineAlert />}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="w-10 h-10 text-primary-500" />
              <p className="text-surface-500 dark:text-surface-400 text-sm">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Records"  value={status ? formatNumber(status.total) : "—"} icon="🗃️" />
              <StatCard label="Clinical Cases" value={status ? formatNumber((status.mtsamples || 0) + (status.pmcpatients || 0)) : "—"} icon="🏥" />
              <StatCard label="Q&A Pairs"      value={status ? formatNumber(status.medquad || 0) : "—"} icon="💬" />
              <StatCard label="Datasets"       value="4" icon="📊" />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar chart */}
              <div className="p-6 rounded-2xl border bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-sm">
                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">
                  Dataset Size Comparison
                </h3>
                <p className="text-xs text-surface-400 mb-6">Total records loaded per dataset</p>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barSize={40}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie chart */}
              <div className="p-6 rounded-2xl border bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-sm">
                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">
                  Data Distribution
                </h3>
                <p className="text-xs text-surface-400 mb-2">Share of total records by dataset</p>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value.toLocaleString() + " records", ""]} />
                      <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-[11px] text-surface-400">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Area chart */}
              <div className="p-6 rounded-2xl border bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-sm">
                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">
                  Dataset Growth
                </h3>
                <p className="text-xs text-surface-400 mb-6">Cumulative records added over time</p>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={GROWTH_DATA}>
                      <defs>
                        <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip />
                      <Area type="monotone" dataKey="records" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRecords)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Specialty Bar Chart */}
              <div className="p-6 rounded-2xl border bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-sm">
                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">
                  Top Medical Specialties
                </h3>
                <p className="text-xs text-surface-400 mb-6">Cases per specialty in MTSamples</p>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SPECIALTY_DATA} layout="vertical" barSize={14}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip formatter={(value: number) => [value.toLocaleString() + " cases", ""]} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {SPECIALTY_DATA.map((_, index) => (
                          <Cell key={`spec-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Dataset Cards */}
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-5">
                Dataset Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DATASETS.map((dataset) => {
                  const count = getRecordCount(dataset.key);
                  const isLoaded = count > 0;
                  const isMimic = dataset.key === "mimic";

                  return (
                    <div
                      key={dataset.key}
                      className="p-6 rounded-2xl border bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0", dataset.iconBg)}>
                            {dataset.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-surface-900 dark:text-surface-100">{dataset.name}</h3>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                isMimic ? "bg-surface-100 text-surface-500" : isLoaded ? "bg-success-50 text-success-700" : "bg-warning-50 text-warning-700"
                              )}>
                                {isMimic ? "Coming Soon" : isLoaded ? "✓ Loaded" : "Not Loaded"}
                              </span>
                            </div>
                            <p className="text-sm text-surface-500 dark:text-surface-400 mb-2">{dataset.desc}</p>
                            <a 
                              href={dataset.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-primary-500 hover:text-primary-600 inline-block"
                            >
                              {dataset.source} &#8594;
                            </a>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                            {isMimic ? "—" : formatNumber(count)}
                          </p>
                          <p className="text-xs text-surface-400">records</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: "🔬", title: "Analyze Report", desc: "AI analysis of medical reports", href: "/sign-up", variant: "primary" as const },
                { icon: "💬", title: "Ask Question", desc: "Plain language medical Q&A", href: "/sign-up", variant: "secondary" as const },
                { icon: "📖", title: "API Docs", desc: "Explore FastAPI endpoints", href: "http://localhost:8000/docs", variant: "outline" as const },
              ].map((action) => (
                <div key={action.title} className="p-6 rounded-2xl border bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 flex flex-col gap-4 shadow-sm">
                  <div className="text-3xl">{action.icon}</div>
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">{action.title}</h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{action.desc}</p>
                  </div>
                  <Button variant={action.variant} size="sm" fullWidth >
                    <Link href={action.href} target={action.href.startsWith("http") ? "_blank" : undefined}>
                      {action.title} &#8594;
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}