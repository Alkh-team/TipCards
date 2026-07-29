import { notFound }        from "next/navigation";
import Link                 from "next/link";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { TipCardPreview }   from "@/components/editor/TipCardPreview";
import { UserAvatar }       from "@/components/profile/UserAvatar";
import { LikeButton }       from "@/components/feed/LikeButton";
import { SaveButton }       from "@/components/feed/SaveButton";
import { CommentSection }   from "@/components/feed/CommentSection";
import type { TipCardContent, CommentWithAuthor } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where:  { id },
    select: { title: true, user: { select: { username: true } } },
  });
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: `Tip card by @${post.user.username}` };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const post = await prisma.post.findUnique({
    where: { id },
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

  if (!post) notFound();

  // Increment view count (fire-and-forget)
  prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  // Initial comments (first 20)
  const commentRows = await prisma.comment.findMany({
    where:   { postId: id },
    orderBy: { createdAt: "asc" },
    take:    21,
    select: {
      id:        true,
      content:   true,
      createdAt: true,
      user: { select: { id: true, username: true, name: true, avatarUrl: true } },
    },
  });
  const hasMoreComments = commentRows.length > 20;
  const initialComments: CommentWithAuthor[] = hasMoreComments
    ? commentRows.slice(0, 20)
    : commentRows;
  const commentCursor = hasMoreComments
    ? initialComments[initialComments.length - 1].id
    : null;

  const { likes, saves, ...postData } = post as typeof post & {
    likes?: { id: string }[];
    saves?: { id: string }[];
  };
  const isLiked = (likes?.length ?? 0) > 0;
  const isSaved = (saves?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-[1fr_380px]">

        {/* ── Left: card preview ─────────────────────────────────────── */}
        <div className="space-y-5">
          <TipCardPreview
            content={postData.content as TipCardContent}
            title={postData.title}
            username={postData.user.username}
            className="w-full shadow-2xl shadow-black/50"
          />

          {/* Tags */}
          {postData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {postData.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.name}`}
                  className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: meta + comments ─────────────────────────────────── */}
        <div className="space-y-6">
          {/* Author */}
          <div className="flex items-center gap-3">
            <UserAvatar
              src={postData.user.avatarUrl}
              name={postData.user.name}
              username={postData.user.username}
              size={40}
            />
            <div>
              <Link
                href={`/${postData.user.username}`}
                className="text-sm font-semibold text-white hover:underline"
              >
                {postData.user.name ?? postData.user.username}
              </Link>
              <p className="text-xs text-neutral-400">@{postData.user.username}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-white leading-snug">{postData.title}</h1>

          {/* Stats + actions */}
          <div className="flex items-center gap-4 border-y border-neutral-800 py-3">
            <LikeButton
              postId={id}
              initialCount={postData.likeCount}
              initialLiked={isLiked}
            />
            <span className="flex items-center gap-1.5 text-sm text-neutral-400">
              <span className="text-base leading-none">💬</span>
              {postData.commentCount}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-neutral-500">
              <span className="text-base leading-none">👁</span>
              {postData.viewCount}
            </span>
            <div className="ml-auto">
              <SaveButton postId={id} initialSaved={isSaved} />
            </div>
          </div>

          {/* Comments */}
          <CommentSection
            postId={id}
            initialComments={initialComments}
            initialCursor={commentCursor}
          />
        </div>

      </div>
    </div>
  );
}
