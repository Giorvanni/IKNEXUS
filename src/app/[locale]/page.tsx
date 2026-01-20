import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Sparkles, 
  Leaf, 
  Heart, 
  Users, 
  Award, 
  Recycle, 
  Shield, 
  Home as HomeIcon,
  ArrowDown,
  ArrowRight
} from 'lucide-react';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('home');

  const features = [
    { icon: Leaf, title: t('feature1') },
    { icon: Shield, title: t('feature2') },
    { icon: Award, title: t('feature3') },
    { icon: Sparkles, title: t('feature4') },
    { icon: Recycle, title: t('feature5') },
    { icon: Heart, title: t('feature6') },
    { icon: Users, title: t('feature7') },
    { icon: HomeIcon, title: t('feature8') },
  ];

  return (
    <>
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&h=1080&fit=crop&q=80"
              alt="Luxury Wellness Spa"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-ik-cream/95 via-white/90 to-ik-beige/95 dark:from-gray-800/95 dark:via-gray-900/90 dark:to-black/95 transition-colors duration-300" />
          </div>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-96 h-96 bg-ik-gold rounded-full filter blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-ik-rose rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <div className="space-y-10">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-ik-charcoal dark:text-white leading-tight animate-fadeInUp tracking-tight max-w-5xl mx-auto">
                {t('title')}
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl text-ik-gold font-light italic animate-fadeIn animation-delay-200 max-w-3xl mx-auto">
                {t('subtitle')}
              </p>
              <p className="text-lg md:text-xl lg:text-2xl text-ik-charcoal/80 dark:text-gray-200 font-light max-w-4xl mx-auto animate-fadeInUp animation-delay-400 leading-relaxed">
                {t('hero')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-12 animate-fadeInUp animation-delay-600">
                <Link href={`/${locale}/behandelingen/fascia`}>
                  <Button size="lg">
                    {t('cta')}
                  </Button>
                </Link>
                <Link href={`/${locale}/contact`}>
                  <Button variant="secondary" size="lg">
                    {t('booking')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator with animation */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
            <div className="flex flex-col items-center space-y-2 text-ik-gold dark:text-ik-gold/80">
              <span className="text-sm font-medium animate-pulse-slow">Scroll</span>
              <ArrowDown className="h-6 w-6 animate-bounce" />
            </div>
          </div>
        </section>

        {/* USP Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-r from-ik-gold via-ik-dark-gold to-ik-gold text-white shadow-2xl group cursor-default overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/0 to-emerald-500/0 group-hover:from-emerald-500/20 group-hover:via-emerald-400/20 group-hover:to-emerald-500/20 transition-all duration-700"></div>
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed max-w-4xl mx-auto transition-all duration-500 group-hover:scale-105">
              <span className="inline-block transition-colors duration-500 group-hover:text-emerald-100">{t('usp')}</span>
            </h2>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 bg-ik-light-gray dark:bg-gray-800 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <h2 className="text-3xl md:text-4xl font-light text-ik-gold dark:text-ik-gold text-center animate-slideInRight tracking-wide">
              {t('solution')}
            </h2>
            <p className="text-lg text-ik-gray dark:text-gray-300 text-center animate-fadeIn">
              {t('solutionDetails')}
            </p>
            <div className="pt-8 border-t-2 border-ik-gold/30 dark:border-ik-gold/50">
              <p className="text-lg italic text-ik-charcoal/80 dark:text-gray-300 text-center mb-8 font-light">
                {t('cta2')}
              </p>
              <div className="flex justify-center gap-4">
                <Link href={`/${locale}/behandelingen/fascia`}>
                  <Button size="lg">{t('cta')}</Button>
                </Link>
                <Link href={`/${locale}/contact`}>
                  <Button variant="secondary" size="lg">{t('booking')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Fascia */}
        <section className="py-20 bg-[#AFE1AF] dark:from-gray-800 dark:to-gray-900 text-white text-center shadow-2xl" style={{ background: 'linear-gradient(to bottom right, #AFE1AF, #9FD89F, #AFE1AF)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fadeInUp">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Award className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Iris Kooij</h2>
            <p className="text-xl md:text-2xl text-white/90">
              {locale === 'nl' 
                ? 'Maak nu een afspraak voor jouw Fascia behandeling!' 
                : 'Book your Fascia treatment now!'}
            </p>
            <Link href={`/${locale}/contact`}>
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-[#6FAF6F] transition-all duration-300">
                {t('booking')}
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 lg:py-32 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-ik-gold dark:text-ik-gold text-center mb-16 lg:mb-20 animate-fadeInUp tracking-tight">
              {t('featuresTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} hover className="animate-fadeInUp group overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`h-2 bg-gradient-to-r ${index % 4 === 0 ? 'from-amber-500 to-orange-600' : index % 4 === 1 ? 'from-emerald-500 to-teal-600' : index % 4 === 2 ? 'from-purple-500 to-pink-600' : 'from-blue-500 to-cyan-600'}`} />
                  <CardContent className="text-center space-y-6 py-8">
                    <div className={`mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${index % 4 === 0 ? 'from-amber-500 to-orange-600' : index % 4 === 1 ? 'from-emerald-500 to-teal-600' : index % 4 === 2 ? 'from-purple-500 to-pink-600' : 'from-blue-500 to-cyan-600'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-ik-charcoal dark:text-gray-200 tracking-wide">
                      {feature.title}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12 animate-fadeInUp" style={{ animationDelay: '800ms' }}>
              <Link href={`/${locale}/behandelingen`}>
                <Button size="lg" className="shadow-xl hover:shadow-2xl">
                  {t('viewTreatments')}
                  <ArrowRight className="ml-2 h-5 w-5 inline-block" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Instagram Gallery Section */}
        <section className="py-20 bg-gradient-to-br from-ik-cream via-white to-ik-beige dark:from-gray-800 dark:via-gray-900 dark:to-black transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-4 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-ik-gold dark:text-ik-gold tracking-tight">
                {locale === 'nl' ? 'Volg Ons Op Instagram' : 'Follow Us On Instagram'}
              </h2>
              <p className="text-xl text-ik-charcoal/80 dark:text-gray-300 font-light">
                @iriskooij_wellness
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div 
                  key={num} 
                  className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer animate-fadeInUp"
                  style={{ animationDelay: `${num * 100}ms` }}
                >
                  <Image
                    src={`/instagram/post${num}.svg`}
                    alt={`Instagram post ${num}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ik-gold/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="group">
                {locale === 'nl' ? 'Bekijk Meer' : 'View More'}
                <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-light text-ik-gold dark:text-ik-gold text-center mb-12 tracking-wide">
              {locale === 'nl' ? 'Wat Cliënten Zeggen' : 'What Clients Say'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sebastian',
                  text: locale === 'nl' 
                    ? 'Iris Kooij is een uitstekende fascia therapeut en een zeer goede en competente fascia trainer! Ik voelde me altijd zeer op mijn gemak tijdens de hele behandeling.'
                    : 'Iris Kooij is an outstanding fascia therapist and a very good and competent fascia trainer! I always felt very comfortable during the entire treatment.',
                  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80'
                },
                {
                  name: 'Carla',
                  text: locale === 'nl'
                    ? 'Ik kan Iris van harte aanbevelen en ben erg dankbaar voor haar uitstekende werk zowel als therapeut als fascia trainer.'
                    : 'I can warmly recommend Iris and am very grateful for her excellent work both as a therapist and as a fascia trainer.',
                  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80'
                },
                {
                  name: 'Maria',
                  text: locale === 'nl'
                    ? 'De Pharmos Natur behandeling was fantastisch! Mijn huid voelt vernieuwd en stralend aan. Een echte aanrader!'
                    : 'The Pharmos Natur treatment was fantastic! My skin feels renewed and radiant. Highly recommended!',
                  image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80'
                }
              ].map((testimonial, index) => (
                <Card 
                  key={index} 
                  hover 
                  className="animate-fadeInUp border-t-4 border-ik-gold"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardContent className="pt-8 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-ik-gold">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-ik-charcoal dark:text-white">{testimonial.name}</p>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Sparkles key={i} className="h-4 w-4 fill-ik-gold text-ik-gold" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-ik-charcoal/80 dark:text-gray-300 italic font-light leading-relaxed">
                      "{testimonial.text}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
