'use client';

import { useState, useEffect, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import styles from './page.module.css';

const RESTAURANT_AGENT_ID = 'agent_48e7c55e756084fd0c3975768e';

export default function RestaurantDemo() {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [agentTalking, setAgentTalking] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string; content: string }[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    // Request permission silently to get real device labels and ensure browser doesn't block audio
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const audioInputs = devices.filter(d => d.kind === 'audioinput');
          setMics(audioInputs);
          if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
        });
        setTimeout(() => stream.getTracks().forEach(t => t.stop()), 1000);
      })
      .catch(err => console.warn('Microphone permission initially denied or not available.', err));

    // Initialize the SDK exactly once
    const client = new RetellWebClient();
    retellClientRef.current = client;

    client.on('call_started', () => {
      console.log('Restaurant demo call started');
      setCallStatus('active');
    });

    client.on('call_ended', () => {
      console.log('Restaurant demo call ended');
      setCallStatus('idle');
      setAgentTalking(false);
    });

    client.on('error', (err) => {
      console.error('Retell error:', err);
      setCallStatus('error');
      setAgentTalking(false);
    });

    client.on('agent_start_talking', () => {
      setAgentTalking(true);
    });

    client.on('agent_stop_talking', () => {
      setAgentTalking(false);
    });

    client.on('update', (update: any) => {
      if (update && update.transcript) {
        setTranscript(update.transcript);
      }
    });

    return () => {
      client.stopCall();
      client.removeAllListeners();
    };
  }, []);

  const handleStartCall = async () => {
    if (!retellClientRef.current) return;
    setCallStatus('connecting');

    try {
      // Explicitly request microphone access first to ensure it is ready
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Fetch access token via backend to avoid exposing API keys
      const res = await fetch('/api/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: RESTAURANT_AGENT_ID }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.accessToken) {
        throw new Error(data.error || 'Failed to start demo call');
      }

      await retellClientRef.current.startCall({ 
        accessToken: data.accessToken,
        captureDeviceId: selectedMic || undefined
      });
    } catch (err) {
      console.error('Demo call failed:', err);
      setCallStatus('error');
      alert('Failed to start call. Please ensure your microphone is connected and permissions are granted.');
    }
  };

  const handleEndCall = () => {
    retellClientRef.current?.stopCall();
    setCallStatus('idle');
    setAgentTalking(false);
    // Transcript is intentionally NOT cleared here so the user can read it after the call ends.
  };

  const getStatusDisplay = () => {
    switch (callStatus) {
      case 'idle': return { text: 'Ready', className: '' };
      case 'connecting': return { text: 'Connecting...', className: styles.pulseDot };
      case 'active': return { 
        text: agentTalking ? 'Agent Speaking' : 'Listening...', 
        className: agentTalking ? `${styles.pulseDot} ${styles.agentTalking}` : `${styles.pulseDot} ${styles.active}` 
      };
      case 'error': return { text: 'Connection Error', className: `${styles.pulseDot} ${styles.error}` };
      default: return { text: '', className: '' };
    }
  };

  const status = getStatusDisplay();

  return (
    <main className={styles.container}>
      <div className={`${styles.demoCard} fade-in`}>
        <div className={styles.header}>
          <h1>Restaurant Virtual Assistant</h1>
          <p>Experience a live conversation with our restaurant booking agent.</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.statusIndicator}>
            {callStatus === 'active' && agentTalking ? (
              <div className={styles.voiceOrbWrapper}>
                <div className={styles.voiceOrb}></div>
              </div>
            ) : (
              <div className={status.className} />
            )}
            {status.text}
          </div>

          {callStatus === 'idle' || callStatus === 'error' ? (
            <button 
              className={styles.startButton} 
              onClick={handleStartCall}
              disabled={false}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Start Live Demo
            </button>
          ) : (
            <button className={styles.endButton} onClick={handleEndCall}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
              End Call
            </button>
          )}
        </div>

        <div className={styles.contextBox}>
          <h3>Demo Context</h3>
          <p>
            Try asking to book a table for 4 people this Friday at 7 PM.
          </p>
        </div>

        <div className={styles.micSelector}>
          <label>Select Microphone</label>
          <select 
            className={styles.micSelect} 
            value={selectedMic} 
            onChange={(e) => setSelectedMic(e.target.value)}
            disabled={callStatus !== 'idle' && callStatus !== 'error'}
          >
            {mics.length === 0 ? <option value="">Default Microphone</option> : null}
            {mics.map(m => (
              <option key={m.deviceId} value={m.deviceId}>{m.label || `Microphone ${m.deviceId.slice(0,4)}`}</option>
            ))}
          </select>
        </div>

        {transcript.length > 0 && (
          <div className={styles.transcriptBox}>
            {transcript.map((msg, idx) => (
              <div 
                key={idx} 
                className={`${styles.transcriptMessage} ${msg.role === 'agent' ? styles.agent : styles.user}`}
              >
                <span className={styles.transcriptRole}>{msg.role === 'agent' ? 'Restaurant Agent' : 'You'}</span>
                <div className={styles.transcriptContent}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
