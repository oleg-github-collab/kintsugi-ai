'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Matrix Rain Background
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const matrix = "KINTSUGIASلM01";
      const fontSize = 14;
      const columns = canvas.width / fontSize;
      const drops: number[] = [];

      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
      }

      function drawMatrix() {
        if (!ctx || !canvas) return;
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
      }

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
    }
  }, []);

  useEffect(() => {
    // Custom Cursor
    const cursorCross = document.querySelector('.cursor-cross') as HTMLElement;
    const cursorInvert = document.querySelector('.cursor-invert') as HTMLElement;

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorCross && cursorInvert) {
        cursorCross.style.left = e.clientX + 'px';
        cursorCross.style.top = e.clientY + 'px';

        cursorInvert.style.left = (e.clientX - 60) + 'px';
        cursorInvert.style.top = (e.clientY - 60) + 'px';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Cursor hover effect
    const interactiveElements = document.querySelectorAll('a, button, details summary');

    const handleMouseEnter = () => cursorInvert?.classList.add('hover');
    const handleMouseLeave = () => cursorInvert?.classList.remove('hover');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  useEffect(() => {
    // Scroll Animation Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const targets = document.querySelectorAll('.scroll-animate');
    targets.forEach(target => observer.observe(target));

    // Trigger animations on load
    setTimeout(() => {
      targets.forEach(anim => anim.classList.add('visible'));
    }, 10);

    return () => {
      targets.forEach(target => observer.unobserve(target));
    };
  }, []);

  return (
    <>
      {/* Matrix background canvas */}
      <canvas id="matrix-canvas" className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-5"></canvas>

      {/* Custom Cursor */}
      <div className="cursor-invert"></div>
      <div className="cursor-cross"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-digital-black/90 backdrop-blur-md border-b-3 border-kintsugi-gold z-50 scanlines">
        <div className="container mx-auto flex justify-between items-center p-4 px-6 md:px-12">
          <a href="#" className="text-2xl font-bold uppercase text-rainbow">
            ⟡ KINTSUGI ASLM ⟡
          </a>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#principles" className="nav-link text-lg font-bold uppercase text-digital-white hover:text-kintsugi-gold transition-colors">#PRINCIPLES</a>
            <a href="#workflow" className="nav-link text-lg font-bold uppercase text-digital-white hover:text-cyber-cyan transition-colors">#WORKFLOW</a>
            <a href="/auth/login" className="nav-link text-lg font-bold uppercase text-digital-white hover:text-cyber-pink transition-colors">#LOGIN</a>
          </div>

          <div className="flex space-x-2">
            <a href="/auth/login" className="inline-block border-3 border-neutral-700 text-digital-white text-sm uppercase font-bold py-2 px-4 hover:border-cyber-cyan hover:text-cyber-cyan transition-all duration-200">
              LOG_IN
            </a>
            <a href="/auth/register" className="inline-block border-3 border-kintsugi-gold bg-kintsugi-gold text-digital-black text-sm uppercase font-bold py-2 px-4 shadow-neo transition-all duration-200 hover:shadow-none hover:translate-x-1 hover:translate-y-1">
              SIGN_UP
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Top Marquee Banner */}
        <div className="w-full overflow-hidden border-b-3 border-kintsugi-gold py-4 bg-gradient-to-r from-cyber-pink via-cyber-cyan to-kintsugi-gold mt-16">
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
        <header className="section-hero container mx-auto min-h-screen w-full flex flex-col justify-center items-start px-6 md:px-12 py-20 relative">
          <div className="max-w-4xl relative z-10">
            <div className="mb-6 scroll-animate" style={{['--delay' as any]: '0s'}}>
              <span className="inline-block px-4 py-2 border-3 border-kintsugi-gold bg-kintsugi-gold/10 text-kintsugi-gold font-bold uppercase text-sm animate-pulse-slow">
                ◆ REVOLUTIONARY AI TECH ◆
              </span>
            </div>

            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-extrabold uppercase leading-none">
              <span className="text-glitch block scroll-animate text-kintsugi-gold text-neon" data-text="KINTSUGI" style={{['--delay' as any]: '0.1s'}}>KINTSUGI</span>
              <span className="text-glitch block scroll-animate text-outline text-white" data-text="ASLM" style={{['--delay' as any]: '0.2s'}}>ASLM</span>
            </h1>

            <div className="scroll-animate mt-8" style={{['--delay' as any]: '0.4s'}}>
              <div className="inline-block bg-digital-black border-3 border-cyber-cyan px-8 py-4 shadow-neo-cyan">
                <p className="text-2xl md:text-3xl text-cyber-cyan font-bold uppercase tracking-wide terminal-cursor">
                  A self-tuning "synthetic organism" LLM
                </p>
              </div>
            </div>

            <p className="text-lg md:text-xl text-digital-white mt-8 max-w-2xl scroll-animate leading-relaxed border-l-4 border-cyber-pink pl-6" style={{['--delay' as any]: '0.6s'}}>
              A lightweight, self-updating language model trained <span className="text-kintsugi-gold font-bold">EXCLUSIVELY</span> on synthetic data, designed for <span className="text-cyber-cyan font-bold">real-time adaptation</span> and <span className="text-neon-orange font-bold">ultra-low operational costs</span>.
            </p>

            <div className="mt-12 flex gap-4 scroll-animate" style={{['--delay' as any]: '0.8s'}}>
              <a href="#intro" className="inline-block border-3 border-kintsugi-gold bg-kintsugi-gold text-digital-black text-lg uppercase font-bold py-4 px-8 shadow-neo transition-all duration-200 hover:shadow-none hover:translate-x-2 hover:translate-y-2">
                ▶ EXPLORE_CONCEPT
              </a>
              <a href="/auth/register" className="inline-block border-3 border-cyber-pink text-cyber-pink text-lg uppercase font-bold py-4 px-8 hover:bg-cyber-pink hover:text-digital-black transition-all duration-200">
                ⚡ GET_STARTED
              </a>
            </div>

            {/* Loading bar decoration */}
            <div className="loading-bar mt-12 scroll-animate" style={{['--delay' as any]: '1s'}}></div>
          </div>
        </header>

        {/* Footer */}
        <footer className="w-full py-16 px-6 md:px-12 border-t-3 border-kintsugi-gold bg-gradient-to-b from-digital-black to-neutral-900">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
            <div className="scroll-animate">
              <div className="text-3xl font-bold uppercase text-rainbow mb-2">⟡ KINTSUGI ASLM ⟡</div>
              <div className="text-neutral-500 text-lg">A Theoretic Concept</div>
              <div className="loading-bar mt-4"></div>
            </div>
            <div className="text-lg text-neutral-400 scroll-animate" style={{['--delay' as any]: '0.2s'}}>
              <p className="mb-2">Created & Developed by</p>
              <p className="text-2xl font-bold text-kintsugi-gold text-neon">
                OLEH KAMINSKYI
              </p>
              <p className="text-sm text-cyber-cyan mt-2">Algorithmic Evolution Architect</p>
            </div>
          </div>

          <div className="text-center mt-12 text-neutral-600 text-sm font-mono">
            © 2024 // NO HUMAN DATA // PURE SYNTHETIC INTELLIGENCE
          </div>
        </footer>
      </main>
    </>
  );
}
