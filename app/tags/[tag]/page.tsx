import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InfiniteFeed } from "@/components/feed/InfiniteFeed";
import type { PostFeedItem } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return { title: `#${tag} · CodeTip` };
}

const PAGE_SIZE = 12;

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [tagRecord, rawPosts] = await Promise.all([
    prisma.tag.findUnique({
      where: { name: tag },
      select: { name: true, _count: { select: { posts: true } } },
    }),
    prisma.post.findMany({
      where: { tags: { some: { tag: { name: tag } } } },
      include: {
        user: {
          select: { id: true, username: true, name: true, avatarUrl: true, plan: true },
        },
        tags: { include: { tag: true } },
        template: { select: { id: true, name: true, layoutType: true } },
      },
      orderBy: { likeCount: "desc" },
      take: PAGE_SIZE + 1,
    }),
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

  const initialPosts = posts.map((p) => ({
    ...p,
    isLiked: likedIds.has(p.id),
    isSaved: savedIds.has(p.id),
  })) as unknown as PostFeedItem[];

  const postCount = tagRecord?._count.posts ?? 0;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">#{tag}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {postCount} card{postCount !== 1 ? "s" : ""}
          </p>
        </div>

        {initialPosts.length === 0 ? (
          <p className="mt-20 text-center text-neutral-500">
            No cards tagged #{tag} yet.
          </p>
        ) : (
          <InfiniteFeed
            initialPosts={initialPosts}
            initialCursor={nextCursor}
            endpoint="/api/explore"
            extraParams={{ tag, sort: "popular" }}
          />
        )}
      </div>
    </main>
  );
}
