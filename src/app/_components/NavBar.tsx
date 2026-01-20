"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavBar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [siteName, setSiteName] = useState("UniConnect");

  useEffect(() => {
    async function fetchSiteName() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.siteName) {
          setSiteName(data.siteName);
        }
      } catch {
        // Keep default if fetch fails
      }
    }
    void fetchSiteName();

    // Listen for settings updates via custom event
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ siteName?: string }>;
      if (customEvent.detail?.siteName) {
        setSiteName(customEvent.detail.siteName);
      }
    };

    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "settingsUpdated" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.siteName) {
            setSiteName(data.siteName);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdate);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900"
      >
        <span className="relative">
          {siteName}
          <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 transition-all duration-300 group-hover:w-full" />
        </span>
      </Link>

      <div className="flex items-center gap-2 text-xs md:text-sm">
        <Link
          href="/"
          className="rounded-full px-3 py-1 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          Students
        </Link>
        <Link
          href="/students"
          className="rounded-full px-3 py-1 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          My Team
        </Link>

        {isAdmin && (
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-white">
            Admin Panel
          </span>
        )}
      </div>
    </nav>
  );
}
