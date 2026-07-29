"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { CommentWithAuthor } from "@/types";
import { UserAvatar } from "@/components/profile/UserAvatar";

// ─── Public API ───────────────────────────────────────────────────────────────

interface CommentSectionProps {
  postId:          string;
  initialComments: CommentWithAuthor[];
  initialCursor:   string | null;
}

export function CommentSection({
  postId,
  initialComments,
  initialCursor,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments,   setComments]   = useState(initialComments);
  const [cursor,     setCursor]     = useState(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text,       setText]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Infinite scroll for older comments ─────────────────────────────────────
  useEffect(() => {
    if (!cursor || !bottomRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "100px" }
    );
    obs.observe(bottomRef.current);
    return () => obs.disconnect();
  });

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res  = await fetch(`/api/posts/${postId}/comments?cursor=${cursor}`);
      const data = await res.json();
      setComments((prev) => [...prev, ...data.comments]);
      setCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  // ── Add new comment ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to post comment");
        return;
      }

      const newComment: CommentWithAuthor = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="comments" className="space-y-5">
      <h2 className="text-sm font-semibold text-neutral-300">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* New comment form */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <UserAvatar
            src={session.user.image}
            name={session.user.name}
            username={session.user.username}
            size={32}
            className="shrink-0 mt-0.5"
          />
          <div className="flex-1 space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">{text.length}/500</span>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center text-sm text-neutral-400">
          <a href="/auth/login" className="text-indigo-400 hover:underline">Sign in</a> to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {comments.length === 0 && (
        <p className="text-sm text-neutral-500">No comments yet. Be the first!</p>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={bottomRef} className="flex justify-center py-2">
        {loadingMore && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        )}
      </div>
    </div>
  );
}

// ─── Single comment ───────────────────────────────────────────────────────────

function CommentItem({ comment }: { comment: CommentWithAuthor }) {
  return (
    <div className="flex gap-3">
      <UserAvatar
        src={comment.user.avatarUrl}
        name={comment.user.name}
        username={comment.user.username}
        size={32}
        className="shrink-0 mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <a
            href={`/${comment.user.username}`}
            className="text-xs font-semibold text-neutral-200 hover:underline"
          >
            @{comment.user.username}
          </a>
          <span className="text-xs text-neutral-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-neutral-300 wrap-break-word">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)  return "just now";
  const m = Math.floor(seconds / 60);
  if (m < 60)        return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)        return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)        return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}
