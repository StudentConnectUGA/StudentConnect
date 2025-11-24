// components/dashboard/EnrollmentRow.tsx
"use client";

import { useEffect, useState } from "react";

type Course = {
  id: string;
  prefix: string;
  number: string;
  title: string;
};

export type Enrollment = {
  id: string;
  grade: string | null;
  canTutor: boolean;
  showAsTutor: boolean;
  showGrade: boolean;
  course: Course;
};


export function EnrollmentRow({
  enrollment,
  saving,
  deleting,
  onSave,
  onDelete,
}: {
  enrollment: Enrollment;
  saving: boolean;
  deleting: boolean;
  onSave: (enrollment: Enrollment) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Enrollment>(enrollment);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(enrollment);
    setDirty(false);
  }, [enrollment.id, enrollment.grade, enrollment.canTutor, enrollment.showAsTutor, enrollment.showGrade]);

  const update = <K extends keyof Enrollment>(
    field: K,
    value: Enrollment[K],
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSaveClick = () => {
    if (!dirty) return;
    onSave(draft);
  };

  const fullCode = `${draft.course.prefix} ${draft.course.number}`;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
            {fullCode}
          </span>
          <span className="text-slate-700">{draft.course.title}</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-600">
              Grade (optional)
            </label>
            <input
              type="text"
              value={draft.grade ?? ""}
              onChange={(e) => update("grade", e.target.value || null)}
              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
            <input
              type="checkbox"
              checked={draft.canTutor}
              onChange={(e) => {
                const canTutor = e.target.checked;
                update("canTutor", canTutor);
                if (!canTutor) {
                  update("showAsTutor", false);
                }
              }}
            />
            I can tutor this course
          </label>

          <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
            <input
              type="checkbox"
              checked={draft.showAsTutor && draft.canTutor}
              disabled={!draft.canTutor}
              onChange={(e) => update("showAsTutor", e.target.checked)}
            />
            List me as a tutor
          </label>

          <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
            <input
              type="checkbox"
              checked={draft.showGrade}
              onChange={(e) => update("showGrade", e.target.checked)}
            />
            Allow others to see my grade
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={!dirty || saving}
          className="rounded-full bg-uga-red px-3 py-1 text-[11px] font-semibold text-white hover:bg-uga-red-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(draft.id)}
          disabled={deleting}
          className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}
