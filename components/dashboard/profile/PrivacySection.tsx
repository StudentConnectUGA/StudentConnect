// components/profile/PrivacySection.tsx
"use client";

import type { UserProfile } from "./types";

export default function PrivacySection({
  profile,
  onChange,
}: {
  profile: UserProfile;
  onChange: <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K],
  ) => void;
}) {
  return (
    <div className="border-t border-slate-100 pt-4">
      <h2 className="text-sm font-semibold text-slate-900">
        Privacy settings
      </h2>
      <p className="mt-1 text-[11px] text-slate-500">
        Control how  information appears across StudentConnect.
      </p>

      <div className="mt-3 space-y-2">
        <label className="flex items-start gap-2 text-[11px] text-slate-700">
          <input
            type="checkbox"
            checked={profile.showTutorProfile}
            onChange={(e) => onChange("showTutorProfile", e.target.checked)}
          />
          <span>Show my tutor profile when I&apos;m listed for a course.</span>
        </label>

        <label className="flex items-start gap-2 text-[11px] text-slate-700">
          <input
            type="checkbox"
            checked={profile.showCourses}
            onChange={(e) => onChange("showCourses", e.target.checked)}
          />
          <span>
            Allow others to see the list of courses I&apos;ve completed (when I opt in).
          </span>
        </label>

        <label className="flex items-start gap-2 text-[11px] text-slate-700">
          <input
            type="checkbox"
            checked={profile.showGrades}
            onChange={(e) => onChange("showGrades", e.target.checked)}
          />
          <span>
            Allow my grades to be shown when I choose to share them for a course.
          </span>
        </label>
      </div>
    </div>
  );
}
