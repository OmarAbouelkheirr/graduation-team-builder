"use client";

import { FormEvent, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./_components/ToastProvider";

const TRACKS = [
  { 
    id: "web-frontend", 
    label: "Web Development - Frontend", 
    desc: "React, Vue, Angular, UI/UX",
    suggestedSkills: ["React", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "SASS", "Next.js", "UI/UX Design", "Figma"]
  },
  { 
    id: "web-backend", 
    label: "Web Development - Backend", 
    desc: "Node.js, Python, APIs, Databases",
    suggestedSkills: ["Node.js", "Python", "Express", "Django", "Flask", "REST APIs", "GraphQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker"]
  },
  { 
    id: "web-fullstack", 
    label: "Web Development - Full Stack", 
    desc: "Frontend + Backend Development",
    suggestedSkills: ["React", "Node.js", "Next.js", "TypeScript", "MongoDB", "PostgreSQL", "Express", "REST APIs", "Git", "Docker", "AWS", "CI/CD"]
  },
  { 
    id: "mobile", 
    label: "Mobile Development", 
    desc: "iOS, Android, React Native, Flutter",
    suggestedSkills: ["React Native", "Flutter", "Swift", "Kotlin", "Java", "Dart", "iOS Development", "Android Development", "Firebase", "Mobile UI/UX"]
  },
  { 
    id: "ai-data", 
    label: "AI & Data", 
    desc: "Machine Learning, Data Analytics, AI",
    suggestedSkills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Data Science", "Pandas", "NumPy", "SQL", "Data Visualization", "NLP", "Computer Vision"]
  },
  { 
    id: "cybersecurity", 
    label: "Cybersecurity", 
    desc: "Network Security, Ethical Hacking",
    suggestedSkills: ["Network Security", "Ethical Hacking", "Penetration Testing", "Cybersecurity", "Linux", "Wireshark", "Cryptography", "Security Auditing", "OWASP", "Firewall"]
  },
];

interface FormState {
  fullName: string;
  email: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  telegram: string;
  track: string;
  skills: string[];
  bio: string;
}

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    telegram: "",
    track: "",
    skills: [],
    bio: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((f) => ({ ...f, skills: [...f.skills, trimmed] }));
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.track) {
      showToast("Please select your Academic Focus.", "warning");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          linkedIn: form.linkedIn,
          github: form.github,
          portfolio: form.portfolio || undefined,
          telegram: form.telegram,
          track: form.track,
          skills: form.skills,
          bio: form.bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to save data.", "error");
      } else {
        showToast("Your application has been submitted successfully, awaiting admin review.", "success");
        setForm({
          fullName: "",
          email: "",
          linkedIn: "",
          github: "",
          portfolio: "",
          telegram: "",
          track: "",
          skills: [],
          bio: "",
        });
        setSkillInput("");
        // Redirect to students page after 1.5 seconds
        setTimeout(() => {
          router.push("/students");
        }, 1500);
      }
    } catch {
      showToast("Unable to connect to server. Please try again later.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = [
    form.fullName && form.email,
    form.linkedIn,
    form.telegram,
    form.track,
    form.skills.length > 0,
    form.bio,
  ].filter(Boolean).length;

  return (
    <div className="font-sans text-zinc-900 animate-in fade-in">
      <div className="rounded-xl bg-white/90 p-4 shadow-lg ring-1 ring-zinc-200/70 backdrop-blur transition-all duration-300 sm:rounded-2xl sm:p-6 lg:p-8">
        <header className="mb-6 space-y-2 sm:mb-8 sm:space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-fuchsia-600">
            Create Your Student Profile
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Create Your Student Profile
          </h1>
          <p className="text-sm text-zinc-600">
            Connect with peers and build your dream graduation project team.
          </p>
        </header>

        {/* Progress Bar */}
        <div className="mb-6 space-y-2 sm:mb-8">
          <div className="flex flex-col items-start justify-between gap-1 text-xs text-zinc-600 sm:flex-row sm:items-center">
            <span>Step 1 of 2: Personal & Academic Details</span>
            <span>{Math.round((progress / 6) * 100)}% Completed</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 transition-all duration-500"
              style={{ width: `${(progress / 6) * 100}%` }}
            />
          </div>
        </div>

        <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
          {/* Personal & Academic Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Personal & Academic Details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  LinkedIn Profile <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
                  value={form.linkedIn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkedIn: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  GitHub Profile (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
                  value={form.github}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, github: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Portfolio (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
                  value={form.portfolio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, portfolio: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Telegram Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
                  value={form.telegram}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telegram: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
          </section>

          {/* Academic Focus - Track Selection */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Academic Focus
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Select your major and highlight your technical strengths.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, track: t.label }))}
                  className={`group relative rounded-xl border-2 p-3 text-left transition-all sm:p-4 ${
                    form.track === t.label
                      ? "border-fuchsia-500 bg-fuchsia-50 shadow-md"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  {form.track === t.label && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 text-white">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="font-semibold text-zinc-900 pr-8">{t.label}</div>
                  <div className="mt-1 text-xs text-zinc-600">{t.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Top Skills */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Top Skills</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 px-3 py-1 text-sm text-fuchsia-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-fuchsia-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type a skill and press Enter..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
              
              {/* Suggested Skills based on selected track */}
              {form.track && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
                  <p className="text-xs font-medium text-zinc-600">
                    Suggested skills for {form.track}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRACKS.find((t) => t.label === form.track)?.suggestedSkills
                      .filter((skill) => !form.skills.includes(skill))
                      .map((skill, index) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            if (!form.skills.includes(skill)) {
                              setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
                            }
                          }}
                          className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-all duration-200 hover:border-fuchsia-500 hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:scale-105 active:scale-95"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Bio */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Bio / Additional Info
            </h2>
            <textarea
              placeholder="Tell potential teammates about your project interests, past projects, or what role you'd like to take..."
              className="min-h-[120px] w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
              value={form.bio}
              onChange={(e) =>
                setForm((f) => ({ ...f, bio: e.target.value }))
              }
              maxLength={500}
              required
            />
            <div className="text-xs text-zinc-500">
              {form.bio.length}/500
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Your data will appear on the public page after admin approval
            </p>
            <button
              type="submit"
              disabled={submitting || !form.track}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:scale-105 active:translate-y-0 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Register Profile →"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
