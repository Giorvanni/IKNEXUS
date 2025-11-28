"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid credentials');
    } else {
      window.location.href = '/admin';
    }
  }

  return (
    <section className="pt-12">
      <div className="container max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" placeholder="jij@voorbeeld.nl" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button type="submit" disabled={loading || !email || !password} className="btn-primary w-full text-sm disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Gebruik je beheerder‑account om toegang te krijgen tot het admin‑portaal.</p>
        </form>
      </div>
    </section>
  );
}
