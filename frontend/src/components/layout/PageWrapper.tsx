'use client';

import { useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

interface PageWrapperProps {
  children: ReactNode;
  currentPage?: 'chat' | 'messenger' | 'translation';
}

export function PageWrapper({ children, currentPage }: PageWrapperProps) {
  const { user, logout } = useAuthStore();

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

    const interactiveElements = document.querySelectorAll('a, button, input, textarea');

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

  return (
    <>
      {/* Matrix background */}
      <canvas id="matrix-canvas" className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-5"></canvas>

      {/* Custom Cursor */}
      <div className="cursor-invert"></div>
      <div className="cursor-cross"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-digital-black/90 backdrop-blur-md border-b-3 border-kintsugi-gold z-50 scanlines">
        <div className="container mx-auto flex justify-between items-center p-4 px-6 md:px-12">
          <Link href="/" className="text-2xl font-bold uppercase text-rainbow">
            ⟡ KINTSUGI AI ⟡
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard/chat"
              className={`nav-link text-lg font-bold uppercase transition-colors ${currentPage === 'chat' ? 'text-kintsugi-gold' : 'text-digital-white hover:text-kintsugi-gold'}`}
            >
              #CHAT
            </Link>
            <Link
              href="/dashboard/messenger"
              className={`nav-link text-lg font-bold uppercase transition-colors ${currentPage === 'messenger' ? 'text-cyber-cyan' : 'text-digital-white hover:text-cyber-cyan'}`}
            >
              #MESSENGER
            </Link>
            <Link
              href="/dashboard/translation"
              className={`nav-link text-lg font-bold uppercase transition-colors ${currentPage === 'translation' ? 'text-cyber-pink' : 'text-digital-white hover:text-cyber-pink'}`}
            >
              #TRANSLATION
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <span className="text-digital-white font-mono text-sm hidden sm:block">{user.username}</span>
                <button
                  onClick={logout}
                  className="border-3 border-neutral-700 text-digital-white text-sm uppercase font-bold py-2 px-4 hover:border-neon-orange hover:text-neon-orange transition-all duration-200"
                >
                  LOGOUT
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-20 min-h-screen">
        {children}
      </main>
    </>
  );
}
