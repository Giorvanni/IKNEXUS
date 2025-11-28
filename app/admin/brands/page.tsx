 "use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface Brand {
  id: string;
  name: string;
  slug?: string | null;
  domain?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  showInNav?: boolean | null;
  navOrder?: number | null;
  logoUrl?: string | null;
}

interface DraftLink {
  id: string;
  label: string;
  href: string;
  order: number;
  brandId: string;
}

type DraftInput = Pick<DraftLink, 'label' | 'href' | 'order'>;

type BrandFormState = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  showInNav: boolean;
  navOrder: number;
  logoUrl: string;
};

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { message?: string };
};

const defaultForm: BrandFormState = {
  name: '',
  primaryColor: '#0ea5e9',
  secondaryColor: '#ff7a00',
  showInNav: true,
  navOrder: 0,
  logoUrl: ''
};

const defaultDraft: DraftInput = { label: '', href: '', order: 0 };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';
const isApiEnvelope = (payload: unknown): payload is ApiEnvelope<unknown> => isRecord(payload) && typeof payload.ok === 'boolean';

function extractMessage(payload: unknown, fallback: string) {
  if (isApiEnvelope(payload)) {
    return payload.error?.message || fallback;
  }
  if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === 'string') {
    return payload.error.message;
  }
  return fallback;
}

function unwrapData<T>(payload: unknown, fallback: string): T {
  if (isApiEnvelope(payload)) {
    if (!payload.ok) {
      throw new Error(payload.error?.message || fallback);
    }
    return (payload.data as T) ?? (undefined as T);
  }
  return payload as T;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const payload = await parseBody(res);
  if (!res.ok) {
    throw new Error(extractMessage(payload, res.statusText));
  }
  if (payload === null) {
    return undefined as T;
  }
  return unwrapData<T>(payload, res.statusText);
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const sortDrafts = (a: DraftLink, b: DraftLink) => a.order - b.order;

export default function BrandSettingsPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandFormState>(defaultForm);
  const [drafts, setDrafts] = useState<DraftLink[]>([]);
  const [newDraft, setNewDraft] = useState<DraftInput>(defaultDraft);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function bootstrap() {
      try {
        const [brandList, draftList] = await Promise.all([
          fetchJson<Brand[]>('/api/brands', { signal: controller.signal }),
          fetchJson<DraftLink[]>('/api/navigation/drafts', { signal: controller.signal })
        ]);
        if (!mounted) return;
        if (brandList.length) {
          const b = brandList[0];
          setBrand(b);
          setForm({
            name: b.name,
            primaryColor: b.primaryColor || defaultForm.primaryColor,
            secondaryColor: b.secondaryColor || defaultForm.secondaryColor,
            showInNav: b.showInNav ?? defaultForm.showInNav,
            navOrder: b.navOrder ?? defaultForm.navOrder,
            logoUrl: b.logoUrl || ''
          });
        }
        setDrafts(draftList.slice().sort(sortDrafts));
      } catch (error) {
        if (!mounted || isAbortError(error)) return;
        setMessage(error instanceof Error ? error.message : 'Failed to load admin data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  function update<K extends keyof BrandFormState>(key: K, value: BrandFormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function deriveKeyFromUrl(url: string) {
    try {
      const u = new URL(url, window.location.origin);
      return decodeURIComponent(u.pathname.split('/').pop() || '');
    } catch {
      return '';
    }
  }

  async function save() {
    if (!brand) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await fetchJson<Brand>(`/api/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setBrand(updated);
      setForm({
        name: updated.name,
        primaryColor: updated.primaryColor || defaultForm.primaryColor,
        secondaryColor: updated.secondaryColor || defaultForm.secondaryColor,
        showInNav: updated.showInNav ?? defaultForm.showInNav,
        navOrder: updated.navOrder ?? defaultForm.navOrder,
        logoUrl: updated.logoUrl || ''
      });
      setMessage('Saved');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogo(file: File) {
    if (!brand) return;
    setMessage(null);
    try {
      const sizeMB = Number((file.size / (1024 * 1024)).toFixed(2));
      const presign = await fetchJson<{
        url: string;
        publicUrl?: string | null;
      }>('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, sizeMB })
      });
      const upload = await fetch(presign.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      if (!upload.ok) {
        throw new Error('Logo upload failed');
      }
      const nextUrl = presign.publicUrl || presign.url.split('?')[0];
      update('logoUrl', nextUrl);
      setMessage('Logo uploaded');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Logo upload failed');
    }
  }

  async function generateLogoVariants() {
    if (!form.logoUrl) return;
    const key = deriveKeyFromUrl(form.logoUrl);
    if (!key) {
      setMessage('Cannot derive key from logo URL');
      return;
    }
    const widths = (process.env.NEXT_PUBLIC_IMAGE_VARIANT_WIDTHS || '320,640,1280')
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => Number.isFinite(n) && n > 0)
      .slice(0, 6);
    try {
      await fetchJson<{ variants: { width: number; url: string }[] }>('/api/media/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, widths })
      });
      setMessage('Thumbnails enqueued/generated');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Thumbnail generation failed');
    }
  }

  async function generateAggregates() {
    if (!brand) return;
    const domain = brand.domain || brand.slug;
    if (!domain) {
      setMessage('No domain or slug available for this brand');
      return;
    }
    try {
      await fetchJson('/api/reports/aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      setMessage(`Aggregates generated for ${domain}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Aggregation failed');
    }
  }

  async function createDraft() {
    if (!brand) {
      setMessage('Brand must be loaded before drafting navigation');
      return;
    }
    if (!newDraft.label || !newDraft.href) {
      setMessage('Label and href are required');
      return;
    }
    try {
      const created = await fetchJson<DraftLink>('/api/navigation/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDraft, brandId: brand.id })
      });
      setDrafts(d => [...d, created].sort(sortDrafts));
      setNewDraft(defaultDraft);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create draft');
    }
  }

  async function publishDraft(id: string) {
    try {
      const published = await fetchJson<DraftLink>(`/api/navigation/drafts/${id}/publish`, { method: 'POST' });
      setDrafts(d => d.filter(x => x.id !== id));
      setMessage(`Published ${published.label}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to publish draft');
    }
  }

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Brand Settings</h1>
      {loading && <p className="text-sm mt-4">Loading brand…</p>}
      {!loading && !brand && (
        <p className="text-sm mt-4 text-red-600">No brand records available. Create a brand via the admin API to continue.</p>
      )}
      {!loading && brand && (
        <div className="mt-6 flex flex-col gap-4 max-w-md">
          <label className="flex flex-col gap-1 text-sm">
            <span>Name</span>
            <input value={form.name} onChange={e => update('name', e.target.value)} className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Primary Color</span>
            <input type="text" value={form.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="input" placeholder="#0ea5e9" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Secondary Color</span>
            <input type="text" value={form.secondaryColor} onChange={e => update('secondaryColor', e.target.value)} className="input" placeholder="#ff7a00" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showInNav} onChange={e => update('showInNav', e.target.checked)} /> Show in navigation
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Navigation Order</span>
            <input type="number" value={form.navOrder} onChange={e => update('navOrder', toNumber(e.target.value))} className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Logo Upload</span>
            <input type="file" accept="image/*" onChange={e => e.target.files && handleLogo(e.target.files[0])} />
            {form.logoUrl && (
              <Image
                src={form.logoUrl}
                alt="Brand logo preview"
                width={180}
                height={48}
                className="h-12 mt-2 w-auto object-contain"
                unoptimized
                priority
              />
            )}
          </label>
          <div className="flex gap-2">
            <button disabled={saving} onClick={save} className="btn-primary text-xs disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            {form.logoUrl && (
              <button type="button" onClick={generateLogoVariants} className="btn-secondary text-xs">
                Generate thumbnails
              </button>
            )}
            <button type="button" onClick={generateAggregates} className="btn-secondary text-xs">
              Generate aggregates
            </button>
          </div>
          {message && (
            <p className="text-xs" role="alert">
              {message}
            </p>
          )}
          <div className="h-16 w-full rounded-md border border-slate-200 dark:border-slate-700 flex overflow-hidden">
            <div style={{ background: form.primaryColor }} className="flex-1" />
            <div style={{ background: form.secondaryColor }} className="flex-1" />
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Navigation Drafts</h2>
            <div className="flex flex-col gap-2 mt-2">
              <input placeholder="Label" value={newDraft.label} onChange={e => setNewDraft(d => ({ ...d, label: e.target.value }))} className="input" />
              <input placeholder="Href" value={newDraft.href} onChange={e => setNewDraft(d => ({ ...d, href: e.target.value }))} className="input" />
              <input type="number" placeholder="Order" value={newDraft.order} onChange={e => setNewDraft(d => ({ ...d, order: toNumber(e.target.value) }))} className="input" />
              <button onClick={createDraft} className="btn-secondary text-xs">
                Add Draft
              </button>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {drafts.map(d => (
                <li key={d.id} className="flex items-center justify-between text-xs border px-2 py-1 rounded">
                  <span>
                    {d.label} → {d.href} (order {d.order})
                  </span>
                  <button onClick={() => publishDraft(d.id)} className="btn-primary text-[10px]">
                    Publish
                  </button>
                </li>
              ))}
              {!drafts.length && <li className="text-xs opacity-50">No drafts</li>}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}