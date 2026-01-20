import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sparkles, Clock, Star } from 'lucide-react';

export default function FacialPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('treatments.facial');

  const treatments = [
    {
      title: t('treatment1'),
      duration: '50',
      description: locale === 'nl' 
        ? 'Oppervlakkige reiniging, diepte reiniging, gezichtsmassage, masker en crème.'
        : 'Surface cleansing, deep cleansing, facial massage, mask and cream.'
    },
    {
      title: t('treatment2'),
      duration: '80',
      description: locale === 'nl'
        ? 'Oppervlakkige reiniging, diepte reiniging, gezicht, arm en voet massage, masker, crème'
        : 'Surface cleansing, deep cleansing, face, arm and foot massage, mask, cream'
    },
    {
      title: t('treatment3'),
      duration: '120',
      description: locale === 'nl'
        ? 'Tijdens deze zeer Luxe gelaats-en lichaamsbehandeling wordt u in de watten gelegd met Rohini producten van Pharmos Natur. Je huid wordt intensief verzorgt, verstevigd en vernieuwd.'
        : 'During this very luxurious facial and body treatment, you will be pampered with Rohini products from Pharmos Natur. Your skin is intensively cared for, firmed and renewed.',
      luxury: true
    }
  ];

  const features = [
    locale === 'nl' ? 'Lang werkend' : 'Long-lasting effect',
    locale === 'nl' ? 'Met Aloë Vera gel in plaats van water' : 'With Aloe Vera gel instead of water',
    locale === 'nl' ? 'Zonder Parabenen, Alcohol en citroenzuur' : 'Without Parabens, Alcohol and citric acid',
    locale === 'nl' ? 'Vrij van conserveermiddelen' : 'Free from preservatives'
  ];

  return (
    <>
      <Header locale={locale} />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-ik-light-green to-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&h=1080&fit=crop&q=80"
              alt="Botanical Facial Treatment"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Sparkles className="h-20 w-20 mx-auto text-ik-green" />
            <h1 className="text-4xl md:text-5xl font-bold text-ik-gray">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-ik-dark-green font-semibold">
              {t('intro')}
            </p>
            <Link href={`/${locale}/contact`}>
              <Button size="lg">
                {locale === 'nl' ? 'Maak nu een afspraak!' : 'Book an appointment now!'}
              </Button>
            </Link>
          </div>
        </section>

        {/* Description */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <Card>
              <CardContent className="p-8 space-y-6 text-lg text-ik-gray">
                <p>{t('description')}</p>
              </CardContent>
            </Card>

            {/* Pharmos Natur Features */}
            <div className="bg-gradient-to-r from-ik-green to-ik-dark-green text-white p-8 rounded-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
                {t('pharmos')}
              </h2>
              <ul className="space-y-3 max-w-2xl mx-auto">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Star className="h-5 w-5 fill-white text-white flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatments */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-ik-dark-green text-center">
                {locale === 'nl' ? 'De volgende behandelingen zijn mogelijk' : 'The following treatments are available'}
              </h2>
              
              {treatments.map((treatment, index) => (
                <Card key={index} hover className={treatment.luxury ? 'border-2 border-ik-green' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-ik-dark-green flex-1">
                        {treatment.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-ik-green flex-shrink-0 ml-4">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">{treatment.duration} min</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-ik-gray">{treatment.description}</p>
                    {treatment.luxury && (
                      <p className="mt-4 text-sm italic text-ik-green">
                        * {locale === 'nl' 
                          ? 'Indien gewenst kan er na behandeling gebruik worden gemaakt van onze luxe douche.'
                          : 'If desired, you can use our luxury shower after treatment.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <Card className="bg-ik-light-gray">
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-xl text-ik-gray">
                  {locale === 'nl'
                    ? 'Ook thuis genieten van de producten van Pharmos Natur? Neem een kijkje in onze shop!'
                    : 'Also enjoy Pharmos Natur products at home? Take a look at our shop!'}
                </p>
                <Link href={`/${locale}/contact`}>
                  <Button size="lg">
                    {locale === 'nl' ? 'Maak nu een afspraak!' : 'Book an appointment now!'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}
