import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt", // JWT so credentials provider works with DB adapter
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  providers: [
    // ── Email / Password ──────────────────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.avatarUrl,
          plan: user.plan,
        };
      },
    }),

    // ── Google OAuth ──────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),

    // ── GitHub OAuth ──────────────────────────────────────────────────────
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],

  callbacks: {
    // Include user id, username, and plan in the JWT
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id       = user.id;
        token.username = (user as { username?: string }).username;
        token.plan     = (user as { plan?: string }).plan;
      }
      // Allow client-side updates (e.g. after username change)
      if (trigger === "update" && session) {
        if (session.plan)     token.plan     = session.plan;
        if (session.username) token.username = session.username;
      }
      // Always re-sync plan + username from DB so that:
      //   • OAuth users (no plan in OAuth profile) get their DB plan
      //   • Stripe upgrades are reflected without requiring a re-login
      if (token.id) {
        const fresh = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { plan: true, username: true },
        });
        if (fresh) {
          token.plan     = fresh.plan;
          token.username = fresh.username ?? (token.username as string | undefined);
        }
      }
      return token;
    },

    // Expose custom fields to the client-side session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },

    // Auto-create a username for OAuth users on first sign-in
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (!existing) {
          // Generate a username from the email prefix
          const base = user.email!.split("@")[0].replace(/[^a-z0-9]/gi, "");
          let username = base.toLowerCase().slice(0, 20);
          // Ensure uniqueness
          const taken = await prisma.user.findUnique({ where: { username } });
          if (taken) username = `${username}${Date.now().toString().slice(-4)}`;

          await prisma.user.create({
            data: {
              email: user.email!,
              username,
              name: user.name ?? null,
              avatarUrl: user.image ?? null,
            },
          });
        }
      }
      return true;
    },
  },
};
