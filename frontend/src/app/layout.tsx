import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { MatrixBackground } from '@/components/layout/MatrixBackground';
import { Navigation } from '@/components/layout/Navigation';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: 'KINTSUGI AI // Adaptive Synthetic Language Model',
  description: 'Ultra-powerful AI platform with GPT-4, Claude, real-time translation, messenger, and advanced chat capabilities.',
  keywords: 'AI, ASLM, synthetic data, GPT-4, Claude, chat, translation, messenger, kintsugi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${spaceMono.variable} font-mono crt-effect`}>
        <MatrixBackground />
        <CustomCursor />
        <Navigation />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
