require('dotenv').config({ path: '.env.local' });

async function main() {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
  });
  const data = await res.json();
  const voices = data.voices || [];
  console.log(`Found ${voices.length} voices:\n`);
  voices.slice(0, 25).forEach(v => {
    const labels = v.labels || {};
    console.log(`${v.voice_id} | ${v.name.padEnd(28)} | ${(labels.gender || '?').padEnd(8)} | ${(labels.accent || '?').padEnd(12)} | ${labels.use_case || '?'}`);
  });
}

main().catch(console.error);
