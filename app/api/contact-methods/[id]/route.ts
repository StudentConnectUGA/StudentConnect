// app/api/contact-methods/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

type EditableContactMethod = {
  platform?: string;
  identifier?: string;
  isPreferred?: boolean;
  visible?: boolean;
};

// PATCH /api/contact-methods/:id – update a contact method
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.contactMethod.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: EditableContactMethod | null = null;
  try {
    body = (await req.json()) as EditableContactMethod;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 },
    );
  }

  const data: EditableContactMethod = {};

  if (body.platform !== undefined) {
    data.platform = body.platform.trim();
  }
  if (body.identifier !== undefined) {
    data.identifier = body.identifier.trim();
  }
  if (body.visible !== undefined) {
    data.visible = !!body.visible;
  }

  const makePreferred = body.isPreferred === true;
  const clearPreferred = body.isPreferred === false;

  try {
    if (makePreferred) {
      // Clear existing preferred methods
      await prisma.contactMethod.updateMany({
        where: { userId: session.user.id, isPreferred: true },
        data: { isPreferred: false },
      });
      data.isPreferred = true;
    } else if (clearPreferred) {
      data.isPreferred = false;
    }

    const updated = await prisma.contactMethod.update({
      where: { id },
      data,
    });

    return NextResponse.json({ method: updated }, { status: 200 });
  } catch (error) {
    console.error(`[PATCH /api/contact-methods/${id}] error`, error);
    return NextResponse.json(
      { error: "Failed to update contact method" },
      { status: 500 },
    );
  }
}

// DELETE /api/contact-methods/:id
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.contactMethod.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.contactMethod.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`[DELETE /api/contact-methods/${id}] error`, error);
    return NextResponse.json(
      { error: "Failed to delete contact method" },
      { status: 500 },
    );
  }
}
