import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Both "text" and "voiceId" are required.' },
        { status: 400 }
      );
    }

    // Cap text length to prevent abuse (roughly ~30 seconds of speech)
    const trimmedText = text.slice(0, 1000);

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY || '',
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('ElevenLabs TTS Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: res.status }
      );
    }

    // Stream the audio back as an mp3
    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message || 'TTS generation failed' }, { status: 500 });
  }
}
