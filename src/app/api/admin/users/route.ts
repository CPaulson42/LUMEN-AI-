import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const getRetellClient = () => {
  return new Retell({
    apiKey: process.env.RETELL_API_KEY || 'missing_key_check_env_vars',
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[AdminAPI] Missing Supabase environment variables:', { 
        url: !!supabaseUrl, 
        key: !!serviceRoleKey 
      });
      return NextResponse.json({ error: 'System configuration error: Missing service role key.' }, { status: 500 });
    }

    // Initialize Supabase Admin client using Service Role Key to bypass RLS
    const adminSupabase = createServiceClient(supabaseUrl, serviceRoleKey);

    // Fetch all users from Auth (requires service role)
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('[AdminAPI] Auth list error:', authError);
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 });
    }

    console.log('[AdminAPI] Auth users found:', authUsers?.length || 0);

    // Fetch all profiles to get subscription status
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, subscription_status');

    const profileMap: Record<string, string> = {};
    (profiles || []).forEach(p => {
      profileMap[p.id] = p.subscription_status;
    });

    // Fetch all global calls from Retell
    const retell = getRetellClient();
    let allCalls: any[] = [];
    try {
      allCalls = await retell.call.list({ filter_criteria: {} });
      console.log('[AdminAPI] Global calls found:', allCalls?.length || 0);
    } catch (e) {
      console.warn('Failed to fetch Retell calls for admin dashboard:', e);
    }

    // Calculate usage per user id
    const usageMap: Record<string, number> = {};
    for (const c of allCalls) {
      const uId = c.metadata?.user_id || c.retell_custom_call_data?.user_id || c.retell_custom_data?.user_id;
      if (uId && c.start_timestamp && c.end_timestamp) {
        if (!usageMap[uId]) usageMap[uId] = 0;
        usageMap[uId] += (c.end_timestamp - c.start_timestamp);
      }
    }

    // Combine Auth data with Profile data and Usage
    const usersData = (authUsers || []).map((u: any) => {
      const ms = usageMap[u.id] || 0;
      const minutesUsed = Math.ceil(ms / 60000);
      return {
        id: u.id,
        email: u.email,
        status: profileMap[u.id] || 'free', // Fallback to free if no profile
        minutesUsed,
      };
    });

    return NextResponse.json({ users: usersData });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}
