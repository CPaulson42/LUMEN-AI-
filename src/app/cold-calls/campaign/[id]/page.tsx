'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { getCampaignById, saveCampaign, deleteCampaign, type Campaign } from '@/lib/campaigns';
import { useRouter } from 'next/navigation';
import { RetellWebClient } from 'retell-client-js-sdk';
import styles from './page.module.css';



type CallRecord = {
  id: string | number;
  name: string;
  phone: string;
  status: string;
  duration: string;
  result: string | null;
  summary: string | null;
  recording?: string;
};

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [usageMinutes, setUsageMinutes] = useState(0);
  const [limitMinutes, setLimitMinutes] = useState(5000);
  const [scripts, setScripts] = useState<{ name: string; size: string; date: string }[]>([
    { name: 'Life_Insurance_Opener_v2.txt', size: '4.2 KB', date: 'Today, 9:00 AM' },
  ]);
  const [dragOver, setDragOver] = useState(false);
  const [agents, setAgents] = useState<{ agent_id: string, name: string }[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const callTickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        if (data.agents) setAgents(data.agents);
      })
      .catch(console.error);

    getCampaignById(id).then(found => {
      if (found) setCampaign(found);
    });
  }, [id]);

  // Fetch real calls from Retell
  useEffect(() => {
    const fetchCalls = () => {
      fetch('/api/calls')
        .then(res => res.json())
        .then(data => {
          if (data.calls) {
            setCalls(data.calls);
          }
          if (data.usageMinutes !== undefined) setUsageMinutes(data.usageMinutes);
          if (data.limitMinutes !== undefined) setLimitMinutes(data.limitMinutes);
        })
        .catch(console.error);
    };

    fetchCalls();
    // Poll every 5 seconds for live updates
    callTickRef.current = setInterval(fetchCalls, 5000);

    return () => clearInterval(callTickRef.current!);
  }, []);

  const handleFileUpload = (file: File) => {
    setScripts(prev => [{ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, date: 'Just now' }, ...prev]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleTogglePause = async () => {
    if (campaign) {
      const updated: Campaign = {
        ...campaign,
        status: campaign.status === 'Running' ? 'Paused' : 'Running'
      };
      await saveCampaign(updated);
      setCampaign(updated);
    }
  };

  const handleDelete = async () => {
    if (campaign && window.confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign(campaign.id);
      router.push('/cold-calls');
    }
  };
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');

  useEffect(() => {
    // Request permission silently to get real device labels
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const audioInputs = devices.filter(d => d.kind === 'audioinput');
          setMics(audioInputs);
          if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
        });
        // Keep stream active briefly to ensure permission sticks
        setTimeout(() => stream.getTracks().forEach(t => t.stop()), 1000);
      })
      .catch(err => console.warn('Microphone permission initially denied or not available.', err));

    // Initialize exactly once on the client side
    const client = new RetellWebClient();
    retellClientRef.current = client;

    client.on('call_started', () => {
      console.log('Call started successfully');
      setCallActive(true);
    });
    client.on('call_ended', () => {
      console.log('Call ended');
      setCallActive(false);
    });
    client.on('error', (err) => {
      console.error('Retell error:', err);
      setCallActive(false);
      alert('Call error: ' + err.message);
    });
    client.on('update', (update) => {
      console.log('Call update:', update);
    });
    client.on('agent_start_talking', () => {
      console.log('Agent started talking');
    });
    client.on('agent_stop_talking', () => {
      console.log('Agent stopped talking');
    });

    return () => {
      client.stopCall();
      client.removeAllListeners();
    };
  }, []);

  const handleTestAgent = async () => {
    let agentId = agents.find(a => a.name === campaign?.agent)?.agent_id;
    if (!agentId && agents.length > 0) agentId = agents[0].agent_id; // Fallback to first
    if (!agentId) {
      alert('Agent data not fully loaded yet. Please wait a moment.');
      return;
    }

    if (!retellClientRef.current) return;

    setIsTesting(true);

    try {
      const res = await fetch('/api/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.accessToken) throw new Error(data.error || 'Failed to start call');

      const startConfig: any = { accessToken: data.accessToken };
      if (selectedMic) startConfig.captureDeviceId = selectedMic;

      await retellClientRef.current.startCall(startConfig);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Failed to start test call: ' + message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleEndCall = () => {
    retellClientRef.current?.stopCall();
    setCallActive(false);
    retellClientRef.current = null;
  };

  const campaignName = campaign?.name ?? 'Campaign';
  const agentName = (campaign?.agent && campaign.agent !== 'Unknown') ? campaign.agent : 'Life Insurance Specialist Agent Alex';
  const campaignGoal = campaign?.goal ?? 'Qualify Lead';
  const campaignConcurrency = campaign?.concurrency ?? 10;

  // Tie the visual status directly to the test call activity for the demo
  const campaignStatus = callActive ? 'Running' : 'Paused';


  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href="/cold-calls" className={styles.backLink}>
          ← Back to Campaigns
        </Link>
        <div className={styles.campaignMeta}>
          <h1>{campaignName}</h1>
          <span className={`${styles.statusBadge} ${campaignStatus === 'Running' ? styles.statusRunning : styles.statusPaused}`}>
            {campaignStatus === 'Running' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ marginRight: '6px', color: '#10b981' }}><circle cx="12" cy="12" r="10"></circle></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ marginRight: '6px', color: '#f59e0b' }}><circle cx="12" cy="12" r="10"></circle></svg>
            )}
            {campaignStatus}
          </span>
        </div>
        <div className={styles.topStats}>
          <div className={styles.topStat}><span>Total</span><strong>{calls.length}</strong></div>
          <div className={styles.topStat}><span>Qualified</span><strong className={styles.green}>{calls.filter(c => c.result === 'qualified').length}</strong></div>
          <div className={styles.topStat}><span>In Progress</span><strong className={styles.blue}>{calls.filter(c => c.status === 'In Progress').length}</strong></div>
          <div className={styles.topStat}><span>Queued</span><strong>{calls.filter(c => c.status === 'Queued').length}</strong></div>
        </div>
      </div>

      <div className={styles.container}>
        {/* LEFT: Call Table */}
        <section className={styles.callSection}>
          <div className={`${styles.callTableCard} glass-panel`}>
            <div className={styles.sectionHeader}>
              <h2>Live Call Feed</h2>
              {callActive && <span className={styles.liveDot}><span></span>Live</span>}
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Duration</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map(call => (
                    <tr
                      key={call.id}
                      className={styles.callRow}
                      onClick={() => router.push(`/cold-calls/campaign/${id}/lead/${call.id}`)}
                    >
                      <td>
                        <span className={
                          call.status === 'In Progress' ? styles.statusInProgress :
                            call.status === 'Successful' ? styles.statusQualified :
                              call.status === 'Unsuccessful' ? styles.statusNotInterested :
                                styles.statusQueued
                        }>{call.status}</span>
                      </td>
                      <td className={styles.nameCell}>{call.name}</td>
                      <td className={styles.phoneCell}>{call.phone}</td>
                      <td className={`${styles.durationCell} ${call.status === 'In Progress' ? styles.durationTicking : ''}`}>{call.duration}</td>
                      <td>
                        {call.result === 'successful' && <span className={styles.resultGood}>
                          <svg className="neon-blue-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><polyline points="20 6 9 17 4 12"></polyline></svg> Successful
                        </span>}
                        {call.result === 'unsuccessful' && <span className={styles.resultBad}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Unsuccessful
                        </span>}
                        {!call.result && <span className={styles.resultPending}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* RIGHT: Script Upload Sidebar */}
        <aside className={styles.sidebar}>

          <div className={`${styles.agentStatusCard} glass-panel`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>AI Minutes</h3>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '2rem',
                background: 'rgba(0,255,255,0.08)',
                color: '#22d3ee',
                border: '1px solid rgba(0,255,255,0.2)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>{limitMinutes === 10000 ? 'Partner' : 'Scale'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>Used this month</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>{usageMinutes.toLocaleString()} <span style={{ color: 'var(--secondary)', fontWeight: 400 }}>/ {limitMinutes.toLocaleString()}</span></span>
            </div>
            <div style={{
              height: '6px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '0.5rem',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, (usageMinutes / limitMinutes) * 100))}%`,
                background: 'linear-gradient(90deg, #007fff, #22d3ee)',
                borderRadius: '999px',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{Math.max(0, limitMinutes - usageMinutes).toLocaleString()} min remaining</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>$0.15/min overage</span>
            </div>
          </div>

          <div className={`${styles.agentStatusCard} glass-panel`}>
            <h3>Agent Status</h3>
            <div className={styles.agentRow}>
              <div className={styles.agentDot}></div>
              <div>
                <strong>{agentName}</strong>
                <p>Goal: {campaignGoal} · {campaignConcurrency} Lines Active</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', marginTop: '1rem' }}>

              <div className={styles.configField} style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem' }}>Microphone</label>
                <select
                  className={styles.select}
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  style={{ backgroundColor: '#000000', color: '#3b82f6', borderColor: '#3b82f6', padding: '0.4rem', fontSize: '0.8rem' }}
                >
                  {mics.length === 0 ? <option value="">Default Microphone</option> : null}
                  {mics.map(m => (
                    <option key={m.deviceId} value={m.deviceId}>{m.label || `Microphone ${m.deviceId.slice(0, 4)}`}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {callActive ? (
                  <button className={styles.dangerButton} onClick={handleEndCall} style={{ flex: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="22" y1="2" x2="2" y2="22"></line></svg>
                    End Call
                  </button>
                ) : (
                  <button
                    className={styles.secondaryButton}
                    onClick={handleTestAgent}
                    disabled={isTesting}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    {isTesting ? 'Starting...' : 'Test Agent Call'}
                  </button>
                )}
              </div>
            </div>

            <button
              className={styles.pauseButton}
              onClick={handleDelete}
              style={{ marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Delete Campaign
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
