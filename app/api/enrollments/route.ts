// app/api/enrollments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/enrollments  -> current user's enrollments
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            prefix: true,
            number: true,
            title: true,
          },
        },
      },
      orderBy: {
        course: {
          prefix: "asc",
        },
      },
    });

    return NextResponse.json({ enrollments }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/enrollments] error", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 },
    );
  }
}

// POST /api/enrollments
// Body: { courseId: string; grade?: string; canTutor?: boolean; showAsTutor?: boolean; showGrade?: boolean }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => null)) as
      | {
          courseId?: string;
          grade?: string;
          canTutor?: boolean;
          showAsTutor?: boolean;
          showGrade?: boolean;
        }
      | null;

    if (!body?.courseId) {
      return NextResponse.json(
        { error: "Missing courseId" },
        { status: 400 },
      );
    }

    // Ensure course exists
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    // Prevent duplicate enrollment for same (user, course)
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have an entry for this course." },
        { status: 409 },
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        grade: body.grade?.trim() || null,
        canTutor: !!body.canTutor,
        showAsTutor: !!body.showAsTutor && !!body.canTutor,
        showGrade:
          body.showGrade === undefined ? true : Boolean(body.showGrade),
      },
      include: {
        course: {
          select: {
            id: true,
            prefix: true,
            number: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/enrollments] error", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 },
    );
  }
}
