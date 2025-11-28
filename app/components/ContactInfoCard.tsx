"use client";
import React from 'react';

export interface ContactInfoData {
  businessName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  hours?: string | null;
  mapsLink?: string | null;
  extraNoteTitle?: string | null;
  extraNote?: string | null;
}

function formatMultiline(value?: string | null) {
  if (!value) return null;
  return value.split(/\r?\n/).map((line, idx) => (
    <React.Fragment key={`${line}-${idx}`}>
      {line}
      <br />
    </React.Fragment>
  ));
}

export function ContactInfoCard({ data }: { data?: ContactInfoData | null }) {
  if (!data) return null;
  const { businessName, address, phone, email, hours, mapsLink, extraNoteTitle, extraNote } = data;
  const hasCoreInfo = businessName || address || phone || email;
  if (!hasCoreInfo) return null;

  return (
    <aside className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-slate-800">
      <div>
        {businessName && <p className="font-serif text-2xl font-semibold tracking-tight">{businessName}</p>}
        {address && <address className="not-italic text-sm subtle mt-3 leading-6">{formatMultiline(address)}</address>}
        <div className="mt-3 space-y-1 text-sm">
          {phone && (
            <a className="text-brand-700 underline dark:text-brand-300" href={`tel:${phone.replace(/\s+/g, '')}`}>
              {phone}
            </a>
          )}
          {email && (
            <div>
              <a className="text-brand-700 underline dark:text-brand-300" href={`mailto:${email}`}>
                {email}
              </a>
            </div>
          )}
        </div>
        {hours && (
          <div className="mt-3">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Openingstijden</p>
            <p className="text-sm subtle leading-6">{formatMultiline(hours)}</p>
          </div>
        )}
        {mapsLink && (
          <a
            className="mt-4 inline-flex items-center text-sm font-medium text-brand-700 underline dark:text-brand-300"
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
          >
            Bekijk route op Google Maps
          </a>
        )}
      </div>
      {extraNote && (
        <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
          {extraNoteTitle && <p className="font-semibold">{extraNoteTitle}</p>}
          <p className="subtle mt-1">{extraNote}</p>
        </div>
      )}
    </aside>
  );
}
