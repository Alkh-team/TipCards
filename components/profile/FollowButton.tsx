"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  username: string;
  initialIsFollowing: boolean;
}

/**
 * Follow / unfollow toggle button.
 * Redirects to login if the viewer is not authenticated.
 * Calls router.refresh() after a successful toggle so the
 * server-rendered follower count re-fetches.
 */
export function FollowButton({ username, initialIsFollowing }: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${username}/follow`, { method });
      if (res.ok) {
        setIsFollowing((prev) => !prev);
        router.refresh(); // re-fetch server component (updates follower count)
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
        isFollowing
          ? "border border-neutral-600 text-neutral-300 hover:border-red-500 hover:text-red-400"
          : "bg-indigo-600 text-white hover:bg-indigo-500"
      }`}
    >
      {loading ? "…" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
