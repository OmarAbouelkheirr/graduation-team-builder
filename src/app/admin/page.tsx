"use client";

import { useEffect, useState } from "react";

type StudentStatus = "pending" | "approved" | "rejected" | "hidden";

interface AdminStudent {
  _id: string;
  fullName: string;
  email: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  telegram?: string;
  track: string;
  skills: string[];
  bio: string;
  preferences?: string;
  status: StudentStatus;
  createdAt?: Date | string;
}

interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  siteName: string;
  siteDescription: string;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [allStudents, setAllStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "">("");
  const [trackFilter, setTrackFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState<"dashboard" | "applications" | "settings">(
    "applications"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
    siteName: "UniConnect",
    siteDescription: "Graduation Project Team Matching Platform",
  });
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
    siteName: "UniConnect",
    siteDescription: "Graduation Project Team Matching Platform",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Validate admin key on mount if exists
  useEffect(() => {
    const storedKey = localStorage.getItem("adminKey");
    if (storedKey) {
      void validateAdminKey(storedKey);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized && adminKey) {
      if (activeNav === "applications") {
        void fetchStudents();
      } else if (activeNav === "settings") {
        void fetchSettings();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized, adminKey, statusFilter, activeNav]);

  async function validateAdminKey(key: string): Promise<boolean> {
    setIsValidating(true);
    setLoginError(null);
    try {
      // Try to fetch settings as a way to validate the key
      const res = await fetch("/api/admin/settings", {
        headers: {
          "x-admin-key": key,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error || "Invalid admin key");
        setIsAuthorized(false);
        setAdminKey("");
        localStorage.removeItem("adminKey");
        return false;
      }

      setIsAuthorized(true);
      setAdminKey(key);
      localStorage.setItem("adminKey", key);
      return true;
    } catch {
      setLoginError("Unable to connect to server");
      setIsAuthorized(false);
      setAdminKey("");
      localStorage.removeItem("adminKey");
      return false;
    } finally {
      setIsValidating(false);
    }
  }

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/students?${params.toString()}`, {
        headers: {
          "x-admin-key": adminKey,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        if ((data as { error?: string }).error?.includes("Unauthorized") || res.status === 401) {
          setIsAuthorized(false);
          setAdminKey("");
          localStorage.removeItem("adminKey");
        }
        setError((data as { error?: string }).error || "Failed to load student data.");
      } else {
        const studentsData = data as AdminStudent[];
        const mapped = studentsData.map((s) => ({
          ...s,
          _id: s._id.toString(),
        }));
        setAllStudents(mapped);
        setStudents(mapped);
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSettings() {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        headers: {
          "x-admin-key": adminKey,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        setSettingsForm(data);
        setSettingsChanged(false);
      }
    } catch {
      setError("Failed to load settings.");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function saveSettings() {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        setSettingsChanged(false);
        setError(null);
        // Dispatch custom event to update site name in NavBar and Footer
        if (typeof window !== "undefined") {
          const event = new CustomEvent("settingsUpdated", { 
            detail: { 
              siteName: data.siteName,
              siteDescription: data.siteDescription 
            } 
          });
          window.dispatchEvent(event);
          // Also trigger a storage event for cross-tab communication
          const storageData = { 
            siteName: data.siteName,
            timestamp: Date.now() 
          };
          localStorage.setItem("settingsUpdated", JSON.stringify(storageData));
          // Remove it immediately to trigger storage event
          localStorage.removeItem("settingsUpdated");
          localStorage.setItem("settingsUpdated", JSON.stringify(storageData));
        }
      } else {
        setError(data.error || "Failed to save settings.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function updateSettings(newSettings: Partial<SiteSettings>) {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        setError(null);
      } else {
        setError(data.error || "Failed to update settings.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setSettingsLoading(false);
    }
  }

  useEffect(() => {
    let filtered = allStudents;

    // Apply track filter
    if (trackFilter) {
      filtered = filtered.filter((s) => s.track === trackFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.track.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setStudents(filtered);
  }, [searchQuery, trackFilter, statusFilter, allStudents]);

  async function updateStatus(id: string, status: StudentStatus) {
    setError(null);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update student status.");
        return;
      }
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...(s as AdminStudent), status } : s))
      );
      setAllStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...(s as AdminStudent), status } : s))
      );
    } catch {
      setError("Unable to connect to server.");
    }
  }

  async function updateStudent(id: string, updates: Partial<AdminStudent>) {
    setError(null);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update student.");
        return false;
      }
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...(s as AdminStudent), ...updates } : s))
      );
      setAllStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...(s as AdminStudent), ...updates } : s))
      );
      return true;
    } catch {
      setError("Unable to connect to server.");
      return false;
    }
  }

  async function deleteStudent(id: string) {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }

    setError(null);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": adminKey,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete student.");
        return;
      }
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setAllStudents((prev) => prev.filter((s) => s._id !== id));
    } catch {
      setError("Unable to connect to server.");
    }
  }

  const TRACKS = [
    "Web Development - Frontend",
    "Web Development - Backend",
    "Web Development - Full Stack",
    "Mobile Development",
    "AI & Data",
    "Cybersecurity",
    "UX/UI Design",
  ];

  const totalApplications = allStudents.length;
  const pendingCount = allStudents.filter((s) => s.status === "pending").length;
  const approvedCount = allStudents.filter(
    (s) => s.status === "approved"
  ).length;
  const rejectedCount = allStudents.filter((s) => s.status === "rejected").length;
  const hiddenCount = allStudents.filter((s) => s.status === "hidden").length;

  // Statistics by track
  const trackStats = TRACKS.map((track) => ({
    track,
    total: allStudents.filter((s) => s.track === track).length,
    pending: allStudents.filter((s) => s.track === track && s.status === "pending").length,
    approved: allStudents.filter((s) => s.track === track && s.status === "approved").length,
    rejected: allStudents.filter((s) => s.track === track && s.status === "rejected").length,
    hidden: allStudents.filter((s) => s.track === track && s.status === "hidden").length,
  }));

  // Export function
  function exportToCSV() {
    const headers = [
      "Full Name",
      "Email",
      "LinkedIn",
      "GitHub",
      "Portfolio",
      "Telegram",
      "Track",
      "Skills",
      "Bio",
      "Status",
      "Created At",
    ];

    const rows = students.map((s) => [
      s.fullName,
      s.email,
      s.linkedIn || "",
      s.github || "",
      s.portfolio || "",
      s.telegram || "",
      s.track,
      s.skills.join("; "),
      s.bio.replace(/,/g, ";"),
      s.status,
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `students_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lochinara-50 to-lochinara-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200">
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-lochinara-500 to-lochinara-600">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Admin Access</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Enter your admin secret key to continue
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Admin Secret Key
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Enter admin key"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isValidating) {
                    void validateAdminKey(keyInput);
                  }
                }}
                disabled={isValidating}
              />
            </div>
            {loginError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {loginError}
              </div>
            )}
            <button
              onClick={() => void validateAdminKey(keyInput)}
              disabled={isValidating || !keyInput.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Validating...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-zinc-50 via-white to-zinc-50 font-sans text-zinc-900">
      {/* Sidebar - Fixed on left, hidden on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-gradient-to-b from-zinc-900 to-zinc-800 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lochinara-500 to-lochinara-600 text-xl font-bold shadow-lg">
                U
              </div>
              <div>
                <div className="font-bold text-base">Admin Panel</div>
                <div className="text-xs text-zinc-400">University Portal</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => {
                setActiveNav("dashboard");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                activeNav === "dashboard"
                  ? "bg-gradient-to-r from-lochinara-500 to-lochinara-600 text-white shadow-lg"
                  : "text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveNav("applications");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                activeNav === "applications"
                  ? "bg-gradient-to-r from-lochinara-500 to-lochinara-600 text-white shadow-lg"
                  : "text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Applications
            </button>
            <button
              onClick={() => {
                setActiveNav("settings");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                activeNav === "settings"
                  ? "bg-gradient-to-r from-lochinara-500 to-lochinara-600 text-white shadow-lg"
                  : "text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </nav>
          <button
            onClick={() => {
              setAdminKey("");
              setKeyInput("");
              setIsAuthorized(false);
              setStudents([]);
              setAllStudents([]);
              localStorage.removeItem("adminKey");
            }}
            className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-700/50 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="p-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="mb-4 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 p-2.5 text-white shadow-lg lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

          {/* Dashboard View */}
          {activeNav === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
                <p className="mt-2 text-sm text-zinc-600">
                  Overview of all student applications and system status
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-gradient-to-br from-lochinara-500 to-lochinara-600 p-6 text-white shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase opacity-90">Total</span>
                    <div className="rounded-lg bg-white/20 p-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{totalApplications}</div>
                  <div className="mt-2 text-xs opacity-90">Applications</div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase opacity-90">Pending</span>
                    <div className="rounded-lg bg-white/20 p-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{pendingCount}</div>
                  <div className="mt-2 text-xs opacity-90">Needs Review</div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase opacity-90">Approved</span>
                    <div className="rounded-lg bg-white/20 p-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{approvedCount}</div>
                  <div className="mt-2 text-xs opacity-90">Active Students</div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-zinc-500 to-zinc-600 p-6 text-white shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase opacity-90">Hidden</span>
                    <div className="rounded-lg bg-white/20 p-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0L9 10.172m-2.41-2.41L3 3m6.59 3.59L9.172 9m-2.41-2.41L3 3m6.59 3.59l4.242 4.242M21 21l-3.59-3.59m0 0L15 13.828m2.41 2.41L21 21m-6.59-3.59L12.828 12m2.41 2.41L21 21" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{hiddenCount}</div>
                  <div className="mt-2 text-xs opacity-90">Hidden</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/70">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-900">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveNav("applications")}
                      className="w-full rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-4 py-3 text-sm font-medium text-white transition-all hover:brightness-110"
                    >
                      View All Applications
                    </button>
                    <button
                      onClick={() => setActiveNav("settings")}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
                    >
                      Site Settings
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/70">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-900">Status Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Pending</span>
                      <span className="font-semibold text-orange-600">{pendingCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Approved</span>
                      <span className="font-semibold text-emerald-600">{approvedCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Rejected</span>
                      <span className="font-semibold text-red-600">{rejectedCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Hidden</span>
                      <span className="font-semibold text-zinc-600">{hiddenCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Statistics */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/70">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900">Statistics by Academic Focus</h3>
                <div className="space-y-4">
                  {trackStats.map((stat) => (
                    <div key={stat.track} className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-zinc-900">{stat.track}</h4>
                        <span className="text-sm font-semibold text-zinc-700">{stat.total} Total</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          <span className="text-zinc-600">Pending: {stat.pending}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-zinc-600">Approved: {stat.approved}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span className="text-zinc-600">Rejected: {stat.rejected}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-zinc-500" />
                          <span className="text-zinc-600">Hidden: {stat.hidden}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Applications View */}
          {activeNav === "applications" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">Application Management</h1>
                <p className="mt-2 text-sm text-zinc-600">
                  Manage student graduation project applications. Review submissions, approve teams, and organize project tracks.
                </p>
              </div>

            {/* Summary Cards - Unified with Dashboard style */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-lochinara-500 to-lochinara-600 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase opacity-90">Total</span>
                  <div className="rounded-lg bg-white/20 p-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold">{totalApplications}</div>
                <div className="mt-2 text-xs opacity-90">Applications</div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase opacity-90">Pending</span>
                  <div className="rounded-lg bg-white/20 p-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold">{pendingCount}</div>
                <div className="mt-2 text-xs opacity-90">Needs Review</div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase opacity-90">Approved</span>
                  <div className="rounded-lg bg-white/20 p-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold">{approvedCount}</div>
                <div className="mt-2 text-xs opacity-90">Active Students</div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-zinc-500 to-zinc-600 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase opacity-90">Hidden</span>
                  <div className="rounded-lg bg-white/20 p-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0L9 10.172m-2.41-2.41L3 3m6.59 3.59L9.172 9m-2.41-2.41L3 3m6.59 3.59l4.242 4.242M21 21l-3.59-3.59m0 0L15 13.828m2.41 2.41L21 21m-6.59-3.59L12.828 12m2.41 2.41L21 21" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold">{hiddenCount}</div>
                <div className="mt-2 text-xs opacity-90">Hidden</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <svg
                  className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                >
                  <option value="">All Tracks</option>
                  {TRACKS.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StudentStatus | "")
                  }
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="hidden">Hidden</option>
                </select>
                <button
                  onClick={exportToCSV}
                  disabled={students.length === 0}
                  className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span className="hidden sm:inline">Export CSV ({students.length})</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/70">
              {loading && (
                <div className="p-8 text-center text-sm text-zinc-600">
                  Loading student data...
                </div>
              )}
              {!loading && students.length === 0 && (
                <div className="p-8 text-center text-sm text-zinc-600">
                  No applications yet or the current filter doesn't match any student.
                </div>
              )}
              {!loading && students.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-zinc-200 bg-zinc-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600">
                            STUDENT NAME
                          </th>
                          <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 sm:table-cell">
                            TRACK
                          </th>
                          <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 md:table-cell">
                            DATE
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600">
                            STATUS
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr
                            key={s._id}
                            className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-zinc-900">
                                {s.fullName}
                              </div>
                              <div className="text-xs text-zinc-500">{s.email}</div>
                              <div className="mt-1 text-xs text-zinc-600 sm:hidden">
                                {s.track}
                              </div>
                            </td>
                            <td className="hidden px-4 py-3 sm:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-lochinara-500" />
                                <span className="text-sm text-zinc-700">{s.track}</span>
                              </div>
                            </td>
                            <td className="hidden px-4 py-3 text-sm text-zinc-600 md:table-cell">
                              {new Date().toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                  s.status === "approved"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : s.status === "pending"
                                    ? "bg-orange-100 text-orange-800"
                                    : s.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-zinc-100 text-zinc-800"
                                }`}
                              >
                                {s.status === "approved"
                                  ? "Approved"
                                  : s.status === "pending"
                                  ? "Pending"
                                  : s.status === "rejected"
                                  ? "Rejected"
                                  : "Hidden"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                <button
                                  onClick={() => updateStatus(s._id, "approved")}
                                  className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] text-white transition-all hover:bg-emerald-700 sm:text-xs"
                                  title="Approve"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => updateStatus(s._id, "rejected")}
                                  className="rounded-lg bg-red-600 px-2 py-1 text-[10px] text-white transition-all hover:bg-red-700 sm:text-xs"
                                  title="Reject"
                                >
                                  ✗
                                </button>
                                <button
                                  onClick={() => updateStatus(s._id, "hidden")}
                                  className="rounded-lg bg-zinc-500 px-2 py-1 text-[10px] text-white transition-all hover:bg-zinc-600 sm:text-xs"
                                  title="Hide"
                                >
                                  ⊖
                                </button>
                                <button
                                  onClick={() => setEditingStudent(s)}
                                  className="rounded-lg bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-2 py-1 text-[10px] text-white transition-all hover:brightness-110 sm:text-xs"
                                  title="Edit"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => deleteStudent(s._id)}
                                  className="rounded-lg bg-red-700 px-2 py-1 text-[10px] text-white transition-all hover:bg-red-800 sm:text-xs"
                                  title="Delete"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 sm:flex-row">
                    <span className="text-sm text-zinc-600">
                      Showing 1 to {students.length} of {students.length} results
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-400 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button className="rounded-lg bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-3 py-1.5 text-sm font-medium text-white">
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

          {/* Settings View */}
          {activeNav === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900">Site Settings</h1>
                  <p className="mt-2 text-sm text-zinc-600">
                    Control site-wide settings and maintenance mode
                  </p>
                </div>
                {settingsChanged && (
                  <button
                    onClick={saveSettings}
                    disabled={settingsLoading}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {settingsLoading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>

            {/* Maintenance Mode */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/70">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Maintenance Mode</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Temporarily disable public access to the site
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settingsForm.maintenanceMode}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, maintenanceMode: e.target.checked }));
                      setSettingsChanged(true);
                    }}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-zinc-300 transition-colors peer-checked:bg-lochinara-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lochinara-300/50"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
              {settingsForm.maintenanceMode && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Maintenance Message
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                    rows={3}
                    value={settingsForm.maintenanceMessage || ""}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, maintenanceMessage: e.target.value }));
                      setSettingsChanged(true);
                    }}
                    placeholder="Enter maintenance message..."
                  />
                </div>
              )}
            </div>

            {/* Site Information */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/70">
              <h3 className="mb-4 text-lg font-semibold text-zinc-900">Site Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                    value={settingsForm.siteName}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, siteName: e.target.value }));
                      setSettingsChanged(true);
                    }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Site Description
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                    rows={3}
                    value={settingsForm.siteDescription}
                    onChange={(e) => {
                      setSettingsForm((prev) => ({ ...prev, siteDescription: e.target.value }));
                      setSettingsChanged(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-4 sm:p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between sticky top-0 bg-white pb-4 border-b border-zinc-200">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Edit Student</h2>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <EditStudentForm
                student={editingStudent}
                onSave={async (updates) => {
                  const success = await updateStudent(editingStudent._id, updates);
                  if (success) {
                    setEditingStudent(null);
                  }
                }}
                onCancel={() => setEditingStudent(null)}
              />
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

function EditStudentForm({
  student,
  onSave,
  onCancel,
}: {
  student: AdminStudent;
  onSave: (updates: Partial<AdminStudent>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    fullName: student.fullName,
    email: student.email,
    linkedIn: student.linkedIn || "",
    github: student.github || "",
    portfolio: student.portfolio || "",
    telegram: student.telegram || "",
    track: student.track,
    skills: student.skills.join(", "),
    bio: student.bio,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      fullName: form.fullName,
      email: form.email,
      linkedIn: form.linkedIn || undefined,
      github: form.github || undefined,
      portfolio: form.portfolio || undefined,
      telegram: form.telegram || undefined,
      track: form.track,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      bio: form.bio,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Full Name
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            LinkedIn
          </label>
          <input
            type="url"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
            value={form.linkedIn}
            onChange={(e) => setForm((f) => ({ ...f, linkedIn: e.target.value }))}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            GitHub
          </label>
          <input
            type="url"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
            value={form.github}
            onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Portfolio
          </label>
          <input
            type="url"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
            value={form.portfolio}
            onChange={(e) => setForm((f) => ({ ...f, portfolio: e.target.value }))}
            placeholder="https://yourportfolio.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Telegram Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
            value={form.telegram}
            onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
            placeholder="@username"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Academic Focus (Track)
        </label>
        <input
          type="text"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
          value={form.track}
          onChange={(e) => setForm((f) => ({ ...f, track: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
          value={form.skills}
          onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
          placeholder="React, Python, Node.js"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Bio
        </label>
        <textarea
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20 resize-y"
          rows={4}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white pb-2 border-t border-zinc-200 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
