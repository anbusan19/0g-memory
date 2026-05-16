import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '0G-Memory — Persistent Memory for AI Agents',
  description:
    'The decentralized memory layer for autonomous AI agents, powered by 0G Storage. Verifiable, permanent, cross-session agent memory.',
  icons: { icon: '/icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* no-flash theme init — runs before paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&p))document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body className={`${instrumentSerif.variable} ${jetbrainsMono.variable} ${plusJakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
