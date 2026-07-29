import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotificationType } from "@prisma/client";

const PAGE_SIZE = 20;

// GET /api/posts/[id]/comments?cursor=
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const cursor = new URL(req.url).searchParams.get("cursor") ?? undefined;

  const rows = await prisma.comment.findMany({
    where:   { postId },
    orderBy: { createdAt: "asc" },
    take:    PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id:        true,
      content:   true,
      createdAt: true,
      user: {
        select: { id: true, username: true, name: true, avatarUrl: true },
      },
    },
  });

  const hasMore    = rows.length > PAGE_SIZE;
  const slice      = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? slice[slice.length - 1].id : null;

  return NextResponse.json({ comments: slice, nextCursor });
}

// POST /api/posts/[id]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: postId } = await params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = z
    .object({ content: z.string().min(1).max(500) })
    .safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Comment cannot be empty (max 500 chars)" }, { status: 400 });
  }

  // Verify post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, userId: true },
  });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { userId: session.user.id, postId, content: parsed.data.content },
      select: {
        id:        true,
        content:   true,
        createdAt: true,
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.post.update({
      where: { id: postId },
      data:  { commentCount: { increment: 1 } },
    }),
  ]);

  // Non-blocking notification (skip if commenting on own post)
  if (post.userId !== session.user.id) {
    prisma.notification
      .create({
        data: {
          userId: post.userId,
          actorId: session.user.id,
          type: NotificationType.COMMENT,
          postId,
        },
      })
      .catch(console.error);
  }

  return NextResponse.json(comment, { status: 201 });
}
