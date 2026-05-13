'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// Mock sub-agent database
const MOCK_AGENTS = [
  { id: 1, name: 'Michael Chen', email: 'michael@lumenseats.com', status: 'Active', minutesUsed: 1420, campaign: 'Q2 Life Insurance Core' },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@lumenseats.com', status: 'Active', minutesUsed: 890, campaign: 'Term Life Pilot' },
  { id: 3, name: 'David Rodriguez', email: 'david.r@lumenseats.com', status: 'Suspended', minutesUsed: 45, campaign: '--' },
  { id: 4, name: 'Emma Wilson', email: 'emma@lumenseats.com', status: 'Active', minutesUsed: 3100, campaign: 'High Net Worth Outbound' },
  { id: 5, name: 'James Taylor', email: 'james.t@lumenseats.com', status: 'Active', minutesUsed: 420, campaign: 'Q2 Life Insurance Core' },
];

export default function AdminPortalPage() {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const router = useRouter();

  const toggleStatus = (id: number) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === id) {
        return { ...agent, status: agent.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return agent;
    }));
  };

  const handleProvision = () => {
    alert("Backend Integration Required: This will open a modal to invite a new agent to your organization via email.");
  };

  const totalMinutes = agents.reduce((acc, curr) => acc + curr.minutesUsed, 0);
  const activeSeats = agents.filter(a => a.status === 'Active').length;

  return (
    <main className={styles.main}>

      <div className={styles.header}>
        <div>
          <h1>Partner Admin Console</h1>
          <p>Manage your organization&apos;s sub-agents, monitor global usage, and allocate campaign lines.</p>
        </div>
        <button className={styles.provisionBtn} onClick={handleProvision}>
          + Provision New Seat
        </button>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h3>Allocated Seats</h3>
          <strong>{activeSeats} <span style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>/ 100</span></strong>
          <span className={styles.kpiSub}>95 Seats Remaining</span>
        </div>

        <div className={styles.kpiCard}>
          <h3>Global AI Minutes (MTD)</h3>
          <strong>{totalMinutes.toLocaleString()}</strong>
          <span className={styles.kpiSub}>~ $881.25 Overage Equivalent</span>
        </div>

        <div className={styles.kpiCard}>
          <h3>Active Telephony Lines</h3>
          <strong>4</strong>
          <span className={styles.kpiSub}>Max Concurrency: 50</span>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h2>Seat Management</h2>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Status</th>
                <th>MTD Usage</th>
                <th>Active Campaign</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id}>
                  <td>
                    <div className={styles.agentMeta}>
                      <span className={styles.agentName}>{agent.name}</span>
                      <span className={styles.agentEmail}>{agent.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={agent.status === 'Active' ? styles.statusActive : styles.statusSuspended}>
                      {agent.status}
                    </span>
                  </td>
                  <td><strong>{agent.minutesUsed.toLocaleString()}</strong> mins</td>
                  <td style={{ color: 'var(--secondary)' }}>{agent.campaign}</td>
                  <td>
                    <div className={styles.actionRow}>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionView}`}
                        onClick={() => router.push(`/admin/seat/${agent.id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionSuspend}`}
                        onClick={() => toggleStatus(agent.id)}
                      >
                        {agent.status === 'Active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}
