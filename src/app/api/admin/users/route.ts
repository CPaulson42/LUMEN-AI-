import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import Stripe from 'stripe';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getPriceToPlanMap(): Record<string, string> {
  return {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL || '']: 'Professional',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SCALE || '']: 'Scale',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PARTNER || '']: 'Partner',
  };
}

export async function GET() {
  try {
    // 1. Auth check
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase?.auth.getUser() || { data: { user: null } };
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = user.email?.toLowerCase().trim() === 'shrkfinancial@gmail.com';
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\s/g, '');
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing service role key.' }, { status: 500 });
    }

    const adminSupabase = createServiceClient(supabaseUrl, serviceRoleKey);

    // 2. Run all three data fetches IN PARALLEL
    const [authResult, profilesResult, callsResult] = await Promise.allSettled([
      adminSupabase.auth.admin.listUsers(),
      adminSupabase.from('profiles').select('id, subscription_status, stripe_subscription_id'),
      new Retell({ apiKey: process.env.RETELL_API_KEY || '' }).call.list({ filter_criteria: {} }),
    ]);

    // Auth users
    if (authResult.status === 'rejected') {
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 });
    }
    const authUsers = (authResult.value as any).data?.users || [];

    // Profiles
    const profiles: any[] = profilesResult.status === 'fulfilled'
      ? ((profilesResult.value as any).data || [])
      : [];

    // Calls
    const allCalls: any[] = callsResult.status === 'fulfilled'
      ? (callsResult.value as any[] || [])
      : [];

    console.log('[AdminAPI] authUsers:', authUsers.length, '| profiles:', profiles.length, '| calls:', allCalls.length);

    // 3. Resolve tier for each unique subscription ID from Stripe
    const priceToPlan = getPriceToPlanMap();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-03-25.dahlia',
    });

    const uniqueSubIds = [...new Set(profiles.map((p: any) => p.stripe_subscription_id).filter(Boolean))] as string[];
    const subToPlan: Record<string, string> = {};

    await Promise.all(
      uniqueSubIds.map(async (subId) => {
        try {
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price?.id || '';
          subToPlan[subId] = priceToPlan[priceId] || 'Paid';
        } catch {
          subToPlan[subId] = 'Paid';
        }
      })
    );

    // Build profile map
    const profileMap: Record<string, { status: string; tier: string }> = {};
    for (const p of profiles) {
      let tier = 'Free';
      if (p.stripe_subscription_id && subToPlan[p.stripe_subscription_id]) {
        tier = subToPlan[p.stripe_subscription_id];
      } else if (p.subscription_status === 'active') {
        tier = 'Paid';
      } else if (p.subscription_status === 'past_due') {
        tier = 'Past Due';
      } else if (p.subscription_status === 'canceled') {
        tier = 'Canceled';
      }
      profileMap[p.id] = { status: p.subscription_status || 'free', tier };
    }

    // 4. Calculate usage
    let totalMs = 0;
    const usageMap: Record<string, number> = {};
    for (const c of allCalls) {
      if (c.start_timestamp && c.end_timestamp) {
        const dur = c.end_timestamp - c.start_timestamp;
        totalMs += dur;
        const uId = c.metadata?.user_id || c.retell_custom_call_data?.user_id || c.retell_custom_data?.user_id;
        if (uId) {
          usageMap[uId] = (usageMap[uId] || 0) + dur;
        }
      }
    }
    const globalMinutes = Math.ceil(totalMs / 60000);

    // 5. Build response
    const usersData = authUsers.map((u: any) => ({
      id: u.id,
      email: u.email,
      status: profileMap[u.id]?.status || 'free',
      tier: profileMap[u.id]?.tier || 'Free',
      minutesUsed: Math.ceil((usageMap[u.id] || 0) / 60000),
    }));

    return NextResponse.json({ users: usersData, globalMinutes });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}
