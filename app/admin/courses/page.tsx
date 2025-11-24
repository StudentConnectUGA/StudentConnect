// app/admin/courses/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";

type Course = {
  id: string;
  prefix: string;
  number: string;
  title: string;
  description: string | null;
};

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const [newCourse, setNewCourse] = useState({
    prefix: "",
    number: "",
    title: "",
    description: "",
  });

  const isAdmin =
    status === "authenticated" && session?.user?.role === "ADMIN";

  const fetchCourses = useCallback( async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`/api/admin/courses?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch courses");
      }

      const data = (await res.json()) as { courses: Course[] };
      setCourses(data.courses);
    } catch (err: any) {
      setError(err.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin, fetchCourses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.prefix.trim() || !newCourse.number.trim() || !newCourse.title.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix: newCourse.prefix,
          number: newCourse.number,
          title: newCourse.title,
          description: newCourse.description || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create course");
      }

      setNewCourse({ prefix: "", number: "", title: "", description: "" });
      await fetchCourses();
    } catch (err: any) {
      setError(err.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (course: Course) => {
    try {
      setSavingId(course.id);
      setError(null);

      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix: course.prefix,
          number: course.number,
          title: course.title,
          description: course.description || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update course");
      }

      await fetchCourses();
    } catch (err: any) {
      setError(err.message || "Failed to update course");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;

    try {
      setDeletingId(id);
      setError(null);

      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete course");
      }

      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header navLinks={[{ label: "Admin Course Page", href: "/admin/courses" }]} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-600">Loading session…</p>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header navLinks={[{ label: "Admin · Courses", href: "/admin/courses" }]} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-600">
            You must be an admin to view this page.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        navLinks={[
          { label: "Admin · Courses", href: "/admin/courses" },
          { label: "Home", href: "/" },
        ]}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-0 lg:py-10">
          <h1 className="text-xl font-semibold text-slate-900">
            Admin · Course Catalog
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Add, edit, and remove courses that students can attach to their enrollments.
          </p>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Search + refresh */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchCourses();
              }}
              className="flex flex-1 gap-2"
            >
              <input
                type="text"
                placeholder="Search by prefix, number, or title… (e.g., CSCI 1301)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-full border border-slate-300 text-slate-600 px-4 py-2 text-sm outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
              />
              <button
                type="submit"
                className="rounded-full bg-uga-black px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900"
              >
                Search
              </button>
            </form>

            <button
              type="button"
              onClick={fetchCourses}
              className="self-start rounded-full border border-slate-300 text-slate-600 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-uga-red hover:text-uga-red"
            >
              Refresh
            </button>
          </div>

          {/* New course form */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Add a new course
            </h2>
            <form
              onSubmit={handleCreate}
              className="mt-3 grid gap-3 sm:grid-cols-[0.4fr,0.4fr,1.4fr]"
            >
              <input
                type="text"
                placeholder="Prefix (e.g., CSCI)"
                value={newCourse.prefix}
                onChange={(e) =>
                  setNewCourse((c) => ({ ...c, prefix: e.target.value }))
                }
                className="rounded-md border border-slate-300 text-slate-600 px-3 py-2 text-xs uppercase outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
              />
              <input
                type="text"
                placeholder="Number (e.g., 1301)"
                value={newCourse.number}
                onChange={(e) =>
                  setNewCourse((c) => ({ ...c, number: e.target.value }))
                }
                className="rounded-md border border-slate-300 text-slate-600 px-3 py-2 text-xs outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
              />
              <input
                type="text"
                placeholder="Title (e.g., Intro to Programming)"
                value={newCourse.title}
                onChange={(e) =>
                  setNewCourse((c) => ({ ...c, title: e.target.value }))
                }
                className="rounded-md border border-slate-300 text-slate-600 px-3 py-2 text-xs outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
              />

              <div className="sm:col-span-3 mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="Optional description"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse((c) => ({
                      ...c,
                      description: e.target.value,
                    }))
                  }
                  className="flex-1 rounded-md border border-slate-300 text-slate-600 px-3 py-2 text-xs outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-uga-red px-4 py-2 text-xs font-semibold text-white hover:bg-uga-red-dark disabled:opacity-70"
                >
                  {creating ? "Adding…" : "Add course"}
                </button>
              </div>
            </form>
          </section>

          {/* Course list */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Courses ({courses.length})
              </h2>
              {loading && (
                <span className="text-[11px] text-slate-500">
                  Loading…
                </span>
              )}
            </div>

            {courses.length === 0 && !loading ? (
              <p className="mt-4 text-xs text-slate-600">
                No courses found. Try adjusting your search or add a new course above.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {courses.map((course) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    saving={savingId === course.id}
                    deleting={deletingId === course.id}
                    onSave={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function CourseRow({
  course,
  saving,
  deleting,
  onSave,
  onDelete,
}: {
  course: Course;
  saving: boolean;
  deleting: boolean;
  onSave: (course: Course) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Course>(course);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(course);
    setDirty(false);
  }, [course.id, course.prefix, course.number, course.title, course.description]);

  const handleChange = (field: keyof Course, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSaveClick = () => {
    if (!dirty) return;
    onSave(draft);
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <input
          value={draft.prefix}
          onChange={(e) => handleChange("prefix", e.target.value.toUpperCase())}
          className="w-full max-w-[5rem] rounded-md border border-slate-300 text-slate-600 px-2 py-1 uppercase outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
        />
        <input
          value={draft.number}
          onChange={(e) => handleChange("number", e.target.value)}
          className="w-full max-w-[5rem] rounded-md border border-slate-300 text-slate-600 px-2 py-1 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
        />
        <input
          value={draft.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full flex-1 rounded-md border border-slate-300 text-slate-600 px-2 py-1 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
        />
        <input
          value={draft.description ?? ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Description (optional)"
          className="w-full flex-1 rounded-md border border-slate-300 text-slate-600 px-2 py-1 outline-none ring-uga-red/40 focus:border-uga-red focus:ring"
        />
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
          onClick={() => onDelete(course.id)}
          disabled={deleting}
          className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
