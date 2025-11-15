'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TranslationInterface } from '@/components/translation/TranslationInterface';

export default function TranslationPage() {
  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto">
        <TranslationInterface />
      </div>
    </DashboardLayout>
  );
}
