import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Heart, Sparkles } from 'lucide-react';

export default function FasciaPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('treatments.fascia');

  return (
    <>
      <Header locale={locale} />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-ik-light-green to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Award className="h-20 w-20 mx-auto text-ik-green" />
            <h1 className="text-4xl md:text-5xl font-bold text-ik-gray">
              {t('title')}
            </h1>
            <Link href={`/${locale}/contact`}>
              <Button size="lg">
                {locale === 'nl' ? 'Maak nu een afspraak!' : 'Book an appointment now!'}
              </Button>
            </Link>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <Card>
              <CardContent className="p-8 space-y-6 text-lg text-ik-gray leading-relaxed">
                <p className="font-semibold text-ik-dark-green">{t('description')}</p>
                <p>{t('details')}</p>
              </CardContent>
            </Card>

            {/* USP */}
            <div className="bg-gradient-to-r from-ik-green to-ik-dark-green text-white p-8 rounded-2xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold leading-relaxed">
                {t('specialist')}
              </h2>
            </div>

            <Card>
              <CardContent className="p-8 space-y-4 text-lg text-ik-gray">
                <p>{t('training')}</p>
                <p>
                  {locale === 'nl' 
                    ? 'Behandeling vindt plaats na een body analyse en intake gesprek. Hierbij wordt gekeken naar de verschillende houdingspatronen waarna er in overleg met u een behandelplan wordt gemaakt.'
                    : 'Treatment takes place after a body analysis and intake interview. This examines the various posture patterns, after which a treatment plan is drawn up in consultation with you.'}
                </p>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-ik-dark-green text-center">
                {locale === 'nl' ? 'Wat cliënten zeggen' : 'What clients say'}
              </h2>

              {/* Before/After Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card hover>
                  <div className="relative h-80">
                    <Image
                      src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=800&fit=crop&q=80"
                      alt="Before Treatment"
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-4 text-center bg-ik-cream">
                    <p className="font-semibold text-ik-charcoal">{locale === 'nl' ? 'Voor behandeling' : 'Before treatment'}</p>
                  </CardContent>
                </Card>
                <Card hover>
                  <div className="relative h-80">
                    <Image
                      src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=800&fit=crop&q=80"
                      alt="After Treatment"
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-4 text-center bg-gradient-to-r from-ik-gold to-ik-rose">
                    <p className="font-semibold text-white">{locale === 'nl' ? 'Na behandeling' : 'After treatment'}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card hover className="border-l-4 border-ik-green">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} className="h-5 w-5 fill-ik-green text-ik-green" />
                    ))}
                  </div>
                  <p className="italic text-ik-gray">
                    "Iris Kooij is an outstanding fascia therapist and a very good and competent fascia trainer! I always felt very comfortable during the entire treatment. I was impressed by her warm personality and professional approach. She has an incredible talent for creating a trusting atmosphere in which I felt safe and in good hands."
                  </p>
                  <p className="font-semibold text-ik-dark-green">— Sebastian</p>
                </CardContent>
              </Card>

              <Card hover className="border-l-4 border-ik-green">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Heart key={i} className="h-5 w-5 fill-ik-green text-ik-green" />
                    ))}
                  </div>
                  <p className="italic text-ik-gray">
                    "I can warmly recommend Iris and am very grateful for her excellent work both as a therapist and as a fascia trainer. If you are looking for someone who is not only technically competent, but also has a warm and loving personality, then you are in the best hands with Iris!"
                  </p>
                  <p className="font-semibold text-ik-dark-green">— Carla</p>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <Link href={`/${locale}/contact`}>
                <Button size="lg">
                  {locale === 'nl' ? 'Maak nu een afspraak!' : 'Book an appointment now!'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}
