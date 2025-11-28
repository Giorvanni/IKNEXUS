const { PrismaClient, PageSectionType } = require('@prisma/client');
const bcrypt = require('bcrypt');
const blogTemplate = require('../data/blogTemplate.json');

const prisma = new PrismaClient();

async function upsertPageWithSections({ brandId, slug, title, description, sections }) {
  const page = await prisma.page.upsert({
    where: { brandId_slug: { brandId, slug } },
    update: { title, description, published: true },
    create: { brandId, slug, title, description, published: true }
  });
  await prisma.pageSection.deleteMany({ where: { pageId: page.id } });
  if (Array.isArray(sections) && sections.length > 0) {
    await prisma.pageSection.createMany({
      data: sections.map((section, index) => ({
        pageId: page.id,
        order: index,
        type: section.type,
        data: section.data
      }))
    });
  }
}

async function main() {
  const brand = await prisma.brand.upsert({
    where: { slug: 'iris-kooij' },
    update: {
      name: 'Iris Kooij Wellness',
      domain: 'localhost',
      primaryColor: '#6f865d',
      secondaryColor: '#d4a373'
    },
    create: {
      slug: 'iris-kooij',
      name: 'Iris Kooij Wellness',
      domain: 'localhost',
      primaryColor: '#6f865d',
      secondaryColor: '#d4a373'
    }
  });

  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@iris.local' },
    update: { name: 'Iris Admin', role: 'ADMIN', passwordHash },
    create: { email: 'admin@iris.local', name: 'Iris Admin', role: 'ADMIN', passwordHash }
  });

  const navLinks = [
    { label: 'Home', href: '/', order: 0 },
    { label: 'Rituelen', href: '/rituelen', order: 1 },
    { label: 'Over Iris', href: '/over-iris', order: 2 },
    { label: 'Academy', href: '/academy', order: 3 },
    { label: 'Blog', href: '/blog', order: 4 },
    { label: 'Contact', href: '/contact', order: 5 }
  ];
  await prisma.navigationLink.deleteMany({ where: { brandId: brand.id } });
  if (navLinks.length) {
    await prisma.navigationLink.createMany({ data: navLinks.map((link) => ({ ...link, brandId: brand.id })) });
  }

  const ventures = [
    {
      slug: 'gantke-fascia',
      name: 'Gantke® Fascia Therapie',
      tagline: 'Diepgaande fascia sessie',
      shortDescription: 'Intensief fascia traject voor blijvende ontspanning.',
      longDescription: 'Een award winning fascia therapie gericht op diep bindweefsel. Ideaal bij langdurige spanningsklachten.',
      valueProps: ['Lichaamsstructuur-analyse', 'Traject op maat', 'Docent Gantke® Partner'],
      ctaLabel: 'Ontdek ritueel',
      durationMinutes: 75,
      priceCents: 14500,
      bookingLink: '/contact'
    },
    {
      slug: 'signature-facial',
      name: 'Signature Facial',
      tagline: 'Pharmos Natur glow',
      shortDescription: 'Natuurlijke facial met vers aloe vera blad.',
      longDescription: 'Een moment van rust met slow beauty technieken voor huid en fascia.',
      valueProps: ['Vers biologisch aloe vera', 'Fascia massage', 'Persoonlijk behandelplan'],
      ctaLabel: 'Plan facial',
      durationMinutes: 60,
      priceCents: 9900,
      bookingLink: '/contact'
    },
    {
      slug: 'fascia-embodiment',
      name: 'Fascia Embodiment',
      tagline: 'Beweeg en adem',
      shortDescription: 'Kleine groepssessie gericht op fascia release en adem.',
      longDescription: 'Beweging, adem en fascia release komen samen in een kalme setting.',
      valueProps: ['Maximaal 4 deelnemers', 'Adem en stretch flow', 'Inclusief nazorg mail'],
      ctaLabel: 'Reserveer plek',
      durationMinutes: 90,
      priceCents: 6500,
      bookingLink: '/contact'
    },
    {
      slug: 'herstel-breathwork',
      name: 'Herstel Breathwork',
      tagline: 'Rustige ademcirkel',
      shortDescription: 'Ademritueel dat zenuwstelsel kalmeert en fascia verzacht.',
      longDescription: 'Een begeleide ademcirkel met zachte fascia release terwijl je leert vertragen. Ideaal na drukke periodes of intensieve trajecten.',
      valueProps: ['Zachte ademflow', 'Inclusief thuisoefeningen', 'Maximaal 5 deelnemers'],
      ctaLabel: 'Reserveer sessie',
      durationMinutes: 60,
      priceCents: 5500,
      bookingLink: '/contact'
    }
  ];


  function cloneTemplate() {
    return JSON.parse(JSON.stringify(blogTemplate));
  }

  const blogPosts = [
    {
      slug: 'fascia-adem-ritueel',
      title: 'Waarom ademwerk fascia sneller laat herstellen',
      excerpt: 'Een kijkje achter de schermen van mijn favoriete ademritueel en hoe het je bindweefsel reset.',
      coverImageUrl: '/images/blog/breathwork.jpg',
      coverImageAlt: 'Client tijdens ademritueel',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 4,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.sections[0].heading = 'Hoe ademwerk fascia ontspant';
        tpl.sections[0].body = 'Langzame, bewuste ademhaling activeert je parasympatisch zenuwstelsel. Daardoor krijgt fascia de kans om te hydrateren en spanningspatronen los te laten. Tijdens het ritueel combineer ik adem met subtiele fascia stretch en drukpunten.';
        tpl.sections[1].heading = 'Wat je tijdens het ritueel ervaart';
        tpl.sections[1].body = 'We starten met een check-in en body scan. Daarna begeleid ik je door drie ademgolven. Je voelt warmte, tintelingen en vaak ook emotionele release. Ik eindig met zachte druktechnieken op het diafragma zodat je dieper kunt zakken.';
        tpl.sections[2].heading = 'Thuis verder oefenen';
        tpl.sections[2].body = 'Plan na het ritueel drie korte momenten per dag om dezelfde ademflow te doen. Vier minuten is genoeg. Leg je handen op je ribben, adem in vier tellen in en zes tellen uit. Zo houd je de ruimte in je fascia vast.';
        return tpl;
      })()
    },
    {
      slug: 'signature-facial-glow',
      title: 'De laagjes van de Signature Facial',
      excerpt: 'Ik neem je mee door elk hoofdstuk van mijn meest geboekte facial en hoe ik fasciawerk toevoeg.',
      coverImageUrl: '/images/blog/facial.jpg',
      coverImageAlt: 'Facial behandeling',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 5,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Studio Ritualen';
        tpl.intro = 'De Signature Facial is meer dan een behandeling voor je huid. Het is een ritueel waarin ik planten, adem en fascia combineer zodat je glow dagenlang blijft.';
        tpl.sections[0].heading = 'Stap 1 - Fascia openen';
        tpl.sections[0].body = 'Voor ik met de huid werk open ik eerst de fascia rond kaak, borst en nek. Dat doe ik met langzame, rollende technieken en gua sha tools. Hierdoor stroomt lymfe sneller en neemt je huid voeding beter op.';
        tpl.sections[1].heading = 'Stap 2 - Aloe vera layering';
        tpl.sections[1].body = 'Ik snijd een vers blad open en laag active stoffen precies daar waar je huid het nodig heeft. Het koelt, vult vocht aan en werkt ontstekingsremmend. Terwijl het blad intrekt, masseer ik drukpunten rond ogen en slapen.';
        tpl.sections[2].heading = 'Stap 3 - Integratie';
        tpl.sections[2].body = 'Je sluit af met een fascia stretch voor handen en voeten plus lichaamsolie zodat alles in balans eindigt. Thuis krijg je een mini routine mee zodat de glow minimaal vijf dagen blijft.';
        tpl.highlight.text = '"Wanneer fascia ontspant, reageert de huid direct. Glow ontstaat van binnenuit."';
        tpl.highlight.attribution = 'Iris';
        return tpl;
      })()
    },
    {
      slug: 'fascia-ochtend-ritueel',
      title: 'Zo start je je dag fascia-friendly',
      excerpt: 'Een zachte ochtendroutine die spanning weghaalt voor de dag echt begint.',
      coverImageUrl: '/images/blog/morning.jpg',
      coverImageAlt: 'Ochtendlicht in de studio',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 3,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Studio Routine';
        tpl.sections[0].heading = 'Stap 1 - Ademruimte creeren';
        tpl.sections[0].body = 'Begin met vijf minuten zachte ribademhaling terwijl je handen het borstgebied dragen. Hierdoor ontspant het bindweefsel rond het hart en voelt je lichaam direct ruimer.';
        tpl.sections[1].heading = 'Stap 2 - Fascia stretch in het daglicht';
        tpl.sections[1].body = 'Gebruik een lange rekkende beweging langs de flank, gevolgd door schuine rotaties. Combineer het met een mindful scan van je voeten zodat je zenuwstelsel begrijpt dat je veilig mag vertragen.';
        tpl.sections[2].heading = 'Stap 3 - Hydrateren en journalen';
        tpl.sections[2].body = 'Drink warm water met citroen, noteer een intentie en sluit af met een zachte gua sha strijking over wangen en kaak. Je fascia blijft hierdoor soepel gedurende de dag.';
        tpl.highlight.text = '"De manier waarop je ochtend start bepaalt de kwaliteit van je fascia."';
        tpl.highlight.attribution = 'Iris';
        return tpl;
      })()
    },
    {
      slug: 'ademcirkel-thuis-vervolg',
      title: 'Thuis verder na een ademcirkel',
      excerpt: 'Hoe je de integratieperiode vormgeeft zodat de release uit de studio blijft nazinderen.',
      coverImageUrl: '/images/blog/home-breath.jpg',
      coverImageAlt: 'Ademwerk thuis',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 4,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Nazorg';
        tpl.sections[0].heading = 'Luisteren naar je zenuwstelsel';
        tpl.sections[0].body = 'Plan direct na je sessie een kwartier stilte. Je lichaam sorteert dan de prikkels en kan de vrijheid in het bindweefsel integreren. Schrijf drie woorden op die je voelt.';
        tpl.sections[1].heading = 'Mini-ademflows tussen afspraken';
        tpl.sections[1].body = 'Gebruik een timer op je telefoon voor micro pauzes: 4 tellen in, 6 uit, 3 rondes lang. Dat houdt het diafragma soepel en voorkomt dat spanning zich opnieuw vastzet.';
        tpl.sections[2].heading = 'Journaling & beweging';
        tpl.sections[2].body = 'Maak een kolom met "lichaam", "gedachte", "actie". Vul hem dagelijks. Koppel er een rustige fascia stretch aan zoals figuur-8 bewegingen met je schouders.';
        tpl.resources = [{ label: 'Plan een check-in', href: '/contact' }];
        return tpl;
      })()
    },
    {
      slug: 'gantke-docent-dagboek',
      title: 'Wat ik meeneem uit een Gantke® trainingsdag',
      excerpt: 'Van hands-on cues tot het belang van ritme tijdens diep bindweefselwerk.',
      coverImageUrl: '/images/blog/training.jpg',
      coverImageAlt: 'Training aan behandeltafel',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 5,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Academy';
        tpl.sections[0].heading = 'Holding space voor professionals';
        tpl.sections[0].body = 'Elke training start met nerve tracing: luisteren naar de mini reacties in handen en polsen. Pas wanneer de therapeut vertraagt, kan de client dat ook.';
        tpl.sections[1].heading = 'Techniek versus presence';
        tpl.sections[1].body = 'We oefenen drukrichtingen centimeter voor centimeter. Toch is het echte verschil de toon van je stem en de stabiliteit van je adem.';
        tpl.sections[2].heading = 'Integratie naar de praktijk';
        tpl.sections[2].body = 'Trajecten eindigen met huiswerk over boundaries, omdat je alleen kunt dragen wat je zelf kunt reguleren. Zo blijft Gantke® werk zacht en effectief.';
        tpl.highlight.text = '"Techniek is de brug, maar je aanwezigheid is het water."';
        tpl.highlight.attribution = 'Iris';
        return tpl;
      })()
    },
    {
      slug: 'winter-huid-herstel',
      title: 'Winterhuid kalmeren met slow beauty',
      excerpt: 'Zo bescherm je fascia en huidbarriere tijdens koude maanden.',
      coverImageUrl: '/images/blog/winter-skin.jpg',
      coverImageAlt: 'Winterlicht op huid',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 4,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Skincare';
        tpl.sections[0].heading = 'Dubbele reiniging zonder stripping';
        tpl.sections[0].body = 'Gebruik olie en kruidencleanser zodat de lipidenlaag blijft bestaan. Je fascia onder de huid reageert direct rustiger.';
        tpl.sections[1].heading = 'Layering met aloe en fascia massage';
        tpl.sections[1].body = 'Breng aloe vera in lagen aan en rol met een verwarmde gua sha over wangen en kaaklijn. Hierdoor wordt microcirculatie wakker zonder roodheid.';
        tpl.sections[2].heading = 'Afsluiten met adem en olie';
        tpl.sections[2].body = 'Adem vier tellen in, acht uit, masseer vervolgens een vettere balm in nek en schouders. Dat verzacht de fascia en houdt warmte vast.';
        tpl.resources = [{ label: 'Plan een winter facial', href: '/contact' }];
        return tpl;
      })()
    },
    {
      slug: 'lymfe-ritueel-voor-thuis',
      title: 'Een mini-lymfe ritueel voor thuis',
      excerpt: 'Stap-voor-stap flush je lymfesysteem zodat je licht en helder blijft tussen sessies.',
      coverImageUrl: '/images/blog/lymph.jpg',
      coverImageAlt: 'Lymfe massage',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 3,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Selfcare';
        tpl.sections[0].heading = 'Opening bij sleutelbeenderen';
        tpl.sections[0].body = 'Leg twee vingers op je sleutelbeen, adem diep en maak cirkels naar buiten. Dit wekt je lymfe stations.';
        tpl.sections[1].heading = 'Armen en buik in flow';
        tpl.sections[1].body = 'Gebruik platte handen en strijk naar boven, eindig steeds in je oksel. Op de buik werk je klokwijs en met minimale druk.';
        tpl.sections[2].heading = 'Afsluiten met benen';
        tpl.sections[2].body = 'Start bij enkels en werk naar lies voor een volledige drainage. Drink daarna warm water zodat afvalstoffen sneller verlaten.';
        tpl.outro = 'Doe dit ritueel maximaal drie keer per week en luister naar de signalen van je lichaam.';
        return tpl;
      })()
    },
    {
      slug: 'fascia-ondersteuning-zwangerschap',
      title: 'Fascia ondersteuning tijdens zwangerschap',
      excerpt: 'Zachte technieken die je lichaam helpen dragen zonder overbelasting.',
      coverImageUrl: '/images/blog/prenatal.jpg',
      coverImageAlt: 'Zwangere vrouw in studio',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 5,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Mama Journey';
        tpl.sections[0].heading = 'Waarom fascia extra aandacht vraagt';
        tpl.sections[0].body = 'Hormonen versoepelen je bindweefsel, maar stress kan het alsnog laten verkrampten. Rustige fascia release rond ribben en bekken houdt ruimte.';
        tpl.sections[1].heading = 'Veilige studio technieken';
        tpl.sections[1].body = 'We werken zijlig, gebruiken kussens en focussen op adem + lange aanraking. Geen diepe druk, wel veel regulatie.';
        tpl.sections[2].heading = 'Thuisritueel voor week 30+';
        tpl.sections[2].body = 'Twintig minuten liggen met voeten omhoog, een warme doek op je onderrug en adem patronen met je partner. Zo blijft het zenuwstelsel klaar voor geboorte.';
        tpl.highlight.text = '"Zwangere fascia heeft grenzen en zachtheid nodig."';
        tpl.highlight.attribution = 'Iris';
        return tpl;
      })()
    },
    {
      slug: 'soundbath-en-fascia',
      title: 'Hoe sound baths fascia helpen loslaten',
      excerpt: 'Een kijkje in de klankreizen die we combineren met fascia touch.',
      coverImageUrl: '/images/blog/soundbath.jpg',
      coverImageAlt: 'Klankschalen op kleed',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 4,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Studio Ritual';
        tpl.sections[0].heading = 'Vibraties en bindweefsel';
        tpl.sections[0].body = 'Lage tonen brengen een trilling die door het water in je fascia reist. Daardoor kan het weefsel makkelijker loslaten wanneer handen daarna volgen.';
        tpl.sections[1].heading = 'Hoe een sessie verloopt';
        tpl.sections[1].body = 'We starten met bodyscan, daarna klankschalen, vervolgens fascia stretch op schouders en heupen. Alles in een rustig tempo.';
        tpl.sections[2].heading = 'Nazorg en integratie';
        tpl.sections[2].body = 'We eindigen met thee, journaling prompts en een ademflow zodat de trilling rustig uitdooft.';
        tpl.resources = [{ label: 'Bekijk sound journeys', href: '/rituelen' }];
        return tpl;
      })()
    },
    {
      slug: 'studio-journal-lente',
      title: 'Studio Journal: lente in de praktijk',
      excerpt: 'Wat we leren van de eerste lente rituelen en hoe jij kunt meebewegen.',
      coverImageUrl: '/images/blog/spring.jpg',
      coverImageAlt: 'Lente bloemen in studio',
      authorName: 'Iris Kooij',
      published: true,
      readingMinutes: 4,
      content: (() => {
        const tpl = cloneTemplate();
        tpl.kicker = 'Studio Journal';
        tpl.sections[0].heading = 'Meer energie, zelfde nood aan vertraging';
        tpl.sections[0].body = 'Clients komen binnen vol plannen, maar fascia vertelt vaak iets anders: nog steeds behoefte aan verankering. We gebruiken daarom langere landingsmomenten.';
        tpl.sections[1].heading = 'Lente botanicals';
        tpl.sections[1].body = 'We werken met jonge netel en kamille in onze maskers voor een kalmerende boost. De geur alleen al werkt regulerend.';
        tpl.sections[2].heading = 'Rituelen voor thuis';
        tpl.sections[2].body = 'Vervang je avond scroll door een hart-openende stretch en wissel warme/koude compressen af op de borst. Dat houdt je fascia mobiel.';
        tpl.outro = 'Bewaar dit journal als herinnering dat lente-energie ook zacht kan zijn.';
        return tpl;
      })()
    }
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { ...post, brandId: brand.id },
      create: { ...post, brandId: brand.id }
    });
  }
  for (const venture of ventures) {
    await prisma.venture.upsert({
      where: { slug: venture.slug },
      update: { ...venture, brandId: brand.id },
      create: { ...venture, brandId: brand.id }
    });
  }

  await upsertPageWithSections({
    brandId: brand.id,
    slug: 'home',
    title: 'Rituelen voor lichaam, huid en geest',
    description: 'Slow beauty studio in Hoofddorp met fascia expertise en natuurlijke skincare.',
    sections: [
      {
        type: PageSectionType.HERO,
        data: {
          title: 'Vertraag met fascia rituelen',
          subtitle: 'Spa-waardige fascia en huidbehandelingen voor diepe ontspanning.',
          ctaLabel: 'Ontdek rituelen',
          ctaHref: '/rituelen',
          layout: { spacing: 'loose' }
        }
      },
      {
        type: PageSectionType.TEXT,
        data: {
          title: 'Onze filosofie',
          body: 'We combineren fascia therapie met natuurlijke schoonheid voor blijvende verlichting. Elke sessie is persoonlijk afgestemd.'
        }
      },
      {
        type: PageSectionType.FEATURES,
        data: {
          title: 'Waarom clienten terugkomen',
          items: ['Fascia expertise en docente', 'Echte aandacht en rust', 'Resultaatgerichte behandelingen'],
          layout: { variant: 'muted' }
        }
      },
      {
        type: PageSectionType.VENTURES,
        data: {
          title: 'Onze rituelen',
          limit: 3,
          layout: { variant: 'brand', width: 'wide' }
        }
      },
      {
        type: PageSectionType.CTA,
        data: {
          title: 'Plan een sessie',
          body: 'Reserveer direct of stuur een bericht voor een persoonlijk voorstel.',
          buttonLabel: 'Plan consult',
          buttonHref: '/contact',
          layout: { align: 'center', variant: 'dark' }
        }
      }
    ]
  });

  await upsertPageWithSections({
    brandId: brand.id,
    slug: 'over-iris',
    title: 'Over Iris Kooij',
    description: 'Maak kennis met de fascia therapeut en docent achter Iris Kooij Wellness.',
    sections: [
      {
        type: PageSectionType.HERO,
        data: {
          title: 'Vakvrouw in fascia & slow beauty',
          subtitle: 'Ruim 10 jaar ervaring als fascia therapeut en Gantke® docente.',
          ctaLabel: 'Plan een kennismaking',
          ctaHref: '/contact'
        }
      },
      {
        type: PageSectionType.TEXT,
        data: {
          body: 'Ik geloof dat echte schoonheid begint wanneer spanning oplost. Met fascia werk ik niet alleen aan het lichaam, maar ook aan rust in het hoofd.'
        }
      },
      {
        type: PageSectionType.TIMELINE,
        data: {
          title: 'Onze reis',
          items: [
            { title: 'Start praktijk', description: 'De studio opent haar deuren in Hoofddorp.', date: '2014', status: 'completed' },
            { title: 'Gantke® licentie', description: 'Iris wordt officiële partner en docente.', date: '2017', status: 'completed' },
            { title: 'Academy trajecten', description: 'Lancering van lessen voor professionals.', date: '2021', status: 'active' }
          ]
        }
      },
      {
        type: PageSectionType.TESTIMONIALS,
        data: {
          title: 'Ervaringen',
          columns: 2,
          items: [
            { quote: 'Na één traject voel ik weer ruimte om vrij te bewegen.', author: 'Miriam', role: 'Ondernemer' },
            { quote: 'De combinatie van fascia en huidwerk is uniek en life changing.', author: 'Sebastian', role: 'Coach' }
          ]
        }
      }
    ]
  });

  console.log('Database seeded with launch content');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
