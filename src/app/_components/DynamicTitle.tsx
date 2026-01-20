"use client";

import { useEffect } from "react";

export function DynamicTitle() {
  useEffect(() => {
    async function updateTitle() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.siteName) {
          document.title = `${data.siteName} - Graduation Project Team Matching Platform`;
        }
      } catch {
        // Keep default if fetch fails
      }
    }
    void updateTitle();

    // Listen for settings updates via custom event
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ siteName?: string }>;
      if (customEvent.detail?.siteName) {
        document.title = `${customEvent.detail.siteName} - Graduation Project Team Matching Platform`;
      }
    };

    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "settingsUpdated" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.siteName) {
            document.title = `${data.siteName} - Graduation Project Team Matching Platform`;
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

  return null; // This component doesn't render anything
}
