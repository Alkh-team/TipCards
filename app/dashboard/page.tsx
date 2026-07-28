import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    username?: string;
    plan?: string;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user.name ?? user.username ?? "creator"} 👋
        </h1>
        <p className="text-neutral-400 text-sm">
          Current plan:{" "}
          <span
            className={`font-semibold ${
              user.plan === "FREE" ? "text-neutral-300" : "text-indigo-400"
            }`}
          >
            {user.plan ?? "FREE"}
          </span>
          {user.plan === "FREE" && (
            <>
              {" "}—{" "}
              <Link href="/pricing" className="text-indigo-400 hover:underline">
                Upgrade to Creator
              </Link>{" "}
              to start posting tip cards.
            </>
          )}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Create a Tip",
            desc: "Design and publish a new tip card",
            href: user.plan !== "FREE" ? "/create" : "/pricing?upgrade=1",
            locked: user.plan === "FREE",
          },
          {
            title: "My Designs",
            desc: "View and edit your saved tip cards",
            href: `/u/${user.username}`,
            locked: false,
          },
          {
            title: "Explore",
            desc: "Discover tips from the community",
            href: "/explore",
            locked: false,
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="relative rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-neutral-600 transition-colors group"
          >
            {card.locked && (
              <span className="absolute top-3 right-3 text-xs text-yellow-400 font-semibold bg-yellow-400/10 border border-yellow-400/20 rounded px-1.5 py-0.5">
                PRO
              </span>
            )}
            <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
              {card.title}
            </p>
            <p className="mt-1 text-sm text-neutral-400">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Phase 4+ will populate the feed here */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Your Feed</h2>
        <div className="rounded-xl border border-dashed border-neutral-800 py-16 text-center text-neutral-500">
          <p>Follow creators to see their tips here.</p>
          <Link href="/explore" className="mt-2 inline-block text-sm text-indigo-400 hover:underline">
            Explore the community →
          </Link>
        </div>
      </section>
    </div>
  );
}
