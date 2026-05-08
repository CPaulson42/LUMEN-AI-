import { useEffect, useState, useMemo } from 'react';
import styles from './page.module.css';
import { createClient } from '@/utils/supabase/client';

export default function PartnerDashboard() {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState('');

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setHost(window.location.origin);

    async function fetchProfile() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();
        
        if (data?.referral_code) {
          setReferralCode(data.referral_code);
        }
      }
      setLoading(false);
    }

    fetchProfile();
  }, [supabase]);

  const affiliateLink = referralCode 
    ? `${host}/?ref=${referralCode}`
    : "Loading link...";

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = [
    { month: 'Nov', amount: 850, height: '30%' },
    { month: 'Dec', amount: 1200, height: '45%' },
    { month: 'Jan', amount: 2100, height: '65%' },
    { month: 'Feb', amount: 2450, height: '75%' },
    { month: 'Mar', amount: 3200, height: '85%' },
    { month: 'Apr', amount: 4150, height: '100%' },
  ];

  const agencies = [
    { name: 'Apex Insurance Group', tier: 'Scale', mrr: '$499', status: 'Active' },
    { name: 'Sunrise Life Brokers', tier: 'Professional', mrr: '$199', status: 'Active' },
    { name: 'Global Shield Advisors', tier: 'Professional', mrr: '$199', status: 'Active' },
    { name: 'NextGen Policies', tier: 'Starter', mrr: '$99', status: 'Trial' },
    { name: 'SecureFuture Ltd.', tier: 'Scale', mrr: '$499', status: 'Active' },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Partner Revenue Share</h1>
        <div className={styles.affiliateCard}>
          <span className={styles.affiliateLabel}>Your Referral Link:</span>
          <span className={styles.affiliateLink} style={{ fontSize: '0.85rem' }}>{affiliateLink}</span>
          <button 
            className={styles.copyBtn} 
            onClick={handleCopy}
            disabled={!referralCode}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <section className={`${styles.statsGrid} fade-in`}>
        <div className={`${styles.statsCard} premium-card`}>
          <span className={styles.statsLabel}>Total Active Referrals</span>
          <span className={styles.statsValue}>24</span>
          <span className={`${styles.statsTrend} ${styles.trendUp}`}>+3 this month</span>
        </div>
        <div className={`${styles.statsCard} premium-card`}>
          <span className={styles.statsLabel}>Total Downline MRR</span>
          <span className={styles.statsValue}>$13,833</span>
          <span className={`${styles.statsTrend} ${styles.trendUp}`}>+15% growth</span>
        </div>
        <div className={`${styles.statsCard} premium-card`}>
          <span className={styles.statsLabel}>Current Rev Share</span>
          <span className={styles.statsValue}>15%</span>
          <span className={`${styles.statsTrend} ${styles.trendNeutral}`}>Tier 3 Unlocked</span>
        </div>
        <div className={`${styles.statsCard} premium-card`} style={{ border: '1px solid rgba(0, 127, 255, 0.4)' }}>
          <span className={styles.statsLabel}>Pending Payout</span>
          <span className={styles.statsValue}>$4,150.00</span>
          <span className={`${styles.statsTrend} ${styles.trendNeutral}`}>Available May 1st</span>
        </div>
      </section>

      <div className={`${styles.contentGrid} fade-in`} style={{ animationDelay: '0.1s' }}>
        <div className={`${styles.sectionCard} glass-panel`}>
          <div className={styles.sectionHeader}>
            <h2>Downline Agencies</h2>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Agency Name</th>
                  <th>Current Tier</th>
                  <th>MRR Contribution</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency, i) => (
                  <tr key={i}>
                    <td><strong>{agency.name}</strong></td>
                    <td>{agency.tier}</td>
                    <td>{agency.mrr}</td>
                    <td>
                      <span className={agency.status === 'Active' ? styles.statusActive : styles.statusTrial}>
                        {agency.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={`${styles.sectionCard} glass-panel`}>
            <div className={styles.sectionHeader}>
              <h2>Commission Tiers</h2>
            </div>
            <div className={styles.payoutHistory}>
              <div className={styles.historyItem}>
                <div>
                  <div className={styles.historyAmount}>5%</div>
                </div>
                <div className={styles.historyDate}>1 - 10 Referrals</div>
              </div>
              <div className={styles.historyItem}>
                <div>
                  <div className={styles.historyAmount}>10%</div>
                </div>
                <div className={styles.historyDate}>11 - 20 Referrals</div>
              </div>
              <div className={styles.historyItem} style={{ border: '1px solid var(--primary)', background: 'rgba(0, 127, 255, 0.05)' }}>
                <div>
                  <div className={styles.historyAmount} style={{ color: 'var(--primary)' }}>15%</div>
                </div>
                <div className={styles.historyDate}>21 - 30 Referrals (Current)</div>
              </div>
              <div className={styles.historyItem}>
                <div>
                  <div className={styles.historyAmount}>15% Cap</div>
                </div>
                <div className={styles.historyDate}>31 - 50 Referrals</div>
              </div>
              <div className={styles.historyItem}>
                <div>
                  <div className={styles.historyAmount}>Contact Sales</div>
                </div>
                <div className={styles.historyDate}>50 - 100 Referrals</div>
              </div>
            </div>
          </div>

          <div className={`${styles.sectionCard} glass-panel`}>
            <div className={styles.sectionHeader}>
              <h2>Earnings Trend</h2>
              <button className={styles.payoutBtn}>Request Payout</button>
            </div>
            
            <div className={styles.chartContainer}>
              {chartData.map((data, i) => (
                <div key={i} className={styles.chartColumn}>
                  <div 
                    className={styles.chartBar} 
                    style={{ height: data.height }}
                    data-value={`$${data.amount}`}
                  ></div>
                  <span className={styles.chartLabel}>{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.sectionCard} glass-panel`}>
            <div className={styles.sectionHeader}>
              <h2>Recent Payouts</h2>
            </div>
            <div className={styles.payoutHistory}>
              <div className={styles.historyItem}>
                <div>
                  <div className={styles.historyDate}>April 1, 2026</div>
                  <div className={styles.historyStatus}>Paid via ACH</div>
                </div>
                <div className={styles.historyAmount}>$3,200.00</div>
              </div>
              <div className={styles.historyItem}>
                <div>
                  <div className={styles.historyDate}>March 1, 2026</div>
                  <div className={styles.historyStatus}>Paid via ACH</div>
                </div>
                <div className={styles.historyAmount}>$2,450.00</div>
              </div>
              <div className={styles.historyItem}>
                <div>
                  <div className={styles.historyDate}>February 1, 2026</div>
                  <div className={styles.historyStatus}>Paid via ACH</div>
                </div>
                <div className={styles.historyAmount}>$2,100.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
