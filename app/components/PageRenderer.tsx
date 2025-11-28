"use client";
import React from 'react';
import { Section, type SectionAlign, type SectionSpacing, type SectionVariant, type SectionWidth } from './Section';
import { NewsletterForm } from './NewsletterForm';
import { RitualCard } from './RitualCard';
import { ContactInfoCard } from './ContactInfoCard';
import { Testimonials } from './Testimonials';
import { Timeline } from './Timeline';
import { ResponsiveImage } from './ResponsiveImage';
import { useEffect, useState } from 'react';
import type { Ritual } from '../../lib/rituals';

type MediaAssetVariant = { width: number; height: number; format: string; url: string };
type MediaAssetSummary = { id: string; url: string; mimeType?: string | null; altText?: string | null; variants?: MediaAssetVariant[] };

export type SectionItem = { id: string; order: number; type: string; data: any; mediaAsset?: MediaAssetSummary };

export function PageRenderer({ sections }: { sections: SectionItem[] }) {
  const ordered = [...sections].sort((a, b) => a.order - b.order);
  return (
    <>
      {ordered.map((s) => {
        switch (s.type) {
          case 'HERO': {
            const t = s.data || {};
            return (
              <section key={s.id} className="pt-[var(--section-spacing-loose)] pb-[var(--section-spacing-tight)]">
                <div className="container grid gap-10 md:grid-cols-2 items-center">
                  <div>
                    <h1 className="hero-title font-serif font-semibold tracking-tight text-slate-900 dark:text-slate-100">{t.title || ''}</h1>
                    {t.subtitle && <p className="mt-6 text-lg subtle text-balance">{t.subtitle}</p>}
                    {(t.ctaLabel || t.ctaHref) && (
                      <div className="mt-8 flex gap-4">
                        <a href={t.ctaHref || '#'} className="btn-primary">{t.ctaLabel || 'Meer lezen'}</a>
                      </div>
                    )}
                  </div>
                  <div className="relative aspect-video rounded-xl bg-gradient-to-br from-brand-600 to-accent shadow-lg" aria-hidden="true">
                    <div className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35),transparent_70%)]" />
                  </div>
                </div>
              </section>
            );
          }
          case 'TEXT': {
            const t = s.data || {};
            const layout = resolveLayout(t.layout);
            return (
              <Section key={s.id} title={t.title} {...layout}>
                {t.body ? <p className="subtle max-w-3xl whitespace-pre-line">{t.body}</p> : null}
              </Section>
            );
          }
          case 'FEATURES': {
            const t = s.data || {};
            const items: string[] = Array.isArray(t.items) ? t.items : [];
            const layout = resolveLayout(t.layout);
            return (
              <Section key={s.id} title={t.title} {...layout}>
                {items.length > 0 ? (
                  <ul className="list-disc pl-4 text-sm text-slate-700 dark:text-slate-300">
                    {items.map((li: string, idx: number) => <li key={idx}>{li}</li>)}
                  </ul>
                ) : null}
              </Section>
            );
          }
          case 'CTA': {
            const t = s.data || {};
            const layout = resolveLayout(t.layout, { align: 'center' });
            return (
              <Section key={s.id} title={t.title} {...layout}>
                {t.body && <p className="subtle max-w-2xl mx-auto">{t.body}</p>}
                {(t.buttonLabel || t.buttonHref) && (
                  <div className="mt-4"><a href={t.buttonHref || '#'} className="btn-primary">{t.buttonLabel || 'Meer lezen'}</a></div>
                )}
              </Section>
            );
          }
          case 'NEWSLETTER': {
            const t = s.data || {};
            const layout = resolveLayout(t.layout, { align: 'center', width: 'narrow' });
            return (
              <Section key={s.id} id="newsletter" title={t.title || 'Blijf op de hoogte'} {...layout}>
                {t.body && <p className="subtle max-w-xl mx-auto">{t.body}</p>}
                <NewsletterForm />
              </Section>
            );
          }
          case 'IMAGE': {
            const t = s.data || {};
            const asset = s.mediaAsset;
            const src = t.url || asset?.url;
            const alt = t.alt || asset?.altText || 'Pagina-afbeelding';
            const layout = resolveLayout(t.layout, { width: 'wide' });
            return (
              <Section key={s.id} {...layout}>
                <ResponsiveImage
                  src={src}
                  alt={alt}
                  aspectRatio={typeof t.aspectRatio === 'number' ? t.aspectRatio : 16 / 9}
                  placeholderText={t.placeholderText || 'Visual volgt'}
                  variants={asset?.variants}
                />
              </Section>
            );
          }
          case 'FAQ': {
            const t = s.data || {};
            const items: Array<{ question?: string; answer?: string }> = Array.isArray(t.items) ? t.items : [];
            const layout = resolveLayout(t.layout, { width: 'narrow' });
            return (
              <Section key={s.id} title={t.title} {...layout}>
                {items.length > 0 ? (
                  <div className="grid gap-4">
                    {items.map((item, idx) => (
                      <details key={`${item.question || 'qa'}-${idx}`} className="rounded-md border border-slate-200 dark:border-slate-700 p-4">
                        <summary className="font-medium cursor-pointer">{item.question || 'Vraag'}</summary>
                        {item.answer && <p className="subtle text-sm mt-2 whitespace-pre-line">{item.answer}</p>}
                      </details>
                    ))}
                  </div>
                ) : null}
              </Section>
            );
          }
          case 'VENTURES':
          case 'RITUALS': {
            const t = s.data || {};
            const limit = typeof t.limit === 'number' ? t.limit : 3;
            const layout = resolveLayout(t.layout, { width: 'wide' });
            return (
              <Section key={s.id} title={t.title || 'Onze Rituelen'} {...layout}>
                <RitualsGrid limit={limit} />
                <div className="mt-8">
                  <a href="/rituelen" className="btn-primary">Alle Rituelen</a>
                </div>
              </Section>
            );
          }
          case 'CONTACT_INFO': {
            const t = s.data || {};
            const layout = resolveLayout(t.layout, { width: 'narrow' });
            return (
              <Section key={s.id} {...layout}>
                <ContactInfoCard data={t} />
              </Section>
            );
          }
          case 'TESTIMONIALS': {
            const t = s.data || {};
            const items = Array.isArray(t.items) ? t.items : [];
            const columns = typeof t.columns === 'number' ? t.columns : 2;
            const layout = resolveLayout(t.layout, { variant: 'muted' });
            return (
              <Section key={s.id} title={t.title || 'Ervaringen'} {...layout}>
                <Testimonials items={items} columns={columns} />
              </Section>
            );
          }
          case 'TIMELINE': {
            const t = s.data || {};
            const items = Array.isArray(t.items) ? t.items : [];
            const layout = resolveLayout(t.layout, { width: 'narrow' });
            return (
              <Section key={s.id} title={t.title} {...layout}>
                <Timeline items={items} />
              </Section>
            );
          }
          default:
            return <React.Fragment key={s.id} />;
        }
      })}
    </>
  );
}

type ApiEnvelope<T> = { ok?: boolean; data?: T; error?: { message?: string } };

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return typeof payload === 'object' && payload !== null && 'ok' in (payload as Record<string, unknown>);
}

async function fetchRituals(signal?: AbortSignal): Promise<Ritual[]> {
  const response = await fetch('/api/rituals', { signal });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (isApiEnvelope<{ error?: { message?: string } }>(payload) && payload.error?.message) ||
      'Kon rituelen niet laden';
    throw new Error(message);
  }
  const raw = Array.isArray(payload) ? payload : (payload?.data as Ritual[] | undefined);
  if (!raw || !Array.isArray(raw)) {
    throw new Error('Onverwachte serverrespons');
  }
  return raw as Ritual[];
}

function RitualsGrid({ limit = 3 }: { limit?: number }) {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError(null);
    fetchRituals(controller.signal)
      .then((data) => {
        setRituals(data);
        setStatus('success');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Iets ging mis bij het laden.');
        setStatus('error');
      });
    return () => controller.abort();
  }, [requestId]);

  const visibleRituals = rituals.slice(0, limit);
  const isLoading = status === 'loading';

  const skeletonCount = (() => {
    const fallback = 3;
    if (!Number.isFinite(limit)) return fallback;
    const safe = Math.max(1, Math.round(limit as number));
    return safe;
  })();

  return (
    <div className="space-y-4" aria-live="polite" aria-busy={isLoading}>
      <div className="grid gap-6 md:grid-cols-3">
        {isLoading && !rituals.length
          ? Array.from({ length: skeletonCount }).map((_, idx) => <SkeletonCard key={`skeleton-${idx}`} />)
          : null}
        {visibleRituals.map((ritual) => (
          <RitualCard key={ritual.slug} ritual={ritual} />
        ))}
      </div>
      {status === 'success' && !visibleRituals.length && (
        <p className="text-sm subtle">Momenteel zijn er geen rituelen gepubliceerd. Kom later gerust terug.</p>
      )}
      {status === 'error' && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <p>{error}</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center rounded-md border border-red-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-red-700 transition hover:border-red-300 hover:text-red-900 dark:border-red-800 dark:text-red-100 dark:hover:border-red-600"
            onClick={() => setRequestId((prev) => prev + 1)}
          >
            Opnieuw laden
          </button>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card h-full animate-pulse space-y-4 border border-slate-200/80 p-4 shadow-sm dark:border-slate-800">
      <div className="h-40 w-full rounded-md bg-slate-200/70 dark:bg-slate-800" />
      <div className="h-4 w-3/4 rounded bg-slate-200/70 dark:bg-slate-800" />
      <div className="h-3 w-1/2 rounded bg-slate-200/70 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-200/70 dark:bg-slate-800" />
        <div className="h-3 w-5/6 rounded bg-slate-200/70 dark:bg-slate-800" />
        <div className="h-3 w-2/3 rounded bg-slate-200/70 dark:bg-slate-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded bg-slate-200/70 dark:bg-slate-800" />
        <div className="h-8 flex-1 rounded bg-slate-200/70 dark:bg-slate-800" />
      </div>
    </div>
  );
}

type SectionLayoutConfig = {
  variant: SectionVariant;
  align: SectionAlign;
  width: SectionWidth;
  spacing: SectionSpacing;
  kicker?: string;
};

function resolveLayout(raw?: any, fallback?: Partial<SectionLayoutConfig>): SectionLayoutConfig {
  const variants: SectionVariant[] = ['default', 'muted', 'brand', 'dark'];
  const aligns: SectionAlign[] = ['left', 'center'];
  const widths: SectionWidth[] = ['default', 'narrow', 'wide'];
  const spacings: SectionSpacing[] = ['default', 'tight', 'loose'];
  return {
    variant: variants.includes(raw?.variant) ? raw.variant : fallback?.variant || 'default',
    align: aligns.includes(raw?.align) ? raw.align : fallback?.align || 'left',
    width: widths.includes(raw?.width) ? raw.width : fallback?.width || 'default',
    spacing: spacings.includes(raw?.spacing) ? raw.spacing : fallback?.spacing || 'default',
    kicker: typeof raw?.kicker === 'string' ? raw.kicker : fallback?.kicker
  };
}
