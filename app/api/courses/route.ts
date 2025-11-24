// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const takeParam = searchParams.get("take");
    const take = takeParam ? Math.min(Number(takeParam) || 20, 50) : 20;

    const where = q
      ? {
          OR: [
            {
              code: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const courses = await prisma.course.findMany({
      where,
      orderBy: { code: "asc" },
      take,
    });

    return NextResponse.json(
      {
        courses,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/courses] error", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
