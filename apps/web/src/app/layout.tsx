import type { Metadata } from 'next';
import { Chakra_Petch, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  variable: '--font-chakra-petch',
  weight: ['600', '700'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tracehop.tech'),
  title: 'TraceHop · Know before you ape',
  description: 'Autonomous Multi-Chain Wallet Intelligence & Forensic Graph Layer for Web3 Token Launches. Screen the creator, trace the funding graph, and detect insider clusters.',
  icons: { icon: '/assets/rabbit-minimal.webp' },
  openGraph: {
    title: 'TraceHop · Know before you ape',
    description: 'Autonomous multi-chain wallet intelligence and forensic graph platform for Robinhood Chain & EVM.',
    url: 'https://www.tracehop.tech',
    siteName: 'TraceHop',
    images: [
      {
        url: '/assets/tracehop-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'TraceHop Forensic Graph Layer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TraceHop · Autonomous Wallet Intelligence',
    description: 'Screen the creator. Trace the funding graph. Expose insider clusters before you ape.',
    site: '@tracehopauto',
    creator: '@tracehopauto',
    images: ['/assets/tracehop-banner.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${chakraPetch.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-[#06040d] text-white">
        {children}
      </body>
    </html>
  );
}
