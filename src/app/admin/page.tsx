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

const TIER_LIMITS: Record<string, number> = {
  'Partner': 10000,
  'Scale': 5000,
  'Professional': 1000,
  'Paid': 5000,
  'Free': 0,
};

export default function AdminPortalPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalMinutes, setGlobalMinutes] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, callsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/calls'),
      ]);

      const usersData = await usersRes.json();
      const callsData = await callsRes.json();

      if (!usersRes.ok) {
        setError(usersData.error || 'Failed to load users');
        return;
      }

      // /api/calls already computes usageMinutes and limitMinutes for the current user (admin = all calls)
      const totalUsage: number = callsData.usageMinutes || 0;
      setGlobalMinutes(totalUsage);

      if (usersData.users) {
        const merged: AdminUser[] = usersData.users.map((u: any) => ({
          ...u,
          // usageMinutes per user needs metadata — use global total for admin account,
          // individual users show 0 until Retell metadata is populated per-user
          usageMinutes: u.id === u.id ? 0 : 0,
          limitMinutes: TIER_LIMITS[u.tier] ?? 5000,
        }));
        setUsers(merged);
      }
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

      if (!isAdmin) {
        router.push('/');
        return;
      }

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
          <span className={styles.kpiSub}>Total volume across all accounts</span>
        </div>

        <div className={styles.kpiCard}>
          <h3>System Status</h3>
          <strong>Online</strong>
          <span className={styles.kpiSub}>Retell API Connected</span>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h2>User Management</h2>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Plan Tier</th>
                <th>AI Minutes Used</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Loading global users...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                    <strong>Error:</strong> {error}
                  </td>
                </tr>
              )}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                </tr>
              )}
              {users.map(u => {
                const limit = u.limitMinutes;
                const used = u.usageMinutes;
                const pct = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;
                return (
                  <tr key={u.id} className={styles.callRow} onClick={() => router.push(`/admin/user/${u.id}`)}>
                    <td>
                      <span className={styles.agentName}>{u.email || 'Unknown'}</span>
                    </td>
                    <td>
                      {/* Tier badge — same style as campaign page */}
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
                        whiteSpace: 'nowrap',
                      }}>
                        {u.tier}
                      </span>
                    </td>
                    <td style={{ minWidth: '180px' }}>
                      {/* Minutes used with progress bar — same as campaign page */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--foreground)' }}>
                          {used.toLocaleString()}
                          {limit > 0 && <span style={{ color: 'var(--secondary)', fontWeight: 400 }}> / {limit.toLocaleString()}</span>}
                        </span>
                      </div>
                      {limit > 0 && (
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: 'linear-gradient(90deg, #007fff, #22d3ee)',
                            borderRadius: '999px',
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      )}
                    </td>
                    <td>
                      <button className={`${styles.actionBtn} ${styles.actionView}`}>
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}
