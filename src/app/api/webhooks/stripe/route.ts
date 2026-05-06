import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-03-25.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// Initialize Supabase Admin client with Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('⚠️  Webhook Error: Missing stripe-signature header.');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed:`, err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Successfully constructed event — now handle it.
  console.log(`✅ Webhook received: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (customerEmail) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ 
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active'
          })
          .eq('email', customerEmail);
          
        if (error) console.error('Error updating profile on checkout:', error);
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as any;
      const customerId = invoice.customer as string;

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_status: 'active'
        })
        .eq('stripe_customer_id', customerId);
        
      if (error) console.error('Error updating profile on invoice payment:', error);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any;
      const customerId = invoice.customer as string;

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_status: 'past_due'
        })
        .eq('stripe_customer_id', customerId);
        
      if (error) console.error('Error updating profile on payment failure:', error);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_status: 'canceled'
        })
        .eq('stripe_customer_id', customerId);
        
      if (error) console.error('Error updating profile on cancellation:', error);
      break;
    }

    default:
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
