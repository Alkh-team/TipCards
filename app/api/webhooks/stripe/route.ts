import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

/**
 * POST /api/webhooks/stripe
 * Handles Stripe lifecycle events to keep User.plan in sync.
 *
 * Events handled:
 *   checkout.session.completed      → upgrade to CREATOR
 *   customer.subscription.updated   → sync active/trialing → CREATOR, else FREE
 *   customer.subscription.deleted   → downgrade to FREE
 */
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing stripe-signature or STRIPE_WEBHOOK_SECRET" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        if (cs.mode === "subscription" && cs.client_reference_id) {
          await prisma.user.update({
            where: { id: cs.client_reference_id },
            data: {
              plan: Plan.CREATOR,
              stripeCustomerId: cs.customer as string,
              stripeSubscriptionId: cs.subscription as string,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const active = ["active", "trialing"].includes(sub.status);
        await prisma.user.update({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            plan: active ? Plan.CREATOR : Plan.FREE,
            stripeSubscriptionId: active ? sub.id : null,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { plan: Plan.FREE, stripeSubscriptionId: null },
        });
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return NextResponse.json({ error: "Internal handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
