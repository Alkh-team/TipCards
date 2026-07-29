"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId:       string;
  initialCount: number;
  initialLiked: boolean;
}

export function LikeButton({ postId, initialCount, initialLiked }: LikeButtonProps) {
  const { data: session } = useSession();
  const router  = useRouter();
  const [liked,   setLiked]   = useState(initialLiked);
  const [count,   setCount]   = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) { router.push("/auth/login"); return; }
    if (loading) return;

    // Optimistic update
    const next = !liked;
    setLiked(next);
    setCount((c) => next ? c + 1 : Math.max(0, c - 1));

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) {
        // Revert on failure
        setLiked(!next);
        setCount((c) => !next ? c + 1 : Math.max(0, c - 1));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={liked ? "Unlike" : "Like"}
      className={`flex items-center gap-1.5 text-sm transition-colors disabled:opacity-60 ${
        liked ? "text-red-400" : "text-neutral-400 hover:text-red-400"
      }`}
    >
      <span className="text-base leading-none">{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
