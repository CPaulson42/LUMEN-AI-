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

    // Fetch calls. You can optionally pass filter_criteria in the object if needed.
    // E.g., retell.call.list({ filter_criteria: { agent_id: [...] } })
    const retell = getRetellClient();
    const callResponse = await retell.call.list({ filter_criteria: {} });
    console.log('[API/Calls] Fetched from Retell:', callResponse?.length || 0, 'calls');

    // Filter calls based on user privileges
    let filteredCalls = [...callResponse];
    if (!isAdmin) {
      filteredCalls = filteredCalls.filter((c: any) => {
        const metadataUserId = c.metadata?.user_id;
        const customDataUserId = c.retell_custom_call_data?.user_id;
        const phoneCustomDataUserId = c.retell_custom_data?.user_id;
        return metadataUserId === user.id || customDataUserId === user.id || phoneCustomDataUserId === user.id;
      });
    } else if (specificUserId) {
      filteredCalls = filteredCalls.filter((c: any) => {
        const metadataUserId = c.metadata?.user_id;
        const customDataUserId = c.retell_custom_call_data?.user_id;
        const phoneCustomDataUserId = c.retell_custom_data?.user_id;
        return metadataUserId === specificUserId || customDataUserId === specificUserId || phoneCustomDataUserId === specificUserId;
      });
    }
    
    // Sort calls so the newest are first
    const sortedCalls = filteredCalls.sort((a: any, b: any) => {
      const b_ts = b.start_timestamp || 0;
      const a_ts = a.start_timestamp || 0;
      return b_ts - a_ts;
    });

    // Grab the top 100 most recent calls for the dashboard
    const recentCalls = sortedCalls.slice(0, 100).map((c_raw: unknown) => {
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
      // Map to the format the dashboard expects
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
