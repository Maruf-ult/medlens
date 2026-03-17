import Link from "next/link";


const footerSections = [
  {
    title: "Features",
    links: [
      { label: "Analyze Report", href: "/analyze", external: false },
      { label: "Q&A Chat", href: "/chat", external: false },
      { label: "Dashboard", href: "/dashboard", external: false },
    ],
  },
  {
    title: "Datasets",
    links: [
      { label: "MTSamples", href: "https://www.kaggle.com/datasets/tboyle10/medicaltranscriptions", external: true },
      { label: "MedQuAD", href: "https://github.com/abachaa/MedQuAD", external: true },
      { label: "PMC-Patients", href: "https://huggingface.co/datasets/zhengyun21/PMC-Patients", external: true },
      { label: "MIMIC-IV", href: "https://physionet.org/content/mimiciv/", external: true },
    ],
  },
  {
    title: "Research",
    links: [
      { label: "About MedLens", href: "/about", external: false },
      { label: "How It Works", href: "/about#how-it-works", external: false },
      { label: "API Docs", href: "http://localhost:8000/docs", external: true },
    ],
  },
];

function ExternalIcon() {
  return (
    <svg
      className="w-3 h-3 inline-block ml-1 opacity-40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-20 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950">
      <div className="container-main pt-16 pb-12">
        {/* Increased gap and improved column width */}
        <div className="grid grid-cols-2 gap-y-12 gap-x-8 md:grid-cols-3 lg:grid-cols-5 mt-10">
          
          {/* Brand Column - takes 2 slots on desktop for better spacing */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <Link href="/" className="inline-flex items-center gap-2 group mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center text-white text-lg">
                🔬
              </div>
              <span className="text-xl font-bold text-surface-900 dark:text-surface-100">
                Med<span className="text-primary-500">Lens</span>
              </span>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed max-w-xs mb-6">
              AI-powered medical report analyzer. Understand your health data with confidence and privacy.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded text-[11px] font-medium text-surface-600 dark:text-surface-400">
                <strong>26K+</strong> Records
              </span>
              <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded text-[11px] font-medium text-surface-600 dark:text-surface-400">
                <strong>4</strong> Datasets
              </span>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="text-xs uppercase tracking-widest font-bold text-surface-400 dark:text-surface-500 mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-500 transition-colors flex items-center"
                      >
                        {link.label} <ExternalIcon />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-500 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Legal/Copyright Section */}
      <div className="border-t border-surface-100 dark:border-surface-900 bg-surface-50/50 dark:bg-surface-900/50">
        <div className="container-main py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] text-surface-400 dark:text-surface-500 leading-loose">
              <span className="font-bold text-surface-600 dark:text-surface-300 mr-1">
                ⚕️ MEDICAL DISCLAIMER:
              </span>
              MedLens is an AI research tool for educational purposes only. It does not provide medical advice, 
              diagnosis, or treatment. Always consult a healthcare professional for medical decisions.
            </p>
            <div className="mt-4 pt-4 border-t border-surface-200/50 dark:border-surface-800/50 text-xs text-surface-400">
              © {currentYear} MedLens. Built for research purposes.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}