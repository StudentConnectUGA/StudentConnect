// app/courses/[courseId]/page.tsx
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";

type CoursePageProps = {
  params: {
    courseId: string;
  };
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        where: {
          canTutor: true,
          showAsTutor: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              major: true,
              year: true,
              bio: true,
              showTutorProfile: true,
              showGrades: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const tutorEnrollments = course.enrollments.filter(
    (enrollment) => enrollment.user && enrollment.user.showTutorProfile,
  );

  const tutorsCount = tutorEnrollments.length;
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
              <h1 className="mt-2 text-lg font-semibold text-slate-900">
                {course.title}
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Peer tutors who have completed this course and opted in to be
                listed.
              </p>
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
                No tutors are currently listed for this course. Check back
                later—students can opt in to tutor after completing the class.
              </p>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {tutorEnrollments.map((enrollment) => {
                  const user = enrollment.user!;
                  const displayGrade =
                    enrollment.showGrade && user.showGrades && enrollment.grade;

                  return (
                    <div
                      key={enrollment.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-uga-red/60 hover:shadow-sm"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          {user.name ?? "Unnamed student"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-600">
                          {[user.major, user.year].filter(Boolean).join(" • ")}
                        </p>

                        {displayGrade && (
                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            Grade: {enrollment.grade}
                          </span>
                        )}

                        {user.bio && (
                          <p className="mt-3 text-xs text-slate-700 line-clamp-3">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          Typically available by appointment.
                        </span>
                        {/* Future: link to dedicated tutor profile or contact flow */}
                        <span className="font-medium text-uga-red">
                          View profile
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
