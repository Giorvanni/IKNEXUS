"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface BlogSection {
  heading: string;
  body: string;
  kicker?: string;
  emphasis?: boolean;
}

interface BlogContent {
  kicker?: string;
  intro?: string;
  sections: BlogSection[];
  highlight?: { text: string; attribution?: string } | null;
  outro?: string;
  resources?: { label: string; href: string }[];
}

interface BlogPostForm {
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  authorName?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  readingMinutes?: number | null;
  published: boolean;
  content: BlogContent;
}

const MIN_SECTIONS = 1;
const MAX_SECTIONS = 8;

export default function AdminBlogEditorPage() {
  const params = useParams<{ slug: string }>();
  const [form, setForm] = useState<BlogPostForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blog/${params.slug}?preview=1`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Artikel niet gevonden');
        }
        const payload = await res.json();
        const data = payload?.data || payload;
        const normalized: BlogPostForm = {
          title: data.title,
          excerpt: data.excerpt || '',
          coverImageUrl: data.coverImageUrl,
          coverImageAlt: data.coverImageAlt,
          authorName: data.authorName,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          readingMinutes: data.readingMinutes,
          published: data.published,
          content: {
            kicker: data.content?.kicker,
            intro: data.content?.intro,
            sections: Array.isArray(data.content?.sections) && data.content.sections.length > 0 ? data.content.sections : [{ heading: 'Nieuwe sectie', body: '' }],
            highlight: data.content?.highlight ?? null,
            outro: data.content?.outro,
            resources: data.content?.resources || []
          }
        };
        setForm(normalized);
      } catch (e: any) {
        setError(e?.message || 'Kon blogartikel niet laden');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

  function updateContent(patch: Partial<BlogContent>) {
    setForm((prev) => (prev ? { ...prev, content: { ...prev.content, ...patch } } : prev));
  }

  function updateSection(index: number, patch: Partial<BlogSection>) {
    setForm((prev) => {
      if (!prev) return prev;
      const sections = [...prev.content.sections];
      sections[index] = { ...sections[index], ...patch };
      return { ...prev, content: { ...prev.content, sections } };
    });
  }

  function addSection() {
    setForm((prev) => {
      if (!prev || prev.content.sections.length >= MAX_SECTIONS) return prev;
      return {
        ...prev,
        content: {
          ...prev.content,
          sections: [...prev.content.sections, { heading: 'Nieuwe sectie', body: '', kicker: '', emphasis: false }]
        }
      };
    });
  }

  function removeSection(index: number) {
    setForm((prev) => {
      if (!prev) return prev;
      if (prev.content.sections.length <= MIN_SECTIONS) return prev;
      const sections = prev.content.sections.filter((_, idx) => idx !== index);
      return { ...prev, content: { ...prev.content, sections } };
    });
  }

  function updateResource(index: number, patch: { label?: string; href?: string }) {
    setForm((prev) => {
      if (!prev) return prev;
      const resources = [...(prev.content.resources || [])];
      resources[index] = { ...resources[index], ...patch };
      return { ...prev, content: { ...prev.content, resources } };
    });
  }

  function addResource() {
    setForm((prev) => {
      if (!prev) return prev;
      const resources = [...(prev.content.resources || []), { label: 'Nieuwe link', href: '/contact' }];
      return { ...prev, content: { ...prev.content, resources } };
    });
  }

  function removeResource(index: number) {
    setForm((prev) => {
      if (!prev) return prev;
      const resources = (prev.content.resources || []).filter((_, idx) => idx !== index);
      return { ...prev, content: { ...prev.content, resources } };
    });
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/blog/${params.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt || null,
          coverImageUrl: form.coverImageUrl || null,
          coverImageAlt: form.coverImageAlt || null,
          authorName: form.authorName || null,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
          readingMinutes: typeof form.readingMinutes === 'number' ? form.readingMinutes : null,
          published: form.published,
          content: {
            kicker: form.content.kicker || undefined,
            intro: form.content.intro || undefined,
            sections: form.content.sections.map((section) => ({
              heading: section.heading,
              body: section.body,
              kicker: section.kicker || undefined,
              emphasis: section.emphasis || undefined
            })),
            highlight: form.content.highlight?.text ? form.content.highlight : undefined,
            outro: form.content.outro || undefined,
            resources: form.content.resources?.filter((r) => r.label && r.href)
          }
        })
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error?.message || 'Opslaan mislukt');
      }
      const payload = await res.json();
      const updated = payload?.data || payload;
      setForm((prev) => (prev ? { ...prev, published: updated.published } : prev));
      setSuccess('Wijzigingen opgeslagen');
      setTimeout(() => setSuccess(null), 2500);
    } catch (e: any) {
      setError(e?.message || 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished() {
    if (!form) return;
    setForm((prev) => (prev ? { ...prev, published: !prev.published } : prev));
  }

  if (loading) {
    return (
      <section className="p-6">
        <p className="text-sm text-slate-500">Artikel laden...</p>
      </section>
    );
  }

  if (!form) {
    return (
      <section className="p-6">
        <p className="text-sm text-red-600">{error || 'Artikel niet gevonden'}</p>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{form.title}</h1>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">/blog/{params.slug}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={togglePublished} className={`btn-secondary text-xs ${form.published ? 'bg-green-600/10 text-green-700 dark:text-green-300' : ''}`}>
            {form.published ? 'Gepubliceerd' : 'Concept'}
          </button>
          <button onClick={save} disabled={saving} className="btn-primary text-xs disabled:opacity-60">
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-medium">Titel</label>
          <input value={form.title} onChange={(e) => setForm((prev) => (prev ? { ...prev, title: e.target.value } : prev))} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium">Auteur</label>
          <input value={form.authorName || ''} onChange={(e) => setForm((prev) => (prev ? { ...prev, authorName: e.target.value } : prev))} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium">Cover image URL</label>
          <input value={form.coverImageUrl || ''} onChange={(e) => setForm((prev) => (prev ? { ...prev, coverImageUrl: e.target.value } : prev))} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium">Cover alt text</label>
          <input value={form.coverImageAlt || ''} onChange={(e) => setForm((prev) => (prev ? { ...prev, coverImageAlt: e.target.value } : prev))} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium">Leestijd (minuten)</label>
          <input
            type="number"
            min={2}
            value={typeof form.readingMinutes === 'number' ? form.readingMinutes : ''}
            onChange={(e) => setForm((prev) => (prev ? { ...prev, readingMinutes: e.target.value ? Number(e.target.value) : null } : prev))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <label className="text-xs font-medium">Samenvatting</label>
          <textarea value={form.excerpt} onChange={(e) => setForm((prev) => (prev ? { ...prev, excerpt: e.target.value } : prev))} rows={3} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium">SEO titel</label>
          <input value={form.seoTitle || ''} onChange={(e) => setForm((prev) => (prev ? { ...prev, seoTitle: e.target.value } : prev))} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium">SEO omschrijving</label>
          <input value={form.seoDescription || ''} onChange={(e) => setForm((prev) => (prev ? { ...prev, seoDescription: e.target.value } : prev))} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium">Intro kicker</label>
        <input value={form.content.kicker || ''} onChange={(e) => updateContent({ kicker: e.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-medium">Intro</label>
        <textarea value={form.content.intro || ''} onChange={(e) => updateContent({ intro: e.target.value })} rows={3} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Secties</h2>
          <button onClick={addSection} disabled={form.content.sections.length >= MAX_SECTIONS} className="btn-secondary text-xs disabled:opacity-50">Sectie toevoegen</button>
        </div>
        {form.content.sections.map((section, idx) => (
          <div key={`section-${idx}`} className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Sectie {idx + 1}</p>
              <div className="flex gap-2">
                <button onClick={() => updateSection(idx, { emphasis: !section.emphasis })} className={`btn-secondary text-[11px] ${section.emphasis ? 'bg-brand-600/10 text-brand-700' : ''}`}>
                  {section.emphasis ? 'Benadrukt' : 'Normaal'}
                </button>
                <button onClick={() => removeSection(idx)} disabled={form.content.sections.length <= MIN_SECTIONS} className="btn-secondary text-[11px] disabled:opacity-50">
                  Verwijderen
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              <input value={section.kicker || ''} onChange={(e) => updateSection(idx, { kicker: e.target.value })} placeholder="Kicker" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
              <input value={section.heading} onChange={(e) => updateSection(idx, { heading: e.target.value })} placeholder="Titel" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
              <textarea value={section.body} onChange={(e) => updateSection(idx, { body: e.target.value })} rows={4} placeholder="Tekst" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium">Highlight quote</label>
        <textarea
          value={form.content.highlight?.text || ''}
          onChange={(e) => updateContent({ highlight: { ...(form.content.highlight || { text: '' }), text: e.target.value } })}
          rows={3}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <input
          value={form.content.highlight?.attribution || ''}
          onChange={(e) => {
            const currentHighlight = form.content.highlight || { text: '' };
            updateContent({ highlight: { ...currentHighlight, attribution: e.target.value } });
          }}
          placeholder="Naam"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium">Outro</label>
        <textarea value={form.content.outro || ''} onChange={(e) => updateContent({ outro: e.target.value })} rows={3} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Resources</h2>
          <button onClick={addResource} className="btn-secondary text-xs">Link toevoegen</button>
        </div>
        {(form.content.resources || []).map((resource, idx) => (
          <div key={`resource-${idx}`} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40 md:flex-row">
            <input value={resource.label} onChange={(e) => updateResource(idx, { label: e.target.value })} placeholder="Label" className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <input value={resource.href} onChange={(e) => updateResource(idx, { href: e.target.value })} placeholder="/contact" className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <button onClick={() => removeResource(idx)} className="btn-secondary text-xs">Verwijderen</button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <a href={`/blog/${params.slug}`} className="btn-secondary text-xs" target="_blank" rel="noreferrer">
          Bekijken
        </a>
        <button onClick={save} disabled={saving} className="btn-primary text-xs disabled:opacity-60">
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>
    </section>
  );
}
