import type { Metadata } from 'next';
import './globals.css';

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
      <body className="font-mono crt-effect">
        {children}
      </body>
    </html>
  );
}
