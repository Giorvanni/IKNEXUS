'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('treatments'), href: `/${locale}/behandelingen` },
    { name: t('professionals'), href: `/${locale}/professionals` },
    { name: t('contact'), href: `/${locale}/contact` },
  ];

  const otherLocale = locale === 'nl' ? 'en' : 'nl';
  const currentPath = pathname.replace(`/${locale}`, '');

  return (
    <header className="fixed top-0 w-full bg-ik-cream/98 dark:bg-gray-900/98 backdrop-blur-lg z-50 shadow-sm transition-all duration-300">
      <div className="border-b border-ik-gold/10 dark:border-ik-gold/20"></div>
      <nav className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-20 lg:h-24 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-3 group">
            <span className="text-2xl font-light tracking-wide text-ik-charcoal dark:text-white transition-colors\">IRIS KOOIJ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-colors relative group ${
                      isActive ? 'text-ik-dark-green dark:text-ik-green' : 'text-ik-gray dark:text-gray-300 hover:text-ik-green'
                    }`}
                  >
                    {item.name}
                    <span className={`absolute -bottom-2 left-0 h-0.5 bg-ik-green transition-all ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                </motion.div>
              );
            })}
            
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-ik-beige/50 dark:bg-gray-700 text-ik-charcoal dark:text-ik-gold hover:bg-ik-gold hover:text-white dark:hover:bg-ik-gold transition-all duration-300 shadow-sm"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.button>
            
            {/* Language Toggle */}
            <Link
              href={`/${otherLocale}${currentPath}`}
              className="px-5 py-2 text-sm font-light tracking-widest text-ik-charcoal bg-gradient-to-r from-ik-gold/20 to-ik-beige border border-ik-gold/30 rounded-full hover:bg-ik-gold hover:text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ik-charcoal dark:text-ik-gold hover:bg-ik-beige/50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
            <button
              type="button"
              className="rounded-lg p-2 text-ik-charcoal dark:text-gray-300 hover:bg-ik-beige/50 dark:hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="space-y-1 pb-4 pt-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-ik-light-green dark:bg-gray-700 text-ik-dark-green dark:text-ik-green'
                          : 'text-ik-gray dark:text-gray-300 hover:bg-ik-light-gray dark:hover:bg-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <Link
                  href={`/${otherLocale}${currentPath}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium bg-gradient-to-r from-ik-green to-ik-dark-green text-white hover:shadow-lg transition-all"
                >
                  {otherLocale.toUpperCase()}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
