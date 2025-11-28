import { ResponsiveImage } from './ResponsiveImage';

export function Hero() {
  return (
    <section className="pt-[var(--section-spacing-loose)] pb-[var(--section-spacing-tight)]">
      <div className="container grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Natuurlijke beauty & fascia</p>
          <h1 className="mt-3 hero-title font-serif font-semibold tracking-tight">
            Rituelen voor lichaam, huid en geest
          </h1>
          <p className="mt-6 text-lg subtle text-balance">
            Een serene plek waar fascia‑rituelen en natuurlijke huidverzorging samenkomen. Vertraag, laat los en kom thuis in jezelf.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/rituelen" className="btn-primary text-sm">
              Ontdek rituelen
            </a>
            <a href="#newsletter" className="btn-secondary text-sm">
              Blijf op de hoogte
            </a>
          </div>
        </div>
        <div className="relative">
          <ResponsiveImage
            src="/uploads/1763123763649-1761051656998.jpeg"
            alt="Fascia behandeling in de praktijk van Iris Kooij"
            aspectRatio={4 / 3}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="rounded-xl shadow-card"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_60%)] mix-blend-overlay" />
        </div>
      </div>
    </section>
  );
}
