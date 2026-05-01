export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebaseAdmin';

function tierFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!]:   'pro',
    [process.env.NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID!]: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!]:    'pro',
    [process.env.NEXT_PUBLIC_STRIPE_LAUNCH_PRICE_ID!]:    'pro',
  };
  return map[priceId] ?? 'pro';
}

function getSubId(invoice: Stripe.Invoice): string | null {
  const s = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
  if (!s) return null;
  return typeof s === 'string' ? s : s.id;
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] signature error', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.uid;
        if (!uid) break;

        const subId = typeof session.subscription === 'string'
          ? session.subscription : session.subscription?.id;
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const priceId = sub.items.data[0]?.price.id ?? '';
        const tier = tierFromPriceId(priceId);
        const endsAt = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000);

        await db.collection('users').doc(uid).update({
          subscription: tier,
          subscriptionStatus: 'active',
          stripeSubscriptionId: sub.id,
          subscriptionEndsAt: endsAt,
          trialUsed: true,
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = getSubId(invoice);
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const uid = sub.metadata?.uid;
        if (!uid) break;

        const endsAt = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000);
        await db.collection('users').doc(uid).update({
          subscriptionStatus: 'active',
          subscriptionEndsAt: endsAt,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = getSubId(invoice);
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const uid = sub.metadata?.uid;
        if (!uid) break;

        await db.collection('users').doc(uid).update({ subscriptionStatus: 'canceling' });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.uid;
        if (!uid) break;

        await db.collection('users').doc(uid).update({
          subscription: 'expired',
          subscriptionStatus: 'cancelled',
          stripeSubscriptionId: null,
          subscriptionEndsAt: null,
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.uid;
        if (!uid) break;

        const raw = sub as unknown as { current_period_end: number; cancel_at_period_end: boolean };
        const endsAt = new Date(raw.current_period_end * 1000);
        const status = raw.cancel_at_period_end ? 'canceling' : 'active';
        await db.collection('users').doc(uid).update({
          subscriptionStatus: status,
          subscriptionEndsAt: endsAt,
        });
        break;
      }
    }
  } catch (err) {
    console.error('[webhook] handler error', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
