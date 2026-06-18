import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createClient } from '@/utils/supabase/server';

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };

    const { agentId } = await req.json();

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const payload = { agent_id: agentId } as Retell.CallCreateWebCallParams;
    if (user) {
      payload.metadata = { user_id: user.id };
    }

    const data = await retell.call.createWebCall(payload);
    return NextResponse.json({ accessToken: data.access_token, callId: data.call_id });
  } catch (error) {
    const err = error as { message?: string };
    console.error('Retell createWebCall error:', err);
    return NextResponse.json({ error: err.message || 'Failed to start test call' }, { status: 500 });
  }
}
