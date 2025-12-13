import { Toaster } from '@/libs/components/ui/sonner';
import { TanstackProvider } from '@/libs/providers/tanstack-query';
import { ThemeProvider } from '@/libs/providers/theme-provider';
import { cn } from '@/libs/utils/string';
import { baseOpenGraph } from '@/shared/metadata';
import type { Metadata } from 'next';
import { Fleur_De_Leah, Inter } from 'next/font/google';
import NextjsTopLoader from 'nextjs-toploader';
import { Suspense } from 'react';

import './globals.css';

const cormorant = Inter({
  subsets: ['latin'],
  display: 'swap'
});

const fleurDeLeah = Fleur_De_Leah({
  subsets: ['latin'],
  variable: '--font-fleur-de-leah',
  weight: '400',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "It's Duong To",
  description:
    'Personal portfolio of a developer and creative mind. We know very little, but we enjoy the journey of discovery.',
  openGraph: {
    ...baseOpenGraph
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={cn('min-h-screen font-cormorant antialiased', cormorant.className, fleurDeLeah.variable)}>
        <NextjsTopLoader height={2} showSpinner={false} color="hsl(var(--primary))" />
        <Suspense fallback={<div className="opacity-0" aria-hidden />}>
          <TanstackProvider>
            <ThemeProvider>
              {children}
              <Toaster position="top-right" closeButton duration={2000} />
            </ThemeProvider>
          </TanstackProvider>
        </Suspense>
      </body>
    </html>
  );
}
