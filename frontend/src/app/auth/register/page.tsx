'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters');
      return;
    }

    try {
      await register(username, email, password);
      router.push('/dashboard/chat');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const displayError = localError || error;

  return (
    <>
      <canvas id="matrix-canvas" className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-5"></canvas>

      <div className="min-h-screen flex items-center justify-center px-6 py-20 relative z-10">
        <div className="max-w-md w-full border-3 border-kintsugi-gold p-8 md:p-12 shadow-neo bg-digital-black scanlines">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold uppercase text-rainbow inline-block mb-4">
              ⟡ KINTSUGI AI ⟡
            </Link>
          </div>

          <h2 className="text-4xl font-bold uppercase text-center text-kintsugi-gold text-neon mb-4">
            [ USER_AUTH:REGISTER ]
          </h2>

          <div className="loading-bar mb-8"></div>

          {displayError && (
            <div className="mb-6 p-4 border-3 border-neon-orange bg-neon-orange/10 scroll-animate visible">
              <p className="text-sm font-mono text-neon-orange uppercase">⚠ {displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="w-full">
              <label className="block font-mono font-bold text-kintsugi-gold mb-2 uppercase">
                Username
              </label>
              <input
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 font-mono bg-digital-black border-3 border-kintsugi-gold focus:border-kintsugi-gold focus:shadow-neo text-digital-white placeholder:text-digital-white/40 outline-none transition-all min-h-[48px]"
              />
            </div>

            <div className="w-full">
              <label className="block font-mono font-bold text-kintsugi-gold mb-2 uppercase">
                Email
              </label>
              <input
                type="email"
                placeholder="user@kintsugi.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 font-mono bg-digital-black border-3 border-kintsugi-gold focus:border-kintsugi-gold focus:shadow-neo text-digital-white placeholder:text-digital-white/40 outline-none transition-all min-h-[48px]"
              />
            </div>

            <div className="w-full">
              <label className="block font-mono font-bold text-kintsugi-gold mb-2 uppercase">
                Password
              </label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 font-mono bg-digital-black border-3 border-kintsugi-gold focus:border-kintsugi-gold focus:shadow-neo text-digital-white placeholder:text-digital-white/40 outline-none transition-all min-h-[48px]"
              />
            </div>

            <div className="w-full">
              <label className="block font-mono font-bold text-kintsugi-gold mb-2 uppercase">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 font-mono bg-digital-black border-3 border-kintsugi-gold focus:border-kintsugi-gold focus:shadow-neo text-digital-white placeholder:text-digital-white/40 outline-none transition-all min-h-[48px]"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-mono font-bold uppercase border-3 border-kintsugi-gold bg-kintsugi-gold text-digital-black shadow-neo transition-all duration-200 hover:shadow-none hover:translate-x-2 hover:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none px-6 py-3 text-base"
              >
                {isLoading ? '▶ CREATING_ACCOUNT...' : '▶ CREATE_ACCOUNT'}
              </button>
            </div>

            <p className="text-center text-neutral-500 pt-4 font-mono">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-cyber-cyan hover:underline font-bold">
                Log In
              </Link>
            </p>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-neutral-600 hover:text-kintsugi-gold transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
