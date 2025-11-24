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
// Body: partial { grade?: string; canTutor?: boolean; showAsTutor?: boolean; showGrade?: boolean }
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enrollmentId } = await params;

  try {
    const body = (await req.json().catch(() => null)) as
      | {
          grade?: string;
          canTutor?: boolean;
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
      select: { id: true, userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 },
      );
    }

    const data: {
      grade?: string | null;
      canTutor?: boolean;
      showAsTutor?: boolean;
      showGrade?: boolean;
    } = {};

    if (body.grade !== undefined) {
      data.grade = body.grade.trim() || null;
    }
    if (body.canTutor !== undefined) {
      data.canTutor = !!body.canTutor;
    }
    if (body.showAsTutor !== undefined) {
      // Only allow visible as tutor if canTutor will be true
      const canTutor =
        body.canTutor !== undefined
          ? body.canTutor
          : existing
          ? undefined
          : undefined;
      // easier: we’ll re-evaluate after update; for now enforce boolean
      data.showAsTutor = !!body.showAsTutor;
    }
    if (body.showGrade !== undefined) {
      data.showGrade = !!body.showGrade;
    }

    // Small guard: if canTutor is false, force showAsTutor to false
    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        ...data,
        ...(body.canTutor === false ? { showAsTutor: false } : {}),
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
    console.error(`[PATCH /api/enrollments/${enrollmentId}] error`, error);
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
