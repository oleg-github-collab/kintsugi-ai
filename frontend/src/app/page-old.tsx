import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen text-digital-white">
      {/* Top Marquee Banner */}
      <div className="w-full overflow-hidden border-b-3 border-kintsugi-gold py-4 bg-gradient-to-r from-cyber-pink via-cyber-cyan to-kintsugi-gold">
        <div className="animate-marquee whitespace-nowrap will-change-transform">
          <span className="text-xl uppercase font-bold text-digital-black px-6">🚀 BORN IN SIMULATION</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">⚡ EVOLVING ON ANOMALIES</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">🔬 NO HUMAN DATA</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">🧬 PURE ALGORITHMIC EVOLUTION</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">🚀 BORN IN SIMULATION</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">⚡ EVOLVING ON ANOMALIES</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">🔬 NO HUMAN DATA</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">🧬 PURE ALGORITHMIC EVOLUTION</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto min-h-screen w-full flex flex-col justify-center items-start px-6 md:px-12 py-20 relative bg-gradient-to-br from-kintsugi-gold/5 via-digital-black to-digital-black">
        <div className="max-w-4xl relative z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 border-3 border-kintsugi-gold bg-kintsugi-gold/10 text-kintsugi-gold font-bold uppercase text-sm animate-pulse-slow">
              ◆ REVOLUTIONARY AI TECH ◆
            </span>
          </div>

          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-extrabold uppercase leading-none">
            <span className="text-glitch block text-kintsugi-gold text-neon" data-text="KINTSUGI">KINTSUGI</span>
            <span className="block text-digital-white" data-text="ASLM">ASLM</span>
          </h1>

          <div className="mt-8">
            <div className="inline-block bg-digital-black border-3 border-cyber-cyan px-8 py-4 shadow-neo-cyan">
              <p className="text-2xl md:text-3xl text-cyber-cyan font-bold uppercase tracking-wide">
                A self-tuning "synthetic organism" LLM<span className="animate-blink text-kintsugi-gold">_</span>
              </p>
            </div>
          </div>

          <p className="text-lg md:text-xl text-digital-white mt-8 max-w-2xl leading-relaxed border-l-4 border-cyber-pink pl-6">
            A lightweight, self-updating language model trained <span className="text-kintsugi-gold font-bold">EXCLUSIVELY</span> on synthetic data, designed for <span className="text-cyber-cyan font-bold">real-time adaptation</span> and <span className="text-neon-orange font-bold">ultra-low operational costs</span>.
          </p>

          <div className="mt-12 flex gap-4">
            <Link href="/auth/register">
              <Button size="lg" glitch>
                ▶ SIGN_UP
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                ⚡ LOG_IN
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-20 px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold uppercase text-rainbow">
            [ CORE_FEATURES.SYS ]
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
