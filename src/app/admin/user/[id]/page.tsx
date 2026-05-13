'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

import { createClient } from '@/utils/supabase/client';

interface Call {
  id: string;
  name: string;
  phone: string;
  duration: string;
  status: string;
  result: string | null;
  summary: string;
}

interface UserProfile {
  id: string;
  email: string;
  status: string;
  tier: string;
  minutesUsed: number;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;

    const checkAuthAndFetch = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = user?.email?.toLowerCase().trim() === 'shrkfinancial@gmail.com';
      
      if (!isAdmin) {
        router.push('/');
        return;
      }

      setIsAuthorized(true);

      try {
        // Fetch users to find this specific one (simpler than a new endpoint for now)
        const userRes = await fetch('/api/admin/users');
        const userData = await userRes.json();
        const foundUser = userData.users?.find((u: any) => u.id === id);
        if (foundUser) setUserProfile(foundUser);

        // Fetch this user's specific calls
        const callsRes = await fetch(`/api/calls?userId=${id}`);
        const callsData = await callsRes.json();
        if (callsData.calls) setCalls(callsData.calls);
      } catch (err) {
        console.error('Error fetching user detail:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [id, router, supabase]);

  if (!isAuthorized) return null;

  if (loading) return <div className={styles.loading}>Loading user profile...</div>;
  if (!userProfile) return <div className={styles.error}>User not found.</div>;

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href="/admin" className={styles.backLink}>
          ← Back to User Management
        </Link>
        <div className={styles.userMeta}>
          <h1>{userProfile.email}</h1>
          <span className={`${styles.statusBadge} ${userProfile.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
            {userProfile.tier}
          </span>
          <span style={{ marginLeft: '0.5rem', color: userProfile.status === 'active' ? '#22c55e' : '#94a3b8', fontSize: '0.8rem', textTransform: 'capitalize' }}>
            ({userProfile.status})
          </span>
        </div>
        <div className={styles.topStats}>
          <div className={styles.topStat}><span>Lifetime Usage</span><strong>{userProfile.minutesUsed} min</strong></div>
          <div className={styles.topStat}><span>Total Calls</span><strong>{calls.length}</strong></div>
        </div>
      </div>

      <div className={styles.container}>
        <section className={styles.callSection}>
          <div className={`${styles.callTableCard} glass-panel`}>
            <div className={styles.sectionHeader}>
              <h2>Individual Call History</h2>
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
                  {calls.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                        No calls found for this user.
                      </td>
                    </tr>
                  ) : (
                    calls.map(call => (
                      <tr 
                        key={call.id} 
                        className={styles.callRow}
                        onClick={() => router.push(`/cold-calls/campaign/global/lead/${call.id}`)}
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
                        <td className={styles.durationCell}>{call.duration}</td>
                        <td>
                          {call.result === 'successful' && <span className={styles.resultGood}>Successful</span>}
                          {call.result === 'unsuccessful' && <span className={styles.resultBad}>Unsuccessful</span>}
                          {!call.result && <span className={styles.resultPending}>—</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className={styles.sidebar}>
          <div className={`${styles.infoCard} glass-panel`}>
            <h3>Account Details</h3>
            <div className={styles.infoRow}>
              <span>User ID:</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{userProfile.id}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Plan Tier:</span>
              <strong>{userProfile.tier}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Billing Status:</span>
              <strong style={{ textTransform: 'capitalize' }}>{userProfile.status}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Total Calls:</span>
              <strong>{calls.length}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
