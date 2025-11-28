import React from 'react';
import { Hero } from './components/Hero';
import { Section } from './components/Section';
import { RitualCard } from './components/RitualCard';
import { NewsletterForm } from './components/NewsletterForm';
import { getRituals } from '../lib/rituals';
import { PageRenderer } from './components/PageRenderer';
import { loadPageForRequest } from '../lib/pageLoader';

export default async function HomePage() {
  const rituals = await getRituals();
  const page = await loadPageForRequest('home');
  if (page && page.published && page.sections.length > 0) {
    return <PageRenderer sections={page.sections as any} />;
  }
  // Fallback legacy content
  return (
    <>
      <Hero />
      <Section title="Onze Rituelen">
        <div className="grid gap-6 md:grid-cols-3">
          {rituals.slice(0,3).map(ritual => <RitualCard key={ritual.id} ritual={ritual} />)}
        </div>
        <div className="mt-8">
          <a href="/rituelen" className="btn-primary">Alle Rituelen</a>
        </div>
      </Section>
      <Section title="Filosofie">
        <p className="subtle max-w-2xl">
          Welkom bij Iris Kooij – een plek waar stilte hoorbaar wordt en tijd vertraagt. Hier transformeren we spanning in zachtheid via exclusieve fascia‑ en beautyrituelen. Ware schoonheid begint waar spanning eindigt.
        </p>
      </Section>
      <Section id="newsletter" title="Blijf op de hoogte">
        <p className="subtle max-w-xl">Ontvang inspiratie over fascia, natuurlijke huidverzorging en nieuwe Academy‑data. Schrijf je in en vertraag mee.</p>
        <NewsletterForm />
      </Section>
    </>
  );
}
