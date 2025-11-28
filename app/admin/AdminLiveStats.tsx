"use client";
import React, { useEffect, useMemo, useState } from 'react';

type Health = {
  ok: boolean;
  build?: { version?: string; commit?: string };
  services?: {
    db?: { ok: boolean; ms?: number };
    redis?: { ok: boolean | null; ms?: number };
    s3?: { ok: boolean | null; ms?: number };
  };
};

export default function AdminLiveStats({ domain, brandId, refreshMs = 15000 }: { domain?: string | null; brandId?: string | null; refreshMs?: number }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [report, setReport] = useState<{ url?: string; date?: string } | null>(null);
  const [ritualsCount, setRitualsCount] = useState<number | null>(null);
  const [asOf, setAsOf] = useState<string>("");
  const [autoOpen, setAutoOpen] = useState<boolean>(false);
  const [lastReportUrl, setLastReportUrl] = useState<string | null>(null);
  const safeDomain = useMemo(() => (domain ? String(domain) : null), [domain]);

  const refreshOnce = React.useCallback(async (signal?: AbortSignal) => {
    try {
      const [h, p, v] = await Promise.all([
        fetch('/api/health', { cache: 'no-store', signal }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/media/jobs/pending', { cache: 'no-store', signal }).then(r => r.ok ? r.json() : null).catch(() => null),
        (brandId
          ? fetch(`/api/rituals/count?brandId=${encodeURIComponent(brandId)}`, { cache: 'no-store', signal }).then(r => r.ok ? r.json() : null).catch(() => null)
          : fetch('/api/rituals', { cache: 'no-store', signal }).then(r => r.ok ? r.json() : null).catch(() => null)
        )
      ]);
      if (h) setHealth(h);
      if (p) setPending(p?.data?.pending ?? 0);
      if (v) setRitualsCount(Array.isArray(v?.data) ? v.data.length : (Array.isArray(v) ? v.length : null));
      if (v) {
        if (typeof v?.data?.count === 'number') setRitualsCount(v.data.count);
        else setRitualsCount(Array.isArray(v?.data) ? v.data.length : (Array.isArray(v) ? v.length : null));
      }
    } catch {}
    if (safeDomain) {
      try {
        const r = await fetch(`/api/reports/list?domain=${encodeURIComponent(safeDomain)}`, { cache: 'no-store', signal });
        if (r.ok) {
          const j = await r.json();
          const items = j?.data?.items || [];
          const latest = items[0];
          if (latest) {
            const newUrl = latest.url || (latest.name ? `/reports/${safeDomain}/${latest.name}` : undefined);
            setReport({ url: newUrl, date: (latest.lastModified || latest.mtime || '').toString() });
            if (autoOpen && newUrl && newUrl !== lastReportUrl) {
              try { window.open(newUrl, '_blank', 'noopener'); } catch {}
              setLastReportUrl(newUrl);
            } else if (newUrl) {
              setLastReportUrl(newUrl);
            }
          }
        }
      } catch {}
    }
    try { setAsOf(new Date().toLocaleTimeString()); } catch {}
  }, [safeDomain, brandId, autoOpen, lastReportUrl]);

  useEffect(() => {
    const ctl = new AbortController();
    refreshOnce(ctl.signal);
    const id = setInterval(() => refreshOnce(ctl.signal), Math.max(5000, refreshMs));
    return () => { ctl.abort(); clearInterval(id); };
  }, [safeDomain, refreshMs, refreshOnce]);

  return (
    <>
      <div className="card">
        <h2 className="text-sm font-semibold">Rituelen</h2>
        <p className="mt-2 text-2xl font-semibold">{ritualsCount ?? '—'}</p>
        <p className="mt-1 text-xs text-muted-foreground">stand {asOf || '—'}</p>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold">Pending image jobs</h2>
        <p className="text-2xl font-semibold mt-2">{pending ?? '—'}</p>
        <p className="text-xs text-muted-foreground mt-1">Jobs waiting in queue — as of {asOf || '—'}</p>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold">Health</h2>
        <div className="mt-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${health?.ok ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="font-medium">Overall</span>
            <span className="ml-auto text-xs">{health?.build?.version ? `v${health.build.version}` : ''} {health?.build?.commit ? `(${String(health.build.commit).slice(0,7)})` : ''}</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded border p-2">
              <div className="font-medium">DB</div>
              <div>{health?.services?.db?.ok ? `${health.services.db.ms ?? '—'} ms` : (health ? 'down' : '—')}</div>
              <div className="text-[10px] text-muted-foreground mt-1">as of {asOf || '—'}</div>
            </div>
            <div className="rounded border p-2">
              <div className="font-medium">Redis</div>
              <div>{health?.services?.redis?.ok === null ? 'n/a' : (health?.services?.redis?.ok ? `${health.services.redis.ms ?? '—'} ms` : (health ? 'down' : '—'))}</div>
              <div className="text-[10px] text-muted-foreground mt-1">as of {asOf || '—'}</div>
            </div>
            <div className="rounded border p-2">
              <div className="font-medium">S3</div>
              <div>{health?.services?.s3?.ok === null ? 'n/a' : (health?.services?.s3?.ok ? `${health.services.s3.ms ?? '—'} ms` : (health ? 'down' : '—'))}</div>
              <div className="text-[10px] text-muted-foreground mt-1">as of {asOf || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold">Reports</h2>
        {safeDomain ? (
          <div className="mt-2 text-sm">
            <div className="text-xs text-muted-foreground">Domain: {safeDomain}</div>
            <div className="mt-1">Latest: {report?.date || '—'}</div>
            <div className="mt-2">
              {report?.url ? <a href={report.url} className="text-xs underline" target="_blank" rel="noreferrer">View JSON</a> : <span className="text-xs text-muted-foreground">No reports yet</span>}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">as of {asOf || '—'}</div>
            <div className="mt-2 flex items-center gap-3">
              <button className="btn-secondary text-[10px]" onClick={() => refreshOnce()}>Refresh now</button>
              <label className="flex items-center gap-2 text-[10px] cursor-pointer">
                <input type="checkbox" checked={autoOpen} onChange={e => setAutoOpen(e.target.checked)} />
                Auto-open latest
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-xs text-muted-foreground">No brand domain available</div>
        )}
      </div>
    </>
  );
}
