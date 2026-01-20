import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iris Kooij - Natuurlijke Beauty & Fascia Behandelingen',
  description: 'Award Winning Gantke® Fascia therapie en natuurlijke schoonheidsbehandelingen',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
