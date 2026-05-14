'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { createClient } from '@/utils/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  status: string;
  tier: string;
  usageMinutes: number;
  limitMinutes: number;
}

export default function AdminPortalPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalMinutes, setGlobalMinutes] = useState(0);
  const [allTimeMinutes, setAllTimeMinutes] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load users');
        return;
      }

      if (data.users) setUsers(data.users);
      if (typeof data.globalMinutes === 'number') setGlobalMinutes(data.globalMinutes);
      if (typeof data.allTimeMinutes === 'number') setAllTimeMinutes(data.allTimeMinutes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('A network error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = user?.email?.toLowerCase().trim() === 'shrkfinancial@gmail.com';
      if (!isAdmin) { router.push('/'); return; }
      setIsAuthorized(true);
      fetchData();
    };
    checkAuth();
  }, [router, supabase]);

  if (!isAuthorized) return null;

  const activeSeats = users.filter(u => u.status === 'active').length;

  return (
    <main className={styles.main}>

      <div className={styles.header}>
        <div>
          <h1>Global System Admin</h1>
          <p>Manage users, monitor global usage, and access individual call logs.</p>
        </div>
        {error && <button className={styles.provisionBtn} onClick={fetchData}>Retry</button>}
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h3>Total Registered Users</h3>
          <strong>{users.length}</strong>
          <span className={styles.kpiSub}>{activeSeats} Active</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>Global AI Minutes</h3>
          <strong>{globalMinutes.toLocaleString()}</strong>
          <span className={styles.kpiSub}>{allTimeMinutes.toLocaleString()} All-Time Mins</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>System Status</h3>
          <strong>Online</strong>
          <span className={styles.kpiSub}>Retell API Connected</span>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h2>User Management</h2>

        {loading && <p style={{ color: 'var(--secondary)', padding: '2rem 0' }}>Loading users...</p>}
        {error && <p style={{ color: '#ef4444', padding: '1rem 0' }}><strong>Error:</strong> {error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map(u => {
            const pct = u.limitMinutes > 0 ? Math.min(100, Math.max(0, (u.usageMinutes / u.limitMinutes) * 100)) : 0;
            const remaining = Math.max(0, u.limitMinutes - u.usageMinutes);
            return (
              <div
                key={u.id}
                onClick={() => router.push(`/admin/user/${u.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,127,255,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                {/* Top row: email + view button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)' }}>{u.email}</span>
                  <button
                    className={`${styles.actionBtn} ${styles.actionView}`}
                    onClick={e => { e.stopPropagation(); router.push(`/admin/user/${u.id}`); }}
                  >
                    View Profile
                  </button>
                </div>

                {/* AI Minutes card — exact same as campaign page */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>AI Minutes</h3>
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
                    }}>
                      {u.tier}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>Used this month</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>
                      {u.usageMinutes.toLocaleString()}
                      {u.limitMinutes > 0 && (
                        <span style={{ color: 'var(--secondary)', fontWeight: 400 }}> / {u.limitMinutes.toLocaleString()}</span>
                      )}
                    </span>
                  </div>

                  {u.limitMinutes > 0 && (
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #007fff, #22d3ee)',
                        borderRadius: '999px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{remaining.toLocaleString()} min remaining</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>$0.15/min overage</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </main>
  );
}
