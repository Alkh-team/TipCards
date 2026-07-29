import { getServerSession }  from "next-auth";
import { authOptions }       from "@/lib/auth";
import { prisma }            from "@/lib/prisma";
import { InfiniteFeed }      from "@/components/feed/InfiniteFeed";
import { ExploreFilters }    from "./ExploreFilters";
import type { PostFeedItem }  from "@/types";

export const metadata = { title: "Explore" };

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ sort?: string; tag?: string }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const { sort: rawSort = "recent", tag = "" } = await searchParams;
  const sort = rawSort === "popular" ? "popular" : "recent";

  const session = await getServerSession(authOptions);

  const rows = await prisma.post.findMany({
    where: tag
      ? { tags: { some: { tag: { name: tag.toLowerCase() } } } }
      : undefined,
    orderBy: sort === "popular" ? { likeCount: "desc" } : { createdAt: "desc" },
    take: PAGE_SIZE + 1,
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

  // Fetch popular tags for filter chips
  const popularTags = await prisma.tag.findMany({
    orderBy: { posts: { _count: "desc" } },
    take: 12,
    select: { name: true, _count: { select: { posts: true } } },
  });

  const hasMore    = rows.length > PAGE_SIZE;
  const slice      = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? slice[slice.length - 1].id : null;

  const posts: PostFeedItem[] = slice.map((row: typeof rows[number]) => {
    const { likes, saves, ...p } = row as typeof row & {
      likes?: { id: string }[];
      saves?: { id: string }[];
    };
    return {
      ...(p as Omit<typeof p, "likes" | "saves">),
      isLiked: (likes?.length ?? 0) > 0,
      isSaved: (saves?.length ?? 0) > 0,
    };
  });

  const extraParams: Record<string, string> = { sort };
  if (tag) extraParams.tag = tag;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 space-y-4">
        <h1 className="text-xl font-bold text-white">Explore</h1>
        <ExploreFilters
          sort={sort}
          activeTag={tag}
          popularTags={popularTags.map((t) => t.name)}
        />
      </div>

      <InfiniteFeed
        key={`${sort}-${tag}`}
        initialPosts={posts}
        initialCursor={nextCursor}
        endpoint="/api/explore"
        extraParams={extraParams}
        emptyMessage="No tip cards found. Be the first to post one!"
      />
    </div>
  );
}
