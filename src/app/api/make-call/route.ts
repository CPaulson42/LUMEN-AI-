import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const retell = new Retell({
    apiKey: process.env.RETELL_API_KEY || '',
  });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };

    const { agentId, toNumber } = await req.json();

    if (!agentId || !toNumber) {
      return NextResponse.json({ error: 'agentId and toNumber are required' }, { status: 400 });
    }

    // 1. Fetch available phone numbers in the Retell account
    const phoneNumbers = await retell.phoneNumber.list();
    if (!phoneNumbers || phoneNumbers.length === 0) {
      return NextResponse.json({ error: 'No purchased phone numbers found in your Retell account to use as Caller ID.' }, { status: 400 });
    }

    const fromNumber = phoneNumbers[0].phone_number;

    const payload: any = {
      from_number: fromNumber,
      to_number: toNumber,
      override_agent_id: agentId, // Use the selected agent for this specific call
    };

    if (user) {
      payload.retell_custom_call_data = { user_id: user.id };
      payload.retell_custom_data = { user_id: user.id };
      payload.metadata = { user_id: user.id };
    }

    // 2. Initiate the outbound phone call
    const callResponse = await retell.call.createPhoneCall(payload);

    return NextResponse.json({ success: true, callId: callResponse.call_id });
  } catch (error) {
    console.error('Phone call error:', error);
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message || 'Failed to initiate phone call' }, { status: 500 });
  }
}
