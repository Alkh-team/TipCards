import { getServerSession } from "next-auth";
import { redirect }         from "next/navigation";
import Link                 from "next/link";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { InfiniteFeed }     from "@/components/feed/InfiniteFeed";
import type { PostFeedItem } from "@/types";

export const metadata = { title: "Feed" };

const PAGE_SIZE = 12;

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/feed");

  // IDs of users the viewer follows (+ own posts)
  const follows = await prisma.follow.findMany({
    where:  { followerId: session.user.id },
    select: { followingId: true },
  });
  const ids = [session.user.id, ...follows.map((f) => f.followingId)];

  const rows = await prisma.post.findMany({
    where:   { userId: { in: ids } },
    orderBy: { createdAt: "desc" },
    take:    PAGE_SIZE + 1,
    include: {
      user:     { select: { id: true, username: true, name: true, avatarUrl: true, plan: true } },
      tags:     { select: { tag: { select: { id: true, name: true } } } },
      template: { select: { id: true, name: true, layoutType: true } },
      likes:    { where: { userId: session.user.id }, select: { id: true } },
      saves:    { where: { userId: session.user.id }, select: { id: true } },
    },
  });

  const hasMore    = rows.length > PAGE_SIZE;
  const slice      = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? slice[slice.length - 1].id : null;

  const posts: PostFeedItem[] = slice.map(({ likes, saves, ...p }) => ({
    ...(p as Omit<typeof p, "likes" | "saves">),
    isLiked: likes.length > 0,
    isSaved: saves.length > 0,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Your Feed</h1>
        <Link
          href="/explore"
          className="text-sm text-indigo-400 hover:underline"
        >
          Explore all →
        </Link>
      </div>

      <InfiniteFeed
        initialPosts={posts}
        initialCursor={nextCursor}
        endpoint="/api/feed"
        emptyMessage={
          follows.length === 0
            ? "Follow some creators to see their tip cards here. Explore all posts →"
            : "No posts yet from people you follow."
        }
      />
    </div>
  );
}
