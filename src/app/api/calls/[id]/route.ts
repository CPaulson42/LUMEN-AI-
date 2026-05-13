import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const callResponse = await retell.call.retrieve(id);
    return NextResponse.json(callResponse);
  } catch (error) {
    console.error('Failed to retrieve Retell call details:', error);
    return NextResponse.json({ error: 'Failed to retrieve call details' }, { status: 500 });
  }
}
