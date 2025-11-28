import '../styles/global.css';
import NavigationServer from './components/NavigationServer';
import { Footer } from './components/Footer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { orgMetadata, jsonLdForOrg } from '../lib/seo';
import type { Metadata } from 'next';
import React from 'react';
import { headers } from 'next/headers';
import { getBrandById } from '../lib/brand';
import { normalizeBrandId } from '../lib/brandHeaders';
import { BrandProvider } from '../lib/brandContext';
import { Inter, Playfair_Display } from 'next/font/google';

const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const serif = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-serif' });

export const metadata: Metadata = orgMetadata();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = headers();
  const brandId = normalizeBrandId(h.get('x-brand-id'));
  const cspNonce = h.get('x-csp-nonce') || undefined;
  const brand = brandId ? await getBrandById(brandId) : null;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  return (
    <html lang="nl" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-800 antialiased dark:bg-slate-900 dark:text-slate-100 font-sans">
        <BrandProvider brand={brand}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-brand-600 text-white px-4 py-2 rounded-md">Skip to content</a>
          <NavigationServer />
          <main id="main" className="flex min-h-[calc(100vh-4rem)] flex-col">
            {children}
          </main>
          <Footer role={role} />
          <script
            type="application/ld+json"
            nonce={cspNonce}
            suppressHydrationWarning
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdForOrg()) }}
          />
        </BrandProvider>
      </body>
    </html>
  );
}
