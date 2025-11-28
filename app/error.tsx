"use client";
import React from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main className="p-6">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{error.message || 'An unexpected error occurred.'}</p>
          {error?.digest && <p className="mt-1 text-xs text-slate-500">Ref: {error.digest}</p>}
          <button onClick={() => reset()} className="btn-primary mt-4 text-xs">Try again</button>
        </main>
      </body>
    </html>
  );
}
