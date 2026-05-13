import { NextResponse } from 'next/server';
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

    // Fetch users and profiles in parallel
    const [authResult, profilesResult] = await Promise.allSettled([
      adminSupabase.auth.admin.listUsers(),
      adminSupabase.from('profiles').select('id, subscription_status, stripe_subscription_id'),
    ]);

    if (authResult.status === 'rejected') {
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 });
    }
    const authUsers = (authResult.value as any).data?.users || [];
    const profiles: any[] = profilesResult.status === 'fulfilled'
      ? ((profilesResult.value as any).data || [])
      : [];

    // Resolve tier via Stripe price ID map
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

    const usersData = authUsers.map((u: any) => ({
      id: u.id,
      email: u.email,
      status: profileMap[u.id]?.status || 'free',
      tier: profileMap[u.id]?.tier || 'Free',
    }));

    return NextResponse.json({ users: usersData });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}
