import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch calls. You can optionally pass filter_criteria in the object if needed.
    // E.g., retell.call.list({ filter_criteria: { agent_id: [...] } })
    const callResponse = await retell.call.list({ filter_criteria: {} });
    
    // Sort calls so the newest are first
    const sortedCalls = [...callResponse].sort((a: any, b: any) => 
      (b.start_timestamp || 0) - (a.start_timestamp || 0)
    );

    // Grab the top 10 most recent calls for the dashboard
    const recentCalls = sortedCalls.slice(0, 10).map((c: any) => {
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

    return NextResponse.json({ calls: recentCalls });
  } catch (error: any) {
    console.error('Retell call history fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch call history' }, { status: 500 });
  }
}
