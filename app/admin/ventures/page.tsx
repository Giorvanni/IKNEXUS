"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface RitualApi {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  valueProps: string[];
  ctaLabel?: string | null;
  brandId: string;
  // booking fields
  durationMinutes?: number | null;
  priceCents?: number | null;
  currency?: string | null;
  bookingLink?: string | null;
  contraindications?: string | null;
  faq?: { question: string; answer: string }[] | null;
}

export default function AdminRitualsPage() {
  const [rituals, setRituals] = useState<RitualApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<RitualApi>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateRemaining, setRateRemaining] = useState<number | null>(null);
  const [rateLimit, setRateLimit] = useState<number | null>(null);
  const [rateResetEpoch, setRateResetEpoch] = useState<number | null>(null);
  const [rateCountdown, setRateCountdown] = useState<number>(0);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Countdown timer for rate limit reset
  useEffect(() => {
    if (!rateResetEpoch) return;
    const id = setInterval(() => {
      const now = Date.now();
      const msLeft = rateResetEpoch * 1000 - now;
      setRateCountdown(msLeft > 0 ? Math.ceil(msLeft / 1000) : 0);
      if (msLeft <= 0) {
        // Expired; request fresh limit by triggering a lightweight GET
        load();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [rateResetEpoch]);

  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const canCreate = role === 'ADMIN' || role === 'EDITOR';
  const canDelete = role === 'ADMIN';

  async function load() {
    setLoading(true);
    const res = await fetch('/api/rituals');
    const data = await res.json();
    // API now returns { ok, data }
    setRituals(Array.isArray(data) ? data : data.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(v: RitualApi) {
    setEditingSlug(v.slug);
    setForm(v);
  }

  function cancelEdit() {
    setEditingSlug(null);
    setForm({});
    setError(null);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const res = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, sizeMB: +(file.size / (1024*1024)).toFixed(2) })
      });
      if (!res.ok) throw new Error('Failed to presign');
      const { data } = await res.json();
      const putRes = await fetch(data.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!putRes.ok) throw new Error('Upload failed');
      const publicUrl: string | null = data.publicUrl || null;
      if (publicUrl) {
        setForm(f => ({ ...f, featuredImageUrl: publicUrl }));
        setSavedMsg('Afbeelding geüpload');
        setTimeout(() => setSavedMsg(null), 2500);
      } else {
        setError('Upload succeeded but no public URL was returned by provider.');
      }
    } catch (e: any) {
      setError(e?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function extractS3KeyFromUrl(url: string): string | null {
    try {
      const u = new URL(url);
      if (!u.hostname.includes('s3.amazonaws.com')) return null;
      return decodeURIComponent(u.pathname.replace(/^\//, ''));
    } catch {
      return null;
    }
  }

  async function generateThumbnails() {
    if (!form.featuredImageUrl) return;
    const key = extractS3KeyFromUrl(form.featuredImageUrl);
    if (!key) { setError('Thumbnails are only supported for S3-hosted images.'); return; }
    const res = await fetch('/api/media/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, widths: [320,640,1280] }) });
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error?.message || 'Failed to generate thumbnails');
    } else {
      setSavedMsg('Thumbnails gestart');
      setTimeout(() => setSavedMsg(null), 2500);
    }
  }

  async function saveEdit() {
    if (!editingSlug) return;
    // Basic client-side validation to avoid 400s from the API
    const n = (form.name || '').trim();
    const sd = (form.shortDescription || '').trim();
    const ld = (form.longDescription || '').trim();
    if (n.length < 2) {
      setError('Naam moet minimaal 2 tekens bevatten.');
      return;
    }
    if (sd.length < 10) {
      setError('Korte omschrijving moet minimaal 10 tekens bevatten.');
      return;
    }
    if (ld.length > 0 && ld.length < 20) {
      setError('Lange omschrijving moet minimaal 20 tekens bevatten (of leeg laten).');
      return;
    }
    setSaving(true);
    setError(null);
    // Convert friendly inputs to API shape
    const priceEurosStr = (form as any).priceEuros as string | undefined;
    let priceCentsToSend: number | null | undefined = (form as any).priceCents as any;
    if (typeof priceEurosStr === 'string') {
      const normalized = priceEurosStr.replace(',', '.').trim();
      if (normalized === '') {
        priceCentsToSend = null; // explicit clear
      } else {
        const num = Number(normalized);
        if (!Number.isNaN(num)) priceCentsToSend = Math.round(num * 100);
      }
    }
    const contraindicationsToSend = typeof (form as any).contraindications === 'string'
      ? (form as any).contraindications
      : Array.isArray((form as any).contraindications)
        ? ((form as any).contraindications as string[]).filter(Boolean).join('\n')
        : undefined;

    let faqToSend: { question: string; answer: string }[] | undefined;
    if (Array.isArray((form as any).faq)) {
      const normalized = ((form as any).faq as any[]).map((qa) => ({
        question: (qa?.question || '').trim(),
        answer: (qa?.answer || '').trim()
      }));
      faqToSend = normalized.filter((qa) => qa.question.length >= 3 && qa.answer.length >= 3);
    }

    const res = await fetch(`/api/rituals/${editingSlug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        featuredImageUrl: form.featuredImageUrl,
        featuredImageAlt: form.featuredImageAlt,
        tagline: (form as any).tagline,
        valueProps: Array.isArray((form as any).valueProps) ? (form as any).valueProps : undefined,
        durationMinutes: (form as any).durationMinutes ?? undefined,
        priceCents: priceCentsToSend,
        currency: (form as any).currency ?? undefined,
        bookingLink: (form as any).bookingLink ?? undefined,
        contraindications: contraindicationsToSend,
        faq: faqToSend
      })
    });
    setSaving(false);
    if (!res.ok) {
      try {
        const j = await res.json();
        if (j?.error?.code === 'VALIDATION' && Array.isArray(j.error.details)) {
          const first = j.error.details[0];
          setError(`Validatiefout: ${(first?.path?.join('.') || '').toString()} ${first?.message || ''}`.trim());
        } else if (j?.error?.message) {
          setError(j.error.message);
        } else {
          setError('Failed to save changes');
        }
      } catch {
        setError('Opslaan mislukt.');
        setError('Opslaan mislukt.');
      }
      return;
    }
    const updatedResp = await res.json();
    const updated = updatedResp.data || updatedResp;
    // Rate limit info either in JSON rateLimit object or headers
    let resetSeconds: number | null = null;
    if (updatedResp.rateLimit) {
      const limit = parseInt(updatedResp.rateLimit['X-RateLimit-Limit'] || '0', 10);
      const remaining = parseInt(updatedResp.rateLimit['X-RateLimit-Remaining'] || '0', 10);
      resetSeconds = parseInt(updatedResp.rateLimit['X-RateLimit-Reset'] || '0', 10);
      if (!isNaN(limit)) setRateLimit(limit);
      if (!isNaN(remaining)) setRateRemaining(remaining);
    } else {
      const hdrLimit = parseInt(res.headers.get('X-RateLimit-Limit') || '');
      const hdrRemaining = parseInt(res.headers.get('X-RateLimit-Remaining') || '');
      resetSeconds = parseInt(res.headers.get('X-RateLimit-Reset') || '');
      if (!isNaN(hdrLimit)) setRateLimit(hdrLimit);
      if (!isNaN(hdrRemaining)) setRateRemaining(hdrRemaining);
    }
    if (resetSeconds && !isNaN(resetSeconds)) setRateResetEpoch(resetSeconds);
    setRituals(prev => prev.map(v => v.slug === editingSlug ? updated : v));
    cancelEdit();
    setSavedMsg('Wijzigingen opgeslagen');
    setTimeout(() => setSavedMsg(null), 2500);
  }

  async function createRitual() {
    const baseSlug = `nieuw-ritueel-${Date.now()}`;
    const payload = {
      name: 'Nieuw ritueel',
      slug: baseSlug,
      shortDescription: 'Korte omschrijving van het ritueel...',
      longDescription: 'Lange omschrijving van het ritueel...',
      valueProps: ['Voordeel 1', 'Voordeel 2'],
      ctaLabel: 'Ontdek ritueel',
      brandId: rituals[0]?.brandId || ''
    };
    const res = await fetch('/api/rituals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const createdResp = await res.json();
      const created = createdResp.data || createdResp; 
      setRituals(prev => [...prev, created]);
      setSavedMsg('Nieuw ritueel aangemaakt');
      setTimeout(() => setSavedMsg(null), 2500);
    }
  }

  async function deleteRitual(slug: string) {
    if (!confirm('Dit ritueel verwijderen?')) return;
    const res = await fetch(`/api/rituals/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      setRituals(prev => prev.filter(v => v.slug !== slug));
      setSavedMsg('Ritueel verwijderd');
      setTimeout(() => setSavedMsg(null), 2500);
    }
  }

  return (
    <section className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Rituelen</h1>
        {canCreate && <button onClick={createRitual} className="btn-primary text-xs">Nieuw ritueel</button>}
      </div>
      <div className="mt-2 min-h-[1.5rem]">
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {!error && savedMsg && <p className="text-sm text-green-700" role="status" aria-live="polite">{savedMsg}</p>}
      </div>
      {loading ? (
        <p className="subtle mt-4 text-sm">Rituelen laden...</p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {rateLimit !== null && rateRemaining !== null && (
            <div className="md:col-span-2 mb-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-4">
              <span>Update rate limit: {rateRemaining}/{rateLimit} remaining.</span>
              {rateResetEpoch && (
                <span className={rateRemaining === 0 ? 'text-red-600' : ''}>
                  Reset in {rateCountdown}s
                </span>
              )}
            </div>
          )}
          {rituals.map(v => (
            <div key={v.slug} className="card">
              {editingSlug === v.slug ? (
                <div className="flex flex-col gap-3">
                  <input
                    className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    value={form.name || ''}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Name"
                  />
                  <textarea
                    rows={3}
                    className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    value={form.shortDescription || ''}
                    onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                    placeholder="Short Description"
                  />
                  <textarea
                    rows={6}
                    className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    value={form.longDescription || ''}
                    onChange={e => setForm(f => ({ ...f, longDescription: e.target.value }))}
                    placeholder="Long Description"
                  />
                  <input
                    type="text"
                    className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    value={(form as any).tagline || ''}
                    onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                    placeholder="Tagline (optional)"
                  />
                  <div className="grid gap-2">
                    <label className="text-xs font-medium">Kernpunten (één per regel)</label>
                    <textarea
                      rows={4}
                      className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                      value={(Array.isArray((form as any).valueProps) ? (form as any).valueProps : []).join('\n')}
                      onChange={e => setForm(f => ({ ...f, valueProps: e.target.value.split(/\r?\n/).filter(Boolean) as any }))}
                      placeholder={"Bijv.\nDiepe ontspanning\nVerbeterde mobiliteit"}
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium">Duur (minuten)</label>
                      <input
                        type="number"
                        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                        value={(form as any).durationMinutes ?? ''}
                        min={15}
                        step={15}
                        onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value ? parseInt(e.target.value, 10) : null }))}
                        placeholder="Bijv. 90"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] subtle">In stappen van 15 minuten.</p>
                        <button type="button" className="text-[11px] underline" onClick={() => setForm(f => ({ ...f, durationMinutes: null }))}>Wis</button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium">Prijs</label>
                      <input
                        type="text"
                        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                        value={(form as any).priceEuros ?? (typeof (form as any).priceCents === 'number' ? ((form as any).priceCents / 100).toFixed(2) : '')}
                        onChange={e => setForm(f => ({ ...f, priceEuros: e.target.value }))}
                        placeholder="Bijv. 120,00"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] subtle">Voer prijs in euro (bijv. 120,00).</p>
                        <button type="button" className="text-[11px] underline" onClick={() => setForm(f => ({ ...f, priceEuros: '', priceCents: null }))}>Wis</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium">Valuta</label>
                      <select
                        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                        value={(form as any).currency ?? 'EUR'}
                        onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium">Boekingslink</label>
                      <input
                        type="url"
                        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                        value={(form as any).bookingLink ?? ''}
                        onChange={e => setForm(f => ({ ...f, bookingLink: e.target.value }))}
                        placeholder="https://... of /bookings/..."
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] subtle">Laat leeg of kies een externe boekingslink.</p>
                        <button type="button" className="text-[11px] underline" onClick={() => setForm(f => ({ ...f, bookingLink: null }))}>Wis</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium">Contra‑indicaties</label>
                    <div className="flex flex-col gap-2">
                      {(() => {
                        const list = String((form as any).contraindications || '')
                          .split(/\r?\n/)
                          .filter(Boolean);
                        return list.length > 0 ? list.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                              value={item}
                              onChange={e => setForm(f => {
                                const arr = String((f as any).contraindications || '').split(/\r?\n/);
                                arr[idx] = e.target.value;
                                return { ...f, contraindications: arr.join('\n') };
                              })}
                              placeholder="Bijv. Koorts of griep"
                            />
                            <button type="button" className="btn-secondary text-xs" onClick={() => setForm(f => {
                              const arr = String((f as any).contraindications || '').split(/\r?\n/).filter(Boolean);
                              arr.splice(idx, 1);
                              return { ...f, contraindications: arr.join('\n') };
                            })}>Verwijderen</button>
                          </div>
                        )) : <p className="text-xs subtle">Nog geen contra‑indicaties.</p>;
                      })()}
                      <div className="flex gap-2">
                        <button type="button" className="btn-secondary text-xs" onClick={() => setForm(f => {
                          const arr = String((f as any).contraindications || '').split(/\r?\n/).filter(Boolean);
                          arr.push('');
                          return { ...f, contraindications: arr.join('\n') };
                        })}>Item toevoegen</button>
                        <button type="button" className="text-[11px] underline" onClick={() => setForm(f => ({ ...f, contraindications: null }))}>Wis alles</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium">FAQ</label>
                    <div className="flex flex-col gap-3">
                      {Array.isArray((form as any).faq) && (form as any).faq.length > 0 ? (
                        ((form as any).faq as any[]).map((qa, idx) => (
                          <div key={idx} className="rounded-md border border-slate-200 dark:border-slate-700 p-3 grid gap-2">
                            <input
                              type="text"
                              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                              value={qa.question || ''}
                              onChange={e => setForm(f => {
                                const arr = Array.isArray((f as any).faq) ? ([...(f as any).faq] as any[]) : [];
                                arr[idx] = { ...(arr[idx] || {}), question: e.target.value };
                                return { ...f, faq: arr as any };
                              })}
                              placeholder="Vraag"
                            />
                            <textarea
                              rows={3}
                              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                              value={qa.answer || ''}
                              onChange={e => setForm(f => {
                                const arr = Array.isArray((f as any).faq) ? ([...(f as any).faq] as any[]) : [];
                                arr[idx] = { ...(arr[idx] || {}), answer: e.target.value };
                                return { ...f, faq: arr as any };
                              })}
                              placeholder="Antwoord"
                            />
                            <div className="flex justify-end">
                              <button type="button" onClick={() => setForm(f => {
                                const arr = Array.isArray((f as any).faq) ? ([...(f as any).faq] as any[]) : [];
                                arr.splice(idx, 1);
                                return { ...f, faq: arr as any };
                              })} className="btn-secondary text-xs">Verwijderen</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs subtle">Nog geen FAQ-items.</p>
                      )}
                      <div>
                        <button type="button" onClick={() => setForm(f => {
                          const arr = Array.isArray((f as any).faq) ? ([...(f as any).faq] as any[]) : [];
                          arr.push({ question: '', answer: '' });
                          return { ...f, faq: arr as any };
                        })} className="btn-secondary text-xs">FAQ-item toevoegen</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium">Featured image</label>
                    {form.featuredImageUrl ? (
                      <Image src={form.featuredImageUrl} alt={form.featuredImageAlt || ''} width={640} height={256} className="rounded-md max-h-40 object-cover" />
                    ) : (
                      <p className="text-xs subtle">No image selected</p>
                    )}
                    <input
                      type="url"
                      className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                      value={form.featuredImageUrl || ''}
                      onChange={e => setForm(f => ({ ...f, featuredImageUrl: e.target.value }))}
                      placeholder="Paste image URL"
                    />
                    <input
                      type="text"
                      className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                      value={form.featuredImageAlt || ''}
                      onChange={e => setForm(f => ({ ...f, featuredImageAlt: e.target.value }))}
                      placeholder="Alt text (accessibility)"
                    />
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={e => e.target.files && e.target.files[0] && handleImageUpload(e.target.files[0])} />
                      {uploading && <span className="text-xs subtle">Uploading…</span>}
                      {form.featuredImageUrl && (
                        <>
                          <button type="button" onClick={generateThumbnails} className="btn-secondary text-xs">Generate thumbnails</button>
                          <button type="button" onClick={() => setForm(f => ({ ...f, featuredImageUrl: null, featuredImageAlt: null }))} className="text-[11px] underline">Verwijder</button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="btn-primary text-xs disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
                    <button onClick={cancelEdit} className="btn-secondary text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-sm font-semibold tracking-tight">{v.name}</h2>
                  <p className="subtle mt-2 text-xs">{v.shortDescription}</p>
                  {Array.isArray(v.valueProps) ? (
                    v.valueProps.length > 0 ? (
                      <ul className="mt-2 list-disc pl-4 text-[11px] text-slate-600 dark:text-slate-300">
                        {v.valueProps.map((vp, i) => <li key={i}>{vp}</li>)}
                      </ul>
                    ) : (
                      <p className="text-[11px] italic text-slate-500 mt-2">No value props defined.</p>
                    )
                  ) : (
                    <p className="text-[11px] italic text-slate-500 mt-2">Value props not loaded.</p>
                  )}
                  {v.featuredImageUrl && (
                    <Image src={v.featuredImageUrl} alt={v.featuredImageAlt || ''} width={640} height={256} className="rounded-md mt-3 max-h-40 object-cover" />
                  )}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => startEdit(v)} className="btn-secondary text-xs">Bewerken</button>
                    {canDelete && <button onClick={() => deleteRitual(v.slug)} className="btn-secondary text-xs">Verwijderen</button>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
