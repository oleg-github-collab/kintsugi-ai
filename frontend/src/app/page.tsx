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
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto min-h-screen w-full flex flex-col justify-center items-start px-6 md:px-12 py-20 relative">
        <div className="max-w-4xl relative z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 border-3 border-kintsugi-gold bg-kintsugi-gold/10 text-kintsugi-gold font-bold uppercase text-sm animate-pulse-slow">
              ◆ REVOLUTIONARY AI TECH ◆
            </span>
          </div>

          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-extrabold uppercase leading-none mb-8">
            <span className="text-glitch block text-kintsugi-gold text-neon" data-text="KINTSUGI">KINTSUGI</span>
            <span className="block text-digital-white">ASLM</span>
          </h1>

          <div className="mb-8">
            <div className="inline-block bg-digital-black border-3 border-cyber-cyan px-8 py-4 shadow-neo-cyan">
              <p className="text-2xl md:text-3xl text-cyber-cyan font-bold uppercase">
                Adaptive Synthetic Language Model<span className="animate-blink text-kintsugi-gold">_</span>
              </p>
            </div>
          </div>

          <p className="text-lg md:text-xl text-digital-white max-w-2xl leading-relaxed border-l-4 border-cyber-pink pl-6 mb-12">
            Chat with <span className="text-kintsugi-gold font-bold">GPT-4o, o1, Claude</span>. Translate books. Connect with team. All powered by <span className="text-cyber-cyan font-bold">ultra-low-cost synthetic AI</span>.
          </p>

          <div className="flex gap-4">
            <Link href="/auth/register">
              <Button size="lg" glitch>
                ▶ GET_STARTED
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                LOG_IN
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 px-6 md:px-12 border-t-3 border-kintsugi-gold">
        <div className="container mx-auto text-center">
          <div className="text-3xl font-bold uppercase text-rainbow mb-2">⟡ KINTSUGI ASLM ⟡</div>
          <div className="text-neutral-500 text-sm font-mono mt-4">
            © 2024 // NO HUMAN DATA // PURE SYNTHETIC INTELLIGENCE
          </div>
        </div>
      </footer>
    </div>
  );
}
