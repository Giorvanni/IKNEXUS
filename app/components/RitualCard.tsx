"use client";

import Link from 'next/link';
import { ResponsiveImage } from './ResponsiveImage';
import type { Ritual } from '../../lib/rituals';

const currencyFormatters = new Map<string, Intl.NumberFormat>();
const ENABLE_PRICE_DISPLAY = false; // Toggle when we want to surface price chips again

function formatPrice(priceCents?: number | null, currency = 'EUR') {
  if (typeof priceCents !== 'number') return null;
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(currency, new Intl.NumberFormat('nl-NL', { style: 'currency', currency }));
  }
  return currencyFormatters.get(currency)!.format(priceCents / 100);
}

export function RitualCard({ ritual }: { ritual: Ritual }) {
  const hasImage = Boolean(ritual.featuredImageUrl);
  const durationLabel = typeof ritual.durationMinutes === 'number' ? `${ritual.durationMinutes} min` : null;
  const priceLabel = ENABLE_PRICE_DISPLAY ? formatPrice(ritual.priceCents, ritual.currency ?? 'EUR') : null;
  const detailChips = [durationLabel, priceLabel].filter(Boolean);
  const valueProps = Array.isArray(ritual.valueProps) ? ritual.valueProps.slice(0, 3) : [];

  return (
    <article className="card flex h-full flex-col" aria-labelledby={`ritual-${ritual.slug}`}>
      <div className="mb-4">
        <ResponsiveImage
          src={hasImage ? (ritual.featuredImageUrl as string) : undefined}
          alt={ritual.featuredImageAlt || ritual.name}
          aspectRatio={12 / 5}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
          placeholderText="Ritueel"
        />
      </div>
      <div className="flex-1">
        <h3 id={`ritual-${ritual.slug}`} className="font-serif text-lg font-semibold tracking-tight">
          {ritual.name}
        </h3>
        {!!detailChips.length && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
            {detailChips.map((chip) => (
              <span key={chip} className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
                {chip}
              </span>
            ))}
          </div>
        )}
        <p className="subtle mt-3 text-sm">{ritual.shortDescription}</p>
        {!!valueProps.length && (
          <ul className="mt-4 space-y-1 text-xs subtle">
            {valueProps.map((value) => (
              <li key={value} className="flex items-start gap-2">
                <span aria-hidden="true">•</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`/rituelen/${ritual.slug}`} className="btn-secondary text-xs">
          {ritual.ctaLabel}
        </Link>
        {ritual.bookingLink && (
          <Link
            href={ritual.bookingLink}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-primary text-xs"
            aria-label={`${ritual.name} boeken`}
          >
            Boek nu
          </Link>
        )}
      </div>
    </article>
  );
}

