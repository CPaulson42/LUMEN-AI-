import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createClient } from '@/utils/supabase/server';

const getRetellClient = () => {
  return new Retell({
    apiKey: process.env.RETELL_API_KEY || 'missing_key_check_env_vars',
  });
};

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specificUserId = searchParams.get('userId');

    const supabase = await createClient();
    const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = user.email?.toLowerCase().trim() === 'shrkfinancial@gmail.com';
    console.log('[API/Calls] User Email:', user.email, '| isAdmin:', isAdmin);

    // Fetch calls - v5.32: use sort_order and limit for efficiency
    const retell = getRetellClient();
    const callResponse = await retell.call.list({
      filter_criteria: {},
      sort_order: 'descending',
      limit: 1000,
    });
    const items = callResponse.items || [];
    console.log('[API/Calls] Fetched from Retell:', items.length || 0, 'calls');

    // Filter calls based on user privileges
    // v5.32: metadata.user_id is the only supported field (retell_custom_call_data/retell_custom_data are deprecated)
    let filteredCalls = [...items];
    if (!isAdmin) {
      filteredCalls = filteredCalls.filter((c: any) => {
        const metadataUserId = c.metadata?.user_id;
        return metadataUserId === user.id;
      });
    } else if (specificUserId) {
      console.log('[API/Calls] Filtering for specific user:', specificUserId);
      filteredCalls = filteredCalls.filter((c: any) => {
        const metadataUserId = c.metadata?.user_id;
        return metadataUserId === specificUserId;
      });
      console.log('[API/Calls] Filtered calls length:', filteredCalls.length);
    }

    // Already sorted descending from the API, no need to re-sort
    // Grab the top 100 most recent calls for the dashboard
    const recentCalls = filteredCalls.slice(0, 100).map((c_raw: unknown) => {
      const c = c_raw as {
        call_id: string;
        to_number?: string;
        from_number?: string;
        start_timestamp?: number;
        end_timestamp?: number;
        call_status?: string;
        call_analysis?: {
          call_successful?: boolean;
          call_summary?: string;
        };
        recording_url?: string;
      };
      return {
        id: c.call_id,
        name: c.to_number || 'Web Call User',
        phone: c.from_number || c.to_number || 'Web Call',
        duration: c.start_timestamp && c.end_timestamp
          ? `${Math.floor((c.end_timestamp - c.start_timestamp) / 60000)}:${String(Math.floor(((c.end_timestamp - c.start_timestamp) / 1000) % 60)).padStart(2, '0')}`
          : '--',
        status: c.call_status === 'ongoing' ? 'In Progress'
          : c.call_status === 'ended' ? (c.call_analysis?.call_successful ? 'Successful' : 'Unsuccessful')
            : c.call_status === 'registered' ? 'Queued' : 'Error',
        result: c.call_status === 'ended' ? (c.call_analysis?.call_successful ? 'successful' : 'unsuccessful') : null,
        summary: c.call_analysis?.call_summary || 'No summary available',
        recording: c.recording_url,
      };
    });

    // Calculate total usage in minutes
    let totalUsageMs = 0;
    for (const call of filteredCalls) {
      if (call.start_timestamp && call.end_timestamp) {
        totalUsageMs += (call.end_timestamp - call.start_timestamp);
      }
    }
    const usageMinutes = Math.ceil(totalUsageMs / 60000);

    // Get user profile to determine limits
    let isPartner = false;
    if (supabase) {
      const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single();
      isPartner = profile?.subscription_status === 'active';
    }
    const limitMinutes = isPartner ? 10000 : 5000;

    return NextResponse.json({ calls: recentCalls, usageMinutes, limitMinutes });
  } catch (error) {
    console.error('Retell call history fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch call history' }, { status: 500 });
  }
}
