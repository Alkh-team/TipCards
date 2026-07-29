import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { UpgradeButton } from "./UpgradeButton";

export const metadata = { title: "Pricing · TipCards" };

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    per: "forever",
    description: "Browse and save tip cards from the community.",
    features: [
      "Browse the explore feed",
      "Save cards to your collection",
      "Follow creators",
      "Public profile page",
    ],
    highlight: false,
    soon: false,
  },
  {
    id: "creator",
    name: "Creator",
    price: "$9",
    per: "per month",
    description: "Publish unlimited tip cards and grow your audience.",
    features: [
      "Everything in Free",
      "Unlimited tip card creation",
      "5 layout types",
      "High-res PNG export",
      "Card tags & discovery",
      "Satori-powered card previews",
    ],
    highlight: true,
    soon: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    per: "per month",
    description: "Advanced analytics, white-label exports, and priority support.",
    features: [
      "Everything in Creator",
      "Analytics dashboard",
      "White-label exports",
      "Custom branding",
      "Priority support",
      "API access",
    ],
    highlight: false,
    soon: true,
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
          Start for free. Upgrade when you&apos;re ready to create.
        </p>
      </div>

      {/* Tier cards */}
      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              tier.highlight
                ? "border-indigo-500 bg-indigo-950/30 shadow-xl shadow-indigo-900/20"
                : "border-neutral-800 bg-neutral-900"
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}

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
            {tier.soon ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-neutral-800 px-4 py-2.5 text-sm font-semibold text-neutral-500"
              >
                Coming Soon
              </button>
            ) : tier.highlight ? (
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
          href="mailto:hello@tipcards.app"
          className="hover:text-neutral-400 transition-colors"
        >
          Questions?
        </a>
      </p>
    </main>
  );
}
