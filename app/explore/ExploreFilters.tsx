"use client";

import { useRouter }   from "next/navigation";
import { useTransition } from "react";

interface ExploreFiltersProps {
  sort:       string;
  activeTag:  string;
  popularTags: string[];
}

export function ExploreFilters({ sort, activeTag, popularTags }: ExploreFiltersProps) {
  const router     = useRouter();
  const [, startT] = useTransition();

  function navigate(newSort: string, newTag: string) {
    const params = new URLSearchParams();
    if (newSort !== "recent") params.set("sort", newSort);
    if (newTag)               params.set("tag", newTag);
    startT(() => router.push(`/explore${params.size ? `?${params}` : ""}`));
  }

  return (
    <div className="space-y-3">
      {/* Sort buttons */}
      <div className="flex gap-2">
        {(["recent", "popular"] as const).map((s) => (
          <button
            key={s}
            onClick={() => navigate(s, activeTag)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              sort === s
                ? "bg-indigo-600 text-white"
                : "border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tag filter chips */}
      {popularTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeTag && (
            <button
              onClick={() => navigate(sort, "")}
              className="rounded-full border border-indigo-500 bg-indigo-900/40 px-3 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-900/60"
            >
              #{activeTag} ✕
            </button>
          )}
          {popularTags
            .filter((t) => t !== activeTag)
            .map((t) => (
              <button
                key={t}
                onClick={() => navigate(sort, t)}
                className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
              >
                #{t}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
