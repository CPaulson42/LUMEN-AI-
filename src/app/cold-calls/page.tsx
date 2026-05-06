'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCampaigns, saveCampaign, deleteCampaign, type Campaign } from '@/lib/campaigns';
import { RetellWebClient } from 'retell-client-js-sdk';
import styles from './page.module.css';

interface RetellAgent {
  agent_id: string;
  name: string;
  voice: string;
}

interface GeneratedTest {
  agent: string;
  voiceId: string;
  goal: string;
  time: string;
  audioUrl: string;
}

export default function ColdCalls() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [agents, setAgents] = useState<RetellAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [goal, setGoal] = useState('Outbound');
  const [isTesting, setIsTesting] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [manualDialNumber, setManualDialNumber] = useState('');
  const [isDialing, setIsDialing] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [leadSource, setLeadSource] = useState('Upload CSV (Internal)');
  const [dailyVolume, setDailyVolume] = useState(500);
  const [uploadedNumbers, setUploadedNumbers] = useState<string[]>([]);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  // Fetch Retell agents on mount
  useEffect(() => {
    getCampaigns().then(setCampaigns);

    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        if (data.agents && data.agents.length > 0) {
          setAgents(data.agents);
          setSelectedAgentId(data.agents[0].agent_id);
        }
      })
      .catch(err => console.error('Failed to load Retell agents:', err));
  }, []);

  const selectedAgent = agents.find(a => a.agent_id === selectedAgentId);

  const handleTestAgent = async () => {
    if (!selectedAgentId) return;
    setIsTesting(true);
    try {
      // Force microphone permission prompt before anything else and release the stream immediately
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } else {
        throw new Error("Microphone access is not supported in this browser or requires HTTPS.");
      }

      const res = await fetch('/api/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.accessToken) throw new Error(data.error || 'Failed to start call');

      const client = new RetellWebClient();
      retellClientRef.current = client;

      client.on('call_started', () => {
        console.log('Call started successfully');
        setCallActive(true);
      });
      client.on('call_ended', () => {
        console.log('Call ended');
        setCallActive(false);
        retellClientRef.current = null;
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

      await client.startCall({ accessToken: data.accessToken });
    } catch (err: any) {
      console.error('Test call failed:', err);
      alert('Failed to start test call: ' + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualDial = async () => {
    if (!selectedAgentId || !manualDialNumber) {
      alert('Please select an agent and enter a valid phone number.');
      return;
    }
    
    setIsDialing(true);
    try {
      const res = await fetch('/api/make-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentId, toNumber: manualDialNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate phone call');
      
      alert('Outbound call initiated successfully! The entered phone number should ring shortly.');
      setManualDialNumber('');
    } catch (err: any) {
      console.error('Manual dial failed:', err);
      alert('Failed to initiate call: ' + err.message);
    } finally {
      setIsDialing(false);
    }
  };

  const handleEndCall = () => {
    retellClientRef.current?.stopCall();
    setCallActive(false);
    retellClientRef.current = null;
  };

  const parseCSV = (text: string): string[] => {
    let rawEntries: string[] = [];
    const trimmed = text.trim();

    // Detect JSON array format: ["...", "...", ...]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          rawEntries = parsed.map((item: any) => String(item).trim());
        }
      } catch {
        // Not valid JSON — strip brackets and split manually
        const stripped = trimmed.slice(1, -1);
        rawEntries = stripped.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
    } else {
      // Standard CSV/TXT: split by lines then by delimiters
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        const tl = line.trim();
        if (!tl) continue;

        // Skip obvious header rows
        const lower = tl.toLowerCase();
        if ((lower.includes('phone') || lower.includes('name') || lower.includes('email')) && tl.replace(/\D/g, '').length < 7) {
          continue;
        }

        // Split by comma, tab, pipe, or semicolon
        const cells = tl.split(/[,\t|;]/).map(c => c.trim().replace(/^["'\[\]]+|["'\[\]]+$/g, ''));
        rawEntries.push(...cells);

        // Also try the whole line in case it's one number per line
        rawEntries.push(tl);
      }
    }

    // Extract anything that looks like a phone number
    const numbers: string[] = [];
    for (const entry of rawEntries) {
      if (!entry) continue;
      // Strip wrapping characters
      const cleaned = entry.replace(/^[\[\]"'\s]+|[\[\]"'\s]+$/g, '').trim();
      const digitsOnly = cleaned.replace(/\D/g, '');
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
        numbers.push(cleaned);
      }
    }

    // Deduplicate based on digits only
    const seen = new Set<string>();
    return numbers.filter(n => {
      const key = n.replace(/\D/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.match(/\.(csv|txt|json)$/i)) {
      alert('Please upload a .csv, .txt, or .json file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const numbers = parseCSV(text);
      setUploadedNumbers(numbers);
      setUploadFileName(file.name);
      setLeadSource(`Uploaded: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Running' ? 'Paused' : 'Running';
    const campaignToUpdate = campaigns.find(c => c.id === id);
    if (campaignToUpdate) {
      await saveCampaign({ ...campaignToUpdate, status: newStatus });
      setCampaigns(await getCampaigns());
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign(id);
      setCampaigns(await getCampaigns());
    }
  };



  const handleLaunchCampaign = async () => {
    const newCampId = crypto.randomUUID();
    const newCamp: any = {
      id: newCampId,
      name: campaignName || 'New Campaign',
      lead_source: leadSource,
      daily_volume: dailyVolume,
      agent: selectedAgent?.name || 'Unknown',
      goal,
      concurrency: 10,
      status: 'Running',
      created_at: new Date().toISOString(),
      progress: 0,
      leads: dailyVolume,
    };
    
    await saveCampaign(newCamp);
    setCampaigns(await getCampaigns());
    setShowNewCampaignModal(false);
    setCampaignName('');
    router.push(`/cold-calls/campaign/${newCampId}`);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <section className={styles.statsGrid}>
          <div className={`${styles.statsCard} premium-card`}>
            <span className={styles.statsLabel}>Total Calls Made</span>
            <span className={styles.statsValue}>12,482</span>
            <span className={`${styles.statsTrend} ${styles.up}`}>+15% this week</span>
          </div>
          <div className={`${styles.statsCard} premium-card`}>
            <span className={styles.statsLabel}>Contact Rate</span>
            <span className={styles.statsValue}>42.5%</span>
            <span className={`${styles.statsTrend} ${styles.up}`}>+5% improvement</span>
          </div>
          <div className={`${styles.statsCard} premium-card`}>
            <span className={styles.statsLabel}>Leads Qualified</span>
            <span className={styles.statsValue}>892</span>
            <span className={`${styles.statsTrend} ${styles.up}`}>+22% this month</span>
          </div>
          <div className={`${styles.statsCard} premium-card`}>
            <span className={styles.statsLabel}>Avg. Qualify Time</span>
            <span className={styles.statsValue}>3m 12s</span>
            <span className={`${styles.statsTrend} ${styles.neutral}`}>Stable</span>
          </div>
        </section>

        <div className={styles.dashboardGrid}>
          <section className={styles.mainContent}>
            <div className={`${styles.campaignCard} glass-panel`}>
              <div className={styles.cardHeader}>
                <h2>Active Campaigns</h2>
                <button
                  onClick={() => setShowNewCampaignModal(true)}
                  className={styles.primaryButton}
                >
                  New Campaign
                </button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Campaign Name</th>
                      <th>Target List</th>
                      <th>Progress</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id}>
                        <td>
                          <span className={c.status === 'Running' ? styles.statusActive : styles.statusPaused}>
                            {c.status}
                          </span>
                        </td>
                        <td>{c.name}</td>
                        <td>{c.lead_source}</td>
                        <td>
                          {c.progress}%
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${c.progress}%` }}></div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link href={`/cold-calls/campaign/${c.id}`} className={styles.textButton}>
                              Manage
                            </Link>
                            <button onClick={() => handleToggleStatus(c.id, c.status)} className={styles.textButton}>
                              {c.status === 'Paused' ? 'Resume' : 'Pause'}
                            </button>
                            <button onClick={() => handleDelete(c.id)} className={styles.textButton} style={{ color: '#ef4444' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </section>

          <aside className={styles.sidebar}>
            <div className={`${styles.configCard} premium-card`}>
              <h3>Agent Configuration</h3>
              <p>Customize your AI caller&apos;s voice and behavior.</p>

              <div className={styles.configField}>
                <label>Active AI Agent</label>
                <select
                  className={styles.select}
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                  {agents.length === 0 && <option>Loading agents...</option>}
                  {agents.map(a => (
                    <option key={a.agent_id} value={a.agent_id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.configField}>
                <label>Call Goal</label>
                <select
                  className={styles.select}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option>Inbound</option>
                  <option>Outbound</option>
                </select>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>Live Outbound Test</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: '1rem' }}>Enter a real phone number to test the AI agent over the phone network.</p>
                
                <div className={styles.configField}>
                  <label>Phone Number (with +1)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="+1 555 123 4567" 
                    value={manualDialNumber}
                    onChange={(e) => setManualDialNumber(e.target.value)}
                  />
                </div>
                
                <button 
                  className={styles.primaryButton} 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={handleManualDial}
                  disabled={isDialing || !manualDialNumber}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  {isDialing ? 'Dialing...' : 'Make Live Call'}
                </button>
              </div>

            </div>


            <div className={`${styles.trustBadge} glass-panel`}>
              <div className={styles.badgeIcon}>
                <svg className="neon-blue-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div className={styles.badgeText}>
                <h4>TCPA Compliant</h4>
                <p>All calls follow automated outreach regulations.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showNewCampaignModal && (
        <div className={styles.modalOverlay} onClick={() => setShowNewCampaignModal(false)}>
          <div className={`${styles.modalContent} premium-card fade-in`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Campaign</h2>
              <button className={styles.closeButton} onClick={() => setShowNewCampaignModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Life Insurance Follow-up"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className={styles.input}
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Lead Source</label>
                <select className={styles.select} value={leadSource} onChange={e => setLeadSource(e.target.value)}>
                  <option>Upload CSV (Internal)</option>
                  <option>Import from CRM (Hubspot)</option>
                  <option>Select Existing List: Florida Leads</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Target Daily Volume</label>
                <input
                  type="number"
                  value={dailyVolume}
                  onChange={e => setDailyVolume(Number(e.target.value))}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Upload Phone Numbers</label>
                <div
                  className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''} ${uploadedNumbers.length > 0 ? styles.dropZoneSuccess : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {uploadedNumbers.length > 0 ? (
                    <div className={styles.uploadSuccess}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      <strong>{uploadedNumbers.length.toLocaleString()} numbers loaded</strong>
                      <span>{uploadFileName}</span>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <strong>Drag & drop your CSV here</strong>
                      <span>or click to browse · .csv, .txt, or .json</span>
                    </div>
                  )}
                </div>
                {uploadedNumbers.length > 0 && (
                  <div className={styles.numberPreview}>
                    <span className={styles.previewLabel}>Preview:</span>
                    <span className={styles.previewNumbers}>
                      {uploadedNumbers.slice(0, 5).join(' · ')}
                      {uploadedNumbers.length > 5 && ` · +${uploadedNumbers.length - 5} more`}
                    </span>
                    <button
                      className={styles.clearUpload}
                      onClick={(e) => { e.stopPropagation(); setUploadedNumbers([]); setUploadFileName(''); setLeadSource('Upload CSV (Internal)'); }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setShowNewCampaignModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={handleLaunchCampaign}
                >
                  Launch Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
