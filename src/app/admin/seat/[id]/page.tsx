'use client';

import { use } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// Using the same mock data source concept
const MOCK_AGENTS = [
  { id: 1, name: 'Michael Chen', email: 'michael@lumenseats.com', status: 'Active', minutesUsed: 1420, campaign: 'Q2 Life Insurance Core', joined: 'Jan 12, 2026', successRate: '68%' },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@lumenseats.com', status: 'Active', minutesUsed: 890, campaign: 'Term Life Pilot', joined: 'Feb 05, 2026', successRate: '72%' },
  { id: 3, name: 'David Rodriguez', email: 'david.r@lumenseats.com', status: 'Suspended', minutesUsed: 45, campaign: '--', joined: 'Mar 15, 2026', successRate: '12%' },
  { id: 4, name: 'Emma Wilson', email: 'emma@lumenseats.com', status: 'Active', minutesUsed: 3100, campaign: 'High Net Worth Outbound', joined: 'Jan 02, 2026', successRate: '81%' },
  { id: 5, name: 'James Taylor', email: 'james.t@lumenseats.com', status: 'Active', minutesUsed: 420, campaign: 'Q2 Life Insurance Core', joined: 'Mar 28, 2026', successRate: '54%' },
];

export default function SeatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const agent = MOCK_AGENTS.find(a => a.id === parseInt(id)) || MOCK_AGENTS[0];

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Admin Console
        </Link>
        <div className={styles.seatMeta}>
          <h1>Agent Profile: {agent.name}</h1>
          <span className={agent.status === 'Active' ? styles.statusActive : styles.statusSuspended}>
            {agent.status}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={`${styles.card} premium-card`}>
            <h2>Seat Information</h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span>Email Address</span>
                <strong>{agent.email}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Date Joined</span>
                <strong>{agent.joined}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Current Assignment</span>
                <strong>{agent.campaign}</strong>
              </div>
            </div>

            <div className={styles.dangerZone}>
              <button className={styles.dangerBtn}>
                {agent.status === 'Active' ? 'Suspend Seat Access' : 'Reactivate Seat Access'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={`${styles.card} premium-card`}>
            <h2>Performance Metrics</h2>
            <div className={styles.statsGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className={styles.detailItem}>
                <span>Minutes Used (MTD)</span>
                <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{agent.minutesUsed.toLocaleString()}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Conversion Success</span>
                <strong style={{ fontSize: '1.5rem', color: '#10b981' }}>{agent.successRate}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Total Calls Made</span>
                <strong>1,248</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Avg. Call Duration</span>
                <strong>3:24</strong>
              </div>
            </div>
          </div>

          <div className={`${styles.card} premium-card`} style={{ marginTop: '2rem' }}>
            <h2>Recent Activity</h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>
              Agent was last active today at 2:14 PM viewing &quot;Q2 Life Insurance Core&quot; leads.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
