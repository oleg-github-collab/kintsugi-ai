'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

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
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full border-3 border-kintsugi-gold p-8 md:p-12 shadow-neo bg-kintsugi-gold/5 scanlines">
        <h2 className="text-4xl font-bold uppercase text-center text-kintsugi-gold text-neon mb-4">
          [ USER_AUTH:SIGNUP ]
        </h2>

        <div className="w-full h-1 bg-kintsugi-gold/20 mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-kintsugi-gold to-transparent animate-marquee"></div>
        </div>

        {displayError && (
          <div className="mb-6 p-4 border-3 border-neon-orange bg-neon-orange/10">
            <p className="text-sm font-mono text-neon-orange uppercase">⚠ {displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <Input
            label="Username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="user@kintsugi.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full"
              glitch
            >
              {isLoading ? '▶ CREATING_ACCOUNT...' : '▶ CREATE_ACCOUNT'}
            </Button>
          </div>

          <p className="text-center text-neutral-500 pt-4 font-mono">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cyber-cyan hover:underline font-bold">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
