import type { Metadata } from 'next';
import { Nunito, Geist_Mono } from 'next/font/google';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import Providers from '@/components/providers/Providers';
import { appConfig } from '@/config';
import './globals.css';

// English/Latin UI font. Nunito has no Thai glyphs, so Thai characters fall
// through to "Google Sans" (and its fallbacks) via the font stack in
// `src/app/theme/theme.ts` — the standard per-language font mixing technique.
const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={appConfig.defaultLocale}
      suppressHydrationWarning
      className={`${nunito.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        {/* Sets the color-scheme class on <html> before paint (no flash). */}
        <InitColorSchemeScript attribute="class" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
