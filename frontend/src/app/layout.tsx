import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalFooter from "@/components/layout/ConditionalFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MedLens - AI Medical Report Analyzer",
  description: "Understand your medical reports with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        variables: {
          colorPrimary: "#6c47ff", // Branding purple
        },
        elements: {
          buttonPrimary: "bg-[#6c47ff] hover:bg-[#5b3ce0]",
        }
      }}
    >
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
        <body className={`${inter.variable} ${jetbrains.variable} font-sans min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 antialiased`}>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <ConditionalFooter/>
        </body>
      </html>
    </ClerkProvider>
  );
}