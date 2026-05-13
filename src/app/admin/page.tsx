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
  minutesUsed: number;
}

export default function AdminPortalPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalMinutes, setGlobalMinutes] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to load users');
        return;
      }

      if (data.users) {
        setUsers(data.users);
      }
      if (typeof data.globalMinutes === 'number') {
        setGlobalMinutes(data.globalMinutes);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
      setError('A network error occurred while fetching users.');
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
      fetchUsers();
    };

    checkAuth();
  }, [router, supabase]);

  if (!isAuthorized) return null;

  const activeSeats = users.filter(u => u.status === 'active' || u.status === 'Active').length;

  return (
    <main className={styles.main}>

      <div className={styles.header}>
        <div>
          <h1>Global System Admin</h1>
          <p>Manage users, monitor global usage, and access individual call logs.</p>
        </div>
        {error && <button className={styles.provisionBtn} onClick={fetchUsers}>Retry Fetch</button>}
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h3>Total Registered Users</h3>
          <strong>{users.length}</strong>
          <span className={styles.kpiSub}>{activeSeats} Active Partners</span>
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
                <th>Status</th>
                <th>Minutes Used</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading global users...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                    <strong>Error:</strong> {error}
                  </td>
                </tr>
              )}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                </tr>
              )}
              {users.map(u => (
                <tr key={u.id} className={styles.callRow} onClick={() => router.push(`/admin/user/${u.id}`)}>
                  <td>
                    <span className={styles.agentName}>{u.email || 'Unknown'}</span>
                  </td>
                  <td>
                    <span className={u.status === 'active' ? styles.statusActive : styles.statusSuspended}>
                      {u.tier}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: u.status === 'active' ? '#22c55e' : u.status === 'past_due' ? '#f59e0b' : '#94a3b8', textTransform: 'capitalize' }}>
                      {u.status}
                    </span>
                  </td>
                  <td><strong>{u.minutesUsed > 0 ? u.minutesUsed.toLocaleString() : '0'}</strong> mins</td>
                  <td>
                    <button className={`${styles.actionBtn} ${styles.actionView}`}>
                      View Profile →
                    </button>
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
