// components/CourseResultsGrid.tsx
"use client";

import Link from "next/link";

export type CourseResult = {
  id: string;
  prefix: string;   // e.g. "CSCI"
  number: string;   // e.g. "1301"
  title: string;    // e.g. "Intro to Programming"
  availableTutors?: number; // optional, for when you have this data
};

export default function CourseResultsGrid({ courses }: { courses: CourseResult[] }) {
  if (!courses.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {courses.map((course) => {
        const code = `${course.prefix} ${course.number}`;
        const tutors = course.availableTutors;

        return (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-uga-red/60 hover:shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500">{code}</p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900">
                {course.title}
              </h3>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              {typeof tutors === "number" && tutors >= 0 ? (
                <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-uga-red">
                  {tutors} tutor{tutors === 1 ? "" : "s"} available
                </span>
              ) : (
                <span />
              )}

              <span className="font-medium text-slate-700 group-hover:text-uga-red">
                View tutors
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
