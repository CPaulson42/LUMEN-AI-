'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={`${styles.hero} fade-in`}>
        <h1>Your AI Voice for the Future</h1>
        <p>Traditional call centers are expensive, inconsistent, and hard to manage. Lumen AI provides ultra-realistic voice agents that never sleep, never miss a detail, and scale instantly to handle thousands of calls.</p>
        <div className={styles.heroActions}>
          <Link href="/pricing" className={styles.ctaButton}>
            Get Started
          </Link>
          <a href="#demo" className={styles.secondaryCta}>
            Try Live Demo
          </a>
        </div>
      </section>

      <section className={`${styles.featuresGrid} fade-in`} style={{ animationDelay: '0.1s' }}>
        <div className={`${styles.featureCard} glass-panel premium-card`}>
          <div className={styles.iconWrapper}>
            <svg className="neon-blue-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
              <line x1="8" y1="22" x2="16" y2="22"></line>
            </svg>
          </div>
          <h3>Ultra Human-like AI Voices</h3>
          <p>Indistinguishable from real agents. Our ultra-realistic voices build trust and engagement with your prospects.</p>
        </div>

        <div className={`${styles.featureCard} glass-panel premium-card`}>
          <div className={styles.iconWrapper}>
            <svg className="neon-blue-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <h3>Infinite Scalability</h3>
          <p>Make thousands of concurrent calls effortlessly. Expand your reach without the overhead of hiring more staff.</p>
        </div>

        <div className={`${styles.featureCard} glass-panel premium-card`}>
          <div className={styles.iconWrapper}>
            <svg className="neon-blue-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>Smart Qualification</h3>
          <p>Qualify leads based on custom prompts. Ensure your human agents only talk to the most qualified prospects.</p>
        </div>

        <div className={`${styles.featureCard} glass-panel premium-card`}>
          <div className={styles.iconWrapper}>
            <svg className="neon-blue-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h3>CRM Integration</h3>
          <p>Syncs directly with your existing workflow, pushing qualified leads straight into HubSpot or GoHighLevel.</p>
        </div>
        <div className={`${styles.featureCard} glass-panel premium-card`}>
          <div className={styles.iconWrapper}>
            <svg className="neon-blue-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>
          <h3>Consistency Compounds</h3>
          <p>Unlike human agents who have good days and bad days, AI maintains the same professional energy and messaging on every single call. No more calling when I’m tired, frustrated, or distracted. Every prospect gets the same high-quality experience.</p>
        </div>
        <div className={`${styles.featureCard} glass-panel premium-card`}>
          <div className={styles.iconWrapper}>
            <svg className="neon-blue-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h3>Cost Savings</h3>
          <p>Reduce operational costs by automating repetitive tasks. Replace high-volume manual dialing with AI that works around the clock for a fraction of the cost.</p>
        </div>
      </section>

      <section className={`${styles.processSection} fade-in`} style={{ animationDelay: '0.15s' }}>
        <div className={styles.processHeader}>
          <h2>Our process</h2>
          <p>Clear, fast, and accountable. You’ll always know what’s happening and when.</p>
        </div>
        <div className={styles.processGrid}>
          <div className={`${styles.processStep} glass-panel premium-card`}>
            <div className={styles.stepNumber}>01</div>
            <h3>Discovery</h3>
            <p>10–15 min call. Goals, call flows, systems. We scope the quickest path to value.</p>
          </div>
          <div className={`${styles.processStep} glass-panel premium-card`}>
            <div className={styles.stepNumber}>02</div>
            <h3>Prototype</h3>
            <p>We ship a working agent + call logs. You test scripts and edge cases.</p>
          </div>
          <div className={`${styles.processStep} glass-panel premium-card`}>
            <div className={styles.stepNumber}>03</div>
            <h3>Integrate</h3>
            <p>Calendar, CRM, IVR, sheets, webhooks. Prompts + guardrails hardened.</p>
          </div>
          <div className={`${styles.processStep} glass-panel premium-card`}>
            <div className={styles.stepNumber}>04</div>
            <h3>Go live</h3>
            <p>We monitor, iterate weekly, and report. SLA on uptime and response.</p>
          </div>
        </div>
      </section>

      <section id="demo" className={`${styles.demoSection} fade-in`} style={{ animationDelay: '0.18s' }}>
        <div className={`${styles.demoCard} glass-panel`}>
          <div className={styles.demoLeft}>
            <h2 className={styles.demoTitle}>Try a live demo call</h2>
            <p className={styles.demoSubtitle}>Enter your details and our AI voice agent will call you. You'll hear how it greets, qualifies, and books in under 2 minutes.</p>
            <form className={styles.demoForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.demoFieldRow}>
                <div className={styles.demoField}>
                  <label htmlFor="demo-name">Full Name</label>
                  <input id="demo-name" type="text" placeholder="Jane Doe" className={styles.demoInput} />
                </div>
                <div className={styles.demoField}>
                  <label htmlFor="demo-company">Company</label>
                  <input id="demo-company" type="text" placeholder="Acme Co." className={styles.demoInput} />
                </div>
              </div>
              <div className={styles.demoFieldRow}>
                <div className={styles.demoField}>
                  <label htmlFor="demo-phone">Phone Number</label>
                  <input id="demo-phone" type="tel" placeholder="(555) 123-4567" className={styles.demoInput} />
                </div>
                <div className={styles.demoField}>
                  <label htmlFor="demo-email">Email</label>
                  <input id="demo-email" type="email" placeholder="you@company.com" className={styles.demoInput} />
                </div>
              </div>
              <div className={styles.demoField}>
                <label htmlFor="demo-notes">Anything we should know?</label>
                <textarea id="demo-notes" placeholder="Tell us about your use case, call volume, or any questions..." className={styles.demoTextarea} rows={3} />
              </div>
              <button type="submit" className={styles.demoButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12 19.79 19.79 0 0 1 1.21 3.17 2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.37a16 16 0 0 0 6.29 6.29l1.45-1.45a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Call me now
              </button>
              <p className={styles.demoDisclaimer}>By submitting, you agree to our <a href="#">terms</a> and to be contacted about this demo.</p>
              
              <div className={styles.challengeCard}>
                <div className={styles.challengeHeader}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  <span>The "Try to Break Me" Challenge</span>
                </div>
                <p>Call the number and try to change your order three times in 30 seconds. See if our AI keeps up.</p>
              </div>
            </form>
          </div>
          <div className={styles.demoRight}>
            <div className={styles.demoTrustList}>
              <div className={styles.demoTrustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <div>
                  <strong>Typical setup: 7–14 days</strong>
                  <span>From signed agreement to live calls</span>
                </div>
              </div>
              <div className={styles.demoTrustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <div>
                  <strong>English, Spanish, Portuguese &amp; more</strong>
                  <span>Multilingual agents, global reach</span>
                </div>
              </div>
              <div className={styles.demoTrustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <div>
                  <strong>Security-minded practices</strong>
                  <span>Data minimization &amp; privacy-first design</span>
                </div>
              </div>
            </div>
            <div className={styles.demoQuote}>
              <p>"The demo call blew our team away — it sounded completely natural."</p>
              <span>— Insurance Agency Owner, Florida</span>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.hookSection} fade-in`} style={{ animationDelay: '0.2s' }}>
        <h2>Stop dialing. Start closing.</h2>
        <p>Let your AI do the heavy lifting.</p>
        <Link href="/pricing" className={styles.ctaButton}>
          Launch Your First Campaign
        </Link>
        <div className={styles.featuredStory}>
          <span className={styles.storyLabel}>Featured Case Study</span>
          <a
            href="https://medium.com/@sfbatraining/how-i-went-from-3k-to-20k-monthly-using-ai-to-automate-life-insurance-sales-real-numbers-inside-e513fa20209c"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.storyLink}
          >
            How I Went From $3K to $20K Monthly Using AI to Automate Life Insurance Sales (Real Numbers Inside)
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </a>
        </div>
      </section>
    </main>
  );
}
