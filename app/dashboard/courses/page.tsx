// app/dashboard/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import AddCourseSection from "@/components/dashboard/courses/AddCourseSection";
import {EnrollmentsSection} from "@/components/dashboard/courses/EnrollmentSection";

type Course = {
  id: string;
  prefix: string;
  number: string;
  title: string;
};

type Enrollment = {
  id: string;
  grade: string | null;
  canTutor: boolean;
  showAsTutor: boolean;
  showGrade: boolean;
  course: Course;
};

export default function DashboardCoursesPage() {
  const { data: session, status } = useSession();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const isAuthenticated = status === "authenticated";

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/enrollments", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch enrollments");
      }

      const data = (await res.json()) as { enrollments: Enrollment[] };
      setEnrollments(data.enrollments);
    } catch (err: any) {
      setError(err.message || "Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEnrollments();
    }
  }, [isAuthenticated]);

 

  const handleUpdateEnrollment = async (enrollment: Enrollment) => {
    try {
      setSavingId(enrollment.id);
      setError(null);

      const res = await fetch(`/api/enrollments/${enrollment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: enrollment.grade ?? "",
          canTutor: enrollment.canTutor,
          showAsTutor: enrollment.showAsTutor && enrollment.canTutor,
          showGrade: enrollment.showGrade,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update listing");
      }

      await fetchEnrollments();
    } catch (err: any) {
      setError(err.message || "Failed to update listing");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (!confirm("Remove this course from your completed list?")) return;

    try {
      setDeletingId(id);
      setError(null);

      const res = await fetch(`/api/enrollments/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete listing");
      }

      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header
          navLinks={[
            { label: "My courses", href: "/dashboard/courses" },
            { label: "Home", href: "/" },
          ]}
        />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-600">Loading session…</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header
          navLinks={[
            { label: "My courses", href: "/dashboard/courses" },
            { label: "Home", href: "/" },
          ]}
        />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-600">
            Please sign in to manage your course listings.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        navLinks={[
          { label: "My courses", href: "/dashboard/courses" },
          { label: "Home", href: "/" },
        ]}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-0 lg:py-10">
          <h1 className="text-xl font-semibold text-slate-900">
            Completed courses & tutor listings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Add courses you&apos;ve completed, record your grade, and choose
            which courses you&apos;d like to be listed as a peer tutor for.
          </p>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Add course form */}
          <AddCourseSection onCreated={fetchEnrollments} />

          {/* Existing enrollments */}
          <EnrollmentsSection
            enrollments={enrollments}
            loading={loading}
            savingId={savingId}
            deletingId={deletingId}
            onSave={handleUpdateEnrollment}
            onDelete={handleDeleteEnrollment}
          />
        </div>
      </main>
    </div>
  );
}
