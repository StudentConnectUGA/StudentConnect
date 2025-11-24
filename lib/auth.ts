// lib/auth.ts
import NextAuth, {NextAuthConfig, User} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { AdapterSession } from "next-auth/adapters";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "database",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // user.email comes from Google profile
      const email = user.email?.toLowerCase().trim();

      if (!email) return false;

      // only allow UGA emails
      if (!email.endsWith("@uga.edu")) {
        // log/inspect here 
        return false;
      }

      return true;
    },

    async session({ session, user }) {
      if (session.user) {
       if (session.user) {
      session.user.id = user.id;

      session.user.ugaId = user.ugaId;
      session.user.major = user.major;
      session.user.year = user.year;
      session.user.bio = user.bio;

      session.user.phoneNumber = user.phoneNumber;
      session.user.phoneVisible = user.phoneVisible;

      session.user.meetingPrefs = user.meetingPrefs;

      session.user.showGrades = user.showGrades;
      session.user.showCourses = user.showCourses;
      session.user.showTutorProfile = user.showTutorProfile;
    }
      }
      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);

console.log("Handlers:", handlers);
