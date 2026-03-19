"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/app",         label: "Dashboard",    icon: "🏠" },
  { href: "/app/analyze", label: "New Analysis",  icon: "🔬" },
  { href: "/app/chat",    label: "Medical Q&A",   icon: "💬" },
  { href: "/app/history", label: "Report History", icon: "📋" },
];

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        "text-surface-400 hover:text-surface-600 dark:hover:text-surface-300",
        "hover:bg-surface-100 dark:hover:bg-surface-700",
        "transition-colors duration-150"
      )}
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const { user }  = useUser();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">

      {/* SIDEBAR */}
      <aside className={cn(
        "flex flex-col shrink-0 h-full",
        "bg-white dark:bg-surface-900",
        "border-r border-surface-200 dark:border-surface-700",
        "transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}>

        {/* Logo */}
        <div className={cn(
          "flex items-center gap-2 px-4 py-4 border-b border-surface-200 dark:border-surface-700",
          collapsed && "justify-center px-0"
        )}>
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shrink-0">
            🔬
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-surface-900 dark:text-surface-100">
              Med<span className="text-primary-500">Lens</span>
            </span>
          )}
        </div>

        {/* New Analysis button */}
        <div className={cn("p-3", collapsed && "px-2")}>
          <Link href="/app/analyze">
            <button className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl",
              "bg-primary-500 hover:bg-primary-600",
              "text-white font-medium text-sm",
              "transition-colors duration-150",
              collapsed && "justify-center px-0"
            )}>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {!collapsed && "New Analysis"}
            </button>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = link.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer",
                  "text-sm font-medium transition-colors duration-150",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400"
                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100"
                )}>
                  <span className="text-base shrink-0">{link.icon}</span>
                  {!collapsed && link.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-surface-200 dark:border-surface-700 p-3">
          <div className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}>
            <UserButton afterSignOutUrl="/" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate">
                  {user?.firstName ?? "User"}
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className={cn(
          "flex items-center justify-between px-6 py-3 shrink-0",
          "bg-white dark:bg-surface-900",
          "border-b border-surface-200 dark:border-surface-700"
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "text-surface-400 hover:text-surface-600",
                "hover:bg-surface-100 dark:hover:bg-surface-800",
                "transition-colors duration-150"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Welcome back, {user?.firstName ?? "there"} 👋
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950">
          {children}
        </main>
      </div>
    </div>
  );
}