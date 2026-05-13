import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import Stripe from 'stripe';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const getRetellClient = () => {
  return new Retell({
    apiKey: process.env.RETELL_API_KEY || 'missing_key_check_env_vars',
  });
};

const getStripeClient = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-03-25.dahlia',
  });
};

// Map known Stripe price IDs to plan names
function getPriceToPlanMap(): Record<string, string> {
  const map: Record<string, string> = {};
  if (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL) {
    map[process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL] = 'Professional';
  }
  if (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SCALE) {
    map[process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SCALE] = 'Scale';
  }
  if (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PARTNER) {
    map[process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PARTNER] = 'Partner';
  }
  return map;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase?.auth.getUser() || { data: { user: null } };

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = user.email?.toLowerCase().trim() === 'shrkfinancial@gmail.com';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\s/g, '');

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'System configuration error: Missing service role key.' }, { status: 500 });
    }

    const adminSupabase = createServiceClient(supabaseUrl, serviceRoleKey);

    // Fetch all users from Supabase Auth
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers();
    if (authError) {
      return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 500 });
    }

    // Fetch all profiles
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, email, subscription_status, stripe_customer_id, stripe_subscription_id');

    const priceToPlan = getPriceToPlanMap();

    // Resolve tier for each profile via Stripe subscription -> price ID -> plan name
    const stripe = getStripeClient();
    const profileMap: Record<string, { status: string; tier: string }> = {};

    await Promise.all(
      (profiles || []).map(async (p: any) => {
        let tier = 'Free';

        if (p.stripe_subscription_id) {
          try {
            const subscription = await stripe.subscriptions.retrieve(p.stripe_subscription_id);
            const priceId = subscription.items.data[0]?.price?.id;
            if (priceId && priceToPlan[priceId]) {
              tier = priceToPlan[priceId];
            } else if (p.subscription_status === 'active') {
              tier = 'Paid';
            }
          } catch {
            // Stripe lookup failed — fall back to subscription status
            if (p.subscription_status === 'active') tier = 'Paid';
            else if (p.subscription_status === 'past_due') tier = 'Past Due';
            else if (p.subscription_status === 'canceled') tier = 'Canceled';
          }
        } else if (p.subscription_status === 'active') {
          tier = 'Paid';
        }

        profileMap[p.id] = {
          status: p.subscription_status || 'free',
          tier,
        };
      })
    );

    // Fetch all calls from Retell for usage calculation
    const retell = getRetellClient();
    let allCalls: any[] = [];
    try {
      allCalls = await retell.call.list({ filter_criteria: {} });
    } catch (e) {
      console.warn('[AdminAPI] Failed to fetch Retell calls:', e);
    }

    // Map usage per user (requires metadata match) + total across all calls
    const usageMap: Record<string, number> = {};
    let totalMs = 0;
    for (const c of allCalls) {
      if (c.start_timestamp && c.end_timestamp) {
        totalMs += c.end_timestamp - c.start_timestamp;
      }
      const uId =
        c.metadata?.user_id ||
        c.retell_custom_call_data?.user_id ||
        c.retell_custom_data?.user_id;
      if (uId && c.start_timestamp && c.end_timestamp) {
        if (!usageMap[uId]) usageMap[uId] = 0;
        usageMap[uId] += c.end_timestamp - c.start_timestamp;
      }
    }
    const globalMinutes = Math.ceil(totalMs / 60000);

    // Combine everything
    const usersData = (authUsers || []).map((u: any) => {
      const ms = usageMap[u.id] || 0;
      const minutesUsed = Math.ceil(ms / 60000);
      const profile = profileMap[u.id];
      return {
        id: u.id,
        email: u.email,
        status: profile?.status || 'free',
        tier: profile?.tier || 'Free',
        minutesUsed,
      };
    });

    return NextResponse.json({ users: usersData, globalMinutes });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}
