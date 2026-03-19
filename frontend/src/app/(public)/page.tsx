import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import LandingCharts from "@/components/landing/landingCharts";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 overflow-hidden">
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
              <Link href="/sign-up">
                <Button size="lg" className="px-8 py-4 text-base">
                  Get Started Free &#8594;
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="px-8 py-4 text-base">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-sm text-surface-400 dark:text-surface-500">
              {["🔒 Private by default", "⚡ Results in 2 seconds", "🆓 Completely free", "🏥 Research grade data"].map((item) => (
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

      {/* STATS ROW */}
      <section className="py-10 bg-primary-500 dark:bg-primary-700">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Medical Records",   value: "26,321+", icon: "🗃️" },
              { label: "Q&A Pairs",         value: "16,401",  icon: "💬" },
              { label: "Specialties",       value: "40+",     icon: "🏥" },
              { label: "Avg Analysis Time", value: "2s",      icon: "⚡" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-4">
                <div className="text-3xl mb-1">{stat.icon}</div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-primary-100 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES SECTION - Updated ID */}
      <section id="capabilities" className="py-24 bg-surface-50 dark:bg-surface-950 scroll-mt-16">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-4">Capabilities</p>
            <h2 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
              Everything you need to understand your health
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: "🔬", title: "Smart Analysis",  desc: "Every lab value analyzed and explained with clear context." },
              { icon: "💬", title: "Medical Q&A",     desc: "Ask anything about your report — 16,000+ verified Q&A pairs." },
              { icon: "🔒", title: "Privacy First",   desc: "PHI automatically removed before any AI processing." },
              { icon: "📊", title: "Visual Charts",   desc: "Urgency score, findings breakdown, severity charts." },
              { icon: "📄", title: "Any Format",      desc: "PDF, image, or plain text — OCR reads everything." },
              { icon: "💾", title: "Auto Saved",      desc: "All your analyses saved forever when signed in." },
            ].map((f) => (
              <div key={f.title} className={cn(
                "p-6 rounded-2xl border shadow-sm",
                "bg-white dark:bg-surface-800",
                "border-surface-200 dark:border-surface-700",
                "hover:shadow-md transition-all duration-200"
              )}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">{f.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLINICAL ENGINE SECTION - Wrapped charts for navigation */}
      <section id="clinical-engine" className="scroll-mt-16">
        <LandingCharts />
      </section>

      {/* METHODOLOGY SECTION - Updated ID */}
      <section id="methodology" className="py-24 bg-surface-50 dark:bg-surface-950 scroll-mt-16">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-4">Methodology</p>
            <h2 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
              From report to clarity in three steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", icon: "📄", title: "Upload or Paste", desc: "Drop in a PDF, photo, or paste your report text." },
              { step: "2", icon: "🤖", title: "AI Analyzes",     desc: "AI cross-references 26,000+ real medical cases." },
              { step: "3", icon: "💡", title: "Get Clarity",     desc: "Plain-language summary, urgency score, and doctor questions." },
            ].map((item, index) => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-8">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 right-0 w-1/2 border-t-2 border-dashed border-surface-200 dark:border-surface-700 translate-x-1/2" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-3xl mb-6 shadow-md">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">Step {item.step}</span>
                <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-3">{item.title}</h3>
                <p className="text-surface-500 dark:text-surface-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white dark:bg-surface-900">
        <div className="container-main">
          <div className={cn(
            "max-w-2xl mx-auto text-center",
            "bg-primary-500 rounded-3xl p-16 shadow-xl"
          )}>
            <h2 className="text-4xl font-bold text-white mb-5">Ready to get started?</h2>
            <p className="text-primary-100 text-lg mb-8 leading-relaxed">
              Create your free account and analyze your first report in under 3 seconds.
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-base font-semibold">
                Create Free Account &#8594;
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}