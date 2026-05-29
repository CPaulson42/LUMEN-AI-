import styles from './docs.module.css';

export const metadata = {
  title: 'Introduction | Lumen AI',
  description: 'Build voice AI agents that can make and receive phone calls for life insurance qualification.',
};

export default function DocsPage() {
  return (
    <div className="fade-in">
      <div className={styles.pageHeader}>
        <h1>Introduction</h1>
        <p>Lumen AI is the developer platform for building voice AI agents. We handle the complex infrastructure so you can focus on creating great voice experiences for your Agency.</p>
      </div>

      <div className={styles.contentSection}>
        <h2>What is Lumen AI?</h2>
        <p>Voice agents allow you to:</p>
        <ul>
          <li>Have natural conversations with prospects and leads</li>
          <li>Make and receive phone calls automatically</li>
          <li>Integrate with your existing systems and CRM (HubSpot, GHL)</li>
          <li>Handle complex workflows like appointment scheduling, lead qualification, and more</li>
        </ul>
      </div>

      <div className={styles.contentSection}>
        <h2>How voice agents work</h2>
        <p>Every Lumen assistant combines three core technologies:</p>
        <ul>
          <li><strong>Speech-to-Text:</strong> Converts user speech into text that your agent can understand in real-time.</li>
          <li><strong>LLM Processing:</strong> Processes the conversation context and generates intelligent, context-aware responses.</li>
          <li><strong>Text-to-Speech:</strong> Converts your agent&apos;s responses back into natural, ultra-humanistic speech.</li>
        </ul>
        <div className={styles.callout}>
          <p><strong>Note:</strong> You have full control over each component through the Partner Admin Panel.</p>
        </div>
      </div>

      <div className={styles.contentSection}>
        <h2>Key capabilities</h2>
        <ul>
          <li><strong>Real-time conversations:</strong> Sub-800ms response times with natural turn-taking and interruption handling.</li>
          <li><strong>Phone integration:</strong> Make and receive calls on any provisioned phone number.</li>
          <li><strong>CRM integration:</strong> Connect directly to HubSpot, GoHighLevel, and other databases via webhooks.</li>
          <li><strong>Multi-assistant orchestration:</strong> Compose specialized assistants for triage, qualification, and closing.</li>
        </ul>
      </div>
      <div className={styles.contentSection}>
        <h2>LUMEN AI — Brand Identity & Core Architecture Summary</h2>
        <p><strong>Date:</strong> May 23, 2026<br /><strong>Document Version:</strong> V1</p>
        <p>This document formalizes the operational framework, brand identity, and official acronym definitions for the LUMEN AI high-performance voice automation infrastructure.</p>

        <h3>1. Official Brand Acronym Definition</h3>
        <p>LUMEN AI officially stands for:</p>
        <ul>
          <li><strong>L</strong> — Logistical</li>
          <li><strong>U</strong> — Understanding</li>
          <li><strong>M</strong> — Machine</li>
          <li><strong>E</strong> — Efficiency</li>
          <li><strong>N</strong> — Node</li>
        </ul>

        <h3>2. Core System Mandate</h3>
        <p>The Logistical Understanding Machine Efficiency Node (<span style={{ color: '#007fff' }}>LUMEN</span>) functions as a mission-critical infrastructure layer designed to deliver sub-second latency conversational AI orchestration at enterprise scale. By fusing predictive conversational logic with distributed runtime efficiency, <span style={{ color: '#007fff' }}>LUMEN</span> optimizes high-volume engagement workflows, handling demanding concurrent operations without performance degradation.</p>

        <h3>3. Key Structural Pillars</h3>
        <ul>
          <li><strong>Logistical Understanding:</strong> Context-aware dialogue management capable of managing complex, branching user intents and multi-turn live variables seamlessly.</li>
          <li><strong>Machine Efficiency:</strong> Stateless application logic optimized for rapid execution, decoupling core computation from data storage tiers to unlock fluid scalability.</li>
          <li><strong>Node Architecture:</strong> A modular deployment node designed for flexible replication across isolated environments, ensuring robust high-availability and failover protection.</li>
        </ul>
        <h3>4. Tagline Alignment</h3>
        <p>In tandem with the modular node architecture, the platform&apos;s outward-facing visual identity leverages the lighthouse aesthetic, reinforced by the brand promise:</p>
        <div className={styles.callout}>
          <p><strong>&quot;THE LIGHT YOU WERE LOOKING FOR.&quot;</strong></p>
        </div>
      </div>


      <div className={styles.contentSection}>
        <h2>Choose your path</h2>
        <div className={styles.cardsGrid}>
          <a href="#" className={styles.card}>
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                <line x1="14" y1="2" x2="22" y2="10"></line>
                <line x1="14" y1="10" x2="22" y2="2"></line>
              </svg>
              Inbound Support
            </h3>
            <p>Create a voice agent for inbound calls. Build customer support or triage automation.</p>
          </a>

          <a href="#" className={styles.card}>
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Outbound Campaigns
            </h3>
            <p>Make outbound sales calls, qualify leads, and schedule appointments with branching logic.</p>
          </a>

          <a href="#" className={styles.card}>
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Appointment Scheduling
            </h3>
            <p>Handle booking requests, check availability, and confirm appointments with conditional routing.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
