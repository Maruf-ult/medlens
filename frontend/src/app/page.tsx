import Link from "next/link";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="container-main w-full py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400 border border-primary-200 dark:border-primary-900">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Powered by Groq AI · 26,000+ Medical Cases
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-surface-900 dark:text-white leading-[1.1]">
              Your Medical Reports,{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">Finally Explained</span>
            </h1>

            <p className="text-xl text-surface-500 dark:text-surface-400 leading-relaxed max-w-2xl mx-auto">
              Upload any lab result or clinical note. MedLens uses AI to explain every finding in plain language — so you can have better conversations with your doctor.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/analyze">
                <Button size="lg" className="px-8 py-4 text-base">
                  Analyze a Report →
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="lg" variant="ghost" className="px-8 py-4 text-base text-surface-600 dark:text-surface-400">
                  Ask a Medical Question
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-sm text-surface-400 dark:text-surface-500">
              {[
                "🔒 Private by default",
                "⚡ Results in 2 seconds",
                "🆓 Completely free",
                "🏥 Research grade data",
              ].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary-50 dark:bg-primary-950/30 opacity-60 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary-50 dark:bg-primary-950/30 opacity-40 blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-28 bg-surface-50 dark:bg-surface-950">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-4">
              How It Works
            </p>
            <h2 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
              From report to clarity in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                icon: "📄",
                title: "Upload or Paste",
                desc: "Drop in a PDF, photo, or paste your report text. MedLens accepts any format.",
              },
              {
                step: "2",
                icon: "🤖",
                title: "AI Analyzes",
                desc: "Our AI cross-references 26,000+ real medical cases and identifies every abnormal value.",
              },
              {
                step: "3",
                icon: "💡",
                title: "Get Clarity",
                desc: "Receive a plain-language summary, urgency score, and smart questions for your doctor.",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-8">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 right-0 w-1/2 border-t-2 border-dashed border-surface-200 dark:border-surface-700 translate-x-1/2" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-3xl mb-6 shadow-md">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">
                  Step {item.step}
                </span>
                <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-3">
                  {item.title}
                </h3>
                <p className="text-surface-500 dark:text-surface-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-surface-200 dark:border-surface-800" />

      {/* FEATURES */}
      <section className="py-28 bg-white dark:bg-surface-900">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-4">
              Features
            </p>
            <h2 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
              Everything you need to understand your health
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: "🔬",
                title: "Smart Analysis",
                desc: "Every lab value analyzed and explained. Abnormal results are flagged with clear context.",
              },
              {
                icon: "💬",
                title: "Medical Q&A",
                desc: "Ask anything about your report. Answers sourced from 16,000+ verified medical Q&A pairs.",
              },
              {
                icon: "🔒",
                title: "Privacy First",
                desc: "Personal information is automatically stripped before AI processing using Microsoft Presidio.",
              },
              {
                icon: "📊",
                title: "Urgency Score",
                desc: "A clear 1–10 score tells you how soon you need to follow up with your doctor.",
              },
              {
                icon: "📄",
                title: "Any Format",
                desc: "PDF, image, or plain text. Our OCR engine reads scanned documents too.",
              },
              {
                icon: "🏥",
                title: "Research Grade",
                desc: "Built on MTSamples, MedQuAD, PMC-Patients, and MIMIC-IV — trusted clinical datasets.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  "group p-8 rounded-2xl",
                  "bg-surface-50 dark:bg-surface-800/50",
                  "border border-surface-200 dark:border-surface-700/50",
                  "shadow-sm",
                  "hover:bg-white dark:hover:bg-surface-800",
                  "hover:border-surface-300 dark:hover:border-surface-600",
                  "hover:shadow-lg",
                  "transition-all duration-300"
                )}
              >
                <div className="text-3xl mb-5">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-surface-500 dark:text-surface-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-surface-200 dark:border-surface-800" />

      {/* DATASETS */}
      <section className="py-28 bg-surface-50 dark:bg-surface-950">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-4">
              Data Sources
            </p>
            <h2 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
              Built on trusted medical research
            </h2>
            <p className="mt-4 text-surface-500 dark:text-surface-400">
              Four industry-standard datasets powering every analysis
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { icon: "🏥", name: "MTSamples", records: "4,920", desc: "Clinical transcriptions across 40 specialties" },
              { icon: "💬", name: "MedQuAD", records: "16,401", desc: "Q&A pairs from NIH, CDC, and NLM" },
              { icon: "🔬", name: "PMC-Patients", records: "5,000", desc: "Patient case reports from PubMed" },
              { icon: "🏨", name: "MIMIC-IV", records: "Soon", desc: "ICU clinical data — in progress" },
            ].map((dataset) => (
              <div
                key={dataset.name}
                className={cn(
                  "p-6 rounded-2xl text-center",
                  "bg-white dark:bg-surface-800",
                  "border border-surface-200 dark:border-surface-700",
                  "shadow-sm hover:shadow-md transition-all duration-200"
                )}
              >
                <div className="text-4xl mb-4">{dataset.icon}</div>
                <div className="text-3xl font-bold text-primary-500 mb-1">
                  {dataset.records}
                </div>
                <div className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-2">
                  {dataset.name}
                </div>
                <div className="text-xs text-surface-400 dark:text-surface-500 leading-relaxed">
                  {dataset.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-surface-200 dark:border-surface-800" />

      {/* CTA */}
      <section className="py-28 bg-white dark:bg-surface-900">
        <div className="container-main">
          <div className={cn(
            "max-w-3xl mx-auto text-center",
            "bg-primary-500 dark:bg-primary-600",
            "rounded-3xl p-16 shadow-xl"
          )}>
            <h2 className="text-4xl font-bold text-white mb-5">
              Ready to get started?
            </h2>
            <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Upload your first report and get a clear AI-powered explanation in under 3 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/analyze">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-base font-semibold">
                  Analyze a Report →
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="ghost" className="px-8 py-4 text-base text-white hover:bg-white/10">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}