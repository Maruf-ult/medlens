"use client";

import { useState } from "react";
import { analyzeText, analyzeFile } from "@/lib/api";
import type { AnalysisResult, AnalyzeRequest } from "@/types";
import { cn, formatProcessingTime, getSeverityClasses, getSeverityIcon } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Alert, MedicalDisclaimerAlert, PHIDetectedAlert } from "@/components/ui/ErrorAlert";
import { SkeletonAnalysis } from "@/components/ui/Spinner";
import { SeverityBadge, UrgencyBadge, DatasetBadge } from "@/components/ui/Badge";

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

export default function AnalyzePage() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [reportText, setReportText] = useState("");
  const [analysisMode, setAnalysisMode] = useState<AnalyzeRequest["mode"]>("full");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    setIsAnalyzing(true);

    try {
      let data: AnalysisResult;

      if (mode === "file" && file) {
        data = await analyzeFile(file);
      } else {
        if (!reportText.trim() || reportText.trim().length < 20) {
          setError("Please enter at least 20 characters of medical report text.");
          setIsAnalyzing(false);
          return;
        }
        data = await analyzeText({ text: reportText, mode: analysisMode });
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleClear = () => {
    setReportText("");
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="container-main py-12">

    
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-3">
            Analyze Your Report
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Paste your medical report or upload a file. Our AI will explain every finding in plain language.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">

       
          <MedicalDisclaimerAlert />

        
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">

         
            <div className="flex border-b border-surface-200 dark:border-surface-700">
              {[
                { key: "text", label: "📝 Paste Text" },
                { key: "file", label: "📎 Upload File" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMode(tab.key as "text" | "file")}
                  className={cn(
                    "flex-1 py-4 text-sm font-medium transition-colors duration-150",
                    mode === tab.key
                      ? "bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                      : "bg-surface-50 dark:bg-surface-900 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5">

        
              {mode === "text" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      Medical Report Text
                    </label>
                    <button
                      onClick={() => setReportText(SAMPLE_REPORT)}
                      className="text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Load sample report →
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
                      "text-sm font-mono leading-relaxed",
                      "resize-none",
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

           
              {mode === "file" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Upload Medical Document
                  </label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-10 text-center",
                      "border-surface-300 dark:border-surface-600",
                      "hover:border-primary-400 dark:hover:border-primary-500",
                      "transition-colors duration-150",
                      file && "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
                    )}
                  >
                    {file ? (
                      <div className="space-y-2">
                        <div className="text-4xl">📄</div>
                        <p className="font-medium text-surface-900 dark:text-surface-100">{file.name}</p>
                        <p className="text-sm text-surface-400">{(file.size / 1024).toFixed(1)} KB</p>
                        <button
                          onClick={() => setFile(null)}
                          className="text-xs text-danger-500 hover:text-danger-600 transition-colors"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-4xl">📎</div>
                        <p className="text-surface-600 dark:text-surface-400 font-medium">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-surface-400 dark:text-surface-500">
                          Supports PDF, JPG, PNG, TXT
                        </p>
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
                            "hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                          )}
                        >
                          Browse Files
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

           
              {mode === "text" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Analysis Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "full", label: "Full Analysis", desc: "Complete breakdown" },
                      { key: "redflags", label: "Red Flags", desc: "Abnormal only" },
                      { key: "layman", label: "Plain Language", desc: "Simple terms" },
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setAnalysisMode(m.key as AnalyzeRequest["mode"])}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all duration-150",
                          analysisMode === m.key
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30 dark:border-primary-400"
                            : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                        )}
                      >
                        <p className={cn("text-xs font-semibold", analysisMode === m.key ? "text-primary-600 dark:text-primary-400" : "text-surface-700 dark:text-surface-300")}>
                          {m.label}
                        </p>
                        <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                          {m.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

       
              {error && (
                <Alert variant="error" message={error} dismissible onDismiss={() => setError(null)} />
              )}

             
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAnalyze}
                  isLoading={isAnalyzing}
                  disabled={mode === "text" ? !reportText.trim() : !file}
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

       
          {isAnalyzing && <SkeletonAnalysis />}

         
          {result && !isAnalyzing && (
            <div className="space-y-4 animate-fade-in">

             
              {result.phi_detected && <PHIDetectedAlert />}

              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                      Analysis Summary
                    </h2>
                    <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
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

            
                <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-surface-100 dark:border-surface-700">
                  {[
                    { label: "Normal", count: result.findings.filter(f => f.severity === "normal").length, color: "text-success-600 dark:text-success-400" },
                    { label: "Attention", count: result.findings.filter(f => f.severity === "warning").length, color: "text-warning-600 dark:text-warning-400" },
                    { label: "Critical", count: result.findings.filter(f => f.severity === "critical").length, color: "text-danger-600 dark:text-danger-400" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5 text-sm">
                      <span className={cn("font-bold text-lg", s.color)}>{s.count}</span>
                      <span className="text-surface-400">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 px-1">
                  Findings ({result.findings.length})
                </h3>
                {result.findings.map((finding, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-5 rounded-xl border",
                      getSeverityClasses(finding.severity)
                    )}
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
                      <p className="text-xs opacity-60 mt-2">
                        Reference range: {finding.reference_range}
                      </p>
                    )}
                  </div>
                ))}
              </div>

            
              {result.doctor_questions.length > 0 && (
                <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                    💬 Questions to Ask Your Doctor
                  </h3>
                  <ul className="space-y-3">
                    {result.doctor_questions.map((question, index) => (
                      <li key={index} className="flex gap-3 text-surface-600 dark:text-surface-300">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm leading-relaxed">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}