"use client";

import { useEffect, useState } from "react";
import { SkeletonCard } from "../_components/Skeleton";

interface PublicStudent {
  id: string;
  fullName: string;
  track: string;
  skills: string[];
  bio: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  telegram?: string;
  avatar?: string;
  featured?: boolean;
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

// Function to generate avatar URL using DiceBear API
// Uses lorelei style for programmer avatars
function getAvatarUrl(seed: string): string {
  const encodedSeed = encodeURIComponent(seed);
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodedSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,3b82f6,2563eb`;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<PublicStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<PublicStudent | null>(null);
  const [featuredLabel, setFeaturedLabel] = useState<string>("مبرمج المنصة");

  // initial load
  useEffect(() => {
    void fetchStudents();
    void fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (res.ok && data.featuredLabel) {
        setFeaturedLabel(data.featuredLabel);
      }
    } catch {
      // Use default
    }
  }

  // live search + track filter (debounced)
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  useEffect(() => {
    void fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrack, debouncedQuery]);

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedTrack) params.set("track", selectedTrack);
      if (debouncedQuery) {
        params.set("q", debouncedQuery);
      }

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load students.");
      } else {
        setStudents(data);
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSelectedTrack("");
    setSearchQuery("");
  }

  const hasFilters = Boolean(selectedTrack || searchQuery);

  return (
    <div className="font-sans text-zinc-900 animate-in fade-in">
      <div className="mb-6 space-y-2 animate-in slide-in-from-top">
        <h1 className="text-3xl font-bold text-zinc-900">Find Students</h1>
        <p className="text-sm text-zinc-600">
          Find potential teammates for your graduation project based on academic focus and search.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-5 space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70">
        {/* Search + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                placeholder="Search by name, skill, or keyword..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void fetchStudents();
                  }
                }}
              />
            </div>
          <div className="flex gap-2">
            <button
              onClick={() => void fetchStudents()}
              className="rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
            >
              Apply
            </button>
            {hasFilters && (
              <button
                onClick={() => {
                  clearFilters();
                  setStudents([]);
                  void fetchStudents();
                }}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Academic Focus chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">Track:</span>
            {hasFilters && (
              <button
                onClick={() => {
                  clearFilters();
                  setStudents([]);
                  void fetchStudents();
                }}
                className="text-xs text-lochinara-600 hover:text-lochinara-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent scroll-smooth touch-pan-x [-ms-overflow-style:auto] [scrollbar-width:thin]">
              <button
                type="button"
                onClick={() => setSelectedTrack("")}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  !selectedTrack
                    ? "bg-gradient-to-r from-lochinara-500 to-lochinara-600 text-white shadow-md"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 active:bg-zinc-300"
                }`}
              >
                All
              </button>
              {TRACKS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTrack(t)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    selectedTrack === t
                      ? "bg-gradient-to-r from-lochinara-500 to-lochinara-600 text-white shadow-md"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 active:bg-zinc-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && students.length === 0 && (
        <div className="rounded-xl bg-white p-8 text-center text-zinc-600 shadow-sm ring-1 ring-zinc-200/70">
          No approved students found. Try changing your filters.
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((s, index) => (
              <article
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`group relative cursor-pointer rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 sm:p-5 animate-in fade-in slide-in-from-bottom-4 ${
                  s.featured
                    ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 to-white"
                    : "border border-zinc-200 bg-white"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {s.featured && (
                  <div className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg ring-2 ring-white">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                )}
                <div className="mb-3 flex items-start gap-3">
                  <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-lochinara-200 bg-lochinara-50 sm:h-12 sm:w-12">
                    {s.avatar ? (
                      <img
                        src={getAvatarUrl(s.avatar)}
                        alt={s.fullName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to gradient with initial if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.className = "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lochinara-500 to-lochinara-600 text-base font-semibold text-white sm:h-12 sm:w-12 sm:text-lg";
                            const fallbackText = document.createTextNode(s.fullName.charAt(0).toUpperCase());
                            target.parentElement.textContent = '';
                            target.parentElement.appendChild(fallbackText);
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-lochinara-500 to-lochinara-600 text-base font-semibold text-white sm:text-lg">
                        {s.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-zinc-900">{s.fullName}</h3>
                    </div>
                    <p className="truncate text-xs text-zinc-600">{s.track}</p>
                    {s.featured && (
                      <p className="mt-1 text-xs font-medium text-amber-600">{featuredLabel}</p>
                    )}
                  </div>
                </div>

                <p className="mb-3 line-clamp-3 text-sm text-zinc-700">{s.bio}</p>

                <div className="mb-4 max-h-20 overflow-y-auto overflow-x-hidden">
                  <div className="flex flex-wrap gap-1.5">
                    {s.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 whitespace-nowrap"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {s.linkedIn && (
                    <a
                      href={s.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-[#0077b5] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#006399] shadow-sm"
                    >
                      <svg className="h-3.5 w-3.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {s.github && (
                    <a
                      href={s.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-zinc-900"
                    >
                      GitHub
                    </a>
                  )}
                  {s.portfolio && (
                    <a
                      href={s.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-all hover:bg-zinc-50"
                    >
                      Portfolio
                    </a>
                  )}
                </div>

                {s.telegram && (
                  <a
                    href={`https://t.me/${s.telegram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0088cc] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#006fa3] shadow-md"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                    </svg>
                    Contact via Telegram
                  </a>
                )}
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70 sm:flex-row">
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
                1
              </button>
              <button className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-zinc-900">Student Profile</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header with Avatar */}
              <div className="flex items-start gap-4">
                <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-lochinara-200 bg-lochinara-50">
                  {selectedStudent.avatar ? (
                    <img
                      src={getAvatarUrl(selectedStudent.avatar)}
                      alt={selectedStudent.fullName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.className = "flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-lochinara-500 to-lochinara-600 text-2xl font-semibold text-white";
                          const fallbackText = document.createTextNode(selectedStudent.fullName.charAt(0).toUpperCase());
                          target.parentElement.textContent = '';
                          target.parentElement.appendChild(fallbackText);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-lochinara-500 to-lochinara-600 text-2xl font-semibold text-white">
                      {selectedStudent.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {selectedStudent.featured && (
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg ring-2 ring-white">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold text-zinc-900">{selectedStudent.fullName}</h3>
                    {selectedStudent.featured && (
                      <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        {featuredLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-base text-zinc-600 font-medium">{selectedStudent.track}</p>
                </div>
              </div>

              {/* Bio - Full Text */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 mb-2 uppercase tracking-wide">About</h4>
                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{selectedStudent.bio}</p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 mb-3 uppercase tracking-wide">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex rounded-full bg-lochinara-100 px-3 py-1.5 text-sm font-medium text-lochinara-700 border border-lochinara-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 mb-3 uppercase tracking-wide">Contact & Links</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedStudent.linkedIn && (
                    <a
                      href={selectedStudent.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0077b5] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#006399] shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {selectedStudent.github && (
                    <a
                      href={selectedStudent.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-900"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {selectedStudent.portfolio && (
                    <a
                      href={selectedStudent.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Portfolio
                    </a>
                  )}
                  {selectedStudent.telegram && (
                    <a
                      href={`https://t.me/${selectedStudent.telegram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0088cc] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#006fa3] shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                      </svg>
                      Telegram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
