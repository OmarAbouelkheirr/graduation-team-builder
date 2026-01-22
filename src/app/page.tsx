"use client";

import { FormEvent, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./_components/ToastProvider";

const TRACKS = [
  { 
    id: "web-frontend", 
    label: "Web Development - Frontend", 
    desc: "React, Vue, Angular",
    suggestedSkills: ["React", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "SASS", "Next.js"]
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
  { 
    id: "ux-ui", 
    label: "UX/UI Design", 
    desc: "User Experience, Interface Design, Prototyping",
    suggestedSkills: ["Figma", "Adobe XD", "Sketch", "UI Design", "UX Design", "User Research", "Wireframing", "Prototyping", "Design Systems", "Interaction Design", "Usability Testing", "Accessibility"]
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
  avatar: string;
}

// 10 Young Programmer Avatars (6 male, 4 female) - Using "open-peeps" style for young programmers
const AVATARS = [
  { id: "young-male-1", seed: "young-male-1", label: "Programmer 1", gender: "male" },
  { id: "young-male-2", seed: "young-male-2", label: "Programmer 2", gender: "male" },
  { id: "young-male-3", seed: "young-male-3", label: "Programmer 3", gender: "male" },
  { id: "young-male-4", seed: "young-male-4", label: "Programmer 4", gender: "male" },
  { id: "young-male-5", seed: "young-male-5", label: "Programmer 5", gender: "male" },
  { id: "young-male-6", seed: "young-male-6", label: "Programmer 6", gender: "male" },
  { id: "young-female-1", seed: "young-female-1", label: "Programmer 7", gender: "female" },
  { id: "young-female-2", seed: "young-female-2", label: "Programmer 8", gender: "female" },
  { id: "young-female-3", seed: "young-female-3", label: "Programmer 9", gender: "female" },
  { id: "young-female-4", seed: "young-female-4", label: "Programmer 10", gender: "female" },
];

function getAvatarUrl(seed: string): string {
  // Using "notionists" style for programmer avatars - gives professional, clean look
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,3b82f6,2563eb`;
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
    avatar: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
      showToast("Please select your Track.", "warning");
      return;
    }
    if (!form.avatar) {
      showToast("Please select an avatar.", "warning");
      return;
    }
    setSubmitting(true);

    try {
      const cleanTelegram = form.telegram.trim().replace(/^@/, "");
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
          telegram: cleanTelegram,
          track: form.track,
          skills: form.skills,
          bio: form.bio,
          avatar: form.avatar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to save data.", "error");
      } else {
        // Show success modal
        setShowSuccessModal(true);
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
          avatar: "",
        });
        setSkillInput("");
        // Redirect to students page after 4 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push("/students");
        }, 4000);
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
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-lochinara-600">
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
              className="h-full rounded-full bg-gradient-to-r from-lochinara-500 to-lochinara-600 transition-all duration-500"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                  value={form.telegram}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telegram: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
          </section>

          {/* Avatar Selection */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Choose Your Avatar
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Select a robot avatar that represents you.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, avatar: avatar.seed }))}
                  className={`group relative rounded-lg border-2 p-1.5 transition-all ${
                    form.avatar === avatar.seed
                      ? "border-lochinara-500 bg-lochinara-50 shadow-md ring-2 ring-lochinara-200"
                      : "border-zinc-200 bg-white hover:border-lochinara-300 hover:shadow-sm"
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden rounded-md bg-zinc-50">
                    <img
                      src={getAvatarUrl(avatar.seed)}
                      alt={avatar.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {form.avatar === avatar.seed && (
                    <div className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-lochinara-500 to-lochinara-600 text-white shadow-lg">
                      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="mt-0.5 text-center text-[10px] text-zinc-600">
                    {avatar.gender === "female" ? "👩" : "👨"}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Track Selection */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Track
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
                      ? "border-lochinara-500 bg-lochinara-100 shadow-md"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  {form.track === t.label && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-lochinara-500 to-lochinara-600 text-white">
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
                    className="inline-flex items-center gap-1.5 rounded-full bg-lochinara-100 px-3 py-1 text-sm text-lochinara-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-lochinara-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a skill and press Enter or click Add..."
                  className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={!skillInput.trim()}
                  className="rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
                >
                  Add
                </button>
              </div>
              
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
                          className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-all duration-200 hover:border-lochinara-500 hover:bg-lochinara-100 hover:text-lochinara-700 hover:scale-105 active:scale-95"
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
              className="min-h-[120px] w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:scale-105 active:translate-y-0 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
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

      {/* Success Modal - Mobile Optimized */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => {
            setShowSuccessModal(false);
            router.push("/students");
          }}
        >
          <div 
            className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-lochinara-50 via-lochinara-100 to-white opacity-50"></div>
            
            {/* Content */}
            <div className="relative p-6 sm:p-8">
              {/* Success Icon with Animation */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-lochinara-200 rounded-full animate-ping opacity-75"></div>
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-lochinara-500 to-lochinara-600 shadow-lg">
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-center text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
                تم إرسال طلبك بنجاح! 
              </h2>

              {/* Message */}
              <p className="text-center text-sm sm:text-base text-zinc-600 leading-relaxed mb-6 px-2">
                تم إرسال طلبك بنجاح وسيتم مراجعته من قبل الإدارة. سيتم عرض ملفك الشخصي على الصفحة العامة بعد الموافقة.
              </p>

              {/* Info Box */}
              <div className="rounded-2xl bg-gradient-to-r from-lochinara-50 to-lochinara-100 p-4 mb-6 border border-lochinara-200">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-lochinara-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs sm:text-sm text-lochinara-700 flex-1">
                    سيتم تحويلك تلقائياً إلى صفحة الطلاب خلال ثوانٍ...
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/students");
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-6 py-4 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>عرض صفحة الطلاب الآن</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              {/* Close button (optional) */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/students");
                }}
                className="absolute top-4 right-4 rounded-full p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
