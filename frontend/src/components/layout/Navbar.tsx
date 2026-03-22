"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useUser, SignUpButton, SignInButton, UserButton } from "@clerk/nextjs";

const landingLinks = [
  { href: "/",             label: "Home"            },
  { href: "#capabilities", label: "Capabilities"    },
  { href: "#clinical-engine",     label: "Clinical Engine" },
  { href: "#methodology",  label: "Methodology"     },
  { href: "/dashboard",    label: "Dashboard"       },
];

const defaultLinks = [
  { href: "/",          label: "Home"      },
  { href: "/dashboard", label: "Dashboard" },
];

function ThemeToggle() {
  const [isDark, setIsDark]   = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved       = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved === "dark" || (!saved && prefersDark);
    setTimeout(() => {
      setIsDark(shouldBeDark);
      setMounted(true);
      document.documentElement.classList.toggle("dark", shouldBeDark);
    }, 0);
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
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
        "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200",
        "hover:bg-surface-100 dark:hover:bg-surface-800"
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

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname                 = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [activeHash, setActiveHash]         = useState("");

  const isLanding = pathname === "/";
  const navLinks  = isLanding ? landingLinks : defaultLinks;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleHash = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", handleHash);
    setActiveHash(window.location.hash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith("#")) return activeHash === href;
    if (href === "/") return pathname === "/" && !activeHash;
    return pathname === href;
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-30 h-16 transition-all duration-200",
        "bg-white/90 dark:bg-surface-900/90 backdrop-blur-md",
        "border-b border-surface-200 dark:border-surface-700",
        scrolled && "shadow-sm"
      )}>
        <div className="w-full px-4 sm:px-8 lg:px-20 h-full grid grid-cols-3 items-center">

          {/* LEFT — Logo */}
          <div className="flex items-center ">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                🔬
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-surface-900 dark:text-white">Med</span>
                <span className="text-lg font-bold text-primary-500">Lens</span>
              </div>
            </Link>
          </div>

          {/* CENTER — Nav links */}
          <nav className="hidden lg:flex items-center justify-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => link.href.startsWith("#") && setActiveHash(link.href)}
                className={cn(
                  "relative py-1 text-sm font-medium whitespace-nowrap",
                  "transition-colors duration-150 group",
                  isActive(link.href)
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-0.5 left-0 h-0.5 bg-primary-500 rounded-full",
                  "transition-all duration-200",
                  isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>

          {/* RIGHT — Theme + Auth */}
          <div className="flex items-center justify-end gap-2 ">
            <ThemeToggle />

            {isLoaded && (
              <div className="hidden sm:flex items-center gap-2">
                {isSignedIn ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/app"
                      className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 transition-colors px-3 py-2"
                    >
                      Dashboard
                    </Link>
                    <UserButton />
                  </div>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <button className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 px-3 py-2 cursor-pointer transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold text-sm h-9 px-5 cursor-pointer active:scale-95 transition-all">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "lg:hidden w-9 h-9 rounded-lg flex items-center justify-center",
                "text-surface-500 hover:text-surface-700",
                "hover:bg-surface-100 dark:hover:bg-surface-800",
                "transition-colors duration-150"
              )}
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className={cn(
              "fixed top-16 left-0 right-0 z-50",
              "bg-white dark:bg-surface-900",
              "border-b border-surface-200 dark:border-surface-700",
              "shadow-lg px-4 py-4"
            )}>
              <nav className="flex flex-col gap-1 mb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (link.href.startsWith("#")) setActiveHash(link.href);
                    }}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "text-primary-600 dark:text-primary-400 border-l-2 border-primary-500"
                        : "text-surface-600 dark:text-surface-400 hover:text-primary-500"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {isLoaded && !isSignedIn && (
                <div className="flex flex-col gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <SignInButton mode="modal">
                    <button className="w-full py-2.5 rounded-xl text-sm font-medium border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full py-2.5 rounded-xl text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white transition-colors">
                      Sign Up Free
                    </button>
                  </SignUpButton>
                </div>
              )}

              {isLoaded && isSignedIn && (
                <div className="flex items-center gap-3 px-4 py-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <UserButton />
                  <Link href="/app" className="text-sm text-surface-600 dark:text-surface-400">
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </header>
      <div className="h-16" />
    </>
  );
}