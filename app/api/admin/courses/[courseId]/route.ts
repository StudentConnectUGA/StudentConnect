// app/api/admin/courses/[courseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: {
    courseId: string;
  };
}

// PATCH /api/admin/courses/:courseId
// Body: partial { prefix?: string; number?: string; title?: string; description?: string }
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { courseId } = await params;

  try {
    const body = (await req.json().catch(() => null)) as
      | { prefix?: string; number?: string; title?: string; description?: string }
      | null;

    if (
      !body ||
      (body.prefix === undefined &&
        body.number === undefined &&
        body.title === undefined &&
        body.description === undefined)
    ) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 },
      );
    }

    const data: {
      prefix?: string;
      number?: string;
      title?: string;
      description?: string | null;
    } = {};

    if (body.prefix !== undefined) {
      data.prefix = body.prefix.trim().toUpperCase();
    }
    if (body.number !== undefined) {
      data.number = body.number.trim();
    }
    if (body.title !== undefined) {
      data.title = body.title.trim();
    }
    if (body.description !== undefined) {
      data.description = body.description?.trim() || null;
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data,
    });

    return NextResponse.json({ course: updated }, { status: 200 });
  } catch (error: any) {
    console.error(`[PATCH /api/admin/courses/${courseId}] error`, error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A course with this prefix and number already exists." },
        { status: 409 },
      );
    }

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/courses/:courseId
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { courseId } = await params;

  try {
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(`[DELETE /api/admin/courses/${courseId}] error`, error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 },
    );
  }
}
