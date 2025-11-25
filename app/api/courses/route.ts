// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildWhereFromQuery } from "@/lib/api-util";



// GET /api/courses?q=&take=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQ = searchParams.get("q");
    const q = rawQ?.trim() || "";
    const takeParam = searchParams.get("take");
    const take = takeParam ? Math.min(Number(takeParam) || 50, 100) : 50;

    const where = q ? buildWhereFromQuery(q) : undefined;

    const courses = await prisma.course.findMany({
      where,
      orderBy: [{ prefix: "asc" }, { number: "asc" }],
      take,
      include: {
        enrollments: {
          where: {
            canTutor: true,
            showAsTutor: true,
          },
          select: { id: true },
        },
      },
    });
    console.log("Found courses:", courses.length);

    // Strip enrollments and expose a derived availableTutors count
    const payload = courses.map((course) => ({
      id: course.id,
      prefix: course.prefix,
      number: course.number,
      title: course.title,
      availableTutors: course.enrollments.length,
    }));

    return NextResponse.json({ courses: payload }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/courses] error", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
