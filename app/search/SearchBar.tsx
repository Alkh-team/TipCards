"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5"
    >
      <svg
        className="h-4 w-4 shrink-0 text-neutral-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
        />
      </svg>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search cards and creators…"
        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="text-neutral-500 hover:text-neutral-300"
        >
          ✕
        </button>
      )}
    </form>
  );
}
