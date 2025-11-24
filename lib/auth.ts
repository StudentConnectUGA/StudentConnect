// lib/auth.ts
import NextAuth, {NextAuthConfig} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
        // extend session with the DB user id

        session.user.id = user.id;
      }
      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);

console.log("Handlers:", handlers);
