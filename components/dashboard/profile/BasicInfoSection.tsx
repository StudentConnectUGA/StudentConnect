// components/profile/BasicInfoSection.tsx
"use client";

import type { UserProfile } from "./types";

export default function BasicInfoSection({
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
    <div>
      <h2 className="text-sm font-semibold text-slate-900">
        Basic information
      </h2>
      <p className="mt-1 text-[11px] text-slate-500">
        This helps other students know who they&apos;re studying with.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">Name</label>
          <input
            type="text"
            value={profile.name ?? ""}
            onChange={(e) => onChange("name", e.target.value || null)}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">UGA ID (read-only)</label>
          <input
            type="text"
            value={profile.ugaId ?? ""}
            disabled
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">Major</label>
          <input
            type="text"
            value={profile.major ?? ""}
            onChange={(e) => onChange("major", e.target.value || null)}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">Year</label>
          <input
            type="text"
            placeholder='e.g., "Freshman", "Senior"'
            value={profile.year ?? ""}
            onChange={(e) => onChange("year", e.target.value || null)}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-[11px] text-slate-600">Short bio</label>
        <textarea
          value={profile.bio ?? ""}
          onChange={(e) => onChange("bio", e.target.value || null)}
          rows={3}
          placeholder="Tell other students a bit about  experience, interests, or courses you enjoy."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
        />
      </div>
    </div>
  );
}
