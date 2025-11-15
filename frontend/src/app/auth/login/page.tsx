'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      router.push('/dashboard/chat');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full border-3 border-cyber-cyan p-8 md:p-12 shadow-neo-cyan bg-cyber-cyan/5 scanlines">
        <h2 className="text-4xl font-bold uppercase text-center text-cyber-cyan text-neon mb-4">
          [ USER_AUTH:LOGIN ]
        </h2>

        <div className="w-full h-1 bg-cyber-cyan/20 mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-marquee"></div>
        </div>

        {error && (
          <div className="mb-6 p-4 border-3 border-neon-orange bg-neon-orange/10">
            <p className="text-sm font-mono text-neon-orange uppercase">⚠ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="user@kintsugi.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="cyan"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="cyan"
          />

          <div className="pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              variant="cyan"
              className="w-full"
              glitch
            >
              {isLoading ? '▶ AUTHENTICATING...' : '▶ AUTHENTICATE'}
            </Button>
          </div>

          <p className="text-center text-neutral-500 pt-4 font-mono">
            No account?{' '}
            <Link href="/auth/register" className="text-kintsugi-gold hover:underline font-bold">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
