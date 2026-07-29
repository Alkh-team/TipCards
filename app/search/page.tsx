import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { PostFeedCard } from "@/components/feed/PostFeedCard";
import type { PostFeedItem } from "@/types";

export const metadata = { title: "Search · TipCards" };

const PAGE_SIZE = 12;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type = "all" } = await searchParams;
  const query = q.trim();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let posts: PostFeedItem[] = [];
  let users: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    plan: string;
    bio: string | null;
    _count: { followers: number; posts: number };
  }[] = [];

  if (query) {
    const [rawPosts, rawUsers] = await Promise.all([
      type !== "users"
        ? prisma.post.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                {
                  tags: {
                    some: { tag: { name: { contains: query, mode: "insensitive" } } },
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
            take: PAGE_SIZE,
          })
        : Promise.resolve([]),

      type !== "posts"
        ? prisma.user.findMany({
            where: {
              OR: [
                { username: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
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

    users = rawUsers;

    if (userId && rawPosts.length > 0) {
      const ids = rawPosts.map((p) => p.id);
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
      const likedIds = new Set(likes.map((l) => l.postId));
      const savedIds = new Set(saves.map((s) => s.postId));
      posts = rawPosts.map((p) => ({
        ...p,
        isLiked: likedIds.has(p.id),
        isSaved: savedIds.has(p.id),
      })) as unknown as PostFeedItem[];
    } else {
      posts = rawPosts.map((p) => ({
        ...p,
        isLiked: false,
        isSaved: false,
      })) as unknown as PostFeedItem[];
    }
  }

  const totalResults = posts.length + users.length;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <SearchBar initialQuery={query} />

        {query ? (
          <>
            {/* Type filter tabs */}
            <div className="mt-5 flex items-center gap-6 border-b border-neutral-800 pb-0 text-sm">
              {(["all", "posts", "users"] as const).map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(query)}&type=${t}`}
                  className={`-mb-px border-b-2 pb-3 capitalize transition-colors ${
                    type === t
                      ? "border-indigo-500 font-semibold text-white"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  {t}
                </Link>
              ))}
            </div>

            <p className="mt-4 text-sm text-neutral-500">
              {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>

            {/* People */}
            {users.length > 0 && type !== "posts" && (
              <section className="mt-8">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  People
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {users.map((u) => (
                    <Link
                      key={u.id}
                      href={`/${u.username}`}
                      className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:bg-neutral-800"
                    >
                      <UserAvatar
                        name={u.name ?? u.username}
                        avatarUrl={u.avatarUrl}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {u.name ?? u.username}
                        </p>
                        <p className="truncate text-xs text-neutral-400">
                          @{u.username} · {u._count.posts} posts ·{" "}
                          {u._count.followers} followers
                        </p>
                      </div>
                      {u.plan !== "FREE" && (
                        <span className="shrink-0 rounded-full bg-indigo-900/50 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                          {u.plan}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Cards */}
            {posts.length > 0 && type !== "users" && (
              <section className="mt-8">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Cards
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((p) => (
                    <PostFeedCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <p className="mt-20 text-center text-neutral-500">
                No results found for &ldquo;{query}&rdquo;
              </p>
            )}
          </>
        ) : (
          <p className="mt-20 text-center text-neutral-500">
            Enter a search term above.
          </p>
        )}
      </div>
    </main>
  );
}
