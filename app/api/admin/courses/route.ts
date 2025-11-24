// app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/courses?q=CSCI&take=50
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const takeParam = searchParams.get("take");
    const take = takeParam ? Math.min(Number(takeParam) || 50, 100) : 50;

    const where = q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { title: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const courses = await prisma.course.findMany({
      where,
      orderBy: { code: "asc" },
      take,
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/courses] error", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

// POST /api/admin/courses
// Body: { code: string; title: string; description?: string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json().catch(() => null)) as
      | { code?: string; title?: string; description?: string }
      | null;

    if (!body || !body.code || !body.title) {
      return NextResponse.json(
        { error: "Missing required fields: code, title" },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        code: body.code.trim(),
        title: body.title.trim(),
        description: body.description?.trim() || null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/courses] error", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A course with this code already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 },
    );
  }
}
