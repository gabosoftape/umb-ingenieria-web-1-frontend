import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./theme.css";
import "./bespoke-styles.css";
import { ThemeProvider } from "@/providers/theme-provider";
import MountedProvider from "@/providers/mounted.provider";
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
const inter = Inter({ subsets: ["latin"] });
// language 
import { getLangDir } from 'rtl-detect';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import DirectionProvider from "@/providers/direction-provider";
import { AuthProvider } from "@/contexts/auth.context";
import { brandConfig } from "@/lib/brand";

export const metadata: Metadata = {
  title: brandConfig.metaTitle,
  description: brandConfig.metaDescription,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Usar await con params para obtener el locale
  const locale = await params.locale;
  const messages = await getMessages();
  const direction = getLangDir(locale);
  
  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={`${inter.className} ${brandConfig.appClass}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <ThemeProvider 
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <MountedProvider>
                <DirectionProvider direction={direction}>
                  {children}
                </DirectionProvider>
              </MountedProvider>
              <Toaster />
              <SonnerToaster />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
