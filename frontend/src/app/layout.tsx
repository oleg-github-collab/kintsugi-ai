import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: 'Kintsugi AI - Ultra-Powerful AI Platform',
  description: 'Chat with advanced AI models, create intelligent agents, translate books, and connect with your team.',
  keywords: 'AI, chat, GPT-4, Claude, translation, messenger, video calls',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} font-mono`}>
        {children}
      </body>
    </html>
  );
}
