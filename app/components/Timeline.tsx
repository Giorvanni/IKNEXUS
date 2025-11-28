import clsx from 'clsx';

export interface TimelineItem {
  title: string;
  description?: string;
  date?: string;
  status?: 'upcoming' | 'completed';
}

interface TimelineProps {
  items?: TimelineItem[];
}

export function Timeline({ items = [] }: TimelineProps) {
  if (!items.length) return null;
  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6 dark:border-slate-800">
      {items.map((item, idx) => (
        <li key={`${item.title || 'step'}-${idx}`} className="space-y-2">
          <span className="absolute -left-[0.65rem] mt-2 h-3 w-3 rounded-full border-2 border-white bg-brand-500 shadow ring-2 ring-brand-200 dark:border-slate-900 dark:ring-brand-700" />
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">{item.title}</p>
            {item.date && <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.date}</span>}
          </div>
          {item.description && <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>}
          {item.status && (
            <span
              className={clsx(
                'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]',
                item.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
              )}
            >
              {item.status}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
