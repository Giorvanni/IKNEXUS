"use client";
import React from 'react';

type H = { uid: string; url: string; name?: string; readyState?: string; target?: string; deployedAt: number; source?: string };

export default function DeployHistory() {
  const [items, setItems] = React.useState<H[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchNow = React.useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/deploy/history', { cache: 'no-store' });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error?.message || 'Failed');
      setItems(j.data.logs || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNow();
    const onTriggered = () => fetchNow();
    window.addEventListener('deploy-triggered', onTriggered as any);
    return () => window.removeEventListener('deploy-triggered', onTriggered as any);
  }, [fetchNow]);

  function badgeClass(state?: string) {
    switch (state) {
      case 'READY': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
      case 'BUILDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
      case 'ERROR': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200';
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">History (DB)</div>
        <button className="text-xs underline" onClick={fetchNow} disabled={refreshing}>Refresh</button>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded border border-slate-200 dark:border-slate-800">
        {items?.length === 0 && (
          <div className="p-3 text-xs text-slate-500">No deployment history stored yet.</div>
        )}
        {!items && !error && (
          <div className="p-3 text-xs text-slate-500">Loading…</div>
        )}
        {items?.map((d) => (
          <div key={d.uid} className="p-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm truncate">{d.name || d.url}</div>
              <div className="text-xs text-slate-500 truncate">{d.url}</div>
            </div>
            <div className="flex items-center gap-3">
              {d.target && <span className="text-[10px] uppercase tracking-wide text-slate-500">{d.target}</span>}
              <span className={`px-2 py-0.5 rounded text-xs ${badgeClass(d.readyState)}`}>{d.readyState}</span>
              <span className="text-xs text-slate-500">{new Date(d.deployedAt).toLocaleString()}</span>
              <a className="text-xs text-brand-700 hover:underline" href={`https://${d.url}`} target="_blank" rel="noreferrer">Open</a>
              <a className="text-xs text-brand-700 hover:underline" href={`https://${d.url}/api/ready`} target="_blank" rel="noreferrer">/api/ready</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
