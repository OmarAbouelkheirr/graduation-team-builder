"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../_components/ToastProvider";

const TRACKS = [
  "Web Development - Frontend",
  "Web Development - Backend",
  "Web Development - Full Stack",
  "Mobile Development",
  "AI & Data",
  "Cybersecurity",
  "UX/UI Design",
];

interface StudentData {
  _id: string;
  fullName: string;
  email: string;
  linkedIn: string;
  github?: string;
  portfolio?: string;
  telegram?: string;
  track: string;
  skills: string[];
  bio: string;
}

export default function EditPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<"email" | "otp" | "edit">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  
  const [form, setForm] = useState({
    fullName: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    telegram: "",
    track: "",
    skills: [] as string[],
    bio: "",
  });
  const [skillInput, setSkillInput] = useState("");

  // Step 1: Request OTP
  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.error || "Failed to send verification code", "error");
      } else {
        showToast("Verification code sent to your email", "success");
        setStep("otp");
      }
    } catch {
      showToast("Unable to connect to server", "error");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP and fetch student data
  async function handleOTPVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // First verify OTP to get studentId
      const verifyRes = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const verifyData = await verifyRes.json();
      
      if (!verifyRes.ok) {
        showToast(verifyData.error || "Invalid verification code", "error");
        return;
      }
      
      setStudentId(verifyData.studentId);
      // Fetch student data
      await fetchStudentData(verifyData.studentId);
      setStep("edit");
    } catch {
      showToast("Unable to connect to server", "error");
    } finally {
      setLoading(false);
    }
  }

  // Fetch student data
  async function fetchStudentData(id: string) {
    try {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();
      
      if (res.ok) {
        setStudentData(data);
        setForm({
          fullName: data.fullName,
          linkedIn: data.linkedIn || "",
          github: data.github || "",
          portfolio: data.portfolio || "",
          telegram: data.telegram || "",
          track: data.track,
          skills: data.skills || [],
          bio: data.bio,
        });
      }
    } catch {
      showToast("Failed to load your data", "error");
    }
  }

  // Step 3: Update student data
  async function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${studentId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: otpCode,
          fullName: form.fullName,
          linkedIn: form.linkedIn,
          github: form.github || undefined,
          portfolio: form.portfolio || undefined,
          telegram: form.telegram || undefined,
          track: form.track,
          skills: form.skills,
          bio: form.bio,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.error || "Failed to update your profile", "error");
      } else {
        showToast("Your profile has been updated successfully!", "success");
        setTimeout(() => {
          router.push("/students");
        }, 1500);
      }
    } catch {
      showToast("Unable to connect to server", "error");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="font-sans text-zinc-900 animate-in fade-in">
      <div className="rounded-xl bg-white/90 p-4 shadow-lg ring-1 ring-zinc-200/70 backdrop-blur transition-all duration-300 sm:rounded-2xl sm:p-6 lg:p-8">
        <header className="mb-6 space-y-2 sm:mb-8 sm:space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Edit Your Profile
          </h1>
          <p className="text-sm text-zinc-600">
            Update your student profile information
          </p>
        </header>

        {/* Step 1: Email Input */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="mt-2 text-xs text-zinc-500">
                We'll send a verification code to this email address
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleOTPVerify} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-center text-2xl font-mono tracking-widest shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                required
              />
              <p className="mt-2 text-xs text-zinc-500">
                Check your email ({email}) for the verification code
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtpCode("");
                }}
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="flex-1 rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Edit Form */}
        {step === "edit" && studentData && (
          <form onSubmit={handleUpdateSubmit} className="space-y-6">
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all bg-zinc-50 cursor-not-allowed"
                  value={email}
                  disabled
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Track <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                value={form.track}
                onChange={(e) =>
                  setForm((f) => ({ ...f, track: e.target.value }))
                }
                required
              >
                <option value="">Select a track</option>
                {TRACKS.map((track) => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill and press Enter"
                  className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-lochinara-500 focus:ring-2 focus:ring-lochinara-500/20"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    onClick={() => removeSkill(skill)}
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-lochinara-100 to-lochinara-200 px-3 py-1 text-xs font-medium text-zinc-700 cursor-pointer hover:from-lochinara-200 hover:to-lochinara-300 transition-all"
                  >
                    {skill}
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Bio <span className="text-red-500">*</span>
              </label>
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
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/students")}
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-gradient-to-r from-lochinara-500 to-lochinara-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
