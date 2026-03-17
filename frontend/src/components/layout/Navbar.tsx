"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Button from "../ui/Button"

const navLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/analyze", label: "Analyze", icon: "🔬" },
  { href: "/chat", label: "Q&A Chat", icon: "💬" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
];


function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved === "dark" || (!saved && prefersDark);

    const timer = setTimeout(() => {
      setIsDark(shouldBeDark);
      setMounted(true);
      
      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
        "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200",
        "hover:bg-surface-100 dark:hover:bg-surface-800",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      )}
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-50",
          "bg-white dark:bg-surface-900",
          "border-b border-surface-200 dark:border-surface-700",
          "shadow-lg animate-slide-up px-4 py-4"
        )}
      >
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                    : "text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
                )}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Link href="/analyze" onClick={onClose}>
            <Button fullWidth size="lg">🔬 Analyze Report</Button>
          </Link>
        </div>
      </div>
    </>
  );
}


export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-30 h-16 transition-shadow duration-200",
          "bg-white/90 dark:bg-surface-900/90 backdrop-blur-md",
          "border-b border-surface-200 dark:border-surface-700",
          scrolled && "shadow-sm"
        )}
      >
        <div className="container-main h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary-500 dark:bg-primary-600 flex items-center justify-center text-white text-sm group-hover:scale-105 transition-transform duration-200">
              🔬
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-surface-900 dark:text-surface-100">Med</span>
              <span className="text-lg font-bold text-primary-500">Lens</span>
            </div>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
              Beta
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                      : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:block">
              <Link href="/analyze">
                <Button size="sm">Analyze Report</Button>
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors duration-150"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
      />

 
      <div className="h-16" />
    </>
  );
}