'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
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
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-digital-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-mono font-bold text-kintsugi-gold mb-2">
            KINTSUGI
          </h1>
          <p className="text-xl font-mono text-cyber-pink">AI PLATFORM</p>
        </div>

        <Card variant="default">
          <h2 className="text-2xl font-mono font-bold text-kintsugi-gold mb-6">
            Login
          </h2>

          {error && (
            <div className="mb-4 p-4 border-3 border-neon-orange bg-neon-orange/10">
              <p className="text-sm font-mono text-neon-orange">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-mono text-digital-white/60">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-kintsugi-gold hover:text-cyber-pink transition-colors"
              >
                Register
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-mono text-digital-white/60 hover:text-kintsugi-gold transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
