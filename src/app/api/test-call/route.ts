import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const RETELL_API_KEY = process.env.RETELL_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };
    
    const { agentId } = await req.json();

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const payload: Record<string, any> = { agent_id: agentId };
    if (user) {
      payload.retell_custom_call_data = { user_id: user.id };
      payload.retell_custom_data = { user_id: user.id };
      payload.metadata = { user_id: user.id };
    }

    const res = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Retell create-web-call error:', err);
      return NextResponse.json({ error: 'Failed to create web call' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ accessToken: data.access_token, callId: data.call_id });
  } catch (error) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message || 'Failed to start test call' }, { status: 500 });
  }
}
