'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConversationSidebar } from '@/components/messenger/ConversationSidebar';
import { MessengerInterface } from '@/components/messenger/MessengerInterface';
import { Stories } from '@/components/messenger/Stories';

export default function MessengerPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <Stories />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 flex-shrink-0 hidden md:block">
            <ConversationSidebar />
          </div>
          <div className="flex-1">
            <MessengerInterface />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
