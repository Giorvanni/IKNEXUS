import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Award, Users, BookOpen, Calendar, ArrowRight } from 'lucide-react';

export default function ProfessionalsPage({ params: { locale } }: { params: { locale: string } }) {

  const courses = [
    {
      title: locale === 'nl' ? 'Gantke® Fascia Training' : 'Gantke® Fascia Training',
      description: locale === 'nl'
        ? 'Leer de Award Winning Gantke® Fascia therapie techniek. Een intensieve opleiding voor professionals die het verschil willen maken.'
        : 'Learn the Award Winning Gantke® Fascia therapy technique. An intensive training for professionals who want to make a difference.',
      duration: locale === 'nl' ? '5 dagen' : '5 days',
      icon: Award,
      color: 'from-ik-gold to-ik-dark-gold'
    },
    {
      title: locale === 'nl' ? 'Pharmos Natur Producten Training' : 'Pharmos Natur Products Training',
      description: locale === 'nl'
        ? 'Ontdek de kracht van 100% natuurlijke biologische huidverzorging. Leer werken met het verse Aloë Vera blad.'
        : 'Discover the power of 100% natural organic skincare. Learn to work with fresh Aloe Vera leaf.',
      duration: locale === 'nl' ? '2 dagen' : '2 days',
      icon: BookOpen,
      color: 'from-ik-sage to-emerald-600'
    }
  ];

  return (
    <>
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-24 bg-gradient-to-br from-ik-cream via-white to-ik-beige dark:from-gray-800 dark:via-gray-900 dark:to-black overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-96 h-96 bg-ik-gold rounded-full filter blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-ik-rose rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Users className="h-20 w-20 mx-auto text-ik-gold animate-float" />
            <h1 className="text-5xl md:text-6xl font-light text-ik-charcoal dark:text-white animate-fadeInUp tracking-tight">
              {locale === 'nl' ? 'Voor Professionals' : 'For Professionals'}
            </h1>
            <p className="text-xl md:text-2xl text-ik-gold dark:text-ik-gold max-w-3xl mx-auto animate-fadeIn font-light">
              {locale === 'nl' 
                ? 'Verdiep je kennis en word expert in natuurlijke schoonheidsverzorging'
                : 'Deepen your knowledge and become an expert in natural beauty care'}
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <Card>
              <CardContent className="p-8 space-y-6">
                <h2 className="text-3xl font-light text-ik-gold dark:text-ik-gold tracking-wide">
                  {locale === 'nl' ? 'Professionele Opleidingen' : 'Professional Training'}
                </h2>
                <p className="text-lg text-ik-charcoal dark:text-gray-300 leading-relaxed font-light">
                  {locale === 'nl'
                    ? 'Als ervaren therapeut en trainer bied ik hoogwaardige opleidingen aan voor professionals in de wellness en beauty branche. Mijn trainingen combineren jarenlange praktijkervaring met de nieuwste inzichten in natuurlijke behandelingsmethoden.'
                    : 'As an experienced therapist and trainer, I offer high-quality training for professionals in the wellness and beauty industry. My training combines years of practical experience with the latest insights in natural treatment methods.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Courses */}
        <section className="py-20 bg-ik-cream dark:bg-gray-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-light text-ik-gold dark:text-ik-gold text-center mb-12 tracking-wide">
              {locale === 'nl' ? 'Beschikbare Opleidingen' : 'Available Training Courses'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {courses.map((course, index) => (
                <Card 
                  key={index} 
                  hover 
                  className="overflow-hidden animate-fadeInUp group" 
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`h-2 bg-gradient-to-r ${course.color}`} />
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg`}>
                        <course.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-light text-ik-charcoal dark:text-white tracking-wide">
                          {course.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-ik-gold mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-ik-charcoal/80 dark:text-gray-300 leading-relaxed font-light">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-light text-ik-gold dark:text-ik-gold text-center mb-12 tracking-wide">
              {locale === 'nl' ? 'Waarom Bij IK Trainen?' : 'Why Train With IK?'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: locale === 'nl' ? 'Erkende Certificaten' : 'Recognized Certificates',
                  description: locale === 'nl'
                    ? 'Ontvang internationaal erkende certificaten na afronding'
                    : 'Receive internationally recognized certificates upon completion',
                  icon: '🎓'
                },
                {
                  title: locale === 'nl' ? 'Kleine Groepen' : 'Small Groups',
                  description: locale === 'nl'
                    ? 'Persoonlijke begeleiding in groepen van maximaal 8 personen'
                    : 'Personal guidance in groups of maximum 8 people',
                  icon: '👥'
                },
                {
                  title: locale === 'nl' ? 'Praktijkgericht' : 'Practice-Oriented',
                  description: locale === 'nl'
                    ? 'Veel praktische oefeningen en hands-on ervaring'
                    : 'Lots of practical exercises and hands-on experience',
                  icon: '✋'
                }
              ].map((benefit, index) => (
                <Card 
                  key={index} 
                  hover 
                  className="text-center animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-8 space-y-4">
                    <div className="text-5xl mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-light text-ik-charcoal dark:text-white tracking-wide">
                      {benefit.title}
                    </h3>
                    <p className="text-ik-charcoal/80 dark:text-gray-300 font-light">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-ik-gold to-ik-dark-gold text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide">
              {locale === 'nl' ? 'Interesse in een Opleiding?' : 'Interested in Training?'}
            </h2>
            <p className="text-xl font-light">
              {locale === 'nl'
                ? 'Neem contact op voor meer informatie over data, prijzen en beschikbaarheid.'
                : 'Contact us for more information about dates, prices and availability.'}
            </p>
            <Link href={`/${locale}/contact`}>
              <Button variant="outline" size="lg" className="bg-white text-ik-gold hover:bg-ik-cream border-white group">
                {locale === 'nl' ? 'Neem Contact Op' : 'Get In Touch'}
                <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
