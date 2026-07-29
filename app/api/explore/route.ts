import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

// GET /api/explore?cursor=&limit=&sort=recent|popular&tag=
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit  = Math.min(Number(searchParams.get("limit") ?? PAGE_SIZE), 50);
  const sort   = searchParams.get("sort") === "popular" ? "popular" : "recent";
  const tag    = searchParams.get("tag") ?? undefined;

  const rows = await prisma.post.findMany({
    where: tag
      ? { tags: { some: { tag: { name: tag.toLowerCase() } } } }
      : undefined,
    orderBy: sort === "popular"
      ? { likeCount: "desc" }
      : { createdAt: "desc" },
    take:    limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user:     { select: { id: true, username: true, name: true, avatarUrl: true, plan: true } },
      tags:     { select: { tag: { select: { id: true, name: true } } } },
      template: { select: { id: true, name: true, layoutType: true } },
      ...(session
        ? {
            likes: { where: { userId: session.user.id }, select: { id: true } },
            saves: { where: { userId: session.user.id }, select: { id: true } },
          }
        : {}),
    },
  });

  const hasMore    = rows.length > limit;
  const slice      = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? slice[slice.length - 1].id : null;

  const posts = slice.map(({ likes, saves, ...p }: typeof rows[number]) => ({
    ...p,
    isLiked: (likes as { id: string }[] | undefined)?.length ? true : false,
    isSaved: (saves as { id: string }[] | undefined)?.length ? true : false,
  }));

  return NextResponse.json({ posts, nextCursor });
}
