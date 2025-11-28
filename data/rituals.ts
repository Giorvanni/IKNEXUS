export interface Ritual {
  id: number;
  brandId: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  valueProps: string[];
  ctaLabel: string;
}

export const rituals: Ritual[] = [
  {
    id: 1,
    brandId: 'iris-kooij',
    name: 'Fascia Ritueel',
    slug: 'fascia-ritueel',
    shortDescription: 'Diepe weefselbehandeling die spanning loslaat en het lichaam opnieuw uitlijnt.',
    longDescription: 'Het Fascia Ritueel combineert zachte, continue druk met ademhaling om het bindweefsel ruimte te geven. Elke sessie is afgestemd op jouw lichaam en tempo.',
    valueProps: [
      'Verlichting van chronische spanning',
      'Verbeterde houding en mobiliteit',
      'Bewust ademritme',
      'Nazorg met stretch- en ademadvies'
    ],
    ctaLabel: 'Ontdek het ritueel'
  },
  {
    id: 2,
    brandId: 'iris-kooij',
    name: 'Schoonheidsritueel',
    slug: 'schoonheidsritueel',
    shortDescription: 'Botanische facial met Pharmos Natur producten voor glow en herstel.',
    longDescription: 'Een kalmerend ritueel met natuurlijke formuleringen op basis van verse Aloë Vera. Focus op huidherstel, lymfedrainage en littekenverzachting.',
    valueProps: [
      '100% natuurlijke formules',
      'Manuele lymfedrainage',
      'Holistische massage',
      'Litteken- en pigmentverzachting'
    ],
    ctaLabel: 'Plan een sessie'
  },
  {
    id: 3,
    brandId: 'iris-kooij',
    name: 'Body & Mind',
    slug: 'body-mind',
    shortDescription: 'Combinatie van fascia‑werk en skincare voor totale reset.',
    longDescription: 'Een ritueel waarin we fascia, adem en huid in één flow behandelen. Voor iedereen die body + mind wil synchroniseren.',
    valueProps: [
      'Harmoniseert zenuwstelsel',
      'Verbetert doorbloeding',
      'Boost voor immuunsysteem',
      'Inclusief adem- en integratietips'
    ],
    ctaLabel: 'Reserveer nu'
  },
  {
    id: 4,
    brandId: 'iris-kooij',
    name: 'Signature Ritueel',
    slug: 'signature',
    shortDescription: 'Volledig op maat: intake, fascia-release, huid en adem.',
    longDescription: 'We starten met een uitgebreide intake en stellen vervolgens een signatuurritueel samen waarin aanraking, skincare en ademwerk samenkomen.',
    valueProps: [
      'Op maat gemaakt plan',
      'Bewuste afronding met thee & journaling',
      'Nazorg met persoonlijke tips',
      'Optionele duo-sessie'
    ],
    ctaLabel: 'Stel samen'
  }
];

export function getRitualBySlug(slug: string) {
  return rituals.find(r => r.slug === slug);
}

