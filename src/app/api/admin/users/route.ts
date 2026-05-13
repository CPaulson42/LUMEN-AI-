import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import Stripe from 'stripe';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const getRetellClient = () => {
  const apiKey = process.env.RETELL_API_KEY?.trim() || 'missing_key_check_env_vars';
  return new Retell({ apiKey });
};

const getStripeClient = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-03-25.dahlia',
  });
};

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
      .select('id, subscription_status, stripe_subscription_id, plan_name');

    // Build a map of subscription_id -> plan name by querying Stripe once per unique sub
    const stripe = getStripeClient();
    const subToPlanName: Record<string, string> = {};

    const uniqueSubIds = [...new Set(
      (profiles || [])
        .map((p: any) => p.stripe_subscription_id)
        .filter(Boolean)
    )];

    await Promise.all(
      uniqueSubIds.map(async (subId: string) => {
        // If plan_name already stored, use it
        const existingProfile = (profiles || []).find((p: any) => p.stripe_subscription_id === subId);
        if (existingProfile?.plan_name) {
          subToPlanName[subId] = existingProfile.plan_name;
          return;
        }
        // Otherwise look it up from Stripe
        try {
          const subscription = await stripe.subscriptions.retrieve(subId, {
            expand: ['items.data.price.product'],
          });
          const product = subscription.items.data[0]?.price?.product as Stripe.Product;
          if (product?.name) {
            subToPlanName[subId] = product.name;
            // Backfill plan_name in DB so we don't need to look it up next time
            await adminSupabase
              .from('profiles')
              .update({ plan_name: product.name })
              .eq('stripe_subscription_id', subId);
          }
        } catch (e) {
          console.warn(`[AdminAPI] Could not fetch plan name for sub ${subId}:`, e);
        }
      })
    );

    // Build profile map
    const profileMap: Record<string, { status: string; tier: string }> = {};
    (profiles || []).forEach((p: any) => {
      let tier = 'Free';
      if (p.stripe_subscription_id && subToPlanName[p.stripe_subscription_id]) {
        tier = subToPlanName[p.stripe_subscription_id];
      } else if (p.plan_name) {
        tier = p.plan_name;
      } else if (p.subscription_status === 'active') {
        tier = 'Paid';
      }
      profileMap[p.id] = {
        status: p.subscription_status || 'free',
        tier,
      };
    });

    // Fetch all global calls from Retell for usage calculation
    const retell = getRetellClient();
    let allCalls: any[] = [];
    try {
      allCalls = await retell.call.list({ filter_criteria: {} });
    } catch (e) {
      console.warn('[AdminAPI] Failed to fetch Retell calls:', e);
    }

    const usageMap: Record<string, number> = {};
    for (const c of allCalls) {
      const uId = c.metadata?.user_id || c.retell_custom_call_data?.user_id || c.retell_custom_data?.user_id;
      if (uId && c.start_timestamp && c.end_timestamp) {
        if (!usageMap[uId]) usageMap[uId] = 0;
        usageMap[uId] += (c.end_timestamp - c.start_timestamp);
      }
    }

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

    return NextResponse.json({ users: usersData });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}
