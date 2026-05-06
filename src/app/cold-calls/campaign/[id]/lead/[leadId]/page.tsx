'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getCampaignById, type Campaign } from '@/lib/campaigns';
import styles from './page.module.css';

// Mock database for specific lead calls and their transcripts
const LEAD_DATABASE = {
  '1': {
    name: 'John Smith',
    phone: '+1 (305) 555-0142',
    status: 'In Progress',
    duration: '2:14',
    result: null,
    summary: 'Discussing $500k coverage options, considering term vs whole life.',
    transcript: [
      { speaker: 'ai', text: "Hi John, this is Alex from Lumen Leads. I'm following up on your request for life insurance information. How are you today?", time: '0:00' },
      { speaker: 'user', text: "I'm doing well, thanks.", time: '0:06' },
      { speaker: 'ai', text: "Great. I see you were looking for roughly $500,000 in coverage. Did you have a preference between term-life or a whole-life policy?", time: '0:08' },
      { speaker: 'user', text: "I'm not completely sure. What's the main difference in monthly cost?", time: '0:18' },
      { speaker: 'ai', text: "Term life is generally much more affordable month-to-month, designed to protect your family for a set period, like 20 years. Whole life builds cash value over time but has a higher premium. Given you mentioned $500k, a 20-year term could be around $40-$60 a month depending on health factors.", time: '0:22' },
      { speaker: 'user', text: "Oh, that's not bad. Let's look at the term options.", time: '0:45' },
      { speaker: 'ai', text: "Perfect. Just to make sure we find the right fit, do you have any history of major medical conditions like heart disease or diabetes?", time: '0:50' },
      { speaker: 'user', text: "No, no history of either.", time: '1:02' },
    ]
  },
  '2': {
    name: 'Maria Garcia',
    phone: '+1 (786) 555-0193',
    status: 'Qualified',
    duration: '3:51',
    result: 'qualified',
    summary: 'Interested in Term-Life $500k. Follow-up scheduled.',
    transcript: [
      { speaker: 'ai', text: "Hi Maria, this is Alex calling from Lumen Leads regarding your recent inquiry for life insurance. Do you have a quick minute?", time: '0:00' },
      { speaker: 'user', text: "Yes, I do.", time: '0:05' },
      { speaker: 'ai', text: "Excellent. I saw you were looking for coverage to protect your mortgage and family. Does half a million in coverage sound about right for your current needs?", time: '0:07' },
      { speaker: 'user', text: "Yes, $500,000 is exactly what my husband and I discussed.", time: '0:15' },
      { speaker: 'ai', text: "That makes sense. Assuming excellent health, a 20-year term for $500k is quite affordable. I can have a licensed agent reach out to finalize the application. Would tomorrow morning work for a quick call?", time: '0:21' },
      { speaker: 'user', text: "Tomorrow at 10 AM would be perfect.", time: '0:40' }
    ]
  }
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string; leadId: string }> }) {
  const { id: campaignId, leadId } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    getCampaignById(campaignId).then(setCampaign);
  }, [campaignId]);
  
  // @ts-ignore
  const leadData = LEAD_DATABASE[leadId] || {
    name: 'Unknown Lead',
    phone: '--',
    status: 'Unknown',
    duration: '--',
    result: null,
    summary: 'No data available for this lead ID.',
    transcript: []
  };

  const campaignName = campaign?.name ?? 'Campaign';

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href={`/cold-calls/campaign/${campaignId}`} className={styles.backLink}>
          ← Back to Campaign: {campaignName}
        </Link>
        <div className={styles.campaignMeta}>
          <h1>Lead Details: {leadData.name}</h1>
          <span className={`${styles.statusBadge} ${
            leadData.result === 'qualified' ? styles.statusGood :
            leadData.result === 'not_interested' ? styles.statusBad :
            styles.statusPending
          }`}>
            {leadData.status}
          </span>
        </div>
        <div className={styles.topStats}>
          <div className={styles.topStat}>
            <span>Duration</span>
            <strong>{leadData.duration}</strong>
          </div>
          <div className={styles.topStat}>
            <span>Agent</span>
            <strong>{campaign?.agent ?? 'Alex'}</strong>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <div className={`${styles.metaCard} premium-card`}>
            <h2>Lead Information</h2>
            <div className={styles.detailGrid}>
              <div>
                <span>Phone Number</span>
                <strong>{leadData.phone}</strong>
              </div>
              <div>
                <span>Outcome</span>
                <strong>{leadData.result ? leadData.result.replace('_', ' ') : 'Pending'}</strong>
              </div>
            </div>
            
            {leadData.summary && (
              <div className={styles.summaryBox}>
                <span>AI Automated Summary</span>
                <p>{leadData.summary}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.transcriptColumn}>
          <div className={`${styles.transcriptCard} premium-card`}>
            <div className={styles.transcriptHeader}>
              <h3>Call Transcript</h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>Recorded on Secure Line</span>
            </div>
            
            <div className={styles.transcriptList}>
              {leadData.transcript.length > 0 ? (
                leadData.transcript.map((msg: any, i: number) => (
                  <div key={i} className={`${styles.messageRow} ${msg.speaker === 'ai' ? styles.ai : styles.user}`}>
                    <div className={styles.messageBubble}>
                      <span className={styles.messageMeta}>
                        {msg.speaker === 'ai' ? 'Alex (AI Agent)' : leadData.name} • {msg.time}
                      </span>
                      <div className={styles.messageContent}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--secondary)', marginTop: '2rem' }}>
                  No transcript data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
