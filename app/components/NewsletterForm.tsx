'use client';
import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'error'|'success'>('idle');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus('error');
      return;
    }
    // Placeholder submission
    console.log('Newsletter signup:', email);
    setStatus('success');
    setEmail('');
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3 max-w-md" aria-labelledby="newsletter-heading">
      <label htmlFor="newsletter-email" id="newsletter-heading" className="text-sm font-medium">Your Email Address</label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder="you@example.com"
        aria-invalid={status === 'error'}
        aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
      />
      {status === 'error' && <p id="newsletter-error" className="text-xs text-red-600">Enter a valid email.</p>}
      {status === 'success' && <p className="text-xs text-green-600">Thanks! You will be notified.</p>}
      <button type="submit" className="btn-primary text-sm">Notify Me</button>
    </form>
  );
}
