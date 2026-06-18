import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

// Fetch Grace and Alex directly by their known agent IDs
const AGENT_IDS = [
  { id: 'agent_4fe1583b02383dff1d7dcfc0fd', label: 'Alex' },
  { id: 'agent_9ffa15bd658832938ffa9629e2', label: 'Grace' },
];

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export async function GET() {
  try {
    const results = await Promise.all(
      AGENT_IDS.map(async ({ id, label }) => {
        try {
          const agent = await retell.agent.retrieve(id);
          return {
            agent_id: agent.agent_id,
            name: agent.agent_name || label,
            voice: agent.voice_id || 'unknown',
          };
        } catch (err) {
          console.error(`Failed to fetch agent ${id}:`, err);
          // Return a fallback using the label so it still shows up in the UI
          return { agent_id: id, name: label, voice: 'unknown' };
        }
      })
    );

    return NextResponse.json({ agents: results });
  } catch (error: unknown) {
    console.error('Retell fetch error:', error);
    // Return fallback agents so UI still works
    return NextResponse.json({
      agents: AGENT_IDS.map(({ id, label }) => ({
        agent_id: id,
        name: label,
        voice: 'unknown',
      })),
    });
  }
}
