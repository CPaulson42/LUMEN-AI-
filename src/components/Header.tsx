'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) return;

    // Check active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load persisted preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('lumen_theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (saved === 'light') {
      setDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    const attr = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', attr);
    localStorage.setItem('lumen_theme', attr);
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoGroup}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <img
                src="/neon-lighthouse.jpg"
                alt="Lumen Leads Logo"
                style={{ width: '36px', height: '36px', borderRadius: '0.6rem' }}
                className={styles.logoImage}
              />
            </div>
            <span className={styles.logoText}>Lumen Leads</span>
          </div>
        </Link>
        <div className={styles.separator}></div>
        <span className={styles.tagline}>Shedding light on hidden opportunities</span>
      </div>

      <nav className={styles.nav}>
        <Link
          href="/"
          className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
        >
          Why Lumen
        </Link>
        <Link
          href="/cold-calls"
          className={`${styles.navLink} ${pathname?.startsWith('/cold-calls') ? styles.active : ''}`}
        >
          Cold Calls
        </Link>
        <Link
          href="/pricing"
          className={`${styles.navLink} ${pathname?.startsWith('/pricing') ? styles.active : ''}`}
        >
          Pricing
        </Link>
        <Link
          href="/billing"
          className={`${styles.navLink} ${pathname?.startsWith('/billing') ? styles.active : ''}`}
        >
          Billing
        </Link>
        <Link
          href="/admin"
          className={`${styles.navLink} ${pathname?.startsWith('/admin') ? styles.active : ''}`}
        >
          Admin Portal
        </Link>
        <Link
          href="/partner"
          className={`${styles.navLink} ${pathname?.startsWith('/partner') ? styles.active : ''}`}
        >
          Partner Portal
        </Link>
      </nav>

      <div className={styles.rightGroup}>
        {user ? (
          <button onClick={handleSignOut} className={styles.btnDemo} style={{ background: 'transparent', color: 'var(--foreground)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Sign Out
          </button>
        ) : (
          <Link href="/login" className={styles.btnDemo}>
            Log In
          </Link>
        )}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {dark ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </button>
      </div>
    </header>
  );
}
