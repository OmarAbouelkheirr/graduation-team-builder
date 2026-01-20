"use client";

import { useEffect, useState } from "react";
import { SkeletonCard } from "../_components/Skeleton";

interface PublicStudent {
  id: string;
  fullName: string;
  track: string;
  skills: string[];
  bio: string;
  preferences?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  telegram?: string;
}

const TRACKS = [
  "Web Development - Frontend",
  "Web Development - Backend",
  "Web Development - Full Stack",
  "Mobile Development",
  "AI & Data",
  "Cybersecurity",
];

export default function StudentsPage() {
  const [students, setStudents] = useState<PublicStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // initial load
  useEffect(() => {
    void fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
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
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
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
                    ? "bg-blue-600 text-white shadow-md"
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
                      ? "bg-blue-600 text-white shadow-md"
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
                className="group relative rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 sm:p-5 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-base font-semibold text-white sm:h-12 sm:w-12 sm:text-lg">
                    {s.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-zinc-900">{s.fullName}</h3>
                    <p className="truncate text-xs text-zinc-600">{s.track}</p>
                  </div>
                </div>

                <p className="mb-4 line-clamp-3 text-sm text-zinc-700">{s.bio}</p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {s.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {s.skills.length > 3 && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                      +{s.skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {s.linkedIn && (
                    <a
                      href={s.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-700"
                    >
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
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0088cc] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#0077b5]"
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
              <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
                1
              </button>
              <button className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
