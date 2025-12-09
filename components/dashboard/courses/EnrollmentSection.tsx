// components/dashboard/EnrollmentsSection.tsx
"use client";

import { EnrollmentRow, type Enrollment } from "./EnrollmentRow";

export function EnrollmentsSection({
  enrollments,
  loading,
  savingId,
  deletingId,
  onSave,
  onDelete,
}: {
  enrollments: Enrollment[];
  loading: boolean;
  savingId: string | null;
  deletingId: string | null;
  onSave: (e: Enrollment) => void;
  onDelete: (id: string) => void;
}) {
  return (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                 course listings ({enrollments.length})
              </h2>
              {loading && (
                <span className="text-[11px] text-slate-500">
                  Loading…
                </span>
              )}
            </div>

            {enrollments.length === 0 && !loading ? (
              <p className="mt-3 text-xs text-slate-600">
                You haven&apos;t added any completed courses yet. Use the
                form above to add  first one.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {enrollments.map((enrollment) => (
                  <EnrollmentRow
                    key={enrollment.id}
                    enrollment={enrollment}
                    saving={savingId === enrollment.id}
                    deleting={deletingId === enrollment.id}
                    onSave={onSave}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </section>
  );
}
