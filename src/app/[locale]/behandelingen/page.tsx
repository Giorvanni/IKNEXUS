import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Sparkles, Clock, ArrowRight } from 'lucide-react';

export default function BehandelingenPage({ params: { locale } }: { params: { locale: string } }) {
  const treatments = [
    {
      title: 'Gantke® Fascia Behandeling',
      titleEn: 'Gantke® Fascia Treatment',
      description: locale === 'nl' 
        ? 'Award Winning fascia therapie gericht op het dieper gelegen bindweefsel. Perfect voor langdurige klachten en herstel van lichaamsstructuur.'
        : 'Award Winning fascia therapy focused on deeper connective tissue. Perfect for chronic complaints and body structure recovery.',
      duration: '90 min',
      price: '€145',
      href: `/${locale}/behandelingen/fascia`,
      icon: Award,
      badge: 'Award Winner 2017',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Pharmos Natur Schoonheidsbehandeling',
      titleEn: 'Pharmos Natur Beauty Treatment',
      description: locale === 'nl'
        ? '100% natuurlijke gezichtsbehandeling met vers biologisch Aloë Vera blad. Diepte reiniging en intensieve verzorging.'
        : '100% natural facial treatment with fresh organic Aloe Vera leaf. Deep cleansing and intensive care.',
      duration: '50-80 min',
      price: 'vanaf €85',
      href: `/${locale}/behandelingen/gezichtsbehandelingen`,
      icon: Sparkles,
      badge: '100% Natuurlijk',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Luxe Rohini Behandeling',
      titleEn: 'Luxury Rohini Treatment',
      description: locale === 'nl'
        ? 'Zeer luxe gelaats- en lichaamsbehandeling. Je huid wordt intensief verzorgd, verstevigd en vernieuwd met Pharmos Natur producten.'
        : 'Very luxurious facial and body treatment. Your skin is intensively cared for, firmed and renewed with Pharmos Natur products.',
      duration: '120 min',
      price: '€165',
      href: `/${locale}/behandelingen/gezichtsbehandelingen`,
      icon: Sparkles,
      badge: 'Luxe',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <>
      <Header locale={locale} />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-24 bg-gradient-to-br from-ik-cream via-white to-ik-beige dark:from-gray-800 dark:via-gray-900 dark:to-black overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-96 h-96 bg-ik-green rounded-full filter blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-ik-dark-green rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-light text-ik-charcoal dark:text-white animate-fadeInUp tracking-tight">
              {locale === 'nl' ? 'Onze Behandelingen' : 'Our Treatments'}
            </h1>
            <p className="text-xl md:text-2xl text-ik-gold dark:text-ik-gold max-w-3xl mx-auto animate-fadeIn">
              {locale === 'nl' 
                ? 'Ontdek onze hoogwaardige natuurlijke behandelingen voor gezicht en lichaam'
                : 'Discover our high-quality natural treatments for face and body'}
            </p>
          </div>
        </section>

        {/* Treatments Grid */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {treatments.map((treatment, index) => (
                <Card 
                  key={index} 
                  hover 
                  className="group overflow-hidden animate-fadeInUp" 
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={index === 0 ? 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop&q=80' : index === 1 ? 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop&q=80' : 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop&q=80'}
                      alt={locale === 'nl' ? treatment.title : treatment.titleEn}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${treatment.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                  </div>
                  <div className={`h-2 bg-gradient-to-r ${treatment.gradient}`} />
                  
                  <CardContent className="p-8 space-y-6">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${treatment.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <treatment.icon className="h-8 w-8 text-white" />
                      </div>
                      <span className="px-3 py-1 text-xs font-semibold bg-ik-light-green dark:bg-gray-700 text-ik-dark-green dark:text-ik-green rounded-full">
                        {treatment.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-2xl font-bold text-ik-gray dark:text-white mb-2">
                        {locale === 'nl' ? treatment.title : treatment.titleEn}
                      </h3>
                      <p className="text-ik-gray dark:text-gray-400">
                        {treatment.description}
                      </p>
                    </div>

                    {/* Duration & Price */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-ik-gray dark:text-gray-400">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">{treatment.duration}</span>
                      </div>
                      <span className="text-2xl font-bold text-ik-green">{treatment.price}</span>
                    </div>

                    {/* CTA */}
                    <Link href={treatment.href}>
                      <Button className="w-full group-hover:shadow-xl" size="lg">
                        {locale === 'nl' ? 'Meer informatie' : 'More information'}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-ik-gold to-ik-dark-gold dark:from-gray-800 dark:to-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              {locale === 'nl' ? 'Klaar om te beginnen?' : 'Ready to get started?'}
            </h2>
            <p className="text-xl text-white/90">
              {locale === 'nl'
                ? 'Boek vandaag nog een afspraak en ervaar het verschil van natuurlijke, hoogwaardige behandelingen.'
                : 'Book an appointment today and experience the difference of natural, high-quality treatments.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/contact`}>
                <Button variant="outline" size="lg" className="hover:bg-white hover:text-ik-green">
                  {locale === 'nl' ? 'Maak een afspraak' : 'Make an appointment'}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-ik-light-gray dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-ik-dark-green dark:text-ik-green mb-12">
              {locale === 'nl' ? 'Waarom Iris Kooij?' : 'Why Iris Kooij?'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card hover>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80"
                      alt="Award Winning"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ik-gold/80 to-transparent flex items-center justify-center">
                      <div className="text-6xl">🏆</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-ik-gray dark:text-white">
                    {locale === 'nl' ? 'Award Winning' : 'Award Winning'}
                  </h3>
                  <p className="text-ik-gray dark:text-gray-400">
                    {locale === 'nl' 
                      ? 'Gantke® Fascia Therapie won de Wellness Innovatieprijs 2017 in Duitsland'
                      : 'Gantke® Fascia Therapy won the Wellness Innovation Award 2017 in Germany'}
                  </p>
                </CardContent>
              </Card>

              <Card hover>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop&q=80"
                      alt="100% Natural"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ik-sage/80 to-transparent flex items-center justify-center">
                      <div className="text-6xl">🌿</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-ik-gray dark:text-white">
                    {locale === 'nl' ? '100% Natuurlijk' : '100% Natural'}
                  </h3>
                  <p className="text-ik-gray dark:text-gray-400">
                    {locale === 'nl'
                      ? 'Biologisch gecertificeerde producten zonder parabenen of chemische toevoegingen'
                      : 'Organic certified products without parabens or chemical additives'}
                  </p>
                </CardContent>
              </Card>

              <Card hover>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=600&fit=crop&q=80"
                      alt="Unique"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ik-rose/80 to-transparent flex items-center justify-center">
                      <div className="text-6xl">💎</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-ik-gray dark:text-white">
                    {locale === 'nl' ? 'Uniek in de Regio' : 'Unique in the Region'}
                  </h3>
                  <p className="text-ik-gray dark:text-gray-400">
                    {locale === 'nl'
                      ? 'Enige gecertificeerde Gantke® Fascia therapeut in Haarlemmermeer'
                      : 'Only certified Gantke® Fascia therapist in Haarlemmermeer'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}
