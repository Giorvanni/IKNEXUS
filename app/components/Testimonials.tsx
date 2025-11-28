import { ReactNode } from 'react';
import clsx from 'clsx';

export interface TestimonialItem {
  quote: string;
  author?: string;
  role?: string;
  avatarUrl?: string;
  logo?: ReactNode;
}

interface TestimonialsProps {
  items?: TestimonialItem[];
  columns?: number;
}

export function Testimonials({ items = [], columns = 2 }: TestimonialsProps) {
  if (!items.length) return null;
  const resolvedColumns = columns >= 3 ? 3 : columns <= 1 ? 1 : 2;
  const gridClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  }[resolvedColumns];

  return (
    <div className={clsx('grid gap-6', gridClass)}>
      {items.map((item, idx) => (
        <figure key={`${item.author || 'quote'}-${idx}`} className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <blockquote className="text-base italic text-slate-800 dark:text-slate-200">{item.quote}</blockquote>
          {(item.author || item.role) && (
            <figcaption className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {item.author}
              {item.role && <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">{item.role}</span>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
