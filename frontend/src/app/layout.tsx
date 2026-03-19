import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "MedLens — AI Medical Report Analyzer", template: "%s | MedLens" },
  description: "Understand your medical reports with AI. MedLens analyzes lab results and clinical notes using advanced AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      appearance={{ variables: { colorPrimary: "#3b82f6" } }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `}} />
        </head>
        <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased bg-surface-50 dark:bg-surface-950`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}