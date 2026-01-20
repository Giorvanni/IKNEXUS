import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {Inter} from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Iris Kooij - Natuurlijke Beauty & Fascia Behandelingen',
  description: 'Award Winning Gantke® Fascia behandeling en natuurlijke gezichtsbehandelingen in Haarlemmermeer',
};

export default async function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
