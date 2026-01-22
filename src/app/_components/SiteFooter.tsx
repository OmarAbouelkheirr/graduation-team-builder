"use client";

import { useEffect, useState } from "react";

export function SiteFooter() {
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
    <footer className="border-t border-zinc-200 bg-white/80">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-zinc-500 sm:flex-row">
        <span>© 2026 {siteName} University Platform. All rights reserved.</span>
        <div className="flex items-center gap-1">
          <span>Made by</span>
          <a
            href="https://www.linkedin.com/in/omar-abouelkhier-eg/"
            target="_blank"
            rel="noopener noreferrer"
                    className="font-medium text-lochinara-600 transition-colors hover:text-lochinara-700 hover:underline"
          >
            Omar Abouelkhier
          </a>
          <span>and</span>
          <a
            href="https://www.linkedin.com/in/nour-eldeen-eg/"
            target="_blank"
            rel="noopener noreferrer"
                    className="font-medium text-lochinara-600 transition-colors hover:text-lochinara-700 hover:underline"
          >
            Nour Eldeen Mahmoud
          </a>
        </div>
      </div>
    </footer>
  );
}
