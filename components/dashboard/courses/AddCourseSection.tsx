// components/dashboard/AddCourseSection.tsx
"use client";

import { useState } from "react";

type Course = {
  id: string;
  prefix: string;
  number: string;
  title: string;
};

export default function AddCourseSection({ onCreated }: { onCreated: () => Promise<void> | void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newGrade, setNewGrade] = useState("");
  const [newCanTutor, setNewCanTutor] = useState(false);
  const [newShowAsTutor, setNewShowAsTutor] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

 // Search courses
  const handleSearchCourses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setSearchLoading(true);
      setError(null);

      const params = new URLSearchParams({ q: searchTerm.trim() });
      const res = await fetch(`/api/courses?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to search courses");
      }

      const data = (await res.json()) as { courses: Course[] };
      setSearchResults(data.courses);
    } catch (err: any) {
      setError(err.message || "Failed to search courses");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      setCreating(true);
      setError(null);

      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          grade: newGrade,
          canTutor: newCanTutor,
          showAsTutor: newShowAsTutor && newCanTutor,
          showGrade: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add course");
      }

      // Reset form
      setSelectedCourse(null);
      setSearchTerm("");
      setSearchResults([]);
      setNewGrade("");
      setNewCanTutor(false);
      setNewShowAsTutor(false);

      await onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to add course");
    } finally {
      setCreating(false);
    }
  };
  return (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Add a completed course
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Search by prefix, number, or title (e.g., <span className="font-mono">CSCI 1301</span> or{" "}
              <span className="font-mono">Calculus</span>), then add your grade and tutoring status.
            </p>

            <form
              onSubmit={handleSearchCourses}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                placeholder="Search for a course… (e.g., CSCI 1301)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
              />
              <button
                type="submit"
                className="rounded-full bg-uga-black px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900"
              >
                {searchLoading ? "Searching…" : "Search"}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50">
                {searchResults.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() =>
                        setSelectedCourse(
                          isSelected ? null : course,
                        )
                      }
                      className={`flex w-full items-start justify-between px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 ${
                        isSelected ? "bg-slate-200" : ""
                      }`}
                    >
                      <span>
                        <span className="font-mono font-semibold">
                          {course.prefix} {course.number}
                        </span>{" "}
                        — {course.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedCourse && (
              <form
                onSubmit={handleCreateEnrollment}
                className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-uga-red/10 px-3 py-1 text-[11px] font-semibold text-uga-red">
                    {selectedCourse.prefix} {selectedCourse.number}
                  </span>
                  <span className="text-slate-700">
                    {selectedCourse.title}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="text-[11px] text-slate-600 sm:w-32">
                    Grade earned (optional)
                  </label>
                  <input
                    type="text"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    placeholder="e.g., A, B+, S"
                    className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={newCanTutor}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewCanTutor(checked);
                          if (!checked) setNewShowAsTutor(false);
                        }}
                      />
                      I feel comfortable tutoring this course.
                    </label>

                    <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={newShowAsTutor && newCanTutor}
                        disabled={!newCanTutor}
                        onChange={(e) =>
                          setNewShowAsTutor(e.target.checked)
                        }
                      />
                      List me as a peer tutor for this course.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="self-start rounded-full bg-uga-red px-4 py-2 text-[11px] font-semibold text-white hover:bg-uga-red-dark disabled:opacity-70"
                  >
                    {creating ? "Adding…" : "Add course"}
                  </button>
                </div>
              </form>
            )}
          </section>
  );
}
