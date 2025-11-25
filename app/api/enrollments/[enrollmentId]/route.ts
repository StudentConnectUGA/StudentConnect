// app/api/enrollments/[enrollmentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: {
    enrollmentId: string;
  };
}

// PATCH /api/enrollments/:enrollmentId
// Body: partial { grade?: string; showAsTutor?: boolean; showGrade?: boolean }
// NOTE: canTutor is managed by admins only and is ignored here.
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enrollmentId } = params;

  try {
    const body = (await req.json().catch(() => null)) as
      | {
          grade?: string;
          canTutor?: boolean;     // ignored in this route
          showAsTutor?: boolean;
          showGrade?: boolean;
        }
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 },
      );
    }

    // Ensure this enrollment belongs to the current user
    const existing = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        userId: true,
        grade: true,
        canTutor: true,
        showAsTutor: true,
        showGrade: true,
      },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 },
      );
    }

    // Grade: trim to null if empty, else keep previous
    const nextGrade =
      body.grade !== undefined
        ? body.grade.trim() || null
        : existing.grade;

    // showGrade: if provided, use it; otherwise keep existing
    const nextShowGrade =
      body.showGrade !== undefined
        ? !!body.showGrade
        : existing.showGrade;

    // User request for showAsTutor, falling back to current value
    const requestedShowAsTutor =
      body.showAsTutor !== undefined
        ? !!body.showAsTutor
        : existing.showAsTutor;

    // Invariants:
    // - If canTutor is false, cannot be listed as a tutor.
    // - If showGrade is false, cannot be listed as a tutor.
    const nextShowAsTutor =
      !existing.canTutor || !nextShowGrade
        ? false
        : requestedShowAsTutor;

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        grade: nextGrade,
        showGrade: nextShowGrade,
        showAsTutor: nextShowAsTutor,
        // canTutor is intentionally NOT updated here
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

    return NextResponse.json({ enrollment: updated }, { status: 200 });
  } catch (error) {
    console.error(`[PATCH /api/enrollments/${params.enrollmentId}] error`, error);
    return NextResponse.json(
      { error: "Failed to update enrollment" },
      { status: 500 },
    );
  }
}

// DELETE /api/enrollments/:enrollmentId
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enrollmentId } = params;

  try {
    const existing = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { id: true, userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 },
      );
    }

    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`[DELETE /api/enrollments/${enrollmentId}] error`, error);
    return NextResponse.json(
      { error: "Failed to delete enrollment" },
      { status: 500 },
    );
  }
}
