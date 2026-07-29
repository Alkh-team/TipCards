"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  postId:       string;
  initialSaved: boolean;
}

export function SaveButton({ postId, initialSaved }: SaveButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved,   setSaved]   = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) { router.push("/auth/login"); return; }
    if (loading) return;

    const next = !saved;
    setSaved(next);

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/save`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) setSaved(!next); // revert on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove bookmark" : "Save post"}
      title={saved ? "Remove bookmark" : "Save"}
      className={`text-base leading-none transition-colors disabled:opacity-60 ${
        saved ? "text-indigo-400" : "text-neutral-400 hover:text-indigo-400"
      }`}
    >
      {saved ? "⊡" : "⊟"}
    </button>
  );
}
