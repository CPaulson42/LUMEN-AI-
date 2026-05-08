import { NextResponse } from 'next/server';

// Fetch Grace and Alex directly by their known agent IDs
const AGENT_IDS = [
  { id: 'agent_4fe1583b02383dff1d7dcfc0fd', label: 'Alex' },
  { id: 'agent_9ffa15bd658832938ffa9629e2', label: 'Grace' },
];

export async function GET() {
  const RETELL_API_KEY = process.env.RETELL_API_KEY;
  try {
    const results = await Promise.all(
      AGENT_IDS.map(async ({ id, label }) => {
        const res = await fetch(`https://api.retellai.com/get-agent/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${RETELL_API_KEY}`,
          },
        });

        if (!res.ok) {
          console.error(`Failed to fetch agent ${id}:`, res.status);
          // Return a fallback using the label so it still shows up in the UI
          return { agent_id: id, name: label, voice: 'unknown' };
        }

        const agent = await res.json();
        return {
          agent_id: agent.agent_id,
          name: agent.agent_name || label,
          voice: agent.voice_id || 'unknown',
        };
      })
    );

    return NextResponse.json({ agents: results });
  } catch (error: any) {
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
