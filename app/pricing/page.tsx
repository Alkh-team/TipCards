import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { UpgradeButton } from "./UpgradeButton";

export const metadata = { title: "Pricing · CodeTip" };

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    per: "forever",
    description: "Browse the community, comment on cards, and follow developers.",
    features: [
      "Browse and search all coding cards",
      "Like, comment, and save cards",
      "Follow your favourite developers",
      "Public profile page",
    ],
    highlight: false,
  },
  {
    id: "creator",
    name: "Creator",
    price: "$5",
    per: "per month",
    description: "Publish unlimited coding tip cards and grow your developer audience.",
    features: [
      "Everything in Free",
      "Unlimited coding tip card creation",
      "5 developer layout types",
      "Auto-export 1080×1080 PNG",
      "Tag cards for discovery",
      "Build a public developer profile",
    ],
    highlight: true,
  },
] as const;

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const plan = (session?.user as { plan?: string } | null)?.plan ?? null;
  const isPaid = plan && plan !== "FREE";

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16 text-white">
      {/* Header */}
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-neutral-400">
          Free to browse. $5/month to create and share your coding knowledge.
        </p>
      </div>

      {/* Tier cards */}
      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`flex flex-col rounded-2xl border p-8 ${
              tier.highlight
                ? "border-indigo-500 bg-indigo-950/30 shadow-xl shadow-indigo-900/20"
                : "border-neutral-800 bg-neutral-900"
            }`}
          >
            <div className="mb-6">
              <p className="text-sm font-medium text-neutral-400">{tier.name}</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-sm text-neutral-400">{tier.per}</span>
              </p>
              <p className="mt-3 text-sm text-neutral-400">{tier.description}</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-neutral-300"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {tier.highlight ? (
              isPaid ? (
                <Link
                  href="/settings/billing"
                  className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Manage Subscription
                </Link>
              ) : (
                <UpgradeButton className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60" />
              )
            ) : (
              <Link
                href="/auth/register"
                className="block w-full rounded-lg border border-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-800"
              >
                Get Started
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-neutral-500">
        Payments are securely processed by Stripe.{" "}
        <a
          href="mailto:hello@codetip.app"
          className="hover:text-neutral-400 transition-colors"
        >
          Questions?
        </a>
      </p>
    </main>
  );
}
