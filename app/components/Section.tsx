import { ReactNode } from 'react';
import clsx from 'clsx';

export type SectionVariant = 'default' | 'muted' | 'brand' | 'dark';
export type SectionAlign = 'left' | 'center';
export type SectionWidth = 'default' | 'narrow' | 'wide';
export type SectionSpacing = 'default' | 'tight' | 'loose';

interface SectionProps {
  id?: string;
  title?: string;
  kicker?: string;
  variant?: SectionVariant;
  align?: SectionAlign;
  width?: SectionWidth;
  spacing?: SectionSpacing;
  children: ReactNode;
}

export function Section({
  id,
  title,
  kicker,
  variant = 'default',
  align = 'left',
  width = 'default',
  spacing = 'default',
  children
}: SectionProps) {
  const variantClass = {
    default: 'bg-transparent',
    muted: 'bg-slate-50 dark:bg-slate-900/30',
    brand: 'bg-brand-50/70 dark:bg-brand-900/20',
    dark: 'bg-slate-900 text-slate-100'
  }[variant];

  const containerClass = {
    default: 'container',
    narrow: 'container max-w-3xl',
    wide: 'container max-w-6xl'
  }[width];

  const spacingClass = {
    tight: 'py-[var(--section-spacing-tight)] mt-[var(--section-offset-tight)]',
    default: 'py-[var(--section-spacing-default)] mt-[var(--section-offset-default)]',
    loose: 'py-[var(--section-spacing-loose)] mt-[var(--section-offset-loose)]'
  }[spacing];

  const headingClass = clsx('section-title', align === 'center' && 'mx-auto text-center');

  return (
    <section id={id} className={clsx(spacingClass, variantClass)}>
      <div className={clsx(containerClass, align === 'center' && 'text-center')}>
        {kicker && <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{kicker}</p>}
        {title && <h2 className={headingClass}>{title}</h2>}
        <div className={clsx('mt-4', align === 'center' && 'mx-auto')}>{children}</div>
      </div>
    </section>
  );
}
