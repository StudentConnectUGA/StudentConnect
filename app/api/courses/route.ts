// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Same search logic as admin, but public and read-only
// TODO: merge both into utility function
function buildWhereFromQuery(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return {};

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

  return {
    OR: [
      { prefix: { contains: trimmed, mode: "insensitive" } },
      { number: { contains: trimmed, mode: "insensitive" } },
      { title: { contains: trimmed, mode: "insensitive" } },
    ],
  };
}

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
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/courses] error", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
