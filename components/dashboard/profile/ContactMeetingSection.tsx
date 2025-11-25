// components/profile/ContactMeetingSection.tsx
"use client";

import type { UserProfile } from "./types";

export default function ContactMeetingSection({
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
        Contact & meeting preferences
      </h2>
      <p className="mt-1 text-[11px] text-slate-500">
        This information is used when other students reach out to you for tutoring.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">Phone number</label>
          <input
            type="text"
            value={profile.phoneNumber ?? ""}
            onChange={(e) => onChange("phoneNumber", e.target.value || null)}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
          />
          <label className="mt-1 inline-flex items-center gap-2 text-[11px] text-slate-700">
            <input
              type="checkbox"
              checked={profile.phoneVisible}
              onChange={(e) => onChange("phoneVisible", e.target.checked)}
            />
            Allow other students to see my phone number
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">Meeting preferences</label>
          <textarea
            value={profile.meetingPrefs ?? ""}
            onChange={(e) => onChange("meetingPrefs", e.target.value || null)}
            rows={3}
            placeholder="e.g., Zoom only, afternoons on weekdays, MLC or Science Library"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
          />
        </div>
      </div>
    </div>
  );
}
