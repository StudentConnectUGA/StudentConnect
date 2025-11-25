// app/api/courses/[courseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    courseId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { courseId } = await params;

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          where: {
            canTutor: true,
            showAsTutor: true,
            user: {
              showTutorProfile: true,
              showCourses: true,
            },
          },
          include: {
            user: {
              include: {
                contactMethods: {
                  where: {
                    visible: true,
                  },
                  orderBy: {
                    isPreferred: "desc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    // Map to a safe response shape for the frontend
    const tutors = course.enrollments.map((enrollment) => {
      const u = enrollment.user;

      const canShowGrade = enrollment.showGrade && u.showGrades;

      return {
        tutorId: u.id,
        name: u.name,
        major: u.major,
        year: u.year,
        bio: u.bio,
        meetingPrefs: u.meetingPrefs,
        // Grade is optional and privacy-aware
        grade: canShowGrade ? enrollment.grade : null,
        showGrade: canShowGrade,
        // Basic contact methods (only visible ones)
        contactMethods: u.contactMethods.map((cm) => ({
          id: cm.id,
          platform: cm.platform,
          identifier: cm.identifier,
          isPreferred: cm.isPreferred,
        })),
        // For convenience on the frontend
        enrollmentId: enrollment.id,
        canTutor: enrollment.canTutor,
        showAsTutor: enrollment.showAsTutor,
      };
    });

    const response = {
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
      },
      tutors,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`[GET /api/courses/${courseId}] error`, error);
    return NextResponse.json(
      { error: "Failed to fetch course detail" },
      { status: 500 },
    );
  }
}
