import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ManageBillingButton } from "./ManageBillingButton";

export const metadata = { title: "Billing · Settings" };

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: [
    "Browse all coding tip cards",
    "Like, comment, and save cards",
    "Follow developers",
    "Public profile page",
  ],
  CREATOR: [
    "Everything in Free",
    "Unlimited coding tip card creation",
    "5 developer layout types",
    "Auto-export 1080×1080 PNG",
    "Tag cards for discovery",
    "Build a developer audience",
  ],
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { success } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, stripeCustomerId: true },
  });

  if (!user) redirect("/auth/login");

  const isPaid = user.plan !== "FREE";
  const features = PLAN_FEATURES[user.plan] ?? PLAN_FEATURES.FREE;

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="rounded-xl border border-green-700 bg-green-950/30 px-5 py-4">
          <p className="text-sm font-medium text-green-400">
            🎉 You&apos;re now on the {user.plan} plan — start creating tip cards!
          </p>
        </div>
      )}

      {/* Plan card */}
      <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Current Plan
            </p>
            <p className="mt-1 text-xl font-bold text-white">{user.plan}</p>
            <p className="mt-0.5 text-sm text-neutral-400">
              {isPaid ? "Active subscription" : "Free tier — limited to browsing"}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isPaid
                ? "bg-indigo-900/50 text-indigo-300"
                : "bg-neutral-800 text-neutral-400"
            }`}
          >
            {user.plan}
          </span>
        </div>

        {isPaid && user.stripeCustomerId ? (
          <ManageBillingButton />
        ) : (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Upgrade to Creator →
          </Link>
        )}
      </div>

      {/* Features */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <p className="mb-4 text-sm font-semibold text-white">Plan includes</p>
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
              <svg
                className="h-4 w-4 shrink-0 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-neutral-600">
        Payments are securely processed by Stripe. For billing support, email{" "}
        <a
          href="mailto:hello@codetip.app"
          className="text-neutral-400 transition-colors hover:text-white"
        >
          hello@codetip.app
        </a>
      </p>
    </div>
  );
}
