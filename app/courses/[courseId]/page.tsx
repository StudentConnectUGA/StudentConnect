// app/courses/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import TutorCard from "@/components/tutors/TutorCard";
import { SignedOut } from "@/components/SignedOut";

type TutorUser = {
  id: string;
  name: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  showTutorProfile: boolean;
  showGrades: boolean;
};

type TutorEnrollment = {
  id: string;
  grade: string | null;
  showGrade: boolean;
  canTutor: boolean;
  showAsTutor: boolean;
  user: TutorUser;
};

type CourseWithTutors = {
  id: string;
  prefix: string;
  number: string;
  title: string;
  enrollments: TutorEnrollment[];
};

type Status = "loading" | "ok" | "unauthorized" | "not-found" | "error";

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Header
      navLinks={[
        { label: "Find courses", href: "/courses" },
        { label: "My courses", href: "/dashboard/courses" },
        { label: "Home", href: "/" },
      ]}
    />
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-0 lg:py-10">{children}</div>
    </main>
  </div>
);

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [course, setCourse] = useState<CourseWithTutors | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        setStatus("loading");
        const res = await fetch(`/api/courses/${courseId}/tutors`);

        if (res.status === 401) {
          setStatus("unauthorized");
          return;
        }

        if (res.status === 404) {
          setStatus("not-found");
          return;
        }

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = (await res.json()) as CourseWithTutors;
        setCourse(data);
        setStatus("ok");
      } catch (err) {
        console.error("Failed to fetch course tutors:", err);
        setStatus("error");
      }
    };

    fetchCourse();
  }, [courseId]);

  // Loading
  if (status === "loading") {
    return (
      <Shell>
        <p className="text-xs text-slate-600">Loading course tutors…</p>
      </Shell>
    );
  }

  // Not logged in
  if (status === "unauthorized") {
    return <SignedOut message={"Please sign in to view tutors for this course."} />;
  }

  // Course not found
  if (status === "not-found") {
    return (
      <Shell>
        <p className="text-xs text-slate-600">Course not found.</p>
      </Shell>
    );
  }

  // Generic error
  if (status === "error" || !course) {
    return (
      <Shell>
        <p className="text-xs text-red-600">Something went wrong while loading this course.</p>
      </Shell>
    );
  }

  // Normal rendered state
  const tutorsCount = course.enrollments.length;
  const courseCode = `${course.prefix} ${course.number}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        navLinks={[
          { label: "Find courses", href: "/courses" },
          { label: "My courses", href: "/dashboard/courses" },
          { label: "Home", href: "/" },
        ]}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-0 lg:py-10">
          {/* Course header */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
                {courseCode}
              </span>
              <h1 className="mt-2 text-lg font-semibold text-slate-900">{course.title}</h1>
              <p className="mt-1 text-xs text-slate-600">Peer tutors who have completed this course and opted in to be listed.</p>
            </div>

            <div className="flex flex-col items-start gap-2 text-xs sm:items-end">
              <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-uga-red">
                {tutorsCount} tutor{tutorsCount === 1 ? "" : "s"} available
              </span>
            </div>
          </header>

          {/* Tutor list */}
          <section className="mt-8">
            {tutorsCount === 0 ? (
              <p className="text-xs text-slate-600">
                No tutors are currently listed for this course. Check back later—students can opt in to tutor after completing the class.
              </p>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {course.enrollments.map((enrollment) => (
                  <TutorCard key={enrollment.id} enrollment={enrollment} courseCode={courseCode} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
