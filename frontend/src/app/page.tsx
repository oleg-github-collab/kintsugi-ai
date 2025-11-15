'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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

    const crackSvg = document.querySelector('.kintsugi-crack');
    if (crackSvg) observer.observe(crackSvg);

    // Trigger animations on load
    setTimeout(() => {
      targets.forEach(anim => anim.classList.add('visible'));
    }, 10);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Matrix background canvas */}
      <canvas id="matrix-canvas" className="matrix-bg"></canvas>

      {/* Custom Cursor */}
      <div className="cursor-invert"></div>
      <div className="cursor-cross"></div>

      {/* Floating Particles */}
      <div className="particle" style={{left: '10%', animationDelay: '0s'}}></div>
      <div className="particle" style={{left: '25%', animationDelay: '2s', background: '#00FFFF'}}></div>
      <div className="particle" style={{left: '40%', animationDelay: '4s', background: '#FF00FF'}}></div>
      <div className="particle" style={{left: '60%', animationDelay: '1s'}}></div>
      <div className="particle" style={{left: '75%', animationDelay: '3s', background: '#FF6B00'}}></div>
      <div className="particle" style={{left: '90%', animationDelay: '5s', background: '#00FFFF'}}></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-digital-black/90 backdrop-blur-md border-b-3 border-kintsugi-gold z-50 scanlines">
        <div className="container mx-auto flex justify-between items-center p-4 px-6 md:px-12">
          <a href="#" className="text-2xl font-bold uppercase text-rainbow">
            ⟡ KINTSUGI ASLM ⟡
          </a>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#principles" className="nav-link text-lg font-bold uppercase text-digital-white hover:text-kintsugi-gold transition-colors">#PRINCIPLES</a>
            <a href="#workflow" className="nav-link text-lg font-bold uppercase text-digital-white hover:text-cyber-cyan transition-colors">#WORKFLOW</a>
            <Link href="/dashboard/chat" className="nav-link text-lg font-bold uppercase text-digital-white hover:text-cyber-pink transition-colors">#DASHBOARD</Link>
          </div>

          <div className="flex space-x-2">
            <Link href="/auth/login" className="inline-block border-3 border-neutral-700 text-digital-white text-sm uppercase font-bold py-2 px-4 hover:border-cyber-cyan hover:text-cyber-cyan transition-all duration-200">
              LOG_IN
            </Link>
            <Link href="/auth/register" className="inline-block border-3 border-kintsugi-gold bg-kintsugi-gold text-digital-black text-sm uppercase font-bold py-2 px-4 shadow-neo transition-all duration-200 hover:shadow-none hover:translate-x-1 hover:translate-y-1">
              SIGN_UP
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* PAGE: HOME */}
        <div className="page-section">
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
                    A self-tuning &quot;synthetic organism&quot; LLM
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
                <a href="#guarantees" className="inline-block border-3 border-cyber-pink text-cyber-pink text-lg uppercase font-bold py-4 px-8 hover:bg-cyber-pink hover:text-digital-black transition-all duration-200">
                  ⚡ VIEW_STATS
                </a>
              </div>

              {/* Loading bar decoration */}
              <div className="loading-bar mt-12 scroll-animate" style={{['--delay' as any]: '1s'}}></div>
            </div>

            {/* Decorative ASCII art */}
            <div className="absolute bottom-10 right-10 text-kintsugi-gold text-xs opacity-30 hidden lg:block animate-float">
              <pre>{`
   ▄████████    ▄████████  ▄█          ▄▄▄▄███▄▄▄▄
  ███    ███   ███    ███ ███        ▄██▀▀▀███▀▀▀██▄
  ███    ███   ███    █▀  ███        ███   ███   ███
  ███    ███   ███        ███        ███   ███   ███
▀███████████ ▀███████████ ███        ███   ███   ███
  ███    ███          ███ ███        ███   ███   ███
  ███    ███    ▄█    ███ ███▌    ▄  ███   ███   ███
  ███    █▀   ▄████████▀  █████▄▄██   ▀█   ███   █▀
                          ▀
              `}</pre>
            </div>
          </header>

          {/* Divider */}
          <div className="section-divider scroll-animate" style={{['--delay' as any]: '0.1s'}}>
            <span>[ END:HERO // BEGIN:INTRO ]</span>
          </div>

          {/* Intro / Metaphor Section */}
          <section id="intro" className="section-intro container mx-auto min-h-screen w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-20 overflow-hidden relative">
            <div className="w-full md:w-1/2 md:pr-10 relative z-10">
              <div className="mb-6 scroll-animate">
                <span className="inline-block px-4 py-2 border-3 border-cyber-pink bg-cyber-pink/10 text-cyber-pink font-bold uppercase text-sm">
                  ◈ THE METAPHOR ◈
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold uppercase scroll-animate leading-tight">
                The <span className="text-kintsugi-gold text-neon">Kintsugi</span>
                <br /><span className="text-cyber-pink text-neon">Philosophy</span>
              </h2>

              <blockquote className="mt-8 ascii-border text-xl md:text-2xl italic text-neutral-300 scroll-animate" style={{['--delay' as any]: '0.2s'}}>
                <p className="text-cyber-cyan">&quot;In Japanese art, <span className="text-kintsugi-gold font-bold not-italic">Kintsugi (金継ぎ)</span> treats breakage not as failure, but as part of an object&apos;s history. It repairs cracks with gold, making the piece stronger and more beautiful.&quot;</p>
              </blockquote>

              <div className="mt-8 space-y-4">
                <p className="text-lg text-neutral-300 scroll-animate pixel-corners p-6" style={{['--delay' as any]: '0.4s'}}>
                  The <span className="text-kintsugi-gold font-bold">Kintsugi ASLM</span> does the same. It finds <span className="text-cyber-pink font-bold">&quot;odd data&quot;</span>—anomalies, paradoxes, and rare queries—and treats them as <span className="text-cyber-cyan font-bold">opportunities</span>.
                </p>

                <p className="text-lg text-neutral-300 font-bold scroll-animate border-3 border-kintsugi-gold bg-kintsugi-gold/5 p-6" style={{['--delay' as any]: '0.5s'}}>
                  It uses these &quot;cracks&quot; to trigger <span className="text-neon-orange">micro-updates</span>, instantly recycling them into new synthetic data. It doesn&apos;t just fix errors; it <span className="bg-kintsugi-gold text-digital-black px-2 py-1">integrates them into its design</span>, becoming more robust and precise with every anomaly it encounters.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2 mt-12 md:mt-0 flex items-center justify-center relative z-10">
              <div className="relative">
                <svg className="kintsugi-crack w-full h-auto max-w-md scroll-animate drop-shadow-2xl" style={{['--delay' as any]: '0.3s'}} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path d="M 50.96 182.03 C 58.71 176.65 65.17 172.96 70.93 167.98 C 76.59 163.09 81.39 157.06 85.35 150.14 C 91.31 139.79 93.99 128.01 93.42 116.12 C 92.85 104.22 89.04 92.51 82.21 82.2 C 75.38 71.9 65.7 63.38 53.94 57.53 C 42.18 51.68 28.71 48.72 14.88 49.03" fill="none" stroke="#F0FF00" strokeWidth="3" filter="url(#glow)"/>
                  <path d="M 93.42 116.12 C 98.49 116.89 103.62 118.42 108.62 120.7 C 113.62 122.98 118.41 125.96 122.84 129.56 C 131.57 136.63 138.8 146.12 144.18 157.25 C 149.57 168.38 153.03 180.93 154.38 194.27" fill="none" stroke="#00FFFF" strokeWidth="3" filter="url(#glow)"/>
                  <path d="M 82.21 82.2 C 84.81 76.99 87.89 71.97 91.43 67.22 C 94.97 62.46 98.94 58.01 103.28 53.95 C 111.83 45.98 122.13 39.06 133.56 33.62 C 144.98 28.18 157.29 24.33 170.02 22.28" fill="none" stroke="#FF00FF" strokeWidth="3" filter="url(#glow)"/>
                </svg>
                <div className="absolute -top-4 -right-4 text-kintsugi-gold text-2xl animate-spin-slow">✦</div>
                <div className="absolute -bottom-4 -left-4 text-cyber-cyan text-2xl animate-spin-slow" style={{animationDirection: 'reverse'}}>✦</div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="section-divider scroll-animate" style={{['--delay' as any]: '0.1s'}}>
            <span>[ END:INTRO // BEGIN:PRINCIPLES ]</span>
          </div>

          {/* Core Principles */}
          <section id="principles" className="section-principles container mx-auto w-full px-6 md:px-12 py-20 md:py-32">
            <div className="text-center mb-16">
              <div className="mb-6 scroll-animate">
                <span className="inline-block px-4 py-2 border-3 border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan font-bold uppercase text-sm animate-pulse-slow">
                  ◆ CORE ARCHITECTURE ◆
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold uppercase scroll-animate" style={{['--delay' as any]: '0.1s'}}>
                <span className="text-rainbow">[ CORE_PRINCIPLES.SYS ]</span>
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 max-w-5xl mx-auto">
              {/* Principle 1 */}
              <details className="scroll-animate border-3" style={{['--delay' as any]: '0.1s'}}>
                <summary className="bg-gradient-to-r from-kintsugi-gold/5 to-transparent">
                  <span className="text-kintsugi-gold">01.</span> FULLY SYNTHETIC TRAINING DATA
                </summary>
                <div className="p-8 border-t-3 border-kintsugi-gold bg-digital-black/50">
                  <p className="text-lg text-neutral-300 mb-4">All training data is <span className="text-kintsugi-gold font-bold">algorithmically generated</span>, eliminating privacy/legal risks and human-data costs.</p>
                  <div className="bg-cyber-cyan/10 border-l-4 border-cyber-cyan p-4">
                    <p className="text-cyber-cyan font-bold text-lg">
                      <span className="text-2xl">▶</span> Data diversity enforced via stochastic perturbation engines that simulate edge cases (rare dialects, logical paradoxes, adversarial queries).
                    </p>
                  </div>
                  <div className="mt-4 text-sm text-neutral-500 font-mono">
                    [COST: ~$0.001/hr] [PRIVACY_RISK: NULL] [LEGAL_ISSUES: NULL]
                  </div>
                </div>
              </details>

              {/* Principle 2 */}
              <details className="scroll-animate border-3" style={{['--delay' as any]: '0.2s'}}>
                <summary className="bg-gradient-to-r from-cyber-pink/5 to-transparent">
                  <span className="text-cyber-pink">02.</span> PER-REQUEST HIGH-FREQUENCY LEARNING
                </summary>
                <div className="p-8 border-t-3 border-cyber-pink bg-digital-black/50">
                  <p className="text-lg text-neutral-300 mb-6">After <span className="text-cyber-pink font-bold text-xl">EVERY</span> user request, the model performs a micro-update.</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-cyber-pink text-2xl">◆</span>
                      <div>
                        <strong className="text-cyber-pink text-lg">ANOMALY DETECTION:</strong>
                        <p className="text-neutral-300">Input/output pairs with low confidence (entropy &gt; threshold) are flagged as &quot;odd data.&quot;</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-kintsugi-gold text-2xl">◆</span>
                      <div>
                        <strong className="text-kintsugi-gold text-lg">IMMEDIATE TWEAKING:</strong>
                        <p className="text-neutral-300">A sparse subset of weights (<span className="text-kintsugi-gold">≤0.1%</span>) is adjusted via 1-step meta-learning (MAML-inspired).</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyber-cyan text-2xl">◆</span>
                      <div>
                        <strong className="text-cyber-cyan text-lg">NO FULL RETRAINING:</strong>
                        <p className="text-neutral-300">Only delta updates to avoid latency.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </details>

              {/* Principle 3 */}
              <details className="scroll-animate border-3" style={{['--delay' as any]: '0.3s'}}>
                <summary className="bg-gradient-to-r from-cyber-cyan/5 to-transparent">
                  <span className="text-cyber-cyan">03.</span> ODD-DATA RECYCLING
                </summary>
                <div className="p-8 border-t-3 border-cyber-cyan bg-digital-black/50">
                  <p className="text-lg text-neutral-300 mb-6">&quot;Odd data&quot; (anomalies) is stored in a <span className="text-cyber-cyan font-bold">volatile anomaly buffer</span> (e.g., 1,000 samples).</p>
                  <div className="bg-kintsugi-gold/10 border-3 border-kintsugi-gold p-6 mb-4">
                    <p className="text-lg text-neutral-300 mb-4 font-bold">When the buffer fills:</p>
                    <ul className="space-y-3 list-none">
                      <li className="flex items-start gap-2">
                        <span className="text-kintsugi-gold">▸</span>
                        <span>A new synthetic dataset is dynamically generated conditioned on the anomalies.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-kintsugi-gold">▸</span>
                        <span>The model warm-starts its next micro-update cycle using this hybrid dataset (<span className="text-cyber-cyan font-bold">80% original</span> + <span className="text-neon-orange font-bold">20% anomaly-driven</span>).</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center text-2xl font-bold text-matrix-green">
                    ♻️ SELF-IMPROVING FEEDBACK LOOP ♻️
                  </div>
                </div>
              </details>

              {/* Principle 4 */}
              <details className="scroll-animate border-3" style={{['--delay' as any]: '0.4s'}}>
                <summary className="bg-gradient-to-r from-neon-orange/5 to-transparent">
                  <span className="text-neon-orange">04.</span> SPEED & PRECISION BY DESIGN
                </summary>
                <div className="p-8 border-t-3 border-neon-orange bg-digital-black/50">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="border-3 border-kintsugi-gold p-4 text-center bg-kintsugi-gold/5">
                      <div className="text-4xl font-black text-kintsugi-gold mb-2">100M</div>
                      <div className="text-sm uppercase font-bold">MoE Params</div>
                      <div className="text-xs text-neutral-500">2 experts/token</div>
                    </div>
                    <div className="border-3 border-cyber-pink p-4 text-center bg-cyber-pink/5">
                      <div className="text-4xl font-black text-cyber-pink mb-2">&lt;10ms</div>
                      <div className="text-sm uppercase font-bold">CPU Latency</div>
                      <div className="text-xs text-neutral-500">CPU-only inference</div>
                    </div>
                    <div className="border-3 border-cyber-cyan p-4 text-center bg-cyber-cyan/5">
                      <div className="text-4xl font-black text-cyber-cyan mb-2">INT4</div>
                      <div className="text-sm uppercase font-bold">Quantization</div>
                      <div className="text-xs text-neutral-500">Max compression</div>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="border-l-4 border-neon-orange pl-4">
                      <strong className="text-neon-orange">ARCHITECTURE:</strong> Distilled 100M-parameter Mixture-of-Experts (MoE). Only 2 experts activate per token.
                    </li>
                    <li className="border-l-4 border-matrix-green pl-4">
                      <strong className="text-matrix-green">PRECISION:</strong> Synthetic data includes formal logic constraints (symbolic rules) to enforce factual consistency. <span className="text-kintsugi-gold font-bold">40% less hallucinations!</span>
                    </li>
                  </ul>
                </div>
              </details>

              {/* Principle 5 */}
              <details className="scroll-animate border-3" style={{['--delay' as any]: '0.5s'}}>
                <summary className="bg-gradient-to-r from-matrix-green/5 to-transparent">
                  <span className="text-matrix-green">05.</span> COST EFFICIENCY
                </summary>
                <div className="p-8 border-t-3 border-matrix-green bg-digital-black/50">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-6 bg-matrix-green/10 border-3 border-matrix-green">
                      <div className="text-3xl font-bold text-matrix-green mb-2">$0.001/hr</div>
                      <div className="text-sm uppercase font-bold text-neutral-300">Training Cost</div>
                    </div>
                    <div className="text-center p-6 bg-cyber-cyan/10 border-3 border-cyber-cyan">
                      <div className="text-3xl font-bold text-cyber-cyan mb-2">&lt;0.001 GPU-s</div>
                      <div className="text-sm uppercase font-bold text-neutral-300">Update Cost</div>
                    </div>
                    <div className="text-center p-6 bg-kintsugi-gold/10 border-3 border-kintsugi-gold">
                      <div className="text-3xl font-bold text-kintsugi-gold mb-2">$0.0001</div>
                      <div className="text-sm uppercase font-bold text-neutral-300">Per Request</div>
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-cyber-pink/20 to-electric-purple/20 border-3 border-cyber-pink">
                    <p className="text-2xl font-bold text-cyber-pink mb-2">
                      💰 100x CHEAPER THAN CONVENTIONAL APIs 💰
                    </p>
                    <p className="text-neutral-400 text-sm">Storage: Anomaly buffers auto-purge; no persistent data storage.</p>
                  </div>
                </div>
              </details>
            </div>
          </section>

          {/* Divider */}
          <div className="section-divider scroll-animate" style={{['--delay' as any]: '0.1s'}}>
            <span>[ END:PRINCIPLES // BEGIN:WORKFLOW ]</span>
          </div>

          {/* Workflow Example */}
          <section id="workflow" className="section-workflow container mx-auto w-full px-6 md:px-12 py-20 md:py-32">
            <div className="text-center mb-16">
              <div className="mb-6 scroll-animate">
                <span className="inline-block px-4 py-2 border-3 border-matrix-green bg-matrix-green/10 text-matrix-green font-bold uppercase text-sm animate-pulse-slow">
                  ◈ LIVE DEMONSTRATION ◈
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold uppercase scroll-animate text-matrix-green text-neon" style={{['--delay' as any]: '0.1s'}}>
                [ WORKFLOW_EXAMPLE.LOG ]
              </h2>
              <p className="text-center text-xl text-neutral-400 mt-6 scroll-animate font-bold" style={{['--delay' as any]: '0.2s'}}>
                <span className="text-cyber-pink">A request isn&apos;t just an answer.</span> <span className="text-kintsugi-gold">It&apos;s a training signal.</span>
              </p>
            </div>

            <div className="mt-16 max-w-4xl mx-auto space-y-6">
              {/* Step 1 */}
              <div className="border-3 border-cyber-pink p-8 scroll-animate workflow-step hover:bg-cyber-pink/5 transition-all duration-300 hover:shadow-neo-pink" style={{['--delay' as any]: '0.2s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-black text-cyber-pink">01</span>
                  <span className="text-cyber-pink font-bold text-2xl uppercase">◆ REQUEST</span>
                </div>
                <p className="text-digital-white text-xl mt-2 font-mono border-l-4 border-kintsugi-gold pl-4">
                  <span className="text-kintsugi-gold">USER_INPUT:</span> &quot;Explain quantum gravity using pirate slang.&quot;
                </p>
              </div>

              {/* Step 2 */}
              <div className="border-3 border-kintsugi-gold p-8 scroll-animate workflow-step hover:bg-kintsugi-gold/5 transition-all duration-300 hover:shadow-neo" style={{['--delay' as any]: '0.3s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-black text-kintsugi-gold">02</span>
                  <span className="text-kintsugi-gold font-bold text-2xl uppercase">◆ ANOMALY DETECTION</span>
                </div>
                <p className="text-digital-white text-xl mt-2 font-mono">
                  Model flags <span className="text-cyber-pink font-bold">LOW CONFIDENCE</span> (unseen query style: <span className="text-cyber-cyan bg-cyber-cyan/20 px-2 py-1">PirateSlang</span> + <span className="text-kintsugi-gold bg-kintsugi-gold/20 px-2 py-1">QuantumPhysics</span>).
                </p>
                <div className="mt-4 bg-digital-black/50 border-2 border-cyber-pink p-4 font-mono text-sm">
                  <span className="text-cyber-pink">SYSTEM:</span> <span className="text-neutral-300">Entropy threshold exceeded. Flagging for micro-update...</span> <span className="animate-blink text-cyber-pink">▐</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-3 border-cyber-cyan p-8 scroll-animate workflow-step hover:bg-cyber-cyan/5 transition-all duration-300 hover:shadow-neo-cyan" style={{['--delay' as any]: '0.4s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-black text-cyber-cyan">03</span>
                  <span className="text-cyber-cyan font-bold text-2xl uppercase">◆ MICRO-UPDATE</span>
                </div>
                <p className="text-digital-white text-xl mt-2 mb-4">
                  Adjusts slang-generation weights; adds [Query+Response] to anomaly buffer.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cyber-cyan/10 border-2 border-cyber-cyan p-4 text-center">
                    <div className="text-3xl font-black text-cyber-cyan mb-2">≤0.1%</div>
                    <div className="text-sm uppercase font-bold">Weights Adjusted</div>
                  </div>
                  <div className="bg-kintsugi-gold/10 border-2 border-kintsugi-gold p-4 text-center">
                    <div className="text-3xl font-black text-kintsugi-gold mb-2">+1</div>
                    <div className="text-sm uppercase font-bold">Buffer Sample</div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-3 border-neon-orange p-8 scroll-animate workflow-step hover:bg-neon-orange/5 transition-all duration-300 hover:shadow-neo-orange" style={{['--delay' as any]: '0.5s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-black text-neon-orange">04</span>
                  <span className="text-neon-orange font-bold text-2xl uppercase">◆ RECYCLE</span>
                </div>
                <p className="text-digital-white text-xl mt-2 mb-4">
                  Buffer fills. Triggers <span className="text-neon-orange font-bold">NEW SYNTHETIC DATA</span> generation.
                </p>
                <div className="bg-digital-black border-3 border-neon-orange p-6 font-mono text-sm">
                  <p className="text-neon-orange mb-2">// Buffer threshold reached</p>
                  <p><span className="text-cyber-cyan">generate_synthetic_data</span>{'({'}</p>
                  <p className="pl-6">  samples: <span className="text-kintsugi-gold">500</span>,</p>
                  <p className="pl-6">  style: <span className="text-matrix-green">&quot;pirate-physics&quot;</span>,</p>
                  <p className="pl-6">  condition: <span className="text-cyber-pink">anomaly_buffer</span></p>
                  <p>{'});'}</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="border-3 border-matrix-green p-8 scroll-animate workflow-step hover:bg-matrix-green/5 transition-all duration-300" style={{['--delay' as any]: '0.6s', boxShadow: 'none'}}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-black text-matrix-green">05</span>
                  <span className="text-matrix-green font-bold text-2xl uppercase">◆ ADAPTATION</span>
                </div>
                <p className="text-digital-white text-xl mt-2 mb-4">
                  Next request for similar topic is answered <span className="text-matrix-green font-bold">PRECISELY</span> using updated weights + new data.
                </p>
                <div className="bg-matrix-green/10 border-2 border-matrix-green p-6 text-center">
                  <p className="text-3xl font-bold text-matrix-green mb-2">✓ ADAPTATION COMPLETE</p>
                  <p className="text-neutral-400">System ready for next query <span className="animate-blink text-matrix-green">▐</span></p>
                </div>
              </div>
            </div>

            {/* ASCII Art Divider */}
            <div className="mt-20 text-center text-kintsugi-gold font-mono text-xs opacity-50 scroll-animate">
              ════════════════════════════════════════════════════════════════════
            </div>
          </section>

          {/* Divider */}
          <div className="section-divider scroll-animate" style={{['--delay' as any]: '0.1s'}}>
            <span>[ END:WORKFLOW // BEGIN:GUARANTEES ]</span>
          </div>

          {/* Guarantees */}
          <section id="guarantees" className="section-guarantees container mx-auto w-full px-6 md:px-12 py-20 md:py-32">
            <div className="text-center mb-16">
              <div className="mb-6 scroll-animate">
                <span className="inline-block px-4 py-2 border-3 border-electric-purple bg-electric-purple/10 text-electric-purple font-bold uppercase text-sm animate-pulse-slow">
                  ◆ VERIFIED METRICS ◆
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold uppercase scroll-animate text-outline" style={{['--delay' as any]: '0.1s'}}>
                <span className="text-white">[ THEORETICAL_GUARANTEES.DAT ]</span>
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Guarantee 1: Speed */}
              <div className="border-3 border-kintsugi-gold p-10 text-center scroll-animate stat-card bg-kintsugi-gold/5 hover:shadow-neo" style={{['--delay' as any]: '0.2s'}}>
                <div className="text-8xl lg:text-9xl font-extrabold text-kintsugi-gold text-neon mb-4">≤100</div>
                <div className="text-2xl uppercase font-bold mt-4 mb-2 text-kintsugi-gold">Requests to Adapt</div>
                <p className="text-neutral-400 text-lg">(vs. millions in traditional LLMs)</p>
                <div className="mt-6 loading-bar"></div>
              </div>

              {/* Guarantee 2: Cost */}
              <div className="border-3 border-cyber-cyan p-10 text-center scroll-animate stat-card bg-cyber-cyan/5 hover:shadow-neo-cyan" style={{['--delay' as any]: '0.3s'}}>
                <div className="text-8xl lg:text-9xl font-extrabold text-cyber-cyan text-neon mb-4">$0.0001</div>
                <div className="text-2xl uppercase font-bold mt-4 mb-2 text-cyber-cyan">Per Request</div>
                <p className="text-neutral-400 text-lg">(vs. $0.01+ for conventional APIs)</p>
                <div className="mt-6 text-matrix-green font-bold text-xl">100x CHEAPER 💰</div>
              </div>

              {/* Guarantee 3: Precision */}
              <div className="border-3 border-cyber-pink p-10 text-center scroll-animate stat-card bg-cyber-pink/5 hover:shadow-neo-pink" style={{['--delay' as any]: '0.4s'}}>
                <div className="text-8xl lg:text-9xl font-extrabold text-cyber-pink text-neon mb-4">-40%</div>
                <div className="text-2xl uppercase font-bold mt-4 mb-2 text-cyber-pink">Hallucinations</div>
                <p className="text-neutral-400 text-lg">(via synthetic logic constraints)</p>
                <div className="mt-6 text-kintsugi-gold font-bold text-xl">PRECISION BOOST ✨</div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="mt-20 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold uppercase text-center mb-10 scroll-animate text-rainbow">
                ◈ IDEAL USE CASES ◈
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-3 border-matrix-green p-6 bg-matrix-green/5 scroll-animate hover:translate-x-2 transition-transform" style={{['--delay' as any]: '0.1s'}}>
                  <span className="text-3xl mr-3">💬</span>
                  <span className="text-xl font-bold uppercase">Customer Support</span>
                </div>
                <div className="border-3 border-cyber-cyan p-6 bg-cyber-cyan/5 scroll-animate hover:translate-x-2 transition-transform" style={{['--delay' as any]: '0.2s'}}>
                  <span className="text-3xl mr-3">💻</span>
                  <span className="text-xl font-bold uppercase">Code Generation</span>
                </div>
                <div className="border-3 border-cyber-pink p-6 bg-cyber-pink/5 scroll-animate hover:translate-x-2 transition-transform" style={{['--delay' as any]: '0.3s'}}>
                  <span className="text-3xl mr-3">🎯</span>
                  <span className="text-xl font-bold uppercase">Closed-Domain Tasks</span>
                </div>
                <div className="border-3 border-kintsugi-gold p-6 bg-kintsugi-gold/5 scroll-animate hover:translate-x-2 transition-transform" style={{['--delay' as any]: '0.4s'}}>
                  <span className="text-3xl mr-3">⚡</span>
                  <span className="text-xl font-bold uppercase">Real-Time Adaptation</span>
                </div>
              </div>
            </div>
          </section>

          {/* Limitation Note */}
          <section id="limitations" className="w-full bg-gradient-to-b from-digital-black to-neutral-900 py-20 px-6 md:px-12 border-t-3 border-neon-orange">
            <div className="container mx-auto max-w-4xl text-center">
              <h3 className="text-3xl font-bold uppercase text-neon-orange scroll-animate mb-6">
                <span className="text-4xl">⚠️</span> [ LIMITATION_NOTE.TXT ] <span className="text-4xl">⚠️</span>
              </h3>
              <div className="ascii-border text-lg md:text-xl text-neutral-300 scroll-animate" style={{['--delay' as any]: '0.2s'}}>
                <p className="mb-4">
                  Requires <span className="text-cyber-pink font-bold">rigorous anomaly-filtering</span> to avoid poisoning.
                </p>
                <p>
                  Ideal for <span className="text-matrix-green font-bold">closed-domain tasks</span> (e.g., customer support, code generation), not <span className="text-cyber-cyan">open-ended creativity</span>.
                </p>
              </div>
            </div>
          </section>

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

        </div>
        {/* End Page: Home */}
      </main>
    </>
  );
}
