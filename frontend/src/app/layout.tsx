import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// We map these variables to match the names in your globals.css @theme block
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // matches --font-sans in your CSS
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono", // matches --font-mono in your CSS
});

export const metadata: Metadata = {
  title: {
    default: "MedLens - AI Medical Report Analyzer",
    template: "%s | MedLens",
  },
  description:
    "Understand your medical reports with AI. MedLens analyzes lab results, clinical notes, and medical documents using advanced AI trained on 26,000+ real medical cases",
  keywords: [
    "medical report analyzer",
    "AI health",
    "lab results",
    "medical AI",
    "health literacy",
  ],
  authors: [{ name: "MedLens Research" }],
  openGraph: {
    title: "MedLens - AI Medical Report Analyzer",
    description: "Understand your medical reports with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrains.variable} font-sans min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 antialiased`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}