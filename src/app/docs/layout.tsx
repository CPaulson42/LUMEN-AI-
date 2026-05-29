import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import styles from './docs.module.css';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.docsContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarTitle}>Get Started</div>
          <Link href="/docs" className={`${styles.sidebarLink} ${styles.active}`}>
            Introduction
          </Link>
          <Link href="/docs" className={styles.sidebarLink}>
            Phone calls
          </Link>
          <Link href="/docs" className={styles.sidebarLink}>
            Web calls
          </Link>
        </div>

        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarTitle}>Assistants</div>
          <Link href="/docs" className={styles.sidebarLink}>
            Quickstart
          </Link>
          <Link href="/docs" className={styles.sidebarLink}>
            Core concepts
          </Link>
          <Link href="/docs" className={styles.sidebarLink}>
            Tools & Integrations
          </Link>
        </div>

        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarTitle}>Integrations</div>
          <Link href="/docs" className={styles.sidebarLink}>
            CRMs (GoHighLevel, etc.)
          </Link>
          <Link href="/docs" className={styles.sidebarLink}>
            OpenTable
          </Link>
          <Link href="/docs" className={styles.sidebarLink}>
            Google Suite
          </Link>
        </div>

        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarTitle}>Resources</div>
          <Link href="/docs" className={styles.sidebarLink}>
            Prompting guide
          </Link>
          <Link href="/docs" className={styles.sidebarLink}>
            Debugging
          </Link>
          <Link href="/docs" className={styles.sidebarLink}>
            API Reference
          </Link>
        </div>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
