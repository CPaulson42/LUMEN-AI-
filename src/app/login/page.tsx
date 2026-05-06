'use client';

import { useActionState, useState } from 'react';
import styles from './page.module.css';
import { login, signup } from './actions';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [state, action, isPending] = useActionState(isLogin ? login : signup, null);

  return (
    <main className={styles.main}>
      <div className={`${styles.loginCard} glass-panel fade-in`}>
        <div className={styles.header}>
          <h1>{isLogin ? 'Welcome back' : 'Create an account'}</h1>
          <p>{isLogin ? 'Enter your details to access your dashboard' : 'Start automating your outbound calls today'}</p>
        </div>

        {state?.error && <div className={styles.error}>{state.error}</div>}

        <form className={styles.form} action={action}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className={styles.input} 
              placeholder="you@company.com"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className={styles.input} 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className={styles.primaryButton} disabled={isPending}>
            {isPending ? 'Authenticating...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button 
          className={styles.secondaryButton} 
          onClick={() => { setIsLogin(!isLogin); }}
          disabled={isPending}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
