import Link from "next/link";
import Image from "next/image";
import type { PostFeedItem } from "@/types";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { LikeButton } from "./LikeButton";
import { SaveButton } from "./SaveButton";

interface PostFeedCardProps {
  post: PostFeedItem;
}

/** Full social card used in the feed and explore grids. */
export function PostFeedCard({ post }: PostFeedCardProps) {
  const bg = post.content?.background;
  const bgStyle: React.CSSProperties =
    bg?.type === "gradient"
      ? { background: bg.value }
      : bg?.type === "solid"
      ? { backgroundColor: bg.value }
      : { background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)" };

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-700">
      {/* ── Visual preview ─────────────────────────────────────────────── */}
      <Link href={`/posts/${post.id}`} className="block">
        <div className="relative aspect-square" style={bgStyle}>
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-5 text-center">
              <span className="line-clamp-3 text-base font-bold leading-snug text-white drop-shadow">
                {post.title}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Card footer ────────────────────────────────────────────────── */}
      <div className="space-y-2.5 px-3 py-3">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <UserAvatar
            src={post.user.avatarUrl}
            name={post.user.name}
            username={post.user.username}
            size={22}
          />
          <Link
            href={`/${post.user.username}`}
            className="truncate text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            @{post.user.username}
          </Link>
          <span className="ml-auto shrink-0 text-[10px] text-neutral-600">
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Title */}
        <Link href={`/posts/${post.id}`}>
          <p className="line-clamp-2 text-sm font-medium leading-snug text-white hover:text-neutral-200 transition-colors">
            {post.title}
          </p>
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.name}`}
                className="rounded-md bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-3 pt-0.5">
          <LikeButton
            postId={post.id}
            initialCount={post.likeCount}
            initialLiked={post.isLiked}
          />
          <Link
            href={`/posts/${post.id}#comments`}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label="Comments"
          >
            <span className="text-base leading-none">💬</span>
            <span>{post.commentCount}</span>
          </Link>
          <div className="ml-auto">
            <SaveButton postId={post.id} initialSaved={post.isSaved} />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function timeAgo(date: Date | string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)               return "now";
  const m = Math.floor(s / 60);
  if (m < 60)               return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)               return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 365)              return `${d}d`;
  return `${Math.floor(d / 365)}y`;
}
