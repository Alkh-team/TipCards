import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().max(50).optional(),
  bio: z.string().max(160).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores")
    .optional(),
  avatarUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

// PATCH /api/users/me — update the authenticated user's profile
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { username, socialLinks, ...rest } = parsed.data;

  // If changing username, check it is not already taken
  if (username && username !== session.user.username) {
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...rest,
      ...(username ? { username } : {}),
      ...(socialLinks !== undefined ? { socialLinks } : {}),
    },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      coverUrl: true,
      socialLinks: true,
      plan: true,
    },
  });

  return NextResponse.json(updated);
}
