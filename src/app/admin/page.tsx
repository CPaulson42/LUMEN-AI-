'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface AdminUser {
  id: string;
  email: string;
  status: string;
  minutesUsed: number;
}

export default function AdminPortalPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setUsers(data.users);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load admin users:', err);
        setLoading(false);
      });
  }, []);

  const totalMinutes = users.reduce((acc, curr) => acc + curr.minutesUsed, 0);
  const activeSeats = users.filter(u => u.status === 'active').length;

  return (
    <main className={styles.main}>

      <div className={styles.header}>
        <div>
          <h1>Global System Admin</h1>
          <p>Manage users, monitor global usage, and access individual call logs.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h3>Total Registered Users</h3>
          <strong>{users.length}</strong>
          <span className={styles.kpiSub}>{activeSeats} Active Partners</span>
        </div>

        <div className={styles.kpiCard}>
          <h3>Global AI Minutes</h3>
          <strong>{totalMinutes.toLocaleString()}</strong>
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
                <th>User ID</th>
                <th>Email</th>
                <th>Status (Tier)</th>
                <th>Total Usage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading global users...</td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                </tr>
              )}
              {users.map(u => (
                <tr key={u.id} className={styles.callRow} onClick={() => router.push(`/admin/user/${u.id}`)}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--secondary)' }}>{u.id.split('-')[0]}...</td>
                  <td>
                    <span className={styles.agentName}>{u.email || 'Unknown'}</span>
                  </td>
                  <td>
                    <span className={u.status === 'active' ? styles.statusActive : styles.statusSuspended}>
                      {u.status || 'inactive'}
                    </span>
                  </td>
                  <td><strong>{u.minutesUsed.toLocaleString()}</strong> mins</td>
                  <td>
                    <button className={`${styles.actionBtn} ${styles.actionView}`}>
                      View Full Profile →
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
