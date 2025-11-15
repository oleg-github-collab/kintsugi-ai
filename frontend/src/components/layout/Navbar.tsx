'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/Button';
import { formatTokens } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard/chat', label: '💬 AI Chat', icon: '🤖' },
    { href: '/dashboard/messenger', label: '📱 Messenger', icon: '💬' },
    { href: '/dashboard/translation', label: '🌐 Translation', icon: '🌐' },
    { href: '/dashboard/subscription', label: '💳 Subscription', icon: '💳' },
  ];

  return (
    <nav className="border-b-3 border-kintsugi-gold bg-digital-black sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-kintsugi-gold">
              KINTSUGI
            </span>
            <span className="text-sm font-mono text-cyber-pink">AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 font-mono font-bold transition-all ${
                  pathname?.startsWith(item.href)
                    ? 'text-kintsugi-gold border-b-3 border-kintsugi-gold'
                    : 'text-digital-white/60 hover:text-kintsugi-gold'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-mono text-digital-white font-bold">
                    {user.username}
                  </p>
                  <p className="text-xs font-mono text-digital-white/60">
                    {formatTokens(user.tokens_used)} / {user.tokens_limit === -1 ? '∞' : formatTokens(user.tokens_limit)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden flex overflow-x-auto pb-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 px-3 py-2 font-mono text-sm font-bold border-2 transition-all ${
                  pathname?.startsWith(item.href)
                    ? 'border-kintsugi-gold text-kintsugi-gold bg-kintsugi-gold/10'
                    : 'border-digital-white/20 text-digital-white/60'
                }`}
              >
                {item.icon} {item.label.split(' ')[1]}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
