import NextAuth from "next-auth";

// Extend NextAuth's built-in types to include our custom fields
declare module "next-auth" {
  interface User {
    id: string;
    username?: string;
    plan?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      plan?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    plan?: string;
  }
}
