import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
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

    // 2. Initiate the outbound phone call
    const callResponse = await retell.call.createPhoneCall({
      from_number: fromNumber,
      to_number: toNumber,
      override_agent_id: agentId, // Use the selected agent for this specific call
    });

    return NextResponse.json({ success: true, callId: callResponse.call_id });
  } catch (error: any) {
    console.error('Phone call error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initiate phone call' }, { status: 500 });
  }
}
