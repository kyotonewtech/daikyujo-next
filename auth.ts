import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider !== "google") {
        return false;
      }

      const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(",").map(
        (email) => email.trim()
      ) || [];

      if (!user.email || !allowedEmails.includes(user.email)) {
        console.warn(`Unauthorized login attempt: ${user.email}`);
        return false;
      }

      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.email = user.email;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
