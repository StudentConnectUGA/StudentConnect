// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Fields the user is allowed to edit via this route
type EditableUserFields = {
  name?: string | null;
  major?: string | null;
  year?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  phoneVisible?: boolean;
  meetingPrefs?: string | null;
  showGrades?: boolean;
  showCourses?: boolean;
  showTutorProfile?: boolean;
};

// GET /api/profile – returns the current user's profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      ugaId: true,
      major: true,
      year: true,
      bio: true,
      phoneNumber: true,
      phoneVisible: true,
      meetingPrefs: true,
      showGrades: true,
      showCourses: true,
      showTutorProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user }, { status: 200 });
}

// PATCH /api/profile – updates portions of the current user's profile
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: EditableUserFields | null = null;
  try {
    body = (await req.json()) as EditableUserFields;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 },
    );
  }

  const data: EditableUserFields = {};

  if (body.name !== undefined) data.name = body.name?.trim() || null;
  if (body.major !== undefined) data.major = body.major?.trim() || null;
  if (body.year !== undefined) data.year = body.year?.trim() || null;
  if (body.bio !== undefined) data.bio = body.bio?.trim() || null;
  if (body.phoneNumber !== undefined)
    data.phoneNumber = body.phoneNumber?.trim() || null;
  if (body.phoneVisible !== undefined)
    data.phoneVisible = !!body.phoneVisible;
  if (body.meetingPrefs !== undefined)
    data.meetingPrefs = body.meetingPrefs?.trim() || null;
  if (body.showGrades !== undefined) data.showGrades = !!body.showGrades;
  if (body.showCourses !== undefined) data.showCourses = !!body.showCourses;
  if (body.showTutorProfile !== undefined)
    data.showTutorProfile = !!body.showTutorProfile;

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        ugaId: true,
        major: true,
        year: true,
        bio: true,
        phoneNumber: true,
        phoneVisible: true,
        meetingPrefs: true,
        showGrades: true,
        showCourses: true,
        showTutorProfile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/profile] error", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}