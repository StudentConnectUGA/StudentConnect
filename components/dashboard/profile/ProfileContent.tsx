// components/profile/ProfileContent.tsx
"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "./types";
import BasicInfoSection from "@/components/dashboard/profile/BasicInfoSection";
import ContactMeetingSection from "@/components/dashboard/profile/ContactMeetingSection";
import ContactMethodsSection from "@/components/dashboard/profile/ContactMethodsSection";
import PrivacySection from "@/components/dashboard/profile/PrivacySection";

type ProfileTab = "profile" | "contactMethods";

export default function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/profile", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load profile");
        }

        setProfile(data.user as UserProfile);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  const handleChange = <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K],
  ) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setSavedMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      setError(null);
      setSavedMessage(null);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          major: profile.major,
          year: profile.year,
          bio: profile.bio,
          phoneNumber: profile.phoneNumber,
          phoneVisible: profile.phoneVisible,
          meetingPrefs: profile.meetingPrefs,
          showGrades: profile.showGrades,
          showCourses: profile.showCourses,
          showTutorProfile: profile.showTutorProfile,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data.user as UserProfile);
      setSavedMessage("Profile updated.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-xl font-semibold text-slate-900"> profile</h1>
      <p className="mt-1 text-sm text-slate-600">
        Update  basic info, contact options, and privacy preferences.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {savedMessage && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {savedMessage}
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        {loading || !profile ? (
          <p className="text-xs text-slate-600">Loading profile…</p>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Sidebar */}
            <aside className="md:w-56 border-b border-slate-100 pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
              <nav className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${
                    activeTab === "profile"
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>Profile details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("contactMethods")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${
                    activeTab === "contactMethods"
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>Contact methods</span>
                </button>
              </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 md:pl-4 md:border-l md:border-slate-100">
              {activeTab === "profile" && (
                <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                  <BasicInfoSection profile={profile} onChange={handleChange} />
                  <ContactMeetingSection
                    profile={profile}
                    onChange={handleChange}
                  />
                  <PrivacySection profile={profile} onChange={handleChange} />

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-uga-red px-5 py-2 text-[11px] font-semibold text-white hover:bg-uga-red-dark disabled:opacity-70"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "contactMethods" && (
                <div className="text-xs">
                  <ContactMethodsSection />
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
