import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportCardToBuffer } from "@/lib/export-card";
import { uploadToR2 } from "@/lib/r2";
import { z } from "zod";

// ─── Validation schema ────────────────────────────────────────────────────────

const contentItemSchema = z.object({
  id:       z.string(),
  type:     z.enum(["text", "code", "bullet", "do", "dont", "before", "after"]),
  content:  z.string(),
  language: z.string().optional(),
  label:    z.string().optional(),
});

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.object({
    layoutType: z.enum([
      "do-dont", "before-after", "bullet-list",
      "quote", "code-tip", "comparison",
    ]),
    background: z.object({
      type:  z.enum(["solid", "gradient"]),
      value: z.string(),
    }),
    primaryColor:   z.string().default("#6366f1"),
    secondaryColor: z.string().default("#8b5cf6"),
    items:          z.array(contentItemSchema),
    branding: z
      .object({ handle: z.string(), logoUrl: z.string().optional() })
      .optional(),
  }),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

// ─── POST /api/posts ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Subscription gate — always read from DB (JWT plan can be stale) ──────
  const author = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { plan: true, username: true },
  });
  if (!author) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (author.plan === "FREE") {
    return NextResponse.json(
      { error: "Upgrade to Creator to publish tip cards" },
      { status: 403 }
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { title, content, tags } = parsed.data;

  // ── Upsert tags ──────────────────────────────────────────────────────────
  const tagRecords = await Promise.all(
    tags.map((name) =>
      prisma.tag.upsert({
        where:  { name: name.toLowerCase() },
        update: {},
        create: { name: name.toLowerCase() },
        select: { id: true },
      })
    )
  );

  // ── Create post record ───────────────────────────────────────────────────
  const post = await prisma.post.create({
    data: {
      userId:  session.user.id,
      title,
      content: content as object,
      tags:    { create: tagRecords.map((t) => ({ tagId: t.id })) },
    },
    select: { id: true },
  });

  // ── Export card image → R2 (fail-safe: errors do not abort the request) ──
  let imageUrl: string | null = null;
  try {
    const handle = author.username ?? "tipcards";

    const buffer = await exportCardToBuffer(
      { ...content, branding: { handle } } as Parameters<typeof exportCardToBuffer>[0],
      title,
      handle,
    );

    imageUrl = await uploadToR2(`posts/${post.id}.png`, buffer, "image/png");

    if (imageUrl) {
      await prisma.post.update({
        where: { id: post.id },
        data:  { imageUrl },
      });
    }
  } catch (err) {
    console.error("[api/posts] Image export/upload failed (post still created):", err);
    if (err instanceof Error) {
      console.error("[api/posts] Error details:", err.message, err.stack);
    }
  }

  return NextResponse.json({ id: post.id, imageUrl }, { status: 201 });
}
