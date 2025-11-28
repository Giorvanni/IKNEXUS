export function Footer({ role }: { role?: string }) {
  const authLink = role === 'ADMIN' || role === 'EDITOR'
    ? { label: 'Admin', href: '/admin' }
    : { label: 'Inloggen', href: '/login' };
  return (
    <footer className="mt-28 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
      <div className="container py-12 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="font-semibold text-lg tracking-tight">Iris Kooij Wellness</h2>
          <p className="subtle mt-2 text-sm max-w-xs">Rituelen voor lichaam, huid en geest. Fascia‑werk en natuurlijke verzorging in een serene studio.</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Navigatie</h3>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Home', href: '/' },
              { label: 'Behandelingen', href: '/rituelen' },
              { label: 'Over Ons', href: '/about' },
              { label: 'Professionals', href: '/academy' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Contact', href: '/contact' },
              authLink
            ].map(item => (
              <li key={item.href}><a className="footer-link" href={item.href}>{item.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Contact</h3>
          <address className="not-italic text-sm space-y-1 subtle">
            <div>Crommelinbaan 29K</div>
            <div>2142 EX Cruquius</div>
            <div>The Netherlands</div>
          </address>
        </div>
      </div>
      <div className="py-6 text-center text-xs subtle">© 2025 Iris Kooij Wellness. Alle rechten voorbehouden.</div>
    </footer>
  );
}
