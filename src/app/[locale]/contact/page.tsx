'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Check, AlertCircle } from 'lucide-react';

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('contact');
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (response.ok) {
        setFormStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      setFormStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header locale={locale} />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-ik-light-green to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Mail className="h-20 w-20 mx-auto text-ik-green" />
            <h1 className="text-4xl md:text-5xl font-bold text-ik-gray">
              {t('title')}
            </h1>
            <p className="text-xl text-ik-dark-green">
              {t('subtitle')}
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-ik-green flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-ik-gray mb-2">Adres</h3>
                        <p className="text-sm text-ik-gray/80">
                          Crommelinbaan 29K<br />
                          2142 EX Cruquius
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-ik-green flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-ik-gray mb-2">Telefoon</h3>
                        <a 
                          href="tel:0650814260" 
                          className="text-sm text-ik-green hover:text-ik-dark-green transition-colors"
                        >
                          06 508 142 60
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-gradient-to-br from-ik-green to-ik-dark-green text-white p-6 rounded-2xl">
                  <h3 className="font-semibold mb-2">
                    {locale === 'nl' ? 'Openingstijden' : 'Opening hours'}
                  </h3>
                  <p className="text-sm text-white/90">
                    {locale === 'nl' 
                      ? 'Op afspraak. Neem contact op voor beschikbaarheid.'
                      : 'By appointment. Contact us for availability.'}
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-8">
                    <form 
                      onSubmit={handleSubmit}
                      name="contact"
                      method="POST"
                      data-netlify="true"
                      netlify-honeypot="bot-field"
                      className="space-y-6"
                    >
                      <input type="hidden" name="form-name" value="contact" />
                      <p className="hidden">
                        <label>
                          Don't fill this out if you're human: <input name="bot-field" />
                        </label>
                      </p>

                      {/* Success/Error Messages */}
                      {formStatus === 'success' && (
                        <div className="flex items-center space-x-3 p-4 bg-ik-light-green rounded-lg border-2 border-ik-green">
                          <Check className="h-5 w-5 text-ik-dark-green flex-shrink-0" />
                          <p className="text-sm text-ik-dark-green">
                            {locale === 'nl' 
                              ? 'Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.'
                              : 'Thank you for your message! We will contact you as soon as possible.'}
                          </p>
                        </div>
                      )}

                      {formStatus === 'error' && (
                        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          <p className="text-sm text-red-600">
                            {locale === 'nl'
                              ? 'Er is iets misgegaan. Probeer het opnieuw.'
                              : 'Something went wrong. Please try again.'}
                          </p>
                        </div>
                      )}

                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-ik-gray mb-2">
                          {t('name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-ik-green focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-ik-gray mb-2">
                          {t('email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-ik-green focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-ik-gray mb-2">
                          {t('phone')}
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-ik-green focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="treatment" className="block text-sm font-medium text-ik-gray mb-2">
                          {t('treatment')}
                        </label>
                        <select
                          id="treatment"
                          name="treatment"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-ik-green focus:outline-none transition-colors"
                        >
                          <option value="">
                            {locale === 'nl' ? 'Selecteer een behandeling' : 'Select a treatment'}
                          </option>
                          <option value="fascia">Gantke® Fascia</option>
                          <option value="facial-50">
                            {locale === 'nl' ? 'Gezichtsbehandeling 50 min' : 'Facial Treatment 50 min'}
                          </option>
                          <option value="facial-80">
                            {locale === 'nl' ? 'Gezichtsbehandeling 80 min' : 'Facial Treatment 80 min'}
                          </option>
                          <option value="rohini-120">
                            {locale === 'nl' ? 'Luxe Rohini 120 min' : 'Luxury Rohini 120 min'}
                          </option>
                          <option value="training">
                            {locale === 'nl' ? 'Opleiding' : 'Training'}
                          </option>
                          <option value="other">
                            {locale === 'nl' ? 'Anders' : 'Other'}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-ik-gray mb-2">
                          {t('message')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-ik-green focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="captcha" className="block text-sm font-medium text-ik-gray mb-2">
                          {t('captcha')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="captcha"
                          name="captcha"
                          required
                          placeholder="5"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-ik-green focus:outline-none transition-colors"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting 
                          ? (locale === 'nl' ? 'Bezig met versturen...' : 'Sending...')
                          : t('send')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}
