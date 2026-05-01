export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const VALID_PRICE_IDS = new Set([
  process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_LAUNCH_PRICE_ID,
]);

export async function POST(req: NextRequest) {
  try {
    const { priceId, uid, email } = await req.json();

    if (!priceId || !uid || !email) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    if (!VALID_PRICE_IDS.has(priceId)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    let customerId: string = userData.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { uid } });
      customerId = customer.id;
      await db.collection('users').doc(uid).update({ stripeCustomerId: customerId });
    }

    const origin = req.headers.get('origin') ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: { uid },
      subscription_data: { metadata: { uid } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
