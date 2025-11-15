'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/Button';

export const Navigation = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-digital-black/90 backdrop-blur-md border-b-3 border-kintsugi-gold z-50 scanlines">
      <div className="container mx-auto flex justify-between items-center p-4 px-6 md:px-12">
        <Link href="/" className="text-2xl font-bold uppercase text-rainbow">
          ⟡ KINTSUGI AI ⟡
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/chat"
                className={`nav-link text-lg font-bold uppercase transition-colors ${
                  pathname === '/chat' ? 'text-kintsugi-gold' : 'text-digital-white hover:text-kintsugi-gold'
                }`}
              >
                #CHAT
              </Link>
              <Link
                href="/messenger"
                className={`nav-link text-lg font-bold uppercase transition-colors ${
                  pathname === '/messenger' ? 'text-cyber-cyan' : 'text-digital-white hover:text-cyber-cyan'
                }`}
              >
                #MESSENGER
              </Link>
              <Link
                href="/translation"
                className={`nav-link text-lg font-bold uppercase transition-colors ${
                  pathname === '/translation' ? 'text-cyber-pink' : 'text-digital-white hover:text-cyber-pink'
                }`}
              >
                #TRANSLATION
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-digital-white font-mono text-sm hidden sm:block">
                {user.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                glitch
              >
                LOGOUT
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                LOG_IN
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" glitch>
                SIGN_UP
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
