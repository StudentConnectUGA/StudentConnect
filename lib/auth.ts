// lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
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
        // @ts-expect-error – we are extending the default type
        session.user.id = user.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as authHandler };
