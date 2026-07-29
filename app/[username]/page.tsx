import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { FollowButton } from "@/components/profile/FollowButton";
import { PostCard } from "@/components/cards/PostCard";
import type { PostWithAuthor } from "@/types";

interface Props {
  params: Promise<{ username: string }>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, bio: true },
  });
  if (!user) return { title: "Not Found" };
  return {
    title: user.name ?? `@${username}`,
    description: user.bio ?? `${username}'s tip cards on TipCards`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  // Fetch full profile in one query
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      coverUrl: true,
      socialLinks: true,
      plan: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) notFound();

  // Is the viewer following this profile?
  let isFollowing = false;
  if (session && session.user.id !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
      select: { id: true },
    });
    isFollowing = !!follow;
  }

  const isOwnProfile = session?.user.id === user.id;

  // Fetch latest 24 posts (no pagination yet — added in Phase 4)
  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      content: true,
      imageUrl: true,
      likeCount: true,
      commentCount: true,
      viewCount: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          plan: true,
        },
      },
      tags: {
        select: { tag: { select: { id: true, name: true } } },
      },
      template: {
        select: { id: true, name: true, layoutType: true },
      },
    },
  });

  const socialLinks = (user.socialLinks ?? {}) as Record<string, string>;

  return (
    <div className="min-h-screen pb-16">
      {/* ── Cover image ───────────────────────────────────────────────── */}
      <div className="relative h-48 w-full sm:h-64 bg-linear-to-br from-indigo-900 to-purple-900">
        {user.coverUrl && (
          <Image
            src={user.coverUrl}
            alt="Profile cover"
            fill
            priority
            className="object-cover"
          />
        )}
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {/* ── Profile header ──────────────────────────────────────────── */}
        <div className="relative -mt-14 flex items-end justify-between border-b border-neutral-800 pb-5">
          {/* Avatar — overlaps the cover */}
          <div className="ring-4 ring-neutral-950 rounded-full">
            <UserAvatar
              src={user.avatarUrl}
              name={user.name}
              username={user.username}
              size={96}
            />
          </div>

          {/* Action button */}
          <div className="flex gap-2 pb-1">
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="rounded-lg border border-neutral-700 px-4 py-1.5 text-sm font-medium text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
              >
                Edit Profile
              </Link>
            ) : (
              <FollowButton
                username={user.username}
                initialIsFollowing={isFollowing}
              />
            )}
          </div>
        </div>

        {/* ── User info ───────────────────────────────────────────────── */}
        <div className="space-y-3 py-5">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              {user.name ?? user.username}
              {user.plan !== "FREE" && (
                <span className="inline-flex items-center rounded-full border border-indigo-700 bg-indigo-900/60 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                  {user.plan}
                </span>
              )}
            </h1>
            <p className="text-sm text-neutral-400">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="max-w-lg text-sm leading-relaxed text-neutral-300">
              {user.bio}
            </p>
          )}

          <ProfileStats
            posts={user._count.posts}
            followers={user._count.followers}
            following={user._count.following}
          />

          <SocialLinks links={socialLinks} />
        </div>

        {/* ── Posts grid ──────────────────────────────────────────────── */}
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Tip Cards ({user._count.posts})
          </h2>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 py-24 text-center">
              <p className="text-neutral-500">No tip cards yet.</p>
              {isOwnProfile && (
                <Link
                  href="/create"
                  className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Create your first tip card
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as unknown as PostWithAuthor}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
