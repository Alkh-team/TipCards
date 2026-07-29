"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-xl">
          <span className="rounded-lg bg-indigo-600 px-2 py-0.5 text-white text-sm font-black tracking-tight">
            TIP
          </span>
          <span className="text-white">Cards</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
          {session && (
            <Link href="/feed" className="hover:text-white transition-colors">
              Feed
            </Link>
          )}
          <Link href="/explore" className="hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/templates" className="hover:text-white transition-colors">
            Templates
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-neutral-800" />
          ) : session ? (
            <>
              <Link
                href="/create"
                className="hidden md:inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                + Create
              </Link>

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-neutral-700 px-2 py-1 text-sm text-neutral-200 hover:border-neutral-500 transition-colors"
                >
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "avatar"}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold uppercase text-white">
                      {(session.user?.name ?? session.user?.email ?? "U")[0]}
                    </span>
                  )}
                  <span className="hidden md:block max-w-[120px] truncate">
                    {(session.user as { username?: string })?.username ??
                      session.user?.name}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-800 bg-neutral-900 py-1 shadow-xl">
                    <Link
                      href={`/${(session.user as { username?: string })?.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                    >
                      Dashboard
                    </Link>
                    <hr className="my-1 border-neutral-800" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-neutral-800"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
