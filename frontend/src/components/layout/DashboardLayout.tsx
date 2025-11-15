'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-digital-black">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-kintsugi-gold animate-pulse mb-4">
            KINTSUGI AI
          </div>
          <p className="text-digital-white/60 font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-digital-black text-digital-white">
      <Navbar />
      <main className="h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};
