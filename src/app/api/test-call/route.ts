import { NextRequest, NextResponse } from 'next/server';

const RETELL_API_KEY = process.env.RETELL_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { agentId } = await req.json();

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const res = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: agentId }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Retell create-web-call error:', err);
      return NextResponse.json({ error: 'Failed to create web call' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ accessToken: data.access_token, callId: data.call_id });
  } catch (error: any) {
    console.error('Test call error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
