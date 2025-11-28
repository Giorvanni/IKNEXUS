import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getRitualBySlug } from '../../../lib/rituals';
import { ritualMetadata, jsonLdForServiceOffer } from '../../../lib/seo';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const ritual = await getRitualBySlug(params.slug);
  if (!ritual) return {};
  return ritualMetadata(ritual.name, ritual.shortDescription);
}

export default async function RitueelDetailPage({ params }: { params: { slug: string } }) {
  const ritual = await getRitualBySlug(params.slug);
  if (!ritual) return notFound();

  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        {ritual.featuredImageUrl && (
          <div className="mb-6">
            <Image
              src={ritual.featuredImageUrl}
              alt={ritual.featuredImageAlt || ''}
              width={1200}
              height={480}
              className="rounded-md w-full max-h-80 object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority={false}
            />
          </div>
        )}
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{ritual.name}</h1>
        {(ritual as any).bookingLink && (
          <div className="mt-4">
            <a className="btn-primary" href={(ritual as any).bookingLink} aria-label={`${ritual.name} boeken`}>
              Boek nu
            </a>
          </div>
        )}
        <p className="subtle mt-4">{ritual.longDescription}</p>
        {(() => {
          const s = params.slug;
          if (s === 'fascia-ritueel') {
            return (
              <>
                <h2 className="font-serif mt-10 text-xl font-semibold tracking-tight">Wat is fascia?</h2>
                <p className="subtle mt-3">Fascia is het bindweefsel dat al je spieren, botten en organen omhult. Wanneer spanning of trauma dit weefsel verstijft, kan je lichaam uit balans raken en bewegingsvrijheid verliezen. Met zachte, constante druk begeleiden we het weefsel naar ruimte en ontspanning.</p>
                <h2 className="font-serif mt-8 text-xl font-semibold tracking-tight">Proces</h2>
                <p className="subtle mt-3">Intake en body‑analyse, gevolgd door aandachtige hands‑on technieken. Sessies duren gemiddeld 90 minuten en worden afgestemd op jouw ritme.</p>
              </>
            );
          }
          if (s === 'schoonheidsritueel') {
            return (
              <>
                <h2 className="font-serif mt-10 text-xl font-semibold tracking-tight">Productfilosofie</h2>
                <p className="subtle mt-3">Natuurlijke formules met biologische Aloë Vera (in plaats van water) en botanische extracten. Zacht, kalmerend en hydraterend.</p>
                <h2 className="font-serif mt-8 text-xl font-semibold tracking-tight">Beleving</h2>
                <p className="subtle mt-3">Reiniging, massage en masker in een serene setting – gericht op herstel en een stralende huid.</p>
              </>
            );
          }
          if (s === 'body-mind') {
            return (
              <>
                <h2 className="font-serif mt-10 text-xl font-semibold tracking-tight">Holistische benadering</h2>
                <p className="subtle mt-3">Een combinatie van fascia‑werk en skincare voor lichaam én huid. Adem, aanraking en aandacht komen samen.</p>
              </>
            );
          }
          if (s === 'signature') {
            return (
              <>
                <h2 className="font-serif mt-10 text-xl font-semibold tracking-tight">Op maat</h2>
                <p className="subtle mt-3">Na een persoonlijke intake stellen we een signatuurritueel samen dat aansluit bij jouw behoeften en tempo.</p>
              </>
            );
          }
          return null;
        })()}
        <div className="mt-8 grid gap-2 md:grid-cols-3">
          {ritual.durationMinutes && (
            <div className="rounded-md bg-slate-50 dark:bg-slate-800/50 p-4 text-sm">
              <div className="subtle">Duur</div>
              <div className="font-medium">{ritual.durationMinutes} min</div>
            </div>
          )}
          {ritual.bookingLink && (
            <div className="flex items-end rounded-md bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
              <a className="btn-primary btn-sm" href={ritual.bookingLink} aria-label={`${ritual.name} boeken`}>
                Boek nu
              </a>
            </div>
          )}
        </div>
        <h2 className="font-serif mt-10 text-xl font-semibold tracking-tight">Voordelen</h2>
        <ul className="mt-4 grid gap-3">
          {ritual.valueProps.map(v => (
            <li key={v} className="rounded-md border border-slate-200 dark:border-slate-700 p-4 text-sm">{v}</li>
          ))}
        </ul>
        {ritual.contraindications && (
          <>
            <h2 className="font-serif mt-10 text-xl font-semibold tracking-tight">Contra‑indicaties</h2>
            <ul className="mt-4 grid gap-3">
              {ritual.contraindications.split(/\r?\n/).filter(Boolean).map(v => (
                <li key={v} className="rounded-md border border-slate-200 dark:border-slate-700 p-4 text-sm">{v}</li>
              ))}
            </ul>
          </>
        )}
        {!!ritual.faq && Array.isArray(ritual.faq) && ritual.faq.length > 0 && (
          <>
            <h2 className="font-serif mt-10 text-xl font-semibold tracking-tight">Veelgestelde vragen</h2>
            <dl className="mt-4">
              {(ritual.faq as any[]).map((qa, i) => (
                <div key={i} className="py-3 border-b border-slate-200 dark:border-slate-700">
                  <dt className="font-medium">{qa.question}</dt>
                  <dd className="subtle mt-1 text-sm">{qa.answer}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        <div className="mt-10">
          <a href="/rituelen" className="btn-secondary">Terug naar Rituelen</a>
        </div>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdForServiceOffer({
            name: ritual.name,
            description: ritual.shortDescription,
            durationMinutes: (ritual as any).durationMinutes || undefined,
            // Geen prijsinformatie in markup voorlopig
            priceCents: undefined,
            currency: undefined,
            bookingLink: (ritual as any).bookingLink || undefined,
            image: ritual.featuredImageUrl || undefined
          })) }}
        />
      </div>
    </section>
  );
}
