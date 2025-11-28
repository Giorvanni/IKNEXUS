"use client";
import React from 'react';

export default function DeployControls({ hasStaging, hasProd, prodUrl }: { hasStaging: boolean; hasProd: boolean; prodUrl?: string }) {
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [confirmHost, setConfirmHost] = React.useState('');
  const hostFromUrl = React.useMemo(() => {
    try { return prodUrl ? new URL(prodUrl).host : ''; } catch { return ''; }
  }, [prodUrl]);

  async function triggerStaging() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/deploy/staging', { method: 'POST' });
      const j = await res.json();
      if (res.ok && j?.ok) {
        setMsg('Staging deploy triggered.');
        window.dispatchEvent(new CustomEvent('deploy-triggered', { detail: { env: 'staging' } }));
        setTimeout(() => setMsg(null), 4000);
      }
      else setMsg(j?.error?.message || 'Failed to trigger staging');
    } catch (e: any) {
      setMsg(e?.message || 'Network error');
    } finally {
      setBusy(false);
    }
  }

  async function triggerProd() {
    if (hostFromUrl && confirmHost.trim() !== hostFromUrl) {
      setMsg(`Type the production host exactly: ${hostFromUrl}`);
      return;
    }
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/deploy/prod', { method: 'POST' });
      const j = await res.json();
      if (res.ok && j?.ok) setMsg('Production deploy triggered.');
      else setMsg(j?.error?.message || 'Failed to trigger production');
      if (res.ok && j?.ok) {
        window.dispatchEvent(new CustomEvent('deploy-triggered', { detail: { env: 'production' } }));
        setTimeout(() => setMsg(null), 5000);
      }
    } catch (e: any) {
      setMsg(e?.message || 'Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600 dark:text-slate-300">Manage deployments</div>
      <div className="flex items-center gap-2">
        <button disabled={!hasStaging || busy} onClick={triggerStaging} className="btn-primary disabled:opacity-50">
          {busy ? 'Triggering…' : 'Deploy Staging'}
        </button>
        {!hasStaging && <span className="text-xs text-slate-500">Configure VERCEL_DEPLOY_HOOK_STAGING to enable</span>}
      </div>
      <div className="flex items-center gap-2">
        {hasProd && hostFromUrl && (
          <input
            className="input text-xs"
            placeholder={`Type ${hostFromUrl} to confirm`}
            value={confirmHost}
            onChange={(e) => setConfirmHost(e.target.value)}
          />
        )}
        <button disabled={!hasProd || busy} onClick={triggerProd} className="btn-secondary disabled:opacity-50">
          {busy ? 'Triggering…' : 'Deploy Production'}
        </button>
        {!hasProd && <span className="text-xs text-slate-500">Configure VERCEL_DEPLOY_HOOK_PROD to enable</span>}
      </div>
      {msg && <div className="text-xs text-slate-700 dark:text-slate-300">{msg}</div>}
    </div>
  );
}
