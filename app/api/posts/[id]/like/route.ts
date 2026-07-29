import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

// POST /api/posts/[id]/like
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: postId } = await params;

  const [existing, post] = await Promise.all([
    prisma.like.findUnique({
      where: { userId_postId: { userId: session.user.id, postId } },
      select: { id: true },
    }),
    prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    }),
  ]);

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  if (!existing) {
    await prisma.$transaction([
      prisma.like.create({ data: { userId: session.user.id, postId } }),
      prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
    ]);
    // Non-blocking notification (skip if liking own post)
    if (post.userId !== session.user.id) {
      prisma.notification
        .create({
          data: {
            userId: post.userId,
            actorId: session.user.id,
            type: NotificationType.LIKE,
            postId,
          },
        })
        .catch(console.error);
    }
  }

  return NextResponse.json({ liked: true });
}

// DELETE /api/posts/[id]/like
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: postId } = await params;

  const deleted = await prisma.like.deleteMany({
    where: { userId: session.user.id, postId },
  });

  if (deleted.count > 0) {
    await prisma.post.update({
      where: { id: postId },
      data:  { likeCount: { decrement: 1 } },
    });
  }

  return NextResponse.json({ liked: false });
}
