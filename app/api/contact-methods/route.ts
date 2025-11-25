// app/api/contact-methods/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type EditableContactMethod = {
  platform?: string;
  identifier?: string;
  isPreferred?: boolean;
  visible?: boolean;
};

// GET /api/contact-methods – list current user's contact methods
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const methods = await prisma.contactMethod.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPreferred: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ methods }, { status: 200 });
}

// POST /api/contact-methods – create a new contact method
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: EditableContactMethod | null = null;
  try {
    body = (await req.json()) as EditableContactMethod;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const platform = body?.platform?.trim();
  const identifier = body?.identifier?.trim();

  if (!platform || !identifier) {
    return NextResponse.json(
      { error: "Platform and identifier are required" },
      { status: 400 },
    );
  }

  const isPreferred = !!body?.isPreferred;
  const visible = body?.visible ?? true;

  try {
    // If this is going to be preferred, clear others first
    if (isPreferred) {
      await prisma.contactMethod.updateMany({
        where: { userId: session.user.id, isPreferred: true },
        data: { isPreferred: false },
      });
    }

    const method = await prisma.contactMethod.create({
      data: {
        userId: session.user.id,
        platform,
        identifier,
        isPreferred,
        visible,
      },
    });

    return NextResponse.json({ method }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/contact-methods] error", error);
    return NextResponse.json(
      { error: "Failed to create contact method" },
      { status: 500 },
    );
  }
}
