'use client';

import styles from './page.module.css';

export default function BillingPage() {

  const handleStripePortal = () => {
    // In a real application, this would fetch a Stripe session URL from the backend
    // e.g. const res = await fetch('/api/create-portal-session', { method: 'POST' });
    // const { url } = await res.json();
    // window.location.href = url;
    
    alert('Backend Integration Required: This button will redirect the user to the secure Stripe Customer Portal to manage their credit cards and invoices once the Stripe Secret Key is added to the environment variables.');
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        
        {/* LEFT COLUMN: Subscription & Usage */}
        <div className={styles.leftColumn}>
          <div className={`${styles.column}`}>
            
            {/* Subscription Module */}
            <div className={`${styles.card} premium-card`}>
              <div className={styles.cardHeader}>
                <h2>Current Plan</h2>
                <span className={styles.statusPaid}>Active</span>
              </div>
              
              <div>
                <span style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Lumen Scale Tier</span>
                <div className={styles.planPrice}>
                  <strong>$599</strong><span>/mo</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                  Includes 5,000 baseline AI minutes. Auto-renews on May 1st, 2026.
                </p>
              </div>

              <div className={styles.usageMeter}>
                <div className={styles.usageMeta}>
                  <span className={styles.usageTitle}>AI Minutes Used</span>
                  <span className={styles.usageValue}>840 / 5,000</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: '17%' }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Overages billed at $0.15/min</span>
              </div>

              <button className={styles.stripeButton} onClick={handleStripePortal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Manage Billing in Stripe
              </button>
            </div>

            {/* Payment Method Module */}
            <div className={`${styles.card} premium-card`}>
              <h2>Payment Method</h2>
              <div className={styles.paymentMethodRow}>
                <div className={styles.paymentIcon}>VISA</div>
                <div className={styles.paymentDetails}>
                  <strong>Visa ending in 4242</strong>
                  <span>Expires 08/28</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Invoice History */}
        <div className={styles.rightColumn}>
          <div className={`${styles.card} premium-card`}>
            <h2>Invoice History</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Usage (Minutes)</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>INV-2026-004</td>
                    <td>Apr 1, 2026</td>
                    <td>5,240 (240 Overage)</td>
                    <td>$635.00</td>
                    <td><span className={styles.statusPaid}>Paid</span></td>
                    <td><a href="#" className={styles.invoiceLink} onClick={(e) => e.preventDefault()}>PDF</a></td>
                  </tr>
                  <tr>
                    <td>INV-2026-003</td>
                    <td>Mar 1, 2026</td>
                    <td>4,890</td>
                    <td>$599.00</td>
                    <td><span className={styles.statusPaid}>Paid</span></td>
                    <td><a href="#" className={styles.invoiceLink} onClick={(e) => e.preventDefault()}>PDF</a></td>
                  </tr>
                  <tr>
                    <td>INV-2026-002</td>
                    <td>Feb 1, 2026</td>
                    <td>5,000</td>
                    <td>$599.00</td>
                    <td><span className={styles.statusPaid}>Paid</span></td>
                    <td><a href="#" className={styles.invoiceLink} onClick={(e) => e.preventDefault()}>PDF</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '1rem' }}>
              For invoices prior to 2026, please access the Stripe Portal.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
