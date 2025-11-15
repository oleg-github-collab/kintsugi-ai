import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-digital-black text-digital-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-3 border-kintsugi-gold">
        {/* Animated Marquee Banner */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-kintsugi-gold overflow-hidden transform -rotate-2 origin-top-left">
          <div className="animate-marquee whitespace-nowrap py-2 font-mono font-bold text-digital-black text-lg">
            ⚡ KINTSUGI AI · ULTRA-POWERFUL AI PLATFORM · UNLIMITED CREATIVITY · NEO-BRUTALISM DESIGN ⚡
            KINTSUGI AI · ULTRA-POWERFUL AI PLATFORM · UNLIMITED CREATIVITY · NEO-BRUTALISM DESIGN ⚡
          </div>
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-mono font-bold text-kintsugi-gold mb-6">
              KINTSUGI AI
            </h1>
            <p className="text-2xl md:text-3xl font-mono text-cyber-pink mb-8">
              The Art of AI Excellence
            </p>
            <p className="text-lg font-mono text-digital-white/80 mb-12 max-w-2xl mx-auto">
              Chat with advanced AI models, create intelligent agents, translate books,
              and connect with your team - all in one powerful platform.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg">
                  🚀 Get Started Free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="secondary">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-b-3 border-cyber-pink">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-mono font-bold text-cyber-pink mb-12 text-center">
            FEATURES
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="default">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-mono font-bold text-kintsugi-gold mb-2">
                AI Chat
              </h3>
              <p className="text-sm font-mono text-digital-white/60">
                Chat with GPT-4o, o1, Claude 3, and more. Code, analyze, create.
              </p>
            </Card>

            <Card variant="pink">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-mono font-bold text-cyber-pink mb-2">
                Messenger
              </h3>
              <p className="text-sm font-mono text-digital-white/60">
                Full-featured messenger with stories, reactions, and AI agents.
              </p>
            </Card>

            <Card variant="cyan">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-mono font-bold text-cyber-cyan mb-2">
                Translation
              </h3>
              <p className="text-sm font-mono text-digital-white/60">
                Translate entire books with DeepL and o.translator APIs.
              </p>
            </Card>

            <Card variant="default">
              <div className="text-4xl mb-4">📹</div>
              <h3 className="text-xl font-mono font-bold text-kintsugi-gold mb-2">
                Video Calls
              </h3>
              <p className="text-sm font-mono text-digital-white/60">
                P2P video/audio calls with 100ms group conferences.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-mono font-bold text-kintsugi-gold mb-12 text-center">
            PRICING
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card variant="default">
              <h3 className="text-2xl font-mono font-bold text-kintsugi-gold mb-2">
                Basic
              </h3>
              <p className="text-4xl font-mono font-bold text-digital-white mb-4">
                FREE
              </p>
              <ul className="space-y-2 text-sm font-mono text-digital-white/80 mb-6">
                <li>✓ 100k tokens/6h</li>
                <li>✓ Simple text chat</li>
                <li>✓ Basic tasks</li>
              </ul>
              <Link href="/auth/register">
                <Button variant="ghost" className="w-full">
                  Get Started
                </Button>
              </Link>
            </Card>

            <Card variant="pink">
              <div className="absolute -top-3 -right-3 bg-neon-orange border-3 border-digital-black px-3 py-1 font-mono font-bold text-sm">
                POPULAR
              </div>
              <h3 className="text-2xl font-mono font-bold text-cyber-pink mb-2">
                Premium Pro
              </h3>
              <p className="text-4xl font-mono font-bold text-digital-white mb-4">
                $29.99
              </p>
              <ul className="space-y-2 text-sm font-mono text-digital-white/80 mb-6">
                <li>✓ 2M tokens/6h</li>
                <li>✓ All AI models</li>
                <li>✓ 10 AI agents</li>
                <li>✓ 500min calls</li>
              </ul>
              <Link href="/auth/register">
                <Button variant="secondary" className="w-full">
                  Start Free Trial
                </Button>
              </Link>
            </Card>

            <Card variant="default">
              <h3 className="text-2xl font-mono font-bold text-kintsugi-gold mb-2">
                Unlimited
              </h3>
              <p className="text-4xl font-mono font-bold text-digital-white mb-4">
                $299.99
              </p>
              <ul className="space-y-2 text-sm font-mono text-digital-white/80 mb-6">
                <li>✓ Unlimited tokens</li>
                <li>✓ Early access</li>
                <li>✓ Full AI power</li>
                <li>✓ Website creation</li>
              </ul>
              <Link href="/auth/register">
                <Button className="w-full">
                  Go Unlimited
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-kintsugi-gold py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-digital-white/60 text-sm">
            © 2024 Kintsugi AI. Built with ❤️ and Neo-Brutalism.
          </p>
        </div>
      </footer>
    </div>
  );
}
