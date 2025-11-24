// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import type { User as PrismaUser } from "@/lib/generated/prisma"; 


declare module "next-auth" {

  interface User extends PrismaUser {}


  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      ugaId?: string | null;
      major?: string | null;
      year?: string | null;
      bio?: string | null;
      phoneNumber?: string | null;
      phoneVisible: boolean;
      meetingPrefs?: string | null;

      showGrades: boolean;
      showCourses: boolean;
      showTutorProfile: boolean;
    };
  }
}
