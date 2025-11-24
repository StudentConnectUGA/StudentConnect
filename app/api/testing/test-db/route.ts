// app/api/test-db/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userCount = await prisma.user.count();
  const courseCount = await prisma.course.count();
  const enrollmentCount = await prisma.enrollment.count();

  return Response.json({
    ok: true,
    userCount,
    courseCount,
    enrollmentCount,
  });
}
