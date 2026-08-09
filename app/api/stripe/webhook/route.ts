import type Stripe from "stripe";

import { parsePaymentEvent, reducePaymentEvent } from "@/lib/orders";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/server";
import {
  applyOrderTransition,
  getOrderByPaymentIntentId,
} from "@/lib/webhook-data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    console.error("stripe webhook signature verification failed", error);
    return new Response("Signature verification failed", { status: 500 });
  }

  try {
    const dispatch = parsePaymentEvent(stripeEvent);
    if (dispatch === null) {
      return new Response("ok", { status: 200 });
    }

    const order = await getOrderByPaymentIntentId(dispatch.paymentIntentId);
    if (order === null) {
      console.error(
        `stripe webhook ${dispatch.event.type} for unknown payment intent ${dispatch.paymentIntentId}`,
      );
      return new Response("ok", { status: 200 });
    }

    const transition = reducePaymentEvent(order, dispatch.event);
    if (transition.noOp) {
      return new Response("ok", { status: 200 });
    }

    await applyOrderTransition(order, transition);
  } catch (error) {
    console.error("stripe webhook handling failed", error);
  }

  return new Response("ok", { status: 200 });
}
