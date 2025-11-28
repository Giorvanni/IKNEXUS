"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { ChevronDown, Menu, X } from 'lucide-react';

import { DarkModeToggle } from './DarkModeToggle';
import { useBrand } from '../../lib/brandContext';

type SimpleLink = { label: string; href: string };
type ActionLink = SimpleLink & { variant: 'primary' | 'ghost' };
type HighlightLink = { title: string; href: string; description: string };

const MAX_NAV_LINKS = 12;

const FALLBACK_LINKS: SimpleLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Behandelingen', href: '/rituelen' },
  { label: 'Over Ons', href: '/about' },
  { label: 'Professionals', href: '/academy' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' }
];

const CTA_LINKS: ActionLink[] = [
  { label: 'Ontdek Rituelen', href: '/rituelen', variant: 'ghost' },
  { label: 'Boek nu', href: '/contact', variant: 'primary' }
];

const DEFAULT_HIGHLIGHT_LINKS: HighlightLink[] = [
  {
    title: 'Rituelen',
    href: '/rituelen',
    description: 'Signature fascia & skincare belevingen'
  },
  {
    title: 'Skincare',
    href: '/shop',
    description: 'Pharmos Natural Skincare collectie'
  },
  {
    title: 'Academy',
    href: '/academy',
    description: 'Workshops, mentorschap & trainingen'
  }
];

const HIGHLIGHT_DESCRIPTION_FALLBACK: Record<string, string> = DEFAULT_HIGHLIGHT_LINKS.reduce((acc, item) => {
  acc[item.href] = item.description;
  return acc;
}, {} as Record<string, string>);

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export function Navigation({ role }: { role?: string }) {
  const { navigation, name } = useBrand();
  const pathname = usePathname();
  const baseId = useId();
  const mobilePanelId = `${baseId}-mobile-panel`;
  const desktopPanelId = `${baseId}-desktop-panel`;
  const desktopButtonId = `${baseId}-desktop-button`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  const links = (navigation && navigation.length ? navigation : FALLBACK_LINKS).slice(0, MAX_NAV_LINKS);
  const highlightLinks: HighlightLink[] = links.length
    ? links
        .slice(0, Math.min(3, links.length))
        .map((item, idx) => ({
          title: item.label,
          href: item.href,
          description:
            HIGHLIGHT_DESCRIPTION_FALLBACK[item.href] ||
            DEFAULT_HIGHLIGHT_LINKS[idx]?.description ||
            `Ontdek ${item.label.toLowerCase()}`
        }))
    : DEFAULT_HIGHLIGHT_LINKS;
  const accountLink: SimpleLink =
    role === 'ADMIN' || role === 'EDITOR'
      ? { label: 'Studio admin', href: '/admin' }
      : { label: 'Inloggen', href: '/login' };
  const monogram =
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'IK';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!desktopOpen) return undefined;
    const handleClick = (event: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setDesktopOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDesktopOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [desktopOpen]);

  useEffect(() => {
    // Prevent background scrolling when the mobile panel is open.
    if (!mobileOpen) {
      document.body.style.removeProperty('overflow');
      return undefined;
    }
    document.body.style.setProperty('overflow', 'hidden');
    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 border-b bg-white/80 transition-all duration-200 supports-[backdrop-filter]:backdrop-blur-lg dark:bg-slate-950/70',
        scrolled
          ? 'border-slate-200/80 shadow-lg dark:border-slate-800/70'
          : 'border-transparent shadow-none'
      )}
    >
      <div className="container relative flex h-16 items-center gap-4">
        <div className="flex flex-1 items-center gap-3">
          <Link
            href="/"
            aria-label={name}
            className="flex items-center gap-3 font-serif text-base font-semibold tracking-tight"
            onClick={() => setMobileOpen(false)}
          >
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:border-slate-700 dark:text-slate-300">
              {monogram}
            </span>
            <span className="hidden sm:inline">{name}</span>
          </Link>
        </div>
        <div className="hidden flex-1 items-center justify-end gap-3 lg:flex" ref={desktopMenuRef}>
          <button
            id={desktopButtonId}
            type="button"
            aria-haspopup="true"
            aria-controls={desktopPanelId}
            aria-expanded={desktopOpen}
            onClick={() => setDesktopOpen((prev) => !prev)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-wide transition',
              desktopOpen
                ? 'border-brand-200 bg-white text-brand-800 shadow-sm dark:border-brand-400/70 dark:text-brand-200'
                : 'border-slate-200 bg-white/80 text-slate-700 hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-brand-400'
            )}
          >
            Menu
            <ChevronDown
              className={clsx('h-4 w-4 transition-transform', desktopOpen ? 'rotate-180' : 'rotate-0')}
              aria-hidden="true"
            />
          </button>
          <Link href="/rituelen" className="btn-secondary hidden text-sm lg:inline-flex">
            Ontdek Rituelen
          </Link>
          <Link href="/contact" className="btn-primary hidden text-sm lg:inline-flex">
            Boek nu
          </Link>
          <DarkModeToggle />
          {desktopOpen && (
            <div
              id={desktopPanelId}
              role="menu"
              aria-labelledby={desktopButtonId}
              className="absolute left-1/2 top-[calc(100%+1rem)] hidden w-full max-w-3xl -translate-x-1/2 rounded-3xl border border-slate-200 bg-white/95 p-1 shadow-2xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-950/95 lg:block"
            >
              <DesktopMenuPanel
                links={links}
                highlightLinks={highlightLinks}
                accountLink={accountLink}
                onNavigate={() => setDesktopOpen(false)}
              />
            </div>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-500 lg:hidden"
            aria-label={mobileOpen ? 'Sluit hoofdmenu' : 'Open hoofdmenu'}
            aria-controls={mobilePanelId}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <MobilePanel
        open={mobileOpen}
        panelId={mobilePanelId}
        name={name}
        links={links}
        highlightLinks={highlightLinks}
        pathname={pathname}
        accountLink={accountLink}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}

function DesktopMenuPanel({
  links,
  highlightLinks,
  accountLink,
  onNavigate
}: {
  links: SimpleLink[];
  highlightLinks: HighlightLink[];
  accountLink: SimpleLink;
  onNavigate: () => void;
}) {
  const primary = links.slice(0, 6);
  const secondary = links.slice(6);
  return (
    <div className="rounded-[26px] border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlightLinks.map((highlight) => (
          <Link
            key={highlight.href}
            href={highlight.href}
            onClick={onNavigate}
            className="group flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-brand-50 via-white to-white p-4 text-left shadow-sm transition hover:shadow-lg dark:from-brand-900/30 dark:via-slate-900 dark:to-slate-950"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{highlight.title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{highlight.description}</p>
            </div>
            <span aria-hidden className="mt-4 inline-flex items-center text-xs font-semibold text-brand-700 transition group-hover:translate-x-1 dark:text-brand-300">
              Ontdek
            </span>
          </Link>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {primary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-brand-100 hover:bg-brand-50/40 dark:hover:border-brand-500/50 dark:hover:bg-slate-900/60"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ontdek {item.label.toLowerCase()}</p>
            </div>
            <span aria-hidden="true" className="text-sm text-brand-600 dark:text-brand-300">
              →
            </span>
          </Link>
        ))}
      </div>
      {!!secondary.length && (
        <>
          <div className="mt-4 text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Meer</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {secondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-400"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Persoonlijk advies</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Plan je ritueel telefonisch of via e-mail.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CTA_LINKS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={onNavigate}
              className={clsx(
                action.variant === 'primary' ? 'btn-primary px-4 py-2 text-xs' : 'btn-secondary px-4 py-2 text-xs'
              )}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
  <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <Link
          href={accountLink.href}
          onClick={onNavigate}
          className="font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300"
        >
          {accountLink.label}
        </Link>
      </div>
    </div>
  );
}

interface MobilePanelProps {
  open: boolean;
  panelId: string;
  name: string;
  links: SimpleLink[];
  highlightLinks: HighlightLink[];
  pathname: string | null;
  accountLink: SimpleLink;
  onClose: () => void;
}

function MobilePanel({ open, panelId, name, links, highlightLinks, pathname, accountLink, onClose }: MobilePanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      id={panelId}
      className="fixed inset-0 z-[70] bg-transparent lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} hoofdmenu`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Menu</p>
            <p className="text-base font-semibold tracking-tight">{name}</p>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:text-slate-100 dark:hover:border-brand-400"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Sluit menu</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-3">
            {highlightLinks.map((highlight) => (
              <Link
                key={highlight.href}
                href={highlight.href}
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left shadow-sm transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{highlight.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{highlight.description}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Menu</div>
          <nav aria-label="Mobiel hoofdmenu">
            <ul className="space-y-2">
              {links.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={onClose}
                      className={clsx(
                        'block rounded-2xl border px-4 py-3 text-base font-medium shadow-sm transition',
                        active
                          ? 'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-400/60 dark:bg-slate-900 dark:text-brand-100'
                          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-400/60 dark:hover:bg-slate-800'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-8 space-y-3">
            {CTA_LINKS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={onClose}
                className={clsx(
                  action.variant === 'primary'
                    ? 'btn-primary w-full justify-center'
                    : 'btn-secondary w-full justify-center'
                )}
              >
                {action.label}
              </Link>
            ))}
            <Link
              href={accountLink.href}
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400"
            >
              {accountLink.label}
            </Link>
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Thema</p>
                <p className="text-xs subtle">Schakel tussen licht en donker</p>
              </div>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
