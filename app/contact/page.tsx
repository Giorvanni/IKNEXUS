import { PageRenderer } from '../components/PageRenderer';
import { ContactForm } from '../components/ContactForm';
import { ContactInfoCard, type ContactInfoData } from '../components/ContactInfoCard';
import { loadPageForRequest } from '../../lib/pageLoader';

function extractAddress(address?: string | null) {
  const fallback = {
    streetAddress: 'Crommelinbaan 29K',
    postalCode: '2142 EX',
    addressLocality: 'Cruquius'
  };
  if (!address) return fallback;
  const lines = address.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const streetAddress = lines[0] || fallback.streetAddress;
  const cityLine = lines[1] || '';
  const postalMatch = cityLine.match(/^([0-9]{3,4}\s?[A-Z]{2})\s*(.+)?$/i);
  const postalCode = postalMatch ? postalMatch[1].toUpperCase() : fallback.postalCode;
  const addressLocality = postalMatch && postalMatch[2] ? postalMatch[2] : lines[2] || fallback.addressLocality;
  return { streetAddress, postalCode, addressLocality };
}

export const metadata = { title: 'Contact | Iris Kooij Wellness' };

export default async function ContactPage() {
  const page = await loadPageForRequest('contact');
  const contentSections = page?.sections.filter((s) => s.type !== 'CONTACT_INFO') || [];
  const contactInfoSection = page?.sections.find((s) => s.type === 'CONTACT_INFO');
  const hasContent = (page?.published ?? false) && contentSections.length > 0;
  const contactData: ContactInfoData = contactInfoSection?.data || {
    businessName: 'Iris Kooij Wellness',
    address: 'Crommelinbaan 29K\n2142 EX Cruquius\nNederland',
    phone: '+31650814260',
    email: 'iris@iriskooij.nl',
    hours: 'Ma – Vr 08:30 – 21:00\nZa 09:00 – 12:00',
    mapsLink: 'https://maps.google.com/?q=Crommelinbaan%2029K,%20Cruquius',
    extraNoteTitle: 'Sneller antwoord nodig?',
    extraNote: 'Stuur ons een WhatsApp met je vraag en gewenste datum. We proberen binnen een uur te reageren tijdens openingstijden.'
  };

  const structuredAddress = extractAddress(contactData.address);

  return (
    <section className="py-12">
      <div className="container grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {hasContent ? (
            <PageRenderer sections={contentSections as any} />
          ) : (
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
              <p className="subtle mt-4 max-w-2xl">
                Deze pagina heeft nog geen CMS-inhoud. Voeg introductie- of CTA-secties toe via het admin-portaal.
              </p>
            </div>
          )}
          <ContactForm />
        </div>
        <ContactInfoCard data={contactData} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: contactData.businessName || 'Iris Kooij Wellness',
              address: {
                '@type': 'PostalAddress',
                streetAddress: structuredAddress.streetAddress,
                addressLocality: structuredAddress.addressLocality,
                postalCode: structuredAddress.postalCode,
                addressCountry: 'NL'
              },
              email: contactData.email || 'iris@iriskooij.nl',
              telephone: contactData.phone || '+31650814260',
              url: 'https://localhost:3000'
            })
          }}
        />
      </div>
    </section>
  );
}
