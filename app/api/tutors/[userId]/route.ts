// app/api/tutors/[userId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteParams = {
    params: {
        userId: string;
    };
};

export async function GET(_req: Request, { params }: RouteParams) {
    const { userId } = await params;

    const session = await auth();

    // Require login
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized", message: "Please sign in to view this tutor's profile." },
            { status: 401 }
        );
    }


    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            major: true,
            year: true,
            bio: true,
            showTutorProfile: true,
            showGrades: true,
            phoneNumber: true,
            phoneVisible: true,
            meetingPrefs: true,
            contactMethods: {
                where: { visible: true },
                orderBy: [{ isPreferred: "desc" }, { createdAt: "asc" }],
                select: {
                    id: true,
                    platform: true,
                    identifier: true,
                    isPreferred: true,
                },
            },
            enrollments: {
                where: {
                    canTutor: true,
                    showAsTutor: true,
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            prefix: true,
                            number: true,
                            title: true,
                        },
                    },
                },
            },
        },
    });

    // Hide profile if user not found or has profile visibility off
    if (!user || !user.showTutorProfile) {
        return NextResponse.json(
            { error: "Not found", message: "Tutor profile not available." },
            { status: 404 }
        );
    }

    // You can strip showTutorProfile if you never need it on the client:
    const { showTutorProfile, ...safeUser } = user;

    return NextResponse.json(safeUser, { status: 200 });
}
