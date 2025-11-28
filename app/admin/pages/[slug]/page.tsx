"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';

interface Section { id?: string; order: number; type: 'HERO'|'TEXT'|'FEATURES'|'CTA'|'NEWSLETTER'|'IMAGE'|'FAQ'|'RITUALS'|'VENTURES'|'CONTACT_INFO'|'TESTIMONIALS'|'TIMELINE'; data: any }
interface PageDto { id: string; slug: string; title: string; description?: string|null; published: boolean; sections: Section[] }

type SectionTemplate = {
  type: Section['type'];
  label: string;
  description: string;
  data?: Record<string, any>;
};

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'HERO',
    label: 'Hero + CTA',
    description: 'Introblok met subtitel en knop',
    data: {
      title: 'Welkom bij Iris Kooij',
      subtitle: 'Introduceer de pagina met een korte beschrijving.',
      ctaLabel: 'Plan nu',
      ctaHref: '/contact'
    }
  },
  {
    type: 'TEXT',
    label: 'Tekstblok',
    description: 'Titel met langere copy',
    data: {
      title: 'Nieuwe sectie',
      body: 'Gebruik dit blok om een verhaal, visie of uitleg te plaatsen.'
    }
  },
  {
    type: 'CTA',
    label: 'Call to action',
    description: 'Korte pitch met knop',
    data: {
      title: 'Plan een sessie',
      body: 'Korte toelichting waarom iemand contact opneemt.',
      buttonLabel: 'Neem contact op',
      buttonHref: '/contact',
      layout: { align: 'center', variant: 'brand' }
    }
  },
  {
    type: 'RITUALS',
    label: 'Rituelen rooster',
    description: 'Haalt automatisch de rituelen op uit de CMS',
    data: {
      title: 'Onze Rituelen',
      limit: 6
    }
  },
  {
    type: 'TESTIMONIALS',
    label: 'Testimonials',
    description: 'Quotes van cliënten',
    data: {
      title: 'Ervaringen',
      columns: 2,
      items: [
        { quote: 'Beschrijf een ervaring of review.', author: 'Naam', role: 'Rol of bedrijf' }
      ]
    }
  },
  {
    type: 'TIMELINE',
    label: 'Tijdlijn',
    description: 'Stappenplan of mijlpalen',
    data: {
      title: 'Onze reis',
      items: [
        { title: 'Stap 1', description: 'Korte beschrijving', date: '2012', status: 'completed' },
        { title: 'Volgende stap', description: 'Een extra mijlpaal', date: 'nu', status: 'upcoming' }
      ]
    }
  }
];

function cloneData<T>(value: T): T {
  return value ? JSON.parse(JSON.stringify(value)) : ({} as T);
}

function defaultDataForType(type: Section['type']): Record<string, any> {
  switch (type) {
    case 'HERO':
      return { title: '', subtitle: '', ctaLabel: '', ctaHref: '' };
    case 'TEXT':
      return { title: '', body: '' };
    case 'FEATURES':
      return { title: '', items: [] };
    case 'CTA':
      return { title: '', body: '', buttonLabel: '', buttonHref: '' };
    case 'NEWSLETTER':
      return { title: '', body: '' };
    case 'IMAGE':
      return { url: '', alt: '' };
    case 'FAQ':
      return { title: '', items: [] };
    case 'RITUALS':
    case 'VENTURES':
      return { title: '', limit: 3 };
    case 'CONTACT_INFO':
      return { businessName: '', address: '', phone: '', email: '' };
    case 'TESTIMONIALS':
      return { title: '', columns: 2, items: [] };
    case 'TIMELINE':
      return { title: '', items: [] };
    default:
      return {};
  }
}

function isRitualSectionType(type: Section['type']): boolean {
  return type === 'RITUALS' || type === 'VENTURES';
}

function normalizeRitualSection(section: Section): Section {
  if (section.type === 'VENTURES') {
    return { ...section, type: 'RITUALS' };
  }
  return section;
}

function SectionEditor({ section, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: { section: Section; onChange: (s: Section)=>void; onRemove: ()=>void; onMoveUp: ()=>void; onMoveDown: ()=>void; isFirst: boolean; isLast: boolean }) {
  const [local, setLocal] = useState<Section>(normalizeRitualSection(section));
  useEffect(() => { setLocal(normalizeRitualSection(section)); }, [section]);
  useEffect(() => { onChange(local); }, [local, onChange]);

  function updateData(patch: any) {
    setLocal(s => ({ ...s, data: { ...(s.data || {}), ...patch } }));
  }
  function updateLayout(patch: any) {
    setLocal(s => ({
      ...s,
      data: {
        ...(s.data || {}),
        layout: {
          ...(s.data?.layout || {}),
          ...patch
        }
      }
    }));
  }
  const layout = local.data?.layout || {};
  const warnings = getSectionWarnings(local);
  const preview = getSectionPreview(local);
  const isRitualSection = isRitualSectionType(local.type);
  const heroTitleMissing = local.type === 'HERO' && !local.data?.title?.trim();
  const ctaTitleMissing = local.type === 'CTA' && !local.data?.title?.trim();
  const ctaButtonMissing = local.type === 'CTA' && (!local.data?.buttonLabel?.trim() || !local.data?.buttonHref?.trim());
  const imageUrlMissing = local.type === 'IMAGE' && !local.data?.url?.trim();
  const ritualLimitTooHigh = isRitualSection && typeof local.data?.limit === 'number' && local.data.limit > 12;

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3 grid gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <label className="text-xs">Type</label>
          <select
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
            value={local.type}
            onChange={e => setLocal(s => ({ ...s, type: e.target.value as any }))}
          >
            <option value="HERO">Hero</option>
            <option value="TEXT">Tekst</option>
            <option value="FEATURES">Kernpunten</option>
            <option value="CTA">Call to Action</option>
            <option value="NEWSLETTER">Nieuwsbrief</option>
            <option value="IMAGE">Afbeelding</option>
            <option value="FAQ">FAQ</option>
            <option value="RITUALS">Rituelen rooster</option>
            <option value="CONTACT_INFO">Contactinformatie</option>
            <option value="TESTIMONIALS">Testimonials</option>
            <option value="TIMELINE">Tijdlijn</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs" onClick={onMoveUp} disabled={isFirst}>Omhoog</button>
          <button className="btn-secondary text-xs" onClick={onMoveDown} disabled={isLast}>Omlaag</button>
          <button className="btn-secondary text-xs" onClick={onRemove}>Verwijderen</button>
        </div>
      </div>
      <div className="rounded-md border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/30">
        <p className="uppercase tracking-[0.4em] text-[10px] text-slate-500 dark:text-slate-400">Inline preview</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{preview.title || 'Nog geen titel'}</p>
        {preview.subtitle && <p className="text-xs text-slate-600 dark:text-slate-300">{preview.subtitle}</p>}
        {preview.meta && <p className="text-[11px] text-slate-500 dark:text-slate-400">{preview.meta}</p>}
      </div>
      {warnings.length > 0 && (
        <div className="rounded-md border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/70 dark:bg-amber-900/20 dark:text-amber-100">
          <p className="font-semibold uppercase tracking-[0.3em] text-[11px]">Controleer</p>
          <ul className="mt-1 list-disc pl-4">
            {warnings.map((warning: string, idx: number) => <li key={`${warning}-${idx}`}>{warning}</li>)}
          </ul>
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs font-medium">Variant</label>
          <select
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
            value={layout.variant || 'default'}
            onChange={e => updateLayout({ variant: e.target.value })}
          >
            <option value="default">Standaard</option>
            <option value="muted">Muted</option>
            <option value="brand">Brand</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium">Uitlijning</label>
          <select
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
            value={layout.align || 'left'}
            onChange={e => updateLayout({ align: e.target.value })}
          >
            <option value="left">Links</option>
            <option value="center">Gecentreerd</option>
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium">Breedte</label>
          <select
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
            value={layout.width || 'default'}
            onChange={e => updateLayout({ width: e.target.value })}
          >
            <option value="default">Standaard</option>
            <option value="narrow">Smaller</option>
            <option value="wide">Breder</option>
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium">Verticale ruimte</label>
          <select
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
            value={layout.spacing || 'default'}
            onChange={e => updateLayout({ spacing: e.target.value })}
          >
            <option value="tight">Compact</option>
            <option value="default">Normaal</option>
            <option value="loose">Ruim</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2 md:w-1/2">
        <label className="text-xs font-medium">Kicker (optioneel)</label>
        <input
          className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          placeholder="Bijv. Sinds 2012"
          value={layout.kicker || ''}
          onChange={e => updateLayout({ kicker: e.target.value })}
        />
      </div>
      {local.type === 'HERO' && (
        <div className="grid gap-2">
          <input
            className={clsx('rounded-md border bg-white dark:bg-slate-800 px-3 py-2 text-sm', heroTitleMissing ? 'border-red-400 focus-visible:ring-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600')}
            placeholder="Titel"
            value={local.data?.title || ''}
            onChange={e => updateData({ title: e.target.value })}
          />
          {heroTitleMissing && <p className="text-[11px] text-red-600">Titel is verplicht voor een hero.</p>}
          <textarea className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" rows={3} placeholder="Subtitel" value={local.data?.subtitle || ''} onChange={e => updateData({ subtitle: e.target.value })} />
          <div className="flex gap-2">
            <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="CTA label" value={local.data?.ctaLabel || ''} onChange={e => updateData({ ctaLabel: e.target.value })} />
            <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="CTA link (bijv. /rituelen)" value={local.data?.ctaHref || ''} onChange={e => updateData({ ctaHref: e.target.value })} />
          </div>
        </div>
      )}
      {local.type === 'TEXT' && (
        <div className="grid gap-2">
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Sectietitel (optioneel)" value={local.data?.title || ''} onChange={e => updateData({ title: e.target.value })} />
          <textarea className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" rows={4} placeholder="Tekst" value={local.data?.body || ''} onChange={e => updateData({ body: e.target.value })} />
        </div>
      )}
      {local.type === 'FEATURES' && (
        <div className="grid gap-2">
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Sectietitel (optioneel)" value={local.data?.title || ''} onChange={e => updateData({ title: e.target.value })} />
          <textarea className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" rows={4} placeholder={'Eén punt per regel'} value={Array.isArray(local.data?.items) ? local.data.items.join('\n') : ''} onChange={e => updateData({ items: e.target.value.split(/\r?\n/).filter(Boolean) })} />
        </div>
      )}
      {local.type === 'CTA' && (
        <div className="grid gap-2">
          <input
            className={clsx('rounded-md border bg-white dark:bg-slate-800 px-3 py-2 text-sm', ctaTitleMissing ? 'border-red-400 focus-visible:ring-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600')}
            placeholder="Titel"
            value={local.data?.title || ''}
            onChange={e => updateData({ title: e.target.value })}
          />
          {ctaTitleMissing && <p className="text-[11px] text-red-600">CTA heeft een titel nodig.</p>}
          <textarea className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" rows={3} placeholder="Tekst (optioneel)" value={local.data?.body || ''} onChange={e => updateData({ body: e.target.value })} />
          <div className="flex gap-2">
            <input
              className={clsx('rounded-md border bg-white dark:bg-slate-800 px-3 py-2 text-sm', ctaButtonMissing ? 'border-red-400 focus-visible:ring-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600')}
              placeholder="Knop label"
              value={local.data?.buttonLabel || ''}
              onChange={e => updateData({ buttonLabel: e.target.value })}
            />
            <input
              className={clsx('rounded-md border bg-white dark:bg-slate-800 px-3 py-2 text-sm', ctaButtonMissing ? 'border-red-400 focus-visible:ring-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600')}
              placeholder="Knop link"
              value={local.data?.buttonHref || ''}
              onChange={e => updateData({ buttonHref: e.target.value })}
            />
          </div>
          {ctaButtonMissing && <p className="text-[11px] text-red-600">Vul zowel label als link voor de knop in.</p>}
        </div>
      )}
      {local.type === 'NEWSLETTER' && (
        <div className="grid gap-2">
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Titel (optioneel)" value={local.data?.title || ''} onChange={e => updateData({ title: e.target.value })} />
          <textarea className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" rows={2} placeholder="Intro (optioneel)" value={local.data?.body || ''} onChange={e => updateData({ body: e.target.value })} />
        </div>
      )}
      {local.type === 'IMAGE' && (
        <div className="grid gap-2">
          <input
            className={clsx('rounded-md border bg-white dark:bg-slate-800 px-3 py-2 text-sm', imageUrlMissing ? 'border-red-400 focus-visible:ring-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600')}
            placeholder="Afbeeldings-URL"
            value={local.data?.url || ''}
            onChange={e => updateData({ url: e.target.value })}
          />
          {imageUrlMissing && <p className="text-[11px] text-red-600">Voeg een URL toe voor de afbeelding.</p>}
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Alt-tekst" value={local.data?.alt || ''} onChange={e => updateData({ alt: e.target.value })} />
        </div>
      )}
      {isRitualSection && (
        <div className="grid gap-2">
          <input
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            placeholder="Sectietitel (bijv. Onze Rituelen)"
            value={local.data?.title || ''}
            onChange={e => updateData({ title: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 dark:text-slate-300" htmlFor={`rituals-limit-${local.order}`}>
              Aantal rituelen (max. 12)
            </label>
            <input
              id={`rituals-limit-${local.order}`}
              type="number"
              min={1}
              max={12}
              className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs"
              value={typeof local.data?.limit === 'number' ? local.data.limit : ''}
              onChange={e => {
                const raw = e.target.value.trim();
                const num = raw ? Number(raw) : undefined;
                updateData({ limit: Number.isFinite(num as number) ? num : undefined });
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Toont een rooster met rituelen uit /rituelen. Laat leeg om de standaard (3) te gebruiken.
          </p>
          {ritualLimitTooHigh && <p className="text-[11px] text-red-600">Maximaal 12 rituelen per rooster.</p>}
        </div>
      )}
      {local.type === 'TESTIMONIALS' && (
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" htmlFor={`testimonials-columns-${local.order}`}>
              Kolommen
            </label>
            <input
              id={`testimonials-columns-${local.order}`}
              type="number"
              min={1}
              max={3}
              className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs"
              value={typeof local.data?.columns === 'number' ? local.data.columns : 2}
              onChange={e => updateData({ columns: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-3">
            {(Array.isArray(local.data?.items) ? local.data.items : []).map((item: any, idx: number) => (
              <div key={idx} className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                <textarea
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Quote"
                  value={item?.quote || ''}
                  onChange={e => {
                    const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                    next[idx] = { ...(next[idx] || {}), quote: e.target.value };
                    updateData({ items: next });
                  }}
                />
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    placeholder="Auteur"
                    value={item?.author || ''}
                    onChange={e => {
                      const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                      next[idx] = { ...(next[idx] || {}), author: e.target.value };
                      updateData({ items: next });
                    }}
                  />
                  <input
                    className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    placeholder="Rol / organisatie"
                    value={item?.role || ''}
                    onChange={e => {
                      const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                      next[idx] = { ...(next[idx] || {}), role: e.target.value };
                      updateData({ items: next });
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => {
                    const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                    next.splice(idx, 1);
                    updateData({ items: next });
                  }}
                >
                  Verwijder testimonial
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => {
                const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                next.push({ quote: '', author: '', role: '' });
                updateData({ items: next });
              }}
            >
              Testimonial toevoegen
            </button>
          </div>
        </div>
      )}
      {local.type === 'TIMELINE' && (
        <div className="space-y-3">
          {(Array.isArray(local.data?.items) ? local.data.items : []).map((item: any, idx: number) => (
            <div key={idx} className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-2">
              <input
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                placeholder="Titel"
                value={item?.title || ''}
                onChange={e => {
                  const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                  next[idx] = { ...(next[idx] || {}), title: e.target.value };
                  updateData({ items: next });
                }}
              />
              <textarea
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                rows={3}
                placeholder="Beschrijving"
                value={item?.description || ''}
                onChange={e => {
                  const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                  next[idx] = { ...(next[idx] || {}), description: e.target.value };
                  updateData({ items: next });
                }}
              />
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  placeholder="Datum / label"
                  value={item?.date || ''}
                  onChange={e => {
                    const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                    next[idx] = { ...(next[idx] || {}), date: e.target.value };
                    updateData({ items: next });
                  }}
                />
                <select
                  className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={item?.status || ''}
                  onChange={e => {
                    const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                    next[idx] = { ...(next[idx] || {}), status: e.target.value };
                    updateData({ items: next });
                  }}
                >
                  <option value="">Geen status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={() => {
                  const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                  next.splice(idx, 1);
                  updateData({ items: next });
                }}
              >
                Verwijder stap
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => {
              const next = Array.isArray(local.data?.items) ? [...local.data.items] : [];
              next.push({ title: '', description: '', date: '' });
              updateData({ items: next });
            }}
          >
            Tijdlijn stap toevoegen
          </button>
        </div>
      )}
      {local.type === 'FAQ' && (
        <div className="grid gap-2">
          <input
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            placeholder="Sectietitel (optioneel)"
            value={local.data?.title || ''}
            onChange={e => updateData({ title: e.target.value })}
          />
          <div className="space-y-3">
            {(Array.isArray(local.data?.items) ? local.data.items : []).map((item: any, idx: number) => (
              <div key={idx} className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                <input
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  placeholder="Vraag"
                  value={item?.question || ''}
                  onChange={e => {
                    const items = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                    items[idx] = { ...(items[idx] || {}), question: e.target.value };
                    updateData({ items });
                  }}
                />
                <textarea
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Antwoord"
                  value={item?.answer || ''}
                  onChange={e => {
                    const items = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                    items[idx] = { ...(items[idx] || {}), answer: e.target.value };
                    updateData({ items });
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => {
                    const items = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                    items.splice(idx, 1);
                    updateData({ items });
                  }}
                >
                  Vraag verwijderen
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => {
                const items = Array.isArray(local.data?.items) ? [...local.data.items] : [];
                items.push({ question: '', answer: '' });
                updateData({ items });
              }}
            >
              Vraag toevoegen
            </button>
          </div>
        </div>
      )}
      {local.type === 'CONTACT_INFO' && (
        <div className="grid gap-2">
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Bedrijfsnaam" value={local.data?.businessName || ''} onChange={e => updateData({ businessName: e.target.value })} />
          <textarea className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" rows={3} placeholder="Adres (gebruik Enter voor nieuwe regel)" value={local.data?.address || ''} onChange={e => updateData({ address: e.target.value })} />
          <div className="flex gap-2">
            <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Telefoonnummer" value={local.data?.phone || ''} onChange={e => updateData({ phone: e.target.value })} />
            <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="E-mailadres" value={local.data?.email || ''} onChange={e => updateData({ email: e.target.value })} />
          </div>
          <textarea className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" rows={3} placeholder="Openingstijden (gebruik Enter voor nieuwe regel)" value={local.data?.hours || ''} onChange={e => updateData({ hours: e.target.value })} />
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Google Maps link (optioneel)" value={local.data?.mapsLink || ''} onChange={e => updateData({ mapsLink: e.target.value })} />
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Extra notitie titel (optioneel)" value={local.data?.extraNoteTitle || ''} onChange={e => updateData({ extraNoteTitle: e.target.value })} />
          <textarea className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" rows={2} placeholder="Extra notitie tekst (optioneel)" value={local.data?.extraNote || ''} onChange={e => updateData({ extraNote: e.target.value })} />
        </div>
      )}
    </div>
  );
}

export default function AdminPageEditor() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params?.slug || '');
  const [page, setPage] = useState<PageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/pages/${slug}`);
      const j = await res.json();
      if (!cancelled) {
        if (!res.ok) { setError(j?.error?.message || 'Kon pagina niet laden'); setLoading(false); return; }
        setPage(j.data || j);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  function updateSection(idx: number, updated: Section) {
    setPage(prev => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[idx] = { ...updated, order: idx };
      return { ...prev, sections };
    });
  }
  function removeSection(idx: number) {
    setPage(prev => {
      if (!prev) return prev;
      const sections = prev.sections.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }));
      return { ...prev, sections };
    });
  }
  function reorderSection(from: number, to: number) {
    setPage(prev => {
      if (!prev) return prev;
      if (from === to) return prev;
      if (from < 0 || to < 0 || from >= prev.sections.length || to >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      return { ...prev, sections: sections.map((s, idx) => ({ ...s, order: idx })) };
    });
  }
  function moveSection(idx: number, dir: -1 | 1) {
    setPage(prev => {
      if (!prev) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      const [moved] = sections.splice(idx, 1);
      sections.splice(target, 0, moved);
      return { ...prev, sections: sections.map((s, i) => ({ ...s, order: i })) };
    });
  }
  function addSection(template?: SectionTemplate) {
    setPage(prev => {
      if (!prev) return prev;
      const data = template?.data ? cloneData(template.data) : defaultDataForType(template?.type || 'TEXT');
      const newSection: Section = { order: prev.sections.length, type: template?.type || 'TEXT', data };
      return { ...prev, sections: [...prev.sections, newSection] };
    });
  }
  // Native drag-and-drop handlers keep reordering lightweight without extra deps.
  function handleDragStart(idx: number, event: React.DragEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('input,textarea,select,button,label,a')) {
      event.preventDefault();
      return;
    }
    setDraggingIndex(idx);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(idx));
  }
  function handleDragEnter(idx: number, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (dragOverIndex !== idx) setDragOverIndex(idx);
  }
  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
  function handleDrop(idx: number, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (draggingIndex === null) return;
    reorderSection(draggingIndex, idx);
    setDraggingIndex(null);
    setDragOverIndex(null);
  }
  function handleDragEnd() {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  async function save() {
    if (!page) return;
    setSaving(true);
    setError(null);
    const payload: any = { title: page.title, description: page.description ?? undefined, published: page.published, sections: page.sections.map((s, i) => ({ order: i, type: s.type, data: s.data })) };
    const res = await fetch(`/api/pages/${slug}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error?.message || 'Opslaan mislukt');
      return;
    }
    const j = await res.json();
    setPage(j.data || j);
  }

  if (loading) return <section className="p-6"><p className="subtle">Laden…</p></section>;
  if (!page) return <section className="p-6"><p className="text-sm text-red-600">{error || 'Niet gevonden'}</p></section>;

  return (
    <section className="p-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pagina bewerken</h1>
        <div className="flex gap-2">
          <button onClick={() => router.push('/admin/pages')} className="btn-secondary text-xs">Terug</button>
          <a className="btn-secondary text-xs" href={`/${slug === 'home' ? '' : slug}?preview=1`} target="_blank" rel="noreferrer">Bekijken</a>
          <button onClick={save} disabled={saving} className="btn-primary text-xs disabled:opacity-60">{saving ? 'Opslaan…' : 'Opslaan'}</button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-xs font-medium">Titel</label>
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" value={page.title} onChange={e => setPage(p => p ? { ...p, title: e.target.value } : p)} />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium">Beschrijving (SEO, optioneel)</label>
          <input className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" value={page.description || ''} onChange={e => setPage(p => p ? { ...p, description: e.target.value } : p)} />
        </div>
        <div className="flex items-center gap-2">
          <input id="published" type="checkbox" checked={page.published} onChange={e => setPage(p => p ? { ...p, published: e.target.checked } : p)} />
          <label htmlFor="published" className="text-sm">Gepubliceerd</label>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Secties</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sleep kaarten om de volgorde te wijzigen.</p>
        </div>
        <button onClick={() => addSection()} className="btn-secondary text-xs self-start">Lege sectie</button>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Snelle templates</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kies een patroon en werk daarna de inhoud bij.</p>
          </div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Nieuw</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SECTION_TEMPLATES.map(template => (
            <button
              key={template.label}
              type="button"
              onClick={() => addSection(template)}
              className="rounded-md border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-brand-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{template.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        {page.sections.length === 0 ? (
          <p className="text-sm subtle">Nog geen secties.</p>
        ) : page.sections.map((s, idx) => (
          <div
            key={s.id || `section-${idx}`}
            className={clsx(
              'rounded-xl transition-all',
              dragOverIndex === idx && 'ring-2 ring-brand-500 shadow-md',
              draggingIndex === idx && 'opacity-60'
            )}
            draggable
            onDragStart={(event) => handleDragStart(idx, event)}
            onDragEnter={(event) => handleDragEnter(idx, event)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(idx, event)}
            onDragEnd={handleDragEnd}
          >
            <SectionEditor
              section={s}
              onChange={(updated) => updateSection(idx, updated)}
              onRemove={() => removeSection(idx)}
              onMoveUp={() => moveSection(idx, -1)}
              onMoveDown={() => moveSection(idx, 1)}
              isFirst={idx === 0}
              isLast={idx === page.sections.length - 1}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function getSectionWarnings(section: Section): string[] {
  const data = section.data || {};
  const warnings: string[] = [];
  if (section.type === 'HERO' && !data.title?.trim()) warnings.push('Hero heeft een titel nodig.');
  if (section.type === 'CTA') {
    if (!data.title?.trim()) warnings.push('CTA heeft een titel nodig.');
    if (!data.buttonLabel?.trim() || !data.buttonHref?.trim()) warnings.push('Vul zowel het label als de link van de CTA-knop in.');
  }
  if (section.type === 'IMAGE' && !data.url?.trim()) warnings.push('Afbeeldings-URL ontbreekt.');
  if (isRitualSectionType(section.type) && typeof data.limit === 'number' && data.limit > 12) warnings.push('Maximaal 12 rituelen per overzicht.');
  if (section.type === 'TESTIMONIALS' && (!Array.isArray(data.items) || data.items.length === 0)) warnings.push('Voeg minimaal één testimonial toe.');
  if (section.type === 'TIMELINE' && (!Array.isArray(data.items) || data.items.length === 0)) warnings.push('Voeg minimaal één tijdlijnstap toe.');
  return warnings;
}

function getSectionPreview(section: Section): { title?: string; subtitle?: string; meta?: string } {
  const data = section.data || {};
  switch (section.type) {
    case 'HERO':
      return {
        title: data.title || 'Hero sectie',
        subtitle: data.subtitle,
        meta: data.ctaLabel ? `CTA: ${data.ctaLabel}` : undefined
      };
    case 'TEXT':
      return {
        title: data.title || 'Tekstblok',
        subtitle: data.body?.slice(0, 80)
      };
    case 'FEATURES':
      return {
        title: data.title || 'Kernpunten',
        meta: Array.isArray(data.items) ? `${data.items.length} bullet(s)` : undefined
      };
    case 'CTA':
      return {
        title: data.title || 'CTA',
        subtitle: data.body,
        meta: data.buttonLabel ? `Knop: ${data.buttonLabel}` : undefined
      };
    case 'NEWSLETTER':
      return {
        title: data.title || 'Nieuwsbrief',
        subtitle: data.body
      };
    case 'IMAGE':
      return {
        title: data.alt || 'Afbeelding',
        subtitle: data.url
      };
    case 'FAQ':
      return {
        title: data.title || 'FAQ',
        meta: Array.isArray(data.items) ? `${data.items.length} vragen` : undefined
      };
    case 'RITUALS':
    case 'VENTURES':
      return {
        title: data.title || 'Rituelen',
        meta: data.limit ? `Limiet: ${data.limit}` : undefined
      };
    case 'CONTACT_INFO':
      return {
        title: data.businessName || 'Contactgegevens',
        subtitle: data.email || data.phone
      };
    case 'TESTIMONIALS':
      return {
        title: data.title || 'Testimonials',
        meta: Array.isArray(data.items) ? `${data.items.length} quote(s)` : undefined
      };
    case 'TIMELINE':
      return {
        title: data.title || 'Tijdlijn',
        meta: Array.isArray(data.items) ? `${data.items.length} stappen` : undefined
      };
    default:
      return { title: section.type };
  }
}
