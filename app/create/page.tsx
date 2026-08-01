import { getServerSession } from "next-auth";
import { redirect }         from "next/navigation";
import Link                 from "next/link";
import { authOptions }      from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { CreateTipEditor }  from "./CreateTipEditor";

export const metadata = { title: "Create Tip Card" };

export default async function CreatePage() {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/create");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { plan: true, username: true },
  });
  if (!user) redirect("/auth/login");

  // ── Subscription gate ─────────────────────────────────────────────────────
  if (user.plan === "FREE") {
    return <Paywall />;
  }

  // ── Editor ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="sticky top-14 z-10 border-b border-neutral-800 bg-neutral-950/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-sm font-bold text-white">New Tip Card</h1>
          <Link
            href="/dashboard"
            className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      <CreateTipEditor username={user.username ?? "you"} />
    </div>
  );
}

// ─── Paywall ──────────────────────────────────────────────────────────────────

function Paywall() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md space-y-6 text-center">

        {/* Lock icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 text-4xl">
          🔒
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Creator plan required</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            Publishing coding tip cards requires an active{" "}
            <span className="font-medium text-indigo-400">Creator</span> subscription ($5/month).
            Free accounts can browse, follow, like, comment, and save cards.
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-left text-sm text-neutral-300">
          {[
            "Create unlimited coding tip cards",
            "Auto-export to 1080×1080 PNG",
            "Custom colours & gradients",
            "5 developer layout types (code, do/don't, before/after…)",
            "Build a public developer profile & audience",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-indigo-400">✓</span> {f}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Upgrade to Creator
          </Link>
          <Link href="/" className="block text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
            Back to home
          </Link>
        </div>

      </div>
    </div>
  );
}
