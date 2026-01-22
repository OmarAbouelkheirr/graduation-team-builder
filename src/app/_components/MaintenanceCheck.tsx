"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  
  // Skip maintenance check for admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminPage) {
      setLoading(false);
      return;
    }

    async function checkMaintenance() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setMaintenanceMode(data.maintenanceMode || false);
        setMaintenanceMessage(data.maintenanceMessage || "We're currently performing maintenance. Please check back soon.");
      } catch {
        setMaintenanceMode(false);
        setMaintenanceMessage("We're currently performing maintenance. Please check back soon.");
      } finally {
        setLoading(false);
      }
    }
    void checkMaintenance();
  }, [isAdminPage]);

  if (isAdminPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-lochinara-600 border-t-transparent mx-auto" />
          <p className="text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (maintenanceMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lochinara-50 to-lochinara-100 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-lochinara-100 p-4">
              <svg
                className="h-12 w-12 text-lochinara-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900">
            Under Maintenance
          </h1>
          <p className="mb-6 text-zinc-600">
            {maintenanceMessage}
          </p>
          <a
            href="https://t.me/Dev3mora"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0088cc] px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#0077b5] hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
            </svg>
            Contact Admin via Telegram
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
