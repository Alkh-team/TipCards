import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

// GET /api/feed?cursor=&limit=
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit  = Math.min(Number(searchParams.get("limit") ?? PAGE_SIZE), 50);

  // Include own posts in the feed
  const follows = await prisma.follow.findMany({
    where:  { followerId: session.user.id },
    select: { followingId: true },
  });
  const ids = [session.user.id, ...follows.map((f) => f.followingId)];

  const rows = await prisma.post.findMany({
    where:   { userId: { in: ids } },
    orderBy: { createdAt: "desc" },
    take:    limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user:  { select: { id: true, username: true, name: true, avatarUrl: true, plan: true } },
      tags:  { select: { tag: { select: { id: true, name: true } } } },
      template: { select: { id: true, name: true, layoutType: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
      saves: { where: { userId: session.user.id }, select: { id: true } },
    },
  });

  const hasMore    = rows.length > limit;
  const slice      = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? slice[slice.length - 1].id : null;

  const posts = slice.map(({ likes, saves, ...p }) => ({
    ...p,
    isLiked: likes.length > 0,
    isSaved: saves.length > 0,
  }));

  return NextResponse.json({ posts, nextCursor });
}
