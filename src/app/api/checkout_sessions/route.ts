import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          // For metered billing, quantity might not be set or set to 1.
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${protocol}://${host}/billing/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${protocol}://${host}/pricing/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
