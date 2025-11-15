'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = 'KINTSUGIASЛM01';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#F0FF00';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(drawMatrix, 50);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen text-digital-white relative">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-5" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-digital-black/90 backdrop-blur-md border-b-3 border-kintsugi-gold z-50 scanlines">
        <div className="container mx-auto flex justify-between items-center p-4 px-6 md:px-12">
          <div className="text-2xl font-bold uppercase text-rainbow">⟡ KINTSUGI AI ⟡</div>
          <div className="flex gap-2">
            <Link href="/auth/login" className="border-3 border-digital-white/30 text-digital-white px-4 py-2 text-sm uppercase font-bold hover:border-cyber-cyan hover:text-cyber-cyan transition-all">
              LOG_IN
            </Link>
            <Link href="/auth/register" className="border-3 border-kintsugi-gold bg-kintsugi-gold text-digital-black px-4 py-2 text-sm uppercase font-bold shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              SIGN_UP
            </Link>
          </div>
        </div>
      </nav>

      {/* Top Marquee */}
      <div className="w-full overflow-hidden border-b-3 border-kintsugi-gold py-4 bg-gradient-to-r from-cyber-pink via-cyber-cyan to-kintsugi-gold mt-16">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-xl uppercase font-bold text-digital-black px-6">🚀 BORN IN SIMULATION</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">⚡ EVOLVING ON ANOMALIES</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">🔬 NO HUMAN DATA</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">🧬 PURE ALGORITHMIC EVOLUTION</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">🚀 BORN IN SIMULATION</span>
          <span className="text-xl uppercase font-bold text-digital-black px-6">⚡ EVOLVING ON ANOMALIES</span>
        </div>
      </div>

      {/* Hero */}
      <section className="container mx-auto min-h-screen w-full flex flex-col justify-center items-start px-6 md:px-12 py-20 relative z-10">
        <div className="max-w-4xl">
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
            <Link href="/auth/register" className="border-3 border-kintsugi-gold bg-kintsugi-gold text-digital-black px-8 py-4 text-lg uppercase font-bold shadow-neo hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
              ▶ GET_STARTED
            </Link>
            <Link href="/auth/login" className="border-3 border-kintsugi-gold text-kintsugi-gold px-8 py-4 text-lg uppercase font-bold hover:bg-kintsugi-gold hover:text-digital-black transition-all">
              LOG_IN
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 px-6 md:px-12 border-t-3 border-kintsugi-gold relative z-10">
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
