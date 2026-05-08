'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      // Store in cookie for 30 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `lumen_referral=${ref}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      
      // Also store in localStorage as a backup
      localStorage.setItem('lumen_referral', ref);
      
      console.log('Referral tracked:', ref);
    }
  }, [searchParams]);

  return null;
}
