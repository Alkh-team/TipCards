"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PostFeedItem } from "@/types";
import { PostFeedCard } from "./PostFeedCard";

interface InfiniteFeedProps {
  initialPosts:  PostFeedItem[];
  initialCursor: string | null;
  endpoint:      string;             // e.g. "/api/feed"
  extraParams?:  Record<string, string>;
  emptyMessage?: string;
}

export function InfiniteFeed({
  initialPosts,
  initialCursor,
  endpoint,
  extraParams  = {},
  emptyMessage = "Nothing here yet.",
}: InfiniteFeedProps) {
  const [posts,   setPosts]   = useState<PostFeedItem[]>(initialPosts);
  const [cursor,  setCursor]  = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ cursor, ...extraParams });
      const res    = await fetch(`${endpoint}?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setPosts((prev) => [...prev, ...(data.posts as PostFeedItem[])]);
      setCursor(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, endpoint, extraParams]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  if (posts.length === 0 && !loading) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 py-20 text-center">
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((post) => (
          <PostFeedCard key={post.id} post={post} />
        ))}
      </div>

      {/* Scroll sentinel + loading indicator */}
      <div ref={sentinelRef} className="mt-8 flex justify-center py-4">
        {loading && (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        )}
        {!cursor && !loading && posts.length > 0 && (
          <p className="text-sm text-neutral-600">You're all caught up ✓</p>
        )}
      </div>
    </>
  );
}
