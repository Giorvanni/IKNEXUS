import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Leaf, Phone, MapPin } from 'lucide-react';

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations();

  const navigation = {
    main: [
      { name: t('nav.home'), href: `/${locale}` },
      { name: t('nav.treatments'), href: `/${locale}/behandelingen` },
      { name: t('nav.professionals'), href: `/${locale}/professionals` },
      { name: t('nav.contact'), href: `/${locale}/contact` },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-ik-charcoal to-ik-charcoal/90 dark:from-gray-900 dark:to-gray-800 text-white transition-colors duration-300 border-t border-ik-gold/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-ik-gold/20 to-ik-rose/20 backdrop-blur-sm flex items-center justify-center border border-ik-gold/30">
                <Leaf className="h-7 w-7 text-ik-gold" />
              </div>
              <div>
                <div className="text-2xl font-light tracking-widest uppercase">IK</div>
                <div className="text-sm text-ik-gold font-light tracking-wider">Iris Kooij</div>
              </div>
            </div>
            <p className="text-sm text-white/80">{t('footer.tagline')}</p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Menu</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-ik-light-green mt-0.5" />
                <span className="text-sm text-white/80">
                  Crommelinbaan 29K<br />2142 EX Cruquius
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-ik-light-green" />
                <a href="tel:0650814260" className="text-sm text-white/80 hover:text-white transition-colors">
                  06 508 142 60
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-white/60">
            © {new Date().getFullYear()} Iris Kooij. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
