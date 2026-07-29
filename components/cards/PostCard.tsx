import Link from "next/link";
import Image from "next/image";
import type { PostWithAuthor } from "@/types";
import { UserAvatar } from "@/components/profile/UserAvatar";

interface PostCardProps {
  post: PostWithAuthor;
  /** Show the author row at the bottom. Default true. */
  showAuthor?: boolean;
}

/**
 * A single tip-card tile shown in grids (profile, feed, explore).
 *
 * The visual preview uses the card's stored background colour/gradient.
 * Once Satori-generated imageUrl is available it renders that instead.
 */
export function PostCard({ post, showAuthor = true }: PostCardProps) {
  const bg = post.content?.background;
  const bgStyle: React.CSSProperties =
    bg?.type === "gradient"
      ? { background: bg.value }
      : bg?.type === "solid"
      ? { backgroundColor: bg.value }
      : { background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" };

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-700">
        {/* Visual preview */}
        <div className="relative aspect-square" style={bgStyle}>
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

        {/* Card footer */}
        <div className="space-y-2 px-3 py-3">
          <p className="line-clamp-2 text-sm font-medium text-white">{post.title}</p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-md bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Author + stats row */}
          <div className="flex items-center justify-between pt-1">
            {showAuthor && (
              <div className="flex min-w-0 items-center gap-1.5">
                <UserAvatar
                  src={post.user.avatarUrl}
                  name={post.user.name}
                  username={post.user.username}
                  size={20}
                />
                <span className="max-w-20 truncate text-xs text-neutral-400">
                  @{post.user.username}
                </span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-3 text-xs text-neutral-500">
              <span aria-label="Likes">♥ {post.likeCount}</span>
              <span aria-label="Comments">💬 {post.commentCount}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
