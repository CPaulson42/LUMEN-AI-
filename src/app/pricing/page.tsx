'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async (priceId: string | undefined, planName: string) => {
    setErrorMsg(null);
    if (!priceId) {
      setErrorMsg('Price ID is missing for ' + planName + ' plan. Check environment variables.');
      return;
    }
    
    setIsLoading(planName);
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error(data.error);
        setErrorMsg('Checkout Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Network Error: ' + error.message);
    } finally {
      setIsLoading(null);
    }
  };
  const CheckIcon = () => (
    <svg className={styles.featureIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  return (
    <main className={styles.main}>
      {errorMsg && (
        <div className={styles.errorBanner}>
          {errorMsg}
        </div>
      )}
      <section className={`${styles.hero} fade-in`}>
        <h1>Scale your agency with <span>Lumen AI</span></h1>
        <p>Choose the automated conversational tier that perfectly fits your lead volume. No hidden fees. Upgrade or cancel at any time.</p>
      </section>

      <div className={`${styles.pricingGrid} fade-in`} style={{ animationDelay: '0.1s' }}>
        


        {/* Tier 2: Pro (Highlighted) */}
        <div className={`${styles.pricingCard} ${styles.proCard}`}>
          <div className={styles.badge}>Most Popular</div>
          <h3 className={styles.planName}>Professional</h3>
          <div className={styles.planPrice}>
            <strong>$199</strong><span>/mo</span>
          </div>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span><strong>1,000</strong> AI Minutes & 20 calls concurrent</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Premium "Ultra-Realistic" Voices</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Advanced Prompt Engineering limits</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Custom Business Transcripts</span>
            </div>

            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Priority 24/7 Support to help you scale</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Outside Lead Integration</span>
            </div>
          </div>
          
          <button 
            className={`${styles.ctaButton} ${styles.primary}`}
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL, 'Professional')}
            disabled={isLoading !== null}
          >
            {isLoading === 'Professional' ? 'Loading...' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Tier 3: Scale */}
        <div className={`${styles.pricingCard} ${styles.enterpriseCard}`}>
          <h3 className={styles.planName}>Scale</h3>
          <div className={styles.planPrice}>
            <strong>$599</strong><span>/mo</span>
          </div>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span><strong>5,000</strong> AI Minutes & 50 calls concurrent</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Custom Voice Cloning Model</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Custom Business Transcripts</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Direct CRM Integration (HubSpot, GoHighLevel)</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Outside Lead Integration</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Priority 24/7 Support to help you scale</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Dedicated Account Manager</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span><strong>Admin Panel Access</strong></span>
            </div>
          </div>
          
          <button 
            className={`${styles.ctaButton} ${styles.secondary}`}
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SCALE, 'Scale')}
            disabled={isLoading !== null}
          >
            {isLoading === 'Scale' ? 'Loading...' : 'Subscribe to Scale'}
          </button>
        </div>

        {/* Tier 4: Partner */}
        <div className={`${styles.pricingCard} ${styles.partnerCard}`}>
          <div className={styles.badge}>Elite</div>
          <h3 className={styles.planName}>Partner</h3>
          <div className={styles.planPrice}>
            <strong>$999</strong><span>/mo</span>
          </div>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Everything in Scale, plus:</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span><strong>Partner Admin Panel</strong> — Full Downline Management</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>White-Label Branding Options</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Revenue Share Dashboard</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Multi-Agency Seat Provisioning</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Outside Lead Integration</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Priority 24/7 Support to help you scale</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span>Custom Business Transcripts</span>
            </div>
            <div className={styles.featureItem}>
              <CheckIcon />
              <span><strong>Admin Panel Access</strong></span>
            </div>
          </div>
          
          <button 
            className={`${styles.ctaButton} ${styles.secondary}`}
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PARTNER, 'Partner')}
            disabled={isLoading !== null}
          >
            {isLoading === 'Partner' ? 'Loading...' : 'Contact Sales'}
          </button>
        </div>

      </div>
    </main>
  );
}
