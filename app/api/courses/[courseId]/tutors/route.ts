// app/api/courses/[courseId]/tutors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteParams = {
  params: {
    courseId: string;
  };
};

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Please sign in to view tutors for this course." },
      { status: 401 }
    );
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      prefix: true,
      number: true,
      title: true,
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
    return NextResponse.json(
      { error: "Not found", message: "Course not found." },
      { status: 404 }
    );
  }

  // Only keep enrollments where the user has opted to show tutor profile
  const tutorEnrollments = course.enrollments.filter(
    (enrollment) => enrollment.user && enrollment.user.showTutorProfile
  );

  const responseBody = {
    id: course.id,
    prefix: course.prefix,
    number: course.number,
    title: course.title,
    enrollments: tutorEnrollments,
  };

  return NextResponse.json(responseBody, { status: 200 });
}
