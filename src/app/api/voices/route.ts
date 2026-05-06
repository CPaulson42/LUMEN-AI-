import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function GET() {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY || '',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch voices from ElevenLabs' },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Map to a cleaner format for the frontend
    const voices = (data.voices || []).map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
      gender: v.labels?.gender || 'unknown',
      accent: v.labels?.accent || 'unknown',
      use_case: v.labels?.use_case || 'general',
      preview_url: v.preview_url || null,
      description: v.labels?.description || '',
    }));

    // Add Jonathan Livingston voice manually if it's not already in the list
    if (!voices.some((v: any) => v.voice_id === 'PIGsltMj3gFMR34aFDI3')) {
      voices.push({
        voice_id: 'PIGsltMj3gFMR34aFDI3',
        name: 'Jonathan Livingston - Authentic, Calming & Pleasing',
        gender: 'male',
        accent: 'american',
        use_case: 'narrative_story',
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/database/workspace/ae5cf0d6fb064897b39505ab5988252a/voices/PIGsltMj3gFMR34aFDI3/YwBlqdNO99mqRJj1CJ5b.mp3',
        description: 'A calm, trustworthy, confident voice to narrate your story, audiobooks, articles and other media.',
      });
    }

    return NextResponse.json({ voices });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
