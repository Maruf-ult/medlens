"use client";

import { useState, useEffect, useRef } from "react";
import { analyzeText, analyzeFile } from "@/lib/api";
import type { AnalysisResult } from "@/types";
import { cn, formatProcessingTime, getSeverityClasses, getSeverityIcon } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Alert, MedicalDisclaimerAlert, PHIDetectedAlert } from "@/components/ui/ErrorAlert";
import { SkeletonAnalysis } from "@/components/ui/Spinner";
import { SeverityBadge, UrgencyBadge, DatasetBadge } from "@/components/ui/Badge";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, Legend,
} from "recharts";
import { useUser } from "@clerk/nextjs";
import { saveAnalysisDB } from "@/lib/api";
import { generateId } from "@/lib/utils";
import { useAnalysisStore } from "@/store/useAnalysisStore";

const SAMPLE_REPORT = `LABORATORY REPORT
Patient: [REDACTED]
Date: [REDACTED]

COMPLETE BLOOD COUNT:
WBC: 12.5 HIGH (ref: 4.5-11.0 K/uL)
RBC: 3.8 LOW (ref: 4.2-5.4 M/uL)
Hemoglobin: 9.8 LOW (ref: 12.0-16.0 g/dL)
Hematocrit: 31.2 LOW (ref: 37-47%)
Platelets: 420 HIGH (ref: 150-400 K/uL)

METABOLIC PANEL:
Glucose: 148 HIGH (ref: 70-100 mg/dL)
Creatinine: 2.1 HIGH (ref: 0.6-1.2 mg/dL)
BUN: 28 HIGH (ref: 7-20 mg/dL)
Sodium: 138 Normal (ref: 136-145 mEq/L)
Potassium: 4.2 Normal (ref: 3.5-5.1 mEq/L)`;

const SEVERITY_COLORS = {
  normal:   "#22c55e",
  warning:  "#f59e0b",
  critical: "#ef4444",
};

// --- Sub-components for Charts ---

function UrgencyGauge({ score }: { score: number }) {
  const color = score <= 3 ? "#22c55e" : score <= 6 ? "#f59e0b" : "#ef4444";
  const data = [
    { name: "Score", value: score,      fill: color     },
    { name: "Rest",  value: 10 - score, fill: "#e2e8f0" },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius={55}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-10">
        <p className="text-4xl font-bold" style={{ color }}>{score}</p>
        <p className="text-xs text-surface-400 mt-1">out of 10</p>
      </div>
    </div>
  );
}

function FindingsDonut({ result }: { result: AnalysisResult }) {
  const normal   = result.findings.filter(f => f.severity === "normal").length;
  const warning  = result.findings.filter(f => f.severity === "warning").length;
  const critical = result.findings.filter(f => f.severity === "critical").length;

  const data = [
    { name: "Normal",   value: normal,   fill: SEVERITY_COLORS.normal   },
    { name: "Attention", value: warning, fill: SEVERITY_COLORS.warning  },
    { name: "Critical", value: critical, fill: SEVERITY_COLORS.critical },
  ].filter(d => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value} findings`, name]}
          contentStyle={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function FindingsBarChart({ result }: { result: AnalysisResult }) {
  const data = result.findings.map((f) => ({
    name:  f.title.length > 12 ? f.title.slice(0, 12) + "..." : f.title,
    value: f.severity === "normal" ? 1 : f.severity === "warning" ? 2 : 3,
    fill:  SEVERITY_COLORS[f.severity as keyof typeof SEVERITY_COLORS],
    full:  f.title,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 3]}
          ticks={[1, 2, 3]}
          tickFormatter={(v) => v === 1 ? "Normal" : v === 2 ? "Warning" : "Critical"}
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip
          formatter={(_: number, __: string, props: { payload: { full: string; fill: string } }) => [
            props.payload.full,
            "Finding"
          ]}
          contentStyle={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SeverityRadialChart({ result }: { result: AnalysisResult }) {
  const normal   = result.findings.filter(f => f.severity === "normal").length;
  const warning  = result.findings.filter(f => f.severity === "warning").length;
  const critical = result.findings.filter(f => f.severity === "critical").length;
  const total    = result.findings.length || 1;

  const data = [
    { name: "Normal",    value: Math.round((normal   / total) * 100), fill: SEVERITY_COLORS.normal   },
    { name: "Attention", value: Math.round((warning  / total) * 100), fill: SEVERITY_COLORS.warning  },
    { name: "Critical",  value: Math.round((critical / total) * 100), fill: SEVERITY_COLORS.critical },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="25%"
        outerRadius="90%"
        data={data}
        startAngle={180}
        endAngle={-180}
      >
        <RadialBar dataKey="value" cornerRadius={4} background />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{value}</span>
          )}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, "Percentage"]}
          contentStyle={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

// --- Main Page Component ---

export default function AnalyzePage() {
  const {
    currentResult: result,
    currentText: reportText,
    currentMode: analysisMode,
    activeTab,
    setResult,
    setText: setReportText,
    setMode: setAnalysisMode,
    setActiveTab,
    clearAll,
  } = useAnalysisStore();

  const [inputMode, setInputMode]     = useState<"text" | "file">("text");
  const [file, setFile]               = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const { user } = useUser();

  // Create ref for the results section
  const resultsRef = useRef<HTMLDivElement>(null);

  // Helper to scroll to results
  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    setIsAnalyzing(true);
    setActiveTab("summary");

    // Scroll down to show the loader/skeleton immediately
    scrollToResults();

    try {
      let data: AnalysisResult;
      let textToSave = reportText;

      if (inputMode === "file" && file) {
        data = await analyzeFile(file);
        if (data.raw_text) {
            setReportText(data.raw_text);
            textToSave = data.raw_text;
        }
      } else {
        if (!reportText.trim() || reportText.trim().length < 20) {
          throw new Error("Please enter at least 20 characters of medical report text.");
        }
        data = await analyzeText({ text: reportText, mode: analysisMode });
      }
      
      setResult(data);

      // Scroll again once results are in to focus on findings
      scrollToResults();

      if (user?.id) {
        const title = data.findings?.[0]?.title || data.summary.slice(0, 47) + "...";
        await saveAnalysisDB({
          id: generateId(),
          user_id: user.id,
          title,
          report_text: textToSave || "File Upload Analysis",
          overall_status: data.overall_status,
          urgency_score: data.urgency_score,
          summary: data.summary,
          findings: data.findings,
          doctor_questions: data.doctor_questions,
          dataset_context: data.dataset_context_used,
          processing_time_ms: data.processing_time_ms,
          phi_detected: data.phi_detected,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleClear = () => {
    setReportText("");
    setFile(null);
    setResult(null);
    setError(null);
    clearAll();
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="container-main py-12">

        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-3">
            Analyze Your Report
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Paste your medical report or upload a file. Get AI analysis with visual charts.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">

          <MedicalDisclaimerAlert />

          {/* Input card */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
            <div className="flex border-b border-surface-200 dark:border-surface-700">
              {[
                { key: "text", label: "📝 Paste Text"   },
                { key: "file", label: "📎 Upload File"  },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setInputMode(tab.key as "text" | "file")}
                  className={cn(
                    "flex-1 py-4 text-sm font-medium transition-colors duration-150",
                    inputMode === tab.key
                      ? "bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                      : "bg-surface-50 dark:bg-surface-900 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5">
              {inputMode === "text" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      Medical Report Text
                    </label>
                    <button
                      onClick={() => setReportText(SAMPLE_REPORT)}
                      className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      Load sample report &#8594;
                    </button>
                  </div>
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Paste your medical report, lab results, or clinical notes here..."
                    rows={10}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl",
                      "bg-surface-50 dark:bg-surface-900",
                      "border border-surface-200 dark:border-surface-700",
                      "text-surface-900 dark:text-surface-100",
                      "placeholder:text-surface-400 dark:placeholder:text-surface-500",
                      "text-sm font-mono leading-relaxed resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                      "transition-colors duration-150"
                    )}
                  />
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span>{reportText.length} characters</span>
                    {reportText.length > 0 && (
                      <button onClick={() => setReportText("")} className="hover:text-danger-500 transition-colors">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {inputMode === "file" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Upload Medical Document
                  </label>
                  <div className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center",
                    "border-surface-300 dark:border-surface-600",
                    "hover:border-primary-400 transition-colors duration-150",
                    file && "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
                  )}>
                    {file ? (
                      <div className="space-y-2">
                        <div className="text-4xl">📄</div>
                        <p className="font-medium text-surface-900 dark:text-surface-100">{file.name}</p>
                        <p className="text-sm text-surface-400">{(file.size / 1024).toFixed(1)} KB</p>
                        <button onClick={() => setFile(null)} className="text-xs text-danger-500 hover:text-danger-600">
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-4xl">📎</div>
                        <p className="text-surface-600 dark:text-surface-400 font-medium">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-surface-400">Supports PDF, JPG, PNG, TXT</p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.txt"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className={cn(
                            "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer",
                            "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400",
                            "border border-primary-200 dark:border-primary-800",
                            "hover:bg-primary-100 transition-colors"
                          )}
                        >
                          Browse Files
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {inputMode === "text" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Analysis Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "full",      label: "Full Analysis",  desc: "Complete breakdown" },
                      { key: "redflags",  label: "Red Flags",      desc: "Abnormal only"      },
                      { key: "layman",    label: "Plain Language", desc: "Simple terms"        },
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setAnalysisMode(m.key as "full" | "redflags" | "layman")}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all duration-150",
                          analysisMode === m.key
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30 dark:border-primary-400"
                            : "border-surface-200 dark:border-surface-700 hover:border-surface-300"
                        )}
                      >
                        <p className={cn("text-xs font-semibold", analysisMode === m.key ? "text-primary-600 dark:text-primary-400" : "text-surface-700 dark:text-surface-300")}>
                          {m.label}
                        </p>
                        <p className="text-xs text-surface-400 mt-0.5">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <Alert variant="error" message={error} dismissible onDismiss={() => setError(null)} />}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAnalyze}
                  isLoading={isAnalyzing}
                  disabled={inputMode === "text" ? !reportText.trim() : !file}
                  fullWidth
                  size="lg"
                >
                  {isAnalyzing ? "Analyzing..." : "🔬 Analyze Report"}
                </Button>
                {(reportText || file || result) && (
                  <Button variant="outline" size="lg" onClick={handleClear}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results Ref Area */}
          <div ref={resultsRef} className="scroll-mt-10">
            {isAnalyzing && <SkeletonAnalysis />}

            {result && !isAnalyzing && (
              <div className="space-y-4 animate-fade-in">

                {result.phi_detected && <PHIDetectedAlert />}

                <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
                  <div className="flex border-b border-surface-200 dark:border-surface-700">
                    {[
                      { key: "summary",   label: "📋 Summary"    },
                      { key: "charts",    label: "📊 Charts"     },
                      { key: "findings",  label: `🔍 Findings (${result.findings.length})` },
                      { key: "questions", label: "💬 Questions"  },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as "summary" | "charts" | "findings" | "questions")}
                        className={cn(
                          "flex-1 py-3 text-xs sm:text-sm font-medium transition-colors duration-150",
                          activeTab === tab.key
                            ? "bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                            : "bg-surface-50 dark:bg-surface-900 text-surface-500 hover:text-surface-700 dark:text-surface-400"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {/* SUMMARY TAB */}
                    {activeTab === "summary" && (
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                              Analysis Summary
                            </h2>
                            <p className="text-sm text-surface-400 mt-1">
                              Processed in {formatProcessingTime(result.processing_time_ms)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <UrgencyBadge score={result.urgency_score} size="lg" />
                            {result.dataset_context_used && (
                              <DatasetBadge source={result.dataset_context_used} />
                            )}
                          </div>
                        </div>

                        <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                          {result.summary}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4 border-t border-surface-100 dark:border-surface-700">
                          {[
                            { label: "Normal",    count: result.findings.filter(f => f.severity === "normal").length,   color: "text-success-600 dark:text-success-400",  bg: "bg-success-50 dark:bg-success-950"  },
                            { label: "Attention", count: result.findings.filter(f => f.severity === "warning").length,  color: "text-warning-600 dark:text-warning-400",  bg: "bg-warning-50 dark:bg-warning-950"  },
                            { label: "Critical",  count: result.findings.filter(f => f.severity === "critical").length, color: "text-danger-600 dark:text-danger-400",    bg: "bg-danger-50 dark:bg-danger-950"    },
                          ].map((s) => (
                            <div key={s.label} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl", s.bg)}>
                              <span className={cn("text-2xl font-bold", s.color)}>{s.count}</span>
                              <span className={cn("text-sm font-medium", s.color)}>{s.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CHARTS TAB */}
                    {activeTab === "charts" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="p-5 rounded-xl border text-center bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700">
                            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Urgency Score</h3>
                            <UrgencyGauge score={result.urgency_score} />
                            <p className="text-xs text-surface-400 mt-2">
                              {result.urgency_score <= 3 ? "All Normal" : result.urgency_score <= 6 ? "Attention Needed" : "Urgent Review"}
                            </p>
                          </div>

                          <div className="p-5 rounded-xl border bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700">
                            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Findings Breakdown</h3>
                            <FindingsDonut result={result} />
                          </div>

                          <div className="p-5 rounded-xl border bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700">
                            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Severity Distribution</h3>
                            <SeverityRadialChart result={result} />
                          </div>
                        </div>

                        <div className="p-5 rounded-xl border bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700">
                          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">Individual Findings Severity</h3>
                          <FindingsBarChart result={result} />
                        </div>
                      </div>
                    )}

                    {/* FINDINGS TAB */}
                    {activeTab === "findings" && (
                      <div className="space-y-3">
                        {result.findings.map((finding, index) => (
                          <div
                            key={index}
                            className={cn("p-5 rounded-xl border", getSeverityClasses(finding.severity))}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span>{getSeverityIcon(finding.severity)}</span>
                                <h4 className="font-semibold">{finding.title}</h4>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {finding.value && (
                                  <span className="text-sm font-bold">{finding.value}</span>
                                )}
                                <SeverityBadge severity={finding.severity} size="sm" />
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed opacity-90">{finding.detail}</p>
                            {finding.reference_range && (
                              <p className="text-xs opacity-60 mt-2">Reference range: {finding.reference_range}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* QUESTIONS TAB */}
                    {activeTab === "questions" && (
                      <div className="space-y-3">
                        <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                          Based on your results, here are important questions to ask your doctor.
                        </p>
                        {result.doctor_questions.map((question, index) => (
                          <div
                            key={index}
                            className="flex gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700"
                          >
                            <span className="shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                              {question}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}