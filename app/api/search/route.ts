import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

/**
 * GET /api/search?q=&type=all|posts|users&cursor=
 * Full-text search across posts (title + tags) and users (username + name).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "all";
  const cursor = searchParams.get("cursor") ?? undefined;

  if (!q) {
    return NextResponse.json({ posts: [], users: [], nextCursor: null });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [rawPosts, users] = await Promise.all([
    type !== "users"
      ? prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              {
                tags: {
                  some: { tag: { name: { contains: q, mode: "insensitive" } } },
                },
              },
            ],
          },
          include: {
            user: {
              select: { id: true, username: true, name: true, avatarUrl: true, plan: true },
            },
            tags: { include: { tag: true } },
            template: { select: { id: true, name: true, layoutType: true } },
          },
          orderBy: { likeCount: "desc" },
          take: PAGE_SIZE + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        })
      : Promise.resolve([]),

    type !== "posts"
      ? prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            plan: true,
            bio: true,
            _count: { select: { followers: true, posts: true } },
          },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  let likedIds = new Set<string>();
  let savedIds = new Set<string>();
  if (userId && rawPosts.length > 0) {
    const ids = rawPosts.slice(0, PAGE_SIZE).map((p) => p.id);
    const [likes, saves] = await Promise.all([
      prisma.like.findMany({
        where: { userId, postId: { in: ids } },
        select: { postId: true },
      }),
      prisma.save.findMany({
        where: { userId, postId: { in: ids } },
        select: { postId: true },
      }),
    ]);
    likedIds = new Set(likes.map((l) => l.postId));
    savedIds = new Set(saves.map((s) => s.postId));
  }

  const hasMore = rawPosts.length > PAGE_SIZE;
  const posts = hasMore ? rawPosts.slice(0, PAGE_SIZE) : rawPosts;
  const nextCursor = hasMore ? posts[posts.length - 1].id : null;

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      isLiked: likedIds.has(p.id),
      isSaved: savedIds.has(p.id),
    })),
    users,
    nextCursor,
  });
}
