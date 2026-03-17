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

const DATASETS = [
  {
    key: "mtsamples",
    name: "MTSamples",
    icon: "🏥",
    desc: "Clinical transcriptions across 40 medical specialties",
    source: "Kaggle",
    sourceUrl: "https://www.kaggle.com/datasets/tboyle10/medicaltranscriptions",
    iconBg: "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400",
  },
  {
    key: "medquad",
    name: "MedQuAD",
    icon: "💬",
    desc: "Medical Q&A pairs from NIH, CDC, NLM and other official sources",
    source: "GitHub",
    sourceUrl: "https://github.com/abachaa/MedQuAD",
    iconBg: "bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400",
  },
  {
    key: "pmcpatients",
    name: "PMC-Patients",
    icon: "🔬",
    desc: "Patient case reports and summaries extracted from PubMed Central",
    source: "HuggingFace",
    sourceUrl: "https://huggingface.co/datasets/zhengyun21/PMC-Patients",
    iconBg: "bg-warning-100 dark:bg-warning-900 text-warning-600 dark:text-warning-400",
  },
  {
    key: "mimic",
    name: "MIMIC-IV",
    icon: "🏨",
    desc: "ICU clinical data including lab results, medications, and diagnoses",
    source: "PhysioNet",
    sourceUrl: "https://physionet.org/content/mimiciv/",
    iconBg: "bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400",
  },
];

export default function DashboardPage() {
  const [status, setStatus] = useState<DatasetStatus | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
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

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="container-main py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
              Dashboard
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              System status and dataset overview
            </p>
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border",
              online === null
                ? "bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-500"
                : online
                ? "bg-success-50 dark:bg-success-950 border-success-200 dark:border-success-800 text-success-700 dark:text-success-400"
                : "bg-danger-50 dark:bg-danger-950 border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                online === null ? "bg-surface-400" : online ? "bg-success-500 animate-pulse" : "bg-danger-500"
              )}
            />
            {online === null ? "Checking..." : online ? "Backend Online" : "Backend Offline"}
          </div>
        </div>

        {online === false && <BackendOfflineAlert />}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="xl" />
              <p className="text-surface-500 dark:text-surface-400 text-sm">Loading dashboard...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Records"
                value={status ? formatNumber(status.total) : "—"}
                icon="🗃️"
              />
              <StatCard
                label="Clinical Cases"
                value={status ? formatNumber((status.mtsamples || 0) + (status.pmcpatients || 0)) : "—"}
                icon="🏥"
              />
              <StatCard
                label="Q&A Pairs"
                value={status ? formatNumber(status.medquad || 0) : "—"}
                icon="💬"
              />
              <StatCard label="Datasets" value="4" icon="📊" />
            </div>

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
                      className={cn(
                        "p-6 rounded-2xl border",
                        "bg-white dark:bg-surface-800",
                        "border-surface-200 dark:border-surface-700",
                        "shadow-sm hover:shadow-md transition-shadow duration-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
                              dataset.iconBg
                            )}
                          >
                            {dataset.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                                {dataset.name}
                              </h3>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  isMimic
                                    ? "bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400"
                                    : isLoaded
                                    ? "bg-success-50 dark:bg-success-950 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800"
                                    : "bg-warning-50 dark:bg-warning-950 text-warning-700 dark:text-warning-400 border border-warning-200 dark:border-warning-800"
                                )}
                              >
                                {isMimic ? "Coming Soon" : isLoaded ? "✓ Loaded" : "Not Loaded"}
                              </span>
                            </div>
                            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                              {dataset.desc}
                            </p>
                            <a
                              href={dataset.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-500 hover:text-primary-600 mt-1 inline-block"
                            >
                              {dataset.source} &#8594;
                            </a>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                            {isMimic ? "—" : formatNumber(count)}
                          </p>
                          <p className="text-xs text-surface-400 dark:text-surface-500">records</p>
                        </div>
                      </div>

                      {!isMimic && (
                        <div className="mt-4">
                          <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-700",
                                isLoaded ? "bg-success-500" : "bg-surface-300 dark:bg-surface-600"
                              )}
                              style={{ width: isLoaded ? "100%" : "0%" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-5">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: "🔬",
                    title: "Analyze Report",
                    desc: "Upload or paste a medical report for AI analysis",
                    href: "/analyze",
                    variant: "primary" as const,
                  },
                  {
                    icon: "💬",
                    title: "Ask a Question",
                    desc: "Get plain language answers to medical questions",
                    href: "/chat",
                    variant: "secondary" as const,
                  },
                  {
                    icon: "📖",
                    title: "API Docs",
                    desc: "Explore the FastAPI backend endpoints",
                    href: "http://localhost:8000/docs",
                    variant: "outline" as const,
                  },
                ].map((action) => (
                  <div
                    key={action.title}
                    className={cn(
                      "p-6 rounded-2xl border",
                      "bg-white dark:bg-surface-800",
                      "border-surface-200 dark:border-surface-700",
                      "shadow-sm hover:shadow-md transition-all duration-200",
                      "flex flex-col gap-4"
                    )}
                  >
                    <div className="text-3xl">{action.icon}</div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{action.desc}</p>
                    </div>
                    <Link
                      href={action.href}
                      target={action.href.startsWith("http") ? "_blank" : undefined}
                      passHref
                    >
                      <Button variant={action.variant} size="sm" fullWidth>
                        {action.title} &#8594;
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={cn(
                "p-6 rounded-2xl border",
                "bg-white dark:bg-surface-800",
                "border-surface-200 dark:border-surface-700",
                "shadow-sm"
              )}
            >
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-4">
                System Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "AI Model", value: "Llama 3.3 70B" },
                  { label: "Provider", value: "Groq API" },
                  { label: "De-identifier", value: "MS Presidio" },
                  { label: "Vector DB", value: "pgvector" },
                ].map((info) => (
                  <div key={info.label}>
                    <p className="text-xs text-surface-400 dark:text-surface-500 mb-1">{info.label}</p>
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                      {info.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}