// app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Utility: build where clause for search
function buildWhereFromQuery(q?: string | null) {
  if (!q) return {};

  const trimmed = q.trim();
  if (!trimmed) return {};

  // If user types "CSCI 1301", split on whitespace
  const [prefixPart, numberPart] = trimmed.split(/\s+/, 2);

  if (numberPart) {
    return {
      AND: [
        {
          prefix: {
            contains: prefixPart,
            mode: "insensitive",
          },
        },
        {
          number: {
            contains: numberPart,
            mode: "insensitive",
          },
        },
      ],
    };
  }

  // Single token search: try prefix, number, or title
  return {
    OR: [
      {
        prefix: {
          contains: trimmed,
          mode: "insensitive",
        },
      },
      {
        number: {
          contains: trimmed,
          mode: "insensitive",
        },
      },
      {
        title: {
          contains: trimmed,
          mode: "insensitive",
        },
      },
    ],
  };
}

// GET /api/admin/courses?q=&take=
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const takeParam = searchParams.get("take");
    const take = takeParam ? Math.min(Number(takeParam) || 50, 100) : 50;

    const where = buildWhereFromQuery(q);

    const courses = await prisma.course.findMany({
      where,
      orderBy: [
        { prefix: "asc" },
        { number: "asc" },
      ],
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
// Body: { prefix: string; number: string; title: string; description?: string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json().catch(() => null)) as
      | { prefix?: string; number?: string; title?: string; description?: string }
      | null;

    if (!body || !body.prefix || !body.number || !body.title) {
      return NextResponse.json(
        { error: "Missing required fields: prefix, number, title" },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        prefix: body.prefix.trim().toUpperCase(),
        number: body.number.trim(),
        title: body.title.trim(),
        description: body.description?.trim() || null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/courses] error", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A course with this prefix and number already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 },
    );
  }
}
