"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

/** Bell icon with an unread-count badge. Fetches count on mount. */
export function NotificationBell() {
  const { status } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notifications/unread-count")
      .then((r) => r.json())
      .then((d: { count?: number }) => setCount(d.count ?? 0))
      .catch(() => {});
  }, [status]);

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
